# Implementation Plan: Draggable Nav Customization

## Overview

Add drag-and-drop customization to the SamplePagesLeftNav component. Users enter customize mode from the More popover, reorder or move nav items between the main zone and overflow zone using HTML5 DnD or keyboard, and persist the layout to localStorage.

## Tasks

- [ ] 1. Create nav layout utility module
  - [x] 1.1 Create `nav_layout_utils.js` with constants and data definitions
    - Create `src-docs/src/views/sample_pages/nav_layout_utils.js`
    - Define `STORAGE_KEY = 'samplePagesNavLayout'` and `FIXED_KEYS = ['search', 'thread']`
    - Define `ALL_DRAGGABLE_ITEMS` array with key, label, icon for: discover, service, alerts, dashboards, skills, manage-workspace
    - Define `DEFAULT_MAIN_KEYS = ['discover', 'service']` and `DEFAULT_OVERFLOW_KEYS = ['alerts', 'dashboards', 'skills', 'manage-workspace']`
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 1.2 Implement `reorderItems` function
    - Export `reorderItems(items, fromIndex, toIndex)` that returns a new array with the element moved
    - Use array splice logic: remove from fromIndex, insert at toIndex
    - Do not mutate the input array
    - _Requirements: 3.1, 3.3, 4.1, 4.3_

  - [x] 1.3 Implement `moveItemBetweenZones` function
    - Export `moveItemBetweenZones(sourceItems, sourceIndex, targetItems, targetIndex)` returning `{ source, target }`
    - Remove item from sourceItems at sourceIndex, insert into targetItems at targetIndex
    - Do not mutate input arrays
    - _Requirements: 5.1, 5.2_

  - [x] 1.4 Implement `validateLayout` function
    - Export `validateLayout(stored, allDraggableItems)` returning `{ mainKeys, overflowKeys }`
    - Filter out keys from stored layout that don't exist in allDraggableItems
    - Append any new keys (in allDraggableItems but not in stored) to overflowKeys
    - Ensure no duplicates across mainKeys and overflowKeys
    - _Requirements: 7.3, 7.4_

  - [x] 1.5 Implement `saveLayout` and `loadLayout` functions
    - `saveLayout(mainKeys, overflowKeys)`: JSON.stringify and write to localStorage under STORAGE_KEY, wrapped in try/catch
    - `loadLayout(allDraggableItems)`: read from localStorage, JSON.parse, call validateLayout, return result. On any error, return default layout
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 1.6 Write property tests for nav layout utilities
    - [-] 1.6.1 Property test: Reorder preserves elements
      - Use fast-check to generate random arrays of unique strings (length 2-10) and random valid fromIndex/toIndex
      - Assert result contains same elements, element at fromIndex is now at toIndex
      - Minimum 100 iterations
      - Tag: `Feature: draggable-nav-customization, Property 2: Reorder preserves elements`
      - **Validates: Requirements 3.1, 3.3, 4.1, 4.3**
    - [~] 1.6.2 Property test: Cross-zone move correctness
      - Use fast-check to generate two random arrays of unique strings and valid indices
      - Assert moved item removed from source, inserted at targetIndex in target, combined elements unchanged
      - Minimum 100 iterations
      - Tag: `Feature: draggable-nav-customization, Property 3: Cross-zone move correctness`
      - **Validates: Requirements 5.1, 5.2**
    - [~] 1.6.3 Property test: Layout persistence round-trip
      - Use fast-check to generate random partitions of ALL_DRAGGABLE_ITEMS keys into mainKeys and overflowKeys
      - Assert loadLayout after saveLayout returns equivalent layout
      - Minimum 100 iterations
      - Tag: `Feature: draggable-nav-customization, Property 4: Layout persistence round-trip`
      - **Validates: Requirements 6.2, 7.1, 7.2**
    - [~] 1.6.4 Property test: Layout validation handles stale data
      - Use fast-check to generate stored layouts with unknown keys added and current keys removed
      - Assert validateLayout output contains exactly current draggable keys, unknown discarded, new keys in overflow
      - Minimum 100 iterations
      - Tag: `Feature: draggable-nav-customization, Property 5: Layout validation handles stale data`
      - **Validates: Requirements 7.4**

