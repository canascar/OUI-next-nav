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
  OuiIcon,
} from '../../../../src/components';
import { SOURCE_PAGE_MOCK } from './session_models';

/**
 * Filter chips for the new tab page (no Recent tab).
 */
const TAB_FILTER_CHIPS = [
  { key: 'discover', label: 'Discover' },
  { key: 'monitor', label: 'Monitor' },
  { key: 'more', label: 'More' },
];

/**
 * Mock data for favorites.
 */
const TAB_CHIP_DATA = {
  favorite: [
    { key: 'fav-1', title: 'System overview', subtitle: 'Dashboard', pageKey: 'dashboards', typeIcon: 'navDashboards' },
    { key: 'fav-2', title: 'Error rate by service', subtitle: 'Saved log', pageKey: 'logs', typeIcon: 'navDiscover' },
  ],
};

export const NewTabPage = ({ onSelectPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('discover');
  const [inputValue, setInputValue] = useState('');

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
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setSearchQuery(e.target.value);
        }}
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
          {/* Filter chips */}
          <div className="emptySessionPage__chips">
            {TAB_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={`emptySessionPage__chip${activeChip === chip.key ? ' emptySessionPage__chip--active' : ''}`}
                onClick={() => setActiveChip(chip.key)}>
                {chip.label}
              </button>
            ))}
          </div>

          <div className="emptySessionPage__tabContent">
            {/* Discover grid */}
            {activeChip === 'discover' && (
              <div className="emptySessionPage__sectionHeader">// OPEN A PAGE TO DISCOVER</div>
            )}
            {activeChip === 'discover' && (
              <div className="emptySessionPage__discoverGrid">
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('discover-log', 'Logs')}>
                  <OuiIcon type="navDiscover" size="m" />
                  <span>Logs</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('discover-metric', 'Metrics')}>
                  <OuiIcon type="visArea" size="m" />
                  <span>Metrics</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('dashboards-list', 'Dashboards')}>
                  <OuiIcon type="navDashboards" size="m" />
                  <span>Dashboards</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('alerts-list', 'Alerts')}>
                  <OuiIcon type="navAlerting" size="m" />
                  <span>Alerts</span>
                </button>
              </div>
            )}

            {/* Monitor grid */}
            {activeChip === 'monitor' && (
              <div className="emptySessionPage__sectionHeader">// OPEN A PAGE TO MONITOR</div>
            )}
            {activeChip === 'monitor' && (
              <div className="emptySessionPage__discoverGrid">
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('app-map', 'Application Map')}>
                  <OuiIcon type="navServiceMap" size="m" />
                  <span>Application Map</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('app-perf-services', 'Application Services')}>
                  <OuiIcon type="navOverview" size="m" />
                  <span>Application Services</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('app-traces', 'Application Traces')}>
                  <OuiIcon type="apmTrace" size="m" />
                  <span>Application Traces</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('forecasting', 'Forecasting')}>
                  <OuiIcon type="visLine" size="m" />
                  <span>Forecasting</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('app-traces', 'Agent traces')}>
                  <OuiIcon type="apmTrace" size="m" />
                  <span>Agent traces</span>
                </button>
                <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onSelectPage('agent-spans', 'Agent spans')}>
                  <OuiIcon type="visTagCloud" size="m" />
                  <span>Agent spans</span>
                </button>
              </div>
            )}

            {/* More grid */}
            {activeChip === 'more' && (
              <div className="emptySessionPage__sectionHeader">// OPEN A PAGE</div>
            )}
            {activeChip === 'more' && (
              <div className="emptySessionPage__discoverGrid">
                <div className="emptySessionPage__discoverGridItem emptySessionPage__discoverGridItem--disabled">
                  <OuiIcon type="document" size="m" />
                  <span>Notebook</span>
                </div>
                <div className="emptySessionPage__discoverGridItem emptySessionPage__discoverGridItem--disabled">
                  <OuiIcon type="navAlerting" size="m" />
                  <span>Alert rules</span>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};
