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

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import {
  OuiButtonIcon,
  OuiCompressedTextArea,
  OuiContextMenu,
  OuiIcon,
  OuiInsightCard,
  OuiInsightCallout,
  OuiPopover,
  OuiSmallButton,
  OuiSmallButtonEmpty,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
  OuiToolTip,
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
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

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
 * "Open a page" grid items. Clicking one opens the related page in a new session.
 */
const OPEN_PAGE_ITEMS = [
  { label: 'Logs', pageKey: 'logs', icon: 'navDiscover' },
  { label: 'Metrics', pageKey: 'metrics', icon: 'visArea' },
  { label: 'Dashboards', pageKey: 'dashboards', icon: 'navDashboards' },
  { label: 'Alerts', pageKey: 'alerts', icon: 'navAlerting' },
  { label: 'Application Map', pageKey: 'app-map', icon: 'navServiceMap' },
  {
    label: 'Application Services',
    pageKey: 'app-perf-services',
    icon: 'navOverview',
  },
  { label: 'Application Traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Forecasting', pageKey: 'forecasting', icon: 'visLine' },
  { label: 'Agent traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Agent spans', pageKey: 'agent-spans', icon: 'visTagCloud' },
];

/**
 * Hover preview data for narrative links.
 * Shown in the right panel when hovering a session link in the left column.
 */
const SESSION_PREVIEWS = {
  'latency-spike-session': {
    summary:
      'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods.',
    stats: [
      { label: 'P99', value: '2,340ms', color: 'danger' },
      { label: 'Errors', value: '0.2%', color: 'success' },
      { label: 'Throughput', value: '1,240/s', color: 'default' },
      { label: 'Pool Util', value: '98%', color: 'danger' },
    ],
    finding:
      'Connection pool at 98% — requests queuing rather than failing fast. 847 connection-acquire-timeout entries in the last 30 min.',
    action:
      'Increase pool max 50 → 150, enable circuit breaker, add monitoring dashboard.',
    meta:
      'Created by AI · 15 min ago · Alert triggered · No recent deployments · 3 of 4 pods affected',
  },
  'error-rate-spike-session': {
    summary:
      'Checkout error rate spiked to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
    stats: [
      { label: 'Error Rate', value: '12.4%', color: 'danger' },
      { label: 'P99', value: '890ms', color: 'warning' },
      { label: 'Affected', value: 'checkout', color: 'default' },
      { label: 'Deploy', value: '2h ago', color: 'warning' },
    ],
    finding:
      'Auth-service v2.4.1 introduced a regression in OIDC token validation — tokens expire before refresh, causing cascading 401s on the checkout path.',
    action:
      'Rollback auth-service to v2.3.9, verify error rate normalizes, then hotfix the token refresh logic.',
    meta:
      'Shared by team · 2 hours ago · Deployment correlated · Checkout path affected',
  },
  'dns-timeout-session': {
    summary:
      'DNS resolution timeouts spiking on os-data-3. Upstream resolver intermittently unresponsive — queries exceeding 5s threshold.',
    stats: [
      { label: 'Timeouts', value: '142', color: 'warning' },
      { label: 'Avg Resolve', value: '4.8s', color: 'warning' },
      { label: 'Affected', value: 'os-data-3', color: 'default' },
      { label: 'Duration', value: '3h', color: 'default' },
    ],
    finding:
      'Upstream DNS resolver 10.0.1.53 intermittently dropping UDP packets — correlates with network maintenance window on the resolver host.',
    action:
      'Add secondary resolver fallback, increase timeout to 10s, escalate to network team if recurrence continues.',
    meta:
      'Detected by AI · 3 hours ago · Single node affected · No customer impact yet',
  },
};

/**
 * Mock data for each filter chip.
 */
const CHIP_DATA = {
  activity: [
    {
      key: 'insight-1',
      title: 'Latency Spike Investigation',
      subtitle: 'Created by AI · 15 min ago',
      summary:
        'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
      meta: 'Alert: Payment service P99 latency breach',
      icon: 'alert',
      sessionId: 'latency-spike-session',
    },
    {
      key: 'insight-2',
      title: 'Error Rate Spike — Checkout Service',
      subtitle: 'Shared by team · 2 hours ago',
      summary:
        'Checkout error rate jumped to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
      meta: 'Shared from Sichenl',
      icon: 'user',
      sessionId: 'error-rate-spike-session',
    },
  ],
  recent: [
    {
      key: 'dash-1',
      title: 'System overview',
      subtitle: 'Dashboard · Updated 5 min ago',
    },
    {
      key: 'log-5',
      title: 'Connection timeout errors',
      subtitle: 'Saved log · source=logs | where severity="ERROR"',
    },
    {
      key: 'met-2',
      title: 'CPU utilization',
      subtitle: 'Saved metric · Updated 30 min ago',
    },
    {
      key: 'dash-4',
      title: 'Payment service — connection pool',
      subtitle: 'Dashboard · Created from thread',
    },
  ],
  favorite: [
    {
      key: 'fav-1',
      title: 'System overview',
      subtitle: 'Dashboard',
      pageKey: 'dashboards',
      typeIcon: 'navDashboards',
    },
    {
      key: 'fav-2',
      title: 'Error rate by service',
      subtitle: 'Saved log',
      pageKey: 'logs',
      typeIcon: 'navDiscover',
    },
  ],
  discover: [
    {
      key: 'log-1',
      title: 'Error rate by service',
      subtitle: 'source=logs | where level="ERROR"',
    },
    {
      key: 'log-2',
      title: 'Auth failure events',
      subtitle: 'source=logs | where event="auth_fail"',
    },
    {
      key: 'log-3',
      title: 'Slow query log',
      subtitle: 'source=logs | where duration > 5000',
    },
    {
      key: 'log-4',
      title: 'Payment service timeout logs',
      subtitle: 'source=payment | where level="WARN"',
    },
    {
      key: 'log-5b',
      title: 'Connection timeout errors',
      subtitle: 'source=logs | where severity="ERROR"',
    },
  ],
  monitor: [
    {
      key: 'alert-1',
      title: 'CPU threshold exceeded',
      subtitle: 'Critical · 10 min ago',
    },
    {
      key: 'alert-2',
      title: 'Disk usage warning',
      subtitle: 'Warning · 1 hour ago',
    },
    {
      key: 'alert-3',
      title: 'Error rate spike',
      subtitle: 'Critical · 3 hours ago',
    },
    {
      key: 'alert-4',
      title: 'Payment service P99 latency breach',
      subtitle: 'Critical · 15 min ago',
      meta: 'Active',
      icon: 'alert',
    },
  ],
  more: [
    {
      key: 'other-1',
      title: 'Inventory service dependency map',
      subtitle: 'Notebook · Updated 2 hours ago',
    },
    {
      key: 'other-2',
      title: 'Weekly capacity report',
      subtitle: 'Notebook · Updated 1 day ago',
    },
    {
      key: 'other-3',
      title: 'Deployment rollback runbook',
      subtitle: 'Notebook · Updated 3 days ago',
    },
  ],
};

/**
 * Saved objects data for the bottom section when a quick access item is selected.
 */
const SAVED_OBJECTS = {
  dashboards: {
    items: [
      {
        key: 'system-overview',
        title: 'System overview',
        subtitle: 'Updated 5 min ago',
      },
      {
        key: 'web-traffic',
        title: 'Web traffic analytics',
        subtitle: 'Updated 15 min ago',
      },
      {
        key: 'api-performance',
        title: 'API performance',
        subtitle: 'Updated 30 min ago',
      },
      {
        key: 'payment-pool-dashboard',
        title: 'Payment service — connection pool',
        subtitle: 'Created from thread · just now',
      },
    ],
  },
  logs: {
    tabs: [
      { id: 'saved-results', name: 'Saved results' },
      { id: 'saved-query', name: 'Saved query' },
    ],
    tabItems: {
      'saved-results': [
        {
          key: 'error-rate',
          title: 'Error rate by service',
          subtitle: 'source=logs | where level="ERROR"',
        },
        {
          key: 'auth-failures',
          title: 'Auth failure events',
          subtitle: 'source=logs | where event="auth_fail"',
        },
        {
          key: 'slow-queries',
          title: 'Slow query log',
          subtitle: 'source=logs | where duration > 5000',
        },
        {
          key: 'payment-timeout-logs',
          title: 'Payment service timeout logs',
          subtitle: 'source=payment | where level="WARN"',
        },
        {
          key: 'connection-timeout-errors',
          title: 'Connection timeout errors',
          subtitle: 'source=logs | where severity="ERROR"',
        },
      ],
      'saved-query': [
        {
          key: 'query-latency-by-host',
          title: 'Latency by host',
          subtitle: 'source=logs | stats avg(latency) by host',
        },
        {
          key: 'query-5xx-responses',
          title: '5xx responses',
          subtitle: 'source=logs | where status >= 500 | stats count() by path',
        },
        {
          key: 'query-top-users',
          title: 'Top users by request count',
          subtitle: 'source=logs | stats count() as requests by user',
        },
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
        {
          key: 'throughput',
          title: 'Throughput over time',
          subtitle: 'source=metrics | stats avg(throughput)',
        },
        {
          key: 'cpu-utilization',
          title: 'CPU utilization',
          subtitle: 'source=metrics | stats avg(cpu) by host',
        },
        {
          key: 'memory-pressure',
          title: 'Memory pressure',
          subtitle: 'source=metrics | stats max(mem_used)',
        },
      ],
      'saved-query': [
        {
          key: 'query-disk-io',
          title: 'Disk I/O by volume',
          subtitle: 'source=metrics | stats avg(disk_io) by volume',
        },
        {
          key: 'query-network-errors',
          title: 'Network error rate',
          subtitle: 'source=metrics | where net_errors > 0',
        },
        {
          key: 'query-gc-pauses',
          title: 'GC pause duration',
          subtitle: 'source=metrics | stats max(gc_pause_ms) by service',
        },
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
const DualPurposeInput = ({
  onStartThread,
  onOpenPage,
  onSearchChange,
  onFocus,
  onBlur,
  onHoverStart,
  onHoverEnd,
  borderActive,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

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
      className={`emptySessionPage__inputWrap${
        borderActive ? ' emptySessionPage__inputWrap--borderActive' : ''
      }`}
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
          <OuiToolTip content={isAttachMenuOpen ? '' : 'Attach'} position="top">
            <OuiPopover
              button={
                <OuiButtonIcon
                  iconType="plus"
                  aria-label="Add attachment"
                  size="s"
                  color="text"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsAttachMenuOpen((open) => !open)}
                />
              }
              isOpen={isAttachMenuOpen}
              closePopover={() => setIsAttachMenuOpen(false)}
              anchorPosition="upLeft"
              panelPaddingSize="s">
              <OuiContextMenu
                initialPanelId={0}
                panels={[
                  {
                    id: 0,
                    items: [
                      {
                        name: 'Upload data',
                        icon: 'importAction',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Upload file or photo',
                        icon: 'document',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Take screenshot',
                        icon: 'fullScreen',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      { name: 'Add to session', icon: 'folderOpen', panel: 1 },
                    ],
                  },
                  {
                    id: 1,
                    title: 'Recent sessions',
                    items: [
                      {
                        name: 'Latency spike investigation',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Checkout error rate alert',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Node disk pressure alerts',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                    ],
                  },
                ]}
              />
            </OuiPopover>
          </OuiToolTip>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <OuiToolTip content="Dictate" position="top">
              <OuiButtonIcon
                aria-label="Dictate"
                size="s"
                color="text"
                display="empty"
                iconType={() => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M12 19v3" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <rect x="9" y="2" width="6" height="13" rx="3" />
                  </svg>
                )}
              />
            </OuiToolTip>
            <OuiToolTip content="Send message" position="top">
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
            </OuiToolTip>
          </div>
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
const BottomSection = ({
  browseKey,
  recentItems,
  favoriteItems,
  onOpenPage,
}) => {
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
              <span className="emptySessionPage__listItemTitle">
                {item.title}
              </span>
              <span className="emptySessionPage__listItemTime">
                {item.subtitle}
              </span>
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
            <span className="emptySessionPage__listItemTitle">
              {item.title}
            </span>
            <span className="emptySessionPage__listItemTime">
              {item.subtitle}
            </span>
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
 * NarrativeLink — Inline link with a hover popover showing session preview.
 */
const NarrativeLink = ({ sessionId, children, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const preview = SESSION_PREVIEWS[sessionId];

  const handleMouseEnter = () => {
    clearTimeout(closeTimerRef.current);
    timerRef.current = setTimeout(() => setIsOpen(true), 300);
  };
  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 200);
  };
  const handlePopoverEnter = () => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(timerRef.current);
  };
  const handlePopoverLeave = () => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const button = (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      className="emptySessionPage__narrativeLink"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {children}
    </a>
  );

  if (!preview) return button;

  return (
    <OuiPopover
      button={button}
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      anchorPosition="downCenter"
      panelPaddingSize="none"
      hasArrow={false}
      panelClassName="emptySessionPage__previewPopover"
      panelProps={{
        onMouseEnter: handlePopoverEnter,
        onMouseLeave: handlePopoverLeave,
      }}>
      <div className="emptySessionPage__sessionPreview">
        <p className="emptySessionPage__previewSummary">{preview.summary}</p>
        <div className="emptySessionPage__previewStats">
          {preview.stats.map((stat, i) => (
            <div
              key={i}
              className={`emptySessionPage__previewStat emptySessionPage__previewStat--${stat.color}`}>
              <span className="emptySessionPage__previewStatValue">
                {stat.value}
              </span>
              <span className="emptySessionPage__previewStatLabel">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        <div className="emptySessionPage__previewSection">
          <span className="emptySessionPage__previewSectionLabel">Finding</span>
          <p className="emptySessionPage__previewSectionText">
            {preview.finding}
          </p>
        </div>
        <div className="emptySessionPage__previewSection">
          <span className="emptySessionPage__previewSectionLabel">
            Recommended action
          </span>
          <p className="emptySessionPage__previewSectionText">
            {preview.action}
          </p>
        </div>
        <p className="emptySessionPage__previewMeta">{preview.meta}</p>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <OuiSmallButtonEmpty
            iconType="arrowRight"
            iconSide="right"
            size="xs"
            color="text"
            style={{ borderRadius: 999 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onClick();
            }}>
            Investigate
          </OuiSmallButtonEmpty>
        </div>
      </div>
    </OuiPopover>
  );
};

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
  onOpenPageInNewSession,
  onBrowseLibrary,
  onViewSession,
  onStartInvestigation,
  onSelectSession,
  sessions = [],
  recentItems = [],
  favoriteItems = [],
  systemAlert = null,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [greeting] = useState(() => {
    const greetings = [
      'Good morning, John',
      'What are you working on John?',
      'Where should we start today John?',
      'Hey hey, John!',
      'Ready when you are, John',
      "What's for today John?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  const [briefingPhase, setBriefingPhase] = useState('loading-summary');

  useEffect(() => {
    const t1 = setTimeout(() => setBriefingPhase('summary-visible'), 500);
    const t2 = setTimeout(() => setBriefingPhase('loading-alerts'), 1000);
    const t3 = setTimeout(() => setBriefingPhase('done'), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const [activeChip, setActiveChip] = useState('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedItems, setDismissedItems] = useState(new Set());
  const [dismissingItems, setDismissingItems] = useState(new Set());
  const [inputHovered, setInputHovered] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputActive = inputHovered || inputFocused;
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrolledFromTop, setScrolledFromTop] = useState(false);
  const [mascotExpression, setMascotExpression] = useState(undefined);
  const [rightPanelTab, setRightPanelTab] = useState('insights');
  const [isEditMode, setIsEditMode] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [widgetOrder, setWidgetOrder] = useState([
    'top-services',
    'connection-timeout',
    'recent-alerts',
    'deployment-timeline',
    'resource-utilization',
    'saved-queries',
    'dashboards',
  ]);
  const [widgetSizes, setWidgetSizes] = useState({ dashboards: 2 });
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const dragWidget = useRef(null);
  const dragOverWidget = useRef(null);
  const resizingWidget = useRef(null);

  const handleWidgetDragStart = (idx) => {
    dragWidget.current = idx;
  };
  const handleWidgetDragOver = (e, idx) => {
    e.preventDefault();
    dragOverWidget.current = idx;
  };
  const handleWidgetDrop = () => {
    if (dragWidget.current === null || dragOverWidget.current === null) return;
    const newOrder = [...widgetOrder];
    const [dragged] = newOrder.splice(dragWidget.current, 1);
    newOrder.splice(dragOverWidget.current, 0, dragged);
    setWidgetOrder(newOrder);
    dragWidget.current = null;
    dragOverWidget.current = null;
  };
  const handleWidgetResize = (widgetId) => {
    setWidgetSizes((prev) => {
      const current = prev[widgetId] || 1;
      const next = current >= 2 ? 1 : 2;
      return { ...prev, [widgetId]: next };
    });
  };
  const handleWidgetRemove = (widgetId) => {
    setWidgetOrder((prev) => prev.filter((id) => id !== widgetId));
    setConfirmingRemoval(null);
  };
  const [hasAnimatedBriefing, setHasAnimatedBriefing] = useState(false);
  const scrollRef = useRef(null);
  const briefingRef = useRef(null);
  const insightsRef = useRef(null);

  // Mark briefing animations as done after initial load
  React.useEffect(() => {
    const timer = setTimeout(() => setHasAnimatedBriefing(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrolledFromTop(scrollRef.current.scrollTop > 0);
    }
  }, []);

  // Insight card hover — single card only, no proximity
  const handleInsightHover = useCallback((hoveredIndex) => {
    if (!insightsRef.current) return;
    const cards = insightsRef.current.querySelectorAll('.ouiInsightCard');
    cards.forEach((el, i) => {
      el.style.transform = i === hoveredIndex ? 'scale(1.02)' : '';
    });
  }, []);

  const handleInsightMouseDown = useCallback((pressedIndex) => {
    if (!insightsRef.current) return;
    const cards = insightsRef.current.querySelectorAll('.ouiInsightCard');
    cards.forEach((el, i) => {
      el.style.transform = i === pressedIndex ? 'scale(0.97)' : '';
    });
  }, []);

  const handleInsightMouseLeave = useCallback(() => {
    if (!insightsRef.current) return;
    insightsRef.current.querySelectorAll('.ouiInsightCard').forEach((el) => {
      el.style.transform = '';
    });
  }, []);

  // Build a flat searchable list from all chip data + SOURCE_PAGE_MOCK
  const allSearchableItems = useMemo(() => {
    const items = [];
    // Add all chip data items
    Object.entries(CHIP_DATA).forEach(([category, categoryItems]) => {
      categoryItems.forEach((item) => {
        items.push({
          ...item,
          category,
          pageKey:
            category === 'discover'
              ? 'logs'
              : category === 'monitor'
              ? 'alerts'
              : category === 'recent'
              ? 'dashboards'
              : category === 'favorite'
              ? 'dashboards'
              : 'notebooks',
        });
      });
    });
    // Add SOURCE_PAGE_MOCK pages
    Object.entries(SOURCE_PAGE_MOCK).forEach(([pageKey, { title }]) => {
      items.push({
        key: `page-${pageKey}`,
        title,
        subtitle: 'Page',
        category: 'pages',
        pageKey,
      });
    });
    return items;
  }, []);

  // Filter items based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query))
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
              <div
                className="emptySessionPage__avatarWrap"
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.85)';
                  setMascotExpression('heart');
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  setMascotExpression(undefined);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  setMascotExpression(undefined);
                }}>
                <Mascot
                  size={32}
                  expression={mascotExpression}
                  idle={!mascotExpression}
                  bob={false}
                  follow={false}
                  color={mascotColor}
                  eyeColor={mascotEyeColor}
                />
              </div>
              <span className="emptySessionPage__onlineStatus">
                Olly is online
              </span>
            </div>
            <OuiTitle size="m">
              <h1>{greeting}</h1>
            </OuiTitle>

            <div className="emptySessionPage__briefingNarrative emptySessionPage__briefingNarrative--news">
              {briefingPhase === 'loading-summary' && (
                <div className="emptySessionPage__briefingSpinner">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
              {briefingPhase !== 'loading-summary' && (
                <p className="emptySessionPage__narrativePara emptySessionPage__newsSummary emptySessionPage__briefingFadeIn">
                  <strong>244 of 247</strong> services healthy. No degradation,
                  no cascading failures.
                </p>
              )}
              {briefingPhase === 'loading-alerts' && (
                <div className="emptySessionPage__briefingSpinner">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
              {briefingPhase === 'done' && (
                <>
                  <div className="emptySessionPage__newsItem emptySessionPage__briefingFadeIn">
                    <span className="emptySessionPage__newsBadge emptySessionPage__newsBadge--critical">
                      Critical
                    </span>
                    <span className="emptySessionPage__newsBody">
                      <NarrativeLink
                        sessionId="latency-spike-session"
                        onClick={() =>
                          onSelectSession('latency-spike-session')
                        }>
                        Payment service P99 breached 2,000ms
                      </NarrativeLink>{' '}
                      — connection pool exhaustion on 3 of 4 pods. Root cause
                      identified.
                    </span>
                  </div>
                  <div className="emptySessionPage__newsItem emptySessionPage__briefingFadeIn emptySessionPage__briefingFadeIn--2">
                    <span className="emptySessionPage__newsBadge emptySessionPage__newsBadge--warning">
                      Warning
                    </span>
                    <span className="emptySessionPage__newsBody">
                      <NarrativeLink
                        sessionId="error-rate-spike-session"
                        onClick={() =>
                          onSelectSession('error-rate-spike-session')
                        }>
                        Checkout error-rate spike
                      </NarrativeLink>{' '}
                      tied to auth-service regression. Elevated but not yet
                      customer-impacting.
                    </span>
                  </div>
                  <div className="emptySessionPage__newsItem emptySessionPage__briefingFadeIn emptySessionPage__briefingFadeIn--3">
                    <span className="emptySessionPage__newsBadge emptySessionPage__newsBadge--warning">
                      Warning
                    </span>
                    <span className="emptySessionPage__newsBody">
                      <NarrativeLink
                        sessionId="dns-timeout-session"
                        onClick={() => onSelectSession('dns-timeout-session')}>
                        DNS resolution timeout
                      </NarrativeLink>{' '}
                      flagged 3 hours ago — not yet resolved. Monitoring for
                      recurrence.
                    </span>
                  </div>
                </>
              )}
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

          {/* Right column — briefing items */}
          <div className="emptySessionPage__rightCol">
            <div
              className={`emptySessionPage__briefing${
                hasAnimatedBriefing ? ' emptySessionPage__briefing--noAnim' : ''
              }`}
              style={{ padding: 24, gap: 0 }}
              ref={briefingRef}
              onMouseLeave={() => {
                if (briefingRef.current) {
                  briefingRef.current
                    .querySelectorAll('.emptySessionPage__briefingItem')
                    .forEach((el) => {
                      el.style.transform = '';
                    });
                  briefingRef.current
                    .querySelectorAll('.emptySessionPage__briefingSeparator')
                    .forEach((el) => {
                      el.style.opacity = '';
                    });
                }
              }}>
              <div className="emptySessionPage__tabRow emptySessionPage__tabRow--sticky">
                <OuiTabs
                  size="s"
                  display="condensed"
                  style={{ maxWidth: 'fit-content' }}>
                  <OuiTab
                    isSelected={rightPanelTab === 'insights'}
                    onClick={() => setRightPanelTab('insights')}>
                    Overview
                  </OuiTab>
                  <OuiTab
                    isSelected={rightPanelTab === 'open-page'}
                    onClick={() => setRightPanelTab('open-page')}>
                    Open a page
                  </OuiTab>
                </OuiTabs>
                {rightPanelTab === 'insights' &&
                  (isEditMode ? (
                    <OuiSmallButtonEmpty
                      size="xs"
                      color="primary"
                      onClick={() => setIsEditMode(false)}>
                      Done
                    </OuiSmallButtonEmpty>
                  ) : (
                    <OuiToolTip content="Edit widgets" position="left">
                      <OuiButtonIcon
                        iconType="controlsHorizontal"
                        aria-label="Edit widgets"
                        size="s"
                        color="text"
                        display="empty"
                        onClick={() => {
                          setIsEditMode(true);
                          const rightCol = document.querySelector(
                            '.emptySessionPage__rightCol'
                          );
                          if (rightCol)
                            rightCol.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </OuiToolTip>
                  ))}
              </div>

              <div className="emptySessionPage__briefingContent">
                <div
                  className={`emptySessionPage__briefingPanel${
                    rightPanelTab !== 'open-page'
                      ? ' emptySessionPage__briefingPanel--hidden'
                      : ''
                  }`}>
                  <div className="emptySessionPage__openPageGrid">
                    {OPEN_PAGE_ITEMS.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        className="emptySessionPage__openPageItem"
                        onClick={() =>
                          onOpenPageInNewSession(item.pageKey, item.label)
                        }>
                        <OuiIcon type={item.icon} size="m" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`emptySessionPage__briefingPanel${
                    rightPanelTab !== 'insights'
                      ? ' emptySessionPage__briefingPanel--hidden'
                      : ''
                  }`}>
                  <div
                    className={`emptySessionPage__widgetGrid${
                      isEditMode ? ' emptySessionPage__widgetGrid--editing' : ''
                    }`}
                    ref={insightsRef}
                    onMouseLeave={handleInsightMouseLeave}>
                    {widgetOrder.map((widgetId, idx) => {
                      const size = widgetSizes[widgetId] || 1;
                      const wrapClass = `emptySessionPage__widgetWrap${
                        size >= 2 ? ' emptySessionPage__widget--wide' : ''
                      }`;
                      const dragProps =
                        isEditMode && !confirmingRemoval
                          ? {
                              draggable: true,
                              onDragStart: () => handleWidgetDragStart(idx),
                              onDragOver: (e) => handleWidgetDragOver(e, idx),
                              onDrop: handleWidgetDrop,
                            }
                          : {};

                      const renderWidget = () => {
                        switch (widgetId) {
                          case 'top-services':
                            return (
                              <OuiInsightCard
                                title="Top services by fault rate"
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession(
                                    'app-perf-services',
                                    'Application Services'
                                  )
                                }>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                  }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      opacity: 0.65,
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                    }}>
                                    <span>Service</span>
                                    <span>Fault rate</span>
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      fontSize: 13,
                                    }}>
                                    <span style={{ flex: '0 0 100px' }}>
                                      checkout
                                    </span>
                                    <span
                                      style={{
                                        flex: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        background:
                                          'linear-gradient(90deg, #a5b4fc 66.67%, transparent 66.67%)',
                                      }}
                                    />
                                    <span style={{ fontWeight: 600 }}>
                                      66.67%
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      fontSize: 13,
                                    }}>
                                    <span style={{ flex: '0 0 100px' }}>
                                      frontend
                                    </span>
                                    <span
                                      style={{
                                        flex: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        background:
                                          'linear-gradient(90deg, #a5b4fc 14.49%, transparent 14.49%)',
                                      }}
                                    />
                                    <span style={{ fontWeight: 600 }}>
                                      14.49%
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                      fontSize: 13,
                                    }}>
                                    <span style={{ flex: '0 0 100px' }}>
                                      frontend-proxy
                                    </span>
                                    <span
                                      style={{
                                        flex: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        background:
                                          'linear-gradient(90deg, #a5b4fc 14.29%, transparent 14.29%)',
                                      }}
                                    />
                                    <span style={{ fontWeight: 600 }}>
                                      14.29%
                                    </span>
                                  </div>
                                </div>
                              </OuiInsightCard>
                            );
                          case 'connection-timeout':
                            return (
                              <OuiInsightCard
                                title="Connection timeout errors"
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('logs', 'Logs')
                                }>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 8,
                                    marginBottom: 8,
                                  }}>
                                  <span
                                    style={{
                                      color: '#d97706',
                                      fontWeight: 700,
                                      fontSize: 28,
                                      lineHeight: 1,
                                    }}>
                                    847
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 13,
                                      color: '#d97706',
                                      fontWeight: 600,
                                    }}>
                                    ↑ 312%
                                  </span>
                                </div>
                                <svg
                                  viewBox="0 0 200 50"
                                  style={{ width: '100%', height: 50 }}>
                                  <defs>
                                    <linearGradient
                                      id="connFill"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1">
                                      <stop
                                        offset="0%"
                                        stopColor="#d97706"
                                        stopOpacity="0.15"
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor="#d97706"
                                        stopOpacity="0.01"
                                      />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M0,48 C40,48 80,46 120,42 S170,20 200,10 V50 H0 Z"
                                    fill="url(#connFill)"
                                  />
                                  <path
                                    d="M0,48 C40,48 80,46 120,42 S170,20 200,10"
                                    fill="none"
                                    stroke="#d97706"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </OuiInsightCard>
                            );
                          case 'recent-alerts':
                            return (
                              <OuiInsightCard
                                title="Recent alerts"
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('alerts', 'Alerts')
                                }>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                  }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      opacity: 0.65,
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                    }}>
                                    <span>Alert</span>
                                    <span>Status</span>
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: 13,
                                    }}>
                                    <span>P99 latency breach</span>
                                    <span
                                      style={{
                                        color: '#f87171',
                                        fontWeight: 600,
                                      }}>
                                      Critical
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: 13,
                                    }}>
                                    <span>Disk usage warning</span>
                                    <span
                                      style={{
                                        color: '#fbbf24',
                                        fontWeight: 600,
                                      }}>
                                      Warning
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: 13,
                                    }}>
                                    <span>Error rate spike</span>
                                    <span
                                      style={{
                                        color: '#f87171',
                                        fontWeight: 600,
                                      }}>
                                      Critical
                                    </span>
                                  </div>
                                </div>
                              </OuiInsightCard>
                            );
                          case 'deployment-timeline':
                            return (
                              <OuiInsightCard
                                title="Deployment timeline"
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession(
                                    'dashboards',
                                    'Dashboards'
                                  )
                                }>
                                <svg
                                  viewBox="0 0 200 100"
                                  style={{ width: '100%', height: 100 }}>
                                  <rect
                                    x="12"
                                    y="55"
                                    width="28"
                                    height="35"
                                    rx="4"
                                    fill="#34d399"
                                  />
                                  <rect
                                    x="50"
                                    y="30"
                                    width="28"
                                    height="60"
                                    rx="4"
                                    fill="#34d399"
                                  />
                                  <rect
                                    x="88"
                                    y="12"
                                    width="28"
                                    height="78"
                                    rx="4"
                                    fill="#34d399"
                                  />
                                  <rect
                                    x="126"
                                    y="38"
                                    width="28"
                                    height="52"
                                    rx="4"
                                    fill="#34d399"
                                  />
                                  <rect
                                    x="164"
                                    y="48"
                                    width="28"
                                    height="42"
                                    rx="4"
                                    fill="#34d399"
                                  />
                                  <text
                                    x="26"
                                    y="98"
                                    fontSize="8"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    1–3
                                  </text>
                                  <text
                                    x="64"
                                    y="98"
                                    fontSize="8"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    5–7
                                  </text>
                                  <text
                                    x="102"
                                    y="98"
                                    fontSize="8"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    9–11
                                  </text>
                                  <text
                                    x="140"
                                    y="98"
                                    fontSize="8"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    13–15
                                  </text>
                                  <text
                                    x="178"
                                    y="98"
                                    fontSize="8"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    17–23
                                  </text>
                                </svg>
                              </OuiInsightCard>
                            );
                          case 'resource-utilization':
                            return (
                              <OuiInsightCard
                                title="Resource utilization"
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('metrics', 'Metrics')
                                }
                                titleExtra={
                                  <span
                                    style={{
                                      color: '#34d399',
                                      fontWeight: 700,
                                      fontSize: 18,
                                    }}>
                                    56%
                                  </span>
                                }>
                                <svg
                                  viewBox="0 0 220 100"
                                  style={{ width: '100%', height: 100 }}>
                                  <line
                                    x1="30"
                                    y1="10"
                                    x2="210"
                                    y2="10"
                                    stroke="currentColor"
                                    strokeOpacity="0.1"
                                    strokeWidth="0.5"
                                  />
                                  <line
                                    x1="30"
                                    y1="32"
                                    x2="210"
                                    y2="32"
                                    stroke="currentColor"
                                    strokeOpacity="0.1"
                                    strokeWidth="0.5"
                                  />
                                  <line
                                    x1="30"
                                    y1="54"
                                    x2="210"
                                    y2="54"
                                    stroke="currentColor"
                                    strokeOpacity="0.1"
                                    strokeWidth="0.5"
                                  />
                                  <line
                                    x1="30"
                                    y1="76"
                                    x2="210"
                                    y2="76"
                                    stroke="currentColor"
                                    strokeOpacity="0.1"
                                    strokeWidth="0.5"
                                  />
                                  <text
                                    x="22"
                                    y="13"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="end">
                                    100
                                  </text>
                                  <text
                                    x="22"
                                    y="35"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="end">
                                    75
                                  </text>
                                  <text
                                    x="22"
                                    y="57"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="end">
                                    50
                                  </text>
                                  <text
                                    x="22"
                                    y="79"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="end">
                                    25
                                  </text>
                                  <text
                                    x="22"
                                    y="96"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="end">
                                    0
                                  </text>
                                  <defs>
                                    <linearGradient
                                      id="resFill"
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1">
                                      <stop
                                        offset="0%"
                                        stopColor="#34d399"
                                        stopOpacity="0.25"
                                      />
                                      <stop
                                        offset="100%"
                                        stopColor="#34d399"
                                        stopOpacity="0.03"
                                      />
                                    </linearGradient>
                                  </defs>
                                  <path
                                    d="M40,58 L75,54 L110,50 L145,52 L175,46 L195,44 L210,46 V96 H40 Z"
                                    fill="url(#resFill)"
                                  />
                                  <polyline
                                    fill="none"
                                    stroke="#34d399"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    points="40,58 75,54 110,50 145,52 175,46 195,44 210,46"
                                  />
                                  <circle
                                    cx="40"
                                    cy="58"
                                    r="3"
                                    fill="#34d399"
                                  />
                                  <circle
                                    cx="75"
                                    cy="54"
                                    r="3"
                                    fill="#34d399"
                                  />
                                  <circle
                                    cx="110"
                                    cy="50"
                                    r="3"
                                    fill="#34d399"
                                  />
                                  <circle
                                    cx="145"
                                    cy="52"
                                    r="3"
                                    fill="#34d399"
                                  />
                                  <circle
                                    cx="175"
                                    cy="46"
                                    r="3"
                                    fill="#34d399"
                                  />
                                  <circle
                                    cx="195"
                                    cy="44"
                                    r="3"
                                    fill="#34d399"
                                  />
                                  <circle
                                    cx="210"
                                    cy="46"
                                    r="3"
                                    fill="#34d399"
                                  />
                                  <text
                                    x="40"
                                    y="96"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    0m
                                  </text>
                                  <text
                                    x="85"
                                    y="96"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    15m
                                  </text>
                                  <text
                                    x="130"
                                    y="96"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    30m
                                  </text>
                                  <text
                                    x="175"
                                    y="96"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    45m
                                  </text>
                                  <text
                                    x="210"
                                    y="96"
                                    fontSize="7"
                                    fill="currentColor"
                                    opacity="0.65"
                                    textAnchor="middle">
                                    60m
                                  </text>
                                </svg>
                              </OuiInsightCard>
                            );
                          case 'saved-queries':
                            return (
                              <div
                                className="emptySessionPage__widgetList"
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('logs', 'Logs')
                                }
                                role="button"
                                tabIndex={0}>
                                <div className="emptySessionPage__widgetListHeader">
                                  <span className="emptySessionPage__widgetListIcon">
                                    <OuiIcon type="search" size="m" />
                                  </span>
                                  <span className="emptySessionPage__widgetListTitle">
                                    Saved queries
                                  </span>
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListAction"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onBrowseLibrary &&
                                        onBrowseLibrary('query');
                                    }}>
                                    <OuiIcon type="arrowRight" size="s" />
                                  </button>
                                </div>
                                <div className="emptySessionPage__widgetListItems">
                                  <div className="emptySessionPage__widgetListItem">
                                    <div>
                                      <strong>5xx by service</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        last 1h
                                      </span>
                                    </div>
                                  </div>
                                  <div className="emptySessionPage__widgetListItem">
                                    <div>
                                      <strong>Slow traces &gt; 2s</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        all services
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          case 'dashboards':
                            return (
                              <div
                                className="emptySessionPage__widgetList"
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession(
                                    'dashboards',
                                    'Dashboards'
                                  )
                                }
                                role="button"
                                tabIndex={0}>
                                <div className="emptySessionPage__widgetListHeader">
                                  <span className="emptySessionPage__widgetListIcon">
                                    <OuiIcon type="grid" size="m" />
                                  </span>
                                  <span className="emptySessionPage__widgetListTitle">
                                    Dashboards
                                  </span>
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListAction"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onBrowseLibrary &&
                                        onBrowseLibrary('dashboard');
                                    }}>
                                    <OuiIcon type="arrowRight" size="s" />
                                  </button>
                                </div>
                                <div className="emptySessionPage__widgetListItems">
                                  <div className="emptySessionPage__widgetListItem">
                                    <div>
                                      <strong>Service overview</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        12 panels · opened 2h ago
                                      </span>
                                    </div>
                                    <svg
                                      viewBox="0 0 60 20"
                                      style={{
                                        width: 60,
                                        height: 20,
                                        flexShrink: 0,
                                      }}>
                                      <polyline
                                        fill="none"
                                        stroke="#34d399"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        points="0,14 10,10 20,12 30,8 40,10 50,6 60,8"
                                      />
                                    </svg>
                                  </div>
                                  <div className="emptySessionPage__widgetListItem">
                                    <div>
                                      <strong>p99 latency</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        8 panels · opened today
                                      </span>
                                    </div>
                                    <svg
                                      viewBox="0 0 60 20"
                                      style={{
                                        width: 60,
                                        height: 20,
                                        flexShrink: 0,
                                      }}>
                                      <polyline
                                        fill="none"
                                        stroke="#d97706"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        points="0,16 10,14 20,12 30,10 40,8 50,6 60,4"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            );
                          default:
                            return null;
                        }
                      };

                      return (
                        <div
                          key={widgetId}
                          className={wrapClass}
                          {...dragProps}>
                          {isEditMode && (
                            <>
                              <div
                                className="emptySessionPage__widgetDragHandle"
                                title="Drag to reorder">
                                <OuiIcon type="grab" size="s" />
                              </div>
                              <button
                                type="button"
                                className="emptySessionPage__widgetResizeHandle"
                                title={
                                  size >= 2 ? 'Shrink to 1×1' : 'Expand to 2×1'
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWidgetResize(widgetId);
                                }}>
                                <OuiIcon
                                  type={size >= 2 ? 'minimize' : 'expand'}
                                  size="s"
                                />
                              </button>
                              <button
                                type="button"
                                className="emptySessionPage__widgetRemoveHandle"
                                title="Remove widget"
                                aria-label="Remove widget"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmingRemoval(widgetId);
                                }}>
                                <OuiIcon type="trash" size="s" />
                              </button>
                            </>
                          )}
                          {isEditMode && confirmingRemoval === widgetId && (
                            <div
                              className="emptySessionPage__widgetConfirm"
                              onClick={(e) => e.stopPropagation()}>
                              <span className="emptySessionPage__widgetConfirmText">
                                Remove this widget?
                              </span>
                              <div className="emptySessionPage__widgetConfirmActions">
                                <OuiSmallButton
                                  color="text"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmingRemoval(null);
                                  }}>
                                  Cancel
                                </OuiSmallButton>
                                <OuiSmallButton
                                  fill
                                  color="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWidgetRemove(widgetId);
                                  }}>
                                  Remove
                                </OuiSmallButton>
                              </div>
                            </div>
                          )}
                          {renderWidget()}
                        </div>
                      );
                    })}
                  </div>

                  {/* Widget Gallery — visible in edit mode */}
                  {isEditMode && (
                    <div className="emptySessionPage__widgetGallery">
                      <div className="emptySessionPage__galleryHeader">
                        <OuiIcon type="apps" size="m" />
                        <strong>Widget Gallery</strong>
                      </div>
                      <div className="emptySessionPage__gallerySearch">
                        <OuiIcon
                          type="search"
                          size="s"
                          className="emptySessionPage__gallerySearchIcon"
                        />
                        <input
                          type="text"
                          placeholder="Search dashboards, queries, links..."
                          value={gallerySearch}
                          onChange={(e) => setGallerySearch(e.target.value)}
                          className="emptySessionPage__gallerySearchInput"
                        />
                      </div>
                      <div className="emptySessionPage__galleryCategories">
                        {[
                          {
                            category: 'Dashboards',
                            items: [
                              {
                                icon: 'grid',
                                label: 'System overview',
                                size: '2×1',
                              },
                              {
                                icon: 'grid',
                                label: 'Payment service pool',
                                size: '1×1',
                              },
                              {
                                icon: 'grid',
                                label: 'Network traffic',
                                size: '2×1',
                              },
                            ],
                          },
                          {
                            category: 'Queries',
                            items: [
                              {
                                icon: 'search',
                                label: '5xx by service',
                                size: '1×1',
                              },
                              {
                                icon: 'search',
                                label: 'Slow traces > 2s',
                                size: '1×1',
                              },
                              {
                                icon: 'search',
                                label: 'Auth failures last 24h',
                                size: '1×1',
                              },
                            ],
                          },
                          {
                            category: 'Monitoring',
                            items: [
                              {
                                icon: 'visArea',
                                label: 'CPU utilization',
                                size: '1×1',
                              },
                              {
                                icon: 'visLine',
                                label: 'Request throughput',
                                size: '2×1',
                              },
                              {
                                icon: 'apmTrace',
                                label: 'Trace explorer',
                                size: '1×1',
                              },
                            ],
                          },
                          {
                            category: 'Links',
                            items: [
                              {
                                icon: 'link',
                                label: 'Runbook: On-call playbook',
                                size: '1×1',
                              },
                              {
                                icon: 'link',
                                label: 'Team Slack channel',
                                size: '1×1',
                              },
                            ],
                          },
                        ]
                          .filter(
                            (cat) =>
                              !gallerySearch ||
                              cat.items.some((item) =>
                                item.label
                                  .toLowerCase()
                                  .includes(gallerySearch.toLowerCase())
                              )
                          )
                          .map((cat, ci) => (
                            <div
                              key={ci}
                              className="emptySessionPage__galleryCategory">
                              <span className="emptySessionPage__galleryCategoryTitle">
                                {cat.category}
                              </span>
                              {cat.items
                                .filter(
                                  (item) =>
                                    !gallerySearch ||
                                    item.label
                                      .toLowerCase()
                                      .includes(gallerySearch.toLowerCase())
                                )
                                .map((item, ii) => (
                                  <div
                                    key={ii}
                                    className="emptySessionPage__galleryItem"
                                    draggable>
                                    <OuiIcon type={item.icon} size="s" />
                                    <span className="emptySessionPage__galleryItemLabel">
                                      {item.label}
                                    </span>
                                    <span className="emptySessionPage__galleryItemSize">
                                      {item.size}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          ))}
                      </div>
                      <div className="emptySessionPage__galleryFooter">
                        <OuiText size="xs" color="subdued">
                          <p>Drag items into the grid above, or click to add</p>
                        </OuiText>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
