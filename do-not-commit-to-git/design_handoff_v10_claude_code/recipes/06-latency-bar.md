# 06 · Latency Bar

A 32×16 inline SVG showing 3 vertical bars decreasing in opacity, used inside finding meta strips to indicate a metric trend (latency, error rate, queue depth, etc.).

## API

```jsx
<LatencyBar tone="warn" deltaDir="up"   />   // amber bars climbing
<LatencyBar tone="ok"   deltaDir="down" />   // green bars shrinking
<LatencyBar tone="shared" deltaDir="up" />   // cyan, neutral collaborator
```

## Geometry

- ViewBox: `0 0 32 16`
- Baseline: line at `y = 15` from `x = 0` to `x = 32`, stroke `inkFade`, width `0.6`
- Reference line: at `y = 10`, stroke = tone color, width `0.5`, dashed `2 2`
- Bars: 3 rectangles at `x = 2, 8, 14`, each `width: 4`
  - `deltaDir === 'up'`: full bars (`height: 11`, top at `y = 4`)
  - `deltaDir === 'down'`: short bars (`height: 5`, top at `y = 10`), opacity `0.7`

## Bar styling

- First bar (`x=2`): filled `rgba(255,184,107,0.4)` (always amber soft, even when tone is cyan/green), stroke = tone color, width `0.6`
- Second bar (`x=8`): stroke only, no fill, opacity `0.6`
- Third bar (`x=14`): stroke only, no fill, opacity `0.4`

The first-bar amber fill is intentional — it draws the eye to the leading data point.

## Tone color

| `tone` | Color |
|---|---|
| `warn` (default) | `amber` |
| `ok` | `green` |
| `shared` | `cyan` |

## Implementation

```jsx
function LatencyBar({ tone = 'warn', deltaDir = 'up' }) {
  const colVar =
    tone === 'ok' ? 'var(--v10-green)'
    : tone === 'shared' ? 'var(--v10-cyan)'
    : 'var(--v10-amber)';
  const barH = deltaDir === 'down' ? 5 : 11;
  const barY = 15 - barH;
  return (
    <svg width="32" height="16" viewBox="0 0 32 16" style={{ flexShrink: 0 }}>
      <line x1="0" y1="15" x2="32" y2="15" stroke="var(--v10-ink-fade)" strokeWidth="0.6"/>
      <line x1="0" y1="10" x2="32" y2="10" stroke={colVar} strokeWidth="0.5" strokeDasharray="2 2"/>
      <rect x="2"  y={barY}     width="4" height={barH}                fill="rgba(255,184,107,0.4)" stroke={colVar} strokeWidth="0.6"/>
      <rect x="8"  y={barY + 1} width="4" height={Math.max(2, barH-2)} fill="none" stroke={colVar} strokeWidth="0.6" opacity="0.6"/>
      <rect x="14" y={barY + 2} width="4" height={Math.max(2, barH-4)} fill="none" stroke={colVar} strokeWidth="0.6" opacity="0.4"/>
    </svg>
  );
}
```

## Don't

- Don't animate the bars (the static glyph reads as "a state", not "a process")
- Don't add a fourth bar — the rhythm of three is intentional
