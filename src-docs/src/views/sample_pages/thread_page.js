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

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';

import {
  OuiButton,
  OuiButtonIcon,
  OuiCodeBlock,
  OuiContextMenuPanel,
  OuiContextMenuItem,
  OuiContextMenu,
  OuiFlyoutHeader,
  OuiFlyoutBody,
  OuiFlexGroup,
  OuiFlexItem,
  OuiIcon,
  OuiLoadingSpinner,
  OuiPopover,
  OuiSmallButtonEmpty,
  OuiStat,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
  OuiToolTip,
  OuiCompressedTextArea,
  OuiThreadScrollButton,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';
import { ProgressTracker } from './progress_tracker';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { ThemeContext } from '../../components/with_theme';
import { OllyIdle } from './olly_idle';
import {
  EmptySessionPageV6,
  SCENARIOS,
  ScenarioFindingCard,
} from './empty_session_page_v6';
import {
  McpAppAttachment,
  McpEvidenceLinks,
  McpRecommendationCard,
  McpAlertRuleOffer,
  McpMemoryCard,
  McpCaveatLine,
  McpHomeGreeting,
  MCP_INVESTIGATION_MESSAGES,
  MCP_CAVEAT,
  MCP_P99_FINDING,
} from './mcp_investigation';
import { PocChatReport } from './poc_chat_report';
import {
  McpTokenAppAttachment,
  TOKEN_INVESTIGATION_MESSAGES,
  TOKEN_CONTEXT,
  TOKEN_SPIKE_FINDING,
} from './mcp_token_investigation';
import {
  Chart,
  Settings,
  Axis,
  LineSeries,
  LineAnnotation,
  AnnotationDomainType,
  ScaleType,
  RectAnnotation,
} from '@elastic/charts';
import {
  AlertPageMock,
  InventoryAnalysisPageMock,
  ConnectionPoolPageMock,
  LogsPageMock,
  DashboardPageMock,
  TraceAnalysisPageMock,
} from './mock_canvas_pages';

// Map source page keys to existing canvas mock components
const SOURCE_PAGE_MOCK = {
  logs: { component: LogsPageMock, title: 'Logs' },
  alerts: { component: AlertPageMock, title: 'Alerts' },
  'alerts-detail': { component: AlertPageMock, title: 'Alerts Detail' },
  dashboards: { component: DashboardPageMock, title: 'Dashboards' },
  notebooks: { component: InventoryAnalysisPageMock, title: 'Notebooks' },
  metrics: { component: ConnectionPoolPageMock, title: 'Metrics' },
  discover: { component: LogsPageMock, title: 'Discover' },
};

// The home greeting (EmptySessionPageV6) shows a randomly-chosen scenario. The
// chat session's first message is built from the *same* scenario so its content
// — greeting, summary, and expandable findings — matches what the user just saw.
const buildScenarioMessage = (scenarioId) => {
  const sc = SCENARIOS[scenarioId] || SCENARIOS[1];
  const summary = sc.summary
    .replace(/<strong>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<[^>]+>/g, '');
  return {
    role: 'assistant',
    content: `## ${sc.greeting}\n\n${summary}`,
    scenario: scenarioId,
    findings: sc.findings,
  };
};

const THREADS = {
  'overview-home': {
    title: 'Morning briefing',
    staggered: true,
    messages: [],
    // Overridden at runtime with the scenario shown on the home greeting.
    staggeredMessages: [buildScenarioMessage(1)],
  },
  'checkout-p99': {
    title: 'p99 latency > 1.5s on checkout (prod-web)',
    // Starts on the MCP home greeting; the Warning pill stages the beats.
    messages: [],
  },
  'agent-token-spike': {
    title: 'Agent token usage spiked — support-triage',
    // Opened from the home findings row; the beats auto-play on arrival.
    contextStrip: TOKEN_CONTEXT,
    messages: [],
  },
  'poc-checkout-p99': {
    title: 'Checkout p99 latency',
    // POC v2: completed investigation rendered by PocChatReport.
    // Alert data injected at runtime via window.__pocAlert.
    pocEntry: true,
    messages: [],
  },
  'latency-spike': {
    title: 'Latency spike investigation',
    messages: [
      {
        role: 'assistant',
        content:
          'An alert has been triggered: P99 latency on the payment service exceeded 2,000ms for the past 15 minutes. I am starting an investigation.\n\nI pulled the service metrics and correlated them with recent deployment events. Here is what I am seeing:',
        attachments: [
          {
            type: 'link-preview',
            title: 'Payment service alert — P99 latency breach',
            description:
              'Triggered at 14:32 UTC. P99 latency crossed the 2,000ms threshold on 3 of 4 pods. No recent deploys in the last 6 hours.',
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
        ],
      },
      {
        role: 'assistant',
        content:
          'Based on the timing and pattern, I have two hypotheses:\n\n**Hypothesis 1: Downstream dependency bottleneck**\n\nThe latency spike correlates with elevated connection wait times to the inventory service, which started returning slower responses around 14:20 UTC.',
        attachment: {
          type: 'link-preview',
          key: 'notebooks',
          title: 'Inventory service dependency analysis',
          description:
            'Connection pool saturation, response time degradation, and queue depth trends for the inventory service over the last 4 hours.',
        },
      },
      {
        role: 'assistant',
        content:
          "**Hypothesis 2: Connection pool exhaustion**\n\nThe payment service's outbound connection pool is at 98% utilization. Requests are queuing rather than failing fast, which inflates P99 without raising error rates. This would explain why error rates look normal while latency is spiking.",
        attachment: {
          type: 'link-preview',
          key: 'notebooks',
          title: 'Payment service connection pool metrics',
          description:
            'Pool utilization, acquire wait time, and active connection count for the payment service over the last 4 hours.',
        },
      },
      {
        role: 'assistant',
        content:
          'Here are the recommended next steps to confirm and mitigate:\n\n1. Check the inventory service connection pool configuration.\n2. Increase the pool max from 50 to 150 to relieve backpressure.\n3. Enable circuit breaker on the payment→inventory call path.\n\nI have prepared a script to apply the connection pool fix:',
        attachment: {
          type: 'code-block',
          title: 'apply-fix.sh',
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
      },
      {
        role: 'assistant',
        content:
          '**Summary**\n\nPayment-service P99 latency breached 2,000ms due to connection pool exhaustion on 3 of 4 pods. The outbound pool hit 98% utilization, causing requests to queue rather than fail fast. No recent deployments contributed. Root cause: pool max of 50 connections was insufficient under current load. Fix applied: pool max increased to 150 with a 5s acquire timeout, and pods restarted. Latency is expected to recover within 2–3 minutes.',
      },
    ],
  },
  'checkout-error': {
    title: 'Checkout error rate alert',
    messages: [
      {
        role: 'user',
        author: 'Alex Chen',
        content:
          'Checkout error rate just crossed the 50% threshold. What is happening?',
      },
      {
        role: 'assistant',
        content:
          'The checkout service error rate is at 58.8%, primarily driven by 503 responses from the payment-service dependency. The upstream connection pool appears exhausted — active connections are at the configured maximum of 100 with a queue depth of 2,400 pending requests.\n\n**Recommended Actions**\n\n1. Increase the connection pool max from 100 to 250.\n2. Enable circuit breaker with a 50% error threshold and 30s recovery window.\n3. Add retry budget limiting to cap retries at 10% of total requests.',
      },
      {
        role: 'user',
        author: 'Alex Chen',
        content: 'Show me the breakdown by error code.',
      },
      {
        role: 'assistant',
        content:
          'Here is the error breakdown for the checkout service over the last hour:\n\n- 503: 1,842 (62.3%) from payment-service\n- 504: 689 (23.3%) from payment-service\n- 500: 312 (10.6%) from checkout-api\n- 429: 114 (3.8%) from rate-limiter',
      },
    ],
  },
  'disk-pressure': {
    title: 'Node disk pressure alerts',
    messages: [
      {
        role: 'user',
        author: 'Riley Tanaka',
        content:
          'Three nodes in the production cluster are showing disk pressure. What is filling up the disks?',
      },
      {
        role: 'assistant',
        content:
          'I checked the disk usage breakdown on the affected nodes.\n\n**Disk Usage Analysis**\n\n- node-prod-07: 91% used, 68 GB consumed by container logs from the analytics-pipeline service\n- node-prod-12: 88% used, 54 GB of orphaned container images from failed garbage collection\n- node-prod-19: 93% used, 72 GB of emptyDir volumes from the batch-processor service that were never cleaned up\n\n**Recommended Actions**\n\n1. Enable log rotation on the analytics-pipeline with a 500 MB max size and 3 file retention.\n2. Restart the kubelet image GC on node-prod-12 and lower the image GC high threshold from 90% to 80%.\n3. Add resource limits for emptyDir volumes on the batch-processor pods (sizeLimit: 2Gi).',
      },
    ],
  },
  'connection-timeout': {
    title: 'Connection timeout investigation',
    messages: [
      {
        role: 'user',
        author: 'You',
        content: "I see errors in the logs for payments-db. What's going on?",
      },
      {
        role: 'assistant',
        content:
          'I see 847 connection timeout errors to payments-db starting at 14:30. Want me to check the trace data for this dependency?',
      },
    ],
  },
  'error-rate-spike': {
    title: 'Error Rate Spike — Checkout Service',
    messages: [
      {
        role: 'assistant',
        content:
          'The checkout service error rate climbed from 0.3% to 12.4% starting at 09:15 UTC. 94% of failures are 503s from the auth-service dependency. Root cause: auth-service v2.5.0 deployed at 09:12 introduced a synchronous OIDC token validation call that is timing out against the external provider.\n\nThe auth-service has been rolled back to v2.4.1 and error rates are recovering. Sharing this summary with the team for visibility.',
        attachments: [
          {
            type: 'link-preview',
            title: 'Alert: Checkout error rate > 10%',
            description:
              'Triggered at 09:18 UTC. 503 errors from auth-service dependency accounting for 94% of failures.',
          },
          {
            type: 'link-preview',
            title: 'Checkout service health dashboard',
            description:
              'Real-time error rate, latency, and throughput for the checkout service and its dependencies.',
          },
        ],
      },
    ],
  },
  'tool-demo-1': {
    title: 'Thread tool demo 1',
    messages: [
      {
        role: 'user',
        author: 'Emily Zhang',
        content: 'Can you show me the current state of our API gateway?',
      },
      {
        role: 'assistant',
        content:
          'Here is the current health snapshot for the API gateway cluster:',
        attachment: {
          type: 'stats-display',
          title: 'API Gateway Health',
          stats: [
            { label: 'Uptime', value: '99.97%', color: 'default' },
            { label: 'Requests/sec', value: '12,480', color: 'default' },
            { label: 'Avg Latency', value: '23ms', color: 'success' },
            { label: 'Error Rate', value: '0.3%', color: 'success' },
          ],
        },
      },
      {
        role: 'user',
        author: 'Emily Zhang',
        content:
          'What about the route configuration? Show me the current setup.',
      },
      {
        role: 'assistant',
        content: 'Here is the active route configuration for the API gateway:',
        attachment: {
          type: 'code-block',
          title: 'gateway-routes.yaml',
          language: 'yaml',
          code: `routes:
  - path: /api/v1/users
    service: user-service
    timeout: 5s
    rate_limit: 1000/min
  - path: /api/v1/orders
    service: order-service
    timeout: 10s
    rate_limit: 500/min
  - path: /api/v1/payments
    service: payment-service
    timeout: 15s
    rate_limit: 200/min`,
        },
      },
      {
        role: 'user',
        author: 'Emily Zhang',
        content: 'Show me the traffic distribution across routes.',
      },
      {
        role: 'assistant',
        content: 'Here is the traffic breakdown by route over the last hour:',
        attachment: {
          type: 'chart',
          title: 'Traffic by Route (last 1h)',
          data: [
            { label: '/users', value: 34200 },
            { label: '/orders', value: 22800 },
            { label: '/payments', value: 15400 },
            { label: '/search', value: 11200 },
            { label: '/auth', value: 8900 },
          ],
        },
      },
      {
        role: 'user',
        author: 'Emily Zhang',
        content: 'Any rate limiting events recently?',
      },
      {
        role: 'assistant',
        content: 'I found several rate limiting events in the last 24 hours:',
        attachment: {
          type: 'data-table',
          title: 'Rate Limit Events (last 24h)',
          columns: ['Route', 'Client', 'Events', 'Last Triggered'],
          rows: [
            ['/api/v1/orders', 'mobile-app-ios', '847', '12 min ago'],
            ['/api/v1/payments', 'checkout-web', '312', '45 min ago'],
            ['/api/v1/users', 'admin-dashboard', '156', '2 hours ago'],
            ['/api/v1/search', 'recommendation-svc', '89', '6 hours ago'],
          ],
        },
      },
      {
        role: 'user',
        author: 'Emily Zhang',
        content: 'Is there a dashboard I can monitor this on?',
      },
      {
        role: 'assistant',
        content:
          'Yes, here is the gateway monitoring dashboard with real-time metrics:',
        attachment: {
          type: 'link-preview',
          title: 'API Gateway monitoring dashboard',
          description:
            'Real-time request rates, latency percentiles, rate limiting events, and upstream health for all gateway routes.',
        },
      },
    ],
  },
  'tool-demo-2': {
    title: 'Thread tool demo 2',
    messages: [
      {
        role: 'user',
        author: 'Carlos Rivera',
        content:
          'We need to investigate the database replication lag. What do you see?',
      },
      {
        role: 'assistant',
        content:
          'I pulled the replication metrics across all read replicas. The lag is significant on two nodes:',
        attachment: {
          type: 'stats-display',
          title: 'Replication Status',
          stats: [
            { label: 'Primary WAL', value: '2.4 GB/hr', color: 'default' },
            { label: 'Replica-1 Lag', value: '340ms', color: 'success' },
            { label: 'Replica-2 Lag', value: '8.2s', color: 'danger' },
            { label: 'Replica-3 Lag', value: '12.1s', color: 'danger' },
          ],
        },
      },
      {
        role: 'user',
        author: 'Carlos Rivera',
        content: 'Show me the lag trend over time.',
      },
      {
        role: 'assistant',
        content:
          'Here is the replication lag trend for the past 6 hours. The spike started around 14:00 UTC:',
        attachment: {
          type: 'chart',
          title: 'Replication Lag (6h)',
          data: [
            { label: '09:00', value: 200 },
            { label: '10:00', value: 180 },
            { label: '11:00', value: 220 },
            { label: '12:00', value: 350 },
            { label: '13:00', value: 900 },
            { label: '14:00', value: 8200 },
            { label: '15:00', value: 12100 },
          ],
        },
      },
      {
        role: 'user',
        author: 'Carlos Rivera',
        content: 'What queries are causing the most write pressure?',
      },
      {
        role: 'assistant',
        content:
          'These are the top write-heavy queries on the primary in the last hour:',
        attachment: {
          type: 'data-table',
          title: 'Top Write Queries (last 1h)',
          columns: [
            'Query Pattern',
            'Calls/min',
            'Avg Duration',
            'Rows Affected',
          ],
          rows: [
            ['INSERT INTO order_events', '2,340', '4.2ms', '2,340'],
            ['UPDATE inventory SET stock=', '1,890', '12.8ms', '3,780'],
            ['INSERT INTO audit_log', '1,560', '1.1ms', '1,560'],
            ['DELETE FROM expired_sessions', '890', '45ms', '12,400'],
          ],
        },
      },
      {
        role: 'user',
        author: 'Carlos Rivera',
        content: 'Can you show me the replication config?',
      },
      {
        role: 'assistant',
        content:
          'Here is the current replication configuration. The `wal_keep_size` looks undersized for the current write volume:',
        attachment: {
          type: 'code-block',
          title: 'postgresql.conf (replication)',
          language: 'ini',
          code: `# Replication settings
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB
max_replication_slots = 10
hot_standby = on
hot_standby_feedback = on

# Recovery target (replicas)
recovery_min_apply_delay = 0
primary_conninfo = 'host=primary port=5432 user=replicator'`,
        },
      },
      {
        role: 'user',
        author: 'Carlos Rivera',
        content: 'Where can I see the full replication dashboard?',
      },
      {
        role: 'assistant',
        content:
          'Here is the replication monitoring dashboard with WAL throughput and replica status:',
        attachment: {
          type: 'link-preview',
          title: 'Database replication dashboard',
          description:
            'WAL generation rate, replica lag per node, replication slot status, and connection pool metrics for the PostgreSQL cluster.',
        },
      },
    ],
  },
  'tool-demo-3': {
    title: 'Thread tool demo 3',
    messages: [
      {
        role: 'user',
        author: 'Aisha Patel',
        content:
          'The CI/CD pipeline has been failing intermittently. What is going on?',
      },
      {
        role: 'assistant',
        content:
          'I analyzed the pipeline runs from the last 48 hours. Here is the failure breakdown:',
        attachment: {
          type: 'stats-display',
          title: 'Pipeline Health (48h)',
          stats: [
            { label: 'Total Runs', value: '284', color: 'default' },
            { label: 'Success Rate', value: '71.8%', color: 'accent' },
            { label: 'Flaky Tests', value: '23', color: 'danger' },
            { label: 'Infra Failures', value: '14', color: 'danger' },
          ],
        },
      },
      {
        role: 'user',
        author: 'Aisha Patel',
        content: 'Which stages are failing the most?',
      },
      {
        role: 'assistant',
        content: 'Here is the failure count by pipeline stage:',
        attachment: {
          type: 'chart',
          title: 'Failures by Stage (48h)',
          data: [
            { label: 'unit-test', value: 31 },
            { label: 'integration', value: 24 },
            { label: 'build', value: 14 },
            { label: 'deploy-staging', value: 8 },
            { label: 'e2e', value: 3 },
          ],
        },
      },
      {
        role: 'user',
        author: 'Aisha Patel',
        content: 'Show me the specific test failures.',
      },
      {
        role: 'assistant',
        content: 'These are the most frequently failing tests across all runs:',
        attachment: {
          type: 'data-table',
          title: 'Flaky Test Report',
          columns: ['Test Name', 'Failures', 'Pass Rate', 'Avg Duration'],
          rows: [
            ['OrderService.processPayment', '18', '42%', '3.2s'],
            ['CartAPI.concurrentUpdate', '12', '61%', '8.4s'],
            ['AuthFlow.tokenRefresh', '9', '71%', '2.1s'],
            ['InventorySync.batchUpdate', '7', '78%', '12.6s'],
          ],
        },
      },
      {
        role: 'user',
        author: 'Aisha Patel',
        content:
          'What does the pipeline config look like for the integration stage?',
      },
      {
        role: 'assistant',
        content:
          'Here is the integration stage configuration. The timeout and retry settings may need adjustment:',
        attachment: {
          type: 'code-block',
          title: '.github/workflows/ci.yml (integration)',
          language: 'yaml',
          code: `integration-tests:
  runs-on: ubuntu-latest
  timeout-minutes: 15
  services:
    postgres:
      image: postgres:15
      ports: ['5432:5432']
    redis:
      image: redis:7
      ports: ['6379:6379']
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npm run test:integration
      env:
        DATABASE_URL: postgres://localhost:5432/test
        REDIS_URL: redis://localhost:6379`,
        },
      },
      {
        role: 'user',
        author: 'Aisha Patel',
        content: 'Is there a dashboard for pipeline analytics?',
      },
      {
        role: 'assistant',
        content:
          'Yes, here is the CI/CD analytics dashboard with historical trends and flaky test tracking:',
        attachment: {
          type: 'link-preview',
          title: 'CI/CD pipeline analytics dashboard',
          description:
            'Pipeline success rates, stage duration trends, flaky test detection, and infrastructure failure correlation over the last 30 days.',
        },
      },
    ],
  },
};

// Renders a single user prompt bubble (right-aligned, light background)
const UserMessage = ({ author: _author, content, attachment, enter }) => (
  <div
    className={`threadPage__message threadPage__message--user${
      enter ? ' threadPage__message--enter' : ''
    }`}>
    <div className="threadPage__bubble threadPage__bubble--user">
      <OuiText size="s">
        <p>{content}</p>
      </OuiText>
    </div>
    {attachment && attachment.type === 'link-preview' && (
      <div className="threadPage__attachment threadPage__attachment--linkPreview">
        <div className="threadPage__linkPreviewBody">
          <OuiText size="xs">
            <strong>{attachment.title}</strong>
          </OuiText>
          {attachment.description && (
            <OuiText size="xs" color="subdued">
              <p style={{ margin: 0 }}>{attachment.description}</p>
            </OuiText>
          )}
        </div>
      </div>
    )}
  </div>
);

// Handles inline **bold** within a line
const parseInlineBold = (text, baseKey) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${baseKey}-b${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Parses simple markdown-ish content into React elements
const parseContent = (content) => {
  const lines = content.split('\n');
  const elements = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading (## )
    if (line.startsWith('## ')) {
      elements.push(
        <p
          key={key++}
          style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>
          {line.slice(3)}
        </p>
      );
      i++;
      // Bold header
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p
          key={key++}
          style={{ margin: '8px 0 4px', fontSize: 12, fontWeight: 700 }}>
          {line.replace(/\*\*/g, '')}
        </p>
      );
      i++;
      // Unordered list: collect consecutive "- " lines
    } else if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(
          <li key={key++}>{parseInlineBold(lines[i].slice(2), key)}</li>
        );
        i++;
      }
      elements.push(<ul key={key++}>{items}</ul>);
      // Ordered list: collect consecutive "N. " lines
    } else if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d+\.\s/, '');
        items.push(<li key={key++}>{parseInlineBold(itemText, key)}</li>);
        i++;
      }
      elements.push(<ol key={key++}>{items}</ol>);
      // Blank line
    } else if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 12 }} />);
      i++;
      // Plain text (with inline bold support)
    } else {
      elements.push(
        <p key={key++} style={{ margin: 0 }}>
          {parseInlineBold(line, key)}
        </p>
      );
      key++;
      i++;
    }
  }

  return elements;
};

