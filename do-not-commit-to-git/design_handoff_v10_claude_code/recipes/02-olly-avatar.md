# 02 · Olly Avatar (Mascot)

The OpenSearch mascot, restyled for the v10 blueprint language. Comma eyes on a flat cyan-bordered disc with cardinal registration ticks.

## Visual reference

`reference/Welcome D3.html` → top-left of the header. `reference/d3-blueprint-theme.jsx` → `D3OllyAvatar`.

## Geometry

- ViewBox: `0 0 80 80` (the canonical mascot coordinate space — eyes are positioned for this)
- Body radius: `34`
- Outer faint ring radius: `38`
- Cardinal tick: from `r=34` to `r=38` at 0° / 90° / 180° / 270°
- Eyes are filled cyan paths; left eye centered around (39, 31), right around (57, 31)

## Stroke widths (scale with size)

| Size | Body stroke | Tick stroke | Outer-ring stroke |
|---|---|---|---|
| `< 30px` | `1.6` | `0.96` | `0.64` |
| `30–60px` | `1.2` | `0.72` | `0.48` |
| `≥ 60px` | `1.0` | `0.60` | `0.40` |

Formula: `tick = stroke * 0.6`, `outerRing = stroke * 0.4`.

## Fills

| Element | Dark | Light |
|---|---|---|
| Body fill | `bgDeep` (`#0a2545`) | `#dde9f5` |
| Outer ring fill | `rgba(93,217,255,0.08)` | `rgba(31,108,181,0.08)` |
| Body stroke + ticks + eyes | `cyan` | `cyan` |
| Outer ring stroke | `cyanDim` | `cyanDim` |

## Small-size legibility

The eyes need to grow as the avatar shrinks, or they disappear at 22px. Use this scaling:

```js
// size ∈ [0, ∞)
const eyeScale = size >= 80 ? 1.0
  : size <= 20 ? 2.0
  : 1.0 + Math.pow((80 - size) / 60, 1.3) * 1.0;

// Pull the two eyes closer together as size shrinks (so they don't fall off the disc)
const eyeSpread = (() => {
  let pref;
  if (size >= 80) pref = 1.0;
  else if (size <= 20) pref = 0.85;
  else pref = 1.0 - Math.pow((80 - size) / 60, 1.3) * 0.15;
  const minSpread = (4 + 6 * eyeScale) / 18;
  return Math.max(pref, minSpread);
})();
```

Apply by transforming each eye around its original center:

```jsx
<g transform={`translate(${leftDx} 0) translate(39 31) scale(${eyeScale}) translate(-39 -31)`}>
  <path d={EYE_L} fill={cyan}/>
</g>
```

where `leftDx = (48 - 39) * (1 - eyeSpread)` and `rightDx = -(57 - 48) * (1 - eyeSpread)`.

## Eye paths

```
EYE_L = "M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z"

EYE_R = "M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z"
```

These are the exact paths from the OpenSearch mascot. Do not redraw them — copy verbatim.

## React reference

The complete implementation is in `reference/d3-blueprint-theme.jsx` → `D3OllyAvatar`.

## Sizes used in the app

| Context | Size |
|---|---|
| Welcome page header | `52` |
| Dashboard chat header (next to title) | `32` |
| Finding card meta strip / chat bubbles | `22` |
| Mini context (badges, inline mentions) | `20` or `18` |

## Do not

- Do not add a `boxShadow` ring (the body stroke + outer ring handles it)
- Do not put a letter "O" inside the avatar (the old fallback). It now always has the comma eyes.
- Do not change the eye color from `cyan` for any reason.
- Do not animate the eyes (idle blinks were in the legacy mascot — they are removed in v10).
