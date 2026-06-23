# 08 · Theme Toggle

Segmented two-button control to swap light/dark. The active button is filled `cyanSoft`, the inactive is transparent.

## API

```jsx
<ThemeToggle mode={mode} setMode={setMode} />
```

`mode` is `'light'` or `'dark'`. `setMode` persists to `localStorage` AND updates the `data-theme` attribute on `<html>`.

## Geometry

- Outer wrapper: `inline-flex`, border `1px solid inkFade`, background `panel`, no border-radius
- Each button:
  - Padding `6px 12px`
  - Border `0` (the outer wrapper carries the border)
  - The two buttons share a `1px solid inkFade` divider between them (apply as right border of the first button, OR left border of the second)
  - Inline icon (SVG, 11×11) + uppercase label, gap 5px
- Active button:
  - Background: `cyanSoft`
  - Color: `cyan`
  - Font weight: 700
- Inactive button:
  - Background: `transparent`
  - Color: `inkDim`
  - Font weight: 500

## Icons

**Sun (light)** — 11×11 viewBox:
```svg
<circle cx="5.5" cy="5.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1"/>
<!-- 8 rays at 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315° -->
<!-- each ray: line from (cx + cos(a)*3.8, cy + sin(a)*3.8) to (cx + cos(a)*5.1, cy + sin(a)*5.1) -->
```

**Moon (dark)** — 11×11 viewBox:
```svg
<path d="M8 6.4 A3.6 3.6 0 1 1 4.6 3 a2.8 2.8 0 0 0 3.4 3.4 Z"
  fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
```

## Persistence

When the user toggles, do all three:

```js
function setMode(next) {
  document.documentElement.dataset.theme = next;
  localStorage.setItem('v10-theme', next);
  /* notify any React state in your store */
}
```

On first load:

```js
const stored = localStorage.getItem('v10-theme');
const initial = stored ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.documentElement.dataset.theme = initial;
```

## Placement

- **Welcome page**: top-right of the content column, above the header
- **Dashboard page**: inside the canvas tab bar, right side, between the spacer and the list icon
- A global app shell could host one in the user menu instead — then remove the per-page instances

## Don't

- Don't auto-flip the theme on schedule (no "follow sunset" behavior)
- Don't put the toggle in three states (light / dark / system). Just two buttons.
