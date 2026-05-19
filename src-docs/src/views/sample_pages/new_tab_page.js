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

import React, { useState, useMemo } from 'react';
import {
  OuiCompressedFieldSearch,
  OuiHorizontalRule,
  OuiIcon,
} from '../../../../src/components';
import { SOURCE_PAGE_MOCK } from './session_models';

/**
 * Quick access items for the new tab page (no "New chat").
 */
const TAB_QUICK_ACCESS = [
  { key: 'discover-log', label: 'Discover (log)', icon: 'navDiscover', pageKey: 'discover-log' },
  { key: 'discover-metric', label: 'Discover (Metric)', icon: 'visArea', pageKey: 'discover-metric' },
  { key: 'app-map', label: 'Application Map', icon: 'navServiceMap', pageKey: 'app-map' },
  { key: 'app-traces', label: 'Application Traces', icon: 'apmTrace', pageKey: 'app-traces' },
  { key: 'app-services', label: 'Application Services', icon: 'navDashboards', pageKey: 'app-services' },
  { key: 'more', label: 'More', icon: 'apps', pageKey: null },
];

/**
 * Filter chips for the new tab page.
 */
const TAB_FILTER_CHIPS = [
  { key: 'favorites', label: 'Favorites', icon: 'starEmpty' },
  { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards' },
  { key: 'saved-logs', label: 'Saved logs', icon: 'navDiscover' },
  { key: 'saved-metric', label: 'Saved metric', icon: 'visArea' },
  { key: 'alerts', label: 'Alerts', icon: 'navAlerting' },
];

/**
 * Mock data for each chip.
 */
const TAB_CHIP_DATA = {
  favorites: [
    { key: 'fav-1', title: 'System overview', subtitle: 'Dashboard', pageKey: 'dashboards' },
    { key: 'fav-2', title: 'Error rate by service', subtitle: 'Saved log', pageKey: 'logs' },
    { key: 'fav-3', title: 'CPU utilization', subtitle: 'Saved metric', pageKey: 'metrics' },
  ],
  dashboards: [
    { key: 'dash-1', title: 'System overview', subtitle: 'Updated 5 min ago', pageKey: 'dashboards' },
    { key: 'dash-2', title: 'Web traffic analytics', subtitle: 'Updated 15 min ago', pageKey: 'dashboards' },
    { key: 'dash-3', title: 'API performance', subtitle: 'Updated 30 min ago', pageKey: 'dashboards' },
  ],
  'saved-logs': [
    { key: 'log-1', title: 'Error rate by service', subtitle: 'source=logs | where level="ERROR"', pageKey: 'logs' },
    { key: 'log-2', title: 'Auth failure events', subtitle: 'source=logs | where event="auth_fail"', pageKey: 'logs' },
    { key: 'log-3', title: 'Slow query log', subtitle: 'source=logs | where duration > 5000', pageKey: 'logs' },
  ],
  'saved-metric': [
    { key: 'met-1', title: 'Throughput over time', subtitle: 'source=metrics | stats avg(throughput)', pageKey: 'metrics' },
    { key: 'met-2', title: 'CPU utilization', subtitle: 'source=metrics | stats avg(cpu) by host', pageKey: 'metrics' },
  ],
  alerts: [
    { key: 'alert-1', title: 'CPU threshold exceeded', subtitle: 'Critical · 10 min ago', pageKey: 'alerts' },
    { key: 'alert-2', title: 'Disk usage warning', subtitle: 'Warning · 1 hour ago', pageKey: 'alerts' },
  ],
};

export const NewTabPage = ({ onSelectPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('favorites');

  // Build searchable items
  const allItems = useMemo(() => {
    const items = [];
    Object.entries(TAB_CHIP_DATA).forEach(([, categoryItems]) => {
      categoryItems.forEach((item) => items.push(item));
    });
    Object.entries(SOURCE_PAGE_MOCK).forEach(([pageKey, { title }]) => {
      items.push({ key: `page-${pageKey}`, title, subtitle: 'Page', pageKey });
    });
    return items;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(query) || (item.subtitle && item.subtitle.toLowerCase().includes(query))
    );
  }, [searchQuery, allItems]);

  return (
    <div className="newTabPage">
      {/* Search field */}
      <OuiCompressedFieldSearch
        placeholder="Search pages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
      />

      {searchResults ? (
        <div className="emptySessionPage__tabContent">
          {searchResults.length === 0 ? (
            <p style={{ color: '#676e75', textAlign: 'center', padding: '16px' }}>No results found</p>
          ) : (
            <>
              <span className="emptySessionPage__searchLabel">Suggested pages</span>
              {searchResults.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="emptySessionPage__listItem"
                  onClick={() => onSelectPage(item.pageKey, item.title)}>
                  <span className="emptySessionPage__listItemTitle">{item.title}</span>
                  <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
                </button>
              ))}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="emptySessionPage__quickAccess">
            <div className="emptySessionPage__quickAccessRow">
              {TAB_QUICK_ACCESS.map((item) => (
                <div
                  key={item.key}
                  className="emptySessionPage__quickAccessItem"
                  onClick={() => item.pageKey && onSelectPage(item.pageKey, item.label)}>
                  <button className="emptySessionPage__quickAccessButton" aria-label={item.label}>
                    <OuiIcon type={item.icon} size="m" />
                  </button>
                  <span className="emptySessionPage__quickAccessLabel">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <OuiHorizontalRule margin="m" />

          <div className="emptySessionPage__chips">
            {TAB_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={`emptySessionPage__chip${activeChip === chip.key ? ' emptySessionPage__chip--active' : ''}`}
                onClick={() => setActiveChip(chip.key)}>
                <OuiIcon type={chip.icon} size="m" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <div className="emptySessionPage__tabContent">
            {(TAB_CHIP_DATA[activeChip] || []).map((item) => (
              <button
                key={item.key}
                type="button"
                className="emptySessionPage__listItem"
                onClick={() => onSelectPage(item.pageKey, item.title)}>
                <span className="emptySessionPage__listItemTitle">{item.title}</span>
                <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
