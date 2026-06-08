# Implementation Plan: Sample Pages

## Overview

Implement a "Sample Pages" showcase for the OUI documentation site. This involves creating a custom left nav (matching the Figma design), a fully implemented Service page, placeholder pages for Discover and Threads, modifying GuidePageHeader to add a navigation button, and adding a dedicated route in index.js.

## Tasks

- [x] 1. Create sample page components
  - [x] 1.1 Create the ServicePage component
    - Create `src-docs/src/views/sample_pages/service_page.js`
    - Export a stateless functional component that mimics an OpenSearch Observability APM Services view
    - Follow Figma design (file `V2RvjK3B8xtOHfXHRL2xaF`, node `9917:47775`)
    - Render on a light gray page background (ouiPageBackgroundColor / #f0f2f4)
    - Include breadcrumbs (OuiBreadcrumbs) and a page header with title "Services" (OuiPageHeader)
    - Include a search/filter bar using OuiFieldSearch and OuiFilterGroup
    - Include a services data table using OuiBasicTable or OuiInMemoryTable with columns: Name, Average Latency, Error Rate, Throughput
    - Include hardcoded mock data for at least 5 service entries
    - Use OUI components imported from `../../../../src/components`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 1.2 Create the DiscoverPage placeholder component
    - Create `src-docs/src/views/sample_pages/discover_page.js`
    - Export a stateless functional component that renders an OuiEmptyPrompt with a "Coming soon" message
    - Use OUI components imported from `../../../../src/components`
    - _Requirements: 5.1, 5.2_

  - [x] 1.3 Create the ThreadPage placeholder component
    - Create `src-docs/src/views/sample_pages/thread_page.js`
    - Export a stateless functional component that renders an OuiEmptyPrompt with a "Coming soon" message
    - Use OUI components imported from `../../../../src/components`
    - _Requirements: 6.1, 6.2_

- [x] 2. Create the left navigation and SamplePagesView
  - [x] 2.1 Create the SamplePagesLeftNav component matching Figma design
    - Create `src-docs/src/views/sample_pages/sample_pages_left_nav.js`
    - Follow Figma design (file `V2RvjK3B8xtOHfXHRL2xaF`, node `9917:47781`)
    - Props: `activePage` (string), `onPageChange` (function)
    - Render a 270px-wide sidebar with right border and rounded top-right/bottom-right corners (24px)
    - Header section: OpenSearch logo mark (32x32) + collapse/menu icon button, separated by bottom border
    - Search section: OuiFieldSearch in compressed mode, placeholder "Search the menu", 238px content width
    - Nav items section: "Services", "Discover", "Threads" — each item uses Rubik font 14px, ouiTextSubduedColor, 8px horizontal / 10px vertical padding
    - Active item: light background (ouiColorLightestShade / #f5f7fa) with 8px border-radius
    - Footer section: OuiHorizontalRule + row of 24px icon buttons (home, workspaceSelector, gear, console, info) + 24px OuiAvatar with initials
    - Call `onPageChange(pageKey)` when a nav item is clicked
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8, 3.9_

  - [x] 2.2 Create the SamplePagesView component
    - Create `src-docs/src/views/sample_pages/sample_pages_view.js`
    - Import GuidePageHeader from `../../components/guide_page/guide_page_header`
    - Import SamplePagesLeftNav, ServicePage, DiscoverPage, ThreadPage from local files
    - Use `useState('service')` to track the active page
    - Render GuidePageHeader at top, then a flex layout with SamplePagesLeftNav on the left and content area on the right
    - Conditionally render the selected page component in the content area
    - Wrap each page in OuiErrorBoundary
    - Default to ServicePage for unrecognized activePage values
    - _Requirements: 2.2, 2.3, 3.5, 3.7, 7.1, 7.2_

  - [ ]* 2.3 Write property test: Nav item click renders correct page and marks it selected
    - **Property 1: Nav item click renders correct page and marks it selected**
    - Use fast-check to generate random page selections from `['service', 'discover', 'thread']`
    - Simulate clicking the corresponding nav item and assert the correct page renders and the item is marked active
    - Minimum 100 iterations
    - **Validates: Requirements 3.5, 3.6**

- [x] 3. Checkpoint - Verify sample pages and left nav
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add Sample Pages button to GuidePageHeader
  - [x] 4.1 Modify GuidePageHeader to include Sample Pages button
    - Edit `src-docs/src/components/guide_page/guide_page_header.tsx`
    - Add a `renderSamplePages()` function following the pattern of `renderGithub()` and `renderFigma()`
    - Desktop: render as OuiHeaderSectionItemButton with OuiToolTip, linking to `#/sample-pages`
    - Mobile: render as OuiButtonEmpty inside the mobile popover menu
    - Add the button to `rightSideItems` array and mobile popover content
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 4.2 Write unit tests for GuidePageHeader Sample Pages button
    - Test that a "Sample Pages" button/link exists in the rendered output
    - Test that the button links to `#/sample-pages`
    - _Requirements: 1.1, 1.2_

- [x] 5. Register the sample-pages route in index.js
  - [x] 5.1 Add the sample-pages route to the router
    - Edit `src-docs/src/index.js`
    - Import SamplePagesView from `./views/sample_pages/sample_pages_view`
    - Add a `<Route path="/sample-pages">` that renders SamplePagesView wrapped in LinkWrapper
    - Place this route before the dynamic `routes.map(...)` block so it takes precedence
    - The route must NOT wrap in AppContainer (bypasses GuidePageChrome)
    - GuidePageHeader is rendered inside SamplePagesView itself
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 5.2 Write property test: Service page renders without error under all themes
    - **Property 2: Service page renders without error under all themes**
    - Use fast-check to generate random themes from `['light', 'dark', 'next-light', 'next-dark', 'v9-light', 'v9-dark']`
    - Render ServicePage in the theme context and assert no error is thrown
    - Minimum 100 iterations
    - **Validates: Requirements 4.3, 8.1, 8.3**

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Left nav design follows Figma file `V2RvjK3B8xtOHfXHRL2xaF`, node `9917:47781`
- Only ServicePage is fully implemented; DiscoverPage and ThreadPage are OuiEmptyPrompt placeholders
- All OUI components are imported from source (`src/components`) to enable HMR (Requirement 7)
- Theme compatibility (Requirement 8) is inherent since the route is inside ThemeProvider context
