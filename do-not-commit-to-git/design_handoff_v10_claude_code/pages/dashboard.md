# Dashboard Page

**Source**: `reference/dashboard-d3.jsx` · **Live mock**: `reference/Dashboard D3.html`

## Layout

Full bleed, three columns. Body `overflow: hidden`; each column scrolls independently.

```
┌──────┬──────────────────────┬─────────────────────────────────────┐
│      │  Latency Spike Inv.. │ [tab] [tab] [tab] [+]     [☀/☾] [≡] │
│ [O]  ├──────────────────────┼─────────────────────────────────────┤
│      │                      │ Alert: P95 Latency > 2s        [⚙] │
│ [+]  │  Olly: An alert has  │                                     │
│ [💬]  │  been triggered...   │  ┌─────────────────────────────┐    │
│ [📁]  │                      │  │  P99 latency line chart      │    │
│      │  [artifact card]     │  └─────────────────────────────┘    │
│      │  [bar chart]         │                                     │
│      │  [👍 👎]              │  ⚠ Alarm triggered at ...           │
│ ───  │  ...                 │                                     │
│      │  [code block]        │  // SUMMARY                         │
│ [▦]  │  [👍 👎]              │  payment-service P99 latency...     │
│ [≡▢] │                      │                                     │
│ [⚙]  ├──────────────────────┤  // RECOMMENDATION                  │
│      │  [+]  Ask anything   │  01  Check recent deployments...    │
│ [J]  │       Type / for ... │  02  Review upstream dependencies   │
└──────┴──────────────────────┴─────────────────────────────────────┘
  56px           500px                       flex: 1
```

## Page wrapper

- `.v10-page` (drafting grid)
- Do NOT include the 4 corner registration marks (the dashboard is full-bleed; those marks belong to centered content pages)
- `body { overflow: hidden; }` so each column scrolls independently
- The drafting grid is visible through `panel` opacity in `bg` areas; that's fine.

## Column 1 — Left rail (56px)

- `width: 56px`, `flex-shrink: 0`
- `border-right: 1px solid var(--v10-ink-ghost)`
- `background: var(--v10-panel)`
- Flex column, `align-items: center`, `padding: 14px 0`

### Top: OpenSearch logo

Use the official OpenSearch logo at 28×28 (centered in a 32×32 box). Three-path SVG:

```html
<svg width="28" height="28" viewBox="0 0 64 64" fill="none">
  <path d="M61.7374 23.5C60.4878 23.5 ... " fill="#005EB8"/>
  <path d="M48.0814 38C50.2572 34.4505 ... " fill="#003B5C"/>
  <path d="M3.91861 14C1.74276 17.5495 ... " fill="#005EB8"/>
</svg>
```

(Full paths are in `reference/dashboard-d3.jsx` under "OpenSearch logo".)

### Icon group 1 (top)

Three 36×36 square buttons (see recipe 09):

| Icon | Label | Active? |
|---|---|---|
| Plus (line cross) | new chat | no |
| Chat bubble | conversations | **yes** (`cyanSoft`/`cyanDim`/`cyan`) |
| Folder | files | no |

### Spacer (`flex: 1`)

### Icon group 2 (bottom)

Three 36×36 square buttons:

| Icon | Label |
|---|---|
| 2×2 grid | apps |
| Terminal/CLI | code |
| Settings (gear with rays) | settings |

### Bottom: current user

`<PersonAvatar initial="J" color={red} size={28} />` (see recipe 03). `margin-top: 10px`.

## Column 2 — Chat panel (500px)

- `width: 500px`, `flex-shrink: 0`
- `border-right: 1px solid var(--v10-ink-ghost)`
- `background: var(--v10-bg)` (the chat lives on paper, not panel)
- `height: 100vh`, flex column

### Header

`padding: 14px 18px`, `border-bottom: 1px solid var(--v10-ink-ghost)`.

```
[💬 cyan]  Latency Spike Investigation  [share] [window] [fullscreen]
```

