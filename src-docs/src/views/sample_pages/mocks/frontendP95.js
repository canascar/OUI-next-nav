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
 * Second POC arrival: `frontend-p95`.
 *
 * Deep-linked from an external Slack prototype via
 * `#/sample-pages?entry=poc&alert=frontend-p95`. Unlike `checkout-p99` — which
 * arrives on a completed investigation the SRE still has to act on — this
 * incident was detected, investigated, AND closed by the agent on its own. The
 * viewer is here to REVIEW that work, so the thread is pre-seeded and renders
 * instantly (no typing, no playback), and the only pending decision is whether
 * to roll the remediation back.
 *
 * Same mocks/ pattern as the latency-spike flow: data only, no network calls.
 * Engineering can swap this module for a real incident API — consumers depend
 * only on the exported helpers.
 *
 * NOTE: authored as `.js` (not `.ts`) to match every other module in this
 * directory; src-docs is not type-checked.
 */

// ─── Identity / keys ─────────────────────────────────────────────────────────

/** Value of the `alert` query param that selects this arrival. */
export const FRONTEND_P95_ALERT_ID = 'frontend-p95';

/** THREADS key in thread_page.js for the pre-seeded review thread. */
export const FRONTEND_P95_THREAD_KEY = 'poc-frontend-p95';

/** SOURCE_PAGE_MOCK key for the read-only investigation report page. */
export const FRONTEND_P95_REPORT_PAGE_KEY = 'poc-frontend-p95-report';

/** Canvas tab title for the report. */
export const FRONTEND_P95_REPORT_TAB_TITLE = 'Investigation · frontend-p95';

/**
 * Stable identity for the "Investigation report" chat link. Stamped onto the
 * canvas tab as `sourceAttachment` so the chat card can show a linked
 * indicator, and so activating the tab can scroll back to this message.
 */
export const FRONTEND_P95_REPORT_LINK_KEY = 'frontend-p95-report';

/** Id of the pending rollback gate inside the thread. */
export const FRONTEND_P95_GATE_ID = 'frontend-p95-rollback';

// ─── Incident record ─────────────────────────────────────────────────────────

