# Implementation Plan: Session-Based Navigation

## Overview

Replace the current icon-based left navigation in the OUI sample pages with a session-based model. Each session is an independent workspace containing a thread panel and a page panel with browser-like tabs. The implementation builds incrementally: data models first, then individual components, then integration and mock flows.

## Tasks

- [x] 1. Create session data models and state management
  - [x] 1.1 Create session data models and constants file
    - Create `src-docs/src/views/sample_pages/session_models.js`
    - Define Session, PageTab, PendingThread, SystemAlert, RecentItem, FavoriteItem shapes as JSDoc comments
    - Define PersistedSessionState schema with version field
    - Define SOURCE_PAGE_MOCK mapping connecting page keys to existing mock page components (AlertPageMock, LogsPageMock, DashboardPageMock, InventoryAnalysisPageMock, ConnectionPoolPageMock, TraceAnalysisPageMock)
    - Define default empty session factory function
    - _Requirements: 10.1, 10.3, 12.6, 17.2_

  - [x] 1.2 Create session state manager with localStorage persistence
    - Create `src-docs/src/views/sample_pages/session_state_manager.js`
    - Implement `createSession()` — generates new empty session with unique ID
    - Implement `updateSession(id, updates)` — partial update to a session
    - Implement `deleteSession(id)` — remove session
    - Implement `setActiveSession(id)` — switch active session
    - Implement `openCanvasPage(sessionId, pageKey, title)` — add tab or activate existing
    - Implement `closeTab(sessionId, tabId)` — remove tab from session
    - Implement `saveSessionState(state)` — persist to localStorage with version
    - Implement `loadSessionState()` — restore from localStorage with fallback to default empty session
    - Follow existing pattern from `nav_layout_utils.js` for localStorage handling (silent fail on errors)
    - _Requirements: 10.1, 10.2, 10.3, 2.1, 3.3, 17.5_

  - [x] 1.3 Write unit tests for session state manager
    - Test createSession generates unique IDs
    - Test openCanvasPage deduplicates existing tabs
    - Test loadSessionState falls back on corrupted data
    - Test saveSessionState/loadSessionState round-trip
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 2. Implement SessionLeftNav component
  - [x] 2.1 Create SessionLeftNav component
    - Create `src-docs/src/views/sample_pages/session_left_nav.js`
    - Render narrow collapsed sidebar with OpenSearch logo at top
    - Render Plus_Button using `plusInCircle` icon from existing OUI icon assets
    - Render Sessions_Button using `apps` icon with badge (OuiNotificationBadge or similar)
    - Render footer area: workspace selector button (`wsSelector` icon), devtools button (`wrench` icon), settings button (`gear` icon), OuiAvatar
    - Wire onCreateSession and onBrowseSessions callbacks
    - Use only existing OUI components and icons
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.2 Create SessionLeftNav SCSS styles
    - Create `src-docs/src/views/sample_pages/_session_left_nav.scss`
    - Style narrow collapsed layout matching design
    - Use only existing OUI design tokens for colors and spacing
    - Ensure correct rendering under both v9-light and v9-dark themes
    - _Requirements: 1.6, 9.1, 9.2, 9.5_

  - [x] 2.3 Add keyboard accessibility to SessionLeftNav
    - Ensure Plus_Button and Sessions_Button are focusable via Tab and activatable via Enter/Space
    - Add appropriate ARIA labels: "Create new session" for Plus_Button, "Browse all sessions" for Sessions_Button
    - _Requirements: 11.1, 11.4_

- [x] 3. Implement SessionContainer with split layout
  - [x] 3.1 Create SessionContainer component
    - Create `src-docs/src/views/sample_pages/session_container.js`
    - Render ThreadPanel (left) and PagePanel (right) based on active session state
    - Manage threadPanelState ('minimized', 'side-by-side', 'full-screen') from session
    - When minimized: PagePanel occupies full width, ThreadPanel hidden
    - When full-screen: ThreadPanel occupies full width, PagePanel hidden
    - When side-by-side: both visible at session.threadPanelWidth ratio
    - Pass onUpdateSession, onOpenCanvasPage, onContinueAsThread callbacks down
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.2 Create SessionContainer SCSS styles
    - Create `src-docs/src/views/sample_pages/_session_container.scss`
    - Flexbox layout for side-by-side panels
    - Transition animations for panel state changes
    - Ensure correct rendering under both v9-light and v9-dark themes
    - _Requirements: 4.1, 9.3, 9.4, 9.5_

