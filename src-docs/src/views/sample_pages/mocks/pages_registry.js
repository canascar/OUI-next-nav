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
 * Pages registry — the single source of truth for the set of application
 * pages the first-run surface can open (dual-purpose input matches, quick
 * access row, "More" browser, recents/favorites labels).
 *
 * Each entry maps a stable `id` to:
 *   - `label`   Display name shown to the user.
 *   - `icon`    Existing OUI icon asset (do NOT introduce new icons).
 *   - `pageKey` The key understood by SOURCE_PAGE_MOCK / openCanvasPage so the
 *               page opens as a real PageTab in the existing PagePanel.
 *   - `keywords` Extra terms the fuzzy matcher should consider.
 *
 * TODO(design/eng): replace this static list with the real agent page catalog
 * API when available. Consumers should only depend on the exported helpers
 * (getPages / getPageById / findPages), never hardcode this array.
 */
export const PAGES = [
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: 'navDashboards',
    pageKey: 'dashboards-list',
    keywords: ['dashboard', 'overview', 'charts', 'visualize'],
  },
  {
    id: 'discover',
    label: 'Discover / Logs',
    icon: 'navDiscover',
    pageKey: 'discover-log',
    keywords: ['discover', 'logs', 'log', 'search', 'events'],
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: 'visArea',
    pageKey: 'discover-metric',
    keywords: ['metrics', 'metric', 'timeseries', 'gauge'],
  },
  {
    id: 'topology',
    label: 'Topology',
    icon: 'navServiceMap',
    pageKey: 'app-map',
    keywords: ['topology', 'map', 'service map', 'dependencies'],
  },
  {
    id: 'traces',
    label: 'Traces',
    icon: 'apmTrace',
    pageKey: 'traces',
    keywords: ['traces', 'trace', 'spans', 'latency'],
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: 'navAlerting',
    pageKey: 'alerts-list',
    keywords: ['alerts', 'alert', 'alarms', 'monitors', 'incidents'],
  },
  {
    id: 'app-performance',
    label: 'App Performance',
    icon: 'navOverview',
    pageKey: 'app-perf-services',
    keywords: ['app performance', 'apm', 'services', 'performance'],
  },
  {
    id: 'agent-monitoring',
    label: 'Agent Monitoring',
    icon: 'visTagCloud',
    pageKey: 'agent-spans',
    keywords: ['agent monitoring', 'agent', 'agents', 'spans'],
  },
];

/**
 * @returns {typeof PAGES} A shallow copy of the full registry.
 */
export function getPages() {
  return PAGES.slice();
}

/**
 * @param {string} id
 * @returns {(typeof PAGES)[number] | undefined}
 */
export function getPageById(id) {
  return PAGES.find((page) => page.id === id);
}

/**
 * Lightweight fuzzy match against label + keywords. Not a real fuzzy library —
 * intentionally simple and dependency-free. Ranks exact prefix matches first,
 * then substring matches, then subsequence ("dsh" -> "Dashboards") matches.
 *
 * @param {string} query
 * @returns {typeof PAGES} Matching pages, best first. Empty query -> [].
 */
export function findPages(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];

  const scored = [];
  for (const page of PAGES) {
    const haystacks = [page.label.toLowerCase(), ...(page.keywords || [])];
    let best = Infinity;
    for (const hay of haystacks) {
      const score = matchScore(hay, q);
      if (score < best) best = score;
    }
    if (best < Infinity) scored.push({ page, score: best });
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.page);
}

/**
 * Lower score = better match. Infinity = no match.
 * 0: prefix, 1: substring, 2: subsequence.
 *
 * @param {string} hay
 * @param {string} needle
 * @returns {number}
 */
function matchScore(hay, needle) {
  if (hay.startsWith(needle)) return 0;
  if (hay.includes(needle)) return 1;
  // Subsequence check: characters of needle appear in order within hay.
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] === needle[i]) i++;
  }
  return i === needle.length ? 2 : Infinity;
}
