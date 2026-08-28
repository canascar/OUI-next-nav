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

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  OuiButtonIcon,
  OuiIcon,
  OuiPopover,
  OuiToolTip,
} from '../../../../src/components';
import { SOURCE_PAGE_MOCK } from './session_models';
import { DetailPageHeader } from './detail_page_header';
import { NewTabPage } from './new_tab_page';

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
  'new-ppl-log': 'navDiscover',
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
  'poc-frontend-p95-report': 'document',
  'new-tab': 'folderClosed',
};

/**
 * TabBar — [collapse chevron] [tabs…] [＋] [spacer] [☰ list].
 *
 * The tab list never wraps or scrolls horizontally: the ☰ dropdown is the
 * overflow story.
 *
 * @param {Object} props
 * @param {import('./session_models').PageTab[]} props.tabs - Open tabs
 * @param {string|null} props.activeTabId - Currently active tab ID
 * @param {(tabId: string) => void} props.onTabSelect - Tab selection handler
 * @param {(tabId: string) => void} props.onTabClose - Tab close handler
 * @param {() => void} props.onAddTab - Add new tab handler
 * @param {() => void} props.onCollapsePanel - Closes the panel, keeping tab state
 */
const TabBar = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onAddTab,
  onReorderTabs,
  onCollapsePanel,
  onToggleChat,
  isChatOpen,
}) => {
  const tabListRef = useRef(null);
  const [isListOpen, setIsListOpen] = useState(false);
  // Pointer-based drag-to-reorder (browser-style): the dragged tab follows the
  // cursor and neighbors slide aside to open the gap. Native HTML5 DnD is
  // avoided because hiding its ghost / toggling pointer-events is unreliable.
  const dragRef = useRef(null); // mutable: { index, startX, slotWidth, active, targetIndex }
  const [drag, setDrag] = useState(null); // render state: { index, dx, targetIndex, slotWidth }
  const tabsRef = useRef(tabs);
  const onReorderRef = useRef(onReorderTabs);
  const onSelectRef = useRef(onTabSelect);
  tabsRef.current = tabs;
  onReorderRef.current = onReorderTabs;
  onSelectRef.current = onTabSelect;

  const handleDragMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d) return;
    let dx = e.clientX - d.startX;
    if (!d.active) {
      // Small threshold so a plain click still selects rather than dragging.
      if (Math.abs(dx) < 4) return;
      d.active = true;
      document.body.style.userSelect = 'none';
    }
    const n = tabsRef.current.length;
    const maxRight = (n - 1 - d.index) * d.slotWidth;
    const maxLeft = -d.index * d.slotWidth;
    dx = Math.max(maxLeft, Math.min(maxRight, dx));
    const targetIndex = d.slotWidth
      ? d.index + Math.round(dx / d.slotWidth)
      : d.index;
    d.targetIndex = targetIndex;
    setDrag({ index: d.index, dx, targetIndex, slotWidth: d.slotWidth });
  }, []);

  const handleDragEnd = useCallback(() => {
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    document.body.style.userSelect = '';
    const d = dragRef.current;
    dragRef.current = null;
    if (d && d.active) {
      const to = d.targetIndex;
      if (to != null && to !== d.index && onReorderRef.current) {
        const next = [...tabsRef.current];
        const [moved] = next.splice(d.index, 1);
        next.splice(to, 0, moved);
        onReorderRef.current(next);
      }
    } else if (d && onSelectRef.current) {
      // No movement — treat as a click and select the tab.
      const tab = tabsRef.current[d.index];
      if (tab) onSelectRef.current(tab.id);
    }
    setDrag(null);
  }, [handleDragMove]);

  const handleTabMouseDown = useCallback(
    (e, index) => {
      if (e.button !== 0) return;
      if (e.target.closest && e.target.closest('.pagePanel__tabClose')) return;
      const list = tabListRef.current;
      const tabEls = list ? list.querySelectorAll('.pagePanel__tab') : null;
      let slotWidth = 0;
      if (tabEls && tabEls[index]) {
        const rect = tabEls[index].getBoundingClientRect();
        const sib = tabEls[index + 1] || tabEls[index - 1];
        slotWidth = sib
          ? Math.abs(sib.getBoundingClientRect().left - rect.left)
          : rect.width;
      }
      dragRef.current = {
        index,
        startX: e.clientX,
        slotWidth,
        active: false,
        targetIndex: index,
      };
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    },
    [handleDragMove, handleDragEnd]
  );

  // Clean up window listeners if we unmount mid-drag.
  useEffect(
    () => () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    },
    [handleDragMove, handleDragEnd]
  );

  // Per-tab horizontal offset during a drag.
  const getTabTransform = (i) => {
    if (!drag) return 0;
    if (i === drag.index) return drag.dx; // dragged tab follows the cursor
    const { index: di, targetIndex: ti, slotWidth } = drag;
    if (ti > di && i > di && i <= ti) return -slotWidth;
    if (ti < di && i < di && i >= ti) return slotWidth;
    return 0;
  };

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
      {/* Chat bubble toggle — left of tabs */}
      {onToggleChat && (
        <OuiToolTip content={isChatOpen ? 'Hide chat' : 'Show chat'} position="bottom">
          <OuiButtonIcon
            iconType="editorComment"
            aria-label={isChatOpen ? 'Hide chat' : 'Show chat'}
            size="xs"
            color={isChatOpen ? 'primary' : 'text'}
            display="empty"
            onClick={onToggleChat}
            className={`pagePanel__chatToggle${isChatOpen ? ' pagePanel__chatToggle--active' : ''}`}
          />
        </OuiToolTip>
      )}

      <div
        className={`pagePanel__tabList${
          drag ? ' pagePanel__tabList--reordering' : ''
        }`}
        role="tablist"
        aria-label="Open pages"
        ref={tabListRef}>
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.title}
              tabIndex={isActive ? 0 : -1}
              className={`pagePanel__tab${
                isActive ? ' pagePanel__tab--active' : ''
              }${
                drag && drag.index === index ? ' pagePanel__tab--dragging' : ''
              }`}
              style={{
                transform: getTabTransform(index)
                  ? `translateX(${getTabTransform(index)}px)`
                  : undefined,
                // The dragged tab tracks the cursor 1:1 (no transition);
                // neighbors keep their CSS transition for the slide.
                transition: drag && drag.index === index ? 'none' : undefined,
              }}
              onMouseDown={(e) => handleTabMouseDown(e, index)}
              onKeyDown={(e) => handleKeyDown(e, tab.id, index)}>
              <OuiIcon
                type={PAGE_TAB_ICONS[tab.pageKey] || 'folderClosed'}
                size="s"
              />
              <span className="pagePanel__tabTitle">{tab.title}</span>
              <button
                className="pagePanel__tabClose"
                aria-label={`Close ${tab.title}`}
                title={`Close ${tab.title}`}
                // Closing must not also select — the mousedown drag handler
                // treats a plain click as a select, so stop it here too.
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                tabIndex={-1}>
                <OuiIcon type="cross" size="s" />
              </button>
            </div>
          );
        })}

        <OuiToolTip content="Add new tab" position="bottom">
          <OuiButtonIcon
            iconType="cross"
            aria-label="Add new tab"
            size="xs"
            color="text"
            display="empty"
            onClick={onAddTab}
            className="pagePanel__addTabButton"
          />
        </OuiToolTip>
      </div>

      {/* ☰ list — far right; the overflow story for a bar that never scrolls */}
      <div className="pagePanel__tabListAction">
        <OuiToolTip content={isListOpen ? '' : 'View tabs'} position="bottom">
          <OuiPopover
            button={
              <OuiButtonIcon
                iconType="list"
                aria-label="View tabs"
                size="xs"
                color="text"
                display="empty"
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
                  <OuiIcon
                    type={PAGE_TAB_ICONS[tab.pageKey] || 'folderClosed'}
                    size="s"
                  />
                  <span>{tab.title}</span>
                </button>
              ))}
              <button
                type="button"
                className="pagePanel__tabListItem pagePanel__tabListItem--new"
                onClick={() => {
                  onAddTab();
                  setIsListOpen(false);
                }}>
                <OuiIcon type="plus" size="s" />
                <span>Add new tab</span>
              </button>
            </div>
          </OuiPopover>
        </OuiToolTip>
      </div>

      {/* ✕ Close canvas — Option F: the control lives inside the panel it affects */}
      {onCollapsePanel && (
        <OuiButtonIcon
          iconType="cross"
          aria-label="Close canvas"
          size="xs"
          color="text"
          display="empty"
          onClick={onCollapsePanel}
          className="pagePanel__closeButton"
        />
      )}
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
 * @param {() => void} props.onCollapsePanel - Closes the panel from the tab bar chevron
 */
