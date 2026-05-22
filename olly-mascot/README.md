# Mascot — OpenSearch comma-eye character

A drop-in React component. Self-contained, no external dependencies beyond React.

## Install

Copy `Mascot.tsx` into your project (e.g. `src/components/Mascot.tsx`).

If you're on plain JSX (not TypeScript), rename it to `Mascot.jsx` and strip the
type annotations — Claude Code can do this for you. Ask it:

> Convert `Mascot.tsx` to plain JSX, removing types but keeping JSDoc.

## Usage

```tsx
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

```tsx
import { Mascot, MASCOT_PALETTES } from "./components/Mascot";

const p = MASCOT_PALETTES.purple;
<Mascot size={120} color={p.body} eyeColor={p.eye} />
```

## Expression vocabulary

| id       | reads as  | use for                                    |
|----------|-----------|--------------------------------------------|
| `comma`  | `, ,`     | default / resting / "I'm here"             |
| `blink`  | `_ _`     | brief beat / acknowledgement               |
| `happy`  | `^ ^`     | success / cheerful completion              |
| `dot`    | `. .`     | attentive / serious moment                 |
| `squint` | `> <`     | uncertain / low confidence result          |
| `wow`    | `0 0`     | surprise / found something                 |
| `wink`   | `, _`     | playful aside (use sparingly)              |
| `heart`  | `<3<3`    | celebration / loved-something signal       |
| `xx`     | `x x`     | unreachable / sleep / offline              |

## Behavior notes

- **Idle cycling.** When no `expression` prop is set and `idle` is true (default),
  the mascot drifts through a weighted rotation: ~40% blink, then dot/squint/happy/
  wow/wink. It always returns to the resting comma between pulses. Pass a specific
  `expression` to lock it.

- **Eye scaling.** Below 200px, eyes scale up to 1.65× at ≤32px so the expression
  stays readable in dense UIs (toolbar icons, status indicators, inline tags).

- **Cursor tracking.** Eyes follow the cursor with a small offset. Disable with
  `follow={false}` for inline / list contexts where it's a distraction.

- **Bob.** `bob={true}` adds a gentle 4.2s vertical bob. Off by default — opt in
  for hero / standalone placements only.

- **Multiple instances.** Gradient IDs are randomized per instance, so you can
  place as many mascots on a page as you want without ID collisions.

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

## Suggested patterns

**Status indicator in a search input**
```tsx
<input ... />
<Mascot size={22} expression={loading ? "wow" : "comma"} follow={false} />
```

**Confirmation dialog — gravity matches the stakes**
```tsx
<Mascot size={28} expression={amount > 1000 ? "dot" : "happy"} follow={false} />
```

**Error toast**
```tsx
<Mascot size={28} expression="xx" follow={false} />
<span>Couldn't reach server. <button>Retry</button></span>
```

**Loading state in a corner of a long-running view**
```tsx
<Mascot size={24} follow={false} />   {/* lets it idle-cycle quietly */}
```

## Principles (in one breath)

Status over personality. Affect scales with stakes. Restraint is the skill.
Honest about uncertainty. No fake personhood. A soft surface for confirmation
and recovery.
