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
  AlertPageMock,
  AlertListPageMock,
  LogsPageMock,
  EmptyDiscoverPageMock,
  CorrelatedLogsDiscoverMock,
  AppMapPageMock,
  AppTracesPageMock,
  AppServicesPageMock,
  DashboardPageMock,
  DashboardListPageMock,
  InventoryAnalysisPageMock,
  ConnectionPoolPageMock,
  TraceAnalysisPageMock,
} from './mock_canvas_pages';
import { ServicePage } from './service_page';
import { ServiceDetailPage } from './service_detail_page';
import { AlertRulePage } from './alert_rule_page';
import { OverviewHomePage } from './overview_home_page';

/**
 * @typedef {Object} Session
 * @property {string} id - Unique session identifier
 * @property {string|null} threadKey - Active thread key (null = no thread)
 * @property {PendingThread|null} pendingThread - Thread being created
 * @property {PageTab[]} tabs - Open page tabs
 * @property {string|null} activeTabId - Currently active tab
 * @property {'minimized'|'side-by-side'|'full-screen'} threadPanelState
 * @property {number} threadPanelWidth - Width percentage in side-by-side (20-80)
 * @property {number} createdAt - Timestamp
 * @property {string} title - Display title (derived from thread or "New Session")
 */

/**
 * @typedef {Object} PageTab
 * @property {string} id - Unique tab identifier
 * @property {string} pageKey - Key mapping to a canvas page component
 * @property {string} title - Display title in tab bar
 * @property {string} [sourceAttachment] - If opened via View action, the attachment key
 */

/**
 * @typedef {Object} PendingThread
 * @property {string} key
 * @property {Array} messages
 * @property {string} [sourcePageTitle] - If created via Continue as Thread
 */

/**
 * @typedef {Object} SystemAlert
 * @property {string} id
 * @property {string} message
 * @property {string} actionLabel
 * @property {string} actionTarget - pageKey or URL
 * @property {'critical'|'warning'} severity
 */

/**
 * @typedef {Object} RecentItem
 * @property {string} id
 * @property {string} title
 * @property {'page'|'session'} type
 * @property {string} [pageKey]
 * @property {string} [sessionId]
 * @property {number} visitedAt
 */

/**
 * @typedef {Object} FavoriteItem
 * @property {string} id
 * @property {string} title
 * @property {'page'|'session'} type
 * @property {string} [pageKey]
 * @property {string} [sessionId]
 */

/**
 * @typedef {Object} PersistedSessionState
 * @property {Session[]} sessions
 * @property {string} activeSessionId
 * @property {number} version - Schema version for migration
 */

/** Current schema version for persisted session state */
export const SESSION_STATE_VERSION = 1;

/**
 * Mapping of page keys to their corresponding canvas page components and display titles.
 * Used to resolve which component to render for a given page key.
 */
export const SOURCE_PAGE_MOCK = {
  logs: { component: LogsPageMock, title: 'Logs' },
  alerts: { component: AlertPageMock, title: 'Alerts' },
  'alerts-list': { component: AlertListPageMock, title: 'Alerts' },
  'alerts-detail': { component: AlertPageMock, title: 'Alerts Detail' },
  dashboards: { component: DashboardPageMock, title: 'Dashboards' },
  'dashboards-list': { component: DashboardListPageMock, title: 'Dashboards' },
  notebooks: { component: InventoryAnalysisPageMock, title: 'Notebooks' },
  metrics: { component: ConnectionPoolPageMock, title: 'Metrics' },
  discover: { component: LogsPageMock, title: 'Discover' },
  'discover-log': { component: EmptyDiscoverPageMock, title: 'Discover (log)' },
  'discover-log-correlated': {
    component: CorrelatedLogsDiscoverMock,
    title: 'Correlated Logs',
  },
  'discover-metric': {
    component: EmptyDiscoverPageMock,
    title: 'Discover (Metric)',
  },
  'app-map': { component: AppMapPageMock, title: 'Application Map' },
  'app-traces': { component: AppTracesPageMock, title: 'Application Traces' },
  'app-services': {
    component: AppServicesPageMock,
    title: 'Application Services',
  },
  'app-perf-services': {
    component: ServicePage,
    title: 'Application Performance Services',
  },
  'service-detail': { component: ServiceDetailPage, title: 'Service Detail' },
  'alert-rule': { component: AlertRulePage, title: 'Alert Rule' },
  traces: { component: TraceAnalysisPageMock, title: 'Trace Analysis' },
  forecasting: { component: AppServicesPageMock, title: 'Forecasting' },
  'agent-spans': { component: AppServicesPageMock, title: 'Agent Spans' },
  'overview-home': { component: OverviewHomePage, title: 'Overview' },
};

/**
 * Creates a default empty session.
 *
 * @param {string} [id] - Optional session ID. If not provided, a unique ID is generated.
 * @returns {Session}
 */
export function createDefaultSession(id) {
  return {
    id: id || `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    threadKey: null,
    pendingThread: null,
    tabs: [],
    activeTabId: null,
    threadPanelState: 'minimized',
    threadPanelWidth: 50,
    createdAt: Date.now(),
    title: 'New Session',
  };
}
