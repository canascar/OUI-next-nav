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

import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
  OuiButtonIcon,
  OuiCodeBlock,
  OuiContextMenuPanel,
  OuiContextMenuItem,
  OuiFlyoutHeader,
  OuiFlyoutBody,
  OuiFlexGroup,
  OuiFlexItem,
  OuiIcon,
  OuiLoadingSpinner,
  OuiPopover,
  OuiStat,
  OuiTab,
  OuiTabs,
  OuiTitle,
  OuiText,
  OuiToolTip,
  OuiCompressedTextArea,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

const THREADS = {
  'latency-spike': {
    title: 'Latency spike investigation',
    messages: [
      {
        role: 'user',
        author: 'Sarah Lee',
        content:
          'Start investigation for the payment process error in the logs',
      },
      {
        role: 'assistant',
        content:
          'During the investigation, the primary cause of the service outage was identified as a misconfigured deployment that triggered a cascading failure across dependent services.\n\n**Key Findings**\n\n- Configuration Drift: A recent infrastructure change introduced an incorrect timeout value in the API gateway.\n- Autoscaling Feedback Loop: Increased retries caused aggressive scaling, which overwhelmed downstream services.\n- Insufficient Guardrails: Circuit breakers were not triggered due to misaligned thresholds.\n\n**Contributing Factors**\n\n1. Limited pre-deployment validation for environment-specific configurations.\n2. Monitoring alerts focused on symptoms (latency) rather than root signals (retry rates).\n3. Manual rollback required due to partial automation gaps.',
        attachment: {
          type: 'page',
          title: 'Payment service latency dashboard',
          description:
            'P99 latency, error rate, and throughput for the payment service over the last 24 hours.',
        },
      },
      {
        role: 'user',
        author: 'Sarah Lee',
        content:
          'Can you check the current retry rates on the checkout service?',
      },
      {
        role: 'assistant',
        content:
          'The checkout service is currently seeing elevated retry rates at approximately 340 retries/min, compared to the baseline of 45 retries/min. This is a 7.5x increase and correlates with the timeout misconfiguration identified earlier. The retry storm is propagating to downstream payment and inventory services.',
        attachment: {
          type: 'query',
          query:
            'source=opensearch_dashboards_sample_data_logs | where service="checkout" | stats count() as retries by span(timestamp, 1m)',
        },
      },
      {
        role: 'assistant',
        content:
          'Here is a relevant runbook that covers retry storm mitigation for this service:',
        attachment: {
          type: 'link-preview',
          href: 'https://runbooks.internal.io/checkout/retry-storm-mitigation',
          title: 'Retry Storm Mitigation Runbook',
          description:
            'Step-by-step guide for identifying and resolving retry storms in the checkout service, including circuit breaker configuration and connection pool tuning.',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
        },
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
        attachment: {
          type: 'stats-display',
          title: 'Checkout Service Health',
          stats: [
            { label: 'Error Rate', value: '58.8%', color: 'danger' },
            { label: 'Active Connections', value: '100/100', color: 'accent' },
            { label: 'Queue Depth', value: '2,400', color: 'danger' },
            { label: 'P99 Latency', value: '4.2s', color: 'accent' },
          ],
        },
      },
      {
        role: 'user',
        author: 'Alex Chen',
        content: 'Show me the breakdown by error code.',
      },
      {
        role: 'assistant',
        content:
          'Here is the error breakdown for the checkout service over the last hour:',
        attachment: {
          type: 'data-table',
          title: 'Error Code Breakdown (last 1h)',
          columns: ['Status Code', 'Count', 'Percentage', 'Service'],
          rows: [
            ['503', '1,842', '62.3%', 'payment-service'],
            ['504', '689', '23.3%', 'payment-service'],
            ['500', '312', '10.6%', 'checkout-api'],
            ['429', '114', '3.8%', 'rate-limiter'],
          ],
        },
      },
    ],
  },
  'weekly-review': {
    title: 'Weekly service review',
    messages: [
      {
        role: 'user',
        author: 'Team Ops',
        content: "Give me a summary of this week's service health.",
      },
      {
        role: 'assistant',
        content:
          'Weekly summary: overall uptime 99.92%. Two incidents this week — payment-service latency spike (resolved) and a brief DNS issue on the recommendation service. Here is the request volume by service:',
        attachment: {
          type: 'chart',
          title: 'Requests per Service (this week)',
          data: [
            { label: 'frontend', value: 48200 },
            { label: 'checkout', value: 31500 },
            { label: 'cart', value: 27800 },
            { label: 'payment', value: 22100 },
            { label: 'recommend', value: 15600 },
            { label: 'search', value: 12400 },
          ],
        },
      },
      {
        role: 'user',
        author: 'Team Ops',
        content: 'Can you give me the config fix for the connection pool?',
      },
      {
        role: 'assistant',
        content:
          'Here is the recommended configuration change for the payment-service connection pool:',
        attachment: {
          type: 'code-block',
          title: 'payment-service/config.yaml',
          language: 'yaml',
          code: `connection_pool:
  max_connections: 250
  min_idle: 20
  max_idle_time: 30s
  acquire_timeout: 5s

circuit_breaker:
  enabled: true
  error_threshold: 50
  recovery_window: 30s
  half_open_requests: 5

retry_budget:
  enabled: true
  max_retry_ratio: 0.10
  ttl: 60s`,
        },
      },
    ],
  },
  'memory-leak': {
    title: 'Memory leak in catalog service',
    messages: [
      {
        role: 'user',
        author: 'Jordan Park',
        content:
          'The catalog service keeps getting OOM-killed every 4 hours. Can you look into it?',
      },
      {
        role: 'assistant',
        content:
          'I analyzed the heap dumps and memory allocation patterns for the catalog service.\n\n**Findings**\n\n- Heap usage grows linearly at ~12 MB/min after each restart, reaching the 2 GB limit in roughly 4 hours.\n- The leak originates from an unbounded in-memory cache in the product-search module. Entries are added on every search request but never evicted.\n- GC full-pause frequency increased from 2/hr to 18/hr in the last 24 hours.\n\n**Recommendation**\n\n1. Add a TTL-based eviction policy (e.g., 10 min) to the product-search cache.\n2. Set a max entry cap of 50,000 items.\n3. Switch to an LRU cache implementation to bound memory growth.',
        attachment: {
          type: 'page',
          title: 'Catalog service memory dashboard',
          description:
            'Heap usage, GC pause duration, and object allocation rates for the catalog service.',
        },
      },
    ],
  },
  'dns-timeout': {
    title: 'DNS resolution timeouts',
    messages: [
      {
        role: 'user',
        author: 'Priya Sharma',
        content:
          'We are seeing intermittent DNS resolution failures across multiple services. What is going on?',
      },
      {
        role: 'assistant',
        content:
          'I checked the DNS resolver metrics and correlated them with the service error logs.\n\n**Root Cause**\n\n- The internal DNS resolver (CoreDNS) is running at 96% CPU on 2 of 3 pods.\n- Query volume spiked 3x after the new service mesh sidecar rollout, which issues a DNS lookup per request instead of caching.\n- Timeout rate is at 8.4%, concentrated on the two overloaded pods.\n\n**Recommended Actions**\n\n1. Scale CoreDNS from 3 to 6 pods to handle the increased query volume.\n2. Enable DNS caching in the service mesh sidecar configuration (ndots: 2, TTL: 30s).\n3. Add a node-local DNS cache DaemonSet to reduce cross-node DNS traffic.',
        attachment: {
          type: 'query',
          query:
            'source=opensearch_dashboards_sample_data_logs | where component="coredns" | stats avg(cpu_percent) as avg_cpu, count() as queries by pod_name | sort -avg_cpu',
        },
      },
      {
        role: 'user',
        author: 'Priya Sharma',
        content: 'How quickly can we roll out the CoreDNS scaling fix?',
      },
      {
        role: 'assistant',
        content:
          'The CoreDNS HPA is already configured but the max replica count is set to 3. Updating the max to 6 and lowering the CPU target to 60% should trigger an immediate scale-up. Estimated time to stabilize: under 5 minutes once applied. I recommend applying this change first while the sidecar DNS caching fix goes through the normal release pipeline.',
      },
    ],
  },
  'deployment-rollback': {
    title: 'Failed deployment rollback',
    messages: [
      {
        role: 'user',
        author: 'Marcus Webb',
        content:
          'The v2.14 deployment to the order service failed and the automatic rollback did not trigger. Can you check why?',
      },
      {
        role: 'assistant',
        content:
          'I reviewed the deployment pipeline logs and the rollback controller configuration.\n\n**Analysis**\n\n- The v2.14 deployment passed the readiness probe but failed the liveness probe 3 minutes after going live.\n- The rollback controller requires 3 consecutive liveness failures within a 60s window, but the failures were spaced 90s apart due to a misconfigured probe interval.\n- As a result, the failure count never reached the threshold and the rollback was not triggered.\n\n**Fix**\n\n1. Reduce the liveness probe period from 90s to 20s for the order service.\n2. Lower the rollback failure threshold from 3 to 2 consecutive failures.\n3. Add a deployment health alert that fires if error rate exceeds 5% within 2 minutes of a deploy.',
        attachment: {
          type: 'page',
          title: 'Order service deployment history',
          description:
            'Deployment timeline, rollback events, and probe status for the order service over the last 7 days.',
        },
      },
    ],
  },
  'cert-expiry': {
    title: 'TLS certificate expiry warning',
    messages: [
      {
        role: 'user',
        author: 'Dana Kim',
        content:
          'We got an alert that several TLS certificates are expiring in the next 48 hours. Which services are affected?',
      },
      {
        role: 'assistant',
        content:
          'I scanned the certificate inventory across all namespaces.\n\n**Expiring Certificates**\n\n- api-gateway.prod: expires in 36 hours\n- auth-service.prod: expires in 42 hours\n- webhook-receiver.prod: expires in 47 hours\n\nAll three are managed by cert-manager but the ClusterIssuer has a stale ACME account key. Renewal requests have been failing silently for the past 5 days.\n\n**Immediate Actions**\n\n1. Rotate the ACME account key in the ClusterIssuer resource.\n2. Manually trigger certificate renewal for the three affected services.\n3. Add a monitoring rule to alert when cert-manager renewal failures exceed 0 over a 24h window.',
        attachment: {
          type: 'query',
          query:
            'source=opensearch_dashboards_sample_data_logs | where event_type="cert_renewal" | stats count() as attempts, sum(case(status="failed", 1)) as failures by certificate_name | sort -failures',
        },
      },
      {
        role: 'user',
        author: 'Dana Kim',
        content: 'Can you confirm the ACME key rotation will not cause downtime?',
      },
      {
        role: 'assistant',
        content:
          'The ACME account key rotation is a control-plane operation only. Existing certificates remain valid until their expiry time regardless of the key change. The rotation updates the account credentials used for future renewal requests. No TLS connections will be interrupted during the process. After rotation, cert-manager will automatically retry the pending renewals within its next reconciliation loop (default: 1 minute).',
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
        attachment: {
          type: 'page',
          title: 'Cluster node disk usage dashboard',
          description:
            'Per-node disk utilization, top consumers, and garbage collection status across the production cluster.',
        },
      },
    ],
  },
};

