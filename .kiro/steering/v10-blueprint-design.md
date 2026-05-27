---
inclusion: auto
---

# v10 Blueprint Design Language

This project uses the **v10 Blueprint** design language. All UI work must follow these rules.

## Core Rules

1. **Border-radius is 0** everywhere. Only round things: user avatars (50%) and welcome-style ask-bar +/send buttons (50%, 26–30px).
2. **No drop shadows.** Depth = hairline border + corner ticks + occasional 2px left accent stripe.
3. **Two fonts only.** Outfit (sans, UI/body/titles) and IBM Plex Mono (labels, metrics, code, anything "drafted"). Weights 400/500/600/700.
4. **The page is graph paper.** Body has a two-layer grid background: 16px fine lines + 80px major lines, both faint.
5. **Cards wear corner ticks.** Four 6×6 brackets on every panel — bright accent on the left corners, muted inkFade on the right. Asymmetric on purpose.
6. **Labels are mono and prefixed with `//`.** `// SUMMARY`, `// RECOMMENDATION`, `// LATEST`. Followed by a dashed hairline rule.
7. **Status reads as `● LABEL`** in mono uppercase, square 1px-bordered chip, soft-tinted background.
8. **Two buttons.** Ghost (transparent, inkFade border, mono uppercase) and Primary (cyan-tinted). Hover changes border + color, nothing else moves.
9. **Light & dark are visually equivalent.** Swapping themes changes pixels but not composition, sizes, gaps, or which elements exist.
10. **No emoji, no icon fonts.** All icons are inline SVG, stroke="currentColor", stroke-widths 1.3/1.4/1.6.

## Token Mapping (OUI Variables)

### CSS Custom Properties (available globally via `:root`)

All v10 tokens are exposed as CSS custom properties and can be used in inline styles or any CSS:

```
--v10-font-sans, --v10-font-mono
--v10-radius: 0
--v10-grid-fine-step: 16px, --v10-grid-major-step: 80px
--v10-motion-theme: 200ms ease, --v10-motion-default: 150ms ease-out
--v10-bg, --v10-bg-deep, --v10-panel, --v10-panel-solid
--v10-ink, --v10-ink-bright, --v10-ink-dim, --v10-ink-fade, --v10-ink-ghost
--v10-cyan, --v10-cyan-dim, --v10-cyan-soft
--v10-amber, --v10-amber-dim, --v10-amber-soft
--v10-green, --v10-green-dim, --v10-green-soft
--v10-red, --v10-red-dim, --v10-red-soft
--v10-grid-fine, --v10-grid-major
--v10-input-bg, --v10-code-bg
--v10-scroll-thumb, --v10-scroll-thumb-hover
```

### Token Semantics
| Token | When to reach for it |
|---|---|
| `bg` | The page itself, scroll containers |
| `bg-deep` | Inner wells, recessed surfaces |
| `panel` | Card backgrounds (translucent, grid bleeds through) |
| `panel-solid` | Modals, popovers — when grid must NOT bleed through |
| `ink` / `ink-bright` | Body text / titles |
| `ink-dim` | Secondary copy, captions, inactive controls |
| `ink-fade` | Borders on neutral chrome (tabs, ghost buttons) |
| `ink-ghost` | Hairline rules, panel borders |
| `cyan` | Primary accent (info, agent voice, active state) |
| `amber` | Warnings, "new"/unack state |
| `green` | Success, resolved, OK |
| `red` | Critical, destructive |
| `*-dim` | Bordered version of accent (~0.45 alpha) |
| `*-soft` | Filled-tint background (~0.08–0.12 alpha) |

Rule: **border = `*-dim`, fill = `*-soft`, text/glyph = the solid color.**

### Scrollbars
Square scrollbar thumbs using `--v10-scroll-thumb` / `--v10-scroll-thumb-hover`, no border-radius.

### Dark Theme (`v9-dark`)
| v10 Token | OUI Variable | Value |
|---|---|---|
| bg | `$ouiPageBackgroundColor` | `#0d3057` |
| bg-deep | `$ouiColorLightestShade` | `#0a2545` |
| panel-solid | `$ouiColorEmptyShade` | `#103e6e` |
| ink | `$ouiTextColor` | `#cfe4f7` |
| ink-bright | `$ouiTitleColor` | `#ffffff` |
| ink-dim | `$ouiTextSubduedColor` | `rgba(207, 228, 247, 0.62)` |
| ink-fade | `$ouiBorderColor` (dark override) | `rgba(207, 228, 247, 0.34)` |
| ink-ghost | `$ouiColorLightShade` | `rgba(207, 228, 247, 0.16)` |
| cyan | `$ouiColorPrimary` | `#5dd9ff` |
| amber | `$ouiColorWarning` | `#ffb86b` |
| green | `$ouiColorSuccess` | `#7be0a8` |
| red | `$ouiColorDanger` | `#ff7a7a` |

