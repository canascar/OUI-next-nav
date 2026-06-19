# Handoff: Olly Welcome Page

OpenSearch Observability — agentic welcome page with findings list, pinnable widgets, and chat input.

---

## About the Design Files

The HTML/JSX files in this bundle are **design references** built as a prototype to communicate intent — layout, typography, color, copy, behavior. They are not production code to drop into the codebase.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, etc.) using its established components, design tokens, and patterns. If no environment exists yet, choose the most appropriate framework for the project.

The prototype uses inline styles and a `tweaks-panel.jsx` for toggling states — those are scaffolding for the prototype only; ignore them when implementing.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, copy, and interactions. Recreate pixel-perfectly using the codebase's idioms.

---

## Overview

The welcome page is the entry surface for **Olly**, an autonomous observability agent. Olly works in the background continuously and surfaces only what needs attention. The page has four content zones, stacked top-to-bottom:

1. **Identity + greeting** — Olly's avatar, name, role, and a one-line status sentence in Olly's voice
2. **Chat input** — primary action: ask Olly anything
3. **Tab row** — `Activity · Recent · Favorite · Discover · Monitor · More` (Activity is default)
4. **Findings list** — agent-generated investigations + team-shared ones (under Activity tab)
5. **Pinned widgets** — live preview tiles the user has pinned (queries, dashboards, alerts, findings)

Two empty-state variants exist (no findings, no widgets) and the greeting copy adapts to state.

---

## Page Layout

- Page background: `#F4F7FB` with a subtle blueprint grid overlay (32×32px, 1px lines at `rgba(14,42,74,0.04)`)
- Content max-width: **1180px**, centered horizontally
- Outer padding: `clamp(48px, 5vw, 80px)` top / `clamp(32px, 6vw, 96px)` sides / `96px` bottom
- All sections stack vertically with explicit `marginBottom`s — see Spacing below

---

## Typography

### Fonts

- **Display + body:** `Outfit` (Google Fonts, weights 400/500/600/700)
- **Mono / small caps labels:** `IBM Plex Mono` (Google Fonts, weights 400/500/600)

Import:
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Modular type scale

A single source-of-truth scale. Use these names, not raw pixel values:

| Token       | Size  | Use |
|-------------|-------|-----|
| `micro`     | 9px   | mono captions, tab badge |
| `xs`        | 10px  | mono section labels, secondary meta |
| `sm`        | 11px  | tab labels, in-card meta summary, "Mark all read" |
| `base`      | 12px  | chat input placeholder, base body |
| `md`        | 13px  | finding card text (the headline) |
| `lg`        | 16px  | "Olly" name in header |
| `xl`        | 20px  | reserved for future subheadings |
| `display`   | 26px  | mid display |
| `hero`      | 34px  | greeting headline (clamped responsively: `clamp(26px, 3vw, 34px)`) |

### Type details

- Greeting: weight 700, letter-spacing -0.8, line-height 1.15
- Finding text: weight 600, letter-spacing -0.1, line-height 1.55
- Mono small-caps labels: weight 500–700, letter-spacing 1–1.6, `text-transform: uppercase`
- "Olly" name: weight 700, line-height 1

---

## Color Tokens

```
bg            #F4F7FB              page background
ink           #0E2A4A              primary text
sub           rgba(14, 42, 74, 0.55)  secondary text
dim           rgba(14, 42, 74, 0.40)  tertiary text, placeholders
hairline      rgba(14, 42, 74, 0.12)  borders, dividers
accent        #1F6CB5              primary blue, links, "Open →"
deep          #003B5C              gradient stop for avatar
eyebrow       rgb(40, 63, 107)     "OpenSearch Observability Agent" eyebrow
green         #2E8B6F              "alive" pulse, healthy
alert         #C53961              alert red
alertSoft     rgba(197, 57, 97, 0.08)   alert chip / left-border tint
alertBorder   rgba(197, 57, 97, 0.30)   alert card border
warnFg        #A8761F              P2 chip text
warnBg        rgba(194, 139, 46, 0.10) P2 chip background
warnBd        rgba(194, 139, 46, 0.30) P2 chip border
serviceBg     rgba(31, 108, 181, 0.08) service chip background
serviceBd     rgba(31, 108, 181, 0.25) service chip border
grid          rgba(14, 42, 74, 0.04)   page grid lines
```

