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

import React, { useState, useMemo, useRef, useCallback } from 'react';

import {
  OuiButtonIcon,
  OuiCompressedTextArea,
  OuiIcon,
  OuiInsightCard,
  OuiInsightCallout,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

import {
  Chart,
  Settings,
  Axis,
  BarSeries,
  LineSeries,
  ScaleType,
} from '@elastic/charts';

import { SOURCE_PAGE_MOCK } from './session_models';
import { OllyAvatar } from './olly_avatar';
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
const DualPurposeInput = ({ onStartThread, onOpenPage, onSearchChange, onFocus, onBlur, onHoverStart, onHoverEnd, borderActive }) => {
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

  return (
    <div
      className={`emptySessionPage__inputWrap${borderActive ? ' emptySessionPage__inputWrap--borderActive' : ''}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}>
      <div className="emptySessionPage__inputField">
        <OuiCompressedTextArea
          placeholder="Ask AI anything, or type to search a page"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleSubmit}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={3}
          resize="none"
          fullWidth
          autoFocus
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
  const [inputHovered, setInputHovered] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputActive = inputHovered || inputFocused;
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrolledFromTop, setScrolledFromTop] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrolledFromTop(scrollRef.current.scrollTop > 0);
    }
  }, []);

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
        {/* Two-column layout */}
        <div className="emptySessionPage__twoCol">
          {/* Left column — AI-generated reading paragraph with inline widgets */}
          <div className="emptySessionPage__leftCol">
            {/* Mascot + status — above title */}
            <div className="emptySessionPage__headerRow">
              <div className="emptySessionPage__avatarWrap">
                <Mascot size={32} idle bob={false} follow={false} />
              </div>
              <span className="emptySessionPage__onlineStatus">
                <span className="emptySessionPage__onlineDot" />
                Olly is online
              </span>
            </div>
            <OuiTitle size="m">
              <h1>Good morning, John</h1>
            </OuiTitle>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className={`emptySessionPage__scrollContent${scrolledFromTop ? '' : ' emptySessionPage__scrollContent--top'}`}>
              {/* Paragraph briefing */}
              <div className="emptySessionPage__briefing">
                <OuiText size="s">
                  <p>All 247 services are running normally. I found 3 items that need your attention:</p>
                  <p>An alert triggered 15 minutes ago — <strong>Payment service P99 latency breach</strong>. P99 crossed 2,000ms with connection pool exhaustion on 3 of 4 pods. I've started an investigation and identified a likely root cause.</p>
                </OuiText>

                {/* Card widget 1 */}
                <OuiInsightCallout
                  title={CHIP_DATA.activity[0].title}
                  subtitle={CHIP_DATA.activity[0].subtitle}
                  severity="warning"
                  isDismissing={dismissingItems.has('insight-1')}
                  onClick={() => onSelectSession(CHIP_DATA.activity[0].sessionId)}
                  onMouseEnter={() => setHoveredCard('latency')}
                  onMouseLeave={() => setHoveredCard(null)}
                />

                <OuiText size="s" style={{ marginTop: 16 }}>
                  <p>Sicheng also shared a related finding — checkout error rate spiked to 12.4% around the same time. This may be connected to the latency issue above. You can review it here:</p>
                </OuiText>

                {/* Card widget 2 */}
                <OuiInsightCallout
                  title={CHIP_DATA.activity[1].title}
                  subtitle={CHIP_DATA.activity[1].subtitle}
                  isDismissing={dismissingItems.has('insight-2')}
                  onClick={() => onSelectSession(CHIP_DATA.activity[1].sessionId)}
                  onMouseEnter={() => setHoveredCard('error-rate')}
                  onMouseLeave={() => setHoveredCard(null)}
                />

                <OuiText size="s" style={{ marginTop: 16 }}>
                  <p>On a positive note, a DNS resolution timeout from earlier today has been resolved after the upstream fix was deployed. No further action needed.</p>
                </OuiText>

                {/* Card widget 3 — placeholder */}
                <OuiInsightCallout
                  title="DNS Resolution Timeout"
                  subtitle="Resolved · 3 hours ago"
                  severity="success"
                  onMouseEnter={() => setHoveredCard('dns')}
                  onMouseLeave={() => setHoveredCard(null)}
                />

                <OuiText size="s" style={{ marginTop: 16 }}>
                  <p>That's everything for now. Let me know if you'd like me to dig deeper into any of these, or ask me anything below.</p>
                </OuiText>
              </div>
            </div>

            {/* Chat input — fixed at bottom of container */}
            <div className="emptySessionPage__inlineInput">
              <DualPurposeInput
                onStartThread={onStartThread}
                onOpenPage={onOpenPage}
                onSearchChange={setSearchQuery}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onHoverStart={() => setInputHovered(true)}
                onHoverEnd={() => setInputHovered(false)}
                borderActive={inputActive}
              />
            </div>
          </div>

          {/* Right column — 2x3 grid of cards */}
          <div className="emptySessionPage__rightCol">
            <div className={`emptySessionPage__rightGrid${hoveredCard ? ` emptySessionPage__rightGrid--highlight-${hoveredCard}` : ''}`}>
              {/* Card 1: Top services by fault rate */}
              <OuiInsightCard title="Top services by fault rate" data-card="services">
                <div className="emptySessionPage__favoritePanelTable">
                  <div className="emptySessionPage__favoritePanelHeader">
                    <span>Service</span><span>Fault rate</span>
                  </div>
                  <div className="emptySessionPage__favoritePanelRow" data-row="checkout">
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
              </OuiInsightCard>

              {/* Card 2: Connection timeout errors (saved query) */}
              <OuiInsightCard title="Connection timeout errors" isClickable data-card="timeout" onClick={() => onOpenPage('discover-log')}>
                <code className="emptySessionPage__savedQueryCode">source=logs | where severity=&quot;ERROR&quot;</code>
                <div className="emptySessionPage__savedQueryBody">
                  <div className="emptySessionPage__savedQueryChart">
                    <svg viewBox="0 0 120 48" preserveAspectRatio="none" className="emptySessionPage__savedQuerySvg">
                      <path d="M0,42 L8,41 L16,39 L24,38 L32,36 L40,33 L48,30 L56,27 L64,21 L72,18 L80,12 L88,9 L96,6 L104,4 L112,3 L120,1" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M0,42 L8,41 L16,39 L24,38 L32,36 L40,33 L48,30 L56,27 L64,21 L72,18 L80,12 L88,9 L96,6 L104,4 L112,3 L120,1 L120,48 L0,48 Z" fill="currentColor" opacity="0.1" />
                    </svg>
                  </div>
                  <div className="emptySessionPage__savedQueryRight">
                    <span className="emptySessionPage__savedQueryValue">847</span>
                    <span className="emptySessionPage__savedQueryTrend">↑ +312%</span>
                  </div>
                </div>
              </OuiInsightCard>

              {/* Card 3: Recent alerts */}
              <OuiInsightCard title="Recent alerts" data-card="alerts">
                <div className="emptySessionPage__favoritePanelTable">
                  <div className="emptySessionPage__favoritePanelHeader">
                    <span>Alert</span><span>Status</span>
                  </div>
                  <div className="emptySessionPage__favoritePanelRow" data-row="latency-alert">
                    <span className="emptySessionPage__favoritePanelLink--static">P99 latency breach</span>
                    <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600 }}>Critical</span>
                  </div>
                  <div className="emptySessionPage__favoritePanelRow">
                    <span className="emptySessionPage__favoritePanelLink--static">Disk usage warning</span>
                    <span style={{ color: '#d97706', fontSize: '11px', fontWeight: 600 }}>Warning</span>
                  </div>
                  <div className="emptySessionPage__favoritePanelRow" data-row="error-rate-alert">
                    <span className="emptySessionPage__favoritePanelLink--static">Error rate spike</span>
                    <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600 }}>Critical</span>
                  </div>
                </div>
              </OuiInsightCard>

              {/* Card 4: Deployment timeline (bar chart) */}
              <OuiInsightCard title="Deployment timeline">
                <div style={{ height: 120 }}>
                  <Chart>
                    <Settings showLegend={false} />
                    <Axis id="bottom" position="bottom" tickFormat={(d) => `${d}h`} />
                    <Axis id="left" position="left" hide />
                    <BarSeries
                      id="deployments"
                      xScaleType={ScaleType.Linear}
                      yScaleType={ScaleType.Linear}
                      xAccessor="x"
                      yAccessors={['y']}
                      data={[
                        { x: 1, y: 0 },
                        { x: 4, y: 1 },
                        { x: 6, y: 0 },
                        { x: 8, y: 2 },
                        { x: 12, y: 1 },
                        { x: 16, y: 0 },
                        { x: 20, y: 1 },
                        { x: 24, y: 0 },
                      ]}
                    />
                  </Chart>
                </div>
              </OuiInsightCard>

              {/* Card 5: Resource utilization (line chart) */}
              <OuiInsightCard title="Resource utilization">
                <div style={{ height: 120 }}>
                  <Chart>
                    <Settings showLegend={false} />
                    <Axis id="bottom" position="bottom" tickFormat={(d) => `${d}m`} />
                    <Axis id="left" position="left" tickFormat={(d) => `${d}%`} domain={{ min: 0, max: 100 }} />
                    <LineSeries
                      id="cpu"
                      xScaleType={ScaleType.Linear}
                      yScaleType={ScaleType.Linear}
                      xAccessor="x"
                      yAccessors={['y']}
                      data={[
                        { x: 0, y: 45 },
                        { x: 10, y: 48 },
                        { x: 20, y: 52 },
                        { x: 30, y: 58 },
                        { x: 40, y: 55 },
                        { x: 50, y: 62 },
                        { x: 60, y: 62 },
                      ]}
                    />
                  </Chart>
                </div>
              </OuiInsightCard>

              {/* Card 6: Open a page */}
              <OuiInsightCard variant="add" onClick={() => onOpenPage('new-tab', 'New Tab')}>
                <div className="emptySessionPage__addCardHeader">
                  <span className="emptySessionPage__addCardIcon">
                    <OuiIcon type="plus" size="m" color="ghost" />
                  </span>
                  <span className="emptySessionPage__addCardTitle">Open another page</span>
                </div>
                <div className="emptySessionPage__addCardChips">
                  <button type="button" className="emptySessionPage__addCardChip" onClick={(e) => { e.stopPropagation(); onOpenPage('dashboards'); }}>Dashboard</button>
                  <button type="button" className="emptySessionPage__addCardChip" onClick={(e) => { e.stopPropagation(); onOpenPage('logs'); }}>Saved log</button>
                  <button type="button" className="emptySessionPage__addCardChip" onClick={(e) => { e.stopPropagation(); onOpenPage('app-perf-traces'); }}>Trace</button>
                  <button type="button" className="emptySessionPage__addCardChip" onClick={(e) => { e.stopPropagation(); onOpenPage('alerts'); }}>Alert</button>
                </div>
              </OuiInsightCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
