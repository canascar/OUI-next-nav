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
 * Filter chips for the new tab page.
 */
const TAB_FILTER_CHIPS = [
  { key: 'favorite', label: 'Favorite' },
  { key: 'discover', label: 'Discover' },
  { key: 'monitor', label: 'Monitor' },
  { key: 'more', label: 'More' },
];

/**
 * Mock data for each chip.
 */
const TAB_CHIP_DATA = {
  favorite: [
    { key: 'fav-1', title: 'System overview', subtitle: 'Dashboard', pageKey: 'dashboards', typeIcon: 'navDashboards' },
    { key: 'fav-2', title: 'Error rate by service', subtitle: 'Saved log', pageKey: 'logs', typeIcon: 'navDiscover' },
  ],
};

export const NewTabPage = ({ onSelectPage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('favorite');

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

          {/* Discover grid */}
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

          {/* Favorite panels + list */}
          {activeChip === 'favorite' && (
            <>
              <div className="emptySessionPage__favoritePanels">
                <div className="emptySessionPage__favoritePanel">
                  <div className="emptySessionPage__favoritePanelTitle">Top services by fault rate</div>
                  <div className="emptySessionPage__favoritePanelTable">
                    <div className="emptySessionPage__favoritePanelHeader">
                      <span>Service</span><span>Fault rate</span>
                    </div>
                    <div className="emptySessionPage__favoritePanelRow">
                      <button type="button" className="emptySessionPage__favoritePanelLink" onClick={() => onSelectPage('service-detail', 'Service: checkout')}>checkout</button>
                      <div className="emptySessionPage__favoritePanelBar"><div className="emptySessionPage__favoritePanelBarTrack"><div className="emptySessionPage__favoritePanelBarFill" style={{ width: '66.67%' }} /></div><span>66.67%</span></div>
                    </div>
                    <div className="emptySessionPage__favoritePanelRow">
                      <span className="emptySessionPage__favoritePanelLink--static">frontend</span>
                      <div className="emptySessionPage__favoritePanelBar"><div className="emptySessionPage__favoritePanelBarTrack"><div className="emptySessionPage__favoritePanelBarFill" style={{ width: '14.49%' }} /></div><span>14.49%</span></div>
                    </div>
                    <div className="emptySessionPage__favoritePanelRow">
                      <span className="emptySessionPage__favoritePanelLink--static">frontend-proxy</span>
                      <div className="emptySessionPage__favoritePanelBar"><div className="emptySessionPage__favoritePanelBarTrack"><div className="emptySessionPage__favoritePanelBarFill" style={{ width: '14.29%' }} /></div><span>14.29%</span></div>
                    </div>
                  </div>
                </div>
                <div className="emptySessionPage__favoritePanel">
                  <div className="emptySessionPage__favoritePanelTitle">Top dependency paths by fault rate</div>
                  <div className="emptySessionPage__favoritePanelTable">
                    <div className="emptySessionPage__favoritePanelHeader emptySessionPage__favoritePanelHeader--3col">
                      <span>Dependency service</span><span>Service</span><span>Fault rate</span>
                    </div>
                    <div className="emptySessionPage__favoritePanelRow emptySessionPage__favoritePanelRow--3col">
                      <button type="button" className="emptySessionPage__favoritePanelLink" onClick={() => onSelectPage('service-detail', 'Service: checkout')}>checkout</button>
                      <span className="emptySessionPage__favoritePanelLink--static">frontend</span>
                      <div className="emptySessionPage__favoritePanelBar"><div className="emptySessionPage__favoritePanelBarTrack"><div className="emptySessionPage__favoritePanelBarFill" style={{ width: '66.67%' }} /></div><span>66.67%</span></div>
                    </div>
                    <div className="emptySessionPage__favoritePanelRow emptySessionPage__favoritePanelRow--3col">
                      <span className="emptySessionPage__favoritePanelLink--static">frontend</span>
                      <span className="emptySessionPage__favoritePanelLink--static">frontend-proxy</span>
                      <div className="emptySessionPage__favoritePanelBar"><div className="emptySessionPage__favoritePanelBarTrack"><div className="emptySessionPage__favoritePanelBarFill" style={{ width: '14.29%' }} /></div><span>14.29%</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="emptySessionPage__tabContent">
                {(TAB_CHIP_DATA.favorite || []).map((item) => (
                  <div key={item.key} className="emptySessionPage__listItem">
                    <button
                      type="button"
                      className="emptySessionPage__listItemClickable"
                      onClick={() => onSelectPage(item.pageKey, item.title)}>
                      <span className="emptySessionPage__listItemContent">
                        <span className="emptySessionPage__listItemTitle">{item.title}</span>
                        <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
                      </span>
                      {item.typeIcon && (
                        <span className="emptySessionPage__listItemRight">
                          <OuiIcon type={item.typeIcon} size="m" color="subdued" />
                        </span>
                      )}
                    </button>
                  </div>
                ))}
                <button type="button" className="emptySessionPage__editButton">
                  <span>Edit favorites</span>
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
