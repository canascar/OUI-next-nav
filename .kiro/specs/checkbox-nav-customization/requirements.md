# Requirements Document

## Introduction

This feature replaces the previous drag-and-drop navigation customization approach with a simpler checkbox-based interaction. When the user clicks "Customize navigation bar", the Left_Nav enters a Customize_Mode where the sidebar widens by 24px, all navigation items (both main nav and More popover items) are displayed inline with checkboxes, and the user toggles items on or off to control which appear in the main nav versus the More popover. A "Done" button in the middle area saves changes and exits Customize_Mode.

## Glossary

- **Left_Nav**: The narrow icon-centric navigation sidebar (`SamplePagesLeftNav` component, 72px wide in normal mode) that displays navigation items vertically.
- **Nav_Item**: A navigation destination displayed in the Left_Nav or the More_Popover (e.g., Discover, APM, Alerts, Dashboards, Skills, Manage workspace).
- **Main_Nav_Item**: A Nav_Item currently visible as an icon button in the Left_Nav (default: Search, Thread, Discover, APM, More).
- **Overflow_Item**: A Nav_Item currently housed inside the More_Popover and not directly visible in the Left_Nav (default: Alerts, Dashboards, Skills, Manage workspace).
- **More_Popover**: The popover triggered by the More nav item, containing Overflow_Items and the "Customize navigation bar" button.
- **Customize_Mode**: The UI state entered when the user clicks "Customize navigation bar". The Left_Nav widens, all Nav_Items are listed with checkboxes, and a Done button is shown.
- **Checkbox**: An OUI-based toggle control displayed to the right of each Nav_Item during Customize_Mode, indicating whether the item is visible in the main nav (checked) or relegated to the More_Popover (unchecked).
- **Done_Button**: A button displayed at the bottom of the middle area of the Left_Nav during Customize_Mode that saves the current checkbox selections and exits Customize_Mode.
- **Nav_Layout**: The persisted data structure recording which Nav_Items are checked (main nav) and which are unchecked (overflow).

## Requirements

### Requirement 1: Enter Customize Mode

**User Story:** As a user, I want to click "Customize navigation bar" to enter a checkbox-based editing mode, so that I can choose which navigation items appear in my main nav.

#### Acceptance Criteria

1. WHEN the user clicks the "Customize navigation bar" button in the More_Popover, THE Left_Nav SHALL enter Customize_Mode and close the More_Popover.
2. WHEN the Left_Nav enters Customize_Mode, THE Left_Nav SHALL increase its width by 24px (from 72px to 96px).
3. WHEN the Left_Nav enters Customize_Mode, THE Left_Nav SHALL display all Nav_Items (both Main_Nav_Items and Overflow_Items) as a single list in the nav area.
4. WHEN the Left_Nav enters Customize_Mode, THE Left_Nav SHALL display a Checkbox to the right of each Nav_Item.
5. WHEN the Left_Nav enters Customize_Mode, THE Left_Nav SHALL check the Checkbox for each item currently visible in the main nav and uncheck the Checkbox for each item currently in the More_Popover.

### Requirement 2: Checkbox State Reflects Visibility

**User Story:** As a user, I want checked items to appear in my main nav and unchecked items to go into the More popover, so that I have clear control over my navigation layout.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, WHEN the user checks an unchecked Nav_Item, THE Left_Nav SHALL mark that item for inclusion in the main nav.
2. WHILE Customize_Mode is active, WHEN the user unchecks a checked Nav_Item, THE Left_Nav SHALL mark that item for inclusion in the More_Popover.
3. WHILE Customize_Mode is active, THE Left_Nav SHALL visually distinguish checked items from unchecked items through the Checkbox state.

### Requirement 3: Fixed Items in Customize Mode

**User Story:** As a user, I want Search and Thread to always remain in the main nav, so that I can always find them in a consistent location.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, THE Left_Nav SHALL display Search and Thread items without Checkboxes.
2. WHILE Customize_Mode is active, THE Left_Nav SHALL keep Search and Thread at the top of the item list in their original order.
3. THE Left_Nav SHALL prevent Search and Thread from being moved to the More_Popover.

### Requirement 4: More Nav Item in Customize Mode

**User Story:** As a user, I want the More button to remain accessible, so that the overflow mechanism continues to work after customization.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, THE Left_Nav SHALL hide the More nav item from the customize list (the More button is a structural element, not a customizable Nav_Item).
2. WHEN the user exits Customize_Mode, THE Left_Nav SHALL display the More nav item in its standard position if any unchecked items exist.
3. IF all customizable Nav_Items are checked, THEN THE Left_Nav SHALL hide the More nav item (since no items remain in the overflow).

### Requirement 5: Done Button and Exit Customize Mode

**User Story:** As a user, I want to click a Done button to save my selections and return to normal navigation, so that my changes take effect.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, THE Left_Nav SHALL display a Done_Button at the bottom of the middle area of the Left_Nav.
2. WHEN the user clicks the Done_Button, THE Left_Nav SHALL exit Customize_Mode and return to normal navigation behavior.
3. WHEN the user exits Customize_Mode, THE Left_Nav SHALL restore the nav width to 72px.
4. WHEN the user exits Customize_Mode, THE Left_Nav SHALL render checked items as Main_Nav_Items in the Left_Nav and unchecked items as Overflow_Items in the More_Popover.
5. WHEN the user exits Customize_Mode, THE Left_Nav SHALL remove all Customize_Mode visual elements (checkboxes, expanded item list, Done_Button).

### Requirement 6: Persist Navigation Layout

**User Story:** As a user, I want my customized navigation selections to be saved, so that I do not have to reconfigure them every time I reload the page.

#### Acceptance Criteria

1. WHEN the user exits Customize_Mode via the Done_Button, THE Left_Nav SHALL persist the current Nav_Layout to browser local storage.
2. WHEN the Left_Nav component mounts, THE Left_Nav SHALL read the Nav_Layout from local storage and render items according to the persisted selections.
3. IF the persisted Nav_Layout is missing or corrupted, THEN THE Left_Nav SHALL fall back to the default item arrangement.
4. IF the persisted Nav_Layout references items that no longer exist in the codebase, THEN THE Left_Nav SHALL discard unknown items and place any new items not present in the persisted layout into the overflow.

### Requirement 7: Theme Compatibility

**User Story:** As a user, I want the checkbox customization mode to look correct in both light and dark themes, so that the experience is consistent regardless of my theme preference.

#### Acceptance Criteria

1. THE Left_Nav SHALL render all Customize_Mode visual elements (checkboxes, item list, Done_Button, widened nav) correctly under the v9-light theme.
2. THE Left_Nav SHALL render all Customize_Mode visual elements (checkboxes, item list, Done_Button, widened nav) correctly under the v9-dark theme.
3. THE Left_Nav SHALL use only existing OUI design tokens and components for all Customize_Mode styling.

### Requirement 8: Accessibility in Customize Mode

**User Story:** As a user relying on assistive technology, I want to be able to toggle navigation items using keyboard controls, so that the feature is accessible to all users.

#### Acceptance Criteria

1. WHILE Customize_Mode is active, THE Left_Nav SHALL allow each Checkbox to receive keyboard focus via the Tab key.
2. WHILE Customize_Mode is active, WHEN a Checkbox has focus, THE Left_Nav SHALL allow the user to toggle the Checkbox using Enter or Space.
3. WHILE Customize_Mode is active, THE Left_Nav SHALL associate each Checkbox with a visible label identifying the Nav_Item name.
4. WHILE Customize_Mode is active, THE Done_Button SHALL be reachable via keyboard Tab navigation.
