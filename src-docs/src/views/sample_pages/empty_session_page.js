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
  OuiIcon,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

import { SOURCE_PAGE_MOCK } from './session_models';
import { Mascot } from '../../../../olly-mascot/Mascot';

/**
 * Quick access shortcut definitions.
 * Maps to existing OUI icon assets.
 */

/**
 * Filter chips for the bottom section.
 */
const FILTER_CHIPS = [
  { key: 'recent', label: null, icon: 'history', iconOnly: true },
  { key: 'activity', label: 'Overview' },
  { key: 'discover', label: 'Discover', icon: 'navDiscover' },
  { key: 'monitor', label: 'Monitor', icon: 'navAlerting' },
  { key: 'more', label: 'More', icon: 'apps' },
];

/**
 * Mock data for each filter chip.
 */
const CHIP_DATA = {
  activity: [
    {
      key: 'insight-1',
      title: 'Latency Spike Investigation',
      subtitle: 'Created by AI · 15 min ago',
      summary: 'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
      meta: 'Alert: Payment service P99 latency breach',
      icon: 'alert',
      sessionId: 'latency-spike-session',
    },
    {
      key: 'insight-2',
      title: 'Error Rate Spike — Checkout Service',
      subtitle: 'Shared by team · 2 hours ago',
      summary: 'Checkout error rate jumped to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
      meta: 'Shared from Sichenl',
      icon: 'user',
      sessionId: 'error-rate-spike-session',
    },
  ],
  recent: [
    { key: 'dash-1', title: 'System overview', subtitle: 'Dashboard · Updated 5 min ago' },
    { key: 'log-5', title: 'Connection timeout errors', subtitle: 'Saved log · source=logs | where severity="ERROR"' },
    { key: 'met-2', title: 'CPU utilization', subtitle: 'Saved metric · Updated 30 min ago' },
    { key: 'dash-4', title: 'Payment service — connection pool', subtitle: 'Dashboard · Created from thread' },
  ],
  favorite: [
    { key: 'fav-1', title: 'System overview', subtitle: 'Dashboard', pageKey: 'dashboards', typeIcon: 'navDashboards' },
    { key: 'fav-2', title: 'Error rate by service', subtitle: 'Saved log', pageKey: 'logs', typeIcon: 'navDiscover' },
  ],
  discover: [
    { key: 'log-1', title: 'Error rate by service', subtitle: 'source=logs | where level="ERROR"' },
    { key: 'log-2', title: 'Auth failure events', subtitle: 'source=logs | where event="auth_fail"' },
    { key: 'log-3', title: 'Slow query log', subtitle: 'source=logs | where duration > 5000' },
    { key: 'log-4', title: 'Payment service timeout logs', subtitle: 'source=payment | where level="WARN"' },
    { key: 'log-5b', title: 'Connection timeout errors', subtitle: 'source=logs | where severity="ERROR"' },
  ],
  monitor: [
    { key: 'alert-1', title: 'CPU threshold exceeded', subtitle: 'Critical · 10 min ago' },
    { key: 'alert-2', title: 'Disk usage warning', subtitle: 'Warning · 1 hour ago' },
    { key: 'alert-3', title: 'Error rate spike', subtitle: 'Critical · 3 hours ago' },
    { key: 'alert-4', title: 'Payment service P99 latency breach', subtitle: 'Critical · 15 min ago', meta: 'Active', icon: 'alert' },
  ],
  more: [
    { key: 'other-1', title: 'Inventory service dependency map', subtitle: 'Notebook · Updated 2 hours ago' },
    { key: 'other-2', title: 'Weekly capacity report', subtitle: 'Notebook · Updated 1 day ago' },
    { key: 'other-3', title: 'Deployment rollback runbook', subtitle: 'Notebook · Updated 3 days ago' },
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
          placeholder="Ask AI anything, or type to search a page"
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
  onSelectSession,
  sessions = [],
  recentItems = [],
  favoriteItems = [],
  systemAlert = null,
}) => {
  const [activeChip, setActiveChip] = useState('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedItems, setDismissedItems] = useState(new Set());
  const [dismissingItems, setDismissingItems] = useState(new Set());

  // Build a flat searchable list from all chip data + SOURCE_PAGE_MOCK
  const allSearchableItems = useMemo(() => {
    const items = [];
    // Add all chip data items
    Object.entries(CHIP_DATA).forEach(([category, categoryItems]) => {
      categoryItems.forEach((item) => {
        items.push({ ...item, category, pageKey: category === 'discover' ? 'logs' : category === 'monitor' ? 'alerts' : category === 'recent' ? 'dashboards' : category === 'favorite' ? 'dashboards' : 'notebooks' });
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
        {/* Content container — max 832px */}
        <div className="emptySessionPage__content">
          {/* Welcome title */}
          <div className="emptySessionPage__header">
            <Mascot size={44} expression="comma" idle bob follow={false} />
            <div className="emptySessionPage__headerText">
              <OuiTitle size="m">
                <h1>Good morning, John</h1>
              </OuiTitle>
              <OuiText size="s" color="subdued">
                <p>All 247 services steady. 2 activities to review.</p>
              </OuiText>
            </div>
          </div>

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
              {/* Filter chips */}
              <div className="emptySessionPage__chips">
                {FILTER_CHIPS.map((chip) => {
                  const hasActivityItems = chip.key === 'activity' && CHIP_DATA.activity.some((item) => !dismissedItems.has(item.key));
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      className={`emptySessionPage__chip${activeChip === chip.key ? ' emptySessionPage__chip--active' : ''}${chip.iconOnly ? ' emptySessionPage__chip--iconOnly' : ''}`}
                      onClick={() => setActiveChip(chip.key)}>
                      {chip.iconOnly ? <OuiIcon type={chip.icon} size="m" /> : chip.label}
                      {hasActivityItems && <span className="emptySessionPage__chipDot" />}
                    </button>
                  );
                })}
              </div>

              {/* List items based on active chip */}
              <div className="emptySessionPage__tabContent">
                {activeChip === 'activity' && (
                  <div className="emptySessionPage__sectionHeader">// LATEST — 02</div>
                )}
                {activeChip === 'activity' && CHIP_DATA.activity.every((item) => dismissedItems.has(item.key)) && (
                  <div className="emptySessionPage__listItemEmpty">
                    All caught up, no ongoing activity
                  </div>
                )}
                {activeChip === 'activity' && (CHIP_DATA.activity || []).filter((item) => !dismissedItems.has(item.key)).map((item) => (
                  <div
                    key={item.key}
                    className={`emptySessionPage__listItem emptySessionPage__listItem--activityLayout${item.icon === 'alert' ? ' emptySessionPage__listItem--activity' : ''}${dismissingItems.has(item.key) ? ' emptySessionPage__listItem--dismissing' : ''}`}>
                    <button
                      type="button"
                      className="emptySessionPage__listItemClickable"
                      onClick={() => onSelectSession(item.sessionId)}>
                      <span className="emptySessionPage__activityCard">
                        <span className="emptySessionPage__activityCardHeader">
                          <span className="emptySessionPage__listItemTitle">{item.title}</span>
                        </span>
                        <span className="emptySessionPage__listItemTime">{item.subtitle}</span>
                        <span className="emptySessionPage__activityCardPills">
                          {item.summary && (
                            <span className="emptySessionPage__activityPill">
                              <OuiIcon type="generate" size="m" />
                              <span className="emptySessionPage__activityPillText">{item.summary}</span>
                              <span className="emptySessionPage__activityPillMeta">3 tabs</span>
                            </span>
                          )}
                          {item.meta && (
                            <span className="emptySessionPage__activityPill">
                              {item.icon && <OuiIcon type={item.icon} size="m" color={item.icon === 'alert' ? 'warning' : 'subdued'} />}
                              <span className="emptySessionPage__activityPillText">{item.meta}</span>
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="emptySessionPage__listItemDismiss"
                      aria-label="Dismiss"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDismissingItems((prev) => new Set([...prev, item.key]));
                        setTimeout(() => {
                          setDismissedItems((prev) => new Set([...prev, item.key]));
                          setDismissingItems((prev) => { const next = new Set(prev); next.delete(item.key); return next; });
                        }, 500);
                      }}>
                      Dismiss
                    </button>
                  </div>
                ))}
                {activeChip === 'discover' && (
                  <div className="emptySessionPage__sectionHeader">// OPEN A PAGE TO DISCOVER</div>
                )}
                {activeChip === 'discover' && (
                  <div className="emptySessionPage__discoverGrid">
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('discover-log')}>
                      <OuiIcon type="navDiscover" size="m" />
                      <span>Logs</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('discover-metric')}>
                      <OuiIcon type="visArea" size="m" />
                      <span>Metrics</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('dashboards-list')}>
                      <OuiIcon type="navDashboards" size="m" />
                      <span>Dashboards</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('alerts-list')}>
                      <OuiIcon type="navAlerting" size="m" />
                      <span>Alerts</span>
                    </button>
                  </div>
                )}
                {activeChip === 'monitor' && (
                  <div className="emptySessionPage__sectionHeader">// OPEN A PAGE TO MONITOR</div>
                )}
                {activeChip === 'monitor' && (
                  <div className="emptySessionPage__discoverGrid">
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('app-map')}>
                      <OuiIcon type="navServiceMap" size="m" />
                      <span>Application Map</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('app-perf-services')}>
                      <OuiIcon type="navOverview" size="m" />
                      <span>Application Services</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('app-traces')}>
                      <OuiIcon type="apmTrace" size="m" />
                      <span>Application Traces</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('forecasting')}>
                      <OuiIcon type="visLine" size="m" />
                      <span>Forecasting</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('app-traces')}>
                      <OuiIcon type="apmTrace" size="m" />
                      <span>Agent traces</span>
                    </button>
                    <button type="button" className="emptySessionPage__discoverGridItem" onClick={() => onOpenPage('agent-spans')}>
                      <OuiIcon type="visTagCloud" size="m" />
                      <span>Agent spans</span>
                    </button>
                  </div>
                )}
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
                {activeChip === 'activity' && (
                  <div className="emptySessionPage__sectionHeader">// SAVED QUERY — 01</div>
                )}
                {activeChip === 'activity' && (
                  <button type="button" className="emptySessionPage__savedQueryCard" onClick={() => onOpenPage('discover-log')}>
                    <div className="emptySessionPage__savedQueryLeft">
                      <span className="emptySessionPage__savedQueryTitle">Connection timeout errors</span>
                      <code className="emptySessionPage__savedQueryCode">source=logs | where severity=&quot;ERROR&quot;</code>
                    </div>
                    <div className="emptySessionPage__savedQueryChart">
                      <svg viewBox="0 0 120 32" preserveAspectRatio="none" className="emptySessionPage__savedQuerySvg">
                        <path d="M0,28 L8,27 L16,26 L24,25 L32,24 L40,22 L48,20 L56,18 L64,14 L72,12 L80,8 L88,6 L96,4 L104,3 L112,2 L120,1" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="M0,28 L8,27 L16,26 L24,25 L32,24 L40,22 L48,20 L56,18 L64,14 L72,12 L80,8 L88,6 L96,4 L104,3 L112,2 L120,1 L120,32 L0,32 Z" fill="currentColor" opacity="0.1" />
                      </svg>
                    </div>
                    <div className="emptySessionPage__savedQueryRight">
                      <span className="emptySessionPage__savedQueryValue">847</span>
                      <span className="emptySessionPage__savedQueryTrend">↑ +312%</span>
                      <span className="emptySessionPage__savedQueryRange">Last 15 min</span>
                    </div>
                  </button>
                )}
                {activeChip === 'activity' && (
                  <div className="emptySessionPage__sectionHeader">// SERVICE — 03</div>
                )}
                {activeChip === 'activity' && (
                  <div className="emptySessionPage__favoritePanels">
                    <div className="emptySessionPage__favoritePanel">
                      <div className="emptySessionPage__favoritePanelTitle">Top services by fault rate</div>
                      <div className="emptySessionPage__favoritePanelTable">
                        <div className="emptySessionPage__favoritePanelHeader">
                          <span>Service</span><span>Fault rate</span>
                        </div>
                        <div className="emptySessionPage__favoritePanelRow">
                          <button type="button" className="emptySessionPage__favoritePanelLink" onClick={() => onOpenPage('service-detail', 'Service: checkout')}>checkout</button>
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
                          <button type="button" className="emptySessionPage__favoritePanelLink" onClick={() => onOpenPage('service-detail', 'Service: checkout')}>checkout</button>
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
                )}
                {activeChip === 'activity' && (
                  <div className="emptySessionPage__sectionHeader">// FAVORITES — 02</div>
                )}
                {activeChip === 'activity' && (CHIP_DATA.favorite || []).map((item) => (
                  <div key={item.key} className="emptySessionPage__listItem">
                    <button
                      type="button"
                      className="emptySessionPage__listItemClickable"
                      onClick={() => onOpenPage(item.pageKey || 'dashboards')}>
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
                {activeChip === 'activity' && (
                  <button type="button" className="emptySessionPage__editButton">
                    <span>Edit overview</span>
                  </button>
                )}
                {activeChip === 'recent' && (
                  sessions.filter((s) => !s.hidden).slice(0, 5).map((session) => (
                    <div key={session.id} className="emptySessionPage__listItem">
                      <button
                        type="button"
                        className="emptySessionPage__listItemClickable"
                        onClick={() => onSelectSession(session.id)}>
                        <span className="emptySessionPage__activityCard">
                          <span className="emptySessionPage__listItemTitle">{session.title}</span>
                          <span className="emptySessionPage__listItemTime">{formatRelativeTime(session.createdAt)}</span>
                          {session.summary && (
                            <span className="emptySessionPage__activityCardPills">
                              <span className="emptySessionPage__activityPill">
                                <OuiIcon type="generate" size="m" />
                                <span className="emptySessionPage__activityPillText">{session.summary}</span>
                                <span className="emptySessionPage__activityPillMeta">
                                  {session.tabs.length > 0 ? `${session.tabs.length} ${session.tabs.length === 1 ? 'tab' : 'tabs'}` : 'No tabs'}
                                </span>
                              </span>
                            </span>
                          )}
                        </span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