export const PagePanel = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onAddTab,
  onReorderTabs,
  onSelectPage,
  onOpenCanvasPage,
  onCollapsePanel,
  onQueryExecute,
  onToggleChat,
  isChatOpen,
}) => {
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

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
      return <NewTabPage key={activeTab.id} onSelectPage={onSelectPage} />;
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
    const PAGES_WITH_OWN_HEADER = new Set([
      'discover-log',
      'new-ppl-log',
      'discover-log-correlated',
      'discover-metric',
      'app-perf-services',
    ]);
    const skipHeader = PAGES_WITH_OWN_HEADER.has(activeTab.pageKey);

    // List pages that need onSelectPage callback
    const LIST_PAGES = new Set([
      'dashboards-list',
      'alerts-list',
      'app-perf-services',
      'service-detail',
    ]);
    const isListPage = LIST_PAGES.has(activeTab.pageKey);

    return (
      <div className="pagePanel__canvasWrapper">
        {!skipHeader && (
          <DetailPageHeader
            title={activeTab.title}
            hideAskAi
            headerControls={
              activeTab.pageKey === 'overview-home' ? (
                <OuiButtonIcon
                  iconType="refresh"
                  aria-label="Refresh"
                  size="s"
                  color="text"
                  display="empty"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('overview-home-refresh')
                    );
                  }}
                />
              ) : undefined
            }
            firstActionLabel={
              activeTab.pageKey === 'overview-home'
                ? 'Edit widgets'
                : 'Settings'
            }
            onFirstAction={
              activeTab.pageKey === 'overview-home'
                ? () => {
                    window.dispatchEvent(
                      new CustomEvent('overview-home-edit-toggle')
                    );
                  }
                : undefined
            }
          />
        )}
        <div className="pagePanel__canvasContent">
          <PageComponent
            onQueryExecute={
              skipHeader || isListPage ? onQueryExecute : undefined
            }
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
        onReorderTabs={onReorderTabs}
        onCollapsePanel={onCollapsePanel}
        onToggleChat={onToggleChat}
        isChatOpen={isChatOpen}
      />
      <div
        className="pagePanel__content"
        key={activeTab ? activeTab.id : 'empty'}
        role="tabpanel"
        aria-label={activeTab ? activeTab.title : 'No tab selected'}>
        {renderTabContent()}
      </div>
    </div>
  );
};
