export const STORAGE_KEY = 'samplePagesNavLayout';
export const FIXED_KEYS = ['search', 'thread'];

export const ALL_DRAGGABLE_ITEMS = [
  { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards' },
  { key: 'logs', label: 'Logs', icon: 'navDiscover' },
  { key: 'metrics', label: 'Metrics', icon: 'visArea' },
  { key: 'topology-map', label: 'Topology Map', icon: 'navAiFlow' },
  {
    key: 'agent-monitoring-traces',
    label: 'Agent Monitoring Traces',
    icon: 'visTable',
  },
  {
    key: 'agent-monitoring-spans',
    label: 'Agent Monitoring Spans',
    icon: 'visTagCloud',
  },
  { key: 'app-perf-traces', label: 'Application Performance Traces', icon: 'apmTrace' },
  { key: 'app-perf-services', label: 'Application Performance Services', icon: 'navServices' },
  { key: 'tools', label: 'Tools', icon: 'wrench' },
  { key: 'manage-workspace', label: 'Workspace', icon: 'wsSelector' },
];

export const DEFAULT_MAIN_KEYS = [
  'dashboards',
  'logs',
  'metrics',
  'topology-map',
  'agent-monitoring-traces',
  'agent-monitoring-spans',
  'app-perf-traces',
  'app-perf-services',
  'tools',
  'manage-workspace',
];
export const DEFAULT_OVERFLOW_KEYS = [];

/**
 * Toggle an item between main and overflow zones.
 * If key is in mainKeys, move it to overflowKeys; if in overflowKeys, move it to mainKeys.
 * Fixed keys (Search, Thread) are rejected — returns unchanged layout (as new arrays).
 * Both returned arrays preserve canonical order from allDraggableItems.
 * Never mutates input arrays.
 *
 * @param {string} key - The item key to toggle
 * @param {string[]} mainKeys - Current main zone keys
 * @param {string[]} overflowKeys - Current overflow zone keys
 * @param {Array<{key: string}>} allDraggableItems - Canonical item order
 * @returns {{ mainKeys: string[], overflowKeys: string[] }}
 */
export function toggleItemZone(key, mainKeys, overflowKeys, allDraggableItems) {
  // Reject fixed keys — return copies to avoid mutation
  if (FIXED_KEYS.includes(key)) {
    return { mainKeys: [...mainKeys], overflowKeys: [...overflowKeys] };
  }

  const canonicalOrder = allDraggableItems.map((item) => item.key);

  let newMainSet;
  let newOverflowSet;

  if (mainKeys.includes(key)) {
    // Move from main to overflow
    newMainSet = new Set(mainKeys);
    newMainSet.delete(key);
    newOverflowSet = new Set(overflowKeys);
    newOverflowSet.add(key);
  } else if (overflowKeys.includes(key)) {
    // Move from overflow to main
    newMainSet = new Set(mainKeys);
    newMainSet.add(key);
    newOverflowSet = new Set(overflowKeys);
    newOverflowSet.delete(key);
  } else {
    // Key not found in either zone — return copies unchanged
    return { mainKeys: [...mainKeys], overflowKeys: [...overflowKeys] };
  }

  // Sort both arrays by canonical order
  const sortedMain = canonicalOrder.filter((k) => newMainSet.has(k));
  const sortedOverflow = canonicalOrder.filter((k) => newOverflowSet.has(k));

  return { mainKeys: sortedMain, overflowKeys: sortedOverflow };
}

/**
 * Reorder an array by moving element at fromIndex to toIndex.
 * Returns a new array.
 * @param {Array} items
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Array}
 */
export function reorderItems(items, fromIndex, toIndex) {
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

/**
 * Move an item from one zone array to another.
 * Returns { source: [...], target: [...] }.
 * @param {Array} sourceItems
 * @param {number} sourceIndex
 * @param {Array} targetItems
 * @param {number} targetIndex
 * @returns {{ source: Array, target: Array }}
 */
export function moveItemBetweenZones(
  sourceItems,
  sourceIndex,
  targetItems,
  targetIndex
) {
  const newSource = [...sourceItems];
  const [moved] = newSource.splice(sourceIndex, 1);
  const newTarget = [...targetItems];
  newTarget.splice(targetIndex, 0, moved);
  return { source: newSource, target: newTarget };
}

/**
 * Save the current nav layout to localStorage.
 * Silently fails on errors (e.g., quota exceeded, private browsing).
 *
 * @param {string[]} mainKeys - Keys of items in the main nav
 * @param {string[]} overflowKeys - Keys of items in the overflow/More popover
 */
export function saveLayout(mainKeys, overflowKeys) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mainKeys, overflowKeys })
    );
  } catch (e) {
    // Silently fail — localStorage may be unavailable or full
  }
}