### Light Theme (`v9-light`)
| v10 Token | OUI Variable | Value |
|---|---|---|
| bg | `$ouiPageBackgroundColor` | `#eef2f7` |
| bg-deep | `$ouiColorLightestShade` | `#dde4ee` |
| panel-solid | `$ouiColorEmptyShade` | `#ffffff` |
| ink | `$ouiTextColor` | `#0d3057` |
| ink-bright | `$ouiTitleColor` | `#06203f` |
| ink-dim | `$ouiTextSubduedColor` | `rgba(13, 48, 87, 0.62)` |
| ink-fade | border color | `rgba(13, 48, 87, 0.32)` |
| ink-ghost | `$ouiColorLightShade` | `rgba(13, 48, 87, 0.14)` |
| cyan | `$ouiColorPrimary` | `#1f6cb5` |
| amber | `$ouiColorWarning` | `#c47a1f` |
| green | `$ouiColorSuccess` | `#2e8b6f` |
| red | `$ouiColorDanger` | `#c53961` |

### Logo Colors
- **Dark:** Primary `#0284C7`, Secondary `#BAE6FD`
- **Light:** Primary `#075985`, Secondary `#082F49`

## Typography

- **Display title:** Outfit 600, 32px, letter-spacing -0.8px
- **H2:** Outfit 600, 22px, letter-spacing -0.4px
- **Card title:** Outfit 600, 17px, letter-spacing -0.2px
- **Body:** Outfit 500, 14.5px, line-height 1.45
- **Caption:** Outfit, 13.5px, line-height 1.5, ink-dim color
- **Mono section label:** IBM Plex Mono 700, 10.5px, letter-spacing 1.8px, uppercase, cyan color
- **Mono metric:** IBM Plex Mono 700, 28px, letter-spacing -0.5px
- **Mono micro-label:** IBM Plex Mono 600, 9.5px, letter-spacing 1.2px, uppercase, ink-dim

## Grid Background

```scss
background-image:
  linear-gradient(to right,  $gridFine 1px, transparent 1px),
  linear-gradient(to bottom, $gridFine 1px, transparent 1px),
  linear-gradient(to right,  $gridMajor 1px, transparent 1px),
  linear-gradient(to bottom, $gridMajor 1px, transparent 1px);
background-size: 16px 16px, 16px 16px, 80px 80px, 80px 80px;
```

## Corner Ticks (Required on all panels/cards)

6×6px L-brackets at each corner:
- **Left corners** (top-left, bottom-left): accent color (`cyan-dim` / `$ouiColorPrimary` at 0.45)
- **Right corners** (top-right, bottom-right): muted (`ink-fade`)

## Anti-Patterns (DO NOT)

- No third button variant
- No drop shadows for elevation
- No gradient backgrounds (only `*-soft` tint fills)
- No emoji as icons
- No rounded corners in any mode
- No new hex colors outside the token set
- No bold + italic + underline stacking
- No centered long body text
- No circular progress rings


## Olly Avatar

The brand mascot is a circle with crosshair registration marks and two comma glyphs as "eyes":

- **Outer ring:** Muted border (ink-fade opacity) with 4 crosshair ticks at N/S/E/W
- **Inner circle:** Primary-colored border, bg-deep fill
- **Eyes:** Two commas `,,` in the primary color
- Size: 44px outer, 36px inner

## Corner Ticks (Required on all panels/cards)

Four 6×6px L-brackets at each corner. The signature decoration of v10.

- Parent must be `position: relative`
- Each tick: `position: absolute`, inset `-1px`, `width: 6px; height: 6px`, `pointer-events: none`
- Each tick has 2 borders only (the two edges facing out)

### Color logic (asymmetric)
- **Top-left** and **bottom-left**: accent color (`cyan-dim`) — gives the card a "front"
- **Top-right** and **bottom-right**: muted (`ink-fade`)

### Where to apply
Every card, every input wrapper, every banner, every chip-sized panel. If a card does NOT have corner ticks, something is wrong.

## Section Labels

Format: `// LABEL ─ ─ ─ ─` in mono uppercase, cyan color, with a dashed rule stretching to fill.

```jsx
<span style={{ fontFamily: 'var(--v10-font-mono)', fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--v10-cyan)' }}>
  // LATEST
</span>
```
