# Requirements Document

## Introduction

This feature redesigns the information architecture of the OUI sample pages by replacing the current icon-based left navigation with a session-based model. Each "session" is a conversation context that contains a chat pane (left) and a pages pane (right) with browser-like tabs. The left navigation is simplified to two primary actions: creating a new session and browsing all sessions. Within a session, the layout is split into a resizable chat pane and a page panel. This enables users to work within focused conversation contexts while maintaining access to all available pages.

## Glossary

- **Session**: A conversation context that holds one chat/conversation and multiple open pages. Each session is an independent workspace. A session IS the thread — there is no separate "thread" concept within a session.
- **Left_Nav**: The redesigned minimal navigation sidebar that provides access to session creation and session browsing.
- **Session_List**: The view displayed when the user clicks the sessions button, showing all existing sessions.
- **Chat_Pane**: The left portion of the session layout that displays the conversation (the existing ThreadPage component). Has three size states: minimized, side-by-side, and full-screen. This IS the AI interaction surface — there is no separate popover.
- **Page_Panel**: The right portion of the session layout that displays page content using browser-like tabs. Adjusts size based on the Chat_Pane state. Does NOT contain any AI interaction UI.
- **Page_Tab**: A tab in the Page_Panel header representing an open page, similar to a browser tab.
- **Empty_Session**: A newly created session with no conversation started and no pages open. Presents the home experience.
- **Dual_Purpose_Input**: The input field on the Empty_Session that accepts both AI prompts (to start a conversation) and page search queries (to navigate to a page). Placeholder text: "Ask AI or search a page".
- **Quick_Access_Row**: A row of circular icon buttons on the Empty_Session providing shortcuts to common actions and pages.
- **System_Callout**: A notification/callout area on the Empty_Session that displays system alerts.
- **Session_Badge**: A notification badge displayed on the Sessions_Button indicating the count of sessions.
- **Thread_Attachment**: A rich content block embedded in a conversation message. Supported types: link-preview, code-block, chart, data-table, stats-display.
- **Canvas_Page**: A full-page component rendered as a tab in the Page_Panel.
- **View_Action**: The "View" button displayed on link-preview attachments in the conversation that opens the referenced content as a Canvas_Page tab in the Page_Panel.
- **SOURCE_PAGE_MOCK**: A mapping that connects link-preview attachment keys to their corresponding Canvas_Page components.
- **New_Tab**: An empty tab in the Page_Panel where the user can navigate to any available page manually.
- **Plus_Button**: The button in the Left_Nav that creates a new session.
- **Sessions_Button**: The button in the Left_Nav that opens the Session_List view.
- **Resize_Handle**: A draggable divider between the Chat_Pane and Page_Panel that allows the user to adjust their relative widths in side-by-side mode.
- **Floating_Ask_AI_Button**: A floating button that appears ONLY when the Chat_Pane is minimized. Clicking it expands the Chat_Pane to side-by-side mode. It does NOT open a popover or inline panel.

## Requirements

### Requirement 1: Simplified Left Navigation

**User Story:** As a user, I want a minimal left navigation with only session controls, so that I can focus on my work within sessions rather than navigating between many top-level items.

#### Acceptance Criteria

1. THE Left_Nav SHALL display a Plus_Button (plusInCircle icon) that allows the user to create a new session.
2. THE Left_Nav SHALL display a Sessions_Button (apps icon) that allows the user to browse all existing sessions.
3. THE Sessions_Button SHALL display a Session_Badge indicating the count of sessions needing attention.
4. THE Left_Nav SHALL NOT display the previous tab-based navigation items (Discover, Dashboards, Logs, Metrics, Tools, etc.) as top-level entries.
5. THE Left_Nav SHALL display a footer area containing a workspace selector, devtools button, settings (gear) button, and user avatar.
6. THE Left_Nav SHALL be rendered in a collapsed, narrow layout with the OpenSearch logo at the top.
7. THE Left_Nav SHALL use only existing OUI icon assets from `src/components/icon/assets/` for the Plus_Button, Sessions_Button, and footer items.

### Requirement 2: Create New Session (Empty Session Experience)

