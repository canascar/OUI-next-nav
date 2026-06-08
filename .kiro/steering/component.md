---
inclusion: always
---

## Glass Theme — Agentic OSD Design System

This project uses the **Glass theme** (`v9-light` / `v9-dark`). All work must follow the values below.

---

### Theme Files

| Purpose | File |
|---------|------|
| Light colors | `src/themes/v9/global_styling/variables/_colors.scss` |
| Dark colors | `src/themes/v9/v9_colors_dark.scss` |
| Typography | `src/themes/v9/global_styling/variables/_typography.scss` |
| Borders | `src/themes/v9/global_styling/variables/_borders.scss` |
| Shadows | `src/themes/v9/global_styling/variables/_shadows.scss` |
| Form variables | `src/themes/v9/global_styling/variables/_form.scss` |
| Button variables | `src/themes/v9/global_styling/variables/_buttons.scss` |
| Button overrides | `src/themes/v9/components/_button.scss` |
| Panel overrides | `src/themes/v9/components/_panel.scss` |
| Tab overrides | `src/themes/v9/components/_tabs.scss` |
| Form overrides | `src/themes/v9/components/_form.scss` |
| Background | `src/themes/v9/components/_background.scss` |
| CSS custom props | `src/themes/v9/components/_index.scss` |
| Headless components | `src/components/headless/` |

---

### Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
```

| Token | Value | Role |
|-------|-------|------|
| `$ouiFontFamily` | `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` | Body/display |
| `$ouiFontFamilyDisplay` | `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` | Headings |
| `$ouiCodeFontFamily` | `'Space Grotesk', ui-monospace, 'SF Mono', monospace` | Numerics, timestamps, code |

---

### Light Colors

| Token | Value | Name |
|-------|-------|------|
| `$ouiColorPrimary` | `#6366f1` | Indigo |
| `$ouiColorSecondary` | `#10b981` | Green |
| `$ouiColorAccent` | `#6366f1` | Indigo |
| `$ouiColorSuccess` | `#10b981` | Green |
| `$ouiColorWarning` | `#d97706` | Amber |
| `$ouiColorDanger` | `#dc2626` | Red |
| `$ouiColorEmptyShade` | `#ffffff` | Card surfaces |
| `$ouiColorLightestShade` | `#fbfbf9` | Subtle backgrounds |
| `$ouiColorLightShade` | `#ececef` | Borders |
| `$ouiColorMediumShade` | `rgba(10,10,10,0.46)` | Muted text |
| `$ouiColorDarkShade` | `#0a0a0a` | Body text |
| `$ouiColorDarkestShade` | `#000000` | Titles |
| `$ouiColorFullShade` | `#000000` | Near black |
| `$ouiPageBackgroundColor` | `#f8f7fc` | Opal canvas |
| `$ouiColorHighlight` | `#f7f7f5` | Muted surface |

---

### Dark Colors

| Token | Value | Name |
|-------|-------|------|
| `$ouiColorPrimary` | `#a5b4fc` | Indigo light |
| `$ouiColorSecondary` | `#34d399` | Green |
| `$ouiColorAccent` | `#a5b4fc` | Indigo light |
| `$ouiColorSuccess` | `#34d399` | Green |
| `$ouiColorWarning` | `#fbbf24` | Amber |
| `$ouiColorDanger` | `#f87171` | Red |
| `$ouiColorEmptyShade` | `#15161a` | Card surfaces |
| `$ouiColorLightestShade` | `#101115` | Subtle backgrounds |
| `$ouiColorLightShade` | `#23252b` | Borders |
| `$ouiColorMediumShade` | `rgba(250,250,250,0.50)` | Muted text |
| `$ouiColorDarkShade` | `#fafafa` | Body text |
| `$ouiColorDarkestShade` | `#ffffff` | Foreground text |
| `$ouiColorFullShade` | `#ffffff` | Brightest |
| `$ouiPageBackgroundColor` | `#0c0d12` | Dark canvas |
| `$ouiColorHighlight` | `#1b1d22` | Elevated surface |
| `$ouiBorderColor` | `#23252b` | Border |
| `$ouiTextColor` | `#fafafa` | Body text |
| `$ouiTitleColor` | `#ffffff` | Heading text |

