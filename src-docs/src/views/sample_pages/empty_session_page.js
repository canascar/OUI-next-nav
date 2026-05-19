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
  OuiButtonIcon,
  OuiCompressedTextArea,
  OuiHorizontalRule,
  OuiIcon,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

import { SOURCE_PAGE_MOCK } from './session_models';

/**
 * Quick access shortcut definitions.
 * Maps to existing OUI icon assets.
 */
const QUICK_ACCESS_ITEMS = [
  {
    key: 'new-chat',
    label: 'New chat',
    icon: 'generate',
    action: 'thread',
  },
  {
    key: 'discover-log',
    label: 'Discover (log)',
    icon: 'navDiscover',
    action: 'page',
    pageKey: 'discover-log',
  },
  {
    key: 'discover-metric',
    label: 'Discover (Metric)',
    icon: 'visArea',
    action: 'page',
    pageKey: 'discover-metric',
  },
  {
    key: 'app-map',
    label: 'Application Map',
    icon: 'navServiceMap',
    action: 'page',
    pageKey: 'app-map',
  },
  {
    key: 'app-traces',
    label: 'Application Traces',
    icon: 'apmTrace',
    action: 'page',
    pageKey: 'app-traces',
  },
  {
    key: 'app-services',
    label: 'Application Services',
    icon: 'navDashboards',
    action: 'page',
    pageKey: 'app-services',
  },
  { key: 'more', label: 'More', icon: 'apps', action: 'more' },
];

/**
 * Filter chips for the bottom section.
 */