- [x] 4. Implement ThreadPanel with 3 size states
  - [x] 4.1 Create ThreadPanel component
    - Create `src-docs/src/views/sample_pages/thread_panel.js`
    - Wrap existing ThreadPage component with size-state controls
    - Render size toggle controls (minimize, side-by-side, full-screen buttons)
    - Accept sizeState, onSizeChange, threadKey, pendingThread, onViewAction, width props
    - When threadKey is set, render ThreadPage with that key
    - When pendingThread is set, render ThreadPage with pending messages
    - Pass onViewAction through to ThreadPage for link-preview View buttons
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 16.1, 16.8_

  - [x] 4.2 Create ThreadPanel SCSS styles
    - Create `src-docs/src/views/sample_pages/_thread_panel.scss`
    - Style size toggle controls
    - Handle width transitions between states
    - Ensure correct rendering under both themes
    - _Requirements: 8.1, 9.3, 9.4_

  - [x] 4.3 Add keyboard accessibility to ThreadPanel size controls
    - Ensure size toggle buttons are focusable and activatable via keyboard
    - Add ARIA labels for size state controls
    - _Requirements: 11.1, 11.4_

- [x] 5. Implement ResizeHandle for side-by-side mode
  - [x] 5.1 Create ResizeHandle component
    - Create `src-docs/src/views/sample_pages/resize_handle.js`
    - Render draggable divider between ThreadPanel and PagePanel
    - Only visible when ThreadPanel is in side-by-side state
    - Implement mouse drag: onMouseDown starts tracking, onMouseMove updates width, onMouseUp finalizes
    - Provide visual feedback during drag (cursor change, highlight)
    - Constrain width between 20% and 80%
    - Call onResize callback with new left width percentage
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.2 Add keyboard accessibility to ResizeHandle
    - Make ResizeHandle focusable (tabIndex, role="separator")
    - Support Arrow Left/Right keys to resize in increments
    - Add ARIA label and aria-valuenow/min/max for screen readers
    - _Requirements: 11.3, 11.4_

  - [x] 5.3 Create ResizeHandle SCSS styles
    - Create `src-docs/src/views/sample_pages/_resize_handle.scss`
    - Style divider line, hover state, active/dragging state
    - Use OUI design tokens only
    - _Requirements: 5.3, 9.3, 9.4, 9.5_

- [x] 6. Checkpoint - Ensure all core layout components work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement PagePanel with browser-like tabs
  - [x] 7.1 Create PagePanel component
    - Create `src-docs/src/views/sample_pages/page_panel.js`
    - Render tab bar header with PageTab items and add-tab button
    - Render active tab content area using SOURCE_PAGE_MOCK mapping
    - Support tab selection, tab close, and add new tab
    - When a tab is closed and it was active, activate the next available tab
    - Render DetailPageHeader with Ask_AI_Button for canvas pages
    - Pass onContinueAsThread callback for AskAiInline integration
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 14.1, 18.7_

  - [x] 7.2 Create TabBar sub-component
    - Render individual tab items with title and close button
    - Highlight active tab
    - Render add-tab (+) button at end of tab row
    - Support horizontal scrolling if many tabs open
    - _Requirements: 6.1, 6.2, 6.6_

  - [x] 7.3 Create NewTabPage component
    - Create `src-docs/src/views/sample_pages/new_tab_page.js`
    - Display grid/list of all available pages from SOURCE_PAGE_MOCK
    - When user selects a page, call onSelectPage callback to load it in current tab
    - Update tab label to reflect selected page name
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 7.4 Create PagePanel SCSS styles
    - Create `src-docs/src/views/sample_pages/_page_panel.scss`
    - Style tab bar, individual tabs, active tab indicator, close buttons
    - Style content area
    - Ensure correct rendering under both themes
    - _Requirements: 6.1, 9.3, 9.4, 9.5_

  - [x] 7.5 Add keyboard accessibility to PagePanel tabs
    - Make tabs navigable via Arrow Left/Right keys
    - Make tabs activatable via Enter/Space
    - Add ARIA labels for tabs and tab close buttons
    - Use role="tablist" and role="tab" appropriately
    - _Requirements: 11.2, 11.4_