---

### Shadows (feather-light)

```scss
// Light
$ouiShadow1: 0 1px 2px rgba(15,15,15,0.04), 0 8px 24px rgba(15,15,15,0.04);
$ouiShadow2: 0 4px 12px rgba(15,15,15,0.06), 0 24px 48px rgba(15,15,15,0.06);

// Dark
$ouiShadow1: 0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.3);
$ouiShadow2: 0 4px 12px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.4);
```

---

### Borders & Radius

| Token | Value | Use |
|-------|-------|-----|
| `$ouiBorderRadius` | `12px` | Cards, panels |
| `$ouiBorderRadiusSmall` | `6px` | Pills, chips |
| `$ouiBorderRadiusLarge` | `18px` | Context panels |
| `$ouiButtonBorderRadius` | `999px` | Pill buttons |
| `$ouiFormControlBorderRadius` | `10px` | Form inputs, textareas, uploaders |
| `$ouiCheckboxBorderRadius` | `3px` | Checkboxes |

**Nested radius rule:** inner element = outer container radius − padding.

---

### Buttons

- All buttons: `border-radius: 999px` (pill)
- Transition: `transform 180ms cubic-bezier(.2,.7,.2,1), box-shadow 180ms, background-color 120ms`

**Filled primary:**
- Background: `#6366f1` (indigo)
- Glow: `0 8px 22px -10px $ouiColorPrimary`
- Hover: `translateY(-1px)`
- Active: `translateY(0)`, no shadow

**Outline buttons:**
- Background: `$ouiColorEmptyShade` (solid surface)
- Border: `1px solid $ouiColorLightShade`
- Shadow: `0 1px 2px rgba(15,15,15,0.04)`
- Hover: border darkens, `translateY(-1px)`, elevated shadow
- Active: `translateY(0)`

**Disabled:** `background: $ouiColorLightestShade`, `opacity: 0.5`, no transform

**Button group (compressed):** container `border-radius: 999px`

---

### Form Inputs

- Border radius: `10px` (all inputs, textareas, file pickers)
- Compressed: `8px`
- Checkboxes: `3px`
- Focus: `border-color: $ouiColorPrimary` (1px, animates in), box-shadow for lift
- No bottom-only border on focus
- Dropdown items: `6px` radius on hover states

---

### Panels & Cards

- Solid surface: `background: $ouiColorEmptyShade`, `border: 1px solid $ouiColorLightShade`, `border-radius: 12px`
- Shadow: `0 1px 2px rgba(15,15,15,0.04), 0 8px 24px rgba(15,15,15,0.04)`
- No corner ticks — removed entirely
- Popovers: frosted glass (`backdrop-filter: blur(24px) saturate(160%)`)

---

### Navigation (Frosted Glass)

All nav surfaces are translucent with backdrop blur:

```scss
// Collapsed nav
.samplePagesLeftNav {
  background-color: lightOrDarkTheme(rgba(255,255,255,0.62), rgba(12,13,18,0.80));
  backdrop-filter: blur(24px) saturate(160%);
  border-right: 1px solid lightOrDarkTheme(#ececef, rgba(255,255,255,0.07));
}

// Expanded side panel
.samplePagesLeftNav__expandedPanel {
  background-color: lightOrDarkTheme(rgba(255,255,255,0.62), rgba(12,13,18,0.75));
  backdrop-filter: blur(28px) saturate(180%);
}

// Hover popover
.samplePagesLeftNav__hoverPopover {
  background-color: lightOrDarkTheme(rgba(255,255,255,0.62), rgba(12,13,18,0.85));
  backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid lightOrDarkTheme(rgba(255,255,255,0.9), rgba(255,255,255,0.10));
  box-shadow: 0 2px 6px rgba(15,15,15,0.06), 0 16px 36px rgba(15,15,15,0.08);
}
```

---

### Nav Item States

```scss
.navItem:hover .navIcon        { background-color: rgba($ouiColorDarkestShade, 0.07); }
.navItem--active .navIcon      { background-color: rgba($ouiColorPrimary, 0.10); }
.navItem--active:hover .navIcon { background-color: rgba($ouiColorPrimary, 0.15); }
```

