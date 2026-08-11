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
import { OuiFieldSearch, OuiIcon } from '../../../../src/components';

/**
 * Page groups with descriptions for each item.
 */
const PAGE_GROUPS = [
  {
    key: 'discover',
    label: 'Discover',
    items: [
      { key: 'logs', label: 'Logs', description: 'Search and tail raw logs', icon: 'navDiscover', pageKey: 'discover-log' },
      { key: 'traces', label: 'Traces', description: 'Waterfalls and spans', icon: 'visTagCloud', pageKey: 'traces' },
      { key: 'metrics', label: 'Metrics', description: 'Time-series explorer', icon: 'visLine', pageKey: 'discover-metric' },
      { key: 'dashboards', label: 'Dashboards', description: 'Saved boards', icon: 'navDashboards', pageKey: 'dashboards-list' },
    ],
  },
  {
    key: 'monitor',
    label: 'Monitor',
    items: [
      { key: 'app-map', label: 'Application Map', description: 'Service topology', icon: 'navServiceMap', pageKey: 'app-map' },
      { key: 'app-services', label: 'Application Services', description: 'Service health list', icon: 'navOverview', pageKey: 'app-perf-services' },
      { key: 'alert-rules', label: 'Alert rules', description: 'Monitors and routing', icon: 'navAlerting', pageKey: 'alerts-list' },
    ],
  },
  {
    key: 'more',
    label: 'More',
    items: [
      { key: 'notebook', label: 'Notebook', description: 'Analysis documents', icon: 'document', pageKey: 'notebooks' },
      { key: 'forecasting', label: 'Forecasting', description: 'Trend predictions', icon: 'visLine', pageKey: 'forecasting' },
    ],
  },
];

export const NewTabPage = ({ onSelectPage }) => {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return PAGE_GROUPS;
    return PAGE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(needle) ||
          item.description.toLowerCase().includes(needle)
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <div className="newTabPage">
      {/* Header row: title left, filter right */}
      <div className="newTabPage__header">
        <h2 className="newTabPage__heading">Open a tab</h2>
        <OuiFieldSearch
          placeholder="Type to filter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter pages"
          className="newTabPage__filter"
          compressed
        />
      </div>

      {/* Page groups */}
      <div className="newTabPage__groups">
        {groups.map((group) => (
          <div className="newTabPage__group" key={group.key}>
            <div className="newTabPage__groupLabel">{group.label}</div>
            <div className="newTabPage__grid">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="newTabPage__card"
                  onClick={() => onSelectPage(item.pageKey, item.label)}>
                  <OuiIcon type={item.icon} size="m" className="newTabPage__cardIcon" />
                  <div className="newTabPage__cardText">
                    <span className="newTabPage__cardLabel">{item.label}</span>
                    <span className="newTabPage__cardDesc">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="newTabPage__noResults">No pages match "{query}".</p>
        )}
      </div>
    </div>
  );
};
