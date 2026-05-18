# Implementation Plan: Checkbox Nav Customization

## Overview

Replace drag-and-drop nav customization with a checkbox-based approach. Users enter customize mode from the More popover, toggle checkboxes to control which items appear in the main nav vs. the More popover, and click Done to save. Layout persists to localStorage.

## Tasks

- [x] 1. Create/update nav layout utility module
  - [x] 1.1 Create `nav_layout_utils.js` with constants and data definitions
    - Create `src-docs/src/views/sample_pages/nav_layout_utils.js` (or update if it exists from draggable spec)
    - Define `STORAGE_KEY = 'samplePagesNavLayout'` and `FIXED_KEYS = ['search', 'thread']`
    - Define `ALL_DRAGGABLE_ITEMS` array with key, label, icon for: discover, service, alerts, dashboards, skills, manage-workspace
    - Define `DEFAULT_MAIN_KEYS = ['discover', 'service']` and `DEFAULT_OVERFLOW_KEYS = ['alerts', 'dashboards', 'skills', 'manage-workspace']`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.2 Implement `toggleItemZone` function
    - Export `toggleItemZone(key, mainKeys, overflowKeys, allDraggableItems)` returning `{ mainKeys, overflowKeys }`
    - If key is in mainKeys, move it to overflowKeys; if in overflowKeys, move it to mainKeys
    - Preserve canonical order from `ALL_DRAGGABLE_ITEMS` in both arrays
    - Reject toggle attempts on keys in `FIXED_KEYS` (return unchanged layout)
    - Do not mutate input arrays
    - _Requirements: 2.1, 2.2, 3.3_

  - [x] 1.3 Implement `validateLayout` function
    - Export `validateLayout(stored, allDraggableItems)` returning `{ mainKeys, overflowKeys }`
    - Filter out keys from stored layout that don't exist in allDraggableItems
    - Append any new keys (in allDraggableItems but not in stored) to overflowKeys
    - Ensure no duplicates across mainKeys and overflowKeys
    - _Requirements: 6.3, 6.4_

  - [x] 1.4 Implement `saveLayout` and `loadLayout` functions
    - `saveLayout(mainKeys, overflowKeys)`: JSON.stringify and write to localStorage under STORAGE_KEY, wrapped in try/catch
    - `loadLayout(allDraggableItems)`: read from localStorage, JSON.parse, call validateLayout, return result. On any error, return default layout
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.5 Write property tests for nav layout utilities
    - [x] 1.5.1 Property test: Toggle moves item between zones
      - Use fast-check to generate random valid partitions of ALL_DRAGGABLE_ITEMS keys and a random key
      - Assert toggled key moves to the other zone, combined set unchanged, canonical order preserved
      - Minimum 100 iterations
      - Tag: `Feature: checkbox-nav-customization, Property 1: Toggle moves item between zones`
      - **Validates: Requirements 2.1, 2.2**
    - [x] 1.5.2 Property test: Fixed items invariant
      - Use fast-check to generate random sequences of toggle operations (1-20 ops) on random starting layouts
      - Assert fixed keys never appear in overflowKeys after any sequence of toggles
      - Minimum 100 iterations
      - Tag: `Feature: checkbox-nav-customization, Property 2: Fixed items invariant`
      - **Validates: Requirements 3.2, 3.3**
    - [x] 1.5.3 Property test: Checkbox-layout round-trip
      - Use fast-check to generate random valid partitions of ALL_DRAGGABLE_ITEMS keys
      - Assert initializing checkedKeys from mainKeys then deriving layout from checkedKeys produces original layout
      - Minimum 100 iterations
      - Tag: `Feature: checkbox-nav-customization, Property 3: Checkbox-layout round-trip`
      - **Validates: Requirements 1.5, 5.4**
    - [x] 1.5.4 Property test: Persistence round-trip
      - Use fast-check to generate random partitions of ALL_DRAGGABLE_ITEMS keys into mainKeys and overflowKeys
      - Assert loadLayout after saveLayout returns equivalent layout
      - Minimum 100 iterations
      - Tag: `Feature: checkbox-nav-customization, Property 4: Persistence round-trip`
      - **Validates: Requirements 6.1, 6.2**
    - [x] 1.5.5 Property test: Layout validation handles stale data
      - Use fast-check to generate stored layouts with unknown keys added and current keys removed
      - Assert validateLayout output contains exactly current draggable keys, unknown discarded, new keys in overflow
      - Minimum 100 iterations
      - Tag: `Feature: checkbox-nav-customization, Property 5: Layout validation handles stale data`
      - **Validates: Requirements 6.4**

