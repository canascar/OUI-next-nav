# Requirements Document

## Introduction

Add a "Sample Pages" button to the OUI documentation site header (`GuidePageHeader`). Clicking the button navigates to a dedicated page that showcases sample pages — starting with Service — built entirely with OUI components and styles. The sample pages are presented with a left-side navigation (following the Figma design at `figma.com/design/V2RvjK3B8xtOHfXHRL2xaF`, node `9917:47781`) that lists Service, Discover, and Thread. Only the Service page is fully implemented; Discover and Thread appear in the nav but render placeholder content. Because the pages import OUI components directly from source, any component or style change is automatically reflected via webpack HMR.

## Glossary

- **Doc_Site**: The OpenSearch UI (OUI) documentation and component library website (`src-docs`).
- **GuidePageHeader**: The fixed top header component of the Doc_Site containing the logo, theme selector, and external links (`guide_page_header.tsx`).
- **Sample_Pages_View**: The new top-level page containing the left navigation and the sample page content area.
- **Left_Nav**: A side navigation panel within the Sample_Pages_View that follows the Figma design — includes a header with logo and collapse button, a search bar, nav items (Services, Discover, Threads), and a footer with icon buttons and avatar.
- **Service_Page**: A sample page demonstrating OUI components in a service-oriented layout (fully implemented).
- **Discover_Page**: A placeholder page shown when "Discover" is selected in the Left_Nav (not yet implemented).
- **Thread_Page**: A placeholder page shown when "Threads" is selected in the Left_Nav (not yet implemented).
- **OUI_Components**: React components imported directly from the OUI source (`src/components`).
- **V9_Theme**: The OpenSearch UI v9 light and dark theme variants (`v9-light`, `v9-dark`).
- **HMR**: Hot Module Replacement provided by webpack-dev-server, enabling automatic refresh of the browser when source files change.

## Requirements

### Requirement 1: Sample Pages Header Button

**User Story:** As a developer browsing the Doc_Site, I want a "Sample Pages" button in the header, so that I can quickly navigate to the sample pages showcase.

#### Acceptance Criteria

1. THE GuidePageHeader SHALL display a "Sample Pages" button among its right-side action items.
2. WHEN a user clicks the "Sample Pages" button, THE Doc_Site SHALL navigate to the `#/sample-pages` route.
3. WHEN the Doc_Site viewport is at mobile breakpoint (xs or s), THE GuidePageHeader SHALL include the "Sample Pages" link inside the existing mobile popover menu.
4. WHEN the Doc_Site viewport is at desktop breakpoint, THE GuidePageHeader SHALL render the "Sample Pages" button as a visible header item alongside the theme selector, GitHub, and Figma links.

### Requirement 2: Sample Pages Route

**User Story:** As a developer, I want the sample pages to be accessible via a dedicated route, so that I can bookmark and share the URL.

#### Acceptance Criteria

1. THE Doc_Site SHALL register a route at path `sample-pages` that renders the Sample_Pages_View.
2. WHEN a user navigates to `#/sample-pages`, THE Doc_Site SHALL render the Sample_Pages_View without the standard GuidePageChrome sidebar navigation.
3. WHEN a user navigates to `#/sample-pages`, THE Doc_Site SHALL still render the GuidePageHeader at the top of the page.

### Requirement 3: Left Navigation (Figma Design)

**User Story:** As a developer viewing the sample pages, I want a left-side navigation panel matching the Figma design, so that I can switch between sample pages.

**Figma Reference:** `figma.com/design/V2RvjK3B8xtOHfXHRL2xaF`, node `9917:47781` ("LEFT NAV with WS")

#### Acceptance Criteria