export const FRONTEND_P95_INCIDENT = {
  id: FRONTEND_P95_ALERT_ID,
  title: 'frontend p95 latency',
  sessionTitle: 'Incident · frontend p95 latency',
  date: 'Tue Aug 25',
  status: 'CLOSED',
  resolution: 'resolved autonomously',
  rollback: 'rollback available',
  provenance: {
    host: 'Slack',
    skill: 'opensearch-observability',
    session: 'POC',
  },

  // ─── Detection ─────────────────────────────────────────────────────────
  detection: {
    at: '9:14 AM',
    p95: '3200ms',
    p95Before: '120ms',
    baseline: '120ms',
    blastRadius: 'frontend, all clusters',
    unaffected: 'checkout + cart normal',
    deploys: 'no deploys in the window',
  },

  // ─── Root cause ────────────────────────────────────────────────────────
  rootCause: {
    flag: 'recommendationServiceCacheFailure',
    toggledAt: '9:10 AM',
    lead: '4 minutes before the spike',
    actor: 'config-service sync job',
    summary:
      'Feature flag recommendationServiceCacheFailure was toggled at 9:10 AM — 4 minutes before the spike — by the config-service sync job.',
    impact: 'p95 120ms → 3200ms against a 120ms baseline',
    scope: 'frontend · all clusters · checkout + cart normal · no deploys',
  },

  // ─── Evidence: the four investigation steps ────────────────────────────
  steps: [
    {
      id: 'step-1',
      number: 1,
      at: '9:14',
      label: 'Metric sentinel',
      result: 'flagged the p95 spike against the 7-day baseline',
    },
    {
      id: 'step-2',
      number: 2,
      at: '9:17',
      label: 'Topology traversal',
      result:
        'Frontend → CheckoutService → RecommendationService · 98% of request time waiting on the gRPC call',
    },
    {
      id: 'step-3',
      number: 3,
      at: '9:21',
      label: 'Trace deep-dive',
      result:
        'RecommendationService span pinned at 3000ms · DEADLINE_EXCEEDED · cache-miss storm behind it',
    },
    {
      id: 'step-4',
      number: 4,
      at: '9:23',
      label: 'Environment correlation',
      result:
        'flag-state log shows the recommendationServiceCacheFailure toggle 4 min before the spike',
    },
  ],

  // ─── Action taken ──────────────────────────────────────────────────────
  action: {
    at: '9:26 AM',
    what: 'reverted the flag',
    recoveredTo: '138ms',
    recoveredAt: '9:29 AM',
    monitor: 'flag change × p95 correlation',
    playbookFrom: 'checkout-p99, Aug 11',
  },

  // ─── Report section (b): RCA timeline ──────────────────────────────────
  timeline: [
    '09:10  flag recommendationServiceCacheFailure toggled — config-service sync job',
    '09:14  frontend p95 breaches baseline — 120ms → 3200ms',
    '09:14  step 1 · metric sentinel — spike flagged against the 7-day baseline',
    '09:17  step 2 · topology traversal — Frontend → CheckoutService → RecommendationService, 98% of request time on the gRPC call',
    '09:21  step 3 · trace deep-dive — RecommendationService span 3000ms, DEADLINE_EXCEEDED, cache-miss storm behind it',
    '09:23  step 4 · environment correlation — flag-state log shows the toggle 4 min before the spike',
    '09:26  flag reverted — smallest reversible change',
    '09:29  frontend p95 recovered — 138ms',
    '09:29  monitor created — flag change × p95 correlation',
  ],

  // ─── Report section (c): p95 metric, last 30 min ───────────────────────
  chart: {
    metric: 'frontend p95 latency',
    window: 'last 30 min',
    baseline: 120,
    peak: 3200,
    recovered: 138,
    axisMax: 3400,
    startLabel: '09:05',
    endLabel: '09:35',
    /** Marker index into `series` where the flag was reverted (09:26). */
    revertIndex: 21,
    revertLabel: '09:26 revert',
    /** Marker index where p95 was back under baseline (09:29). */
    recoveryIndex: 24,
    recoveryLabel: '09:29 · 138ms',
    /** One point per minute, 09:05 → 09:35. */
    series: [
      120,
      118,
      122,
      119,
      121,
      120,
      123,
      119,
      124,
      1850,
      3050,
      3200,
      3180,
      3210,
      3195,
      3200,
      3188,
      3205,
      3196,
      3200,
      3190,
      3120,
      1420,
      460,
      138,
      134,
      140,
      136,
      132,
      138,
      135,
    ],
  },

  // ─── Report section (d): trace evidence ────────────────────────────────
  spans: [
    { name: 'frontend.render', duration: '3210ms', pct: 100, highlight: false },
    {
      name: 'checkout.getRecs',
      duration: '3202ms',
      pct: 99.8,
      highlight: false,
    },
    {
      name: 'recommendation.rpc',
      duration: '3000ms',
      pct: 93.5,
      highlight: true,
      status: 'DEADLINE_EXCEEDED',
    },
  ],

  // ─── Report section (e): log evidence ──────────────────────────────────
  logs: [
    '09:14:02 WARN   recommendation.cache — rec-cache disabled by flag, falling through to origin',
    '09:14:06 ERROR  recommendation.cache — cache miss storm — fetching per-item from db',
  ],

  // ─── Report section (f): playbook provenance ───────────────────────────
  playbook: {
    learnedFrom: 'checkout-p99',
    learnedOn: 'Aug 11',
    ledBy: 'Devika',
    lead: 'human-led',
    principles: [
      'verify evidence first',
      'smallest reversible change',
      'add a monitor',
    ],
  },

  // ─── Report section (g): follow-up (reference only, not a link) ─────────
  followUp: {
    reference: 'PR #482',
    branch: 'fix/rec-cache-graceful-fallback',
    description: 'bounded serve-stale fallback',
  },
};

