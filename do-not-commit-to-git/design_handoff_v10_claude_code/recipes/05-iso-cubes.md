# 05 · Iso Cubes (Scope Indicator)

Axonometric cubes representing affected vs healthy units (pods, services, consumers). Replaces the conventional "3/4" text-only indicator with a small inline drawing.

## API

```jsx
<IsoStack total={4} bad={3} />            // 3 amber, 1 cyan
<IsoStack total={8} bad={0} allOk />       // all green (resolved)
<IsoStack total={12} bad={4} />            // 7 cubes + "+5"
```

## Geometry — single cube

Each cube is drawn in a `14 × 22` viewBox unit (width × height), with three filled polygons forming the visible faces:

```
top:   "6,2 14,6 8,10 0,6"
left:  "0,6 8,10 8,18 0,14"   (opacity 0.85)
right: "8,10 14,6 14,14 8,18" (opacity 0.7)
```

If the cube is `broken`, add an additional diagonal hatch line: from `(2, 9)` to `(12, 15)` with the same stroke color.

All three polygons share the same `fill` and `stroke` (the cube's color); only the opacities differ to fake lighting.

## Colors per state

| State | Stroke | Fill |
|---|---|---|
| Healthy (default) | `cyan` | dark: `rgba(93,217,255,0.10)` / light: `rgba(31,108,181,0.08)` |
| Broken / affected | `amber` | dark: `rgba(255,184,107,0.16)` / light: `rgba(196,122,31,0.14)` |
| Resolved (allOk)  | `green` | dark: `rgba(123,224,168,0.14)` / light: `rgba(46,139,111,0.12)` |

Stroke width: `0.9` (cube edges), `0.7` (hatch line).

## Geometry — stack

- Cubes laid out horizontally at x offsets `0, 14, 28, …`
- Show up to **7** cubes
- If `total > 7`: show 7 cubes followed by `+N` text in IBM Plex Mono 9 / `inkDim`, positioned at `x = shown * 14 + 4, y = 14`
- Total SVG height is `22`. Width = `shown * 14 + 16` (plus 22 if there's overflow text)

## Single cube implementation

```jsx
function IsoCube({ x, broken, ok }) {
  const stroke = broken ? 'var(--v10-amber)' : ok ? 'var(--v10-green)' : 'var(--v10-cyan)';
  const fill = broken
    ? 'var(--v10-amber-soft)'
    : ok
    ? 'var(--v10-green-soft)'
    : 'var(--v10-cyan-soft)';
  return (
    <g transform={`translate(${x},0)`}>
      <polygon points="6,2 14,6 8,10 0,6"    fill={fill} stroke={stroke} strokeWidth="0.9"/>
      <polygon points="0,6 8,10 8,18 0,14"   fill={fill} stroke={stroke} strokeWidth="0.9" opacity="0.85"/>
      <polygon points="8,10 14,6 14,14 8,18" fill={fill} stroke={stroke} strokeWidth="0.9" opacity="0.7"/>
      {broken && <line x1="2" y1="9" x2="12" y2="15" stroke={stroke} strokeWidth="0.7"/>}
    </g>
  );
}
```

## Stack implementation

```jsx
function IsoStack({ total, bad, allOk }) {
  const shown = Math.min(total, 7);
  const overflow = total - shown;
  const w = shown * 14 + 16 + (overflow ? 22 : 0);
  return (
    <svg width={w} height="22" viewBox={`0 0 ${w} 22`} style={{ flexShrink: 0 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <IsoCube key={i} x={i * 14} broken={!allOk && i < bad} ok={allOk}/>
      ))}
      {overflow > 0 && (
        <text x={shown * 14 + 4} y="14"
          fontFamily="'IBM Plex Mono', monospace"
          fontSize="9"
          fill="var(--v10-ink-dim)">+{overflow}</text>
      )}
    </svg>
  );
}
```

## Where it's used

- Finding card meta strips on Welcome and Dashboard
- The `// SERVICE` panel (one cube row per service, optional)
- The theme-overview `// 05 · COMPONENTS` demo

## Don't

- Don't use perspective (this is axonometric, not perspective)
- Don't change the cube proportions (the 14×22 box is calibrated for inline use)
- Don't outline the entire stack — only the cubes themselves
