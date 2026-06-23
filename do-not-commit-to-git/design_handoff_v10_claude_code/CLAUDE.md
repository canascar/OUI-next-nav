# CLAUDE.md — v10 Blueprint Theme Generation

You are generating the **v10 Blueprint** theme for an OpenSearch-style application. Follow this file exactly. Treat `tokens.json` as the source of truth for values.

## Goal

Produce a working theme with:
- All color, type, spacing, and motion tokens for **light** and **dark** modes
- A primitive component layer (avatars, corner ticks, status pills, iso cubes, theme toggle, page background)
- The two canonical pages (`Welcome`, `Dashboard`) wired to the theme

The reference implementation in `reference/` shows the exact intended output. **Use it as your visual target.** Token values in this folder always override anything in the reference if they disagree.

## Hard rules

1. **Do not invent colors.** Only use values from `tokens.json`. If a hue isn't there, pick the nearest existing token and ask before adding a new one.
2. **Border radius is `0` everywhere.** The only round elements are:
   - Avatars (50%)
   - The welcome ask-bar's `+` and send buttons (50%, 26–30px)
   That's it. No rounded buttons, cards, pills, inputs, or tabs.
3. **No drop shadows.** Depth comes from the avatar's `inset` double-ring and from corner ticks overlapping panel borders.
4. **No emoji, no decorative icons from icon fonts.** All icons are inline SVG with `stroke="currentColor"`, stroke widths 1.3 / 1.4 / 1.6.
5. **Light and dark must be visually equivalent.** A theme swap must change pixels but not composition, sizes, gaps, or which elements exist.
6. **Square corners stay square in both themes.** Don't soften light-mode chrome.
7. **The triangle glyph `◢`, `//` section prefix, `│` separator, and IBM Plex Mono labels are part of the brand voice.** Reproduce them faithfully.

## Fonts

Both fonts are open-source under **SIL Open Font License 1.1** and free to bundle. Use Google Fonts in the browser; mirror to self-hosted in production.

- **Outfit** (sans) — UI, titles, body
- **IBM Plex Mono** (mono) — labels, metrics, code, anything "drafted"

Load weights 400 / 500 / 600 / 700:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Generation order

Follow these steps in order. Do not skip steps. Stop and ask if a step is unclear.

### Step 1 — Land the token layer

1. Copy `tokens.css` into the project's theme directory (e.g. `src/themes/v10/tokens.css`).
2. Copy `tokens.json` next to it for build-time consumers.
3. Confirm both fonts are loaded (see Fonts above).
4. Apply `data-theme="dark"` (or `"light"`) on `<html>` (or the topmost app wrapper).
5. Verify by adding a temporary div with `background: var(--v10-cyan)` and confirming it renders.

### Step 2 — Build the page background

Add a `.v10-page` class (or equivalent) that applies the drafting grid:

```css
.v10-page {
  background-color: var(--v10-bg);
  background-image:
    linear-gradient(to right,  var(--v10-grid-fine)  1px, transparent 1px),
    linear-gradient(to bottom, var(--v10-grid-fine)  1px, transparent 1px),
    linear-gradient(to right,  var(--v10-grid-major) 1px, transparent 1px),
    linear-gradient(to bottom, var(--v10-grid-major) 1px, transparent 1px);
  background-size: 16px 16px, 16px 16px, 80px 80px, 80px 80px;
  color: var(--v10-ink);
  font-family: var(--v10-font-sans);
  transition: background-color 200ms ease, color 200ms ease;
}
```

(This is already in `tokens.css`.)

### Step 3 — Build the primitives

Create one module per primitive. Each primitive must work in both themes (read from CSS vars or a `useTheme()` hook — pick one based on the host codebase).

Required primitives (see `recipes/` for exact specs):

| Primitive | File | Purpose |
|---|---|---|
| `CornerTicks` | `recipes/01-corner-ticks.md` | 4 absolutely-positioned 6×6 corner brackets on every card |
| `OllyAvatar` | `recipes/02-olly-avatar.md` | Mascot — circle body, registration ticks, comma eyes that scale at small sizes |
| `PersonAvatar` | `recipes/03-person-avatar.md` | Initial-based avatar with amber (collaborator) or red (current user) ring |
| `StatusPill` | `recipes/04-status-pill.md` | `● NEW` / `● ACK` / `● RESOLVED` etc. |
| `IsoCube` / `IsoStack` | `recipes/05-iso-cubes.md` | Axonometric cube row representing scope |
| `LatencyBar` | `recipes/06-latency-bar.md` | Tiny 3-bar trend SVG |
| `SectionLabel` | `recipes/07-section-label.md` | `// LATEST` style mono header with dashed rule |
| `ThemeToggle` | `recipes/08-theme-toggle.md` | Light/Dark segmented control with sun/moon SVGs |
| `Button` | `recipes/09-buttons.md` | `Ghost` and `Primary` variants only |

Implement them in this order. Each recipe contains the exact dimensions, colors, and stroke widths.

### Step 4 — Build the Welcome page

Follow `pages/welcome.md`. Visual target: `reference/Welcome D3.html` (open in a browser).

### Step 5 — Build the Dashboard page

Follow `pages/dashboard.md`. Visual target: `reference/Dashboard D3.html`.

### Step 6 — Wire the theme toggle

Add a global `data-theme` toggle (typically in the user menu or a header dropdown). Persist the choice in `localStorage` under `v10-theme`. Default to dark unless the user prefers light (`prefers-color-scheme: light`).

### Step 7 — Verify

Run the verification checklist in `VERIFICATION.md`.

## Implementation conventions

- **TypeScript preferred** when adding to a TS codebase. Types in `types.ts`.
- **CSS variables, not theme-context lookups** when the host has a CSS-in-JS or plain-CSS system. Use the React theme context only if the host is React and the existing codebase already does that.
- **Match the host's component library.** If the project uses EUI, build v10 components on top of EUI primitives where possible (e.g. wrap `EuiPanel`, override the relevant CSS vars). Do **not** rewrite the entire UI kit.
- **No new dependencies.** Inline SVGs, CSS variables, and the two Google Fonts cover everything.

## Files in this folder

| File / folder | Purpose |
|---|---|
| `CLAUDE.md` | This file — your top-level instructions |
| `tokens.json` | Source of truth for all token values |
| `tokens.css` | CSS variable export of tokens, with `data-theme` scoping |
| `VERIFICATION.md` | Checklist to run after generation |
| `recipes/` | Per-component implementation specs |
| `pages/` | Per-page composition specs |
| `reference/` | Live HTML/JSX mocks — open in a browser as visual target |

## When in doubt

1. Read `tokens.json` for the value.
2. Open the matching `reference/` HTML in a browser, toggle the theme, and look.
3. Ask the user. Don't guess.
