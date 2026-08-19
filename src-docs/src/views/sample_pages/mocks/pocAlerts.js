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
 * POC alert definitions for the "View in OpenSearch" entry point.
 * Contains full investigation data: steps, root cause, recommendations,
 * memory items — everything needed to render a completed investigation.
 */

export const POC_ALERTS = {
  'checkout-p99': {
    id: 'checkout-p99',
    title: 'Checkout p99 latency',
    threshold: '1.2s',
    p99: '1.42s',
    p99Baseline: '0.61s',
    errorRate: '2.8%',
    errorRateBaseline: '0.4%',
    window: 'last 15 min',
    cluster: 'pay-prod-a',
    services: ['checkout', 'cart', 'payments-auth', 'ledger'],
    provenance: {
      host: 'IDE',
      skill: 'opensearch-observability',
      session: 'POC',
    },

    // ─── Investigation steps (the canvas ticket) ──────────────────────
    steps: [
      {
        id: 'step-1',
        number: 1,
        label: 'Pick up the alert',
        result: 'p99 1.42s vs 1.2s threshold · pay-prod-a',
        duration: '2s',
        card: {
          type: 'alert',
          threshold: '1.2s',
          current: '1.42s',
          baseline: '0.61s',
          startedAgo: '14m ago',
          firstBreach: '14:26 UTC',
          evalInterval: 'every 1m',
          scope: 'checkout / pay-prod-a',
        },
      },
      {
        id: 'step-2',
        number: 2,
        label: 'Correlate checkout logs',
        result: 'connection pool timeout · +184% · 91% of errors',
        duration: '9s',
        card: {
          type: 'logs',
          eventCount: '2,341',
          query: "source = checkout_logs | where message LIKE '%pool timeout%' | stats count() by service, message | sort -count()",
          sampleLines: [
            '14:28:03 WARN  checkout.db — Acquire connection timed out after 5,000ms (pool: orders, active: 20/20, queued: 14)',
            '14:28:04 ERROR checkout.handler — POST /checkout failed: PoolTimeoutException',
            '14:28:04 WARN  checkout.db — Acquire connection timed out after 5,000ms (pool: orders, active: 20/20, queued: 16)',
          ],
          discoverLink: 'Open these logs in Discover',
        },
      },
      {
        id: 'step-3',
        number: 3,
        label: 'Sample a slow trace',
        result: '1.10s of 1.42s in db.getConnection.wait',
        duration: '6s',
        card: {
          type: 'trace',
          traceId: 'abc123def456',
          endpoint: 'POST /checkout',
          totalDuration: '1.42s',
          spans: [
            { name: 'POST /checkout', duration: '1.42s', pct: 100, highlight: false },
            { name: 'checkout.validate', duration: '0.08s', pct: 5.6, highlight: false },
            { name: 'db.getConnection.wait', duration: '1.10s', pct: 77.5, highlight: true },
            { name: 'db.query(INSERT order)', duration: '0.18s', pct: 12.7, highlight: false },
            { name: 'payments.charge', duration: '0.06s', pct: 4.2, highlight: false },
          ],
        },
      },
      {
        id: 'step-4',
        number: 4,
        label: 'Check the pool metric',
        result: '94% utilization · climbing since 14:02 deploy',
        duration: '4s',
        card: {
          type: 'metrics',
          metric: 'Pool utilization',
          current: '94%',
          before: '46%',
          poolSize: 20,
          deployMarker: '14:02',
          sparkline: [46, 47, 48, 52, 61, 73, 82, 88, 91, 93, 94],
        },
      },
    ],
    totalDuration: '21s',

    // ─── Root cause (chat) ────────────────────────────────────────────
    rootCause: 'The 14:02 deploy roughly doubled how long each checkout request holds a database connection (0.6s to 1.3s), so the 20-connection orders-pool no longer covers peak concurrency. Requests queue for a free connection instead of failing, which is why p99 crossed 1.2s while the error rate stayed at 2.8%. Isolated to checkout on pay-prod-a.',
    evidenceChips: [
      { stepId: 'step-1', label: 'Step 1 · 1.42s vs 0.61s baseline' },
      { stepId: 'step-2', label: 'Step 2 · pool timeouts +184%' },
      { stepId: 'step-3', label: 'Step 3 · 1.10s in getConnection.wait' },
      { stepId: 'step-4', label: 'Step 4 · pool at 94% since 14:02' },
    ],

    // ─── Recommendations (chat checkboxes) ────────────────────────────
    recommendations: [
      {
        id: 'rec-pool-increase',
        label: 'Increase orders-pool from 20 to 40 on pay-prod-a (applied by your team, in your deployment)',
        defaultChecked: true,
      },
      {
        id: 'rec-monitor',
        label: 'Create a monitor on pool utilization above 85% for 5 minutes',
        defaultChecked: true,
      },
      {
        id: 'rec-dashboard',
        label: 'Add pool utilization to the checkout golden-signal dashboard',
        defaultChecked: false,
      },
    ],

    // ─── Memory items (chat pill) ─────────────────────────────────────
    memoryItems: [
      'checkout p99 is deploy-sensitive, correlate deploys first',
      'pool exhaustion signature: timeouts + 20/20 in use + queued waiters',
      'healthy pool baseline for pay-prod-a: below 70% utilization',
    ],

    // ─── Tool results after Continue ──────────────────────────────────
    toolResults: {
      'rec-pool-increase': 'pool change written as suggested diff, not applied',
      'rec-monitor': 'created: monitor · orders-pool utilization > 85% for 5m',
      'rec-dashboard': 'created: panel · pool utilization added to checkout golden-signal dashboard',
    },
  },
};

/**
 * Look up an alert by id. Returns null for unknown ids.
 * @param {string} alertId
 * @returns {Object|null}
 */
export function getPocAlert(alertId) {
  if (!alertId || typeof alertId !== 'string') return null;
  return POC_ALERTS[alertId] || null;
}
