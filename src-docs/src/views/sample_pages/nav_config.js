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

/**
 * Nav configuration: floor, promoted, collapsed group model.
 *
 * Every page in the registry ALWAYS exists in the nav. Settings control
 * where an item sits (promoted vs collapsed group), never whether it exists.
 */

import { SOURCE_PAGE_MOCK } from './session_models';

// ---------------------------------------------------------------------------
// NAV_FLOOR — constant, non-configurable, always visible in both states
// ---------------------------------------------------------------------------

/**
 * Floor page items. These are always visible in both collapsed and expanded
 * rail states. They cannot be edited, reordered, or hidden from settings.
 */
export const NAV_FLOOR = [
  { key: 'alerts', label: 'Alerts', icon: 'navAlerting', page: 'alerts-list' },
  { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards', page: 'dashboards-list' },
  { key: 'logs', label: 'Logs', icon: 'navDiscover', page: 'discover-log' },
];

/** Floor page keys as a Set for O(1) membership checks. */
export const NAV_FLOOR_KEYS = new Set(NAV_FLOOR.map((item) => item.key));

// ---------------------------------------------------------------------------
// PAGES REGISTRY — all navigable pages derived from existing data
// ---------------------------------------------------------------------------

/**
 * All nav-eligible page items. Each item maps to an entry in SOURCE_PAGE_MOCK.
 * This is the single source of truth for what can appear in the nav.
 */
export const NAV_ALL_PAGES = [
  { key: 'alerts', label: 'Alerts', icon: 'navAlerting', page: 'alerts-list' },
  { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards', page: 'dashboards-list' },
  { key: 'logs', label: 'Logs', icon: 'navDiscover', page: 'discover-log' },
  { key: 'new-ppl-logs', label: 'Logs (new PPL)', icon: 'navDiscover', page: 'new-ppl-log' },
  { key: 'metrics', label: 'Metrics', icon: 'visArea', page: 'discover-metric' },
  { key: 'topology-map', label: 'Topology map', icon: 'navAiFlow', page: 'app-map' },
  { key: 'agent-traces', label: 'Agent Traces', icon: 'visTable', page: 'app-traces' },
  { key: 'agent-spans', label: 'Agent Spans', icon: 'visTagCloud', page: 'agent-spans' },
  { key: 'app-traces', label: 'Application Traces', icon: 'apmTrace', page: 'traces' },
  { key: 'app-services', label: 'Application Services', icon: 'navServices', page: 'app-perf-services' },
  { key: 'notebooks', label: 'Notebooks', icon: 'document', page: 'notebooks' },
  { key: 'forecasting', label: 'Forecasting', icon: 'visLine', page: 'forecasting' },
];

/** All page keys as a Set. */
export const NAV_ALL_PAGE_KEYS = new Set(NAV_ALL_PAGES.map((item) => item.key));

// ---------------------------------------------------------------------------
// NavConfig — persisted user preferences
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'navConfig_v1';

/**
 * @typedef {Object} NavConfig
 * @property {string[]} promoted - pageIds in display order
 * @property {boolean} collapsed - rail collapsed vs expanded
 * @property {boolean} groupOpen - collapsed-group disclosure state
 */

/** Default promoted items (everything not in floor). */
const DEFAULT_PROMOTED = [
  'new-ppl-logs',
  'metrics',
  'topology-map',
];

/**
 * Load NavConfig from localStorage. Returns defaults on missing/corrupt data.
 * @returns {NavConfig}
 */
export function loadNavConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultConfig();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.promoted)) return getDefaultConfig();
    // Validate promoted keys — filter out any that don't exist in registry
    const validPromoted = parsed.promoted.filter(
      (key) => NAV_ALL_PAGE_KEYS.has(key) && !NAV_FLOOR_KEYS.has(key)
    );
    return {
      promoted: validPromoted,
      collapsed: typeof parsed.collapsed === 'boolean' ? parsed.collapsed : false,
      groupOpen: typeof parsed.groupOpen === 'boolean' ? parsed.groupOpen : false,
    };
  } catch {
    return getDefaultConfig();
  }
}

/**
 * Save NavConfig to localStorage.
 * @param {NavConfig} config
 */
export function saveNavConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Returns the default NavConfig.
 * @returns {NavConfig}
 */
export function getDefaultConfig() {
  return {
    promoted: [...DEFAULT_PROMOTED],
    collapsed: false,
    groupOpen: false,
  };
}

/**
 * Derive the collapsed-group items: everything in the registry that is
 * neither in the floor nor in the promoted list.
 * @param {string[]} promoted - Current promoted keys
 * @returns {Array<{key: string, label: string, icon: string, page: string}>}
 */
export function getCollapsedGroupItems(promoted) {
  const promotedSet = new Set(promoted);
  return NAV_ALL_PAGES.filter(
    (item) => !NAV_FLOOR_KEYS.has(item.key) && !promotedSet.has(item.key)
  );
}

/**
 * Get promoted items as full objects in config order.
 * @param {string[]} promoted - Current promoted keys
 * @returns {Array<{key: string, label: string, icon: string, page: string}>}
 */
export function getPromotedItems(promoted) {
  return promoted
    .map((key) => NAV_ALL_PAGES.find((item) => item.key === key))
    .filter(Boolean);
}

// TODO: final copy pending design
export const NAV_SETTINGS_UNCHECKED_HINT =
  'Unchecked items move to the collapsed group — they are still accessible.';