- Chat icon (cyan, 18px)
- Title (Outfit 600 / 14.5 / `-0.1`, `inkBright`)
- 3 trailing icon buttons (28px square ghost) for share / window / fullscreen actions

### Scroll body

`flex: 1`, `overflow-y: auto`, `padding: 20px 22px`, vertical stack `gap: 16px`. Block types in order in the reference:

1. **Paragraph** — "An alert has been triggered: P99 latency on the payment service exceeded 2,000ms for the past 15 minutes. I am starting an investigation."
2. **Paragraph** — "I pulled the service metrics and correlated them with recent deployment events. Here is what I am seeing:"
3. **Artifact card (amber accent)** — "Payment service alert — P99 latency breach" / "Triggered at 14:32 UTC. P99 latency crossed the 2,000ms threshold on 3 of 4 pods. No recent deploys in the last 6 hours."
4. **Bar chart artifact (cyan accent)** — "P99 Latency (last 2h)" — 7 vertical bars stretched at heights proportional to values `[180, 195, 220, 380, 1200, 1800, 2140]`. Bars ≥ 1000 use `amber` colors, else `cyan`. Each bar has a small tilted-iso cap on top: 5px tall, fill = stroke color at opacity 0.3, `clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)`.
5. **Feedback row** — two 26px ghost squares (thumbs up / thumbs down)
6. **Heading** — "Hypothesis 1: Downstream dependency bottleneck" (Outfit 700 / 14.5 / `-0.1`)
7. **Paragraph** — explanation
8. **Artifact card (cyan)** — "Inventory service dependency analysis"
9. **Feedback row**
10. **Heading** — "Hypothesis 2: Connection pool exhaustion"
11. **Paragraph**
12. **Artifact card (cyan)** — "Payment service connection pool metrics"
13. **Feedback row**
14. **Paragraph** — "Here are the recommended next steps to confirm and mitigate:"
15. **Numbered bullet list** — see `BulletList` in the reference
16. **Paragraph** — "I have prepared a script to apply the connection pool fix:"
17. **Code block** — filename `apply-fix.sh`, contents shown in the reference. Syntax highlighting tones:
    - `cmd` (cyan / 700) — `kubectl`, `echo`
    - `flag` (ink) — `-n`, `--type`, `--timeout`
    - `str` (amber) — quoted strings
    - `num` (green) — numerics like `120s`
    - `cmt` (inkFade italic) — `# ...`
    - `op` (inkDim) — operators like `\` line continuations
18. **Feedback row**
19. Two **Suggested action** pills with corner arrows pointing up-and-right

### Input bar (bottom)

`padding: 12px 18px 14px`, `border-top: 1px solid var(--v10-ink-ghost)`.

- Wrapper: relative, `background: var(--v10-input-bg)`, `border: 1px solid var(--v10-ink-ghost)`, `padding: 12px 14px`, corner ticks (cyan)
- Body text: "Ask anything. Type `/` for actions." — wrap the `/` in a key-cap-style span: mono 12.5 / cyan / `padding: 0 4px` / `border: 1px solid var(--v10-cyan-dim)`
- Footer row: 24px square `+` button (left), 28px square send button (right) — **square, NOT round** (round is welcome-only)

## Column 3 — Canvas (`flex: 1`)

- `flex: 1`, `min-width: 0`
- Flex column, `height: 100vh`
- `background: var(--v10-bg)`

### Tab bar

`padding: 12px 20px`, `border-bottom: 1px solid var(--v10-ink-ghost)`, flex row gap 6.

Tabs (in order):
- **Alert: P95 Latency > 2s** — active. Icon: 13px alert circle. Trailing close button.
- **Inventory service depen…** — inactive. Icon: document.
- **Payment service connec…** — inactive. Icon: document.
- **+** — 32px square ghost (add tab)

Spacer (`flex: 1`)

- **ThemeToggle** (see recipe 08)
- 32×32 square ghost button with hamburger icon (3 horizontal lines)

### Scroll body

`padding: 22px 32px`, `overflow-y: auto`.

#### Title row

Flex row, `margin-bottom: 18px`:
- H2 "Alert: P95 Latency > 2s" — Outfit 600 / 22 / `-0.4`
- 32×32 ghost icon button (axis-tweak / dropdown menu icon)

#### Line chart card

Panel with corner ticks (neutral cyan). `padding: 16px 20px`, `margin-bottom: 14px`.

Title: "Metric: payment-service P99 latency" — Outfit 600 / 14 / `-0.1`.

SVG below — 760×240 viewBox, full-width by `width: 100%` + `preserveAspectRatio="xMidYMid meet"`:
- y grid lines + labels at 200 / 600 / 1000 / 1400 / 1800 / 2200 ms
- x tick labels at 0, 0.5, 1, 1.5, …, 6 (hours)
- baseline x axis line at the bottom
- **Dashed red threshold line at y = 2000 ms** (`stroke: var(--v10-red)`, `stroke-width: 1.2`, `stroke-dasharray: 6 4`)
- `cyanSoft` filled area polygon under the line
- `cyan` stroked polyline, `stroke-width: 1.6`, round joins/caps
- 3px circle markers at each data point (fill = bg, stroke = cyan, width 1.4)

Data points used:
```
(0, 220), (0.5, 215), (1, 230), (1.5, 240), (2, 280), (2.5, 360),
(3, 520), (3.5, 760), (4, 1100), (4.5, 1500), (5, 1900), (5.5, 2050), (6, 2200)
```

#### Alarm banner

`background: var(--v10-amber-soft)`, `border: 1px solid var(--v10-amber-dim)`, `border-left: 2px solid var(--v10-amber)`, `padding: 12px 16px`, corner ticks (amber).

Content: `[⚠ amber 18px]  **Alarm triggered** at May 13, 02:32 PM UTC — payment-service P99 crossed 2,000ms threshold`

`margin-bottom: 18px`.

#### `// SUMMARY`

