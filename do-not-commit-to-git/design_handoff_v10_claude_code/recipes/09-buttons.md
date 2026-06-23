# 09 · Buttons

There are only **two** button variants in v10: **Ghost** and **Primary**. Everything else (Dismiss, Edit overview, Pin, copy code, action chips) reuses one of these.

The welcome page's `+` and "send" buttons in the ask bar are a **special exception** (round, 26–30px) — see end of doc.

## Ghost button (default)

```css
.v10-btn-ghost {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  border: 1px solid var(--v10-ink-fade);
  background: transparent;
  color: var(--v10-ink-dim);
  font-family: var(--v10-font-mono);
  font-size: 10.5px; font-weight: 600;
  letter-spacing: 1.2px; text-transform: uppercase;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
}
.v10-btn-ghost:hover {
  border-color: var(--v10-ink-dim);
  color: var(--v10-ink-bright);
}
```

## Primary button (rare — used for "send" / confirm)

```css
.v10-btn-primary {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  border: 1px solid var(--v10-cyan-dim);
  background: var(--v10-cyan-soft);
  color: var(--v10-cyan);
  font-family: var(--v10-font-mono);
  font-size: 10.5px; font-weight: 700;
  letter-spacing: 1.2px; text-transform: uppercase;
  border-radius: 0;
  cursor: pointer;
}
.v10-btn-primary:hover {
  background: rgba(93, 217, 255, 0.18);
}
```

## Square icon button (for rail / header icons)

```css
.v10-btn-icon {
  width: 32px; height: 32px;
  display: grid; place-items: center;
  border: 1px solid var(--v10-ink-fade);
  background: transparent;
  color: var(--v10-ink-dim);
  border-radius: 0;
  cursor: pointer;
}
.v10-btn-icon:hover {
  color: var(--v10-ink-bright);
}
.v10-btn-icon--active {
  background: var(--v10-cyan-soft);
  border-color: var(--v10-cyan-dim);
  color: var(--v10-cyan);
}
```

Icons inside icon buttons are inline SVGs at 14–16px, stroke 1.3–1.4, `stroke="currentColor"`.

## Round buttons (ask-bar exception)

The welcome ask bar's `+` and send buttons are the ONLY round controls in v10. They live inside the ask-bar component, not the general button library.

```css
.v10-ask-plus {
  width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid var(--v10-ink-fade);
  display: grid; place-items: center;
  color: var(--v10-ink-dim);
  font-size: 16px; line-height: 1;
  cursor: pointer;
}
.v10-ask-send {
  width: 30px; height: 30px; border-radius: 50%;
  border: 1px solid var(--v10-cyan-dim);
  background: var(--v10-cyan-soft);
  display: grid; place-items: center;
  color: var(--v10-cyan);
  cursor: pointer;
}
```

The dashboard's chat input has equivalent square versions of these.

## Don't

- Don't add a third variant. If you need a destructive button, build it from Primary + `red` tones, but keep the rectangular geometry.
- Don't add a drop shadow, glow, or transform on hover. Only border + color change.
- Don't make a non-ask-bar button round.