- [ ] 2. Add customize mode state and entry/exit to SamplePagesLeftNav
  - [~] 2.1 Add customize mode state and layout initialization
    - In `sample_pages_left_nav.js`, add state: `isCustomizing`, `mainItems`, `overflowItems`
    - On component mount, call `loadLayout(ALL_DRAGGABLE_ITEMS)` to initialize `mainItems` and `overflowItems`
    - Derive rendered nav items from `mainItems` (with fixed items prepended) instead of hardcoded `NAV_ITEMS` when layout is loaded
    - _Requirements: 7.2, 7.3_

  - [~] 2.2 Implement enter customize mode
    - Add click handler to "Customize navigation bar" button in MorePanelContent
    - On click: set `isCustomizing` to true, close the More popover
    - Pass `onEnterCustomize` callback prop to MorePanelContent
    - _Requirements: 1.1_

  - [~] 2.3 Implement exit customize mode
    - When `isCustomizing` is true, render a "Done" button below the nav items
    - On "Done" click: call `saveLayout(mainKeys, overflowKeys)`, set `isCustomizing` to false
    - _Requirements: 1.3, 6.1, 6.2, 6.3, 7.1_

  - [~] 2.4 Add customize mode visual indicator styles
    - Add `samplePagesLeftNav--customizing` class to nav wrapper when `isCustomizing` is true
    - In `_sample_pages_left_nav.scss`, add styles for this class (subtle background tint or dashed border)
    - Add `samplePagesLeftNav__navItem--fixed` class for fixed items (no drag handle, slightly muted)
    - Use only existing OUI design tokens (`$ouiBorderColor`, `$ouiColorLightestShade`, etc.)
    - _Requirements: 1.2, 2.3, 9.1, 9.2, 9.3_

- [ ] 3. Implement drag-and-drop within main zone
  - [~] 3.1 Add drag handles and draggable attribute to main zone items
    - When `isCustomizing` is true, render `OuiIcon type="grab"` on each draggable item in the main zone
    - Set `draggable="true"` on draggable items, do NOT set it on fixed items (Search, Thread)
    - Add `samplePagesLeftNav__dragHandle` class for the grab icon styling
    - _Requirements: 2.2, 8.1_

  - [~] 3.2 Implement HTML5 DnD handlers for main zone reordering
    - Add `dragState` state: `{ draggedKey, sourceZone, dropTargetIndex, dropTargetZone }`
    - `handleDragStart(e, key, 'main')`: set draggedKey and sourceZone, set drag image
    - `handleDragOver(e, index, 'main')`: preventDefault, update dropTargetIndex/dropTargetZone
    - `handleDrop(e, index, 'main')`: call `reorderItems`, update `mainItems` state
    - `handleDragEnd(e)`: reset dragState to null values (cancelled drag = no-op)
    - _Requirements: 3.1, 3.3, 8.3_

  - [~] 3.3 Add drop indicator styles
    - Add `samplePagesLeftNav__dropIndicator` class for the visual drop line
    - Render a thin horizontal line (2px, `$ouiColorPrimary`) at `dropTargetIndex` position when dragging
    - Style the dragged item with reduced opacity (`0.4`) via `samplePagesLeftNav__navItem--dragging` class
    - _Requirements: 3.2, 8.2_

  - [~] 3.4 Write property test: Fixed items invariant
    - Use fast-check to generate random sequences of reorder operations on the main zone
    - After each sequence, assert fixed items (search, thread) are at positions 0 and 1, never in overflow
    - Minimum 100 iterations
    - Tag: `Feature: draggable-nav-customization, Property 1: Fixed items invariant`
    - **Validates: Requirements 2.1, 2.2**

  - [~] 3.5 Write property test: Cancelled drag is a no-op
    - Use fast-check to generate random layout states and random dragStart events
    - Assert that calling handleDragEnd without handleDrop leaves layout unchanged
    - Minimum 100 iterations
    - Tag: `Feature: draggable-nav-customization, Property 6: Cancelled drag is a no-op`
    - **Validates: Requirements 8.3**

