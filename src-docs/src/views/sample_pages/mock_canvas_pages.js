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

import React from 'react';
import {
  OuiBasicTable,
  OuiFlexGroup,
  OuiFlexItem,
  OuiHealth,
  OuiHorizontalRule,
  OuiIcon,
  OuiLink,
  OuiPanel,
  OuiSpacer,
  OuiStat,
  OuiText,
  OuiTitle,
} from '../../../../src/components';
import { LogsPageBody } from './logs_page';

// Two-column key-value row
const KVRow = ({ label, children }) => (
  <OuiFlexItem grow={false} style={{ width: '50%', marginBottom: 16 }}>
    <OuiText size="xs">
      <strong>{label}</strong>
    </OuiText>
    <OuiText size="s">
      {children}
    </OuiText>
  </OuiFlexItem>
);

// Alert detail page mock
export const AlertPageMock = () => (
  <div className="mockCanvasPage">
    <OuiFlexGroup wrap gutterSize="none">
      <KVRow label="Trigger name">
        <span>payment-p99-breach</span>
      </KVRow>
      <KVRow label="Severity">
        <span>1 (Highest)</span>
      </KVRow>
      <KVRow label="Trigger start time">
        <span>05/13/26 2:32 pm UTC</span>
      </KVRow>
      <KVRow label="Trigger last updated">
        <span>05/13/26 2:47 pm UTC</span>
      </KVRow>
      <KVRow label="Monitor">
        <OuiLink>payment-service-latency-monitor</OuiLink>
      </KVRow>
      <KVRow label="Monitor data sources">
        <span>opensearch_metrics_payment_service</span>
      </KVRow>
    </OuiFlexGroup>
    <OuiHorizontalRule margin="s" />
    <OuiFlexGroup wrap gutterSize="none">
      <KVRow label="Conditions">
        <span>params.p99_latency &gt; 2000</span>
      </KVRow>
      <KVRow label="Time range for the last">
        <span>15 minutes</span>
      </KVRow>
      <KVRow label="Filters">
        <span>service = payment-service</span>
      </KVRow>
      <KVRow label="Group by">
        <span>pod_name</span>
      </KVRow>
    </OuiFlexGroup>
  </div>
);

// Markdown note page mock — Inventory service dependency analysis
export const InventoryAnalysisPageMock = () => (
  <div className="mockCanvasPage">
    <OuiText size="s">
      <h4>Overview</h4>
      <p>
        The inventory service is a downstream dependency of the payment service.
        During the latency spike window (14:20–14:47 UTC), the following was observed:
      </p>
      <h4>Connection Pool</h4>
      <ul>
        <li>Pool size: 50 (configured max)</li>
        <li>Active connections: 49–50 (saturated)</li>
        <li>Acquire wait time: 1,200–2,400ms (normally &lt;5ms)</li>
        <li>No connection errors — requests queue instead of failing</li>
      </ul>
      <h4>Response Times</h4>
      <ul>
        <li>Inventory service P99: 42ms (healthy, no degradation)</li>
        <li>Payment→Inventory network latency: 3ms (stable)</li>
        <li>Bottleneck is entirely in connection acquire, not downstream response</li>
      </ul>
      <h4>Conclusion</h4>
      <p>
        The inventory service itself is healthy. The latency is introduced by the
        payment service waiting for a free connection from its exhausted outbound pool.
      </p>
    </OuiText>
  </div>
);

// Markdown note page mock — Payment service connection pool metrics
export const ConnectionPoolPageMock = () => (
  <div className="mockCanvasPage">
    <OuiText size="s">
      <h4>Current Status</h4>
      <ul>
        <li>Pool max connections: 50</li>
        <li>Active connections: 50/50 (100%)</li>
        <li>Idle connections: 0</li>
        <li>Pending acquires: 847 (queued)</li>
      </ul>
      <h4>Acquire Wait Time</h4>
      <ul>
        <li>P50: 920ms</li>
        <li>P95: 1,840ms</li>
        <li>P99: 2,320ms</li>
        <li>Baseline (normal): &lt;5ms</li>
      </ul>
      <h4>Timeline</h4>
      <ul>
        <li>14:00 UTC — Pool utilization crosses 80%</li>
        <li>14:15 UTC — Pool fully saturated (100%)</li>
        <li>14:20 UTC — Acquire wait time exceeds 500ms</li>
        <li>14:32 UTC — P99 latency alert triggered</li>
      </ul>
      <h4>Recommendation</h4>
      <p>
        Increase pool max from 50 to 150. Add acquire timeout of 3s to fail fast
        instead of queuing indefinitely. Enable circuit breaker to prevent cascade.
      </p>
    </OuiText>
  </div>
);

// Logs page mock — uses the real LogsPageBody component with payment service data
const PAYMENT_LOG_QUERY = 'source=opensearch_metrics_payment_service | where level="WARN" OR message LIKE "%timeout%" | sort -timestamp | head 25';