- [x] 8. Implement EmptySessionPage (welcome experience)
  - [x] 8.1 Create EmptySessionPage component
    - Create `src-docs/src/views/sample_pages/empty_session_page.js`
    - Render centered bordered panel with rounded corners on gray background
    - Display "Welcome to OpenSearch Observability" title
    - Display System_Callout area (red left border, pink background) when systemAlert is present
    - Display Dual_Purpose_Input with placeholder "Ask AI or search a page" and plus icon
    - Display Quick_Access_Row with circular icon buttons: New chat (sparkle), Dashboards, Logs, Metric, Topology Map, Application Performance, Agent Monitoring, More
    - Display tabbed section with "Recent visit" (active by default, blue underline) and "Favorite" tabs
    - Use only existing OUI icon assets
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 8.2 Implement Dual_Purpose_Input behavior
    - Accept free-text input
    - Show matching page names as user types (filter SOURCE_PAGE_MOCK keys)
    - On submit: if matches a page, open as tab; otherwise treat as AI prompt and start thread
    - Wire onStartThread and onOpenPage callbacks
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [x] 8.3 Implement Quick_Access_Row behavior
    - "New chat" button starts a new AI thread (onStartThread with empty prompt triggers thread)
    - Page shortcut buttons open corresponding page as new tab
    - "More" button shows additional page options
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 8.4 Implement Recent visit and Favorite tabs
    - "Recent visit" tab active by default with blue underline
    - Display list of recently visited pages/sessions ordered by most recent
    - "Favorite" tab displays favorited items
    - Clicking an item navigates to that page or session
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

  - [x] 8.5 Implement System_Callout component
    - Styled with red left border and pink background
    - Display message and call-to-action button
    - Clicking CTA navigates to relevant page
    - Hidden when no alerts active
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

  - [x] 8.6 Create EmptySessionPage SCSS styles
    - Create `src-docs/src/views/sample_pages/_empty_session_page.scss`
    - Style centered panel, callout, input, quick-access row, tabs
    - Use OUI design tokens only
    - Ensure correct rendering under both themes
    - _Requirements: 2.2, 9.3, 9.4, 9.5_

- [x] 9. Implement SessionList view
  - [x] 9.1 Create SessionList component
    - Create `src-docs/src/views/sample_pages/session_list.js`
    - Display all existing sessions with identifying info (title, creation context)
    - Highlight active session
    - On session select, call onSelectSession to navigate into that session
    - Include "Create new session" action
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 9.2 Create SessionList SCSS styles
    - Create `src-docs/src/views/sample_pages/_session_list.scss`
    - Style session cards/list items
    - Ensure correct rendering under both themes
    - _Requirements: 3.1, 9.3, 9.4, 9.5_

- [x] 10. Checkpoint - Ensure all individual components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement Mock Flow 1 — Existing session with preset thread
  - [x] 11.1 Create mock data for latency-spike investigation session
    - Create `src-docs/src/views/sample_pages/session_mock_data.js`
    - Define a pre-built session with threadKey 'latency-spike' already active
    - Include full thread conversation with multiple assistant messages
    - Include rich attachments: link-preview (with View action), chart, code-block, data-table, stats-display
    - Include progress tracker with task steps (pending, in-progress, completed)
    - Map link-preview attachment keys to SOURCE_PAGE_MOCK entries
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [x] 11.2 Implement View_Action on link-preview attachments
    - When user clicks "View" on a link-preview, call onOpenCanvasPage with the attachment key
    - Resolve Canvas_Page component via SOURCE_PAGE_MOCK mapping
    - Open as new tab in PagePanel; if already open, activate existing tab
    - If ThreadPanel is minimized, switch to side-by-side state
    - _Requirements: 12.5, 12.7, 17.1, 17.2, 17.3, 17.4, 17.5_

  - [x] 11.3 Wire thread input area for follow-up messages
    - Display text input at bottom of ThreadPanel
    - Allow user to send follow-up messages within the thread
    - _Requirements: 12.8, 12.9, 16.8_

- [x] 12. Implement Floating Ask AI Button and Page-First Mock Flow (NEEDS REWORK)
  - [x] 12.1 Create mock data for page-first flow
    - Add to `session_mock_data.js`: a session starting on LogsPageMock with Chat_Pane minimized
    - Define mock PPL query and results
    - _Requirements: 13.1_

  - [ ] 12.2 Implement FloatingAskAiButton component (REPLACES old 12.2-12.5)
    - Create a floating button that appears ONLY when Chat_Pane is minimized
    - Clicking it expands the Chat_Pane to side-by-side state
    - Does NOT open a popover or inline panel — simply reveals the chat pane
    - Position in bottom-right area of the Page_Panel
    - Remove all AskAiInline/proactive highlight/Continue_As_Thread logic from PagePanel
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ] 12.3 Create FloatingAskAiButton SCSS styles
    - Style floating button with fixed positioning in bottom-right
    - Use OUI design tokens
    - Ensure correct rendering under both themes
    - _Requirements: 13.5, 9.3, 9.4, 9.5_