---

### Page Background (Canvas Gradient)

Soft indigo/violet corner blobs on a near-white (light) or near-black (dark) canvas:

```scss
// Light
html {
  background-color: #f8f7fc;
  background-image:
    radial-gradient(ellipse 40% 35% at 0% 0%, hsl(245,80%,90%,0.55), transparent 60%),
    radial-gradient(ellipse 35% 30% at 100% 8%, hsl(215,90%,92%,0.45), transparent 60%),
    radial-gradient(ellipse 35% 30% at 100% 100%, hsl(260,80%,92%,0.45), transparent 60%),
    radial-gradient(ellipse 35% 30% at 5% 100%, hsl(230,80%,92%,0.40), transparent 60%);
  background-attachment: fixed;
}

// Dark
html {
  background-color: #0c0d12;
  background-image:
    radial-gradient(ellipse 40% 35% at 0% 0%, hsl(245,80%,28%,0.40), transparent 60%),
    radial-gradient(ellipse 35% 30% at 100% 8%, hsl(215,90%,22%,0.35), transparent 60%),
    radial-gradient(ellipse 35% 30% at 100% 100%, hsl(260,80%,22%,0.40), transparent 60%),
    radial-gradient(ellipse 35% 30% at 5% 100%, hsl(230,80%,22%,0.40), transparent 60%);
  background-attachment: fixed;
}
```

---

### Tabs (Pill Track Style)

- Container: `background: $ouiColorLightestShade`, `border-radius: 12px`, `padding: 4px`
- Selected tab: `background: $ouiColorEmptyShade`, shadow `0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.1)`
- No underline indicator
- Condensed: `padding: 3px`, tab radius `= $ouiBorderRadius - 3px`

---

### Headless Components (Agentic UI)

Located in `src/components/headless/`. Documented in the docs site under the **Headless** category.

| Component | Purpose |
|-----------|---------|
| `OuiInsightCard` | Widget card for metrics, charts, tables. Variants: `default`, `glass`, `add` |
| `OuiInsightCallout` | Severity-railed callout for AI insights. Severities: `default`, `warning`, `danger`, `success`, `info` |

---

### CSS Custom Properties (`--g-*` tokens)

The Glass theme exposes a full set of `--g-*` CSS custom properties in `:root` for use in custom layouts:

- `--g-font-sans`, `--g-font-mono` — type families
- `--g-bg`, `--g-bg-gradient` — canvas
- `--g-surface`, `--g-surface-border` — solid surfaces
- `--g-glass`, `--g-glass-blur` — frosted glass
- `--g-ink`, `--g-ink-mute`, `--g-ink-fade` — ink ramp
- `--g-accent`, `--g-accent-bright`, `--g-accent-soft` — indigo accent
- `--g-success`, `--g-warn`, `--g-danger`, `--g-info` — status
- `--g-radius-xs` through `--g-radius-pill` — radii
- `--g-shadow-surface`, `--g-shadow-glass`, `--g-shadow-panel` — shadows
- `--g-dur-fast`, `--g-dur-normal`, `--g-dur-slow` — motion
- `--g-ease-out`, `--g-ease-std` — easing

---

### Rules

- **Only use v9 theme** (`v9-light` / `v9-dark`). Never use legacy OUI themes.
- **Never invent colors.** Use only tokens from the files above.
- **Never invent fonts.** Plus Jakarta Sans, Space Grotesk only.
- **Never create custom SVG icons.** Use only `src/components/icon/assets/`. Flag missing icons.
- **Never hardcode hex values** in component SCSS — always reference SCSS tokens or `--g-*` vars.
- **All components must render correctly** under both `v9-light` and `v9-dark`.
- **Use `lightOrDarkTheme()`** for values that differ between modes.
- **Nested border-radius:** always apply `outer - padding` formula.
- **Button groups:** compressed container must use `border-radius: 999px`.
- **No corner ticks** — removed from all panels, cards, modals, and form inputs.
- **Frosted glass** is reserved for floating/featured moments (nav, popovers, featured cards).
- **Solid surfaces** are the default card style (white/dark with hairline border + feather shadow).
