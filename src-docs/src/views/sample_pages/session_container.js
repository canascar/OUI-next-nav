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
  useCallback,
  useRef,
  useState,
  useEffect,
  useContext,
} from 'react';

import { OuiIcon, OuiOllyChatPill } from '../../../../src/components';
import { ThreadPanel } from './thread_panel';
import { ResizeHandle } from './resize_handle';
import { PagePanel } from './page_panel';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

const makeTabId = () =>
  `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * SessionContainer — One shell topbar above two panels.
 * Topbar: breadcrumb on the left, Share + the single Views trigger on the right.
 * The topbar and the left nav rail never scroll — they sit outside the panels,
 * and only panel content scrolls.
 * Left: Chat panel (ThreadPanel). Right: Page panel (PagePanel) with its tabs.
 */
export const SessionContainer = ({
  session,
  onUpdateSession,
  onOpenCanvasPage,
  onGoBack,
}) => {
  const { threadPanelState, threadPanelWidth } = session;
  const threadPanelRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
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

  // Proactive message — trigger when session loads with canvas open + chat minimized (e.g. from library)
  const proactiveTriggeredRef = useRef(false);
  useEffect(() => {
    if (
      threadPanelState === 'minimized' &&
      session.tabs &&
      session.tabs.length > 0 &&
      !session.threadKey &&
      !proactiveTriggeredRef.current
    ) {
      proactiveTriggeredRef.current = true;
      const proactiveMessage =
        'I noticed you opened this page. Want me to summarize the key metrics or help you explore the data?';
      const proactiveTimer = setTimeout(() => {
        setAiButtonHighlight(true);
        setAiPopoverVisible(true);
        setAiPopoverText('');
        setPendingAiResponse({ prompt: '', response: proactiveMessage });

        // Stream word by word
        const words = proactiveMessage.split(' ');
        let built = '';
        words.forEach((word, i) => {
          const timer = setTimeout(() => {
            built += (i === 0 ? '' : ' ') + word;
            setAiPopoverText(built);
          }, i * 40);
          streamTimersRef.current.push(timer);
        });
      }, 2000);
      return () => clearTimeout(proactiveTimer);
    }
  }, [threadPanelState, session.tabs, session.threadKey]);

  // Trigger animation; auto-clear after 300ms
  const triggerAnimation = useCallback(() => {
    setIsAnimating(true);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => setIsAnimating(false), 550);
  }, []);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      streamTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  /** Called when a page executes a query that should trigger AI insight */
  const handleQueryExecute = useCallback(
    (queryText) => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      streamTimersRef.current.forEach(clearTimeout);
      streamTimersRef.current = [];
      const mockResponse =
        'I see 847 connection timeout errors to payments-db starting at 14:30. Want me to check the trace data for this dependency?';

      if (threadPanelState !== 'minimized') {
        // Chat pane is already open — show the message directly after 1s with streaming
        highlightTimerRef.current = setTimeout(() => {
          const threadKey = `thread-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`;
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
    },
    [threadPanelState, onUpdateSession]
  );

  /** Handle expand chat — if AI highlight is active, create thread with mock response */
  const handleExpandChat = useCallback(
    (prompt) => {
      // If prompt is an event object (from onClick), treat as no prompt
      const actualPrompt = typeof prompt === 'string' ? prompt : null;
      triggerAnimation();

      if (aiButtonHighlight && pendingAiResponse) {
        // Clear highlight state
        setAiButtonHighlight(false);
        setAiPopoverVisible(false);
        streamTimersRef.current.forEach(clearTimeout);
        streamTimersRef.current = [];
        // Expand chat with the AI response + optional user prompt after it
        const threadKey = `thread-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`;
        const messages = [
          {
            role: 'assistant',
            content: pendingAiResponse.response,
            streaming: false,
          },
        ];
        const pendingThread = {
          key: threadKey,
          messages,
          sourcePageTitle: 'Discover (log)',
        };
        onUpdateSession({
          threadPanelState: 'side-by-side',
          threadKey,
          pendingThread,
          pendingInputValue: actualPrompt || undefined,
        });
        setPendingAiResponse(null);
      } else if (actualPrompt) {
        onUpdateSession({
          threadPanelState: 'side-by-side',
          pendingInputValue: actualPrompt,
        });
      } else {
        onUpdateSession({ threadPanelState: 'side-by-side' });
      }
    },
    [triggerAnimation, onUpdateSession, aiButtonHighlight, pendingAiResponse]
  );

  const handleDismissAiPopover = useCallback(() => {
    setAiButtonHighlight(false);
    setAiPopoverVisible(false);
    setPendingAiResponse(null);
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

  const handleTabSelect = useCallback(
    (tabId) => {
      onUpdateSession({ activeTabId: tabId });
    },
    [onUpdateSession]
  );

  const handleTabClose = useCallback(
    (tabId) => {
      const closedIndex = session.tabs.findIndex((tab) => tab.id === tabId);
      const updatedTabs = session.tabs.filter((tab) => tab.id !== tabId);
      const updates = { tabs: updatedTabs };
      if (session.activeTabId === tabId) {
        if (updatedTabs.length === 0) {
          // Last tab gone — the panel closes with it.
          updates.activeTabId = null;
          updates.threadPanelState = 'full-screen';
          triggerAnimation();
        } else {
          // Activate the left neighbor (the first tab has no left neighbor,
          // so it hands off to what slid into its place).
          const neighborIndex = Math.max(0, closedIndex - 1);
          updates.activeTabId = updatedTabs[neighborIndex].id;
        }
      }
      onUpdateSession(updates);
    },
    [session.tabs, session.activeTabId, onUpdateSession, triggerAnimation]
  );

  const handleAddTab = useCallback(() => {
    const newTab = { id: makeTabId(), pageKey: 'new-tab', title: 'New Tab' };
    onUpdateSession({
      tabs: [...session.tabs, newTab],
      activeTabId: newTab.id,
    });
  }, [session.tabs, onUpdateSession]);

  /**
   * The panel's one open/close affordance, shared by the header trigger and the
   * in-panel collapse chevron. Tabs and the active tab are never touched, so
   * state survives a collapse/reopen round trip untouched.
   */
  const handleTogglePanel = useCallback(() => {
    triggerAnimation();
    if (threadPanelState !== 'full-screen') {
      onUpdateSession({ threadPanelState: 'full-screen' });
      return;
    }
    const updates = { threadPanelState: 'side-by-side', threadPanelWidth: 34 };
    if (session.tabs.length === 0) {
      // Nothing to come back to — open on a fresh New Tab.
      const newTab = { id: makeTabId(), pageKey: 'new-tab', title: 'New Tab' };
      updates.tabs = [newTab];
      updates.activeTabId = newTab.id;
    }
    onUpdateSession(updates);
  }, [threadPanelState, session.tabs, onUpdateSession, triggerAnimation]);

  /** Minimize the chat pane — canvas takes full width, Olly pill appears. */
  const handleMinimize = useCallback(() => {
    triggerAnimation();
    onUpdateSession({ threadPanelState: 'minimized' });
  }, [onUpdateSession, triggerAnimation]);

  const handleReorderTabs = useCallback(
    (nextTabs) => {
      onUpdateSession({ tabs: nextTabs });
    },
    [onUpdateSession]
  );

  const handleViewAction = useCallback(
    (pageKey, title) => {
      onOpenCanvasPage(pageKey, title);
      // If the chat is fully expanded (canvas collapsed), reveal the canvas
      // half-way so the newly opened page is visible.
      if (threadPanelState === 'full-screen') {
        triggerAnimation();
        onUpdateSession({
          threadPanelState: 'side-by-side',
          threadPanelWidth: 50,
        });
      }
    },
    [onOpenCanvasPage, onUpdateSession, threadPanelState, triggerAnimation]
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

  // Delay the chat icon from "active" to "default" after closing chat
  const [chatIconActive, setChatIconActive] = useState(!isMinimized);
  const chatIconTimerRef = useRef(null);
  useEffect(() => {
    if (chatIconTimerRef.current) clearTimeout(chatIconTimerRef.current);
    if (isSideBySide) {
      setChatIconActive(true);
    } else {
      chatIconTimerRef.current = setTimeout(() => setChatIconActive(false), 500);
    }
    return () => {
      if (chatIconTimerRef.current) clearTimeout(chatIconTimerRef.current);
    };
  }, [isMinimized, isFullScreen, isSideBySide]);

  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  // Olly chat pill — show/hide based on minimized state
  const showPill = isMinimized;

  // Calculate explicit widths for both panes
  // Left pane: 0% when minimized, threadPanelWidth% when side-by-side, 100% when
  // the panel is collapsed. The collapsed panel takes no width at all — the
  // header trigger is its only affordance, so no rail is left behind.
  let leftWidth;
  let rightStyle;

  if (isMinimized) {
    leftWidth = '0px';
    rightStyle = { flex: 1 };
  } else if (isFullScreen) {
    leftWidth = '100%';
    rightStyle = { width: '0px', flex: 'none' };
  } else {
    leftWidth = `${threadPanelWidth}%`;
    rightStyle = { flex: 1 };
  }

  // Panel "open" means the tabs are visible. Collapsing it hands the width to
  // the chat (full-screen) without disturbing tabs or the active tab.
  const isPanelOpen = !isFullScreen;
  const tabCount = session.tabs.length;

  // Derive the display title for the chat header.
  // Priority: session.title (if real) > session.summary > null
  const displayTitle = (() => {
    if (session.title && session.title !== 'Home' && session.title !== 'New Session') {
      return session.title;
    }
    if (session.summary) {
      return session.summary;
    }
    return null;
  })();
  const showTopbarTitle = isFullScreen && !!displayTitle;

  // isHome for header: if session.isHome is true, the user hasn't started
  // chatting yet. Title/share/actions are hidden, only toggle shows.
  // Once the user sends a message, isHome flips to false via the
  // home-chat-started event and the title appears.
  const isHomeIdle = !!session.isHome;

  return (
    <div
      className={`sessionContainer${
        isMinimized ? ' sessionContainer--chatMinimized' : ''
      }${isEntering ? ' sessionContainer--entering' : ''}`}>
      {/* Mobile back button */}
      {onGoBack && (
        <button
          type="button"
          className="sessionContainer__mobileBack"
          onClick={onGoBack}
          aria-label="Back to home">
          <OuiIcon type="arrowLeft" size="m" />
        </button>
      )}

      {/* Topbar removed — title now lives inside the ThreadPanel header */}

      <div className="sessionContainer__panels">
        {/* Left: Chat panel */}
        <ThreadPanel
          ref={threadPanelRef}
          sizeState={threadPanelState}
          threadKey={session.threadKey}
          pendingThread={session.pendingThread}
          pendingInputValue={session.pendingInputValue}
          onViewAction={handleViewAction}
          width={leftWidth}
          isAnimating={isAnimating}
          title={displayTitle}
          titleGenerating={session.titleGenerating}
          showHeader={true}
          isHome={isHomeIdle}
          isPanelOpen={isPanelOpen}
          onTogglePanel={handleTogglePanel}
          onMinimize={handleMinimize}
          tabCount={tabCount}
          activeTabTitle={
            session.tabs.find((t) => t.id === session.activeTabId)?.title
          }
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
          }${
            isFullScreen ? ' sessionContainer__pagePanelWrap--collapsed' : ''
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
              onReorderTabs={handleReorderTabs}
              onSelectPage={handleSelectPage}
              onOpenCanvasPage={onOpenCanvasPage}
              onCollapsePanel={handleTogglePanel}
              onQueryExecute={handleQueryExecute}
              onToggleChat={() => {
                triggerAnimation();
                if (isMinimized) {
                  onUpdateSession({ threadPanelState: 'side-by-side' });
                } else {
                  onUpdateSession({ threadPanelState: 'minimized' });
                }
              }}
              isChatOpen={chatIconActive}
            />
          </div>
          {/* Olly chat pill — rendered inside page panel wrap for positioning */}
          {showPill && (
            <div className="sessionContainer__ollyChatPill">
              <OuiOllyChatPill
                avatar={
                  <Mascot
                    size={28}
                    idle
                    bob={false}
                    follow={false}
                    color={mascotColor}
                    eyeColor={mascotEyeColor}
                  />
                }
                avatarHover={
                  <Mascot
                    size={28}
                    expression="happy"
                    idle={false}
                    bob={false}
                    follow={false}
                    color={mascotColor}
                    eyeColor={mascotEyeColor}
                  />
                }
                avatarFocused={
                  <Mascot
                    size={28}
                    expression="blink"
                    idle={false}
                    bob={false}
                    follow={false}
                    color={mascotColor}
                    eyeColor={mascotEyeColor}
                  />
                }
                message={
                  aiButtonHighlight && aiPopoverVisible && aiPopoverText
                    ? aiPopoverText
                    : undefined
                }
                quickReplies={
                  aiButtonHighlight && aiPopoverVisible && aiPopoverText
                    ? [
                        { label: 'Yes, investigate', primary: true },
                        { label: 'Show me the data' },
                      ]
                    : undefined
                }
                isHighlighted={aiButtonHighlight}
                onDismiss={handleDismissAiPopover}
                onSubmit={(val) => handleExpandChat(val)}
                onActivate={(val) => handleExpandChat(val)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
