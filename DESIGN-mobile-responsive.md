# Mobile Responsive Design — V6 Home & Interior Pages

## Breakpoint

- **768px** — single breakpoint for all mobile adaptations
- All changes scoped inside `@media (max-width: 768px)` — zero impact on desktop/tablet layouts

## Home Page (`/home`, V6)

### Layout
- Two-column layout stacks vertically: findings on top, overview/widgets below
- User scrolls the full page vertically (single scroll container)
- Resize handle hidden

### Navigation
- Left nav rail (`sessionLeftNav`) hidden completely when collapsed
- Floating ghost menu button (OUI `menu` icon) in top-left opens the real expanded nav as a slide-over panel (300px / max 85vw)
- Expanded nav uses solid background on mobile (no backdrop-filter blur)
- No lightbox/backdrop overlay — just the panel with a right border

### Left Column (Greeting + Input)
- Centered content with `max-width: 480px`
- Top padding: 64px for breathing room
- Input area shimmer: tighter dot spacing (5px vs 7px), faster animation (2x), narrower visible area (55% mask ellipse)
- Jump-to chips: horizontal scroll, smaller size (28px height, 11px font)

### Right Column (Overview + Widgets)
- Full-width stretch, 16px padding
- Widget grid: standard 2-column CSS grid (not horizontal scroll)
- Wide widgets (`span2+`) span full 2 columns, 1 row
- Overview content and tab row: full width (no max-width constraint)

## Interior Pages (Session Container)

### Layout
- Existing side-by-side layout preserved (no flex-direction change)
- Container pushed down with `padding-top: 44px` to accommodate back button

### Navigation
- Fixed-position back arrow button (OUI `arrowLeft` icon) in top-left
- Ghost style — no background, just the icon
- Triggers navigation back to home/new session

## Files Modified

| File | Purpose |
|------|---------|
| `_empty_session_page_v6.scss` | Home page responsive styles, mobile menu button, shimmer adjustments |
| `_session_left_nav.scss` | Nav rail hide/show, expanded overlay behavior, solid bg on mobile |
| `_session_container.scss` | Interior page padding + back button |
| `empty_session_page_v6.js` | Mobile menu button JSX, shimmer responsive params, `onOpenMobileNav` prop |
| `session_left_nav.js` | `expandRef` prop to trigger expand from outside, backdrop click-to-close |
| `session_container.js` | `onGoBack` prop, back button JSX |
| `sample_pages_view.js` | Wire `navExpandRef` and `onOpenMobileNav`/`onGoBack` callbacks |
| `mockup-redesign.html` | Standalone mockup with matching responsive behavior |