- [x] 2. Add customize mode state and entry/exit to SamplePagesLeftNav
  - [x] 2.1 Add customize mode state and layout initialization
    - In `sample_pages_left_nav.js`, add state: `isCustomizing`, `mainItems`, `overflowItems`, `checkedKeys`
    - On component mount, call `loadLayout(ALL_DRAGGABLE_ITEMS)` to initialize `mainItems` and `overflowItems`
    - Derive rendered nav items from `mainItems` (with fixed items prepended) instead of hardcoded `NAV_ITEMS` when layout is loaded
    - _Requirements: 6.2, 6.3_

  - [x] 2.2 Implement enter customize mode
    - Add `onEnterCustomize` callback prop to MorePanelContent
    - On "Customize navigation bar" click: set `isCustomizing` to true, initialize `checkedKeys` from current `mainItems` keys, close More popover
    - _Requirements: 1.1, 1.5_

  - [x] 2.3 Implement customize mode rendering with checkboxes
    - When `isCustomizing` is true, render all items from `ALL_DRAGGABLE_ITEMS` in canonical order
    - Fixed items (Search, Thread) render without checkboxes, with `--fixed` modifier class
    - Each draggable item renders with `OuiCheckbox` to the right, checked state from `checkedKeys`
    - Hide the More nav item from the list
    - On checkbox change: add/remove key from `checkedKeys` set
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 3.1, 3.2, 4.1_

  - [x] 2.4 Implement exit customize mode (Done button)
    - Render a "Done" button (`OuiButtonEmpty`) at the bottom of the middle area when `isCustomizing` is true
    - On Done click: derive mainKeys from checkedKeys (canonical order), derive overflowKeys as complement
    - Call `saveLayout(mainKeys, overflowKeys)`, update `mainItems`/`overflowItems` state, set `isCustomizing` to false
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1_

  - [x] 2.5 Implement More button visibility logic
    - After exiting customize mode, show More nav item only if `overflowItems.length > 0`
    - If all items are checked (overflow empty), hide the More button entirely
    - _Requirements: 4.2, 4.3_

- [x] 3. Add customize mode styles
  - [x] 3.1 Add `--customizing` width transition styles
    - Add `samplePagesLeftNav--customizing` class with `width: 96px; min-width: 96px` and CSS transition
    - Ensure transition animates smoothly on enter and exit
    - Use existing OUI design tokens only
    - _Requirements: 1.2, 5.3, 7.1, 7.2, 7.3_

  - [x] 3.2 Add checkbox item layout styles
    - Style each customize-mode item row: icon + label + checkbox in a horizontal layout within 96px
    - Add `samplePagesLeftNav__navItem--fixed` class for fixed items (no checkbox, slightly muted)
    - Add `samplePagesLeftNav__customizeCheckbox` class for checkbox positioning
    - Use existing OUI design tokens only
    - _Requirements: 1.4, 2.3, 3.1, 7.3_

  - [x] 3.3 Add Done button styles
    - Style the Done button at the bottom of the middle area
    - Ensure it fits within the 96px customizing width
    - Use existing OUI design tokens only
    - _Requirements: 5.1, 7.3_

- [x] 4. Write unit tests for UI behavior
  - [x] 4.1 Write unit tests for customize mode entry/exit
    - Test: clicking "Customize navigation bar" sets isCustomizing to true and closes popover
    - Test: clicking "Done" sets isCustomizing to false and removes customize UI
    - Test: customize mode applies the `--customizing` CSS class
    - Test: exiting customize mode removes the `--customizing` CSS class
    - _Requirements: 1.1, 5.2, 5.3, 5.5_

  - [x] 4.2 Write unit tests for checkbox behavior and fixed items
    - Test: fixed items (Search, Thread) do not render checkboxes in customize mode
    - Test: More nav item is hidden during customize mode
    - Test: checkbox initial state matches current mainKeys/overflowKeys
    - Test: toggling a checkbox updates checkedKeys state
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 3.1, 4.1_

  - [x] 4.3 Write unit tests for layout persistence edge cases
    - Test: empty localStorage loads default layout
    - Test: malformed JSON in localStorage loads default layout
    - Test: layout with unknown keys discards them and adds new keys to overflow
    - _Requirements: 6.3, 6.4_

  - [x] 4.4 Write unit tests for accessibility
    - Test: checkboxes are focusable via Tab
    - Test: checkboxes have associated labels with nav item names
    - Test: Done button is reachable via Tab
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 4.5 Write property test: More button visibility matches overflow state
    - Use fast-check to generate random valid partitions of ALL_DRAGGABLE_ITEMS keys
    - Assert More button visible iff overflowKeys.length > 0
    - Minimum 100 iterations
    - Tag: `Feature: checkbox-nav-customization, Property 6: More button visibility matches overflow state`
    - **Validates: Requirements 4.2, 4.3**

- [x] 5. Final checkpoint
  - Verify all tests pass and the feature works end-to-end in both v9-light and v9-dark themes. Ask the user if questions arise.

## Notes

- All SCSS uses existing OUI design tokens only (per component.md steering rules)
- The `nav_layout_utils.js` module is pure functions with no React dependency, making property tests straightforward
- Property tests use `fast-check` library (already installed)
- Fixed items (Search, Thread) are never part of the customizable set — `toggleItemZone` rejects them
- The "More" nav item is structural, not customizable — hidden during customize mode, shown/hidden based on overflow state after exit
- Unlike the draggable spec, items are NOT reorderable — order is always canonical from `ALL_DRAGGABLE_ITEMS`
- `OuiCheckbox` provides built-in keyboard support (Tab, Space, Enter) and theme compatibility