// Renders a single user prompt bubble (right-aligned, light background)
const UserMessage = ({ author: _author, content }) => (
  <div className="threadPage__message threadPage__message--user">
    <div className="threadPage__bubble threadPage__bubble--user">
      <OuiText size="s">
        <p>{content}</p>
      </OuiText>
    </div>
  </div>
);

// Parses simple markdown-ish content into React elements
const parseContent = (content) => {
  const lines = content.split('\n');
  const elements = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bold header
    if (line.startsWith('**') && line.endsWith('**')) {
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
        items.push(<li key={key++}>{lines[i].slice(2)}</li>);
        i++;
      }
      elements.push(<ul key={key++}>{items}</ul>);
      // Ordered list: collect consecutive "N. " lines
    } else if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={key++}>{lines[i].replace(/^\d+\.\s/, '')}</li>);
        i++;
      }
      elements.push(<ol key={key++}>{items}</ol>);
      // Blank line
    } else if (line.trim() === '') {
      i++;
      // Plain text
    } else {
      elements.push(
        <p key={key++} style={{ margin: 0 }}>
          {line}
        </p>
      );
      i++;
    }
  }

  return elements;
};

// Floating "Add to related assets" button shown on attachment hover
const AddToCanvasButton = ({ onClick, added }) => (
  <button
    type="button"
    className={`threadPage__addToCanvas${
      added ? ' threadPage__addToCanvas--added' : ''
    }`}
    onClick={added ? undefined : onClick}>
    {added ? 'Added as related asset' : 'Add as related asset'}
  </button>
);

