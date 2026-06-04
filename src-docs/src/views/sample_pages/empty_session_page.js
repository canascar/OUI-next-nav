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

import React, { useState, useMemo, useRef, useCallback, useContext } from 'react';

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
      '¯\\_(ツ)_/¯',
      "What's for today John?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

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
  const [rightPanelTab, setRightPanelTab] = useState('recent');
  const scrollRef = useRef(null);
  const briefingRef = useRef(null);

  // Typewriter for text lines
  const textLines = useMemo(() => [
    { text: 'All 247 services are running normally.', boldStart: 4, boldEnd: 16 },
    { text: 'I found 3 items that need your attention.', boldStart: 8, boldEnd: 15 },
    { text: "Let me know if you'd like me to dig deeper into any of these, or ask me anything below.", boldStart: -1, boldEnd: -1 },
  ], []);
  const [typedLines, setTypedLines] = useState(['', '', '']);
  const [typingLineIdx, setTypingLineIdx] = useState(-1);
  const [spinningLineIdx, setSpinningLineIdx] = useState(-1);
  const [typingDone, setTypingDone] = useState(false);
  const typeTimers = useRef([]);

  React.useEffect(() => {
    typeTimers.current.forEach(clearTimeout);
    typeTimers.current = [];

    const CHAR_SPEED = 18;
    const LINE_PAUSE = 300;
    const SPIN_DURATION = 2000;
    const INITIAL_DELAY = 1200;
    let lineIdx = 0;
    let charIdx = 0;

    const typeNext = () => {
      if (lineIdx >= textLines.length) {
        setTypingDone(true);
        setTypingLineIdx(-1);
        setSpinningLineIdx(-1);
        return;
      }
      if (charIdx < textLines[lineIdx].text.length) {
        charIdx++;
        const li = lineIdx;
        const ci = charIdx;
        setTypedLines(prev => {
          const next = [...prev];
          next[li] = textLines[li].text.slice(0, ci);
          return next;
        });
        setTypingLineIdx(lineIdx);
        const timer = setTimeout(typeNext, CHAR_SPEED);
        typeTimers.current.push(timer);
      } else {
        lineIdx++;
        charIdx = 0;
        if (lineIdx < textLines.length) {
          // Show spinner before next line
          setTypingLineIdx(-1);
          setSpinningLineIdx(lineIdx);
          const timer = setTimeout(() => {
            setSpinningLineIdx(-1);
            typeNext();
          }, SPIN_DURATION);
          typeTimers.current.push(timer);
        } else {
          setTypingDone(true);
          setTypingLineIdx(-1);
          setSpinningLineIdx(-1);
        }
      }
    };

    // Show spinner before first line
    const startTimer = setTimeout(() => {
      setSpinningLineIdx(0);
      const spinTimer = setTimeout(() => {
        setSpinningLineIdx(-1);
        typeNext();
      }, SPIN_DURATION);
      typeTimers.current.push(spinTimer);
    }, INITIAL_DELAY);
    typeTimers.current.push(startTimer);
    return () => typeTimers.current.forEach(clearTimeout);
  }, [textLines]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrolledFromTop(scrollRef.current.scrollTop > 0);
    }
  }, []);

  const handleBriefingHover = useCallback((hoveredIndex) => {
    if (!briefingRef.current) return;
    const items = briefingRef.current.querySelectorAll('.emptySessionPage__briefingItem');
    const separators = briefingRef.current.querySelectorAll('.emptySessionPage__briefingSeparator');
    items.forEach((el, i) => {
      const distance = Math.abs(i - hoveredIndex);
      let scale = 1;
      if (distance === 0) scale = 1.03;
      else if (distance === 1) scale = 1.015;
      else if (distance === 2) scale = 1.005;
      el.style.transform = `scale(${scale})`;
    });
    separators.forEach((el, i) => {
      const distBefore = Math.abs(i - hoveredIndex);
      const distAfter = Math.abs(i + 1 - hoveredIndex);
      const minDist = Math.min(distBefore, distAfter);
      el.style.opacity = minDist === 0 ? '0' : '1';
    });
  }, []);

  const handleBriefingMouseDown = useCallback((pressedIndex) => {
    if (!briefingRef.current) return;
    const items = briefingRef.current.querySelectorAll('.emptySessionPage__briefingItem');
    items.forEach((el, i) => {
      const distance = Math.abs(i - pressedIndex);
      let scale = 1;
      if (distance === 0) scale = 0.97;
      else if (distance === 1) scale = 0.985;
      else if (distance === 2) scale = 0.995;
      el.style.transform = `scale(${scale})`;
    });
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
                <Mascot size={32} expression={mascotExpression} idle={!mascotExpression} bob={false} follow={false} color={mascotColor} eyeColor={mascotEyeColor} />
              </div>
              <span className="emptySessionPage__onlineStatus">
                <span className="emptySessionPage__onlineDot" />
                Olly is online
              </span>
            </div>
            <OuiTitle size="m">
              <h1>{greeting}</h1>
            </OuiTitle>

            <OuiText size="s" style={{ maxWidth: 640, width: '100%', marginLeft: 'auto' }}>
              <p>
                {textLines.map((line, i) => {
                  const typed = typedLines[i];
                  const isSpinning = spinningLineIdx === i;
                  let content;
                  if (typed) {
                    if (line.boldStart >= 0 && typed.length > line.boldStart) {
                      const before = typed.slice(0, line.boldStart);
                      const boldPart = typed.slice(line.boldStart, Math.min(typed.length, line.boldEnd));
                      const after = typed.length > line.boldEnd ? typed.slice(line.boldEnd) : '';
                      content = <>{before}<strong>{boldPart}</strong>{after}</>;
                    } else {
                      content = typed;
                    }
                  }
                  return (
                    <span key={i} className={`emptySessionPage__textLine${typed || isSpinning ? ' emptySessionPage__textLine--visible' : ''}${typingLineIdx === i ? ' emptySessionPage__textLine--active' : ''}`}>
                      {isSpinning && !typed && <span className="emptySessionPage__textSpinner" />}
                      {content}
                    </span>
                  );
                })}
              </p>
            </OuiText>

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
              className="emptySessionPage__briefing"
              style={{ padding: 24, gap: 0 }}
              ref={briefingRef}
              onMouseLeave={() => {
                if (briefingRef.current) {
                  briefingRef.current.querySelectorAll('.emptySessionPage__briefingItem').forEach(el => { el.style.transform = ''; });
                  briefingRef.current.querySelectorAll('.emptySessionPage__briefingSeparator').forEach(el => { el.style.opacity = ''; });
                }
              }}>
              <OuiTabs size="s" display="condensed" style={{ maxWidth: 'fit-content' }}>
                <OuiTab isSelected={rightPanelTab === 'recent'} onClick={() => setRightPanelTab('recent')}>
                  Recent (3)
                </OuiTab>
                <OuiTab isSelected={rightPanelTab === 'insights'} onClick={() => setRightPanelTab('insights')}>
                  Insights
                </OuiTab>
              </OuiTabs>

              {rightPanelTab === 'recent' && (
                <>
              <div
                className="emptySessionPage__briefingItem"
                onClick={() => onSelectSession(CHIP_DATA.activity[0].sessionId)}
                onMouseEnter={() => handleBriefingHover(0)}
                onMouseDown={() => handleBriefingMouseDown(0)}
                onMouseUp={() => handleBriefingHover(0)}>
                <OuiText size="s">
                  <p><strong>Payment service P99 latency breach</strong></p>
                  <p>P99 crossed 2,000ms with connection pool exhaustion on 3 of 4 pods. I've started an investigation and identified a likely root cause.</p>
                  <p style={{ fontSize: 10.5, opacity: 0.6 }}>Created by AI · 15 min ago</p>
                </OuiText>
                <span className="emptySessionPage__briefingArrow">→</span>
              </div>

              <div className="emptySessionPage__briefingSeparator" />

              <div
                className="emptySessionPage__briefingItem"
                onClick={() => onSelectSession(CHIP_DATA.activity[1].sessionId)}
                onMouseEnter={() => handleBriefingHover(1)}
                onMouseDown={() => handleBriefingMouseDown(1)}
                onMouseUp={() => handleBriefingHover(1)}>
                <OuiText size="s">
                  <p><strong>Error Rate Spike — Checkout Service</strong></p>
                  <p>Checkout error rate spiked to 12.4% around the same time. Auth-service deployment regression identified.</p>
                  <p style={{ fontSize: 10.5, opacity: 0.6 }}>Shared by team · 2 hours ago</p>
                </OuiText>
                <span className="emptySessionPage__briefingArrow">→</span>
              </div>

              <div className="emptySessionPage__briefingSeparator" />

              <div
                className="emptySessionPage__briefingItem"
                onMouseEnter={() => handleBriefingHover(2)}
                onMouseDown={() => handleBriefingMouseDown(2)}
                onMouseUp={() => handleBriefingHover(2)}>
                <OuiText size="s">
                  <p><strong>DNS Resolution Timeout</strong></p>
                  <p>Resolved after the upstream fix was deployed. No further action needed.</p>
                  <p style={{ fontSize: 10.5, opacity: 0.6 }}>Resolved · 3 hours ago</p>
                </OuiText>
                <span className="emptySessionPage__briefingArrow">→</span>
              </div>
                </>
              )}

              {rightPanelTab === 'insights' && (
                <div className="emptySessionPage__insightsGrid">
                  <OuiInsightCard title="P99 Latency" titleExtra={<span style={{ color: '#d97706', fontWeight: 600, fontSize: 12 }}>2,041ms</span>}>
                    <svg viewBox="0 0 200 40" style={{ width: '100%', height: 40 }}>
                      <polyline fill="none" stroke="#d97706" strokeWidth="2" strokeLinejoin="round" points="0,30 20,28 40,26 60,24 80,22 100,20 120,18 140,14 160,8 180,4 200,2" />
                      <polyline fill="none" stroke="rgba(217,119,6,0.2)" strokeWidth="1" strokeDasharray="3,3" points="0,20 200,20" />
                    </svg>
                  </OuiInsightCard>
                  <OuiInsightCard title="Error Rate" titleExtra={<span style={{ color: '#dc2626', fontWeight: 600, fontSize: 12 }}>12.4%</span>}>
                    <svg viewBox="0 0 200 40" style={{ width: '100%', height: 40 }}>
                      <polyline fill="none" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round" points="0,35 20,34 40,32 60,30 80,28 100,30 120,20 140,10 160,6 180,8 200,5" />
                      <polyline fill="none" stroke="rgba(220,38,38,0.2)" strokeWidth="1" strokeDasharray="3,3" points="0,28 200,28" />
                    </svg>
                  </OuiInsightCard>
                  <OuiInsightCard title="Throughput" titleExtra={<span style={{ color: '#10b981', fontWeight: 600, fontSize: 12 }}>1.2k rps</span>}>
                    <svg viewBox="0 0 200 40" style={{ width: '100%', height: 40 }}>
                      <polyline fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" points="0,20 20,18 40,22 60,19 80,21 100,17 120,20 140,18 160,19 180,20 200,18" />
                      <polyline fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="1" strokeDasharray="3,3" points="0,20 200,20" />
                    </svg>
                  </OuiInsightCard>
                  <OuiInsightCard title="CPU Utilization" titleExtra={<span style={{ color: '#6366f1', fontWeight: 600, fontSize: 12 }}>67%</span>}>
                    <svg viewBox="0 0 200 40" style={{ width: '100%', height: 40 }}>
                      <polyline fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" points="0,25 20,22 40,24 60,20 80,18 100,22 120,16 140,14 160,18 180,15 200,13" />
                      <polyline fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="3,3" points="0,20 200,20" />
                    </svg>
                  </OuiInsightCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
