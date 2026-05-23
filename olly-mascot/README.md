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
