# Glass v9 — Dark Mode Color Tuning Log

A running record of intentional color adjustments to the **v9 dark** Glass
theme, so we can track what changed, why, and where — and revert/retune later.

> Light mode is intentionally untouched by this pass.

---

## Pass 1 — Tone down the purple (desaturation)

**Goal:** the dark palette was heavily violet-tinted, giving the whole UI a
purple cast. We reduced saturation on every violet while keeping the same
**hue** and **lightness**, so it reads more neutral/muted without becoming
gray or shifting toward blue.

### Tuning knobs (single source of truth)
Defined at the top of `src/themes/v9/v9_colors_dark.scss`:

| Variable | Value | Applies to |
|----------|-------|------------|
| `$glassDarkSurfaceDesat` | `26%` | surfaces, backgrounds, borders |
| `$glassDarkAccentDesat`  | `16%` | accent, links, code shades |

These feed Sass `desaturate(<original-hex>, <amount>)` calls, so the original
hex stays visible in the source and the whole theme retunes by editing the two
numbers above.

### Theme color variables — `src/themes/v9/v9_colors_dark.scss`

| Token | Original | After (≈) | Amount |
|-------|----------|-----------|--------|
| `$ouiColorPrimary` / `$ouiColorAccent` | `#a5b4fc` | `#acb9f5` | accent |
| `$ouiLinkColor` / `$ouiCodeBlockKeywordShade` | `#818cf8` | `#8c95ed` | accent |
| `$ouiCodeBlockNameShade` / `$ouiCodeBlockTypeShade` | `#a5b4fc` | `#acb9f5` | accent |
| `$ouiColorEmptyShade` | `#160e2a` | `#191523` | surface |
| `$ouiColorLightestShade` | `#221840` | `#282335` | surface |
| `$ouiColorLightShade` | `#3d2d5c` | `#433f4a` | surface |
| `$ouiPageBackgroundColor` | `#0d0818` | `#0f0c14` | surface |
| `$ouiColorHighlight` / `$ouiBackgroundElevated` | `#1f1633` | `#231f2a` | surface |
| `$ouiFormBackgroundColor` | `#2c2042` | `#302d35` | surface |
| `$ouiBorderColor` / `$ouiBorderElevated` | `#392a54` | `#3e3a44` | surface |

### Session panels / nav glass tint (frosted backdrop)
Hardcoded `rgba()` tints at various alphas across the sample pages.

| File(s) | Original | After |
|---------|----------|-------|
| `_thread_panel.scss`, `_session_container.scss`, `_session_left_nav.scss`, `_sample_pages_left_nav.scss` (collapsed strip, expanded panel, hover popover), `_onboarding_wizard_page.scss`, `_empty_session_page.scss` (cards) | `rgba(24, 16, 40, α)` | `rgba(26, 23, 33, α)` |
| `src/components/headless/olly_chat_pill/_olly_chat_pill.scss` (ambient shadow) | `rgba(30, 15, 60, α)` | `rgba(33, 25, 50, α)` |

Duplicated dark-surface literals were also re-pointed at the theme variables
(so they auto-track future retunes):
- `_index.scss` `--g-surface-muted` / `--g-surface-border-strong`
- `_empty_session_page.scss` segmented control bg/hover/border
  → now use `$ouiColorHighlight`, `$ouiFormBackgroundColor`, `$ouiBorderColor`.

### Background gradients (canvas blobs) — saturation lowered
`src/themes/v9/components/_background.scss` (dark) and the dark line of the
`brandGradient` mixin in `_sample_pages_left_nav.scss`:

| Original hsla | After |
|---------------|-------|
| `hsla(250, 35%, 38%)` | `hsla(250, 18%, 38%)` |
| `hsla(240, 20%, 36%)` | `hsla(240, 12%, 36%)` |
| `hsla(260, 25%, 36%)` | `hsla(260, 14%, 36%)` |
| `hsla(255, 40%, 34%)` | `hsla(255, 22%, 34%)` |
| `hsla(245, 22%, 32%)` | `hsla(245, 13%, 32%)` |
| `hsla(240, 20%, 30%)` | `hsla(240, 12%, 30%)` |
| `hsla(270, 25%, 33%)` | `hsla(270, 14%, 33%)` |

(Blue-leaning blobs around 210–230° were left as-is.)

---

## How to retune
- **More / less purple globally:** edit `$glassDarkSurfaceDesat` and
  `$glassDarkAccentDesat` in `v9_colors_dark.scss`.
- **Glass panel tint:** change the `rgba(26, 23, 33, …)` triplet
  (and the chat-pill `rgba(33, 25, 50, …)`).
- **Canvas gradients:** adjust the `hsla(...)` saturation values listed above.
