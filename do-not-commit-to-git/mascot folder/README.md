# Mascot

A comma-eyed React mascot with morphing expressions, idle micro-animations,
cursor tracking, and small-size legibility scaling.

## Files

- **`Mascot.jsx`** — the component itself. Inline JSX; load via Babel or
  transpile in your build.
- **`mascot.css`** — minimal styles (wrapper, drop shadow, bob + eye-pop
  keyframes). ~30 lines.
- **`demo.html`** — drop-in demo page, no build step required.
- **`showcase.html`** — the full presentation page: hero, expression
  vocabulary, size ramp, principles in practice, color/theme controls.
  Brings along `cli-mascot.jsx`, `styles.css`, `cli-styles.css`.

## Usage

```html
<link rel="stylesheet" href="mascot.css" />
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
<script type="text/babel" src="Mascot.jsx"></script>

<div id="root"></div>
<script type="text/babel">
  ReactDOM.createRoot(document.getElementById("root"))
    .render(<window.Mascot size={200} />);
</script>
```

In a bundled React app, replace the inline approach with a normal import:
strip the trailing `window.Mascot = …` assignments, change `function Mascot`
to `export function Mascot`, and import the CSS however your tooling expects.

## Props

| Prop         | Type                        | Default               | Notes |
| ------------ | --------------------------- | --------------------- | ----- |
| `size`       | number (px)                 | `240`                 | Body diameter. |
| `expression` | string (see below)          | `"comma"`             | Locked expression. |
| `color`      | `[from, to]` hex / hex      | `["#14558E","#153A5A"]` | Body gradient (top → bottom). |
| `eyeColor`   | hex                         | `"#fff"`              | Use a dark value on light bodies. |
| `follow`     | bool                        | `true`                | Eyes track the cursor. |
| `idle`       | bool                        | `true`                | Auto-cycle micro-expressions. |
| `bob`        | bool                        | `true`                | Gentle vertical bob. |
| `onClick`    | fn                          | —                     | Optional click handler. |

## Expression vocabulary

| `id`     | Glyph   | Meaning            |
| -------- | ------- | ------------------ |
| `comma`  | `, ,`   | default / resting  |
| `blink`  | `_ _`   | blink              |
| `happy`  | `^ ^`   | happy              |
| `dot`    | `. .`   | alert / attention  |
| `squint` | `> <`   | squint             |
| `wow`    | `O O`   | wow / surprise     |
| `wink`   | `, _`   | wink               |
| `heart`  | `<3<3`  | love               |
| `xx`     | `x x`   | sleep / dead       |

Exported as `window.EXPRESSIONS` (array of `{id, label, emoji}`) for building
your own pickers.

## Small-size legibility

Below 200px the eyes scale up and tighten inward so the expression still
reads. At 20px the eyes are 2× their native size with ~85% of their native
spread, but the spread is floor-clamped to keep ≥4 viewBox units of edge
gap so they never overlap. Above 200px, eyes render at native scale.

If you only ever render at a single large size, you can delete the
`eyeScale` / `eyeSpread` / `leftDx` / `rightDx` block and pass the eye paths
directly without their transforms.
