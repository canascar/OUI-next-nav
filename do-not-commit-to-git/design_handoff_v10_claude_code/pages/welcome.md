# Welcome Page

**Source**: `reference/welcome-d3.jsx` · **Live mock**: `reference/Welcome D3.html`

## Layout

```
┌────────────────────────────────────────────────────────────────┐
│  (drafting grid background + 4 corner registration marks)      │
│                                                                │
│  ┌────────────────────────────────────────┐                    │
│  │ [theme toggle, top-right]              │                    │
│  │                                        │                    │
│  │ [olly] Good morning, John              │                    │
│  │        All 247 services steady. ...    │                    │
│  │                                        │                    │
│  │ ┌──────────────────────────────┐       │                    │
│  │ │ Ask AI anything...    +    ↑ │       │                    │
│  │ └──────────────────────────────┘       │                    │
│  │                                        │                    │
│  │ [history] [Overview•] [Discover] ...   │                    │
│  │                                        │                    │
│  │ // LATEST ─ ─ ─ ─ ─ ─ ─ ─ ─ ─          │                    │
│  │ ┌──────────────────────────────┐       │                    │
│  │ │ Finding card (amber accent)  │       │                    │
│  │ └──────────────────────────────┘       │                    │
│  │ ┌──────────────────────────────┐       │                    │
│  │ │ Finding card (cyan accent)   │       │                    │
│  │ └──────────────────────────────┘       │                    │
│  │                                        │                    │
│  │ // SERVICE ─ ─    // SAVED QUERY ─ ─   │                    │
│  │ ┌────────────┐    ┌────────────┐       │                    │
│  │ │ top svcs   │    │ timeouts   │       │                    │
│  │ └────────────┘    └────────────┘       │                    │
│  │                                        │                    │
│  │ // FAVORITES ─ ─ ─ ─ ─ ─ ─ ─           │                    │
│  │ ┌──────────────────────────────┐       │                    │
│  │ │ System overview     ▦        │       │                    │
│  │ └──────────────────────────────┘       │                    │
│  │ ┌──────────────────────────────┐       │                    │
│  │ │ Error rate by service ◐      │       │                    │
│  │ └──────────────────────────────┘       │                    │
│  │                                        │                    │
│  │        [◷ EDIT OVERVIEW]               │                    │
│  └────────────────────────────────────────┘                    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Page chrome

- Wrapper: `.v10-page` (drafting grid background)
- Corner registration marks (4 corners, fixed-positioned, `pointer-events: none`, `z-index: 50`) — see `recipes/01-corner-ticks.md` and the existing SVG in the reference
- Centered content column:
  - `max-width: 1100px`
  - `margin: 0 auto`
  - `padding: 0 32px`
  - `padding-top: 40px`
  - `padding-bottom: 80px`

## Sections

### 1 · Theme toggle row

Right-aligned. `margin-bottom: 16px`.

```jsx
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
  <ThemeToggle mode={mode} setMode={setMode} />
</div>
```

### 2 · Header

- Flex row, `align-items: center`, `gap: 18px`, `margin-bottom: 28px`
- `OllyAvatar size={52}` (the mascot — see recipe 02)
- Title block:
  - H1: "Good morning, John" — Outfit 600 / 32px / `-0.8px` / `lineHeight: 1.1`, color `inkBright`
  - Sub-line: 14.5px sans, `inkDim` ink. Substitute live numbers:
    - "All **247** services steady." (247 in `ink` / 600)
    - "**2** activities to review." (2 in `amber` / 600)

### 3 · Ask bar

- Wrapper: relative, `background: var(--v10-input-bg)`, `border: 1px solid var(--v10-ink-ghost)`, `padding: 14px 16px`
- Add `<CornerTicks accent={cyanDim} />` inside
- Body: "Ask AI anything, or type to search a page" — 15px sans / `inkDim`, `min-height: 44px`
- Footer row (`display: flex; justify-content: space-between; margin-top: 8px`):
  - **Round** `+` button (26px, 50% radius, `inkFade` border, `inkDim` text) — see recipe 09
  - **Round** send button (30px, 50% radius, `cyanDim` border, `cyanSoft` bg, `cyan` arrow icon)

### 4 · Tab bar

- Flex row, `align-items: center`, `gap: 10px`, `margin-bottom: 28px`
- 36px square history button (clock-with-hands SVG) on the left
- 4 tabs: **Overview**, **Discover**, **Monitor**, **More** — each `flex: 1`
- Each tab:
  - `padding: 9px 18px`
  - Border `1px solid inkFade` (or `cyanDim` when active)
  - Background `panel` (or `cyanSoft` when active)
  - Font: IBM Plex Mono, 700, 11.5px, `letter-spacing: 1.6`, uppercase
  - Active: `cyan` color; inactive: `ink`
- The **Overview** tab has an `amber` 6×6 px dot at top-right (NEW indicator) — absolute, top 7 / right 9

### 5 · `// LATEST` section

