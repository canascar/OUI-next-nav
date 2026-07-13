# V9 "Glass" Theme — Color Specification

Reference for the V9 theme color tokens in both **Light** and **Dark** modes.

Values are taken directly from the theme source:

- **Light:** `src/themes/v9/global_styling/variables/_colors.scss`
- **Dark:** `src/themes/v9/v9_colors_dark.scss`
- **Semantic CSS custom properties:** `src/themes/v9/components/_index.scss`

> Tokens are authored as SCSS `$oui*` variables (aliased to `$eui*`) and also
> exposed at runtime as CSS custom properties (`--oui*` and the `--g-*` "glass"
> design tokens). Values shown as `computed` are derived at build time by SCSS
> functions (e.g. `makeHighContrastColor`) and depend on their base color and
> background, so no fixed hex is listed.

---

## Theme-independent constants

These are identical in both themes.

| Token | Value | Notes |
|-------|-------|-------|
| `$ouiColorGhost` | `#FFFFFF` | Always-white |
| `$ouiColorInk`   | `#0a0a0a` | Always near-black |

---

## Core / accent

| Token | Light | Dark | Notes |
|-------|-------|------|-------|
| `$ouiColorPrimary`   | `#4B6EF5` (blue-indigo) | `#93b4fc` (cornflower blue) | Primary accent |
| `$ouiColorAccent`    | `#4B6EF5` | `#93b4fc` | Same as primary |
| `$ouiColorSecondary` | `#10b981` (green) | `#34d399` (green) | Success family |

---

## Status

| Token | Light | Dark |
|-------|-------|------|
| `$ouiColorSuccess` | `#10b981` (green) | `#34d399` (green) |
| `$ouiColorWarning` | `#d97706` (amber) | `#fbbf24` (amber) |
| `$ouiColorDanger`  | `#dc2626` (red)   | `#f87171` (red) |

---

## Shades — ink ramp

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `$ouiColorEmptyShade`    | `#ffffff` | `#151b26` | Card surfaces |
| `$ouiColorLightestShade` | `#fbfbf9` | `#171b23` | Subtle backgrounds |
| `$ouiColorLightShade`    | `#ececef` | `#303748` | Borders |
| `$ouiColorMediumShade`   | `rgba(10, 10, 10, 0.46)` | `rgba(250, 250, 250, 0.50)` | Muted text |
| `$ouiColorDarkShade`     | `#0a0a0a` | `#fafafa` | Body text |
| `$ouiColorDarkestShade`  | `#000000` | `#ffffff` | Titles / foreground |
| `$ouiColorFullShade`     | `#000000` | `#FFFFFF` | Brightest foreground |

---

## Backgrounds & surfaces

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `$ouiPageBackgroundColor` | `#eeedf4` | `#10151e` | Canvas |
| `$ouiColorHighlight`      | `#f7f7f5` | `#191d26` | Elevated / muted surface |
| `$ouiFormBackgroundColor` | `#ffffff` *(= empty shade)* | `#1c212b` | Form input background |
| `$ouiBackgroundElevated`  | — | `#191d26` | Elevated surface (dark only) |

> Light mode does not redefine `$ouiFormBackgroundColor` in the color file; it
> defaults to `$ouiColorEmptyShade` (`#ffffff`) via the form variables.

---

## Text & links

| Token | Light | Dark |
|-------|-------|------|
| `$ouiTextColor`        | `#0a0a0a` *(= dark shade)* | `#fafafa` |
| `$ouiTitleColor`       | `#000000` *(= darkest shade)* | `#FFFFFF` |
| `$ouiTextSubduedColor` | `rgba(10, 10, 10, 0.46)` | `rgba(250, 250, 250, 0.50)` |
| `$ouiLinkColor`        | `#3B5ED6` | `#8ab0ff` |
| `$ouiColorDisabled`      | `computed` — `tint($ouiTextColor, 70%)` | `#171b23` *(= lightest shade)* |
| `$ouiColorDisabledText`  | `computed` | `rgba(250, 250, 250, 0.32)` |

### High-contrast text variants (computed)

Derived from their base color via `makeHighContrastColor()`; no fixed hex.

