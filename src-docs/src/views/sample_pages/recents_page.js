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

import React, { useState } from 'react';

import {
  OuiFlexGroup,
  OuiFlexItem,
  OuiSpacer,
  OuiTitle,
  OuiText,
  OuiButton,
  OuiFieldSearch,
  OuiHealth,
} from '../../../../src/components';

const RECENT_THREADS = [
  {
    title: 'Auto-scaling triggered for Catalog service - 3 new instances',
    tags: ['test-domain', 'os688a'],
    timeAgo: '2h 24m ago',
    timestamp: 'May 8, 2026 @ 08:03:04',
    color: '#7dd3fc',
  },
  {
    title: 'Kubernetes pod restart detected for auth-proxy in us-east-1',
    tags: ['otel-domain', 'os219'],
    timeAgo: '3h ago',
    timestamp: 'May 8, 2026 @ 07:27:04',
    color: '#10B981',
  },
  {
    title: 'Memory leak pattern detected in NotificationWorker - steady 2% growth per hour',
    tags: ['os-domain', 'dd76-x5'],
    timeAgo: '3h 20m ago',
    timestamp: 'May 8, 2026 @ 07:07:04',
    color: '#FF6467',
  },
  {
    title: 'SSL certificate renewed for api.prod.internal - expires in 90 days',
    tags: ['test-domain'],
    timeAgo: '4h ago',
    timestamp: 'May 8, 2026 @ 06:27:04',
    color: '#10B981',
  },
  {
    title: 'Cache hit ratio dropped below 70% on Redis cluster-3 - possible key eviction storm',
    tags: ['os233', 'os688a'],
    timeAgo: '4h 50m ago',
    timestamp: 'May 8, 2026 @ 05:37:04',
    color: '#FBBF24',
  },
  {
    title: 'Scale-down event for SearchIndexer - 2 instances terminated',
    tags: ['os-domain', 'os219'],
    timeAgo: '5h 20m ago',
    timestamp: 'May 8, 2026 @ 05:07:04',
    color: '#7dd3fc',
  },
  {
    title: 'Database failover completed for orders-db-primary to replica-2',
    tags: ['otel-domain', 'dd76-x5'],
    timeAgo: '6h ago',
    timestamp: 'May 8, 2026 @ 04:27:04',
    color: '#10B981',
  },
  {
    title: 'Latency p99 for GraphQL gateway exceeds 800ms - correlated with upstream inventory-svc',
    tags: ['os219', 'os233'],
    timeAgo: '6h 40m ago',
    timestamp: 'May 8, 2026 @ 03:47:04',
    color: '#FBBF24',
  },
  {
    title: 'Config change pushed to feature-flags service - 12 flags updated',
    tags: ['test-domain'],
    timeAgo: '7h 30m ago',
    timestamp: 'May 8, 2026 @ 02:57:04',
    color: '#7dd3fc',
  },
  {
    title: 'Disk I/O saturation on logging-node-7 - write queue depth at 94%',
    tags: ['os-domain', 'os688a'],
    timeAgo: '8h 20m ago',
    timestamp: 'May 8, 2026 @ 02:07:04',
    color: '#FF6467',
  },
  {
    title: 'Canary deployment started for CheckoutService v3.1.0 - 5% traffic routed',
    tags: ['otel-domain', 'os219'],
    timeAgo: '9h ago',
    timestamp: 'May 8, 2026 @ 01:27:04',
    color: '#10B981',
  },
  {
    title: 'Spot instance reclaimed for batch-processor-pool - replacement provisioning',
    tags: ['test-domain', 'dd76-x5'],
    timeAgo: '10h ago',
    timestamp: 'May 8, 2026 @ 00:27:04',
    color: '#7dd3fc',
  },
  {
    title: 'DNS resolution failures spiking for partner-api.external.io - 15% error rate',
    tags: ['otel-domain', 'os233'],
    timeAgo: '11h ago',
    timestamp: 'May 7, 2026 @ 23:27:04',
    color: '#FBBF24',
  },
  {
    title: 'Scheduled maintenance window opened for RDS cluster aurora-prod-1',
    tags: ['os-domain'],
    timeAgo: '12h ago',
    timestamp: 'May 7, 2026 @ 22:27:04',
    color: '#7dd3fc',
  },
  {
    title: 'Thread pool exhaustion risk on EmailDispatcher - active threads at 92% capacity',
    tags: ['otel-domain', 'os219', 'os688a'],
    timeAgo: '13h ago',
    timestamp: 'May 7, 2026 @ 21:27:04',
    color: '#FBBF24',
  },
  {
    title: 'WAF rule triggered - blocked 340 requests matching SQL injection pattern',
    tags: ['test-domain', 'dd76-x5'],
    timeAgo: '14h ago',
    timestamp: 'May 7, 2026 @ 20:27:04',
    color: '#FF6467',
  },
  {
    title: 'Horizontal pod autoscaler activated for recommendation-engine - target CPU 78%',
    tags: ['otel-domain', 'os233'],
    timeAgo: '15h ago',
    timestamp: 'May 7, 2026 @ 19:27:04',
    color: '#7dd3fc',
  },
  {
    title: 'Circuit breaker opened on InventoryService → WarehouseAPI dependency',
    tags: ['os-domain', 'os219'],
    timeAgo: '16h ago',
    timestamp: 'May 7, 2026 @ 18:27:04',
    color: '#10B981',
  },
  {
    title: 'Garbage collection pause times increasing on JVM service analytics-aggregator',
    tags: ['otel-domain', 'dd76-x5', 'os688a'],
    timeAgo: '17h ago',
    timestamp: 'May 7, 2026 @ 17:27:04',
    color: '#FBBF24',
  },
  {
    title: 'Blue-green swap completed for UserProfileService - green now active',
    tags: ['test-domain', 'os219'],
    timeAgo: '18h ago',
    timestamp: 'May 7, 2026 @ 16:27:04',
    color: '#10B981',
  },
  {
    title: 'Network throughput anomaly on VPC peering link vpc-0a3f → vpc-7b2e',
    tags: ['otel-domain', 'os233', 'dd76-x5'],
    timeAgo: '19h ago',
    timestamp: 'May 7, 2026 @ 15:27:04',
    color: '#FBBF24',
  },
];

