# 01 · Corner Ticks

Four 6×6 absolutely-positioned brackets at each corner of a card or panel. The signature decoration of v10.

## Rules

- Parent must be `position: relative`
- Each tick is `position: absolute`, inset `-1px` from the corresponding corner so it sits ON the parent's border
- Each tick is `width: 6px; height: 6px`, `pointer-events: none`
- Each tick has 2 borders only (the two edges that face out of the card)

## Color logic

- **Top-left** and **bottom-left** ticks use the card's accent color (`accent` prop), or `cyanDim` if neutral
- **Top-right** and **bottom-right** ticks use `inkFade` (always)

This asymmetry — bright accent on left, muted on right — gives the card a felt "front" and reinforces the left-accent stripe pattern.

## React API

```jsx
<CornerTicks accent={T.amber} />   // amber on left, inkFade on right
<CornerTicks />                    // defaults to cyanDim on left
```

## Implementation

```jsx
function CornerTicks({ accent }) {
  const a = accent || 'var(--v10-cyan-dim)';
  const f = 'var(--v10-ink-fade)';
  return (
    <>
      <span style={{ position: 'absolute', top: -1,    left: -1,  width: 6, height: 6, borderTop:    `1px solid ${a}`, borderLeft:  `1px solid ${a}`, pointerEvents: 'none' }}/>
      <span style={{ position: 'absolute', top: -1,    right: -1, width: 6, height: 6, borderTop:    `1px solid ${f}`, borderRight: `1px solid ${f}`, pointerEvents: 'none' }}/>
      <span style={{ position: 'absolute', bottom: -1, left: -1,  width: 6, height: 6, borderBottom: `1px solid ${a}`, borderLeft:  `1px solid ${a}`, pointerEvents: 'none' }}/>
      <span style={{ position: 'absolute', bottom: -1, right: -1, width: 6, height: 6, borderBottom: `1px solid ${f}`, borderRight: `1px solid ${f}`, pointerEvents: 'none' }}/>
    </>
  );
}
```

## CSS-only variant

```css
.v10-card { position: relative; }
.v10-card::before,
.v10-card::after,
.v10-card > .ct-bl,
.v10-card > .ct-br {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  pointer-events: none;
}
.v10-card::before { top: -1px; left: -1px;
  border-top: 1px solid var(--v10-accent, var(--v10-cyan-dim));
  border-left: 1px solid var(--v10-accent, var(--v10-cyan-dim));
}
.v10-card::after { top: -1px; right: -1px;
  border-top: 1px solid var(--v10-ink-fade);
  border-right: 1px solid var(--v10-ink-fade);
}
.v10-card > .ct-bl { bottom: -1px; left: -1px;
  border-bottom: 1px solid var(--v10-accent, var(--v10-cyan-dim));
  border-left: 1px solid var(--v10-accent, var(--v10-cyan-dim));
}
.v10-card > .ct-br { bottom: -1px; right: -1px;
  border-bottom: 1px solid var(--v10-ink-fade);
  border-right: 1px solid var(--v10-ink-fade);
}
```

The two `> .ct-*` spans are needed because CSS only gives you `::before`/`::after`.

## Use everywhere

- Every finding card
- Every artifact card in the chat thread
- The welcome ask bar
- Each section panel (the swatches, type ramp, etc. in `theme-overview.html`)
- The fault-rate and saved-query cards
- The favorites rows
- The dashboard's alarm banner (with `accent={amber}`)
- The dashboard's line-chart card (neutral, no accent)

If a card does NOT have corner ticks, something is wrong — they are the connective tissue of the theme.
