# Home Page: Insights & Widgets Design Logic

Design spec for the `/home` page (v6) — insights panel and widget grid in the right column.

---

## Insights (Finding Cards)

### Structure

Each insight is a collapsible card with:
- **Status pill** (Critical / Warning / Review) with semantic color
- **Title** — one-line description of the finding
- **Right-side widget** — inline metric (bignum, status dot, or sparkline with stripe fill)
- **Chevron** — indicates expandability

### Interaction States

| State | Behavior |
|-------|----------|
| **Collapsed** | Shows status pill + title + inline metric + chevron |
| **Hover (collapsed)** | Only the **dismiss (x)** button appears on the right edge |
| **Expanded** | Full evidence panel + action buttons. **Thumbs up/down** appear alongside dismiss |
| **Feedback selected** | Thumbs up or down fills to solid black (no color). Persists until toggled off |
| **Dismissed** | Card collapses to single line showing only the title (no "dismissed" label). A **dotted arc countdown ring** (12 dots, depleting one by one over 5 seconds) appears next to an **Undo** button. After 5s, the card is removed entirely |

### Dismiss Countdown Ring

- 12 dots arranged in a circle (14x14px SVG)
- Dots deplete sequentially over 5 seconds
- Active dots: `opacity: 0.7`, `r: 1`
- Depleted dots: `opacity: 0.15`, `r: 0.6`
- Color: inherits from card text color (subtle, not attention-grabbing)

### Feedback Buttons

- **Thumbs up / Thumbs down**: Only visible when card is expanded. Click toggles active state (solid fill, no color — just black/white depending on theme). Clicking same button deselects. Clicking opposite switches.
- **Dismiss (x)**: Always visible on hover regardless of expanded state.
- When any button is active, the side action bar stays visible (`:has(.v6Scenario__findingSideBtn--active)` keeps opacity at 1).

### Sparkline Widget

- Uses the same **diagonal stripe texture** as the main charts (45-degree rotated line pattern at 35% opacity)
- Stroke with rounded linecap sits on top of the fill area

---

## Widget Grid

### Layout

- CSS Grid: `repeat(3, 1fr)` with `8px` gap
- Each widget card: `display: flex; flex-direction: column; flex: 1`
- Grid rows auto-size to the tallest card

### Chart Alignment Rule

All chart-bearing widgets (Connection timeout, Resource utilization, Deployment timeline) follow this rule:

> Charts are **absolutely positioned at the bottom** of their card (`bottom: 10px`). The card reserves `padding-bottom: 66px` (56px chart height + 10px spacing). This ensures all chart bottoms align across a row regardless of title/number height above.

Non-chart cards (Recent alerts, Top services, Dashboards) use `:not(:has(.widgetCard__chart))` to revert to normal `padding-bottom: 10px`.

### Table Widget Fit Logic

Table-based widgets (`.widgetCard__rows`) use `flex: 1; overflow: hidden` — they expand to fill the available card height within their grid row, showing as many items as fit.

### Chart Style (Shared)

All line charts use the same visual treatment:
- **Full-bleed SVG** (`preserveAspectRatio="none"`) at 56px height
- **Stripe fill** — 45-degree rotated line pattern (`<pattern>` element), color matches the stroke
- **Smooth curve** — 2.5px stroke, rounded linecap
- **No axis labels, ticks, or gridlines** — the big number above tells the value

### Color Logic

| Widget | Condition | Color |
|--------|-----------|-------|
| Connection timeout | Trend is up (↑) | `#DD8A3A` (amber) |
| Connection timeout | Trend is down (↓) | `#1F9D6B` (green) |
| Resource utilization | > 80% | `#DC2626` / `#ef4444` (red) |
| Resource utilization | > 60% | `#B45309` / `#f59e0b` (amber) |
| Resource utilization | <= 60% | `#1F9D6B` / `#34d399` (green) |
| Deployment timeline | Always | `#2BA98A` (teal) |

### Deployment Timeline Specifics

- Shows **average per week** as the big number (same `widgetCard__bigNumber` class as other charts)
- "avg/wk" label in subtle gray (not green)
- A **dashed average line** sits horizontally at the computed average height within the bar chart
- Bar chart: 5 bars, height proportional to `value / (max + 2)`

### Widget Card Sizes

All big numbers use `widgetCard__bigNumber` (16px) for consistency across:
- Connection timeout errors (e.g. "847")
- Resource utilization (e.g. "56%")
- Deployment timeline (e.g. "11")

### Dashboards Widget

Shows saved dashboards as a two-column list:
- **Left column**: Name (9.5px, weight 450) on first line, value (8.5px, mono, 38% opacity) on second line
- **Right column**: Age/recency label (8.5px, 30% opacity)
- 3 items per scenario (balanced with other widgets)
- Values are contextual to the dashboard type (e.g. "175ms", "244 healthy", "0.58 score")

### Recent Alerts Widget

- Table with ALERT / STATUS columns
- Status badges: `CRITICAL` (red), `WARNING` (amber), `LOW` (muted)
- No "INFO" tag — use "LOW" instead

---

## Per-Scenario Data

Each of the 5 scenarios provides unique data for all 6 widgets. The data must be **internally consistent** with the scenario narrative:

| Scenario | Theme | Timeout trend | Utilization | Alert severity |
|----------|-------|---------------|-------------|----------------|
| 1 | Healthy, minor drift | 847 ↑31% | 56% (green) | Mixed |
| 2 | Active incident (checkout loop) | 2,341 ↑184% | 94% (red) | All critical |
| 3 | billing-agent accuracy drop | 1,204 ↑62% | 41% (green) | Critical + warning |
| 4 | Tool-selection degradation | 203 ↓12% | 38% (green) | Warnings only |
| 5 | Recurring pattern (5th time) | 512 ↑47% | 62% (amber) | Warnings + low |

---

## Edit Mode

- Widgets get remove (x) and drag-resize handles
- **"Add widget" tile**: fixed `height: 48px`, `align-self: start` — does NOT stretch to fill the grid row
- Widget picker overlay with search

---

## Font Size Hierarchy (within widget cards)

| Element | Size |
|---------|------|
| Widget title | 10.5px |
| Big number | 16px |
| Trend label | 8.5px |
| Table header | 7.5px |
| Table row text | 9px |
| Bar label | 9.5px |
| Bar value | 8.5px |
| Dashboard name | 9.5px |
| Dashboard value | 8.5px |
| Dashboard age | 8.5px |
