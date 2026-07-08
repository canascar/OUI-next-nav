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
 * Mock data for session-based navigation demo flows.
 *
 * Exports:
 * - LATENCY_SPIKE_SESSION: Pre-built session with active latency-spike thread
 * - LATENCY_SPIKE_THREAD_DATA: Full thread conversation with rich attachments
 * - PAGE_FIRST_SESSION: Session starting on LogsPageMock with ThreadPanel minimized
 * - PAGE_FIRST_MOCK_DATA: Mock PPL query and AI proactive insight for page-first flow
 */

// ---------------------------------------------------------------------------
// Mock Flow 1: Latency Spike Investigation — Thread Data
// ---------------------------------------------------------------------------

/**
 * Full thread conversation data for the latency-spike investigation.
 * Includes multiple assistant messages with rich attachments:
 * - link-preview (with viewAction mapped to SOURCE_PAGE_MOCK keys)
 * - chart
 * - code-block
 * - data-table
 * - stats-display
 * Also includes a progress tracker with task steps.
 */
export const LATENCY_SPIKE_THREAD_DATA = {
  threadKey: 'latency-spike',
  title: 'Latency Spike Investigation',
  messages: [
    {
      role: 'user',
      author: 'You',
      content:
        'We are seeing elevated P99 latency on the payment service. Can you investigate?',
    },
    {
      role: 'assistant',
      content:
        'An alert has been triggered: P99 latency on the payment service exceeded 2,000ms for the past 15 minutes. I am starting an investigation.\n\nI pulled the service metrics and correlated them with recent deployment events. Here is what I am seeing:',
      attachments: [
        {
          type: 'link-preview',
          key: 'alerts',
          title: 'Alert: P95 Latency > 2s',
          description:
            'Triggered at 14:32 UTC. P99 latency crossed the 2,000ms threshold on 3 of 4 pods. No recent deploys in the last 6 hours.',
          viewAction: true,
        },
        {
          type: 'chart',
          chartType: 'line',
          title: 'Metric: payment-service P99 latency',
          threshold: 2000,
          breachRange: { x0: 4, x1: 6, y0: 2000 },
          data: [
            { x: 0, y: 120 },
            { x: 1, y: 135 },
            { x: 2, y: 180 },
            { x: 3, y: 420 },
            { x: 4, y: 1100 },
            { x: 5, y: 2050 },
            { x: 6, y: 2340 },
          ],
        },
        {
          type: 'stats-display',
          title: 'Current Metrics',
          stats: [
            { label: 'P99 Latency', value: '2,340ms', color: 'danger' },
            { label: 'Error Rate', value: '0.2%', color: 'success' },
            { label: 'Throughput', value: '1,240 req/s', color: 'default' },
            { label: 'Pool Utilization', value: '98%', color: 'danger' },
          ],
        },
      ],
    },
    {
      role: 'assistant',
      content:
        'I analyzed the last 30 minutes of payment service logs. Here are the results:',
      attachments: [
        {
          type: 'code-block',
          title: 'Query',
          language: 'ppl',
          code:
            "source = payment_service_logs | where level = 'WARN' OR message LIKE '%timeout%' | stats count() by message | sort -count()",
        },
        {
          type: 'data-table',
          title: 'Top Slow Endpoints',
          columns: ['Endpoint', 'P99 Latency', 'Requests', 'Error Rate'],
          rows: [
            ['/api/v1/checkout', '2,340ms', '12,480', '0.3%'],
            ['/api/v1/payment/process', '1,890ms', '8,920', '0.1%'],
            ['/api/v1/inventory/reserve', '1,420ms', '6,340', '0.0%'],
            ['/api/v1/payment/confirm', '980ms', '4,210', '0.0%'],
          ],
        },
        {
          type: 'link-preview',
          key: 'logs',
          title: 'Payment Service Logs — Last 30 Minutes',
          description:
            'Filtered log results showing 847 slow-log entries with "connection acquire timeout" as the primary bottleneck.',
          viewAction: true,
        },
      ],
    },
    {
      role: 'assistant',
      content:
        'Based on the timing and pattern, I have two hypotheses:\n\n**Hypothesis 1: Downstream dependency bottleneck**\n\nThe latency spike correlates with elevated connection wait times to the inventory service.\n\n**Hypothesis 2: Connection pool exhaustion**\n\nThe payment service outbound connection pool is at 98% utilization. Requests are queuing rather than failing fast, which inflates P99 without raising error rates.',
      attachments: [
        {
          type: 'link-preview',
          key: 'notebooks',
          title: 'Inventory service dependency analysis',
          description:
            'Trace waterfall showing acquire_connection bottleneck averaging 1,840ms across sampled requests.',
          viewAction: true,
        },
      ],
    },
    {
      role: 'assistant',
      content:
        'Here are the recommended next steps to confirm and mitigate:\n\n1. Increase the pool max from 50 to 150 to relieve backpressure.\n2. Enable circuit breaker on the payment→inventory call path.\n3. Set up a monitoring dashboard for ongoing visibility.',
      attachments: [
        {
          type: 'code-block',
          title: 'Remediation Script',
          language: 'bash',
          code: `#!/bin/bash
# Patch payment-service connection pool and restart

kubectl patch configmap payment-service-config \\
  -n production \\
  --type merge \\
  -p '{"data":{"POOL_MAX_CONNECTIONS":"150","POOL_ACQUIRE_TIMEOUT":"5s"}}'

kubectl rollout restart deployment/payment-service -n production
kubectl rollout status deployment/payment-service -n production --timeout=120s

echo "Done. Monitoring P99 latency for recovery..."`,
        },
        {
          type: 'link-preview',
          key: 'notebooks',
          title: 'Payment service connection pool metrics',
          description:
            'Live dashboard with pool utilization, acquire wait time, active connections, and P99 latency for the payment service.',
          viewAction: true,
        },
      ],
    },
  ],
  progressTracker: {
    steps: [
      { label: 'Collect service metrics', status: 'completed' },
      { label: 'Analyze log patterns', status: 'completed' },
      { label: 'Correlate with traces', status: 'completed' },
      { label: 'Identify root cause', status: 'in-progress' },
      { label: 'Generate remediation plan', status: 'pending' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Mock Flow 1: Latency Spike Investigation — Session Object
// ---------------------------------------------------------------------------

/**
 * Pre-built session with the latency-spike thread already active.
 * ThreadPanel is in side-by-side state with the Alerts page open as a tab.
 */
export const LATENCY_SPIKE_SESSION = {
  id: 'latency-spike-session',
  threadKey: 'latency-spike',
  pendingThread: null,
  title: 'Latency Spike Investigation',
  summary:
    'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
  threadPanelState: 'side-by-side',
  threadPanelWidth: 30,
  tabs: [
    { id: 'tab-alerts-1', pageKey: 'alerts', title: 'Alert: P95 Latency > 2s' },
    {
      id: 'tab-app-map-1',
      pageKey: 'notebooks',
      title: 'Inventory service dependency analysis',
    },
    {
      id: 'tab-metrics-1',
      pageKey: 'notebooks',
      title: 'Payment service connection pool metrics',
    },
  ],
  activeTabId: 'tab-alerts-1',
  createdAt: Date.now() - 3600000, // 1 hour ago
};

// ---------------------------------------------------------------------------
// Mock Flow 3: Error Rate Spike — Thread Data
// ---------------------------------------------------------------------------

/**
 * Thread conversation for an error rate spike on the checkout service.
 */
export const ERROR_RATE_SPIKE_THREAD_DATA = {
  threadKey: 'error-rate-spike',
  title: 'Error Rate Spike — Checkout Service',
  messages: [
    {
      role: 'assistant',
      content:
        'The checkout service error rate climbed from 0.3% to 12.4% starting at 09:15 UTC. 94% of failures are 503s from the auth-service dependency. Root cause: auth-service v2.5.0 deployed at 09:12 introduced a synchronous OIDC token validation call that is timing out against the external provider.\n\nThe auth-service has been rolled back to v2.4.1 and error rates are recovering. Sharing this summary with the team for visibility.',
      attachments: [
        {
          type: 'link-preview',
          key: 'alerts',
          title: 'Alert: Checkout error rate > 10%',
          description:
            'Triggered at 09:18 UTC. 503 errors from auth-service dependency accounting for 94% of failures.',
          viewAction: true,
        },
        {
          type: 'link-preview',
          key: 'dashboards',
          title: 'Checkout service health dashboard',
          description:
            'Real-time error rate, latency, and throughput for the checkout service and its dependencies.',
          viewAction: true,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Mock Flow 3: Error Rate Spike — Session Object
// ---------------------------------------------------------------------------

/**
 * Pre-built session for the error rate spike investigation.
 * Has one tab open (dashboard) and the thread in side-by-side.
 */
export const ERROR_RATE_SPIKE_SESSION = {
  id: 'error-rate-spike-session',
  threadKey: 'error-rate-spike',
  pendingThread: null,
  title: 'Error Rate Spike — Checkout Service',
  summary:
    'Checkout error rate jumped to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
  threadPanelState: 'side-by-side',
  threadPanelWidth: 30,
  tabs: [
    {
      id: 'tab-alert-err-1',
      pageKey: 'alerts',
      title: 'Alert: Checkout error rate > 10%',
    },
    {
      id: 'tab-dash-err-1',
      pageKey: 'dashboards',
      title: 'Checkout service health dashboard',
    },
  ],
  activeTabId: 'tab-alert-err-1',
  createdAt: Date.now() - 7200000, // 2 hours ago
  hidden: true,
};

/**
 * DNS Resolution Timeout — Warning-level session.
 * Flagged 3 hours ago, monitoring for recurrence.
 */
export const DNS_TIMEOUT_SESSION = {
  id: 'dns-timeout-session',
  threadKey: 'connection-timeout',
  pendingThread: null,
  title: 'DNS Resolution Timeout',
  summary:
    'DNS resolution timeout flagged 3 hours ago. Intermittent failures on external lookups — monitoring for recurrence.',
  threadPanelState: 'side-by-side',
  threadPanelWidth: 30,
  tabs: [{ id: 'tab-logs-dns-1', pageKey: 'logs', title: 'DNS timeout logs' }],
  activeTabId: 'tab-logs-dns-1',
  createdAt: Date.now() - 10800000, // 3 hours ago
  hidden: true,
};

// ---------------------------------------------------------------------------
// V7 Home Overview — Pre-loaded session with Overview tab + greeting in chat
// ---------------------------------------------------------------------------

export const OVERVIEW_HOME_SESSION = {
  id: 'overview-home-session',
  threadKey: 'overview-home',
  pendingThread: null,
  // Landing screen, not a started session — excluded from the sessions list
  // until the user begins a chat (see home-chat-started).
  isHome: true,
  title: 'Home',
  summary:
    'Active incident — checkout-agent is looping. Immediate action needed.',
  threadPanelState: 'side-by-side',
  threadPanelWidth: 60,
  tabs: [
    { id: 'tab-overview-home', pageKey: 'overview-home', title: 'Overview' },
  ],
  activeTabId: 'tab-overview-home',
  createdAt: Date.now(),
};

// ---------------------------------------------------------------------------
// Mock Flow 2: Page-First Flow — Session Object
// ---------------------------------------------------------------------------

/**
 * Session starting on LogsPageMock with ThreadPanel minimized.
 * Represents the page-first flow where the user starts on a page,
 * executes a query, and receives a proactive AI insight.
 */
export const PAGE_FIRST_SESSION = {
  id: 'page-first-session',
  threadKey: null,
  pendingThread: null,
  title: 'Log Analysis',
  threadPanelState: 'minimized',
  threadPanelWidth: 50,
  tabs: [{ id: 'tab-logs-1', pageKey: 'logs', title: 'Logs' }],
  activeTabId: 'tab-logs-1',
  createdAt: Date.now() - 1800000, // 30 minutes ago
};

// ---------------------------------------------------------------------------
// Mock Flow 2: Page-First Flow — Mock Data
// ---------------------------------------------------------------------------

/**
 * Mock data for the page-first flow including:
 * - PPL query the user executes on the Logs page
 * - AI proactive insight response triggered after query execution
 */
export const PAGE_FIRST_MOCK_DATA = {
  pplQuery: 'source = logs | where status >= 500 | stats count() by service',
  queryResults: {
    columns: ['service', 'count()'],
    rows: [
      ['payment-service', '847'],
      ['checkout-api', '312'],
      ['inventory-service', '156'],
      ['auth-service', '42'],
    ],
  },
  proactiveInsight:
    'I see 847 connection timeout errors to payments-db starting at 14:30. Want me to check the trace data for this dependency?',
};