**User Story:** As a user, I want to start a new session by clicking the plus button, so that I can begin a fresh workspace context with quick access to common pages and AI assistance.

#### Acceptance Criteria

1. WHEN the user clicks the Plus_Button in the Left_Nav, THE system SHALL create a new Empty_Session and navigate the user into it.
2. WHEN a new Empty_Session is created, THE system SHALL display the Empty_Session experience as a centered, bordered panel with rounded corners on a gray page background.
3. THE Empty_Session SHALL display a "Welcome to OpenSearch Observability" title at the top of the main panel.
4. THE Empty_Session SHALL display a System_Callout area below the title for system notifications and alerts.
5. THE Empty_Session SHALL display a Dual_Purpose_Input field with placeholder text "Ask AI or search a page" and a plus icon on the left side of the field.
6. THE Empty_Session SHALL display a Quick_Access_Row below the input field with circular icon buttons for: New chat (sparkle icon), Dashboards, Logs, Metric, Topology Map, Application Performance, Agent Monitoring, and More.
7. THE Empty_Session SHALL display a tabbed section below the Quick_Access_Row with "Recent visit" (active by default, blue underline) and "Favorite" tabs.
8. WHEN the "Recent visit" tab is active, THE Empty_Session SHALL display a list of recently visited pages and sessions.
9. WHEN the "Favorite" tab is active, THE Empty_Session SHALL display a list of user-favorited pages and sessions.

### Requirement 3: Browse All Sessions

**User Story:** As a user, I want to browse all my sessions, so that I can switch between different workspace contexts.

#### Acceptance Criteria

1. WHEN the user clicks the Sessions_Button in the Left_Nav, THE system SHALL display the Session_List showing all existing sessions.
2. THE Session_List SHALL display each session with identifying information (e.g., thread title or creation context).
3. WHEN the user selects a session from the Session_List, THE system SHALL navigate the user into that session and restore its layout state.

### Requirement 4: Session Layout — Chat Pane and Page Panel

**User Story:** As a user, I want each session to have a split layout with a chat pane and a page panel, so that I can view my conversation alongside page content.

#### Acceptance Criteria

1. THE Session layout SHALL consist of a Chat_Pane on the left and a Page_Panel on the right.
2. THE Chat_Pane SHALL support three size states: minimized, side-by-side, and full-screen.
3. WHEN the Chat_Pane is in minimized state, THE Page_Panel SHALL occupy the full available width.
4. WHEN the Chat_Pane is in full-screen state, THE Page_Panel SHALL be collapsed and not visible.
5. WHEN the Chat_Pane is in side-by-side state, THE Chat_Pane and Page_Panel SHALL be displayed adjacent to each other.

### Requirement 5: Resizable Panels in Side-by-Side Mode

**User Story:** As a user, I want to drag the divider between the chat pane and page panel to resize them, so that I can allocate screen space according to my needs.

#### Acceptance Criteria

1. WHILE the Chat_Pane is in side-by-side state, THE system SHALL display a Resize_Handle between the Chat_Pane and Page_Panel.
2. WHEN the user drags the Resize_Handle, THE system SHALL adjust the widths of the Chat_Pane and Page_Panel proportionally to follow the drag position.
3. WHILE the user is dragging the Resize_Handle, THE system SHALL provide visual feedback indicating the resize operation is in progress.
4. WHEN the user releases the Resize_Handle, THE system SHALL apply the final widths to both panels.

### Requirement 6: Page Panel with Browser-Like Tabs

**User Story:** As a user, I want browser-like tabs in the page panel, so that I can have multiple pages open within a single session and switch between them easily.

#### Acceptance Criteria

1. THE Page_Panel SHALL display a tab bar in its header area showing all open Page_Tabs.
2. THE Page_Panel SHALL display a button in the tab bar to add a New_Tab.
3. WHEN the user clicks a Page_Tab, THE Page_Panel SHALL display the content of the corresponding page.
4. WHEN the user clicks the add-tab button, THE Page_Panel SHALL open a New_Tab.
5. WHEN a New_Tab is opened, THE Page_Panel SHALL display a page where the user can navigate to any available page.
6. THE Page_Panel SHALL allow the user to close individual Page_Tabs.

