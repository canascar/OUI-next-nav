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

import React, { useRef, useState } from 'react';
import {
  OuiButtonIcon,
  OuiFieldText,
  OuiIcon,
  OuiPopover,
  OuiToolTip,
} from '../../../../src/components';
import { SOURCE_PAGE_MOCK } from './session_models';
import { DetailPageHeader } from './detail_page_header';
import { NewTabPage } from './new_tab_page';
import { OllyAvatar } from './olly_avatar';

/**
 * Icon mapping for page keys.
 */
export const PAGE_TAB_ICONS = {
  logs: 'navDiscover',
  alerts: 'navAlerting',
  'alerts-list': 'navAlerting',
  'alerts-detail': 'navAlerting',
  'alert-rule': 'navAlerting',
  dashboards: 'navDashboards',
  'dashboards-list': 'navDashboards',
  notebooks: 'document',
  metrics: 'visLine',
  discover: 'navDiscover',
  'discover-log': 'navDiscover',
  'discover-log-correlated': 'navDiscover',
  'discover-metric': 'visArea',
  'app-map': 'navServiceMap',
  'app-traces': 'apmTrace',
  'app-services': 'navOverview',
  'app-perf-services': 'navOverview',
  'service-detail': 'navOverview',
  traces: 'visTagCloud',
  forecasting: 'visLine',
  'agent-spans': 'visTagCloud',
  'new-tab': 'folderClosed',
};

/**
 * TabBar — Renders the horizontal tab bar with individual tabs and an add-tab button.
 *
 * @param {Object} props
 * @param {import('./session_models').PageTab[]} props.tabs - Open tabs
 * @param {string|null} props.activeTabId - Currently active tab ID
 * @param {(tabId: string) => void} props.onTabSelect - Tab selection handler
 * @param {(tabId: string) => void} props.onTabClose - Tab close handler
 * @param {() => void} props.onAddTab - Add new tab handler
 */