- [ ] 4. Implement drag-and-drop within overflow zone and cross-zone moves
  - [~] 4.1 Make overflow zone items draggable in customize mode
    - When `isCustomizing` is true, render the More popover with draggable overflow items instead of the static MorePanelContent
    - Each overflow item gets `draggable="true"`, a `grab` icon, and the same DnD handlers (with zone='overflow')
    - Keep the More popover open during customize mode when the user clicks the More button
    - _Requirements: 4.1, 8.1_

  - [~] 4.2 Implement DnD handlers for overflow zone reordering
    - Reuse `handleDragOver`, `handleDrop`, `handleDragEnd` with zone='overflow'
    - On drop within overflow: call `reorderItems` on `overflowItems`, update state
    - Add drop indicator rendering inside the overflow popover
    - _Requirements: 4.1, 4.2, 4.3_

  - [~] 4.3 Implement cross-zone drag and drop
    - When `sourceZone !== dropTargetZone` on drop, call `moveItemBetweenZones`
    - Update both `mainItems` and `overflowItems` state from the result
    - Show drop indicator in the target zone during dragOver
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5. Implement keyboard accessibility for reordering
  - [~] 5.1 Add keyboard reorder handlers
    - Add `keyboardReorderState` state: `{ pickedUpKey, pickedUpZone, currentIndex }`
    - On Enter/Space when focused on a draggable item: toggle pick-up state
    - On ArrowUp/ArrowDown while picked up: move item position (clamp at boundaries)
    - On Enter/Space while picked up: drop item at current position, clear keyboard state
    - On Escape while picked up: cancel and return to original position
    - _Requirements: 10.1, 10.2_

  - [~] 5.2 Add ARIA live region for screen reader announcements
    - Add a visually hidden `<div role="status" aria-live="polite">` to the nav
    - Update its text content on pick up ("Picked up [item], position [n] of [total]")
    - Update on move ("Moved to position [n] of [total]")
    - Update on drop ("Dropped [item] at position [n]")
    - Update on cancel ("Reorder cancelled, [item] returned to position [n]")
    - _Requirements: 10.3_

  - [~] 5.3 Write property test: Keyboard reorder equivalence
    - Use fast-check to generate random arrays, random start index, random number of arrow presses
    - Assert keyboard reorder result equals reorderItems(items, startIndex, clamp(startIndex + n))
    - Minimum 100 iterations
    - Tag: `Feature: draggable-nav-customization, Property 7: Keyboard reorder equivalence`
    - **Validates: Requirements 10.2**

- [ ] 6. Write unit tests for UI behavior
  - [~] 6.1 Write unit tests for customize mode entry/exit and visual indicators
    - Test: clicking "Customize navigation bar" sets isCustomizing to true and closes popover
    - Test: clicking "Done" sets isCustomizing to false and removes customize UI
    - Test: customize mode applies the `--customizing` CSS class
    - Test: fixed items do not have `draggable` attribute in customize mode
    - Test: draggable items show grab icon in customize mode
    - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3, 6.1, 6.3, 8.1_

  - [~] 6.2 Write unit tests for layout persistence edge cases
    - Test: empty localStorage loads default layout
    - Test: malformed JSON in localStorage loads default layout
    - Test: layout with unknown keys discards them and adds new keys to overflow
    - Test: ARIA live region updates on keyboard pick up/move/drop
    - _Requirements: 7.3, 7.4, 10.3_

- [ ] 7. Final checkpoint
  - Verify all tests pass and the feature works end-to-end in both v9-light and v9-dark themes. Ask the user if questions arise.

## Notes

- The `grab` icon exists at `src/components/icon/assets/grab.svg` — no custom SVGs needed
- All SCSS uses existing OUI design tokens only (per component.md steering rules)
- The `nav_layout_utils.js` module is pure functions with no React dependency, making property tests straightforward
- Property tests use `fast-check` library
- Fixed items (Search, Thread) are never part of the draggable/reorderable set
- The "More" nav item itself is not draggable — it's always the last item and serves as the overflow trigger
