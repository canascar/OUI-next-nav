---
inclusion: always
---

## Component and Asset Rules

- Use only the OUI v9 theme (light and dark variants: `v9-light`, `v9-dark`). Do not use legacy themes.
- Theme SCSS imports live under `src/themes/v9/`. Reference `v9_colors_light` and `v9_colors_dark` for color tokens.
- Never invent custom components, colors, fonts, or design tokens. Only use what already exists in the OUI library (`src/components/`, `src/themes/`).
- Never create or hand-draw SVG icons. Only use existing icons from `src/components/icon/assets/`. If a needed icon does not exist, flag it rather than fabricating one.
- When building or updating sample pages, ensure they render correctly under both `v9-light` and `v9-dark` themes.
