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

import React, { useState, useRef, useCallback, useEffect } from 'react';

import {
  OuiCompressedFieldSearch,
  OuiFieldSearch,
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
  // Alerts
  { key: 'alert-cpu', title: 'CPU threshold exceeded', type: 'alert', icon: 'navAlerting', subtitle: 'Critical · 10 min ago', pageKey: 'alerts' },
  { key: 'alert-disk', title: 'Disk usage warning', type: 'alert', icon: 'navAlerting', subtitle: 'Warning · 1 hour ago', pageKey: 'alerts' },
  { key: 'alert-error-rate', title: 'Error rate spike', type: 'alert', icon: 'navAlerting', subtitle: 'Critical · 3 hours ago', pageKey: 'alerts' },
  { key: 'alert-p99', title: 'Payment service P99 latency breach', type: 'alert', icon: 'navAlerting', subtitle: 'Critical · 15 min ago', pageKey: 'alerts' },
  // Notebooks
  { key: 'notebook-inventory', title: 'Inventory service dependency map', type: 'notebook', icon: 'document', subtitle: 'Updated 2 hours ago', pageKey: 'notebooks' },
  { key: 'notebook-capacity', title: 'Weekly capacity report', type: 'notebook', icon: 'document', subtitle: 'Updated 1 day ago', pageKey: 'notebooks' },
  { key: 'notebook-rollback', title: 'Deployment rollback runbook', type: 'notebook', icon: 'document', subtitle: 'Updated 3 days ago', pageKey: 'notebooks' },
];

const TABS = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'dashboard', label: 'Dashboards', icon: 'navDashboards' },
  { id: 'query', label: 'Saved queries', icon: 'search' },
  { id: 'log', label: 'Saved logs', icon: 'navDiscover' },
  { id: 'metric', label: 'Saved metrics', icon: 'visArea' },
  { id: 'alert', label: 'Alerts', icon: 'navAlerting' },
  { id: 'notebook', label: 'Notebooks', icon: 'document' },
];

/**
 * LibraryPage — Lists all saved/mocked objects with search and type filter tabs.
 *
 * @param {Object} props
 * @param {(pageKey: string, title: string) => void} props.onSelectPage - Opens a page
 */
export const LibraryPage = ({ onSelectPage, defaultTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab || 'all');
  const listRef = useRef(null);
  const pageRef = useRef(null);
  const chipsRef = useRef(null);

  // Detect overflow on filter chips and set data-fade attribute
  useEffect(() => {
    const chips = chipsRef.current;
    if (!chips) return;

    const updateFade = () => {
      const { scrollLeft, scrollWidth, clientWidth } = chips;
      const hasOverflow = scrollWidth > clientWidth;
      if (!hasOverflow) {
        chips.removeAttribute('data-fade');
        return;
      }
      const atStart = scrollLeft <= 1;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
      if (atStart && atEnd) chips.removeAttribute('data-fade');
      else if (atStart) chips.setAttribute('data-fade', 'right');
      else if (atEnd) chips.setAttribute('data-fade', 'left');
      else chips.setAttribute('data-fade', 'both');
    };

    updateFade();
    chips.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
    return () => {
      chips.removeEventListener('scroll', updateFade);
      window.removeEventListener('resize', updateFade);
    };
  }, [activeTab]);

  // Fade items that are within 175px of the top of the scroll container
  useEffect(() => {
    const container = pageRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!listRef.current) return;
      const scrolled = container.scrollTop > 0;
      if (!scrolled) {
        // Reset all items to full opacity when not scrolled
        listRef.current.querySelectorAll('.emptySessionPage__listItem').forEach((el) => {
          el.style.opacity = '';
        });
        return;
      }

      const CUTOFF = 160; // items at or above this viewport Y are fully hidden
      const FADE_ZONE = 50; // items fade in over this distance below the cutoff

      listRef.current.querySelectorAll('.emptySessionPage__listItem').forEach((el) => {
        const itemRect = el.getBoundingClientRect();
        const itemTop = itemRect.top;

        if (itemTop + itemRect.height <= CUTOFF) {
          // Entire item is above cutoff — fully hidden
          el.style.opacity = '0';
        } else if (itemTop < CUTOFF + FADE_ZONE) {
          // Item is in the fade zone — interpolate
          const progress = (itemTop - CUTOFF) / FADE_ZONE;
          el.style.opacity = String(Math.max(0, Math.min(1, progress)));
        } else {
          el.style.opacity = '';
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleItemHover = useCallback((hoveredIndex) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.emptySessionPage__listItem');
    items.forEach((el, i) => {
      const distance = Math.abs(i - hoveredIndex);
      let scale = 1;
      if (distance === 0) scale = 1.03;
      else if (distance === 1) scale = 1.015;
      else if (distance === 2) scale = 1.005;
      else scale = 1;
      el.style.transform = `scale(${scale})`;
    });
  }, []);

  const handleItemMouseDown = useCallback((pressedIndex) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.emptySessionPage__listItem');
    items.forEach((el, i) => {
      const distance = Math.abs(i - pressedIndex);
      let scale = 1;
      if (distance === 0) scale = 0.97;
      else if (distance === 1) scale = 0.985;
      else if (distance === 2) scale = 0.995;
      else scale = 1;
      el.style.transform = `scale(${scale})`;
    });
  }, []);

  const handleItemMouseUp = useCallback((hoveredIndex) => {
    handleItemHover(hoveredIndex);
  }, [handleItemHover]);

  const filteredItems = LIBRARY_OBJECTS.filter((item) => {
    const matchesSearch = !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="libraryPage" ref={pageRef}>
      {/* Fixed header: title, search, filters */}
      <div className="libraryPage__headerFixed">
        <div className="libraryPage__headerInner">
          <div className="libraryPage__header">
            <OuiTitle size="s">
              <h2>Library</h2>
            </OuiTitle>
          </div>

          <div className="libraryPage__search">
            <OuiFieldSearch
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              aria-label="Search assets"
            />
          </div>

          <div className="libraryPage__tabs">
            <div className="emptySessionPage__chips" ref={chipsRef}>
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
        </div>
      </div>

      {/* Scrollable content */}
      <div className="libraryPage__content">
        <div
          className="libraryPage__items"
          onMouseLeave={() => {
            if (listRef.current) {
              listRef.current.querySelectorAll('.emptySessionPage__listItem').forEach((el) => {
                el.style.transform = '';
              });
            }
          }}
          ref={listRef}>
          {filteredItems.length === 0 ? (
            <p className="libraryPage__empty">No objects match your search.</p>
          ) : (
            filteredItems.map((item, index) => (
              <button
                key={item.key}
                className="emptySessionPage__listItem"
                onClick={() => onSelectPage(item.pageKey, item.title)}
                onMouseEnter={() => handleItemHover(index)}
                onMouseDown={() => handleItemMouseDown(index)}
                onMouseUp={() => handleItemMouseUp(index)}>
                <span className="emptySessionPage__listItemContent">
                  <span className="emptySessionPage__listItemTitle">{item.title}</span>
                  <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
                </span>
                {activeTab === 'all' && (
                  <span className="emptySessionPage__listItemRight">
                    <OuiIcon type={item.icon} size="m" color="subdued" />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
