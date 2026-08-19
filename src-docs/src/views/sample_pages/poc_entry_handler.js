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
 * POC entry handler v2 — completed investigation on arrival.
 *
 * The customer lands at a FINISHED investigation: canvas shows the 4-step
 * ticket, chat shows the report (memory + root cause + recommendations).
 * Nothing replays, nothing is blank.
 */

import { readQueryParam } from './mocks/capabilities';
import { getPocAlert } from './mocks/pocAlerts';

/** Stable session id derived from alert + provenance for dedup on reload. */
function pocSessionId(alert) {
  return `poc-${alert.id}-${alert.provenance.session}`;
}

/**
 * Determine if the current URL is a POC entry.
 * Handles both #/poc?alert=... and #/sample-pages?entry=poc&alert=...
 * firstrun=1 wins over entry=poc.
 */
export function detectPocEntry() {
  const hash = window.location.hash || '';

  if (readQueryParam('firstrun') === '1') {
    return { isPoc: false, alertId: null };
  }

  if (hash.startsWith('#/poc')) {
    return { isPoc: true, alertId: readQueryParam('alert') || null };
  }

  if (readQueryParam('entry') === 'poc') {
    return { isPoc: true, alertId: readQueryParam('alert') || null };
  }

  return { isPoc: false, alertId: null };
}

/**
 * Build or restore a POC session for the given alert.
 * Returns null if alert is unknown (caller handles fallback).
 *
 * The session arrives COMPLETED: side-by-side, canvas tab open with the
 * investigation ticket, chat showing the report.
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

  const tabId = `tab-poc-${alert.id}`;
  const session = {
    id: sessionId,
    threadKey: 'poc-checkout-p99',
    pendingThread: null,
    tabs: [
      {
        id: tabId,
        pageKey: 'poc-investigation',
        title: 'Checkout P99 Latency Investigation',
        _highlight: true,
        _pocAlertId: alert.id,
      },
    ],
    activeTabId: tabId,
    threadPanelState: 'side-by-side',
    threadPanelWidth: 38,
    createdAt: Date.now(),
    title: alert.title,
    // POC metadata
    pocAlert: alert,
    pocState: 'completed',
  };

  return { session, isExisting: false };
}

export { getPocAlert };

// ─── Telemetry ────────────────────────────────────────────────────────────────

export function pocTelemetry(event, payload = {}) {
  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[poc-telemetry] ${event}`, payload);
  }
}
