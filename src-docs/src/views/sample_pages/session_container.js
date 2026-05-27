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

import React, { useCallback, useRef, useState, useEffect } from 'react';

import {
  OuiButtonIcon,
  OuiPopover,
  OuiToolTip,
} from '../../../../src/components';
import { ThreadPanel } from './thread_panel';
import { ResizeHandle } from './resize_handle';
import { PagePanel, PAGE_TAB_ICONS } from './page_panel';

/**
 * SessionContainer — Two side-by-side panels, each with their own header.
 * Left: Chat panel (ThreadPanel) with its own header bar.
 * Right: Page panel (PagePanel) with its own tab bar.
 */
export const SessionContainer = ({
  session,
  onUpdateSession,
  onOpenCanvasPage,
}) => {
  const { threadPanelState, threadPanelWidth } = session;
  const threadPanelRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [isCollapsedListOpen, setIsCollapsedListOpen] = useState(false);
  const [aiButtonHighlight, setAiButtonHighlight] = useState(false);
  const [pendingAiResponse, setPendingAiResponse] = useState(null);
  const [aiPopoverVisible, setAiPopoverVisible] = useState(false);
  const [aiPopoverText, setAiPopoverText] = useState('');
  const animTimerRef = useRef(null);
  const highlightTimerRef = useRef(null);
  const streamTimersRef = useRef([]);

  // Clear entrance animation after it plays
  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // Trigger animation; auto-clear after 300ms
  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setIsAnimating(false), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      streamTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  /** Called when a page executes a query that should trigger AI insight */
  const handleQueryExecute = useCallback((queryText) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    streamTimersRef.current.forEach(clearTimeout);
    streamTimersRef.current = [];
    const mockResponse = 'I see 847 connection timeout errors to payments-db starting at 14:30. Want me to check the trace data for this dependency?';

    if (threadPanelState !== 'minimized') {
      // Chat pane is already open — show the message directly after 1s with streaming
      highlightTimerRef.current = setTimeout(() => {
        const threadKey = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const pendingThread = {
          key: threadKey,
          messages: [
            { role: 'assistant', content: mockResponse, streaming: false },
          ],
          sourcePageTitle: 'Discover (log)',
        };
        onUpdateSession({ threadKey, pendingThread });
      }, 1000);
    } else {
      // Chat pane is minimized — highlight icon and stream text in popover
      highlightTimerRef.current = setTimeout(() => {
        setAiButtonHighlight(true);
        setAiPopoverVisible(true);
        setAiPopoverText('');
        setPendingAiResponse({ prompt: queryText, response: mockResponse });

        // Stream word by word
        const words = mockResponse.split(' ');
        let built = '';
        words.forEach((word, i) => {
          const timer = setTimeout(() => {
            built += (i === 0 ? '' : ' ') + word;
            setAiPopoverText(built);
          }, i * 40);
          streamTimersRef.current.push(timer);
        });
      }, 1000);
    }
  }, [threadPanelState, onUpdateSession]);

  /** Handle expand chat — if AI highlight is active, create thread with mock response */
  const handleExpandChat = useCallback(() => {
    triggerAnimation();
    if (aiButtonHighlight && pendingAiResponse) {
      // Clear highlight state
      setAiButtonHighlight(false);
      setAiPopoverVisible(false);
      streamTimersRef.current.forEach(clearTimeout);
      streamTimersRef.current = [];
      // Expand chat and create pending thread with the mock response (no user message)
      const threadKey = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const pendingThread = {
        key: threadKey,
        messages: [
          { role: 'assistant', content: pendingAiResponse.response, streaming: false },
        ],
        sourcePageTitle: 'Discover (log)',
      };
      onUpdateSession({
        threadPanelState: 'side-by-side',
        threadKey,
        pendingThread,
      });
      setPendingAiResponse(null);
    } else {
      onUpdateSession({ threadPanelState: 'side-by-side' });
    }
  }, [triggerAnimation, onUpdateSession, aiButtonHighlight, pendingAiResponse]);

  const handleDismissAiPopover = useCallback(() => {
    setAiPopoverVisible(false);
    streamTimersRef.current.forEach(clearTimeout);
    streamTimersRef.current = [];
  }, []);

  const handleResize = useCallback((leftWidthPercent) => {
    if (threadPanelRef.current) {
      threadPanelRef.current.style.width = `${leftWidthPercent}%`;
    }
  }, []);

  const handleResizeCommit = useCallback(
    (leftWidthPercent) => {
      onUpdateSession({ threadPanelWidth: leftWidthPercent });
    },
    [onUpdateSession]
  );

  const handleSizeChange = useCallback(
    (newState) => {
      triggerAnimation();
      onUpdateSession({ threadPanelState: newState });
    },
    [onUpdateSession, triggerAnimation]
  );

  const handleTabSelect = useCallback(
    (tabId) => {
      onUpdateSession({ activeTabId: tabId });
    },
    [onUpdateSession]
  );

  const handleTabClose = useCallback(
    (tabId) => {
      const updatedTabs = session.tabs.filter((tab) => tab.id !== tabId);
      const updates = { tabs: updatedTabs };
      if (session.activeTabId === tabId) {
        updates.activeTabId =
          updatedTabs.length > 0
            ? updatedTabs[updatedTabs.length - 1].id
            : null;
      }
      onUpdateSession(updates);
    },
    [session.tabs, session.activeTabId, onUpdateSession]
  );

  const handleAddTab = useCallback(() => {
    const newTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      pageKey: 'new-tab',
      title: 'New Tab',
    };
    onUpdateSession({
      tabs: [...session.tabs, newTab],
      activeTabId: newTab.id,
    });
  }, [session.tabs, onUpdateSession]);

  const handleViewAction = useCallback(
    (pageKey, title) => {
      onOpenCanvasPage(pageKey, title);
    },
    [onOpenCanvasPage]
  );

  const handleSelectPage = useCallback(
    (pageKey, title) => {
      const updatedTabs = session.tabs.map((tab) =>
        tab.id === session.activeTabId ? { ...tab, pageKey, title } : tab
      );
      onUpdateSession({ tabs: updatedTabs });
    },
    [session.tabs, session.activeTabId, onUpdateSession]
  );

  const isMinimized = threadPanelState === 'minimized';
  const isFullScreen = threadPanelState === 'full-screen';
  const isSideBySide = threadPanelState === 'side-by-side';

  // Calculate explicit widths for both panes
  // Left pane: 0% when minimized, threadPanelWidth% when side-by-side, ~100% when full-screen
  // Right pane: gets the rest
  const COLLAPSED_WIDTH = 48; // px for collapsed strip
  let leftWidth;
  let rightStyle;

  if (isMinimized) {
    leftWidth = '0px';
    rightStyle = { flex: 1 };
  } else if (isFullScreen) {
    leftWidth = `calc(100% - ${COLLAPSED_WIDTH}px - 1px)`;
    rightStyle = { width: `${COLLAPSED_WIDTH}px`, flex: 'none' };
  } else {
    leftWidth = `${threadPanelWidth}%`;
    rightStyle = { flex: 1 };
  }

  return (
    <div
      className={`sessionContainer${
        isMinimized ? ' sessionContainer--chatMinimized' : ''
      }${isEntering ? ' sessionContainer--entering' : ''}`}>
      {/* Left: Chat panel */}
      <ThreadPanel
        ref={threadPanelRef}
        sizeState={threadPanelState}
        onSizeChange={handleSizeChange}
        threadKey={session.threadKey}
        pendingThread={session.pendingThread}
        onViewAction={handleViewAction}
        width={leftWidth}
        title={session.title}
        isAnimating={isAnimating}
        sessionSummary={session.summary}
        sessionTabs={session.tabs}
      />

      {/* Resize handle — only in side-by-side */}
      {isSideBySide && (
        <ResizeHandle
          onResize={handleResize}
          onResizeEnd={handleResizeCommit}
          isActive={isSideBySide}
        />
      )}

      {/* Right: Page panel */}
      <div
        className={`sessionContainer__pagePanelWrap${
          isAnimating ? ' sessionContainer__pagePanelWrap--animating' : ''
        }`}
        style={rightStyle}>
        <div
          style={{
            display: isFullScreen ? 'none' : 'flex',
            width: '100%',
            height: '100%',
          }}>
          <PagePanel
            tabs={session.tabs}
            activeTabId={session.activeTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
            onAddTab={handleAddTab}
            onSelectPage={handleSelectPage}
            onOpenCanvasPage={onOpenCanvasPage}
            onExpandChat={isMinimized ? handleExpandChat : undefined}
            aiButtonHighlight={aiButtonHighlight}
            aiButtonMessage={aiPopoverVisible ? aiPopoverText : null}
            onDismissAiPopover={handleDismissAiPopover}
            onQueryExecute={handleQueryExecute}
          />
        </div>
        <div
          className="sessionContainer__collapsedPanel"
          style={{ display: isFullScreen ? 'flex' : 'none' }}>
          <div className="sessionContainer__collapsedPanelHeader">
            <OuiPopover
              button={
                <OuiButtonIcon
                  iconType="list"
                  aria-label="Browse all tabs"
                  size="s"
                  color="text"
                  display="empty"
                  isDisabled={session.tabs.length === 0}
                  onClick={() => setIsCollapsedListOpen((open) => !open)}
                />
              }
              isOpen={isCollapsedListOpen}
              closePopover={() => setIsCollapsedListOpen(false)}
              anchorPosition="downRight"
              panelPaddingSize="s">
              <div className="pagePanel__tabListPopover">
                {session.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`pagePanel__tabListItem${
                      tab.id === session.activeTabId
                        ? ' pagePanel__tabListItem--active'
                        : ''
                    }`}
                    onClick={() => {
                      handleTabSelect(tab.id);
                      handleSizeChange('side-by-side');
                      setIsCollapsedListOpen(false);
                    }}>
                    {tab.title}
                  </button>
                ))}
              </div>
            </OuiPopover>
          </div>
          <div className="sessionContainer__collapsedTabs">
            {session.tabs.map((tab) => (
              <OuiToolTip key={tab.id} content={tab.title} position="left">
                <OuiButtonIcon
                  iconType={PAGE_TAB_ICONS[tab.pageKey] || 'folderClosed'}
                  aria-label={tab.title}
                  size="s"
                  color="text"
                  display="empty"
                  onClick={() => {
                    handleTabSelect(tab.id);
                    handleSizeChange('side-by-side');
                  }}
                />
              </OuiToolTip>
            ))}
            <OuiButtonIcon
              iconType="plus"
              aria-label="Add new tab"
              size="s"
              color="text"
              display="empty"
              onClick={() => {
                handleAddTab();
                handleSizeChange('side-by-side');
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
