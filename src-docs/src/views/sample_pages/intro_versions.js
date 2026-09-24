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

/*
 * Registry of MCP-home intro-screen versions, for the version switcher.
 *
 * Each entry is a SEPARATE, independently-editable version:
 *   - V1 is the original constellation (space_background.js), unchanged.
 *   - V2/V3/V4 are starter backdrops (intro_v2/3/4.js) to iterate on.
 *
 * LAZY LOADING: every version is wrapped in React.lazy, so a version's module
 * is only downloaded and run when it is FIRST selected. Switching to V2 loads
 * intro_v2.js; V3/V4 stay unloaded until picked. This keeps the initial home
 * light and means editing one version can't affect the others at runtime.
 */

import React from 'react';

// V1 — original constellation. Its component is a NAMED export, so map it to a
// default for React.lazy. Only imported when V1 is (re)selected.
const V1 = React.lazy(() =>
  import('./space_background').then((m) => ({ default: m.SpaceBackground }))
);
const V2 = React.lazy(() => import('./intro_v2'));
const V3 = React.lazy(() => import('./intro_v3'));
const V4 = React.lazy(() => import('./intro_v4'));

// V1's content-reveal timing is driven by its long multi-phase constellation
// intro (build → dissolve). Kept here so the switcher can hold the greeting
// until the logo has cleared. Mirrors the constants in space_background.js.
const V1_REVEAL_MS =
  2600 /* star fade */ +
  500 /* morph hold */ +
  3200 /* morph */ +
  600 /* dissolve hold */ +
  2600 * 0.4; /* reveal ~40% into the dissolve */

// Ordered list the switcher renders.
//   id        stable key + localStorage value
//   label     pill text
//   Component lazy backdrop
//   revealMs  how long to hold the greeting hidden before it fades in, so the
//             UI reveal lands in step with THIS version's intro. V2–V4 are
//             short backdrops (~2s), so their content arrives quickly instead
//             of waiting on V1's ~10s timeline.
export const INTRO_VERSIONS = [
  { id: 'v1', label: 'V1', Component: V1, revealMs: V1_REVEAL_MS },
  { id: 'v2', label: 'V2', Component: V2, revealMs: 2200 },
  { id: 'v3', label: 'V3', Component: V3, revealMs: 3400 },
  { id: 'v4', label: 'V4', Component: V4, revealMs: 1400 },
];

// localStorage key that remembers the selected version across browser reloads.
export const INTRO_VERSION_STORAGE_KEY = 'mcpHomeIntroVersion';

// Reset the once-per-load intro gates for a version, so its NEXT mount replays
// the full intro. Only V1 tracks module-level gates today; V2–V4 restart purely
// by remounting (their intros live in a mount effect). Called on refresh for
// whichever version is active. Lazily imported so it doesn't pull V1's module
// in unless V1 is the active version being refreshed.
// Returns a promise that resolves once the reset is done — the caller MUST wait
// for it before remounting the version, or V1 would remount and read its
// still-true gates before this async import resolves (skipping the intro).
export const resetIntroVersion = (id) => {
  if (id === 'v1') {
    return import('./space_background').then((m) => {
      if (m.resetSpaceBackgroundIntro) m.resetSpaceBackgroundIntro();
    });
  }
  // V2–V4: no module-level gate — remounting (via the version replay key in
  // McpHomeGreeting) is what restarts their intros.
  return Promise.resolve();
};
