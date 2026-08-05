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
 * Recent-visit and favorites history, backed by localStorage. Keyed by page
 * `id` from the pages registry. Engineering can swap the storage layer for a
 * real recents/favorites service — consumers depend only on the exported
 * functions.
 *
 * All reads are defensive: corrupt or missing data resolves to empty history
 * without throwing, so the first-run surface can always render its empty state.
 */

const RECENTS_KEY = 'osd.recents.v1';
const FAVORITES_KEY = 'osd.favorites.v1';
const MAX_RECENTS = 12;

/**
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {any} value
 */
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Silently fail — storage may be unavailable or full
  }
}

/**
 * Record a page visit. Moves the page to the front of the recents list and
 * de-duplicates, keeping at most MAX_RECENTS entries.
 *
 * @param {string} pageId
 */
export function recordVisit(pageId) {
  if (!pageId) return;
  const existing = getRecents();
  const filtered = existing.filter((item) => item.pageId !== pageId);
  const next = [{ pageId, visitedAt: Date.now() }, ...filtered].slice(
    0,
    MAX_RECENTS
  );
  writeJson(RECENTS_KEY, next);
}

/**
 * @returns {{ pageId: string, visitedAt: number }[]} Most-recent first.
 */
export function getRecents() {
  const data = readJson(RECENTS_KEY, []);
  if (!Array.isArray(data)) return [];
  return data.filter((item) => item && typeof item.pageId === 'string');
}

/**
 * Toggle a page's favorite status.
 *
 * @param {string} pageId
 * @returns {boolean} The new favorite state (true = now favorited).
 */
export function toggleFavorite(pageId) {
  if (!pageId) return false;
  const existing = getFavorites();
  const isFav = existing.some((item) => item.pageId === pageId);
  const next = isFav
    ? existing.filter((item) => item.pageId !== pageId)
    : [{ pageId, favoritedAt: Date.now() }, ...existing];
  writeJson(FAVORITES_KEY, next);
  return !isFav;
}

/**
 * @returns {{ pageId: string, favoritedAt: number }[]}
 */
export function getFavorites() {
  const data = readJson(FAVORITES_KEY, []);
  if (!Array.isArray(data)) return [];
  return data.filter((item) => item && typeof item.pageId === 'string');
}

/**
 * @param {string} pageId
 * @returns {boolean}
 */
export function isFavorite(pageId) {
  return getFavorites().some((item) => item.pageId === pageId);
}

/** Test/dev helper: clear all history. */
export function clearHistory() {
  try {
    localStorage.removeItem(RECENTS_KEY);
    localStorage.removeItem(FAVORITES_KEY);
  } catch (e) {
    // Silently fail
  }
}
