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
import {
  FRONTEND_P95_REPORT_PAGE_KEY,
  FRONTEND_P95_REPORT_TAB_TITLE,
  FRONTEND_P95_REPORT_LINK_KEY,
  FRONTEND_P95_THREAD_KEY,
  getFrontendP95Incident,
  getFrontendP95State,
} from './mocks/frontendP95';

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
  // Second arrival: an incident the agent already closed. Handled first and
  // returned early so the checkout-p99 path below is untouched.
  const frontendP95 = buildFrontendP95Session(alertId, existingSessions);
  if (frontendP95) return frontendP95;

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

/**
 * Build or restore the `frontend-p95` arrival: an incident the agent detected,
 * investigated, and CLOSED on its own. The SRE lands on the finished thread in
 * side-by-side chat; the investigation report opens on demand from the chat
 * link, not on arrival.
 *
 * Both the session id and the report tab id are deterministic, and the report
 * tab is only seeded when a previous visit left it open — so reload and repeat
 * deep-link visits restore the same state instead of stacking duplicates.
 *
 * @param {string} alertId
 * @param {Array} [existingSessions]
 * @returns {{ session: Object, isExisting: boolean }|null} null when this is
 *   not the frontend-p95 arrival, so callers fall through.
 */
export function buildFrontendP95Session(alertId, existingSessions = []) {
  const incident = getFrontendP95Incident(alertId);
  if (!incident) return null;

  const sessionId = pocSessionId(incident);

  const existing = existingSessions.find((s) => s.id === sessionId);
  if (existing) {
    return { session: existing, isExisting: true };
  }

  const persisted = getFrontendP95State();

  // Deterministic id: re-arrival can never produce a second report tab.
  const reportTab = {
    id: `tab-poc-${incident.id}-report`,
    pageKey: FRONTEND_P95_REPORT_PAGE_KEY,
    title: FRONTEND_P95_REPORT_TAB_TITLE,
    sourceAttachment: FRONTEND_P95_REPORT_LINK_KEY,
    _highlight: true,
  };
  const restoreReportTab = persisted.reportTabOpen === true;

  const session = {
    id: sessionId,
    threadKey: FRONTEND_P95_THREAD_KEY,
    pendingThread: null,
    tabs: restoreReportTab ? [reportTab] : [],
    activeTabId: restoreReportTab ? reportTab.id : null,
    threadPanelState: 'side-by-side',
    threadPanelWidth: 38,
    createdAt: Date.now(),
    title: incident.sessionTitle,
    // POC metadata. `pocIncident` is intentionally NOT `pocAlert` — that field
    // feeds the checkout-p99 investigation page via window.__pocAlert.
    pocIncident: incident,
    pocState: 'closed',
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