Avatar background uses `linear-gradient(135deg, accent, deep)`.

---

## Spacing Scale

The page uses a coarse spacing rhythm. Common values: `8 · 12 · 16 · 18 · 22 · 28 · 32 · 36 · 40` px.

Section gaps:
- Header avatar→name gap: `10px`
- Header bottom margin: `40px`
- Chat input bottom margin: `36px`
- Divider: `8px top, 36px bottom`
- Tab row bottom margin: `32px`
- Findings header bottom margin: `16px`
- Between finding cards: `12px`
- Widget section top margin: `28px`
- Between widget tiles: `8px`

Card padding:
- Finding card: `22px 28px`
- Chat input: `16px 18px`
- Widget tile: `14px 16px`
- Empty state (findings): `40px 28px`
- Empty state (widgets): `32px 28px`

---

## Border Radius

- Chips, pins: `4px`
- Open button, pin button: `6px`
- Cards (findings, widgets, chat): `10px`
- Empty state cards: `10–12px`
- Tab pills, badges: `999px` (fully rounded)
- Avatars, pulse dot: `50%`

---

## Shadows

- Chat input: `0 1px 0 rgba(14,42,74,0.02), 0 16px 48px -32px rgba(14,42,74,0.18)`
- Active tab pill: `0 2px 8px -4px rgba(31,108,181,0.30)`
- All other cards: no shadow — rely on borders for definition

---

## Components

### 1. Olly Identity Header

```
[O avatar 32px]  Olly ● (green pulse)
                 OPENSEARCH OBSERVABILITY AGENT
```

