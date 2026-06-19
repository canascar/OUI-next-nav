# Verification Checklist

Run this after generating the v10 theme. Each item should be true in both `data-theme="dark"` and `data-theme="light"`.

## Tokens

- [ ] `tokens.css` is loaded and `[data-theme]` switches all CSS variables
- [ ] No hard-coded hex values appear outside `tokens.css` (search the codebase for `#0d3057`, `#5dd9ff`, etc. — there should be no matches outside the token file)
- [ ] Toggling `data-theme="light"` on the root produces a fully usable interface (no white-on-white or navy-on-navy)
- [ ] Theme transition is smooth (`background-color 200ms ease, color 200ms ease`)
- [ ] `localStorage.v10-theme` persists user choice across reloads

## Fonts

- [ ] Outfit (400/500/600/700) loaded
- [ ] IBM Plex Mono (400/500/600/700) loaded
- [ ] No system fallback fonts visible in screenshots (check by setting CSS `font-display: block` temporarily)

## Layout — Welcome

- [ ] Drafting grid (16px fine + 80px major) is visible on the page background
- [ ] 4 corner registration marks fixed at viewport corners
- [ ] Centered content column max-width 1100px
- [ ] OllyAvatar at 52px in the header
- [ ] Ask-bar `+` and send buttons are round; nothing else is
- [ ] Tab bar shows Overview / Discover / Monitor / More
- [ ] Overview tab has an amber NEW dot
- [ ] `// LATEST`, `// SERVICE`, `// SAVED QUERY`, `// FAVORITES` section labels with dashed rules
- [ ] Two finding cards with iso-cube meta strips
- [ ] Centered "◷ EDIT OVERVIEW" button at the bottom

## Layout — Dashboard

- [ ] 56 / 500 / flex three-column layout
- [ ] Each column scrolls independently
- [ ] OpenSearch logo at top of rail (NOT mascot)
- [ ] PersonAvatar with red ring at bottom of rail
- [ ] OllyAvatar in chat header
- [ ] Chat artifacts (cards, bar chart, code block) display correctly
- [ ] Code block syntax highlighting works (cyan/ink/amber/green/inkFade/inkDim)
- [ ] Line chart in canvas has the dashed red 2,000 ms threshold
- [ ] Amber alarm banner under the chart
- [ ] `// SUMMARY` and `// RECOMMENDATION` sections present
- [ ] NO corner registration marks on this page

## Components

- [ ] Every card has corner ticks (top-left and bottom-left accent, top-right and bottom-right `inkFade`)
- [ ] Every card with severity has a `2px` accent stripe on the left
- [ ] Border radius is `0` on every element except avatars and welcome ask-bar `+`/send
- [ ] No drop shadows visible
- [ ] Status pills use `●` glyph + UPPERCASE label
- [ ] Iso cubes appear in every finding's meta strip
- [ ] Iso cubes overflow to `+N` past 7
- [ ] Latency bar (3 bars + dashed baseline) appears alongside metric values
- [ ] Theme toggle has sun + moon SVG icons and switches modes
- [ ] Ghost button = `inkFade` border + `inkDim` text; Primary = `cyanDim` border + `cyan` text + `cyanSoft` bg

## Mascot (OllyAvatar)

- [ ] Eyes are comma-shaped, filled cyan
- [ ] Eyes scale up at small sizes (still readable at 22px)
- [ ] Body has cyan border + 4 cardinal registration ticks
- [ ] Outer faint ring visible
- [ ] Body fill differs by theme (`bgDeep` dark / `#dde9f5` light)

## Light theme specifics

- [ ] Light scrollbar is half-strength relative to text (`rgba(13,48,87,0.14)`)
- [ ] Light cyan (`#1f6cb5`) is dark enough on white that mono labels are readable
- [ ] No fully-transparent overlay surfaces (the grid would bleed and look noisy)
- [ ] Theme toggle reads `LIGHT` (active highlighted)

## Code-level smell test

- [ ] No emoji used as icons (search `:thumbsup:`, `↑`, etc. — only typographic glyphs `↑ → │ ● ◢ //` are permitted)
- [ ] No new third-party dependencies introduced
- [ ] No CSS-in-JS theme objects outside the host's existing pattern
- [ ] `tokens.json` and `tokens.css` agree (a build-time check is ideal)

## Cross-browser

- [ ] Chrome — works
- [ ] Firefox — works (note: WebKit scrollbar selectors don't apply; Firefox uses `scrollbar-color` / `scrollbar-width`)
- [ ] Safari — works

## Accessibility

- [ ] WCAG AA contrast ratio passes for body text (`ink` on `bg`) in both themes
- [ ] WCAG AA passes for label text (`inkDim` on `bg`) in both themes
- [ ] Focus rings present and visible (use 1px `cyan` outline, no shadows)
- [ ] All icon buttons have `aria-label`
- [ ] Mascot avatar has `role="img" aria-label="Olly"` (or equivalent)
- [ ] Theme toggle buttons have `aria-pressed`

If any item fails, fix and re-run.