| Token | Base |
|-------|------|
| `$ouiColorPrimaryText`   | `$ouiColorPrimary` |
| `$ouiColorSecondaryText` | `$ouiColorSecondary` |
| `$ouiColorAccentText`    | `$ouiColorAccent` |
| `$ouiColorWarningText`   | `$ouiColorWarning` |
| `$ouiColorDangerText`    | `$ouiColorDanger` |
| `$ouiColorSuccessText`   | `= $ouiColorSecondaryText` |

---

## Borders & shadows (dark mode)

Light mode derives borders/shadows from the shade ramp; dark mode defines them explicitly.

| Token | Dark value |
|-------|-----------|
| `$ouiBorderColor`      | `#282e3a` |
| `$ouiBorderElevated`   | `#282e3a` |
| `$ouiShadowColor`      | `rgba(0, 0, 0, 0.3)` |
| `$ouiShadowColorLarge` | `rgba(0, 0, 0, 0.4)` |
| `$ouiShadowOpacity`    | `0.30` |
| `$ouiShadowBase` / `$ouiShadow1` | `0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.3)` |
| `$ouiShadow2`–`$ouiShadow5` | `0 4px 12px rgba(0,0,0,.4), 0 24px 48px rgba(0,0,0,.4)` |

---

## Charts

| Token | Light | Dark |
|-------|-------|------|
| `$ouiColorChartLines` | `computed` — `shade($ouiColorLightestShade, 3%)` | `#303748` *(= light shade)* |
| `$ouiColorChartBand`  | `#fbfbf9` *(= lightest shade)* | `computed` — `tint($ouiColorLightestShade, 2.5%)` |

---

## Code block syntax palette (dark)

Dark mode defines an explicit syntax palette; light mode derives from the vis palette.

| Token | Dark |
|-------|------|
| `$ouiCodeBlockBackgroundColor` | `#171b23` *(= lightest shade)* |
| `$ouiCodeBlockCommentColor`    | `rgba(250, 250, 250, 0.32)` |
| `$ouiCodeBlockStringColor`     | `#fbbf24` (amber) |
| `$ouiCodeBlockNameColor`       | `#93b4fc` |
| `$ouiCodeBlockNumberColor`     | `#34d399` (green) |
| `$ouiCodeBlockKeywordColor`    | `#82a0f8` |
| `$ouiCodeBlockTypeColor`       | `#93b4fc` |
| `$ouiCodeBlockTitleColor`      | `#fafafa` |

Light-mode code colors map onto the visualization palette (`$ouiColorVis*`) and
`makeHighContrastColor(...)` against `$ouiCodeBlockBackgroundColor` (`#fbfbf9`).

---

## Visualization palette (color-blind safe)

Defined once in the light color file and **shared by both themes**. Each entry
has a `graphic` value and a `behindText` variant.

| Token | graphic | behindText |
|-------|---------|-----------|
| `$ouiColorVis0`  | `#54B399` | `#6DCCB1` |
| `$ouiColorVis1`  | `#6092C0` | `#79AAD9` |
| `$ouiColorVis2`  | `#D36086` | `#EE789D` |
| `$ouiColorVis3`  | `#9170B8` | `#A987D1` |
| `$ouiColorVis4`  | `#CA8EAE` | `#E4A6C7` |
| `$ouiColorVis5`  | `#D6BF57` | `#F1D86F` |
| `$ouiColorVis6`  | `#B9A888` | `#D2C0A0` |
| `$ouiColorVis7`  | `#DA8B45` | `#F5A35C` |
| `$ouiColorVis8`  | `#AA6556` | `#C47C6C` |
| `$ouiColorVis9`  | `#E7664C` | `#FF7E62` |
| `$ouiColorVis10` | `#9C9DA0` | `#9C9DA0` |
| `$ouiColorVis11` | `#D74987` | `#D74987` |
| `$ouiColorVis12` | `#0D70CA` | `#0D70CA` |
| `$ouiColorVis13` | `#0C8967` | `#0C8967` |
| `$ouiColorVis14` | `#6E28C3` | `#6E28C3` |
| `$ouiColorVis15` | `#D76813` | `#D76813` |