const FILTER_CHIPS = [
  { key: 'favorites', label: 'Favorites', icon: 'starEmpty' },
  { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards' },
  { key: 'saved-logs', label: 'Saved logs', icon: 'navDiscover' },
  { key: 'saved-metric', label: 'Saved metric', icon: 'visArea' },
  { key: 'alerts', label: 'Alerts', icon: 'navAlerting' },
];

/**
 * Mock data for each filter chip.
 */
const CHIP_DATA = {
  favorites: [
    { key: 'fav-1', title: 'System overview', subtitle: 'Dashboard · Updated 5 min ago' },
    { key: 'fav-2', title: 'Error rate by service', subtitle: 'Saved log · source=logs | where level="ERROR"' },
    { key: 'fav-3', title: 'CPU utilization', subtitle: 'Saved metric · source=metrics | stats avg(cpu) by host' },
    { key: 'fav-4', title: 'Payment service P99 latency breach', subtitle: 'Alert · Critical · 15 min ago' },
    { key: 'fav-5', title: 'API performance', subtitle: 'Dashboard · Updated 30 min ago' },
  ],
  dashboards: [
    { key: 'dash-1', title: 'System overview', subtitle: 'Updated 5 min ago' },
    { key: 'dash-2', title: 'Web traffic analytics', subtitle: 'Updated 15 min ago' },
    { key: 'dash-3', title: 'API performance', subtitle: 'Updated 30 min ago' },
    { key: 'dash-4', title: 'Payment service — connection pool', subtitle: 'Created from thread · just now' },
  ],
  'saved-logs': [
    { key: 'log-1', title: 'Error rate by service', subtitle: 'source=logs | where level="ERROR"' },
    { key: 'log-2', title: 'Auth failure events', subtitle: 'source=logs | where event="auth_fail"' },
    { key: 'log-3', title: 'Slow query log', subtitle: 'source=logs | where duration > 5000' },
    { key: 'log-4', title: 'Payment service timeout logs', subtitle: 'source=payment | where level="WARN"' },
    { key: 'log-5', title: 'Connection timeout errors', subtitle: 'source=logs | where severity="ERROR"' },
  ],
  'saved-metric': [
    { key: 'met-1', title: 'Throughput over time', subtitle: 'source=metrics | stats avg(throughput)' },
    { key: 'met-2', title: 'CPU utilization', subtitle: 'source=metrics | stats avg(cpu) by host' },
    { key: 'met-3', title: 'Memory pressure', subtitle: 'source=metrics | stats max(mem_used)' },
    { key: 'met-4', title: 'Disk I/O by volume', subtitle: 'source=metrics | stats avg(disk_io) by volume' },
  ],
  alerts: [
    { key: 'alert-1', title: 'CPU threshold exceeded', subtitle: 'Critical · 10 min ago' },
    { key: 'alert-2', title: 'Disk usage warning', subtitle: 'Warning · 1 hour ago' },
    { key: 'alert-3', title: 'Error rate spike', subtitle: 'Critical · 3 hours ago' },
    { key: 'alert-4', title: 'Payment service P99 latency breach', subtitle: 'Critical · 15 min ago' },
  ],
};

/**
 * Saved objects data for the bottom section when a quick access item is selected.
 */
const SAVED_OBJECTS = {
  dashboards: {
    items: [
      { key: 'system-overview', title: 'System overview', subtitle: 'Updated 5 min ago' },
      { key: 'web-traffic', title: 'Web traffic analytics', subtitle: 'Updated 15 min ago' },
      { key: 'api-performance', title: 'API performance', subtitle: 'Updated 30 min ago' },
      { key: 'payment-pool-dashboard', title: 'Payment service — connection pool', subtitle: 'Created from thread · just now' },
    ],
  },
  logs: {
    tabs: [
      { id: 'saved-results', name: 'Saved results' },
      { id: 'saved-query', name: 'Saved query' },
    ],
    tabItems: {
      'saved-results': [
        { key: 'error-rate', title: 'Error rate by service', subtitle: 'source=logs | where level="ERROR"' },
        { key: 'auth-failures', title: 'Auth failure events', subtitle: 'source=logs | where event="auth_fail"' },
        { key: 'slow-queries', title: 'Slow query log', subtitle: 'source=logs | where duration > 5000' },
        { key: 'payment-timeout-logs', title: 'Payment service timeout logs', subtitle: 'source=payment | where level="WARN"' },
        { key: 'connection-timeout-errors', title: 'Connection timeout errors', subtitle: 'source=logs | where severity="ERROR"' },
      ],
      'saved-query': [
        { key: 'query-latency-by-host', title: 'Latency by host', subtitle: 'source=logs | stats avg(latency) by host' },
        { key: 'query-5xx-responses', title: '5xx responses', subtitle: 'source=logs | where status >= 500 | stats count() by path' },
        { key: 'query-top-users', title: 'Top users by request count', subtitle: 'source=logs | stats count() as requests by user' },
      ],
    },
  },
  metrics: {
    tabs: [
      { id: 'saved-results', name: 'Saved results' },
      { id: 'saved-query', name: 'Saved query' },
    ],
    tabItems: {
      'saved-results': [
        { key: 'throughput', title: 'Throughput over time', subtitle: 'source=metrics | stats avg(throughput)' },
        { key: 'cpu-utilization', title: 'CPU utilization', subtitle: 'source=metrics | stats avg(cpu) by host' },
        { key: 'memory-pressure', title: 'Memory pressure', subtitle: 'source=metrics | stats max(mem_used)' },
      ],
      'saved-query': [
        { key: 'query-disk-io', title: 'Disk I/O by volume', subtitle: 'source=metrics | stats avg(disk_io) by volume' },
        { key: 'query-network-errors', title: 'Network error rate', subtitle: 'source=metrics | where net_errors > 0' },
        { key: 'query-gc-pauses', title: 'GC pause duration', subtitle: 'source=metrics | stats max(gc_pause_ms) by service' },
      ],
    },
  },
};

/**
 * SystemCallout — Displays a system alert with red left border and pink background.
 *
 * @param {Object} props
 * @param {import('./session_models').SystemAlert} props.alert
 * @param {(pageKey: string) => void} props.onAction
 */
const SystemCallout = ({ alert, onAction }) => {
  if (!alert) return null;

  return (
    <div className="emptySessionPage__callout" role="alert">
      <div className="emptySessionPage__calloutBorder" />
      <div className="emptySessionPage__calloutContent">
        <p className="emptySessionPage__calloutText">{alert.message}</p>
        <button
          type="button"
          className="emptySessionPage__calloutCta"
          onClick={() => onAction(alert.actionTarget)}>
          {alert.actionLabel}
        </button>
      </div>
    </div>
  );
};

/**
 * DualPurposeInput — Input field that accepts AI prompts or page search queries.
 *
 * @param {Object} props
 * @param {(prompt: string) => void} props.onStartThread
 * @param {(pageKey: string) => void} props.onOpenPage
 */
const DualPurposeInput = ({ onStartThread, onOpenPage, onSearchChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const matchingPages = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase();
    return Object.entries(SOURCE_PAGE_MOCK)
      .filter(([, { title }]) => title.toLowerCase().includes(query))
      .map(([key, { title }]) => ({ key, title }));
  }, [inputValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Check if input matches a page
      const exactMatch = Object.entries(SOURCE_PAGE_MOCK).find(
        ([, { title }]) =>
          title.toLowerCase() === inputValue.trim().toLowerCase()
      );
      if (exactMatch) {
        onOpenPage(exactMatch[0]);
      } else {
        onStartThread(inputValue.trim());
      }
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleSelectPage = (pageKey) => {
    onOpenPage(pageKey);
    setInputValue('');
    setShowSuggestions(false);
  };

  return (
    <div className="emptySessionPage__inputWrap">
      <div className="emptySessionPage__inputField">
        <OuiCompressedTextArea
          placeholder="Ask anything. Type / for actions."
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleSubmit}
          rows={3}
          resize="none"
          fullWidth
          className="emptySessionPage__textarea"
        />
        <div className="emptySessionPage__inputActions">
          <OuiButtonIcon
            iconType="plus"
            aria-label="Add attachment"
            size="s"
            color="text"
          />
          <OuiButtonIcon
            iconType="sortUp"
            aria-label="Send"
            display="fill"
            size="s"
            isDisabled={!inputValue.trim()}
            onClick={() => {
              if (inputValue.trim()) {
                const exactMatch = Object.entries(SOURCE_PAGE_MOCK).find(
                  ([, { title }]) =>
                    title.toLowerCase() === inputValue.trim().toLowerCase()
                );
                if (exactMatch) {
                  onOpenPage(exactMatch[0]);
                } else {
                  onStartThread(inputValue.trim());
                }
                setInputValue('');
                setShowSuggestions(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * QuickAccessRow — Row of circular icon buttons for common actions.
 *
 * @param {Object} props
 * @param {(prompt: string) => void} props.onStartThread
 * @param {(pageKey: string) => void} props.onOpenPage
 */
const QuickAccessRow = ({ onStartThread, onOpenPage }) => {
  const [showMore, setShowMore] = useState(false);

  const handleClick = (item) => {
    if (item.action === 'thread') {
      onStartThread('');
    } else if (item.action === 'page') {
      onOpenPage(item.pageKey);
    } else if (item.action === 'more') {
      setShowMore(!showMore);
    }
  };

  return (
    <div className="emptySessionPage__quickAccess">
      <div className="emptySessionPage__quickAccessRow">
        {QUICK_ACCESS_ITEMS.map((item) => (
          <div
            key={item.key}
            className="emptySessionPage__quickAccessItem"
            onClick={() => handleClick(item)}>
            <button
              className="emptySessionPage__quickAccessButton"
              aria-label={item.label}>
              <OuiIcon type={item.icon} size="m" />
            </button>
            <span className="emptySessionPage__quickAccessLabel">{item.label}</span>
          </div>
        ))}
      </div>
      {showMore && (
        <div className="emptySessionPage__moreOptions">
          {Object.entries(SOURCE_PAGE_MOCK).map(([pageKey, { title }]) => (
            <button
              key={pageKey}
              className="emptySessionPage__moreOptionItem"
              onClick={() => {
                onOpenPage(pageKey);
                setShowMore(false);
              }}>
              <OuiIcon type="document" size="s" />
              <span>{title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * RecentAndFavoriteTabs — Tabbed section showing recent visits and favorites.
 *
 * @param {Object} props
 * @param {import('./session_models').RecentItem[]} props.recentItems
 * @param {import('./session_models').FavoriteItem[]} props.favoriteItems
 * @param {(pageKey: string) => void} props.onOpenPage
 */
const RecentAndFavoriteTabs = ({ recentItems, favoriteItems, onOpenPage }) => {
  const [activeTab, setActiveTab] = useState('recent');

  const items = activeTab === 'recent' ? recentItems : favoriteItems;

  const handleItemClick = (item) => {
    if (item.pageKey) {
      onOpenPage(item.pageKey);
    }
  };

  return (
    <div className="emptySessionPage__tabs">
      <OuiTabs size="s" display="condensed" style={{ maxWidth: 'fit-content' }}>
        <OuiTab
          isSelected={activeTab === 'recent'}
          onClick={() => setActiveTab('recent')}>
          Recent
        </OuiTab>
        <OuiTab
          isSelected={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}>
          Favorite
        </OuiTab>
      </OuiTabs>
      <div className="emptySessionPage__tabContent" role="tabpanel">
        {items.length === 0 ? (
          <>
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
          </>
        ) : (
          <ul className="emptySessionPage__itemList">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="emptySessionPage__listItem"
                  onClick={() => handleItemClick(item)}>
                  <OuiIcon
                    type={item.type === 'page' ? 'document' : 'apps'}
                    size="s"
                  />
                  <span className="emptySessionPage__listItemTitle">
                    {item.title}
                  </span>
                  {activeTab === 'recent' && item.visitedAt && (
                    <span className="emptySessionPage__listItemTime">
                      {formatRelativeTime(item.visitedAt)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * BottomSection — Shows saved objects list when a browse key is active,
 * otherwise shows Recent/Favorite tabs.
 */
const BottomSection = ({ browseKey, recentItems, favoriteItems, onOpenPage }) => {
  const [subTab, setSubTab] = useState(null);

  // Reset sub-tab when browse key changes
  React.useEffect(() => {
    if (browseKey && SAVED_OBJECTS[browseKey]?.tabs) {
      setSubTab(SAVED_OBJECTS[browseKey].tabs[0].id);
    } else {
      setSubTab(null);
    }
  }, [browseKey]);

  if (!browseKey || !SAVED_OBJECTS[browseKey]) {
    return (
      <RecentAndFavoriteTabs
        recentItems={recentItems}
        favoriteItems={favoriteItems}
        onOpenPage={onOpenPage}
      />
    );
  }

  const data = SAVED_OBJECTS[browseKey];

  // Simple list (dashboards)
  if (data.items && !data.tabs) {
    return (
      <div className="emptySessionPage__tabs">
        <div className="emptySessionPage__sectionTitle">Dashboards</div>
        <div className="emptySessionPage__tabContent">
          {data.items.map((item) => (
            <button
              key={item.key}
              className="emptySessionPage__listItem"
              onClick={() => onOpenPage(browseKey)}>
              <span className="emptySessionPage__listItemTitle">{item.title}</span>
              <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tabbed list (logs, metrics)
  const activeSubTab = subTab || (data.tabs ? data.tabs[0].id : null);
  const tabItems = data.tabItems[activeSubTab] || [];

  return (
    <div className="emptySessionPage__tabs">
      <OuiTabs size="s" display="condensed" style={{ maxWidth: 'fit-content' }}>
        {data.tabs.map((tab) => (
          <OuiTab
            key={tab.id}
            isSelected={activeSubTab === tab.id}
            onClick={() => setSubTab(tab.id)}>
            {tab.name}
          </OuiTab>
        ))}
      </OuiTabs>
      <div className="emptySessionPage__tabContent">
        {tabItems.map((item) => (
          <button
            key={item.key}
            className="emptySessionPage__listItem"
            onClick={() => onOpenPage(browseKey)}>
            <span className="emptySessionPage__listItemTitle">{item.title}</span>
            <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Format a timestamp as relative time (e.g., "2 hours ago").
 * @param {number} timestamp
 * @returns {string}
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * EmptySessionPage — The welcome experience shown when a session has no thread and no pages open.
 *
 * Displays a centered panel with:
 * - Welcome title
 * - System callout (when alerts are present)
 * - Dual-purpose input (AI prompt or page search)
 * - Quick access row with shortcut buttons
 * - Recent visit / Favorite tabs
 *
 * @param {Object} props
 * @param {(prompt: string) => void} props.onStartThread - Callback to start a new AI thread
 * @param {(pageKey: string) => void} props.onOpenPage - Callback to open a page as a tab
 * @param {import('./session_models').RecentItem[]} props.recentItems - Recently visited items
 * @param {import('./session_models').FavoriteItem[]} props.favoriteItems - Favorited items
 * @param {import('./session_models').SystemAlert|null} props.systemAlert - Active system alert
 */
export const EmptySessionPage = ({
  onStartThread,
  onOpenPage,
  onViewSession,
  onStartInvestigation,
  recentItems = [],
  favoriteItems = [],
  systemAlert = null,
}) => {
  const [activeChip, setActiveChip] = useState('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Build a flat searchable list from all chip data + SOURCE_PAGE_MOCK
  const allSearchableItems = useMemo(() => {
    const items = [];
    // Add all chip data items
    Object.entries(CHIP_DATA).forEach(([category, categoryItems]) => {
      categoryItems.forEach((item) => {
        items.push({ ...item, category, pageKey: category === 'dashboards' ? 'dashboards' : category === 'saved-logs' ? 'logs' : category === 'saved-metric' ? 'metrics' : 'alerts' });
      });
    });
    // Add SOURCE_PAGE_MOCK pages
    Object.entries(SOURCE_PAGE_MOCK).forEach(([pageKey, { title }]) => {
      items.push({ key: `page-${pageKey}`, title, subtitle: 'Page', category: 'pages', pageKey });
    });
    return items;
  }, []);

  // Filter items based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(
      (item) => item.title.toLowerCase().includes(query) || (item.subtitle && item.subtitle.toLowerCase().includes(query))
    );
  }, [searchQuery, allSearchableItems]);

  return (
    <div className="emptySessionPage">
      <div className="emptySessionPage__panel">
        {/* Welcome title */}
        <div className="emptySessionPage__header">
          <OuiTitle size="m">
            <h1>Welcome to OpenSearch Observability</h1>
          </OuiTitle>
        </div>

        {/* Content container — max 832px */}
        <div className="emptySessionPage__content">
          {/* Alert callout */}
          {!alertDismissed && (
          <div className="emptySessionPage__alertCallout">
            <div className="emptySessionPage__alertCalloutIcon">
              <OuiIcon type="alert" color="warning" size="m" />
            </div>
            <div className="emptySessionPage__alertCalloutBody">
              <p className="emptySessionPage__alertCalloutText">
                <strong>Alert: payment-service P99 latency exceeded 2,000ms</strong> — Triggered May 13 at 02:32 PM UTC. The P99 response time for payment-service breached the configured threshold on 3 of 4 pods, with no recent deployments in the past 6 hours.
              </p>
              <p className="emptySessionPage__alertCalloutSubtext">
                An AI investigation session is already in progress analyzing correlated traces and connection pool metrics.
              </p>
              <div className="emptySessionPage__alertCalloutActions">
                <button type="button" className="emptySessionPage__alertCalloutAction emptySessionPage__alertCalloutAction--primary" onClick={onViewSession}>View ongoing session</button>
                <button type="button" className="emptySessionPage__alertCalloutAction" onClick={onStartInvestigation}>Start new investigation</button>
                <button type="button" className="emptySessionPage__alertCalloutAction" onClick={() => setAlertDismissed(true)}>Acknowledge alert</button>
              </div>
            </div>
          </div>
          )}

          {/* Textarea input */}
          <DualPurposeInput
            onStartThread={onStartThread}
            onOpenPage={onOpenPage}
            onSearchChange={setSearchQuery}
          />

          {/* Search results OR normal content */}
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
                      onClick={() => onOpenPage(item.pageKey)}>
                      <span className="emptySessionPage__listItemTitle">{item.title}</span>
                      <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            <>
              {/* Quick access row */}
              <QuickAccessRow
                onStartThread={onStartThread}
                onOpenPage={onOpenPage}
              />

              {/* Horizontal rule */}
              <OuiHorizontalRule margin="m" />

              {/* Filter chips */}
              <div className="emptySessionPage__chips">
                {FILTER_CHIPS.map((chip) => (
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

              {/* List items based on active chip */}
              <div className="emptySessionPage__tabContent">
                {(CHIP_DATA[activeChip] || []).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="emptySessionPage__listItem"
                    onClick={() => onOpenPage(activeChip === 'dashboards' ? 'dashboards' : activeChip === 'saved-logs' ? 'logs' : activeChip === 'saved-metric' ? 'metrics' : 'alerts')}>
                    <span className="emptySessionPage__listItemTitle">{item.title}</span>
                    <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