Use `<SectionLabel>LATEST</SectionLabel>`. Then a vertical stack of finding cards, `gap: 10px`.

Each finding card:
- Background `panel`, border `1px solid inkGhost`, `border-left: 2px solid <severity-accent>`
- `padding: 16px 20px`
- `<CornerTicks accent={<severity-accent>} />`
- Top row: title (Outfit 600 / 17 / `-0.2`, `inkBright`) + tinyLabel mono caption + **Dismiss** ghost button (right-aligned)
- Finding sentence (Outfit 500 / 14.5 / `-0.1`, `ink`, line-height 1.45) — `margin-bottom: 12px`
- Meta strip: `OllyAvatar` (22px) or `PersonAvatar` + `IsoStack` + scope text + `│` separator + `LatencyBar` + metric + label + delta + `│` + tiny mono caption "T+15m · CONF 92% · 3 TABS"

The two findings shown in the reference:

| # | Source | Accent | Title | Severity meta |
|---|---|---|---|---|
| 1 | AI (Olly) | amber | Latency Spike Investigation | 3/4 pods, 2,140ms P99, +184%, T+15m, CONF 92% |
| 2 | Team (Sichenl) | cyan | Error Rate Spike — Checkout Service | 1/1 svc, 12.4% err rate, +12.4 pts, T+2h, CONF 88% |

### 6 · Two-column row: `// SERVICE` + `// SAVED QUERY`

```jsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
  <div>
    <SectionLabel>SERVICE</SectionLabel>
    <TopServices />
  </div>
  <div>
    <SectionLabel>SAVED QUERY</SectionLabel>
    <ConnTimeouts />
  </div>
</div>
```

`gap: 28px` above and below this block.

#### Top services card

Panel with corner ticks. Title "Top services by fault rate" (Outfit 600 / 16 / `-0.2`). 3 rows:

| Service | Fault rate bar (160px wide) | Percent |
|---|---|---|
| checkout       | 66.67% filled | `66.67%` |
| frontend       | 14.49% filled | `14.49%` |
| frontend-proxy | 14.29% filled | `14.29%` |

Fault bar: filled portion is a `cyanSoft` rect with `cyan` border, 12px tall. Remainder is a 45° hatched dashed strip using `repeating-linear-gradient(45deg, var(--v10-ink-ghost) 0 1px, transparent 1px 6px)`.

#### Connection timeouts card

Panel with `amber` corner ticks. Title + small `inkFade` query line "`$ source=logs | where seve…`" (truncated with ellipsis). Below:

- A small sparkline SVG (200×56) showing values climbing from ~30 to 847; `amberSoft` fill polygon under the `amber` line; final point marked with a 3px `amber` dot.
- A right-aligned stat column (gap 4px, `flex-shrink: 0`, `white-space: nowrap`):
  - `847` — mono 700 / 28 / `-0.5`, `amber`
  - `↑ +312%` — mono 700 / 11, `amber`
  - `Last 15 min` — mono 600 / 9.5, `inkDim`, letter-spacing 1.2, uppercase

### 7 · `// FAVORITES`

Vertical stack, `gap: 8px`. Each row:

- Background `panel`, border `1px solid inkGhost`, `padding: 14px 20px`
- Corner ticks
- Flex row: title + kind on the left, small `cyan` icon on the right

Rows shown:

| Title | Kind | Icon |
|---|---|---|
| System overview | Dashboard | 2×2 grid (4 squares, 20×20, stroke 1.4) |
| Error rate by service | Saved log | circle + inner diamond (20×20) |

### 8 · Edit overview footer

Centered ghost button "◷ EDIT OVERVIEW" — `margin-top: 36px`.

## Behavioral notes

- Tab clicks change the local `active` tab state. They do NOT route in the reference; in production these become real routes.
- Theme toggle updates `data-theme` on the html element and persists to `localStorage`.
- The ask-bar input is non-functional in the reference (a placeholder span). In production, replace with a real `<textarea>` or a command palette.

## Hand-off checklist

- [ ] Page background uses `.v10-page` (drafting grid)
- [ ] Corner registration marks present in 4 fixed positions
- [ ] OllyAvatar 52px in header
- [ ] Ask-bar `+` and send buttons are the ONLY round controls
- [ ] Each finding card has corner ticks and a 2px left accent
- [ ] Iso cubes appear inside each finding's meta strip
- [ ] Theme toggle persists choice across reloads
