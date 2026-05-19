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

import React, { useState, useContext } from 'react';

import {
  OuiFlexGroup,
  OuiFlexItem,
  OuiSpacer,
  OuiTitle,
  OuiButton,
  OuiFieldSearch,
  OuiThreadList,
} from '../../../../src/components';
import { ThemeContext } from '../../components/with_theme';

const RECENT_THREADS = [
  {
    title: 'Auto-scaling triggered for Catalog service - 3 new instances',
    description: 'test-domain | os688a',
    meta: '2h 24m ago',
    metaSecondary: 'May 8, 2026 @ 08:03:04',
    statusColor: '#7dd3fc',
  },
  {
    title: 'Kubernetes pod restart detected for auth-proxy in us-east-1',
    description: 'otel-domain | os219',
    meta: '3h ago',
    metaSecondary: 'May 8, 2026 @ 07:27:04',
    statusColor: '#10B981',
  },
  {
    title: 'Memory leak pattern detected in NotificationWorker - steady 2% growth per hour',
    description: 'os-domain | dd76-x5',
    meta: '3h 20m ago',
    metaSecondary: 'May 8, 2026 @ 07:07:04',
    statusColor: '#FF6467',
  },
  {
    title: 'SSL certificate renewed for api.prod.internal - expires in 90 days',
    description: 'test-domain',
    meta: '4h ago',
    metaSecondary: 'May 8, 2026 @ 06:27:04',
    statusColor: '#10B981',
  },
  {
    title: 'Cache hit ratio dropped below 70% on Redis cluster-3 - possible key eviction storm',
    description: 'os233 | os688a',
    meta: '4h 50m ago',
    metaSecondary: 'May 8, 2026 @ 05:37:04',
    statusColor: '#FBBF24',
  },
  {
    title: 'Scale-down event for SearchIndexer - 2 instances terminated',
    description: 'os-domain | os219',
    meta: '5h 20m ago',
    metaSecondary: 'May 8, 2026 @ 05:07:04',
    statusColor: '#7dd3fc',
  },
  {
    title: 'Database failover completed for orders-db-primary to replica-2',
    description: 'otel-domain | dd76-x5',
    meta: '6h ago',
    metaSecondary: 'May 8, 2026 @ 04:27:04',
    statusColor: '#10B981',
  },
  {
    title: 'Latency p99 for GraphQL gateway exceeds 800ms - correlated with upstream inventory-svc',
    description: 'os219 | os233',
    meta: '6h 40m ago',
    metaSecondary: 'May 8, 2026 @ 03:47:04',
    statusColor: '#FBBF24',
  },
  {
    title: 'Config change pushed to feature-flags service - 12 flags updated',
    description: 'test-domain',
    meta: '7h 30m ago',
    metaSecondary: 'May 8, 2026 @ 02:57:04',
    statusColor: '#7dd3fc',
  },
  {
    title: 'Disk I/O saturation on logging-node-7 - write queue depth at 94%',
    description: 'os-domain | os688a',
    meta: '8h 20m ago',
    metaSecondary: 'May 8, 2026 @ 02:07:04',
    statusColor: '#FF6467',
  },
  {
    title: 'Canary deployment started for CheckoutService v3.1.0 - 5% traffic routed',
    description: 'otel-domain | os219',
    meta: '9h ago',
    metaSecondary: 'May 8, 2026 @ 01:27:04',
    statusColor: '#10B981',
  },
  {
    title: 'Spot instance reclaimed for batch-processor-pool - replacement provisioning',
    description: 'test-domain | dd76-x5',
    meta: '10h ago',
    metaSecondary: 'May 8, 2026 @ 00:27:04',
    statusColor: '#7dd3fc',
  },
  {
    title: 'DNS resolution failures spiking for partner-api.external.io - 15% error rate',
    description: 'otel-domain | os233',
    meta: '11h ago',
    metaSecondary: 'May 7, 2026 @ 23:27:04',
    statusColor: '#FBBF24',
  },
  {
    title: 'Scheduled maintenance window opened for RDS cluster aurora-prod-1',
    description: 'os-domain',
    meta: '12h ago',
    metaSecondary: 'May 7, 2026 @ 22:27:04',
    statusColor: '#7dd3fc',
  },
  {
    title: 'Thread pool exhaustion risk on EmailDispatcher - active threads at 92% capacity',
    description: 'otel-domain | os219 | os688a',
    meta: '13h ago',
    metaSecondary: 'May 7, 2026 @ 21:27:04',
    statusColor: '#FBBF24',
  },
  {
    title: 'WAF rule triggered - blocked 340 requests matching SQL injection pattern',
    description: 'test-domain | dd76-x5',
    meta: '14h ago',
    metaSecondary: 'May 7, 2026 @ 20:27:04',
    statusColor: '#FF6467',
  },
  {
    title: 'Horizontal pod autoscaler activated for recommendation-engine - target CPU 78%',
    description: 'otel-domain | os233',
    meta: '15h ago',
    metaSecondary: 'May 7, 2026 @ 19:27:04',
    statusColor: '#7dd3fc',
  },
  {
    title: 'Circuit breaker opened on InventoryService → WarehouseAPI dependency',
    description: 'os-domain | os219',
    meta: '16h ago',
    metaSecondary: 'May 7, 2026 @ 18:27:04',
    statusColor: '#10B981',
  },
  {
    title: 'Garbage collection pause times increasing on JVM service analytics-aggregator',
    description: 'otel-domain | dd76-x5 | os688a',
    meta: '17h ago',
    metaSecondary: 'May 7, 2026 @ 17:27:04',
    statusColor: '#FBBF24',
  },
  {
    title: 'Blue-green swap completed for UserProfileService - green now active',
    description: 'test-domain | os219',
    meta: '18h ago',
    metaSecondary: 'May 7, 2026 @ 16:27:04',
    statusColor: '#10B981',
  },
  {
    title: 'Network throughput anomaly on VPC peering link vpc-0a3f → vpc-7b2e',
    description: 'otel-domain | os233 | dd76-x5',
    meta: '19h ago',
    metaSecondary: 'May 7, 2026 @ 15:27:04',
    statusColor: '#FBBF24',
  },
];

export const RecentsPage = ({ onPageChange }) => {
  const [search, setSearch] = useState('');
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  
  // Background color matching the parent container
  const bgColor = isDark ? '#060D1A' : '#F4F6FB';

  // Shadow color based on theme - same as background but darker
  const shadowColor = isDark ? 'rgba(6, 13, 26, 0.9)' : 'rgba(244, 246, 251, 0.9)';

  const filtered = RECENT_THREADS.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  // Add onClick handlers to filtered items
  const threadItems = filtered.map((thread) => ({
    ...thread,
    onClick: () => onPageChange && onPageChange('thread'),
  }));

  return (
    <div style={{ minHeight: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      <style>{`
        .recentsPageHeader {
          position: sticky;
          top: 0;
          z-index: 10;
          padding-top: 40px;
          margin-left: -24px;
          margin-right: -24px;
          padding-left: 24px;
          padding-right: 24px;
        }
      `}</style>

      {/* Sticky header */}
      <div className="recentsPageHeader" style={{ backgroundColor: bgColor, boxShadow: `0 16px 40px ${shadowColor}` }}>
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

      {/* Scrollable content */}
      <div style={{ paddingTop: 24, paddingBottom: 24 }}>
        <OuiThreadList items={threadItems} flush />
      </div>
    </div>
  );
};