- [x] 13. Integration — Wire everything together in SamplePagesView (NEEDS REWORK)
  - [x] 13.1 Refactor SamplePagesView to use session-based navigation
    - Replace SamplePagesLeftNav import with SessionLeftNav
    - Add session state management using session_state_manager (useState + useEffect for persistence)
    - Determine activeView: 'session' or 'session-list' based on user action
    - When activeView is 'session': render SessionContainer with active session
    - When activeView is 'session-list': render SessionList
    - Wire Plus_Button to createSession + navigate into new session
    - Wire Sessions_Button to show SessionList
    - Load persisted state on mount, save on state changes
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 10.1, 10.2_

  - [x] 13.2 Wire Canvas_Page rendering in PagePanel
    - Ensure all mock pages render correctly as tabs: AlertPageMock, LogsPageMock, DashboardPageMock, InventoryAnalysisPageMock, ConnectionPoolPageMock, TraceAnalysisPageMock
    - Multiple canvas pages open as separate tabs, switchable
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [x] 13.3 Wire mock flows into initial session state
    - On first load (no persisted state): create default sessions including latency-spike mock and page-first mock
    - Ensure both mock flows are accessible from SessionList
    - _Requirements: 12.1, 13.1_

  - [x] 13.4 Import all new SCSS files
    - Import _session_left_nav.scss, _session_container.scss, _thread_panel.scss, _resize_handle.scss, _page_panel.scss, _empty_session_page.scss, _session_list.scss into the main sample pages stylesheet
    - _Requirements: 9.5_

- [x] 14. Final checkpoint - Ensure all tests pass and flows work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Rework — Remove AskAiInline/proactive highlight and implement FloatingAskAiButton
  - [x] 15.1 Remove AskAiInline/proactive highlight logic from PagePanel
    - Remove all proactiveHighlight state, timers, and related logic from page_panel.js
    - Remove DetailPageHeader wrapper from canvas pages (pages render directly without AI header)
    - Remove onContinueAsThread prop from PagePanel and SessionContainer
    - Remove continueAsThread function from session_state_manager.js
    - Remove _ai_proactive_highlight.scss import
    - _Requirements: 13.4_

  - [x] 15.2 Create FloatingAskAiButton component
    - Create `src-docs/src/views/sample_pages/floating_ask_ai_button.js`
    - Render a floating button (sparkle/chat icon) in the bottom-right of the session container
    - Only visible when chatPaneState === 'minimized'
    - On click: call onExpandChat() which sets chatPaneState to 'side-by-side'
    - Use OuiButtonIcon with appropriate icon and ARIA label
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 15.3 Create FloatingAskAiButton SCSS styles
    - Create `src-docs/src/views/sample_pages/_floating_ask_ai_button.scss`
    - Position: fixed to bottom-right of the session container
    - Circular button with shadow, hover state
    - Use OUI design tokens
    - Ensure correct rendering under both themes
    - _Requirements: 13.5, 9.3, 9.4, 9.5_

  - [x] 15.4 Wire FloatingAskAiButton into SessionContainer
    - Add FloatingAskAiButton to SessionContainer, visible only when chatPaneState is 'minimized'
    - On click: update session chatPaneState to 'side-by-side'
    - _Requirements: 13.3_

  - [x] 15.5 Update SessionContainer to remove onContinueAsThread
    - Remove onContinueAsThread prop and related wiring
    - Simplify PagePanel props (remove threadPanelState, onContinueAsThread)
    - _Requirements: 13.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The project uses JavaScript (not TypeScript) — interfaces in the design doc serve as documentation; implement with JSDoc comments
- All components must use only existing OUI components, icons from `src/components/icon/assets/`, and v9 theme tokens
- Existing components (ThreadPage, mock canvas pages) are reused — not reimplemented
- The AskAiInline popover is NOT used in this feature — the chat pane IS the AI interaction surface
- The floating Ask AI button only appears when the chat pane is minimized and simply expands it
- localStorage persistence follows the existing pattern in `nav_layout_utils.js`
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
