# Requirements Document

## Introduction

This feature adds drag-and-drop customization to the left navigation bar in the sample pages. Users can enter a customization mode by clicking the "Customize navigation bar" button in the More popover. In this mode, all navigation items except Search and Thread become draggable, allowing users to reorder items within the main nav, reorder items within the More popover, and move items between the two zones. The customized arrangement persists across sessions.

## Glossary

- **Left_Nav**: The narrow icon-centric navigation sidebar (`SamplePagesLeftNav` component, 72px wide) that displays navigation items vertically.
- **Nav_Item**: A clickable button in the Left_Nav representing a navigation destination (e.g., Discover, APM). Rendered from the `NAV_ITEMS` array.
- **Fixed_Item**: A Nav_Item that cannot be dragged or reordered. Search and Thread are Fixed_Items.
- **Draggable_Item**: A Nav_Item that can be repositioned via drag-and-drop when Customize_Mode is active. All Nav_Items except Fixed_Items are Draggable_Items.
- **More_Popover**: The popover triggered by the More nav item, containing overflow navigation items (Alerts, Dashboards, Skills, Manage workspace).
- **Customize_Mode**: The UI state entered when the user clicks "Customize navigation bar", enabling drag-and-drop reordering of Draggable_Items.
- **Main_Zone**: The region of the Left_Nav below the Fixed_Items where Draggable_Items are displayed as icon buttons.
- **Overflow_Zone**: The list of items inside the More_Popover that are not shown in the Main_Zone.
- **Drop_Indicator**: A visual cue shown during a drag operation to indicate where the dragged item will be placed upon release.
- **Nav_Layout**: The persisted data structure that records the current arrangement of Draggable_Items across the Main_Zone and Overflow_Zone.

## Requirements

### Requirement 1: Enter Customize Mode

**User Story:** As a user, I want to click "Customize navigation bar" to enter a drag-and-drop editing mode, so that I can rearrange my navigation items.

#### Acceptance Criteria

1. WHEN the user clicks the "Customize navigation bar" button in the More_Popover, THE Left_Nav SHALL enter Customize_Mode and close the More_Popover.
2. WHILE Customize_Mode is active, THE Left_Nav SHALL display a visible indicator (e.g., a distinct background or border) to communicate that customization is in progress.
3. WHILE Customize_Mode is active, THE Left_Nav SHALL display a "Done" button that allows the user to exit Customize_Mode.

### Requirement 2: Fixed Items Remain Non-Draggable

**User Story:** As a user, I want Search and Thread to always stay at the top of the navigation, so that I can always find them in a consistent location.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, THE Left_Nav SHALL keep Search and Thread Fixed_Items at the top of the navigation in their original order.
2. WHILE Customize_Mode is active, THE Left_Nav SHALL prevent Search and Thread Fixed_Items from being dragged, reordered, or moved to the Overflow_Zone.
3. WHILE Customize_Mode is active, THE Left_Nav SHALL visually distinguish Fixed_Items from Draggable_Items (e.g., by not showing drag handles on Fixed_Items).

### Requirement 3: Drag and Reorder Within Main Zone

**User Story:** As a user, I want to drag navigation items to reorder them in the main nav, so that I can prioritize the tools I use most.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, WHEN the user initiates a drag on a Draggable_Item in the Main_Zone, THE Left_Nav SHALL allow the item to be repositioned among other Draggable_Items in the Main_Zone.
2. WHILE Customize_Mode is active, WHEN a Draggable_Item is being dragged within the Main_Zone, THE Left_Nav SHALL display a Drop_Indicator at the prospective drop position.
3. WHILE Customize_Mode is active, WHEN the user drops a Draggable_Item at a new position in the Main_Zone, THE Left_Nav SHALL update the item order to reflect the new arrangement.

### Requirement 4: Drag and Reorder Within Overflow Zone

**User Story:** As a user, I want to reorder items inside the More popover, so that I can organize my less-used tools.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, WHEN the user initiates a drag on a Draggable_Item in the Overflow_Zone, THE More_Popover SHALL allow the item to be repositioned among other Draggable_Items in the Overflow_Zone.
2. WHILE Customize_Mode is active, WHEN a Draggable_Item is being dragged within the Overflow_Zone, THE More_Popover SHALL display a Drop_Indicator at the prospective drop position.
3. WHILE Customize_Mode is active, WHEN the user drops a Draggable_Item at a new position in the Overflow_Zone, THE More_Popover SHALL update the item order to reflect the new arrangement.

