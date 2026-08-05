/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  OuiButtonIcon,
  OuiCallOut,
  OuiCard,
  OuiCompressedTextArea,
  OuiContextMenu,
  OuiFlexGroup,
  OuiFlexItem,
  OuiIcon,
  OuiLink,
  OuiListGroup,
  OuiListGroupItem,
  OuiPage,
  OuiPageBody,
  OuiPanel,
  OuiPopover,
  OuiSpacer,
  OuiText,
  OuiTitle,
  OuiToolTip,
} from '../../../../src/components';

import { SessionLeftNav } from './session_left_nav';
import { SessionContainer } from './session_container';
import { SOURCE_PAGE_MOCK } from './session_models';
import {
  getPages,
  getPageById,
  findPages,
  getCapabilities,
  readQueryParam,
  recordVisit,
  getRecents,
  createSession,
  loadSessions,
  saveSessions,
  clampPaneWidth,
} from './mocks';

// Structural style shared by every full-screen sample-pages surface in this
// app (see SessionPagesView / FirstRunPage). Not a new visual style — it only
// pins the layout to the viewport. Defined once here to avoid repetition.
const FULLSCREEN_WRAP = {
  display: 'flex',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

// ─── Adapters between the spec Session shape and SessionContainer ──────────
//
// The canonical store (mocks/session_store) uses `chatPaneState` /
// `chatPaneWidth` and a minimal `pendingThread = { prompt }`. SessionContainer
// expects `threadPanelState` / `threadPanelWidth` and a richer pendingThread
// with a `messages` array. We translate at this boundary only.

/**
 * @param {import('./mocks/session_store').Session} session
 * @returns {object} A session object shaped for SessionContainer.
 */
function toContainerSession(session) {
  const messages = session.pendingThread
    ? [{ role: 'user', author: 'You', content: session.pendingThread.prompt }]
    : undefined;
  return {
    ...session,
    threadPanelState: session.chatPaneState,
    threadPanelWidth: session.chatPaneWidth,
    pendingThread: session.pendingThread
      ? {
          key: session.threadKey || `thread-${session.id}`,
          messages,
          sourcePageTitle: null,
        }
      : null,
    summary: null,
  };
}

/**
 * Merge SessionContainer's updates back into the canonical shape.
 * @param {import('./mocks/session_store').Session} session
 * @param {object} updates
 * @returns {import('./mocks/session_store').Session}
 */
function fromContainerUpdates(session, updates) {
  const next = { ...session };
  if ('threadPanelState' in updates)
    next.chatPaneState = updates.threadPanelState;
  if ('threadPanelWidth' in updates)
    next.chatPaneWidth = clampPaneWidth(updates.threadPanelWidth);
  if ('threadKey' in updates) next.threadKey = updates.threadKey;
  if ('tabs' in updates) next.tabs = updates.tabs;
  if ('activeTabId' in updates) next.activeTabId = updates.activeTabId;
  if ('title' in updates) next.title = updates.title;
  // The container's pendingThread carries a messages array; the canonical
  // store only tracks the seed prompt, no longer needed once a thread exists.
  if ('pendingThread' in updates) next.pendingThread = null;
  return next;
}

// ─── Setup-path card contracts (mocked) ────────────────────────────────────

/**
 * Mock: open the data-source connection flow.
 * TODO(design/eng): route to the real "Connect a data source" wizard/modal.
 */
function onConnectDataSource() {
  // eslint-disable-next-line no-console
  console.log('[first-run] onConnectDataSource invoked (mock)');
}

/**
 * Mock: begin migration from another tool.
 * TODO(design/eng): route to the real migration flow.
 */
function onStartMigration() {
  // eslint-disable-next-line no-console
  console.log('[first-run] onStartMigration invoked (mock)');
}

const SETUP_CARDS = [
  {
    key: 'connect',
    icon: 'database',
    title: 'Connect a data source',
    description: 'Point OpenSearch at your logs, metrics, and traces.',
  },
  {
    key: 'sandbox',
    icon: 'beaker',
    title: 'Try a live sandbox',
    description: 'Spin up a temporary environment with sample data.',
  },
  {
    key: 'migrate',
    icon: 'merge',
    title: 'Migrate from another tool',
    description: 'Bring over dashboards and alerts from your current stack.',
  },
];

// ─── Dual-purpose input ────────────────────────────────────────────────────

/**
 * Fuzzy-matches pages as the user types (selecting one opens a page tab, no
 * chat), or on free-text submit starts a conversation. Esc closes suggestions;
 * ArrowUp/Down navigate them; empty submit is a no-op.
 *
 * Visuals are the sample-pages input shell (`emptySessionPage__inputField`
 * markup + classNames, compiled globally via guide_components.scss). No new
 * styles are introduced here.
 */
const DualPurposeInput = ({ onOpenPage, onStartConversation, inputRef }) => {
  const [value, setValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [borderActive, setBorderActive] = useState(false);

  const suggestions = useMemo(() => findPages(value), [value]);

  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setActiveIndex(-1);
  }, []);

  const selectSuggestion = useCallback(
    (page) => {
      if (!page) return;
      onOpenPage(page.id);
      setValue('');
      closeSuggestions();
    },
    [onOpenPage, closeSuggestions]
  );

  const submitFreeText = useCallback(() => {
    const text = value.trim();
    if (!text) return; // Empty submit is a no-op.
    onStartConversation(text);
    setValue('');
    closeSuggestions();
  }, [value, onStartConversation, closeSuggestions]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeSuggestions();
      return;
    }
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length
        );
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // A highlighted suggestion opens that page; otherwise submit free text.
      if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        submitFreeText();
      }
    }
  };

  const listboxId = 'firstRunInputSuggestions';
  const showList = showSuggestions && suggestions.length > 0;

  return (
    <div
      className={`emptySessionPage__inputWrap${
        borderActive ? ' emptySessionPage__inputWrap--borderActive' : ''
      }`}
      onMouseEnter={() => setBorderActive(true)}
      onMouseLeave={() => setBorderActive(false)}>
      <div className="emptySessionPage__inputField">
        <OuiCompressedTextArea
          inputRef={inputRef}
          className="emptySessionPage__textarea"
          placeholder="Ask AI anything, or type to search a page"
          aria-label="Ask AI anything, or search for a page"
          aria-expanded={showList}
          aria-controls={listboxId}
          role="combobox"
          value={value}
          rows={3}
          resize="none"
          fullWidth
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setBorderActive(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setBorderActive(false)}
          onKeyDown={handleKeyDown}
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
            <OuiToolTip content="Start conversation" position="top">
              <OuiButtonIcon
                iconType="sortUp"
                aria-label="Start conversation"
                display="fill"
                size="s"
                isDisabled={!value.trim()}
                onClick={submitFreeText}
              />
            </OuiToolTip>
          </div>
        </div>
      </div>

      {showList && (
        <>
          <OuiSpacer size="xs" />
          <OuiPanel paddingSize="none" hasShadow>
            <OuiListGroup
              id={listboxId}
              flush
              maxWidth={false}
              aria-label="Page suggestions">
              {suggestions.map((page, idx) => (
                <OuiListGroupItem
                  key={page.id}
                  label={page.label}
                  iconType={page.icon}
                  isActive={idx === activeIndex}
                  onClick={() => selectSuggestion(page)}
                />
              ))}
            </OuiListGroup>
          </OuiPanel>
        </>
      )}
    </div>
  );
};

