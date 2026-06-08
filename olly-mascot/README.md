# Mascot — OpenSearch comma-eye character

A drop-in React component. Self-contained, no external dependencies beyond React.

## Install

Copy `Mascot.tsx` into your project (e.g. `src/components/Mascot.tsx`).

If you're on plain JSX (not TypeScript), use `OpenSearchMascot.jsx` instead.

## Usage

```jsx
import { Mascot } from "./components/Mascot";

// Resting + idle-cycles through micro-expressions on its own
<Mascot size={120} />

// Lock to a specific expression
<Mascot size={64} expression="happy" />

// Custom color (pair = top→bottom gradient, single string = solid)
<Mascot size={120} color={["#6C4BD9", "#341E73"]} />
<Mascot size={120} color="#0F8A5B" />

// Light-colored body needs a dark eye for legibility
<Mascot size={120} color="#FFFFFF" eyeColor="#15171C" />

// Click handler (cursor becomes pointer)
<Mascot size={48} expression="dot" onClick={() => alert("hi")} />
```

## Dark mode

In the Glass theme (`v9-dark`), the mascot inverts to a white/light-grey body with dark eyes so it remains visible against the dark canvas.

| Token | Light mode | Dark mode |
|-------|-----------|-----------|
| Body gradient (top) | `#14558E` (navy) | `#FFFFFF` (white) |
| Body gradient (bottom) | `#153A5A` (deep navy) | `#D9DEE5` (cool grey) |
| Eye color | `#FFFFFF` (white) | `#181028` (deep violet-black) |

```jsx
// Dark mode usage
<Mascot
  size={32}
  color={['#FFFFFF', '#D9DEE5']}
  eyeColor="#181028"
/>

// Light mode usage (default)
<Mascot
  size={32}
  color={['#14558E', '#153A5A']}
  eyeColor="#FFFFFF"
/>

// Theme-aware (recommended)
import { useContext } from 'react';
import { ThemeContext } from '../components/with_theme';

const themeContext = useContext(ThemeContext);
const isDark = themeContext.theme === 'v9-dark';

<Mascot
  size={32}
  color={isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A']}
  eyeColor={isDark ? '#181028' : '#FFFFFF'}
/>
```

The `MASCOT_PALETTES.white` preset matches the dark mode values:

| Palette key | Body | Eye |
|-------------|------|-----|
| `white` | `['#FFFFFF', '#D9DEE5']` | `#15171C` |

> Note: The empty session page uses `#181028` (deep violet-black) for the eye
> rather than the preset's `#15171C` (neutral dark) to better complement the
> indigo-tinted dark canvas (`#0c0d12`).

## Preset palettes

```jsx
import { Mascot, MASCOT_PALETTES } from "./components/Mascot";

const p = MASCOT_PALETTES.purple;
<Mascot size={120} color={p.body} eyeColor={p.eye} />
```

## Expression vocabulary

| Key     | Eyes  | Meaning                          |
|---------|-------|----------------------------------|
| comma   | , ,   | default / resting / "I'm here"   |
| blink   | _ _   | brief beat / acknowledgement     |
| happy   | ^ ^   | success / cheerful completion    |
| dot     | . .   | attentive / serious moment       |
| squint  | > <   | uncertain / low confidence       |
| wow     | 0 0   | surprise / found something       |
| wink    | , _   | playful aside (use sparingly)    |
| heart   | <3<3  | celebration / loved-something    |
| xx      | x x   | unreachable / sleep / offline    |

## API

```ts
interface MascotProps {
  size?: number;                              // default 240
  expression?: MascotExpression;              // omit for idle cycling
  color?: [string, string] | string;          // default OpenSearch navy
  eyeColor?: string;                          // default "#fff"
  follow?: boolean;                           // default true
  idle?: boolean;                             // default true
  bob?: boolean;                              // default false
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}
```

## Principles

Status over personality. Affect scales with stakes. Restraint is the skill.
Honest about uncertainty. No fake personhood. A soft surface for confirmation and recovery.