// Attachment card: page reference (title + description, clickable)
const PageAttachment = ({ title, description, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some((c) => c.type === 'page' && c.title === title);
  return (
    <div className="threadPage__attachmentWrap">
      <AddToCanvasButton
        added={added}
        onClick={() => onAddToCanvas({ type: 'page', title, description })}
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="threadPage__attachment"
        role="presentation">
        <OuiText size="xs">
          <strong>{title}</strong>
        </OuiText>
        {description && (
          <OuiText size="xs" color="subdued">
            <p style={{ margin: 0 }}>{description}</p>
          </OuiText>
        )}
      </div>
    </div>
  );
};

// Attachment card: link preview (Tool UI style — image + title + description + URL)
const LinkPreviewAttachment = ({ href, title, description, image, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some(
    (c) => c.type === 'link-preview' && c.href === href
  );
  return (
    <div className="threadPage__attachmentWrap">
      <AddToCanvasButton
        added={added}
        onClick={() =>
          onAddToCanvas({ type: 'link-preview', href, title, description, image })
        }
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="threadPage__attachment threadPage__attachment--linkPreview">
        {image && (
          <div className="threadPage__linkPreviewImage">
            <img src={image} alt="" />
          </div>
        )}
        <div className="threadPage__linkPreviewBody">
          <OuiText size="xs">
            <strong>{title}</strong>
          </OuiText>
          {description && (
            <OuiText size="xs" color="subdued">
              <p style={{ margin: 0 }}>{description}</p>
            </OuiText>
          )}
          <OuiText size="xs" color="subdued">
            <span className="threadPage__linkPreviewUrl">{href}</span>
          </OuiText>
        </div>
      </a>
    </div>
  );
};

// Attachment card: stats display (Tool UI style — grid of key metrics)
const StatsDisplayAttachment = ({ title, stats, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some(
    (c) => c.type === 'stats-display' && c.title === title
  );
  return (
    <div className="threadPage__attachmentWrap">
      <AddToCanvasButton
        added={added}
        onClick={() => onAddToCanvas({ type: 'stats-display', title, stats })}
      />
      <div className="threadPage__attachment threadPage__attachment--statsDisplay">
        {title && (
          <OuiText size="xs">
            <strong>{title}</strong>
          </OuiText>
        )}
        <OuiFlexGroup gutterSize="l" wrap responsive={false} className="threadPage__statsGrid">
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

// Attachment card: data table (Tool UI style — tabular data)
const DataTableAttachment = ({ title, columns, rows, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some(
    (c) => c.type === 'data-table' && c.title === title
  );
  return (
    <div className="threadPage__attachmentWrap">
      <AddToCanvasButton
        added={added}
        onClick={() => onAddToCanvas({ type: 'data-table', title, columns, rows })}
      />
      <div className="threadPage__attachment threadPage__attachment--dataTable">
        {title && (
          <OuiText size="xs" style={{ marginBottom: 8 }}>
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
const CodeBlockAttachment = ({ title, language, code, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some(
    (c) => c.type === 'code-block' && c.code === code
  );
  return (
    <div className="threadPage__attachmentWrap">
      <AddToCanvasButton
        added={added}
        onClick={() => onAddToCanvas({ type: 'code-block', title, language, code })}
      />
      <div className="threadPage__attachment threadPage__attachment--codeBlock">
        {title && (
          <OuiText size="xs" style={{ marginBottom: 4 }}>
            <strong>{title}</strong>
          </OuiText>
        )}
        <OuiCodeBlock language={language} fontSize="s" paddingSize="s" isCopyable>
          {code}
        </OuiCodeBlock>
      </div>
    </div>
  );
};

// Attachment card: chart (Tool UI style — simple inline bar/sparkline chart)
const ChartAttachment = ({ title, data, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some(
    (c) => c.type === 'chart' && c.title === title
  );
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="threadPage__attachmentWrap">
      <AddToCanvasButton
        added={added}
        onClick={() => onAddToCanvas({ type: 'chart', title, data })}
      />
      <div className="threadPage__attachment threadPage__attachment--chart">
        {title && (
          <OuiText size="xs" style={{ marginBottom: 8 }}>
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

// Attachment card: query (monospace code)
const QueryAttachment = ({ query, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some(
    (c) => c.type === 'query' && c.query === query
  );
  return (
    <div className="threadPage__attachmentWrap">
      <AddToCanvasButton
        added={added}
        onClick={() => onAddToCanvas({ type: 'query', query })}
      />
      <div className="threadPage__attachment">
        <code className="threadPage__attachmentQuery">{query}</code>
      </div>
    </div>
  );
};

// Renders a single assistant response (left-aligned, plain text + feedback)
const AssistantMessage = ({
  content,
  streaming,
  attachment,
  onAddToCanvas,
  canvasItems,
}) => (
  <div className="threadPage__message threadPage__message--assistant">
    <div className="threadPage__bubble threadPage__bubble--assistant">
      <OuiText size="s">{parseContent(content)}</OuiText>
      {!streaming && attachment && attachment.type === 'page' && (
        <PageAttachment
          title={attachment.title}
          description={attachment.description}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && attachment && attachment.type === 'query' && (
        <QueryAttachment
          query={attachment.query}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && attachment && attachment.type === 'link-preview' && (
        <LinkPreviewAttachment
          href={attachment.href}
          title={attachment.title}
          description={attachment.description}
          image={attachment.image}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && attachment && attachment.type === 'stats-display' && (
        <StatsDisplayAttachment
          title={attachment.title}
          stats={attachment.stats}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && attachment && attachment.type === 'data-table' && (
        <DataTableAttachment
          title={attachment.title}
          columns={attachment.columns}
          rows={attachment.rows}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && attachment && attachment.type === 'code-block' && (
        <CodeBlockAttachment
          title={attachment.title}
          language={attachment.language}
          code={attachment.code}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && attachment && attachment.type === 'chart' && (
        <ChartAttachment
          title={attachment.title}
          data={attachment.data}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && (
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
  </div>
);

// Mock task pairs for each response
const MOCK_TASKS = [
  ['Searching service logs', 'Analyzing error patterns'],
  ['Querying connection metrics', 'Evaluating pool utilization'],
  ['Correlating traffic data', 'Checking cache performance'],
  ['Fetching service health', 'Comparing baseline metrics'],
];

// Task list that runs before AI response
const TaskListMessage = ({ tasks, statuses, collapsed }) => {
  if (collapsed) {
    return (
      <div className="threadPage__message threadPage__message--assistant">
        <div className="threadPage__taskCollapsed">
          <div className="threadPage__taskIconWrap">
            <OuiIcon type="checkInCircleEmpty" size="m" color="success" />
          </div>
          <OuiText size="s">
            <span>{tasks.length} tasks finished</span>
          </OuiText>
        </div>
      </div>
    );
  }

  return (
    <div className="threadPage__message threadPage__message--assistant">
      <div className="threadPage__taskList">
        {tasks.map((task, i) => {
          if (i >= statuses.length) return null;
          return (
            <div key={i} className="threadPage__taskItem">
              <div className="threadPage__taskIconWrap">
                {statuses[i] === 'running' ? (
                  <OuiLoadingSpinner size="m" />
                ) : (
                  <OuiIcon type="checkInCircleEmpty" size="m" color="success" />
                )}
              </div>
              <OuiText size="s">
                <span>{task}</span>
              </OuiText>
            </div>
          );
        })}
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
      type: 'page',
      title: 'Service health overview dashboard',
      description:
        'Aggregated health metrics across all services including uptime, latency percentiles, and error trends.',
    },
  },
  {
    content:
      'Based on the available data, here is what I found.\n\n**Analysis**\n\n1. The connection pool utilization is at 87%, which is approaching the configured limit.\n2. Garbage collection pauses have increased by 40% compared to last week.\n3. The thread count on the primary nodes is elevated.\n\nConsider scaling horizontally or increasing the connection pool ceiling to provide headroom.',
    attachment: {
      type: 'query',
      query:
        'source=opensearch_dashboards_sample_data_logs | where pool_utilization > 80 | stats max(pool_utilization) by service',
    },
  },
  {
    content:
      'I ran a correlation analysis across the affected services.\n\n**Key Observations**\n\n- The spike aligns with a traffic surge from the EU region starting at 14:32 UTC.\n- Cache hit ratio dropped from 94% to 61% during the same window.\n- The CDN origin pull rate tripled, putting pressure on the backend.\n\nThis looks like a cache invalidation event combined with organic traffic growth. The system should stabilize once the cache warms back up.',
    attachment: {
      type: 'page',
      title: 'EU region traffic dashboard',
      description:
        'Traffic volume, cache hit ratios, and CDN origin pull rates for the EU region.',
    },
  },
  {
    content:
      'Here is a quick health check of the relevant services.\n\n**Service Status**\n\n- cart: Healthy, latency 4ms, throughput 52 req/s\n- checkout: Degraded, latency 380ms, error rate 12.3%\n- payment-service: Unhealthy, connection timeouts at 67%\n- frontend-proxy: Healthy, acting as passthrough\n\nThe payment-service is the bottleneck. I suggest checking its resource allocation and recent deployment history.',
    attachment: {
      type: 'query',
      query:
        'source=opensearch_dashboards_sample_data_logs | stats avg(latency) as avg_latency, avg(error_rate) as avg_errors by service | sort -avg_errors',
    },
  },
];

const NEW_THREAD = { title: 'New thread', messages: [] };

export const ThreadPage = ({
  selectedItem,
  _onItemSelect,
  pendingMessages,
  isPanelOpen,
  onTogglePanel,
  onPageChange,
}) => {
  const threadKey = selectedItem || 'latency-spike';
  const thread = THREADS[threadKey] || NEW_THREAD;
  const initialMessages = pendingMessages || thread.messages;
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeCanvasTab, setActiveCanvasTab] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isDragging = useRef(false);
  const feedRef = useRef(null);
  const responseIndex = useRef(0);

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

  const handleAddToCanvas = useCallback((item) => {
    setCanvasItems((prev) => {
      // Deduplicate by matching type + title/query/href/code
      const exists = prev.some(
        (existing) =>
          existing.type === item.type &&
          (item.type === 'page'
            ? existing.title === item.title
            : item.type === 'link-preview'
            ? existing.href === item.href
            : item.type === 'code-block'
            ? existing.code === item.code
            : item.type === 'stats-display' || item.type === 'data-table' || item.type === 'chart'
            ? existing.title === item.title
            : existing.query === item.query)
      );
      if (exists) return prev;
      return [...prev, item];
    });
    setIsCanvasOpen(true);
  }, []);

  // Reset messages and canvas when switching threads
  useEffect(() => {
    const msgs = pendingMessages || thread.messages;
    if (pendingMessages) {
      setMessages(pendingMessages);
    } else {
      setMessages(thread.messages);
    }
    setMessage('');
    setIsTyping(false);

    // Pre-populate canvas with all attachments from messages
    const items = [];
    msgs.forEach((msg) => {
      if (msg.attachment) {
        const a = msg.attachment;
        items.push(a);
      }
    });
    setCanvasItems(items);
    setActiveCanvasTab(0);
    setIsCanvasOpen(items.length > 0);
    streamTimers.current.forEach(clearTimeout);
    streamTimers.current = [];
  }, [threadKey, thread.messages, pendingMessages]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => streamTimers.current.forEach(clearTimeout);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;

    // Add user message
    const userMsg = { role: 'user', author: 'You', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    const idx = responseIndex.current % MOCK_RESPONSES.length;
    const mockResponse = MOCK_RESPONSES[idx];
    const tasks = MOCK_TASKS[idx % MOCK_TASKS.length];
    responseIndex.current += 1;
    const fullContent = mockResponse.content;
    const attachment = mockResponse.attachment;

    // Phase 1: Show task list with first task running
    const taskMsg = {
      role: 'tasks',
      tasks,
      statuses: ['running'],
      collapsed: false,
    };
    setMessages((prev) => [...prev, taskMsg]);

    // After 1.5s, first task finishes, second task appears running
    const t1 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0)
          updated[ti] = { ...updated[ti], statuses: ['done', 'running'] };
        return updated;
      });
    }, 1500);
    streamTimers.current.push(t1);

    // After 3s, second task finishes
    const t2 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0)
          updated[ti] = { ...updated[ti], statuses: ['done', 'done'] };
        return updated;
      });
    }, 3000);
    streamTimers.current.push(t2);

    // After 3.5s, collapse tasks and start streaming response
    const t3 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0) updated[ti] = { ...updated[ti], collapsed: true };
        return updated;
      });

      setIsTyping(false);

      // Split into words, preserving newlines as separate tokens
      const tokens = fullContent.split(/(\s+)/);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', streaming: true, attachment },
      ]);

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
            };
            return updated;
          });
        }, i * 30);
        streamTimers.current.push(timer);
      });
    }, 3500);
    streamTimers.current.push(t3);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Header — using DetailPageHeader with custom children */}
      <DetailPageHeader
        title={thread.title}
        isPanelOpen={isPanelOpen}
        onTogglePanel={onTogglePanel}
        firstActionIcon="dockedRight"
        firstActionLabel="Related Assets"
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
                    <OuiContextMenuItem key="skills" onClick={() => { setIsSettingsOpen(false); onPageChange && onPageChange('ai-skills'); }}>
                      Skills
                    </OuiContextMenuItem>,
                    <OuiContextMenuItem key="memories" onClick={() => { setIsSettingsOpen(false); onPageChange && onPageChange('ai-memories'); }}>
                      Memories
                    </OuiContextMenuItem>,
                    <OuiContextMenuItem key="automations" onClick={() => { setIsSettingsOpen(false); onPageChange && onPageChange('ai-automations'); }}>
                      Automations
                    </OuiContextMenuItem>,
                    <OuiContextMenuItem key="mcp" onClick={() => { setIsSettingsOpen(false); onPageChange && onPageChange('ai-mcp-servers'); }}>
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

      {/* Body: feed + optional canvas flyout */}
      <div className="threadPage__body">
        {/* Conversation column */}
        <div className="threadPage__conversationCol">
          {/* Conversation feed — scrollable */}
          <div className="threadPage__feed" ref={feedRef}>
            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return (
                  <UserMessage
                    key={i}
                    author={msg.author}
                    content={msg.content}
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
                  />
                );
              }
              return (
                <AssistantMessage
                  key={i}
                  content={msg.content}
                  streaming={msg.streaming}
                  attachment={msg.attachment}
                  onAddToCanvas={handleAddToCanvas}
                  canvasItems={canvasItems}
                />
              );
            })}
            {isTyping && null}
          </div>

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
                className="threadPage__textarea"
              />
              <div className="threadPage__inputActions">
                <OuiButtonIcon
                  iconType="plus"
                  aria-label="Add attachment"
                  size="s"
                  color="text"
                />
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
                  onClick={handleSend}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Canvas flyout (push panel) */}
        <div
          className={`threadPage__canvasFlyout${
            isCanvasOpen ? ' threadPage__canvasFlyout--open' : ''
          }${isCanvasDragging ? ' threadPage__canvasFlyout--dragging' : ''}`}
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
                    <OuiTab
                      key={i}
                      isSelected={activeCanvasTab === i}
                      onClick={() => setActiveCanvasTab(i)}>
                      {item.title || (item.type === 'query' ? 'Query' : `Asset ${i + 1}`)}
                    </OuiTab>
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
                  {(() => {
                    const item = canvasItems[activeCanvasTab];
                    if (!item) return null;
                    return (
                      <>
                        {item.type === 'page' && (
                          <OuiText size="s" color="subdued">
                            <p>{item.description || 'Dashboard view placeholder'}</p>
                          </OuiText>
                        )}
                        {item.type === 'link-preview' && (
                          <>
                            {item.image && (
                              <div className="threadPage__canvasDetailImage">
                                <img src={item.image} alt="" />
                              </div>
                            )}
                            <OuiText size="s">
                              {item.description && <p>{item.description}</p>}
                              <p>
                                <a href={item.href} target="_blank" rel="noopener noreferrer">
                                  {item.href}
                                </a>
                              </p>
                            </OuiText>
                          </>
                        )}
                        {item.type === 'stats-display' && (
                          <OuiFlexGroup gutterSize="l" wrap responsive={false}>
                            {item.stats.map((stat, i) => (
                              <OuiFlexItem key={i} grow={false}>
                                <OuiStat
                                  title={stat.value}
                                  description={stat.label}
                                  titleSize="s"
                                  titleColor={stat.color || 'default'}
                                />
                              </OuiFlexItem>
                            ))}
                          </OuiFlexGroup>
                        )}
                        {item.type === 'data-table' && (
                          <div className="threadPage__dataTableScroll">
                            <table className="threadPage__dataTable">
                              <thead>
                                <tr>
                                  {item.columns.map((col, ci) => (
                                    <th key={ci}>{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.rows.map((row, ri) => (
                                  <tr key={ri}>
                                    {row.map((cell, ci) => (
                                      <td key={ci}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {item.type === 'code-block' && (
                          <OuiCodeBlock language={item.language} fontSize="s" paddingSize="m" isCopyable>
                            {item.code}
                          </OuiCodeBlock>
                        )}
                        {item.type === 'chart' && (
                          <div className="threadPage__chartBars threadPage__chartBars--detail">
                            {item.data.map((d, di) => (
                              <div key={di} className="threadPage__chartBarCol">
                                <div
                                  className="threadPage__chartBar"
                                  style={{ height: `${(d.value / Math.max(...item.data.map((x) => x.value))) * 100}%` }}
                                  title={`${d.label}: ${d.value}`}
                                />
                                <span className="threadPage__chartBarLabel">{d.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.type === 'query' && (
                          <OuiCodeBlock fontSize="s" paddingSize="m" isCopyable>
                            {item.query}
                          </OuiCodeBlock>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </OuiFlyoutBody>
          </div>
        </div>
      </div>
    </div>
  );
};
