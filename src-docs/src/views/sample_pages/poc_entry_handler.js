/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/**
 * POC entry handler — resolves the #/poc?alert=<alertId> or
 * #/sample-pages?entry=poc&alert=<alertId> route into a session state
 * suitable for SessionPagesView.
 *
 * Responsibilities:
 * - Parse entry + alertId from query params
 * - Resolve alert from pocAlerts mock registry
 * - Build or restore the POC session (keyed by alertId + provenance.session)
 * - Provide the arrival message, prompt chip, and provenance metadata
 * - Handle unknown alertId gracefully (returns null → caller shows fallback)
 */

import { readQueryParam } from './mocks/capabilities';
import { getPocAlert } from './mocks/pocAlerts';

/** Stable session id derived from alert + provenance for dedup on reload. */
function pocSessionId(alert) {
  return `poc-${alert.id}-${alert.provenance.session}`;
}

/**
 * Determine if the current URL is a POC entry. Returns the alertId or null.
 * Handles both:
 *   #/poc?alert=checkout-p99
 *   #/sample-pages?entry=poc&alert=checkout-p99
 *
 * @returns {{ isPoc: boolean, alertId: string|null }}
 */
export function detectPocEntry() {
  const hash = window.location.hash || '';

  // Check for firstrun=1 — it wins over entry=poc per spec
  if (readQueryParam('firstrun') === '1') {
    return { isPoc: false, alertId: null };
  }

  // #/poc?alert=...
  if (hash.startsWith('#/poc')) {
    const alertId = readQueryParam('alert');
    return { isPoc: true, alertId: alertId || null };
  }

  // #/sample-pages?entry=poc&alert=...
  const entry = readQueryParam('entry');
  if (entry === 'poc') {
    const alertId = readQueryParam('alert');
    return { isPoc: true, alertId: alertId || null };
  }

  return { isPoc: false, alertId: null };
}

/**
 * Build the POC arrival message for a given alert.
 * @param {import('./mocks/pocAlerts').PocAlert} alert
 * @returns {Object} Message object for the chat thread
 */
function buildArrivalMessage(alert) {
  return {
    role: 'assistant',
    content: `I see the ${alert.title} alert from your POC. p99 is ${alert.p99} against a ${alert.p99Baseline} baseline, error rate ${alert.errorRate}%. Want me to investigate?`,
    provenance: {
      label: `From your ${alert.provenance.host} · ${alert.provenance.skill} skill`,
      host: alert.provenance.host,
      skill: alert.provenance.skill,
    },
    promptChips: [
      { label: 'Investigate checkout latency', action: 'investigate' },
    ],
  };
}

/**
 * Build or restore a POC session for the given alert.
 * Returns null if alert is unknown (caller handles fallback).
 *
 * @param {string|null} alertId
 * @param {Array} existingSessions - Current session list for dedup check
 * @returns {{ session: Object, isExisting: boolean }|null}
 */
export function buildPocSession(alertId, existingSessions = []) {
  const alert = getPocAlert(alertId);
  if (!alert) return null;

  const sessionId = pocSessionId(alert);

  // Restore if already exists (reload scenario)
  const existing = existingSessions.find((s) => s.id === sessionId);
  if (existing) {
    return { session: existing, isExisting: true };
  }

  // Create new POC session — land directly in the investigation
  const tabId = `tab-poc-${alert.id}`;
  const session = {
    id: sessionId,
    threadKey: 'poc-checkout-p99',
    pendingThread: null,
    tabs: [
      {
        id: tabId,
        pageKey: alert.sourcePageId || 'alerts',
        title: alert.title,
        _highlight: true,
      },
    ],
    activeTabId: tabId,
    threadPanelState: 'side-by-side',
    threadPanelWidth: 34,
    createdAt: Date.now(),
    title: alert.title,
    // POC-specific metadata
    pocAlert: alert,
    pocArrivalMessage: buildArrivalMessage(alert),
    pocState: 'investigating',
  };

  return { session, isExisting: false };
}

/**
 * Get the alert data for a given alertId (convenience re-export).
 * @param {string} alertId
 * @returns {import('./mocks/pocAlerts').PocAlert|null}
 */
export { getPocAlert };

// ---------------------------------------------------------------------------
// Telemetry (no-op logger — spec says use existing helper or no-op)
// ---------------------------------------------------------------------------

/**
 * No-op telemetry logger. Logs to console in dev only.
 * @param {string} event
 * @param {Object} [payload]
 */
export function pocTelemetry(event, payload = {}) {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[poc-telemetry] ${event}`, payload);
  }
}
