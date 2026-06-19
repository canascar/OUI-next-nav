# 07 · Section Label

The `// SECTION` strip that headers each section on the Welcome page (and elsewhere). A short mono label followed by a dashed rule that stretches to fill remaining width.

## Visual

```
// LATEST  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
```

## Anatomy

- Outer: flex row, `gap: 10px`, `align-items: center`, `margin-bottom: 10–14px`
- Label: `<span>` containing `// {LABEL_UC}` in IBM Plex Mono / 10.5 / 700 / letter-spacing 1.8, color `cyan`
- Rule: `<span style={{ flex: 1, borderTop: '1px dashed var(--v10-ink-ghost)' }} />`

## Implementation

```jsx
function SectionLabel({ children, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 10,
      fontFamily: 'var(--v10-font-mono)',
      fontSize: 10.5, letterSpacing: 1.8,
      color: 'var(--v10-cyan)', fontWeight: 700,
      ...style,
    }}>
      <span>// {children}</span>
      <span style={{ flex: 1, borderTop: '1px dashed var(--v10-ink-ghost)' }}/>
    </div>
  );
}
```

## Usage

```jsx
<SectionLabel>LATEST</SectionLabel>
<SectionLabel>SERVICE</SectionLabel>
<SectionLabel>SAVED QUERY</SectionLabel>
<SectionLabel>FAVORITES</SectionLabel>
<SectionLabel>SUMMARY</SectionLabel>
<SectionLabel>RECOMMENDATION</SectionLabel>
```

The label content is always written in plain text — the `// ` and uppercasing are added by the component.

## Don't

- Don't use `<h2>` semantics here unless the content below is a true heading (then add `role="heading" aria-level={2}` to the inner label span)
- Don't replace the `//` with bullets, dashes, or other glyphs
