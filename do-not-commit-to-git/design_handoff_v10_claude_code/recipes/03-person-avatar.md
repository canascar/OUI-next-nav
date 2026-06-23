# 03 · Person Avatar

A circular initial-based avatar for human collaborators. Same construction as the OpenSearch mascot's outer ring, but plain (no eyes, no registration ticks) — just an initial.

## API

```jsx
<PersonAvatar initial="S" color={amber} size={24} />
<PersonAvatar initial="J" color={red}   size={28} />  // current user
```

## Geometry

- `width = height = size`, `borderRadius: 50%`
- Border: `1.4px solid <color>` (amber or red)
- Inner double-ring via `box-shadow`:
  ```css
  box-shadow: inset 0 0 0 2px var(--v10-bg), inset 0 0 0 3px <colorDim>;
  ```
- Letter: IBM Plex Mono, weight 700, size = `size * 0.46`, color = `<color>`, letter-spacing 0.5

## Color rules

| `color` value | Use for |
|---|---|
| `amber` | Other team members who shared a finding or appear in collaboration UI |
| `red`   | The current user (top-right of header / bottom of rail) — **only for "me"** |

There is no green or cyan PersonAvatar variant. Cyan is reserved for the agent (OllyAvatar); green is for resolved state.

## Implementation

```jsx
function PersonAvatar({ initial, color, size = 24 }) {
  const dim = color === 'red' ? 'var(--v10-red-dim)' : 'var(--v10-amber-dim)';
  const c   = color === 'red' ? 'var(--v10-red)'     : 'var(--v10-amber)';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.4px solid ${c}`,
      display: 'grid', placeItems: 'center',
      color: c, fontWeight: 700,
      fontSize: size * 0.46,
      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
      letterSpacing: 0.5, flexShrink: 0,
      boxShadow: `inset 0 0 0 2px var(--v10-bg), inset 0 0 0 3px ${dim}`,
    }}>{initial}</div>
  );
}
```

## Sizes used

| Context | Size |
|---|---|
| Bottom of dashboard rail (current user) | `28` |
| Inside a finding meta strip | `22` |
| Inside a chat sub-bubble | `22` |

## Do not

- Do not use a photo. v10 is initials-only by design.
- Do not lowercase the initial. Always uppercase.
- Do not put more than one character. If the name starts with a digit, use that digit.