const PAYMENT_LOG_RESULTS = [
  { id: '1', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-xk2lp', FlightDelayMin: 1842 },
  { id: '2', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-mn4qr', FlightDelayMin: 2103 },
  { id: '3', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-xk2lp', FlightDelayMin: 1654 },
  { id: '4', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-ab8st', FlightDelayMin: 1920 },
  { id: '5', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-mn4qr', FlightDelayMin: 2340 },
  { id: '6', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-xk2lp', FlightDelayMin: 1780 },
  { id: '7', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-ab8st', FlightDelayMin: 1560 },
  { id: '8', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-mn4qr', FlightDelayMin: 2210 },
  { id: '9', FlightNum: 'INFO', Origin: 'request completed successfully', Dest: 'payment-7f8b9-xk2lp', FlightDelayMin: 45 },
  { id: '10', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-xk2lp', FlightDelayMin: 1890 },
  { id: '11', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-ab8st', FlightDelayMin: 1720 },
  { id: '12', FlightNum: 'DEBUG', Origin: 'pool checkout attempt', Dest: 'payment-7f8b9-mn4qr', FlightDelayMin: 3 },
  { id: '13', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-xk2lp', FlightDelayMin: 2050 },
  { id: '14', FlightNum: 'WARN', Origin: 'connection acquire timeout exceeded 1000ms', Dest: 'payment-7f8b9-mn4qr', FlightDelayMin: 1680 },
  { id: '15', FlightNum: 'INFO', Origin: 'request completed successfully', Dest: 'payment-7f8b9-ab8st', FlightDelayMin: 38 },
];

export const LogsPageMock = () => (
  <div className="mockCanvasPage mockCanvasPage--fullBody">
    <LogsPageBody
      queryText={PAYMENT_LOG_QUERY}
      results={PAYMENT_LOG_RESULTS}
      compact
    />
  </div>
);

// Dashboard mock — Payment service connection pool dashboard
export const DashboardPageMock = () => (
  <div className="mockCanvasPage mockCanvasPage--fullBody" style={{ padding: 12, overflow: 'auto' }}>
    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="98%"
            description="Pool utilization"
            titleColor="danger"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="1,840ms"
            description="Acquire wait (P95)"
            titleColor="danger"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="50/50"
            description="Active connections"
            titleColor="accent"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="OFF"
            description="Circuit breaker"
            titleColor="subdued"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem grow={2}>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs"><h3>Connection pool by pod</h3></OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              { pod: 'payment-7f8b9-xk2lp', active: '50/50', waiting: 312, acquireP99: '2,320ms', status: 'danger' },
              { pod: 'payment-7f8b9-mn4qr', active: '50/50', waiting: 287, acquireP99: '2,180ms', status: 'danger' },
              { pod: 'payment-7f8b9-ab8st', active: '50/50', waiting: 248, acquireP99: '1,940ms', status: 'danger' },
              { pod: 'payment-7f8b9-jd7wp', active: '42/50', waiting: 0, acquireP99: '12ms', status: 'healthy' },
            ]}
            columns={[
              { field: 'pod', name: 'Pod' },
              { field: 'active', name: 'Active' },
              { field: 'waiting', name: 'Waiting' },
              { field: 'acquireP99', name: 'Acquire P99' },
              {
                field: 'status',
                name: 'Status',
                render: (status) => (
                  <OuiHealth color={status === 'healthy' ? 'success' : 'danger'}>
                    {status === 'healthy' ? 'healthy' : 'saturated'}
                  </OuiHealth>
                ),
              },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem grow={1}>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs"><h3>Recent events</h3></OuiTitle>
          <OuiSpacer size="s" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <OuiIcon type="alert" color="danger" size="s" />
              <div>
                <OuiText size="xs"><strong>Pool saturated</strong></OuiText>
                <OuiText size="xs" color="subdued">3 of 4 pods · 15 min ago</OuiText>
              </div>
            </div>
            <OuiHorizontalRule margin="xs" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <OuiIcon type="alert" color="warning" size="s" />
              <div>
                <OuiText size="xs"><strong>Acquire wait &gt; 1s</strong></OuiText>
                <OuiText size="xs" color="subdued">payment-7f8b9-xk2lp · 20 min ago</OuiText>
              </div>
            </div>
            <OuiHorizontalRule margin="xs" />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <OuiIcon type="alert" color="warning" size="s" />
              <div>
                <OuiText size="xs"><strong>Pool utilization &gt; 80%</strong></OuiText>
                <OuiText size="xs" color="subdued">All pods · 32 min ago</OuiText>
              </div>
            </div>
          </div>
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
      <OuiTitle size="xs"><h3>P99 latency timeline</h3></OuiTitle>
      <OuiSpacer size="s" />
      <OuiBasicTable
        items={[
          { time: '14:00', latency: '120ms', pool: '72%', waiting: 0 },
          { time: '14:10', latency: '180ms', pool: '85%', waiting: 12 },
          { time: '14:20', latency: '520ms', pool: '94%', waiting: 89 },
          { time: '14:30', latency: '1,840ms', pool: '100%', waiting: 312 },
          { time: '14:40', latency: '2,320ms', pool: '100%', waiting: 847 },
          { time: '14:47', latency: '2,410ms', pool: '100%', waiting: 891 },
        ]}
        columns={[
          { field: 'time', name: 'Time (UTC)' },
          { field: 'latency', name: 'P99 Latency' },
          { field: 'pool', name: 'Pool Util.' },
          { field: 'waiting', name: 'Queued Requests' },
        ]}
        compressed
      />
    </OuiPanel>
  </div>
);