/**
 * Load the nav layout from localStorage.
 * Returns the validated layout, or the default layout if nothing is stored or on any error.
 *
 * @param {Array<{key: string}>} allDraggableItems - Canonical item list
 * @returns {{ mainKeys: string[], overflowKeys: string[] }}
 */
export function loadLayout(allDraggableItems) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return {
        mainKeys: [...DEFAULT_MAIN_KEYS],
        overflowKeys: [...DEFAULT_OVERFLOW_KEYS],
      };
    }
    const parsed = JSON.parse(raw);
    return validateLayout(parsed, allDraggableItems);
  } catch (e) {
    return {
      mainKeys: [...DEFAULT_MAIN_KEYS],
      overflowKeys: [...DEFAULT_OVERFLOW_KEYS],
    };
  }
}

/**
 * Validate a persisted layout against the current set of draggable items.
 * - Discards keys not present in allDraggableItems
 * - Removes duplicates (mainKeys wins over overflowKeys)
 * - Appends any new keys (in allDraggableItems but not in stored) to overflowKeys
 * - Preserves canonical order from allDraggableItems in both arrays
 *
 * @param {{ mainKeys: string[], overflowKeys: string[] }} stored - Persisted layout
 * @param {Array<{key: string}>} allDraggableItems - Canonical item list
 * @returns {{ mainKeys: string[], overflowKeys: string[] }}
 */
export function validateLayout(stored, allDraggableItems) {
  const validKeys = new Set(allDraggableItems.map((item) => item.key));
  const canonicalOrder = allDraggableItems.map((item) => item.key);

  // Filter mainKeys to only valid keys, preserving canonical order
  const mainSet = new Set(
    (stored.mainKeys || []).filter((k) => validKeys.has(k))
  );
  const mainKeys = canonicalOrder.filter((k) => mainSet.has(k));

  // Filter overflowKeys to valid keys not already in mainKeys (no duplicates)
  const overflowFromStored = (stored.overflowKeys || []).filter(
    (k) => validKeys.has(k) && !mainSet.has(k)
  );
  const overflowSet = new Set(overflowFromStored);

  // Append new keys (in allDraggableItems but not in either zone) to overflow
  for (const k of canonicalOrder) {
    if (!mainSet.has(k) && !overflowSet.has(k)) {
      overflowSet.add(k);
    }
  }

  // Sort overflow by canonical order
  const overflowKeys = canonicalOrder.filter((k) => overflowSet.has(k));

  return { mainKeys, overflowKeys };
}

export const NAV_APPEARANCE_KEY = 'samplePagesNavAppearance';

export function loadNavAppearance() {
  try {
    const val = localStorage.getItem(NAV_APPEARANCE_KEY);
    return val === 'icon-only' ? 'icon-only' : 'icon-text';
  } catch (e) {
    return 'icon-text';
  }
}

export function saveNavAppearance(mode) {
  try {
    localStorage.setItem(NAV_APPEARANCE_KEY, mode);
  } catch (e) {
    // Silently fail
  }
}