### Requirement 7: New Tab Page Navigation

**User Story:** As a user, I want to navigate to any available page from a new empty tab, so that I can open the content I need within my session.

#### Acceptance Criteria

1. THE New_Tab SHALL display a list or grid of all available pages that the user can navigate to.
2. WHEN the user selects a page from the New_Tab, THE Page_Panel SHALL load that page content in the current tab.
3. WHEN a page is loaded in a tab, THE corresponding Page_Tab label SHALL update to reflect the page name.

### Requirement 8: Chat Pane Size Controls

**User Story:** As a user, I want to toggle the chat pane between minimized, side-by-side, and full-screen states, so that I can control how much space the conversation occupies.

#### Acceptance Criteria

1. THE Chat_Pane SHALL provide controls to switch between minimized, side-by-side, and full-screen states.
2. WHEN the user switches the Chat_Pane to minimized state, THE Chat_Pane SHALL collapse to hidden and THE Page_Panel SHALL expand to full width.
3. WHEN the user switches the Chat_Pane to full-screen state, THE Chat_Pane SHALL expand to full width and THE Page_Panel SHALL collapse.
4. WHEN the user switches the Chat_Pane to side-by-side state, THE Chat_Pane and Page_Panel SHALL both be visible at their respective widths.

### Requirement 9: Theme Compatibility

**User Story:** As a user, I want the session-based navigation to render correctly in both light and dark themes, so that the experience is consistent regardless of my theme preference.

#### Acceptance Criteria

1. THE Left_Nav SHALL render correctly under the v9-light theme.
2. THE Left_Nav SHALL render correctly under the v9-dark theme.
3. THE Session layout (Thread_Panel, Page_Panel, Resize_Handle, Page_Tabs) SHALL render correctly under the v9-light theme.
4. THE Session layout (Thread_Panel, Page_Panel, Resize_Handle, Page_Tabs) SHALL render correctly under the v9-dark theme.
5. THE system SHALL use only existing OUI design tokens and components for all session-based navigation styling.

### Requirement 10: Session State Persistence

**User Story:** As a user, I want my sessions and their layout states to persist across page reloads, so that I do not lose my workspace context.

#### Acceptance Criteria

1. WHEN the user creates or modifies sessions, THE system SHALL persist session data (open tabs, thread panel state, active session) to browser local storage.
2. WHEN the page loads, THE system SHALL restore the previously active session and its layout state from local storage.
3. IF the persisted session data is missing or corrupted, THEN THE system SHALL fall back to a default state with one Empty_Session.

### Requirement 11: Accessibility

**User Story:** As a user relying on assistive technology, I want the session-based navigation to be keyboard accessible and screen-reader friendly, so that all users can navigate sessions effectively.

#### Acceptance Criteria

1. THE Left_Nav buttons (Plus_Button, Sessions_Button) SHALL be focusable via keyboard Tab navigation and activatable via Enter or Space.
2. THE Page_Tabs SHALL be navigable via keyboard Arrow keys and activatable via Enter or Space.
3. THE Resize_Handle SHALL be operable via keyboard (Arrow keys to resize).
4. THE system SHALL provide appropriate ARIA labels for the Plus_Button, Sessions_Button, Page_Tabs, and Resize_Handle to convey their purpose to screen readers.

### Requirement 12: Mock Flow — Existing Session with Preset Conversation

**User Story:** As a user, I want to open a session that already has an active investigation conversation loaded, so that I can see the full conversation with rich attachments and open referenced pages side-by-side.

#### Acceptance Criteria