// Floating button group for link-preview attachments
const ViewAsPageButton = ({ onClick }) => (
  <div className="threadPage__addToCanvas">
    <button
      type="button"
      className="threadPage__addToCanvasBtn"
      onClick={onClick}>
      View as page
    </button>
  </div>
);

// Floating "Save as object" button for non-link-preview attachments
const SaveAsObjectButton = () => (
  <button type="button" className="threadPage__saveAsObject">
    Save as object
  </button>
);

// Attachment card: link preview (Tool UI style — image + title + description + URL)
const LinkPreviewAttachment = ({
  href,
  title,
  description,
  image,
  onViewAsPage,
}) => {
  return (
    <div className="threadPage__attachmentWrap">
      <ViewAsPageButton onClick={onViewAsPage} />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="threadPage__attachment threadPage__attachment--linkPreview threadPage__attachment--clickable"
        onClick={onViewAsPage}
        role="button"
        tabIndex={0}>
        <div className="threadPage__linkPreviewBody">
          <OuiText size="xs">
            <strong>{title}</strong>
          </OuiText>
          {description && (
            <OuiText size="xs" color="subdued">
              <p style={{ margin: 0 }}>{description}</p>
            </OuiText>
          )}
          {href && (
            <OuiText size="xs" color="subdued">
              <span className="threadPage__linkPreviewUrl">{href}</span>
            </OuiText>
          )}
        </div>
      </div>
    </div>
  );
};

// Attachment card: stats display (Tool UI style — grid of key metrics)
const StatsDisplayAttachment = ({ title, stats }) => {
  return (
    <div className="threadPage__attachmentWrap">
      <div className="threadPage__attachment threadPage__attachment--statsDisplay">
        {title && (
          <OuiText size="xs">
            <strong>{title}</strong>
          </OuiText>
        )}
        <OuiFlexGroup
          gutterSize="l"
          wrap
          responsive={false}
          className="threadPage__statsGrid">
          {stats.map((stat, i) => (
            <OuiFlexItem key={i} grow={false}>
              <OuiStat
                title={stat.value}
                description={stat.label}
                titleSize="s"
                titleColor={stat.color || 'default'}
                isLoading={false}
              />
            </OuiFlexItem>
          ))}
        </OuiFlexGroup>
      </div>
    </div>
  );
};

