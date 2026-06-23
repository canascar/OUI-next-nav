# Handoff: Search Box Focused State — Pulse Halo + Soft Lift

## Overview

This handoff documents the **focused state** of the primary "Ask Olly anything" search input on the agentic-observability landing/empty state. The input is auto-focused when the customer arrives. The goal of the focused state is to communicate "I'm ready, start typing" — subtle but powerful — through a breathing indigo halo and a faint neutral elevation, without changing anything inside the field.

## About the Design Files

The file in this bundle (`search-focus-state.html`) is a **design reference created in HTML** — a prototype showing the intended look and behavior, **not production code to copy directly**.

The task is to **recreate this design inside the target codebase's existing environment** (React/Vue/Svelte/etc.) using its established components, tokens, and animation conventions. If the codebase already has a search input component, modify its `:focus` / `:focus-within` styles to match — do not rebuild the input from scratch.

## Fidelity

**High-fidelity.** Exact colors, border widths, shadow stacks, animation timings, and easing curves are specified below. Reproduce pixel-for-pixel.

## Scope of Change

**Only the focused state of the search input changes.** Do not modify:
- The placeholder text, caret, or any internal typography
- The `+` button, send button, or their positions
- The input's padding, border-radius, min-height, or layout
- The unfocused state

## The Effect (what we're recreating)

When the input is focused (or `:focus-within`):

1. A **1px solid indigo border** appears on the input.
2. A **breathing halo** (offset box-shadow ring) pulses around the input, expanding from 3px → 7px and fading between two indigo opacity values.
3. A **very light, neutral lift shadow** sits beneath the input, also breathing, giving a subtle sense of elevation.
4. The input **rises 1px** on the up-phase of the breathe cycle (translateY −1.5px → −2.5px).
5. All three (halo expansion, lift shadow, vertical position) animate on the **same 2.4s ease-in-out infinite loop**, in phase.

## Component: SearchInput (focused state)

### Layout (unchanged from default)
- Background: `#FFFFFF`
- Border-radius: `22px`
- Padding: `26px 28px 22px`
- Min-height: `168px`
- Display: flex column, `justify-content: space-between`

### Focused-state additions

- **Border:** `1px solid #2B4BF2`
- **Transform:** `translateY(-1.5px)` (animates between `-1.5px` and `-2.5px`)
- **Animation:** `halo-lift 2.4s ease-in-out infinite`

### Animation keyframes

```css
@keyframes halo-lift {
  0%, 100% {
    box-shadow:
      0 0 0 3px rgba(43, 75, 242, 0.08),         /* halo ring — tight */
      0 10px 22px -16px rgba(43, 75, 242, 0.30), /* indigo bloom */
      0 1px 2px rgba(15, 27, 45, 0.04),          /* hairline depth */
      0 14px 28px -16px rgba(15, 27, 45, 0.10);  /* soft lift */
    transform: translateY(-1.5px);
  }
  50% {
    box-shadow:
      0 0 0 7px rgba(43, 75, 242, 0.13),         /* halo ring — expanded */
      0 18px 36px -16px rgba(43, 75, 242, 0.42), /* indigo bloom — deeper */
      0 1px 2px rgba(15, 27, 45, 0.04),          /* hairline depth */
      0 18px 36px -16px rgba(15, 27, 45, 0.12);  /* soft lift — deeper */
    transform: translateY(-2.5px);
  }
}
```

### How to read the four shadow layers

| # | Purpose | Min keyframe | Max keyframe |
|---|---------|--------------|--------------|
| 1 | Halo ring (spread, no blur) | `0 0 0 3px rgba(43,75,242,0.08)` | `0 0 0 7px rgba(43,75,242,0.13)` |
| 2 | Indigo bloom (blurred glow under field) | `0 10px 22px -16px rgba(43,75,242,0.30)` | `0 18px 36px -16px rgba(43,75,242,0.42)` |
| 3 | Hairline neutral depth (constant) | `0 1px 2px rgba(15,27,45,0.04)` | same |
| 4 | Soft lift (neutral depth shadow) | `0 14px 28px -16px rgba(15,27,45,0.10)` | `0 18px 36px -16px rgba(15,27,45,0.12)` |

Layers 1 and 2 carry the indigo character. Layers 3 and 4 are neutral and create the "very light soft lift" requested — they keep the card feeling physically off the page even when the indigo glow recedes.

### Unfocused → focused transition

When implementing, fade the entire shadow stack and border color in over **180ms ease-out** when focus is gained, and out over the same on blur, then the looping `halo-lift` animation begins. Do not snap.

A practical pattern:

```css
.search-input {
  border: 1px solid transparent;
  transition: border-color 180ms ease-out, box-shadow 180ms ease-out, transform 180ms ease-out;
}
.search-input:focus-within {
  border-color: #2B4BF2;
  animation: halo-lift 2.4s ease-in-out infinite;
}
```

### Reduced motion

Respect `prefers-reduced-motion`. When set, drop the animation but keep the border and the static "max" shadow stack so the focused state still reads as different from unfocused:

```css
@media (prefers-reduced-motion: reduce) {
  .search-input:focus-within {
    animation: none;
    transform: translateY(-2px);
    box-shadow:
      0 0 0 5px rgba(43, 75, 242, 0.10),
      0 14px 28px -16px rgba(43, 75, 242, 0.36),
      0 1px 2px rgba(15, 27, 45, 0.04),
      0 16px 32px -16px rgba(15, 27, 45, 0.11);
  }
}
```

## Design Tokens

| Token | Value | Used for |
|---|---|---|
| `--accent` | `#2B4BF2` | Border, halo, indigo bloom, send button bg |
| Halo alpha (rest → peak) | `0.08 → 0.13` | Spread ring opacity |
| Bloom alpha (rest → peak) | `0.30 → 0.42` | Indigo glow opacity |
| Neutral ink | `rgb(15, 27, 45)` | Soft lift shadow color |
| Lift alpha (rest → peak) | `0.10 → 0.12` | Soft lift opacity |
| Card radius | `22px` | Input border-radius |
| Breathe duration | `2.4s` | Animation cycle |
| Easing | `ease-in-out` | Animation easing |
| Transition duration (in/out) | `180ms ease-out` | Focus/blur fade |

## Accessibility

- Keep the visible `:focus` indicator (border + halo). Do not suppress the focus ring with `outline: none` unless this replacement is applied.
- The animation is slow (2.4s, ease-in-out, no harsh peaks) and respects `prefers-reduced-motion` per above.
- Auto-focusing the input on page load is intended for this landing surface; ensure any screen-reader announcement is appropriate (the input should have a proper `aria-label` or associated `<label>`).

## Files

- `search-focus-state.html` — the design reference. Open in a browser to see the focused state live (the prototype is shown in its focused state by default).

## Implementation Checklist

- [ ] Locate the existing search input component in the codebase
- [ ] Add the four-layer shadow stack and indigo border to its focused state
- [ ] Add the `halo-lift` keyframes and wire them to `:focus-within` (or whatever focus-state mechanism the component uses)
- [ ] Add the 180ms fade-in/out transition on `border-color`, `box-shadow`, `transform`
- [ ] Add the `prefers-reduced-motion` fallback
- [ ] Verify the input auto-focuses on the relevant landing/empty state
- [ ] Verify nothing inside the input visually changed
