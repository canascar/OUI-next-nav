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
 * Mocked capabilities object driving the three permissions scenarios on the
 * first-run surface. Engineering can swap this for the real capabilities/
 * privileges API later — consumers depend only on getCapabilities().
 *
 * @typedef {Object} Capabilities
 * @property {boolean} canCreateWorkspace
 * @property {boolean} hasDataSources
 */

/** Ready-to-go: full permissions and data already connected. */
const READY = { canCreateWorkspace: true, hasDataSources: true };

/**
 * Read the dev query override from the URL. Because the app uses hash routing
 * (e.g. `#/first-run?perms=none`), query params may live in the hash. We check
 * both `location.search` and the portion of `location.hash` after a `?`.
 *
 * @param {string} name
 * @returns {string|null}
 */
export function readQueryParam(name) {
  try {
    const search = new URLSearchParams(window.location.search);
    if (search.has(name)) return search.get(name);
    const hash = window.location.hash || '';
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const hashParams = new URLSearchParams(hash.slice(qIndex + 1));
      if (hashParams.has(name)) return hashParams.get(name);
    }
  } catch (e) {
    // location/URLSearchParams unavailable — fall through to null
  }
  return null;
}

/**
 * Resolve the capabilities for the current view.
 *
 * Dev override via `?perms=`:
 *   - `none`     -> no permissions (cannot create a workspace)
 *   - `no-data`  -> permissions but no data sources
 *   - `ready`    -> full permissions + data (default)
 *
 * @returns {Capabilities}
 */
export function getCapabilities() {
  const override = readQueryParam('perms');
  switch (override) {
    case 'none':
      return { canCreateWorkspace: false, hasDataSources: false };
    case 'no-data':
      return { canCreateWorkspace: true, hasDataSources: false };
    case 'ready':
      return { ...READY };
    default:
      return { ...READY };
  }
}
