---
inclusion: always
---

## V9 Theme — Agentic OSD Utility Design System

This project uses the **OUI v9 theme** exclusively. All work must follow the exact values below. Source of truth: `apply-v9-theme-to-oui-project-1.md`.

---

### Theme Files

| Purpose | File |
|---------|------|
| Light colors | `src/themes/v9/global_styling/variables/_colors.scss` |
| Dark colors | `src/themes/v9/v9_colors_dark.scss` |
| Typography | `src/themes/v9/global_styling/variables/_typography.scss` |
| Borders | `src/themes/v9/global_styling/variables/_borders.scss` |
| Button variables | `src/themes/v9/global_styling/variables/_buttons.scss` |
| Button overrides | `src/themes/v9/components/_button.scss` |
| Panel overrides | `src/themes/v9/components/_panel.scss` |
| Tab overrides | `src/themes/v9/components/_tabs.scss` |

---

### Step 1 — Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

| Token | Value |
|-------|-------|
| `$ouiFontFamily` | `'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif` |
| `$ouiFontFamilyDisplay` | `'Space Grotesk', 'Outfit', -apple-system, sans-serif` |
| `$ouiCodeFontFamily` | `'JetBrains Mono', Consolas, Menlo, Courier, monospace` |

---

### Step 3 — Light Colors

| Token | Value | Name |
|-------|-------|------|
| `$ouiColorPrimary` | `#2E4A8F` | Deep Blue |
| `$ouiColorSecondary` | `#5CB198` | Jade |
| `$ouiColorAccent` | `#4168B8` | Azure |
| `$ouiColorSuccess` | `#5CB198` | Jade |
| `$ouiColorWarning` | `#CDA849` | Citrine |
| `$ouiColorDanger` | `#ED6F73` | Coral |
| `$ouiColorEmptyShade` | `#FFFFFF` | Card surfaces |
| `$ouiColorLightestShade` | `#E4EAF2` | Subtle backgrounds |
| `$ouiColorLightShade` | `#D4DCE8` | Borders |
| `$ouiColorMediumShade` | `#5A6D8A` | Muted text |
| `$ouiColorDarkShade` | `#1E2A4A` | Secondary text |
| `$ouiColorDarkestShade` | `#0E1525` | Foreground text |
| `$ouiColorFullShade` | `#060D1A` | Near black |
| `$ouiPageBackgroundColor` | `#F4F6FB` | Opal |
| `$ouiColorHighlight` | `#EDF1F8` | Elevated surface |

---

### Step 4 — Dark Colors

| Token | Value | Name |
|-------|-------|------|
| `$ouiColorPrimary` | `#7A9FD4` | Sky |
| `$ouiColorSecondary` | `#4DC9A8` | Jade |
| `$ouiColorAccent` | `#B8D4F0` | Ice |
| `$ouiColorSuccess` | `#4DC9A8` | Jade |
| `$ouiColorWarning` | `#CDA849` | Citrine |
| `$ouiColorDanger` | `#ED6F73` | Coral |
| `$ouiColorEmptyShade` | `#121C30` | Card surfaces |
| `$ouiColorLightestShade` | `#182640` | Muted backgrounds |
| `$ouiColorLightShade` | `#1E2E50` | Borders |
| `$ouiColorMediumShade` | `#6B7F9E` | Muted text |
| `$ouiColorDarkShade` | `#B8D4F0` | Secondary text |
| `$ouiColorDarkestShade` | `#D8E4F0` | Foreground text |
| `$ouiColorFullShade` | `#FFFFFF` | Brightest foreground |
| `$ouiPageBackgroundColor` | `#060D1A` | Obsidian |
| `$ouiColorHighlight` | `#182640` | Elevated surface |
| `$ouiBorderColor` | `#1E2E50` | Border |
| `$ouiTextColor` | `#D8E4F0` | Body text |
| `$ouiTitleColor` | `#FFFFFF` | Heading text |
| `$ouiFormBackgroundColor` | `#182640` | Form inputs |

**Dark shadows:**
```scss
$ouiShadowBase:  0 0 0 1px rgba(30, 46, 80, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4);
$ouiShadow1:     0 2px 8px rgba(0, 0, 0, 0.4);
$ouiShadow2:     0 0 0 1px rgba(30, 46, 80, 0.5), 0 4px 12px rgba(0, 0, 0, 0.4);
$ouiShadow3:     0 0 0 1px rgba(30, 46, 80, 0.5), 0 8px 24px rgba(0, 0, 0, 0.45);
$ouiShadow4:     0 0 0 1px rgba(30, 46, 80, 0.5), 0 12px 32px rgba(0, 0, 0, 0.5);
$ouiShadow5:     0 0 0 1px rgba(30, 46, 80, 0.5), 0 24px 48px rgba(0, 0, 0, 0.5);
$ouiShadowOpacity: 0.50;
```