export const RecentsPage = ({ onPageChange }) => {
  const [search, setSearch] = useState('');

  const filtered = RECENT_THREADS.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      <style>{`
        .recentsRow {
          padding: 16px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 150ms ease, transform 150ms ease;
        }
        .recentsRow:hover {
          background: rgba(128, 128, 128, 0.06);
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ flexShrink: 0, paddingTop: 32, paddingBottom: 16 }}>
        <OuiFlexGroup alignItems="center" justifyContent="spaceBetween">
          <OuiFlexItem grow={false}>
            <OuiTitle size="m">
              <h1>Threads</h1>
            </OuiTitle>
          </OuiFlexItem>
          <OuiFlexItem grow={false}>
            <OuiButton fill iconType="plus" size="s" onClick={() => onPageChange('threads')}>
              New Thread
            </OuiButton>
          </OuiFlexItem>
        </OuiFlexGroup>

        <OuiSpacer size="l" />

        <OuiFieldSearch
          placeholder="Filter threads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </div>

      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        width: '100%',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)',
      }}>
        {filtered.map((thread, i) => (
          <div key={i} className="recentsRow">
            <OuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
              <OuiFlexItem grow={false}>
                <OuiHealth color={thread.color} />
              </OuiFlexItem>
              <OuiFlexItem>
                <OuiText size="s">
                  <strong>{thread.title}</strong>
                </OuiText>
                <OuiText size="xs" color="subdued">
                  {thread.tags.join(' | ')}
                </OuiText>
              </OuiFlexItem>
              <OuiFlexItem grow={false} style={{ textAlign: 'right', minWidth: 200 }}>
                <OuiText size="xs" color="subdued">
                  {thread.timeAgo}
                </OuiText>
                <OuiText size="xs" color="subdued">
                  {thread.timestamp}
                </OuiText>
              </OuiFlexItem>
            </OuiFlexGroup>
          </div>
        ))}
      </div>
    </div>
  );
};