`<SectionLabel>SUMMARY</SectionLabel>` (see recipe 07). Body: "payment-service P99 latency on production cluster".

#### `// RECOMMENDATION`

`<SectionLabel>RECOMMENDATION</SectionLabel>`. Numbered bullet list with 5 items:

1. Check recent deployments to the affected service for regressions.
2. Review upstream dependency health and connection pool metrics.
3. Inspect application logs for error patterns correlated with the latency increase.
4. Consider scaling the service if the issue is load-related.
5. If this is a known issue, acknowledge the alert and update the runbook.

## Scrollbars

```css
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: var(--v10-scroll-thumb); border-radius: 0; }
*::-webkit-scrollbar-thumb:hover { background: var(--v10-scroll-thumb-hover); }
```

These are scoped via `data-theme` already in `tokens.css`.

## Behavioral notes

- Each column scrolls independently — set `overflow: hidden` on `body` and `overflow-y: auto` on each column body
- The dashboard `useEffect`s `document.documentElement.dataset.theme = mode` so the scrollbar variant updates on theme swap
- Tab clicks should swap the canvas body content; the reference only shows the Alert tab

## Hand-off checklist

- [ ] Three-column layout, 56 / 500 / flex
- [ ] OpenSearch logo at top of rail (NOT the mascot — that's in the chat header)
- [ ] Current user is `PersonAvatar` with `red` ring at bottom of rail
- [ ] Chat panel has independent scroll
- [ ] Code block uses the 6-color syntax palette (cyan/ink/amber/green/inkFade/inkDim)
- [ ] Line chart has the dashed red threshold at 2,000ms
- [ ] Alarm banner is amber-tinted with the left accent and corner ticks
- [ ] No corner registration marks on this page
- [ ] Scrollbars darker in light theme via `[data-theme="light"]` selector
- [ ] Square (not round) `+`/send buttons in the chat input
