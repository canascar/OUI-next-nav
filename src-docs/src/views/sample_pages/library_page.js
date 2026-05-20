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
  OuiCompressedFieldSearch,
  OuiIcon,
  OuiTitle,
} from '../../../../src/components';

/**
 * All saved/mocked objects with their type for filtering.
 */
const LIBRARY_OBJECTS = [
  // Dashboards
  { key: 'system-overview', title: 'System overview', type: 'dashboard', icon: 'navDashboards', subtitle: 'Updated 5 min ago', pageKey: 'dashboards' },
  { key: 'web-traffic', title: 'Web traffic analytics', type: 'dashboard', icon: 'navDashboards', subtitle: 'Updated 15 min ago', pageKey: 'dashboards' },
  { key: 'api-performance', title: 'API performance', type: 'dashboard', icon: 'navDashboards', subtitle: 'Updated 30 min ago', pageKey: 'dashboards' },
  { key: 'payment-pool-dashboard', title: 'Payment service — connection pool', type: 'dashboard', icon: 'navDashboards', subtitle: 'Created from thread · just now', pageKey: 'dashboards' },
  // Logs (saved results)
  { key: 'error-rate', title: 'Error rate by service', type: 'log', icon: 'navDiscover', subtitle: 'source=logs | where level="ERROR"', pageKey: 'logs' },
  { key: 'auth-failures', title: 'Auth failure events', type: 'log', icon: 'navDiscover', subtitle: 'source=logs | where event="auth_fail"', pageKey: 'logs' },
  { key: 'slow-queries', title: 'Slow query log', type: 'log', icon: 'navDiscover', subtitle: 'source=logs | where duration > 5000', pageKey: 'logs' },
  { key: 'payment-timeout-logs', title: 'Payment service timeout logs', type: 'log', icon: 'navDiscover', subtitle: 'source=payment | where level="WARN"', pageKey: 'logs' },
  { key: 'connection-timeout-errors', title: 'Connection timeout errors', type: 'log', icon: 'navDiscover', subtitle: 'source=logs | where severity="ERROR"', pageKey: 'logs' },
  // Logs (saved queries)
  { key: 'query-latency-by-host', title: 'Latency by host', type: 'query', icon: 'search', subtitle: 'source=logs | stats avg(latency) by host', pageKey: 'discover-log' },
  { key: 'query-5xx-responses', title: '5xx responses', type: 'query', icon: 'search', subtitle: 'source=logs | where status >= 500 | stats count() by path', pageKey: 'discover-log' },
  { key: 'query-top-users', title: 'Top users by request count', type: 'query', icon: 'search', subtitle: 'source=logs | stats count() as requests by user', pageKey: 'discover-log' },
  // Metrics (saved results)
  { key: 'throughput', title: 'Throughput over time', type: 'metric', icon: 'visArea', subtitle: 'source=metrics | stats avg(throughput)', pageKey: 'metrics' },
  { key: 'cpu-utilization', title: 'CPU utilization', type: 'metric', icon: 'visArea', subtitle: 'source=metrics | stats avg(cpu) by host', pageKey: 'metrics' },
  { key: 'memory-pressure', title: 'Memory pressure', type: 'metric', icon: 'visArea', subtitle: 'source=metrics | stats max(mem_used)', pageKey: 'metrics' },
  // Metrics (saved queries)
  { key: 'query-disk-io', title: 'Disk I/O by volume', type: 'query', icon: 'search', subtitle: 'source=metrics | stats avg(disk_io) by volume', pageKey: 'discover-metric' },
  { key: 'query-network-errors', title: 'Network error rate', type: 'query', icon: 'search', subtitle: 'source=metrics | where net_errors > 0', pageKey: 'discover-metric' },
  { key: 'query-gc-pauses', title: 'GC pause duration', type: 'query', icon: 'search', subtitle: 'source=metrics | stats max(gc_pause_ms) by service', pageKey: 'discover-metric' },
];

const TABS = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'dashboard', label: 'Dashboards', icon: 'navDashboards' },
  { id: 'log', label: 'Logs', icon: 'navDiscover' },
  { id: 'metric', label: 'Metrics', icon: 'visArea' },
  { id: 'query', label: 'Queries', icon: 'search' },
];

/**
 * LibraryPage — Lists all saved/mocked objects with search and type filter tabs.
 *
 * @param {Object} props
 * @param {(pageKey: string, title: string) => void} props.onSelectPage - Opens a page
 */
export const LibraryPage = ({ onSelectPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = LIBRARY_OBJECTS.filter((item) => {
    const matchesSearch = !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="libraryPage">
      <div className="libraryPage__content">
        <div className="libraryPage__header">
          <OuiTitle size="s">
            <h2>Library</h2>
          </OuiTitle>
        </div>

        <div className="libraryPage__search">
          <OuiCompressedFieldSearch
            placeholder="Search objects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            aria-label="Search objects"
          />
        </div>

        <div className="libraryPage__tabs">
          <div className="emptySessionPage__chips">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`emptySessionPage__chip${activeTab === tab.id ? ' emptySessionPage__chip--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <OuiIcon type={tab.icon} size="m" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="libraryPage__items">
          {filteredItems.length === 0 ? (
            <p className="libraryPage__empty">No objects match your search.</p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.key}
                className="emptySessionPage__listItem"
                onClick={() => onSelectPage(item.pageKey, item.title)}>
                <span className="emptySessionPage__listItemContent">
                  <span className="emptySessionPage__listItemTitle">{item.title}</span>
                  <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
