/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeContext } from '../../src-docs/src/components/with_theme';
import { SamplePagesLeftNav } from '../../src-docs/src/views/sample_pages/sample_pages_left_nav';
import {
  loadLayout,
  validateLayout,
  saveLayout,
  ALL_DRAGGABLE_ITEMS,
  DEFAULT_MAIN_KEYS,
  DEFAULT_OVERFLOW_KEYS,
  STORAGE_KEY,
} from '../../src-docs/src/views/sample_pages/nav_layout_utils';

// Helper: wrap component in ThemeContext provider
const themeContextValue = { theme: 'v9-light', changeTheme: jest.fn() };

function renderNav(props = {}) {
  const defaultProps = {
    activePage: 'discover',
    onPageChange: jest.fn(),
    onItemSelect: jest.fn(),
    selectedItem: null,
  };
  return render(
    <ThemeContext.Provider value={themeContextValue}>
      <SamplePagesLeftNav {...defaultProps} {...props} />
    </ThemeContext.Provider>
  );
}

/**
 * Helper: enter customize mode by hovering over the More button
 * to open the hover popover, then clicking "Customize navigation bar".
 */
async function enterCustomizeMode(_container) {
  // The More button is the last nav button rendered in normal mode.
  // It has hoverOnly: true, so we trigger mouseEnter to show the hover popover.
  const moreButton = screen.getByText('More').closest('button');
  fireEvent.mouseEnter(moreButton);

  // The hover popover should now show "Customize navigation bar"
  const customizeButton = await screen.findByText('Customize navigation bar');
  fireEvent.click(customizeButton);
}

// ============================================================================
// 4.1: Unit tests for customize mode entry/exit
// ============================================================================
describe('4.1 Customize mode entry/exit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('clicking "Customize navigation bar" enters customize mode and closes popover', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);

    // Customize mode should be active: Done button visible
    expect(screen.getByText('Done')).toBeInTheDocument();

    // The nav should be in customizing mode (expanded panel collapsed)
    const nav = container.querySelector('.samplePagesLeftNav');
    expect(nav.classList.contains('samplePagesLeftNav--customizing')).toBe(
      true
    );

    // All draggable items should be visible with checkboxes
    ALL_DRAGGABLE_ITEMS.forEach((item) => {
      const checkbox = container.querySelector(
        `#customize-checkbox-${item.key}`
      );
      expect(checkbox).not.toBeNull();
    });
  });

  test('clicking "Done" exits customize mode and removes customize UI', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);
    expect(screen.getByText('Done')).toBeInTheDocument();

    // Click Done
    fireEvent.click(screen.getByText('Done'));

    // Done button should be gone
    expect(screen.queryByText('Done')).not.toBeInTheDocument();

    // Checkboxes should be gone (no checkbox inputs in the nav)
    const checkboxes = container.querySelectorAll(
      '.samplePagesLeftNav__customizeCheckbox'
    );
    expect(checkboxes).toHaveLength(0);
  });

  test('customize mode applies the --customizing CSS class', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);

    const nav = container.querySelector('.samplePagesLeftNav');
    expect(nav.classList.contains('samplePagesLeftNav--customizing')).toBe(
      true
    );
  });

  test('exiting customize mode removes the --customizing CSS class', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);
    const nav = container.querySelector('.samplePagesLeftNav');
    expect(nav.classList.contains('samplePagesLeftNav--customizing')).toBe(
      true
    );

    fireEvent.click(screen.getByText('Done'));

    expect(nav.classList.contains('samplePagesLeftNav--customizing')).toBe(
      false
    );
  });
});