---

## Semantic "glass" design tokens (`--g-*`)

Runtime CSS custom properties layered on top of the SCSS tokens
(`src/themes/v9/components/_index.scss`). Surface/ink/accent tokens that use
`lightOrDarkTheme(...)` resolve per active theme; others are fixed.

### Surfaces

| Custom property | Value |
|-----------------|-------|
| `--g-bg` | `$ouiPageBackgroundColor` |
| `--g-surface` | `$ouiColorEmptyShade` |
| `--g-surface-muted` | `lightOrDark(#f7f7f5, $ouiColorHighlight)` |
| `--g-surface-subtle` | `$ouiColorLightestShade` |
| `--g-surface-border` | `$ouiColorLightShade` |
| `--g-surface-border-strong` | `lightOrDark(#e0e0e4, $ouiBorderColor)` |

### Frosted glass (fixed)

| Custom property | Value |
|-----------------|-------|
| `--g-glass` | `rgba(255, 255, 255, 0.62)` |
| `--g-glass-hi` | `rgba(255, 255, 255, 0.85)` |
| `--g-glass-border` | `rgba(255, 255, 255, 0.9)` |
| `--g-glass-blur` | `blur(24px) saturate(160%)` |

### Ink ramp (fixed, light-oriented)

| Custom property | Value |
|-----------------|-------|
| `--g-ink` | `$ouiTextColor` |
| `--g-ink-bright` | `$ouiTitleColor` |
| `--g-ink-soft` | `rgba(10, 10, 10, 0.66)` |
| `--g-ink-mute` | `rgba(10, 10, 10, 0.46)` |
| `--g-ink-fade` | `rgba(10, 10, 10, 0.30)` |
| `--g-ink-ghost` | `rgba(10, 10, 10, 0.10)` |
| `--g-hairline` | `rgba(10, 10, 10, 0.07)` |

### Accent

| Custom property | Value |
|-----------------|-------|
| `--g-accent` | `$ouiColorPrimary` |
| `--g-accent-bright` | `#4f46e5` |
| `--g-accent-dim` | `rgba(99, 102, 241, 0.50)` |
| `--g-accent-soft` | `rgba(99, 102, 241, 0.10)` |
| `--g-accent-tint` | `rgba(99, 102, 241, 0.18)` |
| `--g-accent-ring` | `rgba(99, 102, 241, 0.22)` |

### Status

| Custom property | Value |
|-----------------|-------|
| `--g-success` | `$ouiColorSuccess` |
| `--g-success-soft` | `rgba(16, 185, 129, 0.10)` |
| `--g-warn` | `$ouiColorWarning` |
| `--g-warn-soft` | `rgba(217, 119, 6, 0.10)` |
| `--g-danger` | `$ouiColorDanger` |
| `--g-danger-soft` | `rgba(220, 38, 38, 0.10)` |
| `--g-info` | `#0284c7` |
| `--g-info-soft` | `rgba(2, 132, 199, 0.10)` |

### Nav item states

| Custom property | Value |
|-----------------|-------|
| `--navItemHover` | `lightOrDark(rgba(99,102,241,0.06), rgba(165,180,252,0.10))` |
| `--navItemActive` | `lightOrDark(rgba(99,102,241,0.12), rgba(165,180,252,0.18))` |

### Logo

| Custom property | Light | Dark |
|-----------------|-------|------|
| `--ouiLogoPrimary` | `#075985` | `#0284C7` |
| `--ouiLogoSecondary` | `#082F49` | `#BAE6FD` |

---

## Notes

- The `--g-ink-*` and frosted-glass tokens are authored with light-mode
  literals; dark-mode ink is driven mainly through the `$oui*` shade ramp and
  the `--oui*` remap (`--oui-text`, `--oui-title`, `--oui-text-subdued`, etc.).
- `$ouiColorPrimary` differs between themes (`#4B6EF5` vs `#93b4fc`), while the
  `--g-accent-*` soft/tint/ring helpers are fixed indigo `rgba(99,102,241, …)`.
- Dark-mode design rationale and the full tuning history live in
  `src/themes/v9/DARK_COLOR_TUNING.md`.
