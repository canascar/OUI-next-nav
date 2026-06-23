# 04 · Status Pill

A small, square (no border-radius) badge with a leading `●` and uppercase mono label.

## Variants

| Variant | Background | Border | Foreground | Use for |
|---|---|---|---|---|
| `new`      | `amberSoft` | `amberDim` | `amber` | New / unacknowledged finding |
| `ack`      | `cyanSoft`  | `cyanDim`  | `cyan`  | Acknowledged, in-progress |
| `ok` / `resolved` | `greenSoft` | `greenDim` | `green` | Resolved, success |
| `alert` / `critical` | `redSoft` | `redDim` | `red` | Critical breach, destructive |

## Geometry

- `display: inline-flex`, `align-items: center`, `gap: 4px`
- Padding: `2px 7px` (or `2px 6px` for very dense lists)
- Border: `1px solid <accentDim>`
- Background: `<accentSoft>`
- Border-radius: **0**

## Typography

- Family: IBM Plex Mono
- Weight: 700
- Size: 9px
- Letter-spacing: 1.4
- Text-transform: uppercase
- Color: `<accent>`

## Implementation

```jsx
function StatusPill({ tone = 'new', children }) {
  return <span className={`v10-pill v10-pill--${tone}`}>● {children}</span>;
}
```

```css
.v10-pill {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--v10-font-mono);
  font-size: 9px; font-weight: 700;
  letter-spacing: 1.4px; text-transform: uppercase;
  padding: 2px 7px;
  border: 1px solid;
  border-radius: 0;
}
.v10-pill--new      { background: var(--v10-amber-soft); border-color: var(--v10-amber-dim); color: var(--v10-amber); }
.v10-pill--ack      { background: var(--v10-cyan-soft);  border-color: var(--v10-cyan-dim);  color: var(--v10-cyan); }
.v10-pill--ok       { background: var(--v10-green-soft); border-color: var(--v10-green-dim); color: var(--v10-green); }
.v10-pill--resolved { background: var(--v10-green-soft); border-color: var(--v10-green-dim); color: var(--v10-green); }
.v10-pill--alert    { background: var(--v10-red-soft);   border-color: var(--v10-red-dim);   color: var(--v10-red); }
```

## Cross-fade

When a status changes (e.g. NEW → ACK), cross-fade the pill colors with `transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;`.

## Don't

- Don't drop the `●` glyph
- Don't use color-only differentiation (the dot + label + border together carry the meaning)
- Don't make the pill rounded — it's part of the v10 "drafted" feel
