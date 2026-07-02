# Route Swap Requirements: /home2 → /sample-pages

## Goal

Make `/sample-pages` render the v7 experience (currently at `/home2`).

---

## Current Route Map

| Route | Component | Variant | Description |
|-------|-----------|---------|-------------|
| `/sample-pages` | `SessionPagesView` | (none) | Original `EmptySessionPage` — old two-column layout |
| `/sample-pages-v7` | `SessionPagesView` | `v6` | `EmptySessionPageV6` — full two-column with right-panel findings + widgets |
| `/home2` | `SessionPagesView` | `v7` | Greeting left + Overview widgets right, no header during greeting |
| `/home3` | `SessionPagesView` | `v8` | Single-column variant with agentic loader |

---

## Target Route Map (after swap)

| Route | Component | Variant | Description |
|-------|-----------|---------|-------------|
| `/sample-pages` | `SessionPagesView` | `v7` | Greeting left + Overview widgets right (was `/home2`) |
| `/sample-pages-v7` | `SessionPagesView` | `v6` | Full two-column with right-panel findings + widgets (unchanged) |
| `/home3` | `SessionPagesView` | `v8` | Single-column variant (unchanged) |

---

## Functional Requirements (must not break)

### R1: Greeting State (left panel)
- Shows mascot + status dot + greeting text + summary
- Findings load progressively with agentic spinner
- Findings have: status pill, title, inline widget (bignum/spark/status), chevron
- Findings expand to show evidence content + action buttons
- Thumbs up/down appear when expanded; dismiss (x) always on hover
- Dismiss shows dot countdown ring (12 dots, 5s) + undo button
- Dot-matrix shimmer surrounds the input field
- Notebook grid-line background on the left panel

### R2: Input & Navigation
- Textarea input with placeholder "Ask AI anything, or type to search a page"
- Plus (+) attachment menu, mic button, send button
- "Jump to" chips: Logs, Metrics, Dashboards, Alerts, plus (+) for page browser
- Pressing Enter or clicking Send calls `onStartThread` and transitions to chat

### R3: Transition Animation
- On submit: greeting shrinks down and moves to bottom (not fade-out)
- Chat view enters with expand animation from compressed state
- Thread panel header hidden during greeting, appears after transition

### R4: Right Panel (Overview)
- Tab bar with "Overview" tab + close + add
- "Overview" title + refresh + edit widgets buttons
- Widget grid (no duplicate insights — those are on the left)
- 6 widgets: Connection timeout, Recent alerts, Resource utilization, Top services, Dashboards, Deployment timeline
- Responsive grid: `auto-fill minmax(131px, 1fr)` with container queries (3→2→1)
- Deployment timeline has dashed average line
- Dashboards widget shows 3 items with name, value, age
- Recent alerts rows are clickable (cursor: pointer)
- Widget loading: dot shimmer with fixed 180x100 canvas (no stretch)

### R5: New Session (+) Button
- Clicking (+) in left nav creates a fresh session with `overview-home` threadKey
- Returns to full greeting state (component remounts via `key={activeSession.id}`)
- "New session" label hidden in expanded nav for this variant

### R6: Background & Pattern
- Notebook grid pattern visible during greeting state
- Pattern hides only after user sends a message (session becomes active)
- Left panel (greeting wrap) has its own `@include brandGradient` + blur

### R7: Session Container Behavior
- `threadPanelWidth: 50` (equal split)
- Resize handle between panels (side-by-side)
- After sending message: thread panel header appears, chat UI shows
- Mobile back button triggers new session creation

---

## What Should NOT Change

- `/sample-pages-v7` (the v6 variant) must remain identical
- `/home3` must remain identical
- The original `EmptySessionPage` component is untouched (used by other routes if needed)
- The `EmptySessionPageV6` component file is shared — changes affect both `/sample-pages-v7` and the greeting in the new `/sample-pages`

---

## Dependencies Between Files

| File | Used By |
|------|---------|
| `empty_session_page_v6.js` | `/sample-pages-v7` (full layout), `/sample-pages` v7 greeting (single-column mode via ThreadPage) |
| `overview_home_page.js` | Right panel tab in `/sample-pages` (v7) |
| `thread_page.js` | Contains greeting → chat transition logic for `overview-home` threadKey |
| `thread_panel.js` | Hides header during greeting via `onGreetingStateChange` |
| `session_mock_data.js` | `OVERVIEW_HOME_SESSION` defines the initial session shape |
| `sample_pages_view.js` | Routes variants, handles `handleCreateSession` for v7 |
| `session_left_nav.js` | Hides "New session" label when `hideNewSessionLabel` prop is true |
