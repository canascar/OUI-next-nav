---
inclusion: manual
---

# Session Thread UX — Olly Mascot & Response Animation Pattern

This document defines the UX pattern for AI responses in the session chat thread. Use this as a reference when implementing chat/thread interactions anywhere in the product.

---

## Overview

The session thread uses a specific choreography for AI responses involving the Olly mascot, a blob spinner for loading steps, and character-by-character text streaming. The goal is to communicate that the AI is "thinking" and then "speaking" — making the interaction feel conversational.

---

## Response Flow

### 1. User sends a message
- User message appears on the right (bubble style)
- Previous Olly mascot (below the last response) disappears
- `isTyping` state becomes `true`

### 2. Steps/Tasks loading (blob spinner)
- A progress tracker appears with task steps
- Each in-progress step shows the **agentic spinner blob** (`ouiAgenticSpinner--s`)
- Completed steps show a green checkmark
- Olly does NOT appear during this phase
- Duration: ~3s per step (configurable)

### 3. Olly appears and pulsates (2 second pause)
- After all steps complete, `isTyping` becomes `false`
- An assistant message is created with `streaming: true` and empty content
- Olly pops in on the left (scale animation from 0 → 1) and pulsates
- This indicates "Olly is about to respond"
- Duration: **2 seconds**

### 4. Text streams in next to Olly
- After the 2s pause, text begins streaming word-by-word (~30ms per token)
- Olly sits on the left of the first line of text (row layout)
- Olly stops pulsating — just present and idle
- Text types in character by character

### 5. Response complete — Olly moves below
- When streaming finishes (`streaming` becomes `false`), the layout switches
- Text takes full width
- Olly appears **below** the text on the left
- Attachments and feedback buttons (thumbs up/down) appear
- Olly stays here until the user sends another message

---

## Key Rules

| Rule | Details |
|------|---------|
| Only one Olly at a time | Only the **last** assistant message shows Olly. Previous ones don't. |
| No Olly during steps | While `isTyping` is true (steps loading), Olly is hidden even on the last message. |
| Olly never on the right | Right side is exclusively for user messages. |
| Blob for steps, Olly for text | Steps use `ouiAgenticSpinner`. Text responses use the Mascot. |
| Pop-in animation | Olly uses `scale(0) → scale(1)` with `cubic-bezier(0.34, 1.56, 0.64, 1)` — no translate. |
| Pulse animation | `scale(1) → scale(1.1) → scale(1)` with `opacity: 1 → 0.7 → 1`, 1s loop. Only while waiting (no text yet). |

---

## Mascot Expressions by State

| State | Expression | Meaning |
|-------|-----------|---------|
| Pulsating (waiting, no text) | `blink` | Brief beat / acknowledgement — "processing" |
| Text streaming in | `dot` | Attentive / serious — "speaking" |
| Done (below text) | `wink` → idle | Wink for 600ms (playful aside), then transitions to idle cycling |
| Idle (resting below text) | idle cycling | Default micro-expression rotation (blink-heavy) |
| User hover (mouseEnter) | `happy` | Cheerful — "I see you" |
| User interaction (mouseDown) | `heart` | Celebration — "loved it" |
| User releases (mouseUp) | revert to idle | Back to natural cycling |

---

## OllyIdle Component

A reusable component at `src-docs/src/views/sample_pages/olly_idle.js` that encapsulates the idle mascot behavior:

```jsx
import { OllyIdle } from './olly_idle';

// Standard idle (winks on mount, then cycles)
<OllyIdle size={20} />

// No wink on mount
<OllyIdle size={20} winkOnMount={false} />

// Force a specific expression (disables interaction)
<OllyIdle size={32} expression="happy" />
```

**Behavior:**
- On mount: wink for 600ms, then idle cycling
- Hover: shows a random tooltip from the pool
- mouseDown: heart expression + squish (scale 0.8)
- mouseUp/mouseLeave: revert to idle
- Automatically handles theme-aware colors

**Tooltip pool (randomized on mount):**
- "Ready for your next request."
- "Olly olly oxen free!"
- "What's next for us?"
- "What can I help you with?"
- "Anything else I can do? Let me know!"

---

## Components Involved

| Component | Location | Role |
|-----------|----------|------|
| `AssistantMessage` | `thread_page.js` | Renders response with Olly |
| `TaskListMessage` | `thread_page.js` | Renders step progress with blob |
| `ProgressTracker` | `progress_tracker.js` | Step list with status icons |
| `OuiAgenticSpinner` | `src/components/headless/agentic_spinner/` | Blob loading animation |
| `Mascot` | `olly-mascot/Mascot` | Olly avatar with expressions |

---

## CSS Classes

```scss
// Mascot below the response (idle state)
.threadPage__responseMascot {
  margin-top: 4px;
  animation: threadMascotPopIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

// Mascot pulsating (waiting for text)
.threadPage__responseMascot--pulsing {
  animation: threadMascotPopIn 400ms both,
             threadMascotPulse 1s ease-in-out 400ms infinite;
}

// Row layout: Olly left, text right (while streaming)
.threadPage__assistantStreamRow {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}
```

---

## Timing Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| Step duration | ~3000ms | Time each step shows as in-progress |
| Pre-text pause | 2000ms | Olly pulsates before text starts |
| Token speed | 30ms | Delay between each word token |
| Pop-in duration | 400ms | Olly scale animation |
| Pulse cycle | 1000ms | One full pulse loop |

---

## Empty Chat State

When the thread has no messages:
- Centered mascot (48px) with randomized title
- Suggestion buttons below
- Click mascot → heart expression (mouseDown), release → revert
- Titles rotate randomly from: "How can I help?", "Ask and I will provide", "Olly olly oxen free", "What can I help you seek?"