// ─── First-run surface ─────────────────────────────────────────────────────

/**
 * FirstRunSurface — the brand-new-user surface. Renders when there are zero
 * sessions and no recent-page history. Mounts the page panel only after the
 * user opens a page or submits a prompt.
 */
export const FirstRunSurface = () => {
  const capabilities = useMemo(() => getCapabilities(), []);
  const { canCreateWorkspace, hasDataSources } = capabilities;

  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const inputRef = useRef(null);
  const navExpandRef = useRef(null);

  // Persist whenever the session list changes (single source of truth).
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const pageMounted = !!activeSession;
  const sessionCount = sessions.length;

  // One shared code path for opening a page — the input match, quick-access
  // row, and the "More" browser all funnel through here.
  const openPage = useCallback((pageId) => {
    const page = getPageById(pageId);
    if (!page) return;
    recordVisit(page.id);

    const pageEntry = SOURCE_PAGE_MOCK[page.pageKey];
    const title = pageEntry ? pageEntry.title : page.label;
    const tab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      pageKey: page.pageKey,
      title,
    };
    const session = createSession({
      title,
      tabs: [tab],
      activeTabId: tab.id,
      chatPaneState: 'minimized', // Opening a page does NOT start a chat.
    });
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
  }, []);

  /** Start a conversation from free text: pendingThread + side-by-side. */
  const startConversation = useCallback((prompt) => {
    const session = createSession({
      title: prompt ? prompt.slice(0, 40) : 'New chat',
      pendingThread: { prompt: prompt || '' },
      threadKey: `thread-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      chatPaneState: 'side-by-side',
    });
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
  }, []);

  // Setup-path card handlers.
  const handleLaunchSandbox = useCallback(() => {
    // Sandbox is intentionally routed THROUGH the agent, not a wizard.
    const session = createSession({
      title: 'Sandbox',
      pendingThread: { prompt: 'Set up a temporary sandbox with sample data' },
      threadKey: `thread-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
      chatPaneState: 'side-by-side',
    });
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
  }, []);

  const cardHandlers = {
    connect: onConnectDataSource,
    sandbox: handleLaunchSandbox,
    migrate: onStartMigration,
  };

  // SessionContainer wiring (only relevant once a session is mounted).
  const handleUpdateSession = useCallback(
    (updates) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? fromContainerUpdates(s, updates) : s
        )
      );
    },
    [activeSessionId]
  );

  const handleOpenCanvasPage = useCallback(
    (pageKey, title) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const existing = s.tabs.find(
            (t) => t.pageKey === pageKey && t.title === title
          );
          if (existing) return { ...s, activeTabId: existing.id };
          const tab = {
            id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            pageKey,
            title,
          };
          return { ...s, tabs: [...s.tabs, tab], activeTabId: tab.id };
        })
      );
    },
    [activeSessionId]
  );

  const handleGoBack = useCallback(() => {
    // Return to the first-run surface without discarding persisted sessions.
    setActiveSessionId(null);
    // Return focus to the primary input after the surface remounts.
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);
  }, []);

  // Permissions callout (three scenarios).
  const renderCallout = () => {
    if (!canCreateWorkspace) {
      return (
        <OuiCallOut
          title="You don't have permission to create a workspace"
          color="warning"
          iconType="lock">
          <p>
            Ask an administrator for access, or review what you can do today.
          </p>
          <OuiLink
            onClick={() => {
              // TODO(eng): route to the real permissions guide.
              // eslint-disable-next-line no-console
              console.log('[first-run] View permissions guide (mock)');
            }}>
            View permissions guide
          </OuiLink>
        </OuiCallOut>
      );
    }
    if (!hasDataSources) {
      return (
        <OuiCallOut
          title="Connect a data source to get started"
          color="primary"
          iconType="database">
          <p>
            You&rsquo;re set up, but there&rsquo;s no data yet. Connect a source
            to start exploring.
          </p>
          <OuiLink onClick={onConnectDataSource}>Connect a data source</OuiLink>
        </OuiCallOut>
      );
    }
    return null; // Ready — no callout.
  };

  // Once a page/prompt action has mounted a session, render the real
  // SessionContainer (page panel + chat) in place of the surface.
  if (pageMounted) {
    return (
      <div className="samplePagesWrapper" style={FULLSCREEN_WRAP}>
        <SessionLeftNav
          sessionCount={sessionCount}
          sessions={sessions}
          onCreateSession={handleGoBack}
          onBrowseSessions={() => {}}
          onBrowseLibrary={() => {}}
          onSelectSession={setActiveSessionId}
          onOpenPage={(pageKey, title) => handleOpenCanvasPage(pageKey, title)}
          activeView="session"
          activeSessionId={activeSessionId}
          isEmptySession={false}
          expandRef={navExpandRef}
        />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <SessionContainer
            key={activeSession.id}
            session={toContainerSession(activeSession)}
            onUpdateSession={handleUpdateSession}
            onOpenCanvasPage={handleOpenCanvasPage}
            onGoBack={handleGoBack}
          />
        </div>
      </div>
    );
  }

  // First-run surface: no page panel, no recents panel.
  const setupDisabled = !canCreateWorkspace;
  const hasCallout = !canCreateWorkspace || !hasDataSources;

  return (
    <div className="samplePagesWrapper" style={FULLSCREEN_WRAP}>
      <SessionLeftNav
        sessionCount={sessionCount}
        sessions={sessions}
        onCreateSession={() => startConversation('')}
        onBrowseSessions={() => {}}
        onBrowseLibrary={() => {}}
        onSelectSession={setActiveSessionId}
        activeView="session"
        isEmptySession
        expandRef={navExpandRef}
      />

      <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
        <OuiPage paddingSize="l" restrictWidth={720} grow>
          <OuiPageBody>
            {/* a. Title block */}
            <OuiTitle size="l">
              <h1>Welcome to OpenSearch</h1>
            </OuiTitle>
            <OuiSpacer size="s" />
            <OuiText color="subdued">
              <p>Ask a question, open a page, or set up your environment.</p>
            </OuiText>

            <OuiSpacer size="l" />

            {/* b. Conditional system-callout slot */}
            {renderCallout()}
            {hasCallout && <OuiSpacer size="l" />}

            {/* c. Dual-purpose input */}
            <DualPurposeInput
              inputRef={inputRef}
              onOpenPage={openPage}
              onStartConversation={startConversation}
            />

            <OuiSpacer size="xl" />

            {/* d. Three setup-path cards */}
            <OuiFlexGroup gutterSize="m">
              {SETUP_CARDS.map((card) => (
                <OuiFlexItem key={card.key}>
                  <OuiCard
                    icon={<OuiIcon type={card.icon} size="xl" />}
                    title={card.title}
                    description={card.description}
                    isDisabled={setupDisabled}
                    onClick={cardHandlers[card.key]}
                  />
                </OuiFlexItem>
              ))}
            </OuiFlexGroup>

            <OuiSpacer size="xl" />

            {/* e. Quick-access row — sample-pages "Jump to" chips (reuses the
                global v6Scenario__jumpTo* classNames; no new styles). */}
            <div
              className="v6Scenario__jumpTo"
              // Let the chip row use the full 720px content width (the shared
              // sample-pages class caps at 480px, which cramps these chips into
              // 3 lines here). Full width lets them flow naturally into 2 rows.
              style={{ maxWidth: '100%' }}
              role="group"
              aria-label="Quick access pages">
              <span className="v6Scenario__jumpToLabel">Jump to</span>
              <button
                type="button"
                className="v6Scenario__jumpToChip"
                onClick={() => startConversation('')}>
                <OuiIcon type="chatLeft" size="s" />
                <span>New chat</span>
              </button>
              {getPages().map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className="v6Scenario__jumpToChip"
                  onClick={() => openPage(page.id)}>
                  <OuiIcon type={page.icon} size="s" />
                  <span>{page.label}</span>
                </button>
              ))}
              <OuiPopover
                anchorPosition="upRight"
                panelPaddingSize="none"
                isOpen={showMore}
                closePopover={() => setShowMore(false)}
                button={
                  <OuiToolTip content="More pages" position="top">
                    <button
                      type="button"
                      className={`v6Scenario__jumpToChip v6Scenario__jumpToChip--round${
                        showMore ? ' v6Scenario__jumpToChip--active' : ''
                      }`}
                      aria-label="More pages"
                      onClick={() => setShowMore((open) => !open)}>
                      <OuiIcon type="boxesHorizontal" size="s" />
                    </button>
                  </OuiToolTip>
                }>
                <div className="v6Scenario__morePagesMenu">
                  {getPages().map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      className="v6Scenario__morePagesItem"
                      onClick={() => {
                        openPage(page.id);
                        setShowMore(false);
                      }}>
                      <OuiIcon type={page.icon} size="m" />
                      <span>{page.label}</span>
                    </button>
                  ))}
                </div>
              </OuiPopover>
            </div>
          </OuiPageBody>
        </OuiPage>
      </div>
    </div>
  );
};

/**
 * returningHome — the day-n home for users who already have sessions or
 * recent-page history. Not built as part of this task; it currently renders
 * the same surface with the empty states replaced by real recents (the
 * FirstRunSurface already reads live recents/favorites, so it degrades
 * gracefully). Replace this with the real returning-user home when built.
 */
function returningHome() {
  return <FirstRunSurface />;
}

/**
 * FirstRunView — route entry point. Chooses the first-run surface vs. the
 * returning-user home based on persisted sessions + recent-page history.
 *
 * Dev override: `?firstrun=1` forces the first-run surface for review/demos.
 */
export const FirstRunView = () => {
  const forced = readQueryParam('firstrun') === '1';
  const hasSessions = loadSessions().length > 0;
  const hasRecents = getRecents().length > 0;

  if (forced) return <FirstRunSurface />;
  if (!hasSessions && !hasRecents) return <FirstRunSurface />;
  return returningHome();
};