1. THE Sample_Pages_View SHALL display a Left_Nav panel on the left side of the page, styled as a 270px-wide sidebar with a right border, and rounded top-right and bottom-right corners (24px radius) matching the Figma design.
2. THE Left_Nav SHALL contain a header section with the OpenSearch logo/mark and a collapse/menu icon button.
3. THE Left_Nav SHALL contain a search bar below the header, using OuiFieldSearch in compressed mode, with placeholder text "Search the menu".
4. THE Left_Nav SHALL contain exactly three navigation items labeled "Services", "Discover", and "Threads".
5. WHEN a user clicks a navigation item in the Left_Nav, THE Sample_Pages_View SHALL display the corresponding page content in the main content area.
6. THE Left_Nav SHALL visually indicate which page is currently active by rendering a light background (ouiColorLightestShade) with rounded corners (8px) behind the selected item.
7. WHEN the Sample_Pages_View first loads, THE Left_Nav SHALL select the "Services" page by default.
8. THE Left_Nav SHALL contain a footer section with a horizontal rule divider and a row of icon buttons (home, workspaceSelector, gear, console, info) followed by a user avatar.
9. THE Left_Nav SHALL use Rubik font at 14px for nav item labels, with subdued text color (ouiTextSubduedColor).

### Requirement 4: Service Sample Page

**User Story:** As a developer, I want to see a Service page built with OUI components that mimics an OpenSearch Observability APM Services view, so that I can reference a realistic service-oriented layout.

**Figma Reference:** `figma.com/design/V2RvjK3B8xtOHfXHRL2xaF`, node `9917:47775` ("PAGE")

#### Acceptance Criteria

1. THE Service_Page SHALL render on a light gray page background (`ouiPageBackgroundColor` / #f0f2f4).
2. THE Service_Page SHALL include a page header area with a title (e.g. "Services") and breadcrumb-style navigation.
3. THE Service_Page SHALL include a search/filter bar using OuiFieldSearch and OuiFilterGroup components.
4. THE Service_Page SHALL include a services data table using OuiBasicTable or OuiInMemoryTable with columns such as Name, Average Latency, Error Rate, and Throughput.
5. THE Service_Page SHALL include hardcoded mock data for at least 5 service entries in the table.
6. THE Service_Page SHALL use only OUI_Components imported directly from the OUI source directory (`src/components`).
7. THE Service_Page SHALL render correctly under both V9_Theme light and V9_Theme dark variants.

### Requirement 5: Discover Placeholder Page

**User Story:** As a developer, I want to see a Discover entry in the left nav, so that I know the page will be available in the future.

#### Acceptance Criteria

1. THE Discover_Page SHALL render a placeholder using OuiEmptyPrompt indicating the page is coming soon.
2. THE Discover_Page SHALL use only OUI_Components imported directly from the OUI source directory (`src/components`).

### Requirement 6: Thread Placeholder Page

**User Story:** As a developer, I want to see a Threads entry in the left nav, so that I know the page will be available in the future.

#### Acceptance Criteria

1. THE Thread_Page SHALL render a placeholder using OuiEmptyPrompt indicating the page is coming soon.
2. THE Thread_Page SHALL use only OUI_Components imported directly from the OUI source directory (`src/components`).

### Requirement 7: Automatic Refresh on Component or Style Changes

**User Story:** As a developer, I want the sample pages to automatically refresh when OUI components or styles are updated, so that I can see changes in real time.

#### Acceptance Criteria

1. THE Sample_Pages_View SHALL import all OUI_Components from the OUI source directory (`src/components`) rather than from a pre-built bundle.
2. THE Sample_Pages_View SHALL import styles through the Doc_Site theme system so that V9_Theme stylesheets are applied.
3. WHEN a developer modifies an OUI component or style file, THE Doc_Site development server SHALL automatically refresh the Sample_Pages_View via HMR without requiring a manual browser reload.

### Requirement 8: Theme Compatibility

**User Story:** As a developer, I want the sample pages to respect the currently selected theme, so that I can preview them in any supported theme variant.

#### Acceptance Criteria

1. THE Sample_Pages_View SHALL render using the theme currently selected in the GuidePageHeader theme selector.
2. WHEN a user switches the theme via the GuidePageHeader theme selector, THE Sample_Pages_View SHALL re-render with the newly selected theme styles.
3. THE Sample_Pages_View SHALL support all registered Doc_Site themes including v9-light and v9-dark.