1. THE system SHALL provide a mocked session (e.g., "latency-spike" investigation) that loads with a preset conversation already active in the Chat_Pane.
2. THE Chat_Pane SHALL display the full conversation including multiple assistant messages with rich Thread_Attachments (link-preview, chart, code-block, data-table, stats-display).
3. THE Chat_Pane SHALL display a progress tracker showing task steps with status indicators (pending, in-progress, completed) for the investigation workflow.
4. THE Chat_Pane SHALL render link-preview Thread_Attachments with a title, description, and a View_Action button.
5. WHEN the user clicks the View_Action on a link-preview Thread_Attachment, THE system SHALL open the corresponding Canvas_Page as a new Page_Tab in the Page_Panel.
6. THE system SHALL use the SOURCE_PAGE_MOCK mapping to resolve which Canvas_Page component to render for a given link-preview attachment key.
7. IF a Canvas_Page for the same attachment is already open as a Page_Tab, THEN THE system SHALL activate the existing tab instead of opening a duplicate.
8. THE Chat_Pane SHALL display a text input area at the bottom for the user to send follow-up messages.
9. WHEN the Chat_Pane is in side-by-side state, THE user SHALL be able to view the conversation and opened Canvas_Pages simultaneously.

### Requirement 13: Floating Ask AI Button

**User Story:** As a user, I want a floating "Ask AI" button visible when the chat pane is hidden, so that I can quickly open the conversation without navigating away from my page.

#### Acceptance Criteria

1. THE system SHALL display a Floating_Ask_AI_Button ONLY when the Chat_Pane is in minimized state.
2. WHEN the Chat_Pane is in side-by-side or full-screen state, THE Floating_Ask_AI_Button SHALL NOT be visible.
3. WHEN the user clicks the Floating_Ask_AI_Button, THE system SHALL expand the Chat_Pane to side-by-side state.
4. THE Floating_Ask_AI_Button SHALL NOT open a popover, inline panel, or any intermediate UI — it simply reveals the chat pane.
5. THE Floating_Ask_AI_Button SHALL be positioned in the bottom-right area of the Page_Panel.

### Requirement 14: (Removed — replaced by Requirement 13)

### Requirement 15: (Removed — replaced by Requirement 13)

### Requirement 16: Chat Pane Content and Attachments

**User Story:** As a user, I want the chat pane to display the full conversation with all rich attachment types, so that I can see the complete context of my investigation within the session.

#### Acceptance Criteria

1. THE Chat_Pane SHALL display the full conversation including user messages and assistant messages.
2. THE Chat_Pane SHALL render link-preview Thread_Attachments with a title, description, and a View_Action button.
3. THE Chat_Pane SHALL render code-block Thread_Attachments with syntax-highlighted code and a title.
4. THE Chat_Pane SHALL render chart Thread_Attachments with a visual bar representation and a title.
5. THE Chat_Pane SHALL render data-table Thread_Attachments with column headers and tabular rows.
6. THE Chat_Pane SHALL render stats-display Thread_Attachments with labeled metric values.
7. THE Chat_Pane SHALL display a progress tracker showing task steps with status indicators (pending, in-progress, completed) for ongoing assistant operations.
8. THE Chat_Pane SHALL display a text input area at the bottom for the user to send follow-up messages within the conversation.

### Requirement 17: View Action Opens Canvas Page as Tab

**User Story:** As a user, I want to click "View" on a link-preview attachment in the conversation to open the referenced content as a new tab in the page panel, so that I can see detailed page content alongside my conversation.

#### Acceptance Criteria

1. WHEN the user clicks the View_Action on a link-preview Thread_Attachment, THE system SHALL open the corresponding Canvas_Page as a new Page_Tab in the Page_Panel.
2. THE system SHALL use the SOURCE_PAGE_MOCK mapping to resolve which Canvas_Page component to render for a given link-preview attachment.
3. WHEN a Canvas_Page is opened via View_Action, THE Page_Tab label SHALL display the title of the link-preview attachment.
4. IF the Chat_Pane is in full-screen state when the user clicks View_Action, THEN THE system SHALL switch the layout to side-by-side state to show both the conversation and the opened Canvas_Page.
5. IF a Canvas_Page for the same attachment is already open as a Page_Tab, THEN THE system SHALL activate the existing tab instead of opening a duplicate.

### Requirement 18: Canvas Page Rendering in Page Panel

**User Story:** As a user, I want canvas pages (alerts, logs, dashboards, traces, etc.) to render correctly as tabs in the page panel, so that I can view detailed operational content within my session context.

#### Acceptance Criteria