/**
 * Look up the incident by alert id. Returns null for anything else so callers
 * can fall back to existing behavior.
 *
 * @param {string} alertId
 * @returns {Object|null}
 */
export function getFrontendP95Incident(alertId) {
  if (alertId !== FRONTEND_P95_ALERT_ID) return null;
  return FRONTEND_P95_INCIDENT;
}

// ─── Pre-seeded thread ───────────────────────────────────────────────────────

const SUMMARY_CONTENT = [
  '## Incident · frontend p95 latency',
  '',
  'Detected, investigated, and closed autonomously on Tue Aug 25.',
  '',
  '**Detected 9:14 AM**',
  '',
  '- frontend p95 went 120ms → 3200ms against a 120ms baseline.',
  '- Blast radius: frontend, all clusters. checkout and cart stayed normal.',
  '- No deploys in the window.',
  '',
  '**Root cause**',
  '',
  '- Feature flag **recommendationServiceCacheFailure** was toggled at 9:10 AM — 4 minutes before the spike — by the config-service sync job.',
  '',
  '**Evidence · 4 steps**',
  '',
  '1. Metric sentinel flagged the spike against the 7-day baseline.',
  '2. Topology traversal: Frontend → CheckoutService → RecommendationService, with 98% of request time waiting on the gRPC call.',
  '3. Trace deep-dive: the RecommendationService span pinned at 3000ms, DEADLINE_EXCEEDED, a cache-miss storm behind it.',
  '4. Environment correlation: the flag-state log shows the toggle 4 minutes before the spike.',
  '',
  '**Action taken 9:26 AM**',
  '',
  '- Reverted the flag, using the playbook learned from checkout-p99 on Aug 11.',
  '- p95 recovered to 138ms.',
  '- Monitor created on flag change × p95 correlation.',
  '- Incident CLOSED. Rollback available.',
].join('\n');

/**
 * The rollback gate, rendered as a `role: 'approvalGate'` message. Nothing
 * auto-executes: the agent is asking, and the record it leaves behind after
 * either answer is one line.
 */
/** Assistant confirmation appended after the gate is approved (mock only). */
export const FRONTEND_P95_ROLLBACK_CONFIRMATION = {
  role: 'assistant',
  id: `${FRONTEND_P95_GATE_ID}-confirmation`,
  hideFeedback: true,
  content: [
    '**Rolled back**',
    '',
    '- recommendationServiceCacheFailure is set back to its pre-incident state.',
    '- The investigation is reopened and the incident is no longer CLOSED.',
    '- The flag change × p95 monitor stays in place.',
  ].join('\n'),
};

/**
 * The one decision left for the reviewer. The agent already acted, so this is
 * not an approve/reject of a proposal — it is two real options: leave the
 * remediation in place, or undo it. Neither runs until it is chosen.
 *
 * Each option declares the `status` it records, the one-line `record` the gate
 * collapses to, and optionally a `confirmation` message to append.
 */
export const FRONTEND_P95_ROLLBACK_GATE = {
  role: 'approvalGate',
  id: FRONTEND_P95_GATE_ID,
  title: 'What to do next',
  detail: 'choose one — nothing runs until you do',
  pendingNote: 'Pending your approval',
  options: [
    {
      id: 'keep',
      label: 'Keep the fix',
      detail: 'Leave the flag reverted. The incident stays closed.',
      icon: 'check',
      status: 'kept',
      record: 'Fix kept · flag stays reverted, incident stays closed',
    },
    {
      id: 'rollback',
      label: 'Roll back',
      detail:
        'Restore recommendationServiceCacheFailure and reopen the investigation.',
      icon: 'editorUndo',
      status: 'rolled back',
      record:
        'Rolled back · recommendationServiceCacheFailure restored, investigation reopened',
      // Mock only — the agent executes nothing here.
      confirmation: FRONTEND_P95_ROLLBACK_CONFIRMATION,
    },
  ],
  status: 'pending',
};