---

### Step 5 — Buttons

- All buttons: `border-radius: 999px` (pill)
- Transition: `transform 250ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 250ms, background-color 150ms`

**Filled primary:**
- Background: `#2E4A8F` → hover `#4168B8`
- Hover: `translateY(-2px)`, `box-shadow: 0 8px 24px rgba(65,104,184,0.45), 0 4px 8px rgba(65,104,184,0.25)`
- Active: `translateY(0)`, no shadow

**All filled buttons hover:** same lift + glow as primary

**Outline buttons:**
- Background: `transparent`
- Border: `#D4DCE8` (light) / `$ouiColorLightShade` (dark)
- Text: `#0E1525` (monotone — NOT primary color)
- Hover: `rgba(46,74,143,0.06)` bg, `translateY(-2px)`, `box-shadow: 0 4px 16px rgba(46,74,143,0.15)`
- Active: `translateY(0) scale(0.98)`, no shadow

**Disabled:** `background: #E4EAF2`, `color: #5A6D8A`, `opacity: 0.5`, no transform, no shadow

**Button group (compressed):** container `border-radius: 999px` to match pill buttons

---

### Step 6 — Panels

```scss
// All OuiPanel — 92% opacity
.ouiPanel {
  background-color: rgba($ouiColorEmptyShade, 0.92) !important;
}
```

Light: `rgba(255,255,255,0.92)` | Dark: `rgba(18,28,48,0.92)`

---

### Step 7 — Navigation (Glassmorphism)

```scss
// Collapsed nav
.samplePagesLeftNav {
  background-color: lightOrDarkTheme(rgba(255,255,255,0.75), rgba(14,21,37,0.80));
  border-right: 1px solid lightOrDarkTheme(#D4DCE8, rgba(255,255,255,0.08));
  backdrop-filter: blur(12px);
}

// Expanded side panel
.samplePagesLeftNav__expandedPanel {
  background-color: lightOrDarkTheme(rgba(255,255,255,0.80), rgba(14,21,37,0.75));
  backdrop-filter: blur(60px);
}

// Hover popover
.samplePagesLeftNav__hoverPopover {
  background-color: lightOrDarkTheme(rgba(255,255,255,0.60), rgba(14,21,37,0.85));
  backdrop-filter: blur(16px);
  border: 1px solid lightOrDarkTheme(rgba(212,220,232,0.7), $ouiColorLightShade);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1);
}
```

---

### Step 8 — Nav Item States

```scss
.navItem:hover .navIcon        { background-color: rgba($ouiColorDarkestShade, 0.07); }
.navItem--active .navIcon      { background-color: rgba($ouiColorPrimary, 0.10); }
.navItem--active:hover .navIcon { background-color: rgba($ouiColorPrimary, 0.15); }
```

---

### Step 9 — Page Background

```scss
body { background-color: #F4F6FB; }       // Opal (light)
.ouiBody--dark { background-color: #060D1A; } // Obsidian (dark)
```

---

### Borders & Radius

| Token | Value |
|-------|-------|
| `$ouiBorderRadius` | `6px` |
| `$ouiBorderRadiusSmall` | `4px` |
| `$ouiBorderRadiusLarge` | `16px` |
| `$ouiButtonBorderRadius` | `9999px` (pill) |

**Nested radius rule:** inner element = outer container radius − padding. Example: `6px` container with `4px` padding → `2px` inner.

---

### Tabs (OuiTabs — v9 pill track style)

- Container: `background: $ouiColorLightestShade`, `border-radius: $ouiBorderRadius`, `padding: 4px`
- Selected tab: `background: $ouiColorEmptyShade`, shadow `0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.1)`
- No underline indicator
- Condensed: `padding: 3px`, tab radius `= $ouiBorderRadius - 3px`

---

### Rules

- **Only use v9 theme** (`v9-light` / `v9-dark`). Never use legacy OUI themes.
- **Never invent colors.** Use only tokens from the files above.
- **Never invent fonts.** Outfit, Space Grotesk, JetBrains Mono only.
- **Never create custom SVG icons.** Use only `src/components/icon/assets/`. Flag missing icons.
- **Never hardcode hex values** in component SCSS — always reference SCSS tokens.
- **All components must render correctly** under both `v9-light` and `v9-dark`.
- **Use `lightOrDarkTheme()`** for values that differ between modes.
- **Nested border-radius:** always apply `outer - padding` formula.
- **Button groups:** compressed container must use `border-radius: 9999px`.
- **No drop shadows on nav** — use border only.