1. THE Page_Panel SHALL render AlertPageMock as a Canvas_Page tab displaying alert metrics, charts, and recommendations.
2. THE Page_Panel SHALL render LogsPageMock as a Canvas_Page tab displaying log query results in a tabular format.
3. THE Page_Panel SHALL render DashboardPageMock as a Canvas_Page tab displaying stat panels, tables, and timeline data.
4. THE Page_Panel SHALL render InventoryAnalysisPageMock as a Canvas_Page tab displaying connection pool analysis content.
5. THE Page_Panel SHALL render ConnectionPoolPageMock as a Canvas_Page tab displaying pool metrics and recommendations.
6. THE Page_Panel SHALL render TraceAnalysisPageMock as a Canvas_Page tab displaying trace waterfall visualizations and timeline data.
7. WHEN multiple Canvas_Pages are opened, THE Page_Panel SHALL display each as a separate Page_Tab that the user can switch between.

### Requirement 19: Dual-Purpose Input Field

**User Story:** As a user, I want a single input field that lets me either ask the AI a question or search for a page, so that I can quickly start a conversation or navigate without needing separate controls.

#### Acceptance Criteria

1. THE Dual_Purpose_Input SHALL accept free-text input from the user.
2. WHEN the user types a question or prompt and submits, THE system SHALL create a new conversation with the user query, and switch the Chat_Pane to active (side-by-side or full-screen).
3. WHEN the user types a page name and selects a matching page from suggestions, THE system SHALL open that page as a new Page_Tab in the Page_Panel.
4. THE Dual_Purpose_Input SHALL display matching page names as the user types, allowing the user to select a page to navigate to.
5. IF the user submits text that does not match a page name, THEN THE system SHALL treat the input as an AI prompt and start a new conversation.

### Requirement 20: Quick-Access Icon Row

**User Story:** As a user, I want quick-access shortcuts on the session start page, so that I can jump directly to common pages or start a new AI chat without extra navigation steps.

#### Acceptance Criteria

1. THE Quick_Access_Row SHALL display circular icon buttons for: New chat, Dashboards, Logs, Metric, Topology Map, Application Performance, Agent Monitoring, and More.
2. WHEN the user clicks the "New chat" button (sparkle icon), THE system SHALL start a new AI conversation and switch the Chat_Pane to active.
3. WHEN the user clicks a page shortcut button (Dashboards, Logs, Metric, Topology Map, Application Performance, or Agent Monitoring), THE system SHALL open the corresponding page as a new Page_Tab in the Page_Panel.
4. WHEN the user clicks the "More" button, THE system SHALL display additional page options for the user to select from.
5. THE Quick_Access_Row SHALL use only existing OUI icon assets from `src/components/icon/assets/` for all shortcut buttons.

### Requirement 21: Recent Visit and Favorite Tabs

**User Story:** As a user, I want to see my recently visited and favorited pages on the session start page, so that I can quickly return to pages I use frequently.

#### Acceptance Criteria

1. THE Empty_Session SHALL display a "Recent visit" tab and a "Favorite" tab below the Quick_Access_Row.
2. THE "Recent visit" tab SHALL be active by default with a blue underline indicator.
3. WHEN the "Recent visit" tab is active, THE system SHALL display a list of recently visited pages and sessions ordered by most recent first.
4. WHEN the "Favorite" tab is active, THE system SHALL display a list of pages and sessions the user has marked as favorites.
5. WHEN the user clicks an item in the "Recent visit" or "Favorite" list, THE system SHALL navigate the user to that page or session.

### Requirement 22: System Callout Notification Area

**User Story:** As a user, I want to see important system alerts on the session start page, so that I am aware of critical issues or notifications that need my attention.

#### Acceptance Criteria

1. THE System_Callout SHALL be displayed below the "Welcome to OpenSearch Observability" title and above the Dual_Purpose_Input.
2. THE System_Callout SHALL be styled with a red left border and pink background to indicate importance.
3. THE System_Callout SHALL display a descriptive message about the system alert or notification.
4. THE System_Callout SHALL display a call-to-action button that allows the user to take action on the alert.
5. WHEN the user clicks the call-to-action button, THE system SHALL navigate the user to the relevant page or perform the associated action.
6. IF no system alerts are active, THEN THE System_Callout SHALL not be displayed.