const TabBar = ({ tabs, activeTabId, onTabSelect, onTabClose, onAddTab, onExpandChat, aiButtonHighlight, aiButtonMessage, onDismissAiPopover }) => {
  const tabListRef = useRef(null);
  const [isListOpen, setIsListOpen] = useState(false);

  const handleKeyDown = (e, tabId, index) => {
    const tabElements = tabListRef.current?.querySelectorAll('[role="tab"]');
    if (!tabElements) return;

    let targetIndex = -1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = index < tabElements.length - 1 ? index + 1 : 0;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = index > 0 ? index - 1 : tabElements.length - 1;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabSelect(tabId);
      return;
    }

    if (targetIndex >= 0 && tabElements[targetIndex]) {
      tabElements[targetIndex].focus();
    }
  };

  return (
    <div className="pagePanel__tabBar">
      {onExpandChat && (
        <div className="pagePanel__aiButton" onClick={onExpandChat}>
          <OuiIcon type="chatLeft" size="m" />
        </div>
      )}
      <div
        className="pagePanel__tabList"
        role="tablist"
        aria-label="Open pages"
        ref={tabListRef}>
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          return (
            <React.Fragment key={tab.id}>
              {index > 0 && <div className="pagePanel__tabSeparator" />}
              <div
                role="tab"
                aria-selected={isActive}
                aria-label={tab.title}
                tabIndex={isActive ? 0 : -1}
                className={`pagePanel__tab${
                  isActive ? ' pagePanel__tab--active' : ''
                }`}
                onClick={() => onTabSelect(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id, index)}>
                <OuiIcon type={PAGE_TAB_ICONS[tab.pageKey] || 'folderClosed'} size="s" />
                <span className="pagePanel__tabTitle">{tab.title}</span>
                {isActive && (
                  <button
                    className="pagePanel__tabClose"
                    aria-label={`Close ${tab.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                    tabIndex={-1}>
                    <OuiIcon
                      type="cross"
                      size="s"
                    />
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}
        {tabs.length > 0 && <div className="pagePanel__tabSeparator" />}
        <OuiButtonIcon
          iconType="plus"
          aria-label="Add new tab"
          size="s"
          color="text"
          display="empty"
          onClick={onAddTab}
          className="pagePanel__addTabButton"
        />
      </div>

      {/* List icon — far right, shows popover with all tabs */}
      <div className="pagePanel__tabListAction">
        <OuiPopover
          button={
            <OuiButtonIcon
              iconType="list"
              aria-label="Browse all tabs"
              size="s"
              color="text"
              display="empty"
              isDisabled={tabs.length === 0}
              onClick={() => setIsListOpen((open) => !open)}
            />
          }
          isOpen={isListOpen}
          closePopover={() => setIsListOpen(false)}
          anchorPosition="downRight"
          panelPaddingSize="s">
          <div className="pagePanel__tabListPopover">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`pagePanel__tabListItem${
                  tab.id === activeTabId
                    ? ' pagePanel__tabListItem--active'
                    : ''
                }`}
                onClick={() => {
                  onTabSelect(tab.id);
                  setIsListOpen(false);
                }}>
                {tab.title}
              </button>
            ))}
          </div>
        </OuiPopover>
      </div>
    </div>
  );
};

/**
 * PagePanel — Manages browser-like tabs and renders page content.
 *
 * Renders a TabBar at the top showing all open tabs with close buttons and an add-tab button.
 * Below the tab bar, renders the active tab's content:
 * - If the active tab's pageKey is 'new-tab', renders NewTabPage
 * - Otherwise, looks up the component from SOURCE_PAGE_MOCK and renders it
 *
 * @param {Object} props
 * @param {import('./session_models').PageTab[]} props.tabs - Open page tabs
 * @param {string|null} props.activeTabId - Currently active tab ID
 * @param {(tabId: string) => void} props.onTabSelect - Tab selection handler
 * @param {(tabId: string) => void} props.onTabClose - Tab close handler
 * @param {() => void} props.onAddTab - Add new tab handler
 * @param {(pageKey: string, title: string) => void} props.onSelectPage - Loads a page in the current active tab (from NewTabPage)
 */
export const PagePanel = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onAddTab,
  onSelectPage,
  onOpenCanvasPage,
  onExpandChat,
  aiButtonHighlight,
  aiButtonMessage,
  onDismissAiPopover,
  onQueryExecute,
}) => {
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const [floatingInput, setFloatingInput] = useState('');
  const [isFloatingExpanded, setIsFloatingExpanded] = useState(false);
  const [ollyHovered, setOllyHovered] = useState(false);

  /** Render the content for the active tab */
  const renderTabContent = () => {
    if (!activeTab) {
      return (
        <div className="pagePanel__empty">
          <p>No tabs open. Click + to open a new tab.</p>
        </div>
      );
    }

    if (activeTab.pageKey === 'new-tab') {
      return <NewTabPage onSelectPage={onSelectPage} />;
    }

    const pageEntry = SOURCE_PAGE_MOCK[activeTab.pageKey];
    if (!pageEntry) {
      return (
        <div className="pagePanel__empty">
          <p>Page not found: {activeTab.pageKey}</p>
        </div>
      );
    }

    const PageComponent = pageEntry.component;

    // Pages that have their own header — skip DetailPageHeader
    const PAGES_WITH_OWN_HEADER = new Set(['discover-log', 'discover-log-correlated', 'discover-metric', 'app-perf-services']);
    const skipHeader = PAGES_WITH_OWN_HEADER.has(activeTab.pageKey);

    // List pages that need onSelectPage callback
    const LIST_PAGES = new Set(['dashboards-list', 'alerts-list', 'app-perf-services', 'service-detail']);
    const isListPage = LIST_PAGES.has(activeTab.pageKey);

    return (
      <div className="pagePanel__canvasWrapper">
        {!skipHeader && <DetailPageHeader title={activeTab.title} hideAskAi />}
        <div className="pagePanel__canvasContent">
          <PageComponent
            onQueryExecute={(skipHeader || isListPage) ? onQueryExecute : undefined}
            onSelectPage={isListPage ? onSelectPage : undefined}
            onOpenCanvasPage={isListPage ? onOpenCanvasPage : undefined}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="pagePanel" role="region" aria-label="Page panel">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onTabClose={onTabClose}
        onAddTab={onAddTab}
        onExpandChat={onExpandChat}
      />
      <div
        className="pagePanel__content"
        role="tabpanel"
        aria-label={activeTab ? activeTab.title : 'No tab selected'}>
        {renderTabContent()}
      </div>
      {onExpandChat && (
        <div
          className={`pagePanel__floatingBar${(aiButtonHighlight && aiButtonMessage) || isFloatingExpanded ? ' pagePanel__floatingBar--expanded' : ''}`}
          onMouseEnter={() => setOllyHovered(true)}
          onMouseLeave={() => setOllyHovered(false)}>
          {aiButtonHighlight && aiButtonMessage && (
            <div className="pagePanel__aiPopover" onClick={onExpandChat}>
              <div className="pagePanel__aiPopoverInner">
                <p className="pagePanel__aiPopoverText">{aiButtonMessage}</p>
              </div>
              <button
                type="button"
                className="pagePanel__floatingDismiss"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismissAiPopover && onDismissAiPopover();
                }}>
                <OuiIcon type="cross" size="s" />
              </button>
            </div>
          )}
          <div className="pagePanel__floatingInputRow">
            <button
              type="button"
              className={`pagePanel__floatingMascot${aiButtonHighlight ? ' pagePanel__floatingMascot--highlight' : ''}`}
              aria-label="Open AI chat"
              onClick={onExpandChat}>
              <OllyAvatar size={28} highlight={ollyHovered} />
            </button>
            <OuiFieldText
              placeholder="Ask AI anything"
              value={floatingInput}
              onChange={(e) => setFloatingInput(e.target.value)}
              onFocus={() => setIsFloatingExpanded(true)}
              onBlur={() => { if (!floatingInput.trim()) setIsFloatingExpanded(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && floatingInput.trim()) {
                  e.preventDefault();
                  onExpandChat(floatingInput.trim());
                  setFloatingInput('');
                  setIsFloatingExpanded(false);
                }
              }}
              className="pagePanel__floatingSearch"
              compressed
            />
          </div>
        </div>
      )}
    </div>
  );
};
