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
 * Single mocks module for the first-run experience. Engineering can swap each
 * of these submodules for real agent APIs without touching the view code that
 * imports from here.
 */

export { PAGES, getPages, getPageById, findPages } from './pages_registry';

export { getCapabilities, readQueryParam } from './capabilities';

export {
  recordVisit,
  getRecents,
  toggleFavorite,
  getFavorites,
  isFavorite,
  clearHistory,
} from './history';

export {
  SESSIONS_STORAGE_KEY,
  createSession,
  loadSessions,
  saveSessions,
  clearSessions,
  clampPaneWidth,
} from './session_store';

export { POC_ALERTS, getPocAlert } from './pocAlerts';

export {
  FRONTEND_P95_ALERT_ID,
  FRONTEND_P95_THREAD_KEY,
  FRONTEND_P95_REPORT_PAGE_KEY,
  FRONTEND_P95_REPORT_TAB_TITLE,
  FRONTEND_P95_REPORT_LINK_KEY,
  FRONTEND_P95_GATE_ID,
  FRONTEND_P95_INCIDENT,
  FRONTEND_P95_ROLLBACK_GATE,
  FRONTEND_P95_ROLLBACK_CONFIRMATION,
  getFrontendP95Incident,
  buildFrontendP95Messages,
  getFrontendP95State,
  setFrontendP95State,
  clearFrontendP95State,
} from './frontendP95';
