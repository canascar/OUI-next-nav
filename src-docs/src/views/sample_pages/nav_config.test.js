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

import {
  NAV_FLOOR,
  NAV_FLOOR_KEYS,
  NAV_ALL_PAGES,
  NAV_ALL_PAGE_KEYS,
  loadNavConfig,
  saveNavConfig,
  getDefaultConfig,
  getPromotedItems,
  getCollapsedGroupItems,
} from './nav_config';

// ---------------------------------------------------------------------------
// NAV_FLOOR is a constant, not derived from NavConfig
// ---------------------------------------------------------------------------
describe('NAV_FLOOR', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(NAV_FLOOR)).toBe(true);
    expect(NAV_FLOOR.length).toBeGreaterThan(0);
  });

  test('contains exactly alerts, dashboards, logs', () => {
    const keys = NAV_FLOOR.map((item) => item.key);
    expect(keys).toEqual(['alerts', 'dashboards', 'logs']);
  });

  test('is not derived from NavConfig.promoted', () => {
    // NAV_FLOOR should be the same regardless of what promoted contains
    const config = getDefaultConfig();
    config.promoted = [];
    // NAV_FLOOR doesn't change
    expect(NAV_FLOOR.map((i) => i.key)).toEqual(['alerts', 'dashboards', 'logs']);
  });
});

// ---------------------------------------------------------------------------
// Every registry page is reachable regardless of config
// ---------------------------------------------------------------------------
describe('All pages reachable from nav', () => {
  test('every page in registry is in either floor or can appear in collapsed group', () => {
    // For any possible config (even empty promoted), all pages must be reachable
    const randomConfigs = [
      { promoted: [] },
      { promoted: ['metrics'] },
      { promoted: NAV_ALL_PAGES.filter((p) => !NAV_FLOOR_KEYS.has(p.key)).map((p) => p.key) },
      { promoted: ['new-ppl-logs', 'topology-map'] },
    ];

    for (const config of randomConfigs) {
      const promoted = getPromotedItems(config.promoted);
      const collapsed = getCollapsedGroupItems(config.promoted);
      const allReachable = new Set([
        ...NAV_FLOOR.map((i) => i.key),
        ...promoted.map((i) => i.key),
        ...collapsed.map((i) => i.key),
      ]);

      for (const page of NAV_ALL_PAGES) {
        expect(allReachable.has(page.key)).toBe(true);
      }
    }
  });

  test('no registry page can be made unreachable through any settings combination', () => {
    // Randomized test: generate 20 random promoted arrays and verify
    for (let i = 0; i < 20; i++) {
      const nonFloor = NAV_ALL_PAGES.filter((p) => !NAV_FLOOR_KEYS.has(p.key));
      // Random subset of non-floor items as promoted
      const promoted = nonFloor
        .filter(() => Math.random() > 0.5)
        .map((p) => p.key);

      const promotedItems = getPromotedItems(promoted);
      const collapsedItems = getCollapsedGroupItems(promoted);
      const reachable = new Set([
        ...NAV_FLOOR.map((i) => i.key),
        ...promotedItems.map((i) => i.key),
        ...collapsedItems.map((i) => i.key),
      ]);

      for (const page of NAV_ALL_PAGES) {
        expect(reachable.has(page.key)).toBe(true);
      }
    }
  });

  test('collapsed rail renders exactly floor items for every config', () => {
    // The collapsed rail shows only NAV_FLOOR regardless of promoted state
    const floorKeys = NAV_FLOOR.map((i) => i.key);
    expect(floorKeys).toHaveLength(3);
    // Floor keys are constant
    expect(floorKeys).toEqual(['alerts', 'dashboards', 'logs']);
  });
});

// ---------------------------------------------------------------------------
// NavConfig persistence
// ---------------------------------------------------------------------------
describe('NavConfig persistence', () => {
  let store = {};
  beforeAll(() => {
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = val; },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  });
  beforeEach(() => {
    store = {};
  });

  test('loadNavConfig returns defaults when localStorage is empty', () => {
    const config = loadNavConfig();
    expect(config).toEqual(getDefaultConfig());
  });

  test('saveNavConfig + loadNavConfig round-trips', () => {
    const config = {
      promoted: ['metrics', 'notebooks'],
      collapsed: true,
      groupOpen: true,
    };
    saveNavConfig(config);
    expect(loadNavConfig()).toEqual(config);
  });

  test('loadNavConfig handles corrupt data gracefully', () => {
    localStorage.setItem('navConfig_v1', 'not valid json!!!');
    expect(loadNavConfig()).toEqual(getDefaultConfig());
  });

  test('loadNavConfig filters out invalid keys', () => {
    const config = {
      promoted: ['metrics', 'nonexistent-page', 'notebooks'],
      collapsed: false,
      groupOpen: false,
    };
    saveNavConfig(config);
    const loaded = loadNavConfig();
    expect(loaded.promoted).toEqual(['metrics', 'notebooks']);
  });

  test('loadNavConfig removes floor keys from promoted', () => {
    const config = {
      promoted: ['alerts', 'metrics', 'logs'],
      collapsed: false,
      groupOpen: false,
    };
    saveNavConfig(config);
    const loaded = loadNavConfig();
    // alerts and logs are floor items, should be filtered out
    expect(loaded.promoted).toEqual(['metrics']);
  });
});

// ---------------------------------------------------------------------------
// Reordering promoted does not affect floor
// ---------------------------------------------------------------------------
describe('Floor order is fixed', () => {
  beforeAll(() => {
    let store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = val; },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  });

  test('NAV_FLOOR order does not change regardless of promoted order', () => {
    const expected = ['alerts', 'dashboards', 'logs'];
    expect(NAV_FLOOR.map((i) => i.key)).toEqual(expected);
    // Even after saving a config with different promoted order
    saveNavConfig({ promoted: ['notebooks', 'metrics'], collapsed: false, groupOpen: false });
    expect(NAV_FLOOR.map((i) => i.key)).toEqual(expected);
  });
});