// Attachment card: trace waterfall (horizontal span bars)
const TraceWaterfallAttachment = ({ title, spans }) => {
  const maxDuration = Math.max(...spans.map((s) => s.duration));
  const colorMap = {
    primary: '#0077CC',
    success: '#00BFB3',
    danger: '#FF6467',
    warning: '#CDA849',
    accent: '#4168B8',
  };
  return (
    <div className="threadPage__attachmentWrap">
      <div className="threadPage__attachment threadPage__attachment--traceWaterfall">
        {title && (
          <OuiText size="xs" style={{ marginBottom: 12 }}>
            <strong>{title}</strong>
          </OuiText>
        )}
        <div className="threadPage__traceSpans">
          {spans.map((span, i) => (
            <div key={i} className="threadPage__traceSpanRow">
              <span className="threadPage__traceSpanName">{span.name}</span>
              <div
                className="threadPage__traceSpanBarWrap"
                style={{
                  backgroundColor: `${
                    colorMap[span.color] || colorMap.primary
                  }26`,
                }}>
                <div
                  className="threadPage__traceSpanBar"
                  style={{
                    width: `${(span.duration / maxDuration) * 100}%`,
                    backgroundColor: colorMap[span.color] || colorMap.primary,
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="threadPage__traceSpanDuration">
                {span.duration >= 1000
                  ? `${(span.duration / 1000).toFixed(1)}s`
                  : `${span.duration}ms`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Attachment card: data table (Tool UI style — tabular data)
const DataTableAttachment = ({ title, columns, rows }) => {
  return (
    <div className="threadPage__attachmentWrap">
      <div className="threadPage__attachment threadPage__attachment--dataTable">
        {title && (
          <OuiText size="xs" style={{ marginBottom: 12 }}>
            <strong>{title}</strong>
          </OuiText>
        )}
        <div className="threadPage__dataTableScroll">
          <table className="threadPage__dataTable">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Attachment card: code block (Tool UI style — syntax-highlighted code)
const CodeBlockAttachment = ({ title, language, code }) => {
  return (
    <div className="threadPage__attachmentWrap">
      <div className="threadPage__attachment threadPage__attachment--codeBlock">
        {title && (
          <OuiText size="xs">
            <strong>{title}</strong>
          </OuiText>
        )}
        <OuiCodeBlock
          language={language}
          fontSize="s"
          paddingSize="m"
          isCopyable>
          {code}
        </OuiCodeBlock>
      </div>
    </div>
  );
};

// Attachment card: chart (Tool UI style — simple inline bar/sparkline chart)
const ChartAttachment = ({
  title,
  data,
  chartType,
  threshold,
  breachRange,
}) => {
  // Line chart mode using @elastic/charts
  if (chartType === 'line') {
    const lineData = data.map((d, i) => ({
      x: d.x !== undefined ? d.x : i,
      y: d.y !== undefined ? d.y : d.value,
    }));
    return (
      <div className="threadPage__attachmentWrap">
        <div className="threadPage__attachment threadPage__attachment--chart">
          {title && (
            <OuiText size="xs" style={{ marginBottom: 12 }}>
              <strong>{title}</strong>
            </OuiText>
          )}
          <div style={{ height: 160 }}>
            <Chart>
              <Settings showLegend={false} />
              <Axis id="bottom" position="bottom" showGridLines={false} />
              <Axis
                id="left"
                position="left"
                showGridLines
                tickFormat={(d) => `${d}ms`}
              />
              <LineSeries
                id="p99"
                xScaleType={ScaleType.Linear}
                yScaleType={ScaleType.Linear}
                xAccessor="x"
                yAccessors={['y']}
                data={lineData}
              />
              {threshold && (
                <LineAnnotation
                  id="threshold"
                  domainType={AnnotationDomainType.YDomain}
                  dataValues={[{ dataValue: threshold }]}
                  style={{
                    line: { stroke: '#FF6467', strokeWidth: 2, dash: [4, 4] },
                  }}
                />
              )}
              {breachRange && (
                <RectAnnotation
                  id="breach"
                  dataValues={[{ coordinates: breachRange }]}
                  style={{ fill: '#FF6467', opacity: 0.05 }}
                />
              )}
            </Chart>
          </div>
        </div>
      </div>
    );
  }

  // Default bar chart mode
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="threadPage__attachmentWrap">
      <div className="threadPage__attachment threadPage__attachment--chart">
        {title && (
          <OuiText size="xs" style={{ marginBottom: 12 }}>
            <strong>{title}</strong>
          </OuiText>
        )}
        <div className="threadPage__chartBars">
          {data.map((d, i) => (
            <div key={i} className="threadPage__chartBarCol">
              <div
                className="threadPage__chartBar"
                style={{ height: `${(d.value / maxVal) * 100}%` }}
                title={`${d.label}: ${d.value}`}
              />
              <span className="threadPage__chartBarLabel">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Attachment card: item carousel (horizontal scrollable stat cards)
const ItemCarouselAttachment = ({ title, items }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 200;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="threadPage__attachmentWrap">
      <div className="threadPage__attachment threadPage__attachment--carousel">
        {title && (
          <OuiText size="xs" style={{ marginBottom: 8 }}>
            <strong>{title}</strong>
          </OuiText>
        )}
        <div className="threadPage__carouselContainer">
          {canScrollLeft && (
            <button
              type="button"
              className="threadPage__carouselArrow threadPage__carouselArrow--left"
              onClick={() => scroll('left')}
              aria-label="Scroll left">
              <OuiIcon type="arrowLeft" size="s" />
            </button>
          )}
          <div
            className="threadPage__carouselTrack"
            ref={scrollRef}
            onScroll={updateScrollState}>
            {items.map((item, i) => (
              <div key={i} className="threadPage__carouselCard">
                <div className="threadPage__carouselLabel">{item.label}</div>
                <div
                  className={`threadPage__carouselValue threadPage__carouselValue--${
                    item.color || 'default'
                  }`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          {canScrollRight && (
            <button
              type="button"
              className="threadPage__carouselArrow threadPage__carouselArrow--right"
              onClick={() => scroll('right')}
              aria-label="Scroll right">
              <OuiIcon type="arrowRight" size="s" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to render a single attachment by type
const renderSingleAttachment = (att, idx, onViewAsPage, onOpenDiscover) => {
  // MCP app cards — inline apps that make up the investigation journey.
  if (att.type === 'mcp-app') {
    return <McpAppAttachment key={idx} app={att.app} />;
  }
  // Second investigation's beats. Same card frame, different content.
  if (att.type === 'token-app') {
    return (
      <McpTokenAppAttachment
        key={idx}
        app={att.app}
        onOpenPage={onOpenDiscover}
      />
    );
  }
  // The ending components below are shared by both flows: each takes its
  // content as `data`, and falls back to the checkout flow's when omitted.
  if (att.type === 'mcp-evidence') {
    return <McpEvidenceLinks key={idx} items={att.items} />;
  }
  if (att.type === 'mcp-recommendation') {
    return <McpRecommendationCard key={idx} data={att.data} />;
  }
  if (att.type === 'mcp-alert-rule') {
    return <McpAlertRuleOffer key={idx} data={att.data} />;
  }
  if (att.type === 'mcp-memory') {
    return <McpMemoryCard key={idx} data={att.data} />;
  }
  if (att.type === 'mcp-caveat') {
    return (
      <McpCaveatLine
        key={idx}
        data={att.data}
        onOpenDiscover={onOpenDiscover}
      />
    );
  }
  if (att.type === 'link-preview') {
    return (
      <LinkPreviewAttachment
        key={idx}
        href={att.href}
        title={att.title}
        description={att.description}
        image={att.image}
        onViewAsPage={() => onViewAsPage(att)}
      />
    );
  }
  if (att.type === 'code-block') {
    return (
      <CodeBlockAttachment
        key={idx}
        title={att.title}
        language={att.language}
        code={att.code}
      />
    );
  }
  if (att.type === 'chart') {
    return (
      <ChartAttachment
        key={idx}
        title={att.title}
        data={att.data}
        chartType={att.chartType}
        threshold={att.threshold}
        breachRange={att.breachRange}
      />
    );
  }
  if (att.type === 'data-table') {
    return (
      <DataTableAttachment
        key={idx}
        title={att.title}
        columns={att.columns}
        rows={att.rows}
      />
    );
  }
  if (att.type === 'stats-display') {
    return (
      <StatsDisplayAttachment key={idx} title={att.title} stats={att.stats} />
    );
  }
  if (att.type === 'trace-waterfall') {
    return (
      <TraceWaterfallAttachment key={idx} title={att.title} spans={att.spans} />
    );
  }
  if (att.type === 'item-carousel') {
    return (
      <ItemCarouselAttachment key={idx} title={att.title} items={att.items} />
    );
  }
  return null;
};

// Renders a single assistant response (left-aligned, plain text + feedback)
const AssistantMessage = ({
  content,
  streaming,
  attachment,
  attachments,
  onViewAsPage,
  onOpenDiscover,
  mascotColor,
  mascotEyeColor,
  isLastAssistant,
  isTyping,
  largeGreeting,
  findings,
  scenario,
  onFindingAction,
  expandFindings,
  hideFeedback,
  enter,
}) => {
  const allAttachments = attachments || (attachment ? [attachment] : []);
  const showMascot = isLastAssistant && !isTyping;

  // Determine mascot expression based on state:
  // - No content yet (pulsating delay): "blink"
  // - Text streaming in: "dot" (attentive)
  // - Done: idle (OllyIdle handles this)
  const streamingExpression = !content ? 'blink' : 'dot';

  return (
    <div
      className={`threadPage__message threadPage__message--assistant${
        enter ? ' threadPage__message--enter' : ''
      }`}>
      {streaming ? (
        // While streaming: Olly on left, text on right (row)
        <div className="threadPage__assistantStreamRow">
          {showMascot && (
            <div
              className={`threadPage__responseMascot${
                !content ? ' threadPage__responseMascot--pulsing' : ''
              }`}>
              <Mascot
                size={20}
                expression={streamingExpression}
                idle={false}
                bob={false}
                follow={false}
                color={mascotColor}
                eyeColor={mascotEyeColor}
              />
            </div>
          )}
          <div className="threadPage__bubble threadPage__bubble--assistant">
            {content && <OuiText size="s">{parseContent(content)}</OuiText>}
          </div>
        </div>
      ) : (
        // Done: text full width, OllyIdle below on the left (with wink → idle)
        <>
          <div className="threadPage__bubble threadPage__bubble--assistant">
            {content && <OuiText size="s">{parseContent(content)}</OuiText>}
            {allAttachments.map((att, idx) =>
              renderSingleAttachment(att, idx, onViewAsPage, onOpenDiscover)
            )}
            {findings &&
              findings.length > 0 &&
              (scenario != null ? (
                // Scenario-backed findings render the same expandable warning
                // cards as the home greeting (widget + evidence + actions).
                <div className="threadPage__scenarioFindings">
                  {findings.map((finding) => (
                    <ScenarioFindingCard
                      key={finding.key}
                      finding={finding}
                      scenario={scenario}
                      idPrefix="chat"
                      showFeedback={false}
                      initialExpanded={expandFindings}
                      hideActions={expandFindings}
                      onAction={(label) => {
                        if (onFindingAction) onFindingAction(label);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="threadPage__inlineFindings">
                  {findings.map((finding) => {
                    const statusColors = {
                      red: {
                        bg: 'var(--g-danger-soft)',
                        color: 'var(--g-danger)',
                      },
                      amber: { bg: 'rgba(180,83,9,0.08)', color: '#B45309' },
                      green: { bg: 'rgba(14,110,82,0.08)', color: '#0E6E52' },
                      blue: { bg: 'rgba(26,93,168,0.08)', color: '#1A5DA8' },
                    };
                    const colors =
                      statusColors[finding.statusColor] || statusColors.blue;
                    return (
                      <div
                        key={finding.key}
                        className="threadPage__inlineFinding">
                        <span
                          className="threadPage__inlineFindingPill"
                          style={{
                            background: colors.bg,
                            color: colors.color,
                          }}>
                          {finding.status}
                        </span>
                        <span className="threadPage__inlineFindingTitle">
                          {finding.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            {/* Hide message-level feedback on finding-context cards (findings
                with no text) so the callout reads as context, not a rateable
                answer. */}
            {!hideFeedback && (content || !(findings && findings.length > 0)) && (
              <div className="threadPage__feedback">
                <OuiButtonIcon
                  iconType="thumbsUp"
                  aria-label="Helpful"
                  size="xs"
                  color="text"
                />
                <OuiButtonIcon
                  iconType="thumbsDown"
                  aria-label="Not helpful"
                  size="xs"
                  color="text"
                />
              </div>
            )}
          </div>
          {showMascot && content && (
            <div className="threadPage__responseMascot">
              <OllyIdle size={20} showTooltip />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Mock task pairs for each response
const MOCK_TASKS = [
  [
    {
      label: 'Searching service logs',
      description: 'Querying last 30 minutes of structured logs',
    },
    {
      label: 'Analyzing error patterns',
      description: 'Correlating error codes with service dependencies',
    },
  ],
  [
    {
      label: 'Querying connection metrics',
      description: 'Fetching pool utilization and acquire wait times',
    },
    {
      label: 'Evaluating pool utilization',
      description: 'Comparing current usage against configured limits',
    },
  ],
  [
    {
      label: 'Correlating traffic data',
      description: 'Matching latency spikes with request volume changes',
    },
    {
      label: 'Checking cache performance',
      description: 'Analyzing hit ratios and eviction rates',
    },
  ],
  [
    {
      label: 'Fetching service health',
      description: 'Polling health endpoints across all instances',
    },
    {
      label: 'Comparing baseline metrics',
      description: 'Diffing current values against 7-day averages',
    },
  ],
];

// Progress Tracker (Tool UI style — shows task steps with status indicators)
const TaskListMessage = ({ tasks, statuses, collapsed, onToggleCollapse }) => {
  const allDone =
    statuses.length >= tasks.length && statuses.every((s) => s === 'done');
  const steps = tasks.map((task, i) => ({
    id: `step-${i}`,
    label: typeof task === 'string' ? task : task.label,
    description: typeof task === 'string' ? undefined : task.description,
    status:
      i >= statuses.length
        ? 'pending'
        : statuses[i] === 'running'
        ? 'in-progress'
        : statuses[i] === 'done'
        ? 'completed'
        : 'pending',
  }));

  if (!allDone) {
    return (
      <div className="threadPage__message threadPage__message--assistant">
        <ProgressTracker id="task-progress" steps={steps} />
      </div>
    );
  }

  return (
    <div className="threadPage__message threadPage__message--assistant">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="progressTracker__toggle"
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}>
        <div className="progressTracker__toggleHeader">
          <span className="progressTracker__toggleIcon">
            <OuiIcon
              type="checkInCircleEmpty"
              size="m"
              color="success"
              className="progressTracker__toggleCheck"
            />
            <OuiIcon
              type="arrowDown"
              size="s"
              color="subdued"
              className="progressTracker__toggleArrowDown"
            />
            <OuiIcon
              type="arrowUp"
              size="s"
              color="subdued"
              className="progressTracker__toggleArrowUp"
            />
          </span>
          <OuiText size="xs" color="subdued">
            <span>{steps.length} steps completed</span>
          </OuiText>
        </div>
        {!collapsed && (
          <div className="progressTracker__toggleBody">
            <ProgressTracker id="task-progress" steps={steps} />
          </div>
        )}
      </div>
    </div>
  );
};

// Pool of mock AI responses to cycle through
const MOCK_RESPONSES = [
  {
    content:
      'I looked into this and found a few things worth noting.\n\n**Summary**\n\n- The service metrics show a gradual increase in P99 latency over the past 6 hours.\n- Error rates remain within acceptable thresholds but are trending upward.\n- No recent deployments correlate with the change.\n\nI recommend checking the downstream dependency health and reviewing recent config changes in the environment.',
    attachment: {
      type: 'link-preview',
      title: 'Service health overview dashboard',
      description:
        'Aggregated health metrics across all services including uptime, latency percentiles, and error trends.',
    },
  },
  {
    content:
      'Based on the available data, here is what I found.\n\n**Analysis**\n\n1. The connection pool utilization is at 87%, which is approaching the configured limit.\n2. Garbage collection pauses have increased by 40% compared to last week.\n3. The thread count on the primary nodes is elevated.\n\nConsider scaling horizontally or increasing the connection pool ceiling to provide headroom.',
    attachment: {
      type: 'code-block',
      title: 'Pool utilization query',
      language: 'sql',
      code:
        'source=opensearch_dashboards_sample_data_logs | where pool_utilization > 80 | stats max(pool_utilization) by service',
    },
  },
  {
    content:
      'I ran a correlation analysis across the affected services.\n\n**Key Observations**\n\n- The spike aligns with a traffic surge from the EU region starting at 14:32 UTC.\n- Cache hit ratio dropped from 94% to 61% during the same window.\n- The CDN origin pull rate tripled, putting pressure on the backend.\n\nThis looks like a cache invalidation event combined with organic traffic growth. The system should stabilize once the cache warms back up.',
    attachment: {
      type: 'link-preview',
      title: 'EU region traffic dashboard',
      description:
        'Traffic volume, cache hit ratios, and CDN origin pull rates for the EU region.',
    },
  },
  {
    content:
      'Here is a quick health check of the relevant services.\n\n**Service Status**\n\n- cart: Healthy, latency 4ms, throughput 52 req/s\n- checkout: Degraded, latency 380ms, error rate 12.3%\n- payment-service: Unhealthy, connection timeouts at 67%\n- frontend-proxy: Healthy, acting as passthrough\n\nThe payment-service is the bottleneck. I suggest checking its resource allocation and recent deployment history.',
    attachment: {
      type: 'code-block',
      title: 'Service latency query',
      language: 'sql',
      code:
        'source=opensearch_dashboards_sample_data_logs | stats avg(latency) as avg_latency, avg(error_rate) as avg_errors by service | sort -avg_errors',
    },
  },
];

// Thread-specific scripted responses (matched by prompt content)
// For latency-spike: logs and traces can be asked in any order.
// The conclusion appears after both have been shown.
const SCRIPTED_RESPONSES = {
  'connection-timeout': {
    traces: {
      id: 'traces',
      match: /yes|trace|check/i,
      tasks: [
        {
          label: 'Querying trace data',
          description: 'Sampling traces for payments-db dependency',
        },
        {
          label: 'Analyzing latency patterns',
          description: 'Correlating with historical incidents',
        },
      ],
      content:
        'The trace data shows payments-db latency spiked from 12ms to 8,400ms at 14:29:58, correlating with a connection pool exhaustion event. This matches a pattern from 3 previous incidents.',
      attachments: [
        {
          type: 'trace-waterfall',
          title: 'Trace waterfall — payments-db dependency',
          spans: [
            { name: 'payment-service', duration: 8400, color: 'primary' },
            { name: '→ acquire_conn', duration: 8200, color: 'danger' },
            { name: '→ query payments-db', duration: 12, color: 'success' },
            { name: '→ serialize', duration: 3, color: 'success' },
          ],
        },
        {
          type: 'link-preview',
          title: 'payments-db trace analysis',
          description:
            'Trace waterfall showing latency spike from 12ms to 8,400ms starting at 14:29:58, with connection pool exhaustion as root cause.',
        },
      ],
      followUps: [
        {
          content:
            "Here's a suggested fix — increase the connection pool max and add a circuit breaker:",
          attachment: {
            type: 'code-block',
            title: 'Suggested fix',
            language: 'bash',
            code:
              'kubectl patch configmap payments-db-config \\\n  -n production \\\n  --type merge \\\n  -p \'{"data":{"POOL_MAX_CONNECTIONS":"150","POOL_ACQUIRE_TIMEOUT":"5s"}}\'\n\nkubectl rollout restart deployment/payments-db -n production',
          },
        },
        {
          content:
            'Want me to create an alert rule so you catch this earlier next time?',
        },
      ],
    },
    alert: {
      id: 'alert',
      match: /create alert|alert/i,
      tasks: [
        {
          label: 'Creating alert rule',
          description:
            'Configuring threshold: payments-db latency > 500ms for 30s',
        },
        {
          label: 'Configuring notification channel',
          description: 'Setting up #platform-alerts notification',
        },
      ],
      content:
        'Alert rule created — "payments-db-latency-monitor" will notify #platform-alerts when payments-db latency exceeds 500ms for 30 seconds. I\'ve also added this pattern to memory so I can flag it proactively next time.',
      attachment: {
        type: 'link-preview',
        key: 'alert-rule',
        title: 'payments-db-latency-monitor',
        description:
          'Per cluster metrics monitor · Schedule: every 1 minute · Trigger: payments-db latency > 500ms for 30s · Channel: #platform-alerts',
      },
    },
  },
  'latency-spike': {
    logs: {
      id: 'logs',
      match: /log/i,
      tasks: [
        {
          label: 'Querying payment service logs',
          description: 'Filtering last 30 minutes by service=payment',
        },
        {
          label: 'Analyzing slow-log entries',
          description: 'Grouping entries by message pattern and severity',
        },
      ],
      content:
        'I analyzed the last 30 minutes of payment service logs. I created a query to filter for timeout events:\n\n- No 5xx errors from the payment service itself — error rates are clean.\n- 847 slow-log entries (>1s) all show "connection acquire timeout" as the bottleneck.\n- No upstream dependency errors from inventory service.\n\nThe logs point toward connection pool starvation rather than a downstream failure.',
      attachments: [
        {
          type: 'code-block',
          title: 'Payment service timeout query',
          language: 'sql',
          code:
            'source=opensearch_metrics_payment_service | where level="WARN" OR message LIKE "%timeout%" | sort -timestamp | head 25',
        },
        {
          type: 'link-preview',
          title: 'Payment service logs — last 30 minutes',
          description:
            'Filtered log results showing slow-log entries, error distribution, and connection timeout events for the payment service.',
        },
        {
          type: 'data-table',
          title: 'Log Summary (last 30m)',
          columns: ['Level', 'Count', 'Top Message'],
          rows: [
            ['WARN', '847', 'connection acquire timeout exceeded 1000ms'],
            ['INFO', '12,340', 'request completed successfully'],
            ['ERROR', '0', '—'],
            ['DEBUG', '3,210', 'pool checkout attempt'],
          ],
        },
      ],
    },
    traces: {
      id: 'traces',
      match: /trace|span/i,
      tasks: [
        {
          label: 'Sampling recent traces',
          description: 'Collecting 200 traces from the last 15 minutes',
        },
        {
          label: 'Analyzing span durations',
          description: 'Breaking down latency by span across the call chain',
        },
      ],
      content:
        'I sampled 200 traces from the last 15 minutes. Here is the span breakdown:\n\n- Average span duration for payment→inventory calls is 45ms (normal).\n- However, the acquire_connection span preceding it averages 1,840ms — this is where the latency is hiding.',
      attachments: [
        {
          type: 'link-preview',
          title: 'Payment service traces — sampled spans',
          description:
            'Trace waterfall view showing acquire_connection bottleneck across sampled requests for the payment service.',
        },
        {
          type: 'data-table',
          title: 'Trace Span Breakdown',
          columns: ['Span Name', 'Avg Duration', 'P99'],
          rows: [
            ['acquire_connection', '1,840ms', '2,320ms'],
            ['payment→inventory', '45ms', '82ms'],
            ['serialize_response', '3ms', '8ms'],
            ['total_request', '1,920ms', '2,410ms'],
          ],
        },
      ],
    },
    fix: {
      id: 'fix',
      match: /fix|suggest/i,
      tasks: [
        {
          label: 'Generating fix script',
          description: 'Building kubectl patch commands for connection pool',
        },
        {
          label: 'Validating configuration',
          description: 'Checking values against cluster resource limits',
        },
      ],
      content:
        'I have updated the fix to target the confirmed root cause. The script increases the connection pool ceiling, adds acquire timeout protection, and enables a circuit breaker to prevent future queue buildup:',
      attachment: {
        type: 'code-block',
        title: 'apply-fix.sh',
        language: 'bash',
        code: `#!/bin/bash
# Fix: increase connection pool + enable circuit breaker

# 1. Patch connection pool settings
kubectl patch configmap payment-service-config \\
  -n production \\
  --type merge \\
  -p '{"data":{
    "POOL_MAX_CONNECTIONS":"150",
    "POOL_MIN_IDLE":"20",
    "POOL_ACQUIRE_TIMEOUT":"3s",
    "CIRCUIT_BREAKER_ENABLED":"true",
    "CIRCUIT_BREAKER_THRESHOLD":"50",
    "CIRCUIT_BREAKER_RECOVERY":"30s"
  }}'

# 2. Rolling restart
kubectl rollout restart deployment/payment-service -n production
kubectl rollout status deployment/payment-service -n production --timeout=120s

# 3. Verify recovery
sleep 30
echo "Checking P99 latency post-fix..."
kubectl exec -n production deploy/payment-service -- \\
  curl -s localhost:9090/metrics | grep 'http_request_duration_p99'`,
      },
    },
    dashboard: {
      id: 'dashboard',
      match: /dashboard/i,
      tasks: [
        {
          label: 'Creating dashboard',
          description:
            'Generating panels for connection pool and latency metrics',
        },
        {
          label: 'Configuring data sources',
          description: 'Linking payment service metrics and alert thresholds',
        },
      ],
      content:
        'I have created a monitoring dashboard for the payment service connection pool. It includes panels for pool utilization, acquire wait time, active connections, and P99 latency with alert thresholds configured:',
      attachments: [
        {
          type: 'item-carousel',
          title: 'Dashboard panels',
          items: [
            { label: 'Pool utilization', value: '98%', color: 'danger' },
            { label: 'Acquire wait (P95)', value: '1,840ms', color: 'danger' },
            { label: 'Active connections', value: '50/50', color: 'accent' },
            { label: 'Circuit breaker', value: 'OFF', color: 'subdued' },
          ],
        },
        {
          type: 'link-preview',
          title: 'Payment service — connection pool dashboard',
          description:
            'Live dashboard with pool utilization, acquire wait time, active connections, circuit breaker status, and P99 latency for the payment service.',
        },
      ],
    },
  },
};

// Conclusion message shown after both logs and traces responses
const CONCLUSION_MESSAGE = {
  role: 'assistant',
  content:
    '**Conclusion**\n\nHypothesis 2 is confirmed. The connection pool is exhausted. Inventory service is healthy — the delay is entirely in waiting for a free connection from the pool.',
};

const NEW_THREAD = { title: 'New thread', messages: [] };

const EMPTY_CHAT_TITLES = [
  'How can I help?',
  'Ask and I will provide',
  'Olly olly oxen free',
  'What can I help you seek?',
];

export const ThreadPage = ({
  selectedItem,
  _onItemSelect,
  pendingMessages,
  pendingInputValue,
  sourcePage,
  sourcePageTitle,
  isPanelOpen,
  onTogglePanel,
  onPageChange,
  onNavigate,
  onGreetingStateChange,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const threadKey = selectedItem || (onNavigate ? null : 'latency-spike');
  const thread = (threadKey && THREADS[threadKey]) || NEW_THREAD;
  const initialMessages = pendingMessages || thread.messages;

  // Determine effective scripted response key — detect connection-timeout pattern from pending messages
  const effectiveScriptedKey = (() => {
    if (SCRIPTED_RESPONSES[threadKey]) return threadKey;
    if (pendingMessages) {
      const hasConnectionTimeout = pendingMessages.some(
        (m) =>
          m.content && /847 connection timeout|payments-db/i.test(m.content)
      );
      if (hasConnectionTimeout) return 'connection-timeout';
      const hasInvestigateAlert = pendingMessages.some(
        (m) => m.content && /investigate.*alert|P99.*latency/i.test(m.content)
      );
      if (hasInvestigateAlert) return 'investigate-alert';
    }
    return threadKey;
  })();

  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');
  const [mascotExpression, setMascotExpression] = useState(undefined);
  const [greetingExiting, setGreetingExiting] = useState(false);
  const [greetingDone, setGreetingDone] = useState(false);
  // Scenario shown on the home greeting; shared with the first chat message so
  // both stay in sync (the greeting picks one at random otherwise).
  const [homeScenario] = useState(() => Math.floor(Math.random() * 5) + 1);

  const isOverviewHome = threadKey === 'overview-home';
  const isMcpInvestigation = threadKey === 'checkout-p99';
  const isTokenInvestigation = threadKey === 'agent-token-spike';
  const isPocThread = threadKey === 'poc-checkout-p99';
  // Set when a home findings row starts an investigation that wants a context
  // strip above the thread (the checkout flow doesn't).
  const [activeContextStrip, setActiveContextStrip] = useState(null);
  useEffect(() => {
    if (onGreetingStateChange) {
      onGreetingStateChange(
        (isOverviewHome || isMcpInvestigation) && !greetingDone
      );
    }
  }, [isOverviewHome, isMcpInvestigation, greetingDone, onGreetingStateChange]);

  const pendingSendRef = useRef(null);
  const sendRef = useRef(null);
  const lastProcessedInput = useRef(null);
  const emptyChatTitle = useRef(
    EMPTY_CHAT_TITLES[Math.floor(Math.random() * EMPTY_CHAT_TITLES.length)]
  ).current;

  // When pendingInputValue changes, auto-send it
  useEffect(() => {
    if (!pendingInputValue || pendingInputValue === lastProcessedInput.current)
      return;
    lastProcessedInput.current = pendingInputValue;
    const textToSend = pendingInputValue;
    const interval = setInterval(() => {
      if (sendRef.current) {
        clearInterval(interval);
        sendRef.current(textToSend);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [pendingInputValue]);

  const [isTyping, setIsTyping] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeCanvasTab, setActiveCanvasTab] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [isCanvasExpanding, setIsCanvasExpanding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isDragging = useRef(false);
  const feedRef = useRef(null);
  const responseIndex = useRef(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [feedScrolled, setFeedScrolled] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [completedScriptedIds, setCompletedScriptedIds] = useState(new Set());

  const streamTimers = useRef([]);

  // Drag-to-resize handlers for related assets flyout
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    setIsCanvasDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      const maxCanvasWidth = window.innerWidth - 400;
      setCanvasWidth(Math.max(240, Math.min(newWidth, maxCanvasWidth)));
    };
    const handleDragEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsCanvasDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  const handleViewAsPage = useCallback(
    (item) => {
      // In session mode (onNavigate provided), delegate to parent to open as Page_Panel tab
      if (onNavigate && item.type === 'link-preview') {
        // Resolve page key: use explicit key, or map title to a known page key
        let pageKey = item.key;
        if (!pageKey) {
          const title = (item.title || '').toLowerCase();
          if (title.includes('alert') || title.includes('latency breach')) {
            pageKey = 'alerts';
          } else if (title.includes('log')) {
            pageKey = 'logs';
          } else if (title.includes('dashboard')) {
            pageKey = 'dashboards';
          } else if (
            title.includes('inventory') ||
            title.includes('dependency analysis')
          ) {
            pageKey = 'notebooks';
          } else if (
            title.includes('connection pool') ||
            title.includes('metrics')
          ) {
            pageKey = 'metrics';
          } else if (title.includes('trace')) {
            pageKey = 'traces';
          } else {
            pageKey = 'alerts';
          }
        }
        const displayTitle = item.title || pageKey;
        onNavigate(pageKey, displayTitle);
        return;
      }

      // Legacy mode: open in internal canvas flyout
      const idx = canvasItems.findIndex(
        (existing) =>
          existing.type === item.type &&
          (item.type === 'code-block'
            ? existing.code === item.code
            : existing.title === item.title)
      );
      if (idx >= 0) {
        setActiveCanvasTab(idx);
      } else {
        setCanvasItems((prev) => {
          const newItems = [...prev, item];
          setActiveCanvasTab(newItems.length - 1);
          return newItems;
        });
      }
      setIsCanvasOpen(true);
    },
    [canvasItems, onNavigate]
  );

  // The drill-down links out to the classic product. Opens the requested page
  // in the canvas (right side), which is otherwise closed; the checkout flow's
  // correlated logs are the default when a chip names no page of its own.
  const handleOpenDiscover = useCallback(
    (pageKey, pageTitle) => {
      if (onNavigate) {
        onNavigate(
          pageKey || MCP_CAVEAT.pageKey,
          pageTitle || MCP_CAVEAT.pageTitle
        );
      }
    },
    [onNavigate]
  );

  // Stage an investigation into the thread one message at a time, so it reads as
  // a single scrollable story. Each beat waits `delayBefore` before it arrives;
  // the assistant "thinks" (Olly loader) in between. Both investigation flows
  // play through this same function.
  const startInvestigation = useCallback((beats) => {
    const scrollToEnd = () => {
      if (feedRef.current) {
        setTimeout(() => {
          if (feedRef.current)
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }, 50);
      }
    };
    hasInteracted.current = true;
    let elapsed = 0;
    beats.forEach((msg) => {
      const isAssistant = msg.role === 'assistant';
      // Show the Olly loader before each assistant beat, then reveal the beat.
      if (isAssistant) {
        const think = msg.delayBefore != null ? msg.delayBefore : 1600;
        const loaderAt = elapsed;
        streamTimers.current.push(
          setTimeout(() => {
            setIsTyping(true);
            scrollToEnd();
          }, loaderAt)
        );
        elapsed += think;
        streamTimers.current.push(
          setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [...prev, { ...msg, _enter: true }]);
            scrollToEnd();
          }, elapsed)
        );
      } else {
        streamTimers.current.push(
          setTimeout(() => {
            setMessages((prev) => [...prev, { ...msg, _enter: true }]);
            scrollToEnd();
          }, elapsed)
        );
        elapsed += 200;
      }
    });
    // Turn off the thinking indicator after the final beat lands.
    streamTimers.current.push(
      setTimeout(() => setIsTyping(false), elapsed + 100)
    );
  }, []);

  // The token-spike thread has no greeting of its own — it's opened from the
  // home findings row, so its beats start playing as soon as it mounts.
  const tokenPlayedRef = useRef(false);
  useEffect(() => {
    if (!isTokenInvestigation || tokenPlayedRef.current) return;
    tokenPlayedRef.current = true;
    startInvestigation(TOKEN_INVESTIGATION_MESSAGES);
  }, [isTokenInvestigation, startInvestigation]);

  // Reset messages and canvas when switching threads
  useEffect(() => {
    const msgs = pendingMessages || thread.messages;
    // A session started from a home callout leads with a finding-only assistant
    // message. We reveal it (and the follow-up) with an Olly typing animation so
    // the finding reads like a response rather than appearing all at once.
    const isFindingScoped = !!(
      pendingMessages &&
      pendingMessages[0] &&
      pendingMessages[0].role === 'assistant' &&
      pendingMessages[0].findings &&
      pendingMessages[0].findings.length
    );
    if (pendingMessages) {
      setMessages(isFindingScoped ? [] : pendingMessages);
    } else {
      setMessages(thread.messages);
    }
    setMessage('');
    setIsTyping(false);

    // Pre-populate canvas with link-preview attachments only
    const items = [];
    msgs.forEach((msg) => {
      if (msg.attachments) {
        msg.attachments
          .filter((a) => a.type === 'link-preview')
          .forEach((a) => items.push(a));
      } else if (msg.attachment && msg.attachment.type === 'link-preview') {
        items.push(msg.attachment);
      }
    });
    setCanvasItems(items);
    setActiveCanvasTab(0);
    setIsCanvasOpen(false);
    streamTimers.current.forEach(clearTimeout);
    streamTimers.current = [];

    // Finding-scoped session: the finding (context) and the user's prompt fade
    // in together with the UI, then Olly thinks and the insight response
    // animates in below.
    if (isFindingScoped) {
      const [findingMsg, actionMsg, insightMsg] = pendingMessages;
      const scrollToEnd = () => {
        if (feedRef.current) {
          setTimeout(() => {
            if (feedRef.current)
              feedRef.current.scrollTop = feedRef.current.scrollHeight;
          }, 50);
        }
      };
      // Finding + user prompt appear together, fading in with the UI.
      const initial = [{ ...findingMsg, _enter: true }];
      if (actionMsg) initial.push({ ...actionMsg, _enter: true });
      setMessages(initial);
      scrollToEnd();
      // Show only the Olly loader (a streaming assistant bubble with no text
      // yet — not the secondary spinner), then type the insight in word by word.
      if (insightMsg && insightMsg.content) {
        const full = insightMsg.content;
        const showOlly = setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '', streaming: true, _enter: true },
          ]);
          scrollToEnd();
          const startStream = setTimeout(() => {
            const tokens = full.split(/(\s+)/);
            let built = '';
            tokens.forEach((token, i) => {
              const t = setTimeout(() => {
                built += token;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: built,
                    streaming: i < tokens.length - 1,
                    _enter: true,
                  };
                  return updated;
                });
                scrollToEnd();
              }, i * 28);
              streamTimers.current.push(t);
            });
          }, 900);
          streamTimers.current.push(startStream);
        }, 450);
        streamTimers.current.push(showOlly);
      }
    }

    // Staggered loading for threads that opt in (e.g. overview-home). For the
    // home overview, build the message from the same scenario the greeting shows.
    const staggeredMessages = isOverviewHome
      ? [buildScenarioMessage(homeScenario)]
      : thread.staggeredMessages;
    if (!pendingMessages && thread.staggered && staggeredMessages) {
      setMessages([]);
      setIsTyping(true);
      // Mascot thinks for 2.5s, then messages appear
      const thinkDelay = 2500;
      staggeredMessages.forEach((msg, i) => {
        const delay = thinkDelay + i * 1800;
        streamTimers.current.push(
          setTimeout(() => {
            setMessages((prev) => [...prev, msg]);
            if (i < staggeredMessages.length - 1) {
              setIsTyping(true);
            } else {
              setIsTyping(false);
              window.dispatchEvent(
                new CustomEvent('staggered-thread-complete')
              );
            }
            if (feedRef.current) {
              setTimeout(() => {
                if (feedRef.current)
                  feedRef.current.scrollTop = feedRef.current.scrollHeight;
              }, 50);
            }
          }, delay)
        );
      });
    }
    responseIndex.current = 0;
    setCompletedScriptedIds(new Set());
    hasInteracted.current = false;
    if (feedRef.current) {
      // Scroll to bottom if thread has existing messages, top if empty
      setTimeout(() => {
        if (feedRef.current) {
          feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
      }, 0);
    }

    // If coming from "Continue as thread", open the canvas with the source page
    if (sourcePage && pendingMessages) {
      const mock = SOURCE_PAGE_MOCK[sourcePage];
      const title = sourcePageTitle || (mock ? mock.title : sourcePage);
      setCanvasItems([{ type: 'source-page', title, page: sourcePage }]);
      setActiveCanvasTab(0);
      setIsCanvasOpen(true);
    }

    // Auto-trigger mock response when starting a new thread with a user message
    if (
      pendingMessages &&
      pendingMessages.length > 0 &&
      pendingMessages[pendingMessages.length - 1].role === 'user' &&
      !pendingMessages.some((m) => m.role === 'assistant')
    ) {
      hasInteracted.current = true;

      // Use specific response for investigate-alert flow
      const isInvestigateAlert = pendingMessages.some(
        (m) => m.content && /investigate.*alert|P99.*latency/i.test(m.content)
      );

      let mockResponse;
      let tasks;
      if (isInvestigateAlert) {
        tasks = [
          {
            label: 'Querying payment-service metrics',
            description:
              'Pulling P99 latency and connection pool data for the last hour',
          },
          {
            label: 'Correlating with trace data',
            description: 'Analyzing spans for payment-service dependencies',
          },
        ];
        mockResponse = {
          content:
            "I've analyzed the payment-service alert. Here's what I found:\n\n• The latency spike began at 14:29:58 UTC and correlates with a sudden increase in active connections to payments-db.\n• Connection pool utilization jumped from 40% to 98% across pods 1, 2, and 4. Pod 3 remained healthy due to lower traffic allocation.\n• No deployments or config changes occurred in the 6 hours prior to the incident.\n• Upstream traffic volume remained steady — this doesn't appear to be load-driven.\n\nThe most likely root cause is connection pool exhaustion on the database side. Want me to open the trace analysis and connection pool metrics as pages?",
          attachment: {
            type: 'link-preview',
            title: 'Payment service — connection pool metrics',
            description:
              'Connection pool utilization spiked from 40% to 98% on 3 of 4 pods starting at 14:29:58 UTC.',
          },
        };
      } else {
        const idx = responseIndex.current % MOCK_RESPONSES.length;
        mockResponse = MOCK_RESPONSES[idx];
        tasks = MOCK_TASKS[idx % MOCK_TASKS.length];
      }
      responseIndex.current += 1;
      const fullContent = mockResponse.content;
      const attachment = mockResponse.attachment;
      const attachments = mockResponse.attachments;

      setIsTyping(true);
      const taskMsg = {
        role: 'tasks',
        tasks,
        statuses: ['running'],
        collapsed: false,
      };
      const t0 = setTimeout(() => {
        setMessages((prev) => [...prev, taskMsg]);
      }, 500);
      streamTimers.current.push(t0);

      const t1 = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const ti = updated.findLastIndex((m) => m.role === 'tasks');
          if (ti >= 0)
            updated[ti] = { ...updated[ti], statuses: ['done', 'running'] };
          return updated;
        });
      }, 3000);
      streamTimers.current.push(t1);

      const t2 = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const ti = updated.findLastIndex((m) => m.role === 'tasks');
          if (ti >= 0)
            updated[ti] = { ...updated[ti], statuses: ['done', 'done'] };
          return updated;
        });
      }, 5500);
      streamTimers.current.push(t2);

      const t3 = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const ti = updated.findLastIndex((m) => m.role === 'tasks');
          if (ti >= 0) updated[ti] = { ...updated[ti], collapsed: true };
          return updated;
        });
        setIsTyping(false);
        // Show Olly pulsating for 1.5s before text starts
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '',
            streaming: true,
            attachment,
            attachments,
          },
        ]);
        const delayTimer = setTimeout(() => {
          const tokens = fullContent.split(/(\s+)/);
          let built = '';
          tokens.forEach((token, i) => {
            const timer = setTimeout(() => {
              built += token;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: built,
                  streaming: i < tokens.length - 1,
                  attachment,
                  attachments,
                };
                return updated;
              });
            }, i * 30);
            streamTimers.current.push(timer);
          });
        }, 2000);
        streamTimers.current.push(delayTimer);
      }, 6000);
      streamTimers.current.push(t3);
    }
  }, [
    threadKey,
    thread.messages,
    pendingMessages,
    sourcePage,
    sourcePageTitle,
    isOverviewHome,
    homeScenario,
  ]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => streamTimers.current.forEach(clearTimeout);
  }, []);

  // Auto-scroll to bottom only after user sends a message
  const hasInteracted = useRef(false);
  useEffect(() => {
    if (feedRef.current && hasInteracted.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (overrideText) => {
    const text = (overrideText || message).trim();
    if (!text) return;
    hasInteracted.current = true;

    // Initializing a chat is what promotes a landing into a real session — the
    // home greeting, or a page opened from the nav / jump-to pills (which open
    // a canvas without starting a session).
    if (!messages.some((m) => m.role === 'user')) {
      window.dispatchEvent(new CustomEvent('session-chat-started'));
      // The home additionally expands full-screen and drops its Overview tab.
      if (threadKey === 'overview-home') {
        window.dispatchEvent(
          new CustomEvent('session-rename', {
            detail: { title: text.slice(0, 50) },
          })
        );
        window.dispatchEvent(new CustomEvent('home-chat-started'));
      }
    }

    // Add user message
    const userMsg = { role: 'user', author: 'You', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    // Use scripted responses for specific threads, otherwise fall back to generic
    const scripted = SCRIPTED_RESPONSES[effectiveScriptedKey];
    let mockResponse;
    let tasks;

    if (scripted) {
      // Match prompt to a scripted response by regex
      const matched = Object.values(scripted).find(
        (item) => item.match && item.match.test(text)
      );
      if (matched) {
        mockResponse = matched;
        tasks =
          matched.tasks ||
          MOCK_TASKS[responseIndex.current % MOCK_TASKS.length];
      } else {
        const idx = responseIndex.current % MOCK_RESPONSES.length;
        mockResponse = MOCK_RESPONSES[idx];
        tasks = MOCK_TASKS[idx % MOCK_TASKS.length];
      }
    } else {
      const idx = responseIndex.current % MOCK_RESPONSES.length;
      mockResponse = MOCK_RESPONSES[idx];
      tasks = MOCK_TASKS[idx % MOCK_TASKS.length];
    }
    responseIndex.current += 1;

    const fullContent = mockResponse.content;
    const attachment = mockResponse.attachment;
    const attachments = mockResponse.attachments;

    // Phase 1: Show task list with first task running
    const taskMsg = {
      role: 'tasks',
      tasks,
      statuses: ['running'],
      collapsed: false,
    };
    setMessages((prev) => [...prev, taskMsg]);

    // After 3s, first task finishes, second task appears running
    const t1 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0)
          updated[ti] = { ...updated[ti], statuses: ['done', 'running'] };
        return updated;
      });
    }, 3000);
    streamTimers.current.push(t1);

    // After 6s, second task finishes
    const t2 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0)
          updated[ti] = { ...updated[ti], statuses: ['done', 'done'] };
        return updated;
      });
    }, 6000);
    streamTimers.current.push(t2);

    // After 6.5s, collapse tasks and start streaming response
    const t3 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0) updated[ti] = { ...updated[ti], collapsed: true };
        return updated;
      });

      setIsTyping(false);

      // Show Olly pulsating for 1.5s before text starts
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          streaming: true,
          attachment,
          attachments,
        },
      ]);

      const textDelayTimer = setTimeout(() => {
        // Split into words, preserving newlines as separate tokens
        const tokens = fullContent.split(/(\s+)/);

        let built = '';
        tokens.forEach((token, i) => {
          const timer = setTimeout(() => {
            built += token;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: 'assistant',
                content: built,
                streaming: i < tokens.length - 1,
                attachment,
                attachments,
              };
              return updated;
            });
            // After last token, add follow-up if both logs and traces are done
            if (i === tokens.length - 1) {
              // Add link-preview attachments to canvas
              const newAtts = (
                attachments || (attachment ? [attachment] : [])
              ).filter((a) => a.type === 'link-preview');
              if (newAtts.length > 0) {
                setCanvasItems((prev) => [...prev, ...newAtts]);
              }
              if (mockResponse.id) {
                setCompletedScriptedIds(
                  (prev) => new Set([...prev, mockResponse.id])
                );
              }
              setCompletedScriptedIds((prev) => {
                const next = new Set([...prev]);
                if (mockResponse.id) next.add(mockResponse.id);
                if (
                  next.has('logs') &&
                  next.has('traces') &&
                  !next.has('conclusion')
                ) {
                  next.add('conclusion');
                  const conclusionContent = CONCLUSION_MESSAGE.content;
                  const conclusionTokens = conclusionContent.split(/(\s+)/);
                  const conclusionTimer = setTimeout(() => {
                    setMessages((prev2) => [
                      ...prev2,
                      { role: 'assistant', content: '', streaming: true },
                    ]);
                    let conclusionBuilt = '';
                    conclusionTokens.forEach((token, ci) => {
                      const cTimer = setTimeout(() => {
                        conclusionBuilt += token;
                        setMessages((prev2) => {
                          const updated = [...prev2];
                          updated[updated.length - 1] = {
                            role: 'assistant',
                            content: conclusionBuilt,
                            streaming: ci < conclusionTokens.length - 1,
                          };
                          return updated;
                        });
                      }, ci * 30);
                      streamTimers.current.push(cTimer);
                    });
                  }, 300);
                  streamTimers.current.push(conclusionTimer);
                }
                return next;
              });

              // Stream follow-up messages if defined
              if (mockResponse.followUps && mockResponse.followUps.length > 0) {
                let followUpDelay = 800;
                mockResponse.followUps.forEach((followUp) => {
                  const fuTimer = setTimeout(() => {
                    const fuTokens = followUp.content.split(/(\s+)/);
                    setMessages((prev2) => [
                      ...prev2,
                      {
                        role: 'assistant',
                        content: '',
                        streaming: true,
                        attachment: followUp.attachment,
                      },
                    ]);
                    let fuBuilt = '';
                    fuTokens.forEach((fuToken, fi) => {
                      const fTimer = setTimeout(() => {
                        fuBuilt += fuToken;
                        setMessages((prev2) => {
                          const updated = [...prev2];
                          updated[updated.length - 1] = {
                            role: 'assistant',
                            content: fuBuilt,
                            streaming: fi < fuTokens.length - 1,
                            attachment: followUp.attachment,
                          };
                          return updated;
                        });
                      }, fi * 30);
                      streamTimers.current.push(fTimer);
                    });
                  }, followUpDelay);
                  streamTimers.current.push(fuTimer);
                  followUpDelay += 1500;
                });
              }
            }
          }, i * 30);
          streamTimers.current.push(timer);
        });
      }, 2000);
      streamTimers.current.push(textDelayTimer);
    }, 6500);
    streamTimers.current.push(t3);
  };

  // Keep sendRef updated for pendingInputValue auto-send
  sendRef.current = handleSend;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // POC v2: completed investigation — render the report directly, no replay
  if (isPocThread) {
    const pocAlert = typeof window !== 'undefined' ? window.__pocAlert : null;
    if (pocAlert) {
      return <PocChatReport alert={pocAlert} />;
    }
  }

  // MCP investigation home: show the Warning-pill greeting until the user
  // starts the investigation. The whole journey then streams into this thread.
  const isMcpGreeting =
    threadKey === 'checkout-p99' &&
    !messages.some((m) => m.role === 'user') &&
    !greetingDone;

  if (isMcpGreeting) {
    return (
      <div
        className={`threadPage__greetingWrap${
          greetingExiting ? ' threadPage__greetingWrap--exiting' : ''
        }`}>
        <McpHomeGreeting
          findings={[MCP_P99_FINDING, TOKEN_SPIKE_FINDING]}
          onJumpToPage={handleOpenDiscover}
          onSelectFinding={(finding) => {
            // Each row opens its own investigation in this same thread. The two
            // flows are staged by the same function; only the beats differ.
            const beats =
              finding.key === TOKEN_SPIKE_FINDING.key
                ? TOKEN_INVESTIGATION_MESSAGES
                : MCP_INVESTIGATION_MESSAGES;
            setActiveContextStrip(
              finding.key === TOKEN_SPIKE_FINDING.key ? TOKEN_CONTEXT : null
            );
            setGreetingExiting(true);
            setTimeout(() => {
              setGreetingDone(true);
              window.dispatchEvent(new CustomEvent('session-chat-started'));
              startInvestigation(beats);
            }, 350);
          }}
          onSend={(text) => {
            // Free-form ask: bypass the staged investigation and drop straight
            // into the chat with the user's message.
            pendingSendRef.current = text;
            setGreetingExiting(true);
            setTimeout(() => {
              setGreetingDone(true);
              if (pendingSendRef.current) {
                handleSend(pendingSendRef.current);
                pendingSendRef.current = null;
              }
            }, 350);
          }}
        />
      </div>
    );
  }

  // Overview-home: show home greeting until user sends a message
  const isOverviewHomeGreeting =
    threadKey === 'overview-home' &&
    !messages.some((m) => m.role === 'user') &&
    !greetingDone;

  if (isOverviewHomeGreeting) {
    return (
      <div
        className={`threadPage__greetingWrap${
          greetingExiting ? ' threadPage__greetingWrap--exiting' : ''
        }`}>
        <EmptySessionPageV6
          scenario={homeScenario}
          onStartThread={(text) => {
            pendingSendRef.current = text;
            setGreetingExiting(true);
            setTimeout(() => {
              setGreetingDone(true);
              if (pendingSendRef.current) {
                handleSend(pendingSendRef.current);
                pendingSendRef.current = null;
              }
            }, 350);
          }}
          onFindingAction={(finding, action) => {
            // Start a NEW chat-only session scoped to just this callout: the
            // finding card sits at the top for context, followed by the action
            // the user took and an insights reply. No canvas tab — the chat
            // expands and the canvas stays collapsed.
            const shortTitle =
              finding.title.length > 44
                ? `${finding.title.slice(0, 44)}…`
                : finding.title;
            window.dispatchEvent(
              new CustomEvent('open-chat-session', {
                detail: {
                  sessionTitle: shortTitle,
                  prompt: action.label,
                  scenario: homeScenario,
                  findings: [finding],
                  insight: finding.insight,
                },
              })
            );
          }}
          onOpenPageInNewSession={(pageKey, title) => {
            if (onNavigate) onNavigate(pageKey, title);
          }}
          onJumpToPage={(pageKey, title) => {
            // Home page jump-to: open a fresh session with the page in a full
            // canvas and the chat minimized — mirrors the side-nav behavior.
            window.dispatchEvent(
              new CustomEvent('open-canvas-in-new-session', {
                detail: { pageKey, title },
              })
            );
          }}
          layout="single-column"
        />
      </div>
    );
  }

  return (
    <div
      className={greetingDone ? 'threadPage__chatEntering' : undefined}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Header — only shown in legacy mode (not session-based navigation) */}
      {!onNavigate && (
        <DetailPageHeader
          title={thread.title}
          isPanelOpen={isPanelOpen}
          onTogglePanel={onTogglePanel}
          firstActionIcon="dockedRight"
          firstActionLabel="Related Assets"
          firstActionActive={isCanvasOpen}
          onFirstAction={() => setIsCanvasOpen((open) => !open)}
          extraActions={[
            {
              label: 'Settings',
              render: () => (
                <OuiPopover
                  button={
                    <OuiToolTip content="Settings" position="bottom">
                      <OuiButtonIcon
                        iconType="controlsHorizontal"
                        aria-label="Settings"
                        size="s"
                        color="text"
                        display="empty"
                        onClick={() => setIsSettingsOpen((open) => !open)}
                      />
                    </OuiToolTip>
                  }
                  isOpen={isSettingsOpen}
                  closePopover={() => setIsSettingsOpen(false)}
                  panelPaddingSize="none"
                  anchorPosition="downRight"
                  ownFocus={false}>
                  <OuiContextMenuPanel
                    hasFocus={false}
                    items={[
                      <OuiContextMenuItem
                        key="skills"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onPageChange && onPageChange('ai-skills');
                        }}>
                        Skills
                      </OuiContextMenuItem>,
                      <OuiContextMenuItem
                        key="memories"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onPageChange && onPageChange('ai-memories');
                        }}>
                        Memories
                      </OuiContextMenuItem>,
                      <OuiContextMenuItem
                        key="automations"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onPageChange && onPageChange('ai-automations');
                        }}>
                        Automations
                      </OuiContextMenuItem>,
                      <OuiContextMenuItem
                        key="mcp"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onPageChange && onPageChange('ai-mcp-servers');
                        }}>
                        MCP Servers
                      </OuiContextMenuItem>,
                    ]}
                  />
                </OuiPopover>
              ),
            },
          ]}
          hideAskAi>
          {thread.title}
        </DetailPageHeader>
      )}

      {/* Body: feed + optional canvas flyout */}
      <div className="threadPage__body">
        {/* Conversation column */}
        <div
          className="threadPage__conversationCol"
          onWheel={(e) => {
            if (feedRef.current) {
              const el = feedRef.current;
              const isOverFeed = el.contains(e.target);
              if (!isOverFeed) {
                el.scrollTop += e.deltaY * 1.2;
                e.preventDefault();
              }
            }
          }}>
          {/* Conversation feed — scrollable */}
          <div
            className={`threadPage__feed${
              feedScrolled ? ' threadPage__feed--hasOverflow' : ''
            }`}
            ref={feedRef}
            onScroll={() => {
              if (!feedRef.current) return;
              const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
              const distFromBottom = scrollHeight - scrollTop - clientHeight;
              setShowScrollButton(distFromBottom > 100);
              setFeedScrolled(distFromBottom > 10);
            }}>
            {/* Context strip — says where this investigation came from. */}
            {(activeContextStrip || thread.contextStrip) && (
              <div className="threadPage__contextStrip">
                {activeContextStrip || thread.contextStrip}
              </div>
            )}
            {messages.length === 0 && !isTyping && (
              <div className="threadPage__emptyState">
                <OllyIdle
                  size={48}
                  winkOnMount={false}
                  follow
                  className="threadPage__emptyMascot"
                />
                <h3 className="threadPage__emptyTitle">{emptyChatTitle}</h3>
                <div className="threadPage__emptySuggestions">
                  <OuiButton
                    size="s"
                    onClick={() => setMessage('Summarize this page')}>
                    Summarize this page
                  </OuiButton>
                  <OuiButton
                    size="s"
                    onClick={() => setMessage('Find anomalies')}>
                    Find anomalies
                  </OuiButton>
                  <OuiButton
                    size="s"
                    onClick={() => setMessage('Explain the data')}>
                    Explain the data
                  </OuiButton>
                </div>
              </div>
            )}
            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <UserMessage
                    key={i}
                    author={msg.author}
                    content={msg.content}
                    attachment={msg.attachment}
                    enter={msg._enter}
                  />
                );
              }
              if (msg.role === 'tasks') {
                return (
                  <TaskListMessage
                    key={i}
                    tasks={msg.tasks}
                    statuses={msg.statuses}
                    collapsed={msg.collapsed}
                    onToggleCollapse={() => {
                      setMessages((prev) => {
                        const updated = [...prev];
                        updated[i] = {
                          ...updated[i],
                          collapsed: !updated[i].collapsed,
                        };
                        return updated;
                      });
                    }}
                  />
                );
              }
              return (
                <AssistantMessage
                  key={i}
                  content={msg.content}
                  streaming={msg.streaming}
                  attachment={msg.attachment}
                  attachments={msg.attachments}
                  findings={msg.findings}
                  scenario={msg.scenario}
                  expandFindings={msg.expandFindings}
                  hideFeedback={msg.hideFeedback}
                  onFindingAction={(label) => handleSend(label)}
                  onViewAsPage={handleViewAsPage}
                  onOpenDiscover={handleOpenDiscover}
                  mascotColor={mascotColor}
                  mascotEyeColor={mascotEyeColor}
                  isLastAssistant={
                    i === messages.findLastIndex((m) => m.role === 'assistant')
                  }
                  isTyping={isTyping}
                  largeGreeting={msg.largeGreeting}
                  enter={msg._enter}
                />
              );
            })}
            {isTyping &&
              !messages.some((m) => m.role === 'tasks' && !m.collapsed) && (
                // While steps are loading (an uncollapsed task list is present) Olly
                // stays hidden — the step tracker is the loading indicator. Once the
                // steps complete, the streaming assistant message pops Olly back in.
                <div className="threadPage__message threadPage__message--assistant">
                  <div className="threadPage__assistantStreamRow">
                    <div className="threadPage__responseMascot threadPage__responseMascot--pulsing">
                      <Mascot
                        size={20}
                        expression="blink"
                        idle={false}
                        bob={false}
                        follow={false}
                        color={mascotColor}
                        eyeColor={mascotEyeColor}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 0',
                      }}>
                      <OuiAgenticSpinner size="s" />
                    </div>
                  </div>
                </div>
              )}
            {/* Suggested prompts — inside the chat feed */}
            {(() => {
              if (
                message.trim() ||
                isTyping ||
                messages.some((m) => m.streaming)
              )
                return null;
              if (
                effectiveScriptedKey !== 'latency-spike' &&
                effectiveScriptedKey !== 'connection-timeout' &&
                threadKey !== 'overview-home'
              )
                return null;
              // Overview-home suggestion
              if (
                threadKey === 'overview-home' &&
                messages.length > 0 &&
                !messages.some((m) => m.role === 'user')
              ) {
                const suggestion = 'Investigate the checkout-agent loop';
                return (
                  <div className="threadPage__suggestedPrompts threadPage__suggestedPrompts--bottom">
                    <OuiSmallButtonEmpty
                      color="text"
                      iconType="returnKey"
                      iconSide="right"
                      className="threadPage__suggestedPrompt"
                      onClick={() => {
                        setMessage(suggestion);
                        hasInteracted.current = true;
                        setTimeout(() => handleSend(suggestion), 0);
                      }}>
                      {suggestion}
                    </OuiSmallButtonEmpty>
                  </div>
                );
              }
              const done = completedScriptedIds;
              let prompts = [];
              if (effectiveScriptedKey === 'connection-timeout') {
                if (done.has('alert')) {
                  prompts = [];
                } else if (done.has('traces')) {
                  prompts = ['Create an alert rule for this'];
                } else {
                  prompts = ['Yes, check the trace data'];
                }
              } else if (done.has('dashboard')) {
                prompts = [];
              } else if (done.has('fix')) {
                prompts = ['Set up a monitoring dashboard for this service'];
              } else if (done.has('conclusion')) {
                prompts = ['Suggest a fix for this issue'];
              } else if (done.has('logs') && !done.has('traces')) {
                prompts = [
                  'Analyze the trace spans for the payment service',
                  'Suggest a fix for this issue',
                ];
              } else if (done.has('traces') && !done.has('logs')) {
                prompts = [
                  'Show me the recent logs for the payment service',
                  'Suggest a fix for this issue',
                ];
              } else if (!done.has('logs') && !done.has('traces')) {
                prompts = [
                  'Show me the recent logs for the payment service',
                  'Analyze the trace spans for the payment service',
                ];
              }
              if (prompts.length === 0) return null;
              return (
                <div className="threadPage__suggestedPrompts">
                  {prompts.map((prompt) => (
                    <OuiSmallButtonEmpty
                      key={prompt}
                      color="text"
                      iconType="returnKey"
                      iconSide="right"
                      className="threadPage__suggestedPrompt"
                      onClick={() => {
                        setMessage(prompt);
                        hasInteracted.current = true;
                        setTimeout(() => handleSend(prompt), 0);
                      }}>
                      {prompt}
                    </OuiSmallButtonEmpty>
                  ))}
                </div>
              );
            })()}
          </div>

          <OuiThreadScrollButton
            isVisible={showScrollButton}
            onClick={() => {
              if (feedRef.current) {
                feedRef.current.scrollTo({
                  top: feedRef.current.scrollHeight,
                  behavior: 'smooth',
                });
                setShowScrollButton(false);
              }
            }}
            style={{
              position: 'absolute',
              bottom: 140,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}
          />

          {/* Input area — textarea with buttons inside at bottom */}
          <div className="threadPage__inputArea">
            <div className="threadPage__inputWrapper">
              <OuiCompressedTextArea
                placeholder="Ask anything. Type / for actions."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                resize="none"
                fullWidth
                autoFocus
                className="threadPage__textarea"
              />
              <div className="threadPage__inputActions">
                <OuiToolTip
                  content={isAttachMenuOpen ? '' : 'Attach'}
                  position="top">
                  <OuiPopover
                    button={
                      <OuiButtonIcon
                        iconType="plus"
                        aria-label="Add attachment"
                        size="s"
                        color="text"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setIsAttachMenuOpen((open) => !open)}
                      />
                    }
                    isOpen={isAttachMenuOpen}
                    closePopover={() => setIsAttachMenuOpen(false)}
                    anchorPosition="upLeft"
                    panelPaddingSize="s">
                    <OuiContextMenu
                      initialPanelId={0}
                      panels={[
                        {
                          id: 0,
                          items: [
                            {
                              name: 'Upload data',
                              icon: 'importAction',
                              onClick: () => setIsAttachMenuOpen(false),
                            },
                            {
                              name: 'Upload file or photo',
                              icon: 'document',
                              onClick: () => setIsAttachMenuOpen(false),
                            },
                            {
                              name: 'Take screenshot',
                              icon: 'fullScreen',
                              onClick: () => setIsAttachMenuOpen(false),
                            },
                            {
                              name: 'Add to session',
                              icon: 'folderOpen',
                              panel: 1,
                            },
                          ],
                        },
                        {
                          id: 1,
                          title: 'Recent sessions',
                          items: [
                            {
                              name: 'Latency spike investigation',
                              onClick: () => setIsAttachMenuOpen(false),
                            },
                            {
                              name: 'Checkout error rate alert',
                              onClick: () => setIsAttachMenuOpen(false),
                            },
                            {
                              name: 'Node disk pressure alerts',
                              onClick: () => setIsAttachMenuOpen(false),
                            },
                          ],
                        },
                      ]}
                    />
                  </OuiPopover>
                </OuiToolTip>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <OuiToolTip content="Dictate" position="top">
                    <OuiButtonIcon
                      aria-label="Dictate"
                      size="s"
                      color="text"
                      display="empty"
                      iconType={() => (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M12 19v3" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <rect x="9" y="2" width="6" height="13" rx="3" />
                        </svg>
                      )}
                    />
                  </OuiToolTip>
                  <OuiToolTip content="Send message" position="top">
                    <OuiButtonIcon
                      iconType="sortUp"
                      aria-label="Send message"
                      display="fill"
                      size="s"
                      isDisabled={
                        !message.trim() ||
                        isTyping ||
                        messages.some((m) => m.streaming)
                      }
                      onClick={() => handleSend()}
                    />
                  </OuiToolTip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas flyout (push panel) — hidden in session mode */}
        {!onNavigate && (
          <div
            className={`threadPage__canvasFlyout${
              isCanvasOpen ? ' threadPage__canvasFlyout--open' : ''
            }${isCanvasDragging ? ' threadPage__canvasFlyout--dragging' : ''}${
              isCanvasExpanding ? ' threadPage__canvasFlyout--expanding' : ''
            }`}
            style={isCanvasOpen ? { width: canvasWidth } : undefined}>
            <div className="threadPage__canvasFlyoutInner">
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
              <div
                className="threadPage__canvasResizeHandle"
                onMouseDown={handleDragStart}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize canvas"
                tabIndex={0}>
                <span className="threadPage__canvasResizeGrip">
                  <OuiIcon type="grab" size="s" />
                </span>
              </div>
              <OuiFlyoutHeader>
                {canvasItems.length > 0 && (
                  <OuiTabs size="s" className="threadPage__canvasTabs">
                    {canvasItems.map((item, i) => (
                      <OuiToolTip
                        key={i}
                        content={item.title || `Asset ${i + 1}`}
                        position="bottom">
                        <OuiTab
                          isSelected={activeCanvasTab === i}
                          onClick={() => setActiveCanvasTab(i)}>
                          {item.title || `Asset ${i + 1}`}
                        </OuiTab>
                      </OuiToolTip>
                    ))}
                  </OuiTabs>
                )}
              </OuiFlyoutHeader>
              <OuiFlyoutBody>
                {canvasItems.length === 0 ? (
                  <OuiText size="s" color="subdued">
                    <p>
                      Items added to the canvas will appear here. Hover over
                      attachments in the conversation and click &ldquo;Add to
                      canvas&rdquo; to collect them.
                    </p>
                  </OuiText>
                ) : (
                  <div className="threadPage__canvasTabContent">
                    <div className="threadPage__canvasPageHeader">
                      <OuiTitle size="l">
                        <h1>
                          {canvasItems[activeCanvasTab]?.title ||
                            `Asset ${activeCanvasTab + 1}`}
                        </h1>
                      </OuiTitle>
                      <div className="threadPage__canvasPageHeaderActions">
                        <OuiToolTip content="Open page" position="bottom">
                          <OuiButtonIcon
                            iconType="symlink"
                            aria-label="Open page"
                            size="s"
                            color="text"
                            onClick={() => {
                              const item = canvasItems[activeCanvasTab];
                              if (!item || !onNavigate) return;
                              setIsCanvasExpanding(true);
                              setTimeout(() => {
                                const title = item.title || '';
                                if (
                                  title.includes('alert') ||
                                  title.includes('Alert')
                                ) {
                                  onNavigate(
                                    'alerts-detail',
                                    'alert-payment-p99'
                                  );
                                } else if (
                                  title.includes('logs') ||
                                  title.includes('Logs')
                                ) {
                                  onNavigate('logs', 'payment-timeout-logs');
                                } else if (
                                  title.includes('dashboard') ||
                                  title.includes('Dashboard')
                                ) {
                                  onNavigate(
                                    'dashboards',
                                    'payment-pool-dashboard'
                                  );
                                } else if (title.includes('Inventory')) {
                                  onNavigate(
                                    'notebooks',
                                    'notebook-inventory-analysis'
                                  );
                                } else if (
                                  title.includes('connection pool') ||
                                  title.includes('Connection pool')
                                ) {
                                  onNavigate(
                                    'notebooks',
                                    'notebook-connection-pool'
                                  );
                                } else {
                                  onNavigate('notebooks', 'notebook-runbook');
                                }
                                setIsCanvasExpanding(false);
                              }, 350);
                            }}
                          />
                        </OuiToolTip>
                        <OuiToolTip content="Close" position="bottom">
                          <OuiButtonIcon
                            iconType="cross"
                            aria-label="Close tab"
                            size="s"
                            color="text"
                            onClick={() => {
                              setCanvasItems((prev) => {
                                const next = prev.filter(
                                  (_, idx) => idx !== activeCanvasTab
                                );
                                if (next.length === 0) {
                                  setIsCanvasOpen(false);
                                } else if (activeCanvasTab >= next.length) {
                                  setActiveCanvasTab(next.length - 1);
                                }
                                return next;
                              });
                            }}
                          />
                        </OuiToolTip>
                      </div>
                    </div>
                    {(() => {
                      const item = canvasItems[activeCanvasTab];
                      if (!item) return null;

                      // Render source page for "Continue as thread" flow using existing mocks
                      if (item.type === 'source-page') {
                        const mock = SOURCE_PAGE_MOCK[item.page];
                        if (mock) {
                          const MockComponent = mock.component;
                          return <MockComponent />;
                        }
                        return (
                          <div style={{ padding: 16 }}>
                            <OuiText size="s" color="subdued">
                              <p>
                                Continued from <strong>{item.title}</strong>
                              </p>
                            </OuiText>
                          </div>
                        );
                      }

                      // Render custom mock pages for known attachments
                      if (
                        item.title ===
                        'Payment service alert — P99 latency breach'
                      ) {
                        return <AlertPageMock />;
                      }
                      if (
                        item.title === 'Inventory service dependency analysis'
                      ) {
                        return <InventoryAnalysisPageMock />;
                      }
                      if (
                        item.title === 'Payment service connection pool metrics'
                      ) {
                        return <ConnectionPoolPageMock />;
                      }
                      if (
                        item.title === 'Payment service logs — last 30 minutes'
                      ) {
                        return <LogsPageMock />;
                      }
                      if (
                        item.title ===
                        'Payment service — connection pool dashboard'
                      ) {
                        return <DashboardPageMock />;
                      }
                      if (item.title === 'payments-db trace analysis') {
                        return <TraceAnalysisPageMock />;
                      }

                      // Default: generic link-preview rendering
                      return (
                        <>
                          {item.image && (
                            <div className="threadPage__canvasDetailImage">
                              <img src={item.image} alt="" />
                            </div>
                          )}
                          <OuiText size="s">
                            {item.description && <p>{item.description}</p>}
                            {item.href && (
                              <p>
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer">
                                  {item.href}
                                </a>
                              </p>
                            )}
                          </OuiText>
                        </>
                      );
                    })()}
                  </div>
                )}
              </OuiFlyoutBody>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