/**
 * @param {string} status
 * @returns {Object|undefined} The gate option that records `status`.
 */
function findGateOption(status) {
  return FRONTEND_P95_ROLLBACK_GATE.options.find((o) => o.status === status);
}

/**
 * Build the pre-seeded review thread. Every message renders on the first commit
 * — no `staggered`, no `streaming`, no `delayBefore`, no `_enter` — so arrival
 * shows the finished conversation with zero typing or playback.
 *
 * @param {Object} [state] Persisted arrival state (see getFrontendP95State).
 * @returns {Array} Messages for the THREADS entry.
 */
export function buildFrontendP95Messages(state) {
  const gateStatus = (state && state.gateStatus) || 'pending';

  const messages = [
    {
      role: 'user',
      id: 'frontend-p95-prompt',
      author: 'You',
      content: 'Show me the incident that the agent resolved.',
    },
    {
      role: 'assistant',
      id: 'frontend-p95-summary',
      content: SUMMARY_CONTENT,
      // The artifact handle. Rendered immediately above the thumbs row and
      // wired through the same link-preview → openCanvasPage path the
      // latency-spike flow uses.
      reportLink: {
        type: 'link-preview',
        linkKey: FRONTEND_P95_REPORT_LINK_KEY,
        key: FRONTEND_P95_REPORT_PAGE_KEY,
        pageTitle: FRONTEND_P95_REPORT_TAB_TITLE,
        title: 'Investigation report',
        description:
          'RCA timeline, p95 metric, trace and log evidence, playbook provenance, and follow-up.',
      },
    },
    { ...FRONTEND_P95_ROLLBACK_GATE, status: gateStatus },
  ];

  // Restore the chosen option's follow-up message, if it had one.
  const chosen = findGateOption(gateStatus);
  if (chosen && chosen.confirmation) {
    messages.push(chosen.confirmation);
  }

  return messages;
}

// ─── Persisted arrival state ─────────────────────────────────────────────────
//
// Chat messages live in ThreadPage state and are rebuilt from the THREADS
// registry on every mount, so the gate answer and the open report tab are
// persisted here instead. Same localStorage discipline as mocks/history.js:
// every read is defensive and resolves to the default on corrupt data.

const STATE_KEY = 'osd.poc.frontendP95.v1';

// The report is the artifact the reviewer came for, so it is open on arrival.
// Closing it persists that choice, and a later visit honours it.
const DEFAULT_STATE = { gateStatus: 'pending', reportTabOpen: true };

const VALID_GATE_STATUSES = ['pending', 'kept', 'rolled back'];

/**
 * @returns {{ gateStatus: string, reportTabOpen: boolean }}
 */
export function getFrontendP95State() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw == null) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_STATE };
    return {
      gateStatus: VALID_GATE_STATUSES.includes(parsed.gateStatus)
        ? parsed.gateStatus
        : DEFAULT_STATE.gateStatus,
      reportTabOpen: parsed.reportTabOpen === true,
    };
  } catch (e) {
    // Corrupt or unavailable storage — fall back to a fresh arrival.
    return { ...DEFAULT_STATE };
  }
}

/**
 * @param {Partial<{ gateStatus: string, reportTabOpen: boolean }>} updates
 * @returns {{ gateStatus: string, reportTabOpen: boolean }} The merged state.
 */
export function setFrontendP95State(updates) {
  const next = { ...getFrontendP95State(), ...updates };
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(next));
  } catch (e) {
    // Silently fail — storage may be unavailable or full.
  }
  return next;
}

/** Test/dev helper: return this arrival to its fresh state. */
export function clearFrontendP95State() {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch (e) {
    // Silently fail
  }
}
