# Skill: Session Thread Implementation

## When to use
Use this skill when implementing or modifying the AI chat thread UX — specifically the response animation choreography involving the Olly mascot, loading steps, and text streaming.

## Key Files
- `src-docs/src/views/sample_pages/thread_page.js` — Main thread component with `AssistantMessage`, `TaskListMessage`
- `src-docs/src/views/sample_pages/_thread_page.scss` — Thread styling including mascot animations
- `src-docs/src/views/sample_pages/progress_tracker.js` — Step progress component
- `src/components/headless/agentic_spinner/` — Blob spinner component
- `olly-mascot/Mascot` — Mascot component with expressions

## Implementation Pattern

### AssistantMessage Component
```jsx
const AssistantMessage = ({ content, streaming, isLastAssistant, isTyping, mascotColor, mascotEyeColor, ... }) => {
  const showMascot = isLastAssistant && !isTyping;
  
  return (
    <div className="threadPage__message threadPage__message--assistant">
      {streaming ? (
        // Row layout: Olly left, bubble right
        <div className="threadPage__assistantStreamRow">
          {showMascot && (
            <div className={`threadPage__responseMascot${!content ? ' --pulsing' : ''}`}>
              <Mascot size={20} ... />
            </div>
          )}
          <div className="threadPage__bubble threadPage__bubble--assistant">
            {content && <OuiText>{parseContent(content)}</OuiText>}
          </div>
        </div>
      ) : (
        // Column layout: bubble full width, Olly below
        <>
          <div className="threadPage__bubble threadPage__bubble--assistant">
            {content && text...}
            {attachments...}
            {feedback buttons...}
          </div>
          {showMascot && content && (
            <div className="threadPage__responseMascot">
              <Mascot size={20} ... />
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

### Response Delay Pattern
```javascript
// After steps complete, create empty streaming message
setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, attachment, attachments }]);

// 2 second pause (Olly pulsates)
const delayTimer = setTimeout(() => {
  // Then stream tokens
  const tokens = fullContent.split(/(\s+)/);
  let built = '';
  tokens.forEach((token, i) => {
    setTimeout(() => {
      built += token;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant', content: built,
          streaming: i < tokens.length - 1,
          attachment, attachments
        };
        return updated;
      });
    }, i * 30);
  });
}, 2000);
```

### Progress Tracker Step Icons
```jsx
const StepIcon = ({ status }) => {
  switch (status) {
    case 'completed': return <OuiIcon type="checkInCircleEmpty" color="success" />;
    case 'in-progress': return <span className="ouiAgenticSpinner ouiAgenticSpinner--s" />;
    case 'failed': return <OuiIcon type="crossInACircleFilled" color="danger" />;
    case 'pending': return <OuiIcon type="dot" color="subdued" />;
  }
};
```

## Animation Classes

| Class | Use |
|-------|-----|
| `.threadPage__responseMascot` | Olly below text (pop-in) |
| `.threadPage__responseMascot--pulsing` | Olly waiting for text (pop-in + pulse) |
| `.threadPage__assistantStreamRow` | Row layout during streaming |
| `.ouiAgenticSpinner--s` | Small blob for step loading |

## Rules
1. Only one Olly visible at a time (last assistant message only)
2. No Olly while steps are loading (isTyping === true)
3. Olly NEVER on the right side
4. 2 second delay before text starts (Olly pulsates with `blink` expression)
5. Text streams at 30ms per token (Olly shows `dot` expression)
6. When done, Olly winks for 600ms then goes idle (OllyIdle component)
7. Use `OllyIdle` for the resting state — it handles wink-on-mount, idle cycling, and mouseDown/heart interaction

## Mascot Expression Map
| State | Expression | Component |
|-------|-----------|-----------|
| Pulsating (delay) | `blink` | `<Mascot expression="blink" idle={false} />` |
| Streaming text | `dot` | `<Mascot expression="dot" idle={false} />` |
| Done (resting) | wink → idle | `<OllyIdle size={20} />` |
| User hover | `happy` | Handled by OllyIdle internally |
| User click | `heart` | Handled by OllyIdle internally |

## OllyIdle Component
Located at `src-docs/src/views/sample_pages/olly_idle.js`

```jsx
import { OllyIdle } from './olly_idle';

<OllyIdle size={20} />           // Winks on mount, then idle, tooltip on hover
<OllyIdle size={20} winkOnMount={false} />  // Skip wink
<OllyIdle size={32} expression="happy" />   // Force expression (no tooltip/interaction)
```

**Hover tooltip** — randomized from:
- "Ready for your next request."
- "Olly olly oxen free!"
- "What's next for us?"
- "What can I help you with?"
- "Anything else I can do? Let me know!"
