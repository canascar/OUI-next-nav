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
  OuiButton,
  OuiFieldSearch,
  OuiIcon,
  OuiText,
  OuiTitle,
  OuiToolTip,
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
    icon: 'sparkleFilled',
    action: 'thread',
  },
  {
    key: 'dashboards',
    label: 'Dashboards',
    icon: 'dashboardApp',
    action: 'page',
    pageKey: 'dashboards',
  },
  {
    key: 'logs',
    label: 'Logs',
    icon: 'logsApp',
    action: 'page',
    pageKey: 'logs',
  },
  {
    key: 'metrics',
    label: 'Metric',
    icon: 'visArea',
    action: 'page',
    pageKey: 'metrics',
  },
  {
    key: 'topology',
    label: 'Topology Map',
    icon: 'graphApp',
    action: 'page',
    pageKey: 'traces',
  },
  {
    key: 'apm',
    label: 'Application Performance',
    icon: 'apmApp',
    action: 'page',
    pageKey: 'traces',
  },
  {
    key: 'monitoring',
    label: 'Agent Monitoring',
    icon: 'monitoringApp',
    action: 'page',
    pageKey: 'alerts',
  },
  { key: 'more', label: 'More', icon: 'grid', action: 'more' },
];

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
      <div className="emptySessionPage__calloutContent">
        <OuiText size="s">
          <p>{alert.message}</p>
        </OuiText>
        <OuiButton
          size="s"
          color="danger"
          onClick={() => onAction(alert.actionTarget)}>
          {alert.actionLabel}
        </OuiButton>
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
const DualPurposeInput = ({ onStartThread, onOpenPage }) => {
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
        <OuiIcon type="plusInCircle" className="emptySessionPage__inputIcon" />
        <OuiFieldSearch
          placeholder="Ask AI or search a page"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleSubmit}
          fullWidth
          aria-label="Ask AI or search a page"
        />
      </div>
      {showSuggestions && matchingPages.length > 0 && (
        <div className="emptySessionPage__suggestions">
          {matchingPages.map(({ key, title }) => (
            <button
              key={key}
              className="emptySessionPage__suggestionItem"
              onClick={() => handleSelectPage(key)}>
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
          <OuiToolTip key={item.key} content={item.label} position="bottom">
            <button
              className="emptySessionPage__quickAccessButton"
              onClick={() => handleClick(item)}
              aria-label={item.label}>
              <OuiIcon type={item.icon} size="l" />
            </button>
          </OuiToolTip>
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
      <div className="emptySessionPage__tabHeaders" role="tablist">
        <button
          className={`emptySessionPage__tabHeader${
            activeTab === 'recent' ? ' emptySessionPage__tabHeader--active' : ''
          }`}
          role="tab"
          aria-selected={activeTab === 'recent'}
          onClick={() => setActiveTab('recent')}>
          Recent visit
        </button>
        <button
          className={`emptySessionPage__tabHeader${
            activeTab === 'favorites'
              ? ' emptySessionPage__tabHeader--active'
              : ''
          }`}
          role="tab"
          aria-selected={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}>
          Favorite
        </button>
      </div>
      <div className="emptySessionPage__tabContent" role="tabpanel">
        {items.length === 0 ? (
          <OuiText
            size="s"
            color="subdued"
            className="emptySessionPage__emptyList">
            <p>
              {activeTab === 'recent' ? 'No recent visits' : 'No favorites yet'}
            </p>
          </OuiText>
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
  recentItems = [],
  favoriteItems = [],
  systemAlert = null,
}) => {
  return (
    <div className="emptySessionPage">
      <div className="emptySessionPage__panel">
        {/* Welcome title */}
        <div className="emptySessionPage__header">
          <OuiTitle size="m">
            <h1>Welcome to OpenSearch Observability</h1>
          </OuiTitle>
        </div>

        {/* System callout */}
        <SystemCallout alert={systemAlert} onAction={onOpenPage} />

        {/* Dual-purpose input */}
        <DualPurposeInput
          onStartThread={onStartThread}
          onOpenPage={onOpenPage}
        />

        {/* Quick access row */}
        <QuickAccessRow onStartThread={onStartThread} onOpenPage={onOpenPage} />

        {/* Recent visit / Favorite tabs */}
        <RecentAndFavoriteTabs
          recentItems={recentItems}
          favoriteItems={favoriteItems}
          onOpenPage={onOpenPage}
        />
      </div>
    </div>
  );
};