- Avatar: 32px circle, blue gradient `linear-gradient(135deg, #1F6CB5, #003B5C)`, white "O" centered, font-weight 700, font-size ~15px (size × 0.46)
- Name "Olly": Outfit 16px / 700, color `ink`, inline with pulse
- Pulse: 7px green dot with expanding ring animation (`scale 1→2.8, opacity 0.45→0` over 2.4s, ease-out, infinite)
- Eyebrow line "OPENSEARCH OBSERVABILITY AGENT": IBM Plex Mono 10px / 500, uppercase, letter-spacing 1.2, color `eyebrow` (#283f6b)

### 2. Greeting headline

```
Good morning, John — all 247 services steady overnight. 2 findings to review.
```

- Outfit 34px / 700, letter-spacing -0.8, line-height 1.15
- Responsive: `clamp(26px, 3vw, 34px)`
- "Good morning, John —" uses `ink` color, weight 700
- Rest of sentence uses `sub` color (rgba 0.55), weight 500
- Max-width: 860px (wraps naturally for long status lines)
- The sentence is dynamic — see State Management below

### 3. Chat input

Compact box, primary action.

- White card, hairline border, radius `10px`, padding `16px 18px`
- Soft shadow (see Shadows above)
- Placeholder line: Outfit 12px / 400, color `dim`, line-height 1.5, bottom-margin 22px
  - Copy: `Ask Olly anything. Type / for actions, @ to reference a service.`
  - `/` and `@` are colored `accent` and use mono font for affordance
- Bottom row (flex space-between):
  - Left: `+` glyph, 15px, color `dim`
  - Right: 26px circle, `accent` fill, white `↑` arrow, font-size 11px, weight 600

### 4. Dashed divider

Single dashed horizontal line:
- `border-top: 1px dashed hairline`
- Margin: `8px 0 36px`

### 5. Tab row

Six pills, horizontal flex with `gap: 6px`:

```
[✦ Activity 2] [⏱ Recent] [★ Favorite] [⊙ Discover] [▢ Monitor] [⋯ More]
```

Tab styling (per pill):
- Padding: `6px 12px`, radius `999px`, gap inside `6px`
- Outfit, font-size 11px, weight 500 (inactive) / 600 (active)
- Icon: 12px, stroke-width 1.8
- **Inactive:** transparent bg, `hairline` border, `sub` color
- **Active:** white bg, `accent` border, `accent` color, shadow `0 2px 8px -4px rgba(31,108,181,0.30)`
- **Badge** (active tab with count): IBM Plex Mono 9px / 600, `accent` bg, white fg, padding `2px 7px`, radius `999px`
- **Badge** (inactive): `rgba(14,42,74,0.08)` bg, `sub` fg

Icon shapes (all 24×24 viewBox, currentColor stroke):
- `sparkles` — diamond starburst (Activity)
- `clock` — circle with hands
- `star` — five-point
- `compass` — circle with rhombus inside
- `monitor` — bell/dome shape
- `dots` — 2×3 grid of dots

### 6. Findings section

#### Section header

```
// FROM YOUR AGENT — 02 FINDINGS                                    Mark all read
```

- Section label: IBM Plex Mono 10px / 600, letter-spacing 1.6, color `accent`
- Count is **zero-padded** (`02` not `2`)
- Singular/plural: `FINDING` vs `FINDINGS`
- "Mark all read": Outfit 11px / 500, color `sub`, right-aligned, clickable
- Header bottom-margin: 16px

#### Finding card

White card, distinguishable for alert vs normal severity:
- **Normal:** 1px `hairline` border + 3px `accent` left border
- **Alert:** 1px `alertBorder` + 3px `alert` left border
- Radius 10px, padding `22px 28px`, cursor pointer
- Cards stacked with `gap: 12px`

**Top row — the finding text:**
- Outfit 13px / 600, line-height 1.55, letter-spacing -0.1, color `ink`, bottom-margin 18px
- Example: `Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.`

**Bottom row — meta line (flex, align center, gap 12, wrap):**
1. **Source avatar** (22px):
   - AI: same blue gradient as Olly
   - Team-shared: `#DC3545` red circle with first-letter initial (white, weight 600)
2. **Priority chip:** `P1` for alerts (alert tone), `P2` for normal (warn tone)
3. **Service chip:** the service name (service tone — blue tint)
4. **Plain-English summary** — Outfit 11px / 400, line-height 1.5, color `sub`
   - **AI voice:** `Started <b>15 min ago</b>, <b>still climbing</b> on 3 of 4 pods · <b>92% confidence</b>`
     - `<b>` parts are `ink` color, weight 600; "still climbing" tinted with alert/warn color
   - **Team voice:** `Shared <b>2 hours ago</b> by <b>Sichen</b> · linked to auth-svc rollout`
5. Flex spacer
6. **Open →** link: IBM Plex Mono 9px / 700, `accent` color, letter-spacing 1.2, uppercase

#### Chip variants

All chips: inline-flex, padding `3px 8px`, radius `4px`, 1px border, IBM Plex Mono 9px / 700, letter-spacing 1, uppercase, line-height 1.3.

| Tone    | Background | Foreground | Border |
|---------|------------|------------|--------|
| alert   | `alertSoft` | `alert`   | `alertBorder` |
| warn    | `rgba(194,139,46,0.10)` | `#A8761F` | `rgba(194,139,46,0.30)` |
| service | `rgba(31,108,181,0.08)` | `accent`  | `rgba(31,108,181,0.25)` |

### 7. Findings empty state

Replaces the findings list when there are zero findings:
- Dashed border (`hairline`), radius 12px, padding `40px 28px`, center-aligned
- Headline: Outfit 13px / 600, color `ink` — `All clear.`
- Body: Outfit 11px / 400, color `sub` — `Olly will surface anything worth your attention here.`

### 8. Widgets section (// PINNED)

Section header:
```
// PINNED — 03                                                                Edit
```
- Same mono label treatment as findings header
- Right-side "Edit" link instead of "Mark all read"
- Section top margin: 28px, header bottom margin: 10px

Widget grid:
- `grid-template-columns: repeat(4, minmax(0, 1fr))` — 4 columns, allows shrink
- Gap: 8px
- Tiles fill the first N slots; final slot is always the **Add slot**

#### Widget tile (per pinned item)

White card, hairline border, radius 8, padding `14px 16px`, min-height 168px. Flex column, gap 10.
- **Alert widget** uses `alertBorder` instead of hairline.

Structure:
1. **Top row** (flex space-between, align flex-start):
   - **Left column:**
     - Type label: IBM Plex Mono 9.5px, letter-spacing 0.8, uppercase, color `dim` — e.g. `SAVED QUERY`, `DASHBOARD`, `ALERT`
     - Title: Outfit 12.5px / 500, color `ink`, single-line truncated
   - **Right:** `● live` indicator — 5px green dot + IBM Plex Mono 9px, letter-spacing 0.6, uppercase, color `dim`
2. **Preview area** (min-height 56px, margin `2px -4px`):
   - **Spark** kind: SVG sparkline, full-width, 56px tall, with area fill at 10% opacity, line stroke 1.4px, last-point dot (2.6r) with 5r halo (0.2 opacity). Alert widgets use `alert` color; others use `accent`.
   - **Bar** kind: vertical bars, 3px gap, last bar full opacity, others 55%. Uses `accent`.
   - **Rank** kind: 4 rows, each with `#i`, name, horizontal bar (4px tall, fill = `pct%` of `accent` at 75% opacity), and right-aligned value.
3. **Footer** (flex baseline space-between, margin-top auto):
   - **Value**: IBM Plex Mono 20px / 500, letter-spacing -0.5, color `ink` (or `alert` for alert widgets) — e.g. `2,140 ms`
   - **Trend**: IBM Plex Mono 10.5px, color depends:
     - Up + alert → `alert`
     - Down → `green`
     - Flat → `sub`
   - Trend prefix glyph: `↑` / `↓` / `→`

Three demo widgets (`olly-widgets.jsx`):
1. `Payment-service · P99` (saved query, spark, alert tone, +184%)
2. `Error rate · all services` (saved query, bar, -0.04)
3. `Top services by traffic` (dashboard, rank, stable)

#### Widget add slot (always last)

Dashed border, radius 8, min-height 168, centered:
- 28px dashed circle containing a 12px pin icon
- Title: Outfit 11.5px / 500 — `Pin something`
- Subtitle: Outfit 10.5px, color `dim`, center, line-height 1.35 — `Queries, dashboards, alerts, findings.`

#### Pin icon (SVG, 24×24 viewBox)

```
<path d="M12 17v5"/>
<path d="M9 10.5V4h6v6.5l2.5 3.5h-11l2.5-3.5z"/>
```
Stroke 1.7, current color, round caps/joins.

### 9. Widgets empty state

Replaces the 4-column grid when no widgets are pinned:
- Dashed border, radius 10, padding `32px 28px`, `rgba(255,255,255,0.4)` bg
- Two-column grid: copy on left, ghost tile preview on right (3 grey rectangle tiles at 40% opacity)
- Copy:
  - Headline (Outfit 14px / 600, `ink`): `Pin anything you check often.`
  - Body (Outfit 12px, line-height 1.5, color `sub`, max-w 480): explains pinning, shows the `[📌 Pin]` button inline, lists pinnable types — `a query, a dashboard, an alert, a finding, or anything Olly turns up.`
  - Tag row: 6 pill-shaped chips with type names — `Saved query · Dashboard · Alert · Finding · Service health · Olly answer`. Each: IBM Plex Mono 10px, color `sub`, padding `3px 8px`, `rgba(14,42,74,0.04)` bg, radius 999.

---

## State Management

### Variables

```ts
type WelcomeState = {
  findings: Finding[];          // [] = empty state
  pinnedWidgets: Widget[];      // [] = empty state
  activeTab: 'activity' | 'recent' | 'favorite' | 'discover' | 'monitor' | 'more';
  user: { name: string };
  servicesSteady: number;       // for greeting summary
};

type Finding = {
  id: number;
  source: 'ai' | 'team';
  sharedBy?: string;            // when source === 'team'
  finding: string;              // the headline
  severity: 'alert' | 'normal';
  priority: 'P1' | 'P2' | 'P3';
  service: string;              // chip
  scope: string;                // "3 of 4 pods"
  confidence?: number;          // AI only, 0–100
  trend?: string;               // AI only, "still climbing"
  age: string;                  // pre-formatted, "15 min ago"
  detail?: string;              // team only, e.g. "linked to auth-svc rollout"
  tabs: number;                 // related views to open
};

type Widget = {
  id: number;
  kindLabel: string;            // "Saved query" etc.
  title: string;
  kind: 'spark' | 'bar' | 'rank';
  data: number[] | Array<{name: string; pct: number; val: string}>;
  value: string;                // "2,140 ms"
  trend: 'up' | 'down' | 'flat';
  trendValue: string;           // "+184%" or "stable"
  severity: 'alert' | 'normal';
};
```

### Greeting summary copy (dynamic)

```ts
const summary = findings.length > 0
  ? `all ${servicesSteady} services steady overnight. ${findings.length} finding${findings.length === 1 ? '' : 's'} to review.`
  : `all ${servicesSteady} services steady overnight. All clear.`;
```

### Tab badge

Activity tab shows badge if `findings.length > 0`.

### Section labels

Always zero-pad counts to 2 digits: `01`, `02`, `12`, etc.

---

## Interactions & Behavior

### Hover/active states

The prototype has minimal hover states. Apply codebase's standard hover treatments:
- Cards (findings, widgets): subtle border or shadow lift on hover; cursor pointer
- Tab pills: slight bg tint on hover (inactive only)
- Pin/Open links: underline or slight color shift on hover

### Click handlers

- **Chat input** → opens full input or sends query
- **Finding card** → opens investigation in N tabs (`f.tabs`)
- **"Open →"** → same as card click
- **"Mark all read"** → clears findings to empty state
- **Tab pill** → switches active tab
- **Widget tile** → opens the underlying query/dashboard
- **Add slot** → opens pin picker
- **"Edit" (widgets section)** → enter widget-management mode

### Animations

- **Pulse** on Olly status dot:
  ```css
  @keyframes orPulse {
    0%   { transform: scale(1);   opacity: 0.45; }
    100% { transform: scale(2.8); opacity: 0;    }
  }
  /* applied to the outer ring; duration 2.4s, ease-out, infinite */
  ```
- All card border transitions: `0.15s` ease
- Tab transitions: `0.15s` ease on bg/color/box-shadow

### Responsive

- Page padding clamps with viewport (see Layout section)
- Greeting clamps from 26px to 34px
- Tab row wraps if needed
- Widget grid: `minmax(0, 1fr)` so columns shrink rather than overflow
- At narrow viewports, finding meta line wraps naturally (flex-wrap)

---

## Pin / Favorite distinction

This is an important product concept:

| | Favorite | Pin |
|---|---|---|
| Verb | "save for later" | "put on my home page" |
| Where it shows | Favorite tab (list of bookmarks) | Home page (live preview tile) |
| Applicable to | Saved searches, dashboards | **Anything** — queries, dashboards, alerts, findings, Olly responses |
| Relationship | Independent | Independent |

Findings cards do **not** have a Pin button — pinning happens elsewhere (in detail views, search results, etc.). The empty widget state copy makes the breadth of pinnable things explicit.

---

## Empty States

The page has multiple empty states. Implement all three:
1. **No findings, widgets pinned** — greeting says "All clear", findings replaced with dashed `All clear.` card, widgets normal
2. **Findings present, no widgets** — greeting says "N findings to review", findings normal, widgets replaced with dashed CTA card
3. **No findings AND no widgets (first run)** — both empty states show

---

## Files Included

| File | Purpose |
|---|---|
| `Olly Welcome - Refined.html` | Main reference — populated state |
| `Olly Welcome - Empty State.html` | Empty state reference (no findings + no widgets) |
| `olly-refined.jsx` | Refined page components — header, chat, divider, tabs, findings |
| `olly-widgets.jsx` | Widget tiles, add slot, empty state, pin icon |
| `tweaks-panel.jsx` | **Prototype scaffolding only** — used by HTML to toggle states. Not part of the design. Ignore. |

To view the prototype: open the `.html` files directly in a browser. The Tweaks panel (bottom-right) toggles findings on/off and widgets between populated / empty / hidden.

---

## Assets

No image assets — the design is fully vector/typography.

All iconography is inline SVG (see `olly-refined.jsx` `ORTabIcon` and `olly-widgets.jsx` `PinIcon`). When implementing, use the codebase's existing icon system if available (Lucide, Heroicons, etc.) — match shape/stroke, not pixels.

The Olly avatar is a typographic "O" inside a gradient circle, no image needed.

---

## Implementation Notes

1. **Use the codebase's components.** Buttons, cards, chips, and pills likely already exist — wire them up rather than re-implementing from these inline styles.
2. **Tokenize colors and type scale first.** Add them as design tokens (CSS custom properties, theme variables, etc.) before building components. Reference tokens, not raw values.
3. **The Olly persona matters.** Greeting copy, summary voice, eyebrow label — these are all part of the product identity. Keep the strings as-is unless product asks otherwise.
4. **Widget data shapes will come from the backend.** The prototype uses static demo data. Coordinate with backend on the actual `Widget` and `Finding` shapes.
5. **Chat input is a placeholder.** It currently doesn't do anything — wire it to the actual chat/query system.