### Requirement 5: Move Items Between Main Zone and Overflow Zone

**User Story:** As a user, I want to drag items from the main nav into the More popover and vice versa, so that I can choose which tools are always visible.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, WHEN the user drags a Draggable_Item from the Main_Zone and drops it into the Overflow_Zone, THE Left_Nav SHALL remove the item from the Main_Zone and add it to the Overflow_Zone at the drop position.
2. WHILE Customize_Mode is active, WHEN the user drags a Draggable_Item from the Overflow_Zone and drops it into the Main_Zone, THE Left_Nav SHALL remove the item from the Overflow_Zone and add it to the Main_Zone at the drop position.
3. WHILE Customize_Mode is active, WHEN a Draggable_Item is dragged between zones, THE Left_Nav SHALL display a Drop_Indicator in the target zone to show the prospective placement.

### Requirement 6: Exit Customize Mode

**User Story:** As a user, I want to finish customizing and return to normal navigation, so that I can use my newly arranged nav.

#### Acceptance Criteria

1. WHEN the user clicks the "Done" button, THE Left_Nav SHALL exit Customize_Mode and return to normal navigation behavior.
2. WHEN the user exits Customize_Mode, THE Left_Nav SHALL render all Nav_Items in the arrangement established during Customize_Mode.
3. WHEN the user exits Customize_Mode, THE Left_Nav SHALL remove all customization-specific visual indicators (e.g., drag handles, distinct background).

### Requirement 7: Persist Navigation Layout

**User Story:** As a user, I want my customized navigation arrangement to be saved, so that I do not have to reconfigure it every time I reload the page.

#### Acceptance Criteria

1. WHEN the user exits Customize_Mode, THE Left_Nav SHALL persist the current Nav_Layout to browser local storage.
2. WHEN the Left_Nav component mounts, THE Left_Nav SHALL read the Nav_Layout from local storage and render items according to the persisted arrangement.
3. IF the persisted Nav_Layout is missing or corrupted, THEN THE Left_Nav SHALL fall back to the default NAV_ITEMS order.
4. IF the persisted Nav_Layout references items that no longer exist in NAV_ITEMS, THEN THE Left_Nav SHALL discard unknown items and use the default order for any new items not present in the persisted layout.

### Requirement 8: Visual Feedback During Drag

**User Story:** As a user, I want clear visual feedback while dragging, so that I understand where my item will land.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, THE Left_Nav SHALL display a drag handle icon on each Draggable_Item to indicate it can be dragged.
2. WHEN a Draggable_Item drag operation begins, THE Left_Nav SHALL apply a visual style to the dragged item (e.g., reduced opacity or elevation) to distinguish it from stationary items.
3. WHEN a Draggable_Item drag operation ends without a valid drop target, THE Left_Nav SHALL return the item to its original position.

### Requirement 9: Theme Compatibility

**User Story:** As a user, I want the drag-and-drop customization to look correct in both light and dark themes, so that the experience is consistent regardless of my theme preference.

#### Acceptance Criteria

1. THE Left_Nav SHALL render all Customize_Mode visual elements (drag handles, Drop_Indicators, mode indicators) correctly under the v9-light theme.
2. THE Left_Nav SHALL render all Customize_Mode visual elements (drag handles, Drop_Indicators, mode indicators) correctly under the v9-dark theme.
3. THE Left_Nav SHALL use only existing OUI design tokens and components for all Customize_Mode styling.

### Requirement 10: Accessibility in Customize Mode

**User Story:** As a user relying on assistive technology, I want to be able to customize the navigation using keyboard controls, so that the feature is accessible to all users.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, THE Left_Nav SHALL allow Draggable_Items to receive keyboard focus via the Tab key.
2. WHILE Customize_Mode is active, WHEN a Draggable_Item has focus, THE Left_Nav SHALL allow the user to pick up the item using Enter or Space, move it using Arrow keys, and drop it using Enter or Space.
3. WHILE Customize_Mode is active, THE Left_Nav SHALL announce drag-and-drop state changes (pick up, move, drop) via ARIA live regions so screen readers convey the current status.