// ============================================================================
// 4.2: Unit tests for checkbox behavior and fixed items
// ============================================================================
describe('4.2 Checkbox behavior and fixed items', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('fixed items (Search, Thread) do not render checkboxes in customize mode', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);

    // Fixed items should have the --fixed modifier and no checkbox
    const fixedItems = container.querySelectorAll(
      '.samplePagesLeftNav__navItem--fixed'
    );
    expect(fixedItems.length).toBe(2);

    fixedItems.forEach((fixedItem) => {
      const checkbox = fixedItem.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeNull();
    });
  });

  test('More nav item is hidden during customize mode', async () => {
    const { container } = renderNav();

    // Before customize mode, More should be visible
    expect(screen.getByText('More')).toBeInTheDocument();

    await enterCustomizeMode(container);

    // In customize mode, the More button should not be rendered
    // (it's not in the customize list)
    // More should not appear as a nav item in customize mode
    const navItems = container.querySelectorAll('.samplePagesLeftNav__navItem');
    const moreNavItem = Array.from(navItems).find((item) =>
      item.textContent.includes('More')
    );
    expect(moreNavItem).toBeUndefined();
  });

  test('checkbox initial state matches current mainKeys/overflowKeys', async () => {
    // Set a custom layout: discover and alerts in main
    saveLayout(
      ['discover', 'alerts'],
      ['service', 'dashboards', 'skills', 'manage-workspace']
    );

    const { container } = renderNav();

    await enterCustomizeMode(container);

    // Discover and Alerts should be checked
    const discoverCheckbox = container.querySelector(
      '#customize-checkbox-discover'
    );
    const alertsCheckbox = container.querySelector(
      '#customize-checkbox-alerts'
    );
    expect(discoverCheckbox.checked).toBe(true);
    expect(alertsCheckbox.checked).toBe(true);

    // Service should be unchecked
    const serviceCheckbox = container.querySelector(
      '#customize-checkbox-service'
    );
    expect(serviceCheckbox.checked).toBe(false);
  });

  test('toggling a checkbox updates checkedKeys state', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);

    // Discover should be checked by default (it's in DEFAULT_MAIN_KEYS)
    const discoverCheckbox = container.querySelector(
      '#customize-checkbox-discover'
    );
    expect(discoverCheckbox.checked).toBe(true);

    // Uncheck discover
    fireEvent.click(discoverCheckbox);
    expect(discoverCheckbox.checked).toBe(false);

    // Check it again
    fireEvent.click(discoverCheckbox);
    expect(discoverCheckbox.checked).toBe(true);

    // Check alerts (was unchecked by default)
    const alertsCheckbox = container.querySelector(
      '#customize-checkbox-alerts'
    );
    expect(alertsCheckbox.checked).toBe(false);
    fireEvent.click(alertsCheckbox);
    expect(alertsCheckbox.checked).toBe(true);
  });
});

// ============================================================================
// 4.3: Unit tests for layout persistence edge cases
// (Testing utility functions directly — they are pure functions)
// ============================================================================
describe('4.3 Layout persistence edge cases', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('empty localStorage loads default layout', () => {
    const layout = loadLayout(ALL_DRAGGABLE_ITEMS);
    expect(layout.mainKeys).toEqual(DEFAULT_MAIN_KEYS);
    expect(layout.overflowKeys).toEqual(DEFAULT_OVERFLOW_KEYS);
  });

  test('malformed JSON in localStorage loads default layout', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json!!!');
    const layout = loadLayout(ALL_DRAGGABLE_ITEMS);
    expect(layout.mainKeys).toEqual(DEFAULT_MAIN_KEYS);
    expect(layout.overflowKeys).toEqual(DEFAULT_OVERFLOW_KEYS);
  });

  test('layout with unknown keys discards them and adds new keys to overflow', () => {
    // Simulate a stored layout with an unknown key and missing a current key
    const stored = {
      mainKeys: ['discover', 'obsolete-item'],
      overflowKeys: ['service'],
    };
    const result = validateLayout(stored, ALL_DRAGGABLE_ITEMS);

    // 'obsolete-item' should be discarded
    expect(result.mainKeys).not.toContain('obsolete-item');
    // 'discover' should remain in main
    expect(result.mainKeys).toContain('discover');
    // 'service' should remain in overflow
    expect(result.overflowKeys).toContain('service');
    // Missing keys (alerts, dashboards, skills, manage-workspace) should be added to overflow
    expect(result.overflowKeys).toContain('alerts');
    expect(result.overflowKeys).toContain('dashboards');
    expect(result.overflowKeys).toContain('skills');
    expect(result.overflowKeys).toContain('manage-workspace');
    // Total keys should equal ALL_DRAGGABLE_ITEMS length
    const allKeys = [...result.mainKeys, ...result.overflowKeys];
    expect(allKeys).toHaveLength(ALL_DRAGGABLE_ITEMS.length);
  });
});

// ============================================================================
// 4.4: Unit tests for accessibility
// ============================================================================
describe('4.4 Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('checkboxes are focusable via Tab', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);

    // All draggable items should have checkbox inputs
    const checkboxes = container.querySelectorAll(
      '.samplePagesLeftNav__customizeCheckbox input[type="checkbox"]'
    );
    expect(checkboxes.length).toBe(ALL_DRAGGABLE_ITEMS.length);

    // Each checkbox should not have tabIndex=-1 (i.e., it should be focusable)
    checkboxes.forEach((checkbox) => {
      expect(checkbox.tabIndex).not.toBe(-1);
    });
  });

  test('checkboxes have associated labels with nav item names', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);

    // Each checkbox should have an aria-label matching the item label
    ALL_DRAGGABLE_ITEMS.forEach((item) => {
      const checkbox = container.querySelector(
        `#customize-checkbox-${item.key}`
      );
      expect(checkbox).not.toBeNull();
      expect(checkbox.getAttribute('aria-label')).toBe(item.label);
    });
  });

  test('Done button is reachable via Tab', async () => {
    const { container } = renderNav();

    await enterCustomizeMode(container);

    const doneButton = screen.getByText('Done').closest('button');
    expect(doneButton).not.toBeNull();
    // Button should be focusable (not disabled, no tabIndex=-1)
    expect(doneButton.tabIndex).not.toBe(-1);
    expect(doneButton.disabled).not.toBe(true);
  });
});
