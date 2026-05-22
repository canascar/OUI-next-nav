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

import React, { useState, useRef, useCallback, useEffect } from 'react';

import { SamplePagesLeftNav } from './sample_pages_left_nav';
import { DetailPagePanel } from './detail_page_panel';
import { ServicePage } from './service_page';
import { LogsPage } from './logs_page';
import { MetricsPage } from './metrics_page';
import { ThreadPage } from './thread_page';
import { AlertsPage } from './alerts_page';
import { DashboardsPage } from './dashboards_page';
import { SkillsPage } from './skills_page';
import { AssetsPage } from './assets_page';
import { ApplicationMapPage } from './application_map_page';
import { TopologyMapPage } from './topology_map_page';
import { AgentMonitoringTracesPage } from './agent_monitoring_traces_page';
import { AgentMonitoringSpansPage } from './agent_monitoring_spans_page';
import { AppPerfTracesPage } from './app_perf_traces_page';
import { HomePage } from './home_page';
import { WorkspacePage } from './workspace_page';
import { SettingsPage } from './settings_page';
import { NotebooksPage } from './notebooks_page';
import { AnomalyDashboardPage } from './anomaly_dashboard_page';
import { DetectorsPage } from './detectors_page';
import { ForecastersPage } from './forecasters_page';
import { AlertsDetailPage } from './alerts_detail_page';
import { MonitorsPage } from './monitors_page';
import { DestinationsPage } from './destinations_page';
import { DataSourcesPage } from './data_sources_page';
import { IndexPatternsPage } from './index_patterns_page';
import { DatasetsPage } from './datasets_page';
import { AssetsDetailPage } from './assets_detail_page';
import { SampleDataPage } from './sample_data_page';
import { AiSkillsPage } from './ai_skills_page';
import { AiMemoriesPage } from './ai_memories_page';
import { AiAutomationsPage } from './ai_automations_page';
import { AiMcpServersPage } from './ai_mcp_servers_page';
import { OuiErrorBoundary } from '../../../../src/components';

import { AskAiPopover } from './ask_ai_popover';
import {
  ALL_DRAGGABLE_ITEMS,
  loadLayout,
  saveLayout,
} from './nav_layout_utils';

// Session-based navigation imports
import { SessionLeftNav } from './session_left_nav';
import { SessionContainer } from './session_container';
import { SessionList } from './session_list';
import { LibraryPage } from './library_page';
import { EmptySessionPage } from './empty_session_page';
import { SOURCE_PAGE_MOCK } from './session_models';
import {
  createSession,
  updateSession,
  setActiveSession,
  openCanvasPage,
} from './session_state_manager';
import { LATENCY_SPIKE_SESSION, ERROR_RATE_SPIKE_SESSION } from './session_mock_data';

const renderPage = (
  activePage,
  selectedItem,
  onContinueAsThread,
  pendingThread,
  navProps,
  onItemSelect,
  isPanelOpen,
  onTogglePanel,
  onPageChange,
  onNavigate,
  isAskAiPanelOpen,
  onAskAiToggle
) => {
  switch (activePage) {
    case 'home':
      return (
        <OuiErrorBoundary>
          <HomePage
            onNavigate={onNavigate}
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'logs':
      return (
        <OuiErrorBoundary>
          <LogsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'metrics':
      return (
        <OuiErrorBoundary>
          <MetricsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'thread':
      return (
        <OuiErrorBoundary>
          <ThreadPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            pendingMessages={
              pendingThread && pendingThread.key === selectedItem
                ? pendingThread.messages
                : null
            }
            sourcePage={
              pendingThread && pendingThread.key === selectedItem
                ? pendingThread.sourcePage
                : null
            }
            sourcePageTitle={
              pendingThread && pendingThread.key === selectedItem
                ? pendingThread.pageTitle
                : null
            }
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            onPageChange={onPageChange}
            onNavigate={onNavigate}
          />
        </OuiErrorBoundary>
      );
    case 'alerts':
      return (
        <OuiErrorBoundary>
          <AlertsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'dashboards':
      return (
        <OuiErrorBoundary>
          <DashboardsPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'skills':
      return (
        <OuiErrorBoundary>
          <SkillsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'assets':
      return (
        <OuiErrorBoundary>
          <AssetsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'application-map':
      return (
        <OuiErrorBoundary>
          <ApplicationMapPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'topology-map':
      return (
        <OuiErrorBoundary>
          <TopologyMapPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'agent-monitoring-traces':
      return (
        <OuiErrorBoundary>
          <AgentMonitoringTracesPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'agent-monitoring-spans':
      return (
        <OuiErrorBoundary>
          <AgentMonitoringSpansPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'app-perf-traces':
      return (
        <OuiErrorBoundary>
          <AppPerfTracesPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'notebooks':
      return (
        <OuiErrorBoundary>
          <NotebooksPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'anomaly-dashboard':
      return (
        <OuiErrorBoundary>
          <AnomalyDashboardPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'detectors':
      return (
        <OuiErrorBoundary>
          <DetectorsPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'forecasters':
      return (
        <OuiErrorBoundary>
          <ForecastersPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'alerts-detail':
      return (
        <OuiErrorBoundary>
          <AlertsDetailPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'monitors-detail':
      return (
        <OuiErrorBoundary>
          <MonitorsPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'destinations':
      return (
        <OuiErrorBoundary>
          <DestinationsPage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'data-sources':
      return (
        <OuiErrorBoundary>
          <DataSourcesPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'index-patterns':
      return (
        <OuiErrorBoundary>
          <IndexPatternsPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'datasets':
      return (
        <OuiErrorBoundary>
          <DatasetsPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'assets-detail':
      return (
        <OuiErrorBoundary>
          <AssetsDetailPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'sample-data':
      return (
        <OuiErrorBoundary>
          <SampleDataPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'manage-workspace':
      return (
        <OuiErrorBoundary>
          <WorkspacePage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'ai-skills':
      return (
        <OuiErrorBoundary>
          <AiSkillsPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'ai-memories':
      return (
        <OuiErrorBoundary>
          <AiMemoriesPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'ai-automations':
      return (
        <OuiErrorBoundary>
          <AiAutomationsPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'ai-mcp-servers':
      return (
        <OuiErrorBoundary>
          <AiMcpServersPage
            selectedItem={selectedItem}
            onItemSelect={onItemSelect}
            onContinueAsThread={onContinueAsThread}
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
    case 'settings':
      return (
        <OuiErrorBoundary>
          <SettingsPage />
        </OuiErrorBoundary>
      );
    case 'app-perf-services':
    case 'service':
    default:
      return (
        <OuiErrorBoundary>
          <ServicePage
            onContinueAsThread={onContinueAsThread}
            isAskAiPanelOpen={isAskAiPanelOpen}
            onAskAiToggle={onAskAiToggle}
          />
        </OuiErrorBoundary>
      );
  }
};

export const SamplePagesView = () => {
  const [activePage, setActivePage] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingThread, setPendingThread] = useState(null); // { key, messages }
  const [expandAnim, setExpandAnim] = useState(null); // { fromRect, prompt, response }
  const [isNavAskAiOpen, setIsNavAskAiOpen] = useState(false);
  const [navAskAiInitialPrompt, setNavAskAiInitialPrompt] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isPanelCollapsing, setIsPanelCollapsing] = useState(false);
  const [isAskAiPanelOpen, setIsAskAiPanelOpen] = useState(false);
  const [isAskAiPanelClosing, setIsAskAiPanelClosing] = useState(false);
  const [askAiDetached, setAskAiDetached] = useState(false);
  const createThreadRef = useRef(null);
  const contentRef = useRef(null);
  const animTimerRef = useRef(null);
  const skipPanelOpenRef = useRef(false);

  // Lifted nav layout state
  const [mainItems, setMainItems] = useState([]);
  const [overflowItems, setOverflowItems] = useState([]);

  useEffect(() => {
    const layout = loadLayout(ALL_DRAGGABLE_ITEMS);
    setMainItems(layout.mainKeys);
    setOverflowItems(layout.overflowKeys);
  }, []);

  const handleLayoutChange = useCallback((newMain, newOverflow) => {
    setMainItems(newMain);
    setOverflowItems(newOverflow);
    saveLayout(newMain, newOverflow);
  }, []);

  const PANEL_CONFIGS = {
    thread: {
      title: 'Thread',
      items: [
        {
          key: 'latency-spike',
          title: 'Latency spike investigation',
          subtitle: 'Use for investigation demo · 2 hours ago',
        },
        {
          key: 'checkout-error',
          title: 'Checkout error rate alert',
          subtitle: 'Placeholder only · 5 hours ago',
        },

        {
          key: 'disk-pressure',
          title: 'Node disk pressure alerts',
          subtitle: 'Placeholder only · 1 day ago',
        },
        {
          key: 'connection-timeout',
          title: 'Connection timeout investigation',
          subtitle: 'Demo flow · just now',
        },
        {
          key: 'tool-demo-1',
          title: 'Thread tool demo 1',
          subtitle: 'Emily Zhang · 30 min ago',
        },
        {
          key: 'tool-demo-2',
          title: 'Thread tool demo 2',
          subtitle: 'Carlos Rivera · 1 hour ago',
        },
        {
          key: 'tool-demo-3',
          title: 'Thread tool demo 3',
          subtitle: 'Aisha Patel · 2 hours ago',
        },
      ],
    },
    dashboards: {
      title: 'Dashboards',
      items: [
        {
          key: 'system-overview',
          title: 'System overview',
          subtitle: 'Updated 5 min ago',
        },
        {
          key: 'web-traffic',
          title: 'Web traffic analytics',
          subtitle: 'Updated 15 min ago',
        },
        {
          key: 'api-performance',
          title: 'API performance',
          subtitle: 'Updated 30 min ago',
        },
        {
          key: 'payment-pool-dashboard',
          title: 'Payment service — connection pool',
          subtitle: 'Created from thread · just now',
        },
      ],
    },
    logs: {
      title: 'Logs',
      tabs: [
        { id: 'saved-logs', name: 'Saved results' },
        { id: 'saved-results', name: 'Saved query' },
      ],
      tabItems: {
        'saved-logs': [
          {
            key: 'error-rate',
            title: 'Error rate by service',
            subtitle: 'source=logs | where level="ERROR"',
          },
          {
            key: 'auth-failures',
            title: 'Auth failure events',
            subtitle: 'source=logs | where event="auth_fail"',
          },
          {
            key: 'slow-queries',
            title: 'Slow query log',
            subtitle: 'source=logs | where duration > 5000',
          },
          {
            key: 'payment-timeout-logs',
            title: 'Payment service timeout logs',
            subtitle: 'source=payment | where level="WARN"',
          },
          {
            key: 'connection-timeout-errors',
            title: 'Connection timeout errors',
            subtitle:
              'source=logs | where severity="ERROR" | stats count() by message',
          },
        ],
        'saved-results': [
          {
            key: 'query-latency-by-host',
            title: 'Latency by host',
            subtitle: 'source=logs | stats avg(latency) by host',
          },
          {
            key: 'query-5xx-responses',
            title: '5xx responses',
            subtitle:
              'source=logs | where status >= 500 | stats count() by path',
          },
          {
            key: 'query-top-users',
            title: 'Top users by request count',
            subtitle:
              'source=logs | stats count() as requests by user | sort -requests | head 50',
          },
        ],
      },
      items: [
        {
          key: 'error-rate',
          title: 'Error rate by service',
          subtitle: 'source=logs | where level="ERROR"',
        },
        {
          key: 'auth-failures',
          title: 'Auth failure events',
          subtitle: 'source=logs | where event="auth_fail"',
        },
        {
          key: 'slow-queries',
          title: 'Slow query log',
          subtitle: 'source=logs | where duration > 5000',
        },
      ],
    },
    metrics: {
      title: 'Metrics',
      tabs: [
        { id: 'saved-metrics', name: 'Saved results' },
        { id: 'saved-results', name: 'Saved query' },
      ],
      tabItems: {
        'saved-metrics': [
          {
            key: 'throughput',
            title: 'Throughput over time',
            subtitle: 'source=metrics | stats avg(throughput)',
          },
          {
            key: 'cpu-utilization',
            title: 'CPU utilization',
            subtitle: 'source=metrics | stats avg(cpu) by host',
          },
          {
            key: 'memory-pressure',
            title: 'Memory pressure',
            subtitle: 'source=metrics | stats max(mem_used)',
          },
        ],
        'saved-results': [
          {
            key: 'query-disk-io',
            title: 'Disk I/O by volume',
            subtitle:
              'source=metrics | stats avg(disk_io) by volume | sort -avg_disk_io',
          },
          {
            key: 'query-network-errors',
            title: 'Network error rate',
            subtitle:
              'source=metrics | where net_errors > 0 | stats sum(net_errors) by interface',
          },
          {
            key: 'query-gc-pauses',
            title: 'GC pause duration',
            subtitle:
              'source=metrics | stats max(gc_pause_ms) by service | sort -max_gc_pause_ms',
          },
        ],
      },
      items: [
        {
          key: 'throughput',
          title: 'Throughput over time',
          subtitle: 'source=metrics | stats avg(throughput)',
        },
        {
          key: 'cpu-utilization',
          title: 'CPU utilization',
          subtitle: 'source=metrics | stats avg(cpu) by host',
        },
        {
          key: 'memory-pressure',
          title: 'Memory pressure',
          subtitle: 'source=metrics | stats max(mem_used)',
        },
      ],
    },
    notebooks: {
      title: 'Notebooks',
      items: [
        {
          key: 'notebook-runbook',
          title: 'Runbook checklist',
          subtitle: 'Last edited 2 hours ago',
        },
        {
          key: 'notebook-incident',
          title: 'Incident postmortem',
          subtitle: 'Last edited 1 day ago',
        },
        {
          key: 'notebook-capacity',
          title: 'Capacity planning',
          subtitle: 'Last edited 3 days ago',
        },
        {
          key: 'notebook-inventory-analysis',
          title: 'Inventory service dependency analysis',
          subtitle: 'Created from thread · just now',
        },
        {
          key: 'notebook-connection-pool',
          title: 'Payment service connection pool metrics',
          subtitle: 'Created from thread · just now',
        },
      ],
    },
    detectors: {
      title: 'Detectors',
      items: [
        {
          key: 'detector-cpu',
          title: 'CPU anomaly detector',
          subtitle: 'ML · Active',
        },
        {
          key: 'detector-latency',
          title: 'Latency anomaly detector',
          subtitle: 'ML · Active',
        },
        {
          key: 'detector-error',
          title: 'Error rate detector',
          subtitle: 'ML · Draft',
        },
      ],
    },
    'alerts-detail': {
      title: 'Alerts',
      items: [
        {
          key: 'alert-cpu-threshold',
          title: 'CPU threshold exceeded',
          subtitle: 'Critical · 10 min ago',
        },
        {
          key: 'alert-disk-usage',
          title: 'Disk usage warning',
          subtitle: 'Warning · 1 hour ago',
        },
        {
          key: 'alert-error-spike',
          title: 'Error rate spike',
          subtitle: 'Critical · 3 hours ago',
        },
        {
          key: 'alert-payment-p99',
          title: 'Payment service P99 latency breach',
          subtitle: 'Critical · 15 min ago',
        },
      ],
    },
    'monitors-detail': {
      title: 'Monitors',
      items: [
        {
          key: 'monitor-uptime',
          title: 'Uptime monitor',
          subtitle: 'HTTP · Every 5 min · Active',
        },
        {
          key: 'monitor-latency',
          title: 'Latency threshold',
          subtitle: 'Query · Every 1 min · Active',
        },
        {
          key: 'monitor-log-volume',
          title: 'Log volume spike',
          subtitle: 'Bucket · Every 10 min · Paused',
        },
      ],
    },
    'data-sources': {
      title: 'Data sources',
      items: [
        {
          key: 'ds-faos219prod',
          title: 'FAOS219prod',
          subtitle: 'OpenSearch 2.19 · Production',
        },
        {
          key: 'ds-os-219',
          title: 'OS 219',
          subtitle: 'OpenSearch 2.19 · Development',
        },
        {
          key: 'ds-olly-stable',
          title: 'Olly@stableDefault',
          subtitle: 'OpenSearch · Observability',
        },
      ],
    },
    'index-patterns': {
      title: 'Index patterns',
      items: [
        { key: 'ip-logs', title: 'logs-*', subtitle: 'Matches 12 indices' },
        {
          key: 'ip-metrics',
          title: 'metrics-*',
          subtitle: 'Matches 8 indices',
        },
        { key: 'ip-traces', title: 'traces-*', subtitle: 'Matches 5 indices' },
      ],
    },
    datasets: {
      title: 'Datasets',
      items: [
        {
          key: 'dataset-web-logs',
          title: 'Web server logs',
          subtitle: '2.4 GB · Updated 5 min ago',
        },
        {
          key: 'dataset-app-traces',
          title: 'Application traces',
          subtitle: '1.1 GB · Updated 10 min ago',
        },
        {
          key: 'dataset-system-metrics',
          title: 'System metrics',
          subtitle: '890 MB · Updated 1 min ago',
        },
      ],
    },
    'assets-detail': {
      title: 'Assets',
      items: [
        {
          key: 'asset-web-fleet',
          title: 'Web server fleet',
          subtitle: '12 hosts · Healthy',
        },
        {
          key: 'asset-payment',
          title: 'Payment gateway',
          subtitle: '3 endpoints · Warning',
        },
        {
          key: 'asset-pipeline',
          title: 'Data pipeline cluster',
          subtitle: '8 nodes · Healthy',
        },
      ],
    },
    'sample-data': {
      title: 'Sample data',
      items: [
        {
          key: 'sample-ecommerce',
          title: 'Sample eCommerce orders',
          subtitle: 'Preloaded dataset',
        },
        {
          key: 'sample-flights',
          title: 'Sample flight data',
          subtitle: 'Preloaded dataset',
        },
        {
          key: 'sample-web-logs',
          title: 'Sample web logs',
          subtitle: 'Preloaded dataset',
        },
      ],
    },
    'ai-skills': {
      title: 'Skills',
      items: [
        {
          key: 'skill-anomaly-detector',
          title: 'Anomaly detector',
          subtitle: 'ML · Active',
        },
        {
          key: 'skill-log-summarizer',
          title: 'Log summarizer',
          subtitle: 'NLP · Active',
        },
        {
          key: 'skill-root-cause',
          title: 'Root cause analysis',
          subtitle: 'ML · Active',
        },
      ],
    },
    'ai-memories': {
      title: 'Memories',
      items: [
        {
          key: 'memory-incident-patterns',
          title: 'Incident patterns',
          subtitle: '24 entries · Updated 1 hour ago',
        },
        {
          key: 'memory-runbook-steps',
          title: 'Runbook steps',
          subtitle: '12 entries · Updated 3 hours ago',
        },
        {
          key: 'memory-team-prefs',
          title: 'Team preferences',
          subtitle: '8 entries · Updated 1 day ago',
        },
      ],
    },
    'ai-automations': {
      title: 'Automations',
      items: [
        {
          key: 'auto-alert-triage',
          title: 'Alert triage',
          subtitle: 'Trigger: New alert · Active',
        },
        {
          key: 'auto-log-cleanup',
          title: 'Log cleanup',
          subtitle: 'Schedule: Daily · Active',
        },
        {
          key: 'auto-report-gen',
          title: 'Report generation',
          subtitle: 'Schedule: Weekly · Paused',
        },
      ],
    },
    'ai-mcp-servers': {
      title: 'MCP Servers',
      items: [
        {
          key: 'mcp-opensearch',
          title: 'OpenSearch',
          subtitle: 'Connected · 3 tools',
        },
        {
          key: 'mcp-prometheus',
          title: 'Prometheus',
          subtitle: 'Connected · 5 tools',
        },
        {
          key: 'mcp-slack',
          title: 'Slack',
          subtitle: 'Disconnected · 2 tools',
        },
      ],
    },
  };

  const panelConfig = PANEL_CONFIGS[activePage];

  // Reset panel to open when switching pages (unless navigated from popover item)
  const PANEL_CLOSED_BY_DEFAULT = new Set(['logs', 'metrics']);

  useEffect(() => {
    if (skipPanelOpenRef.current) {
      skipPanelOpenRef.current = false;
      setIsPanelOpen(false);
    } else if (PANEL_CLOSED_BY_DEFAULT.has(activePage)) {
      setIsPanelOpen(false);
    } else {
      setIsPanelOpen(true);
    }
    setIsPanelCollapsing(false);
  }, [activePage]);

  const handlePanelClose = useCallback(() => {
    setIsPanelCollapsing(true);
    setTimeout(() => {
      setIsPanelOpen(false);
      setIsPanelCollapsing(false);
    }, 200);
  }, []);

  const DEFAULT_ITEMS = {
    service: 'services',
    logs: null,
    metrics: null,
    thread: 'latency-spike',
    alerts: 'cpu-threshold',
    dashboards: 'system-overview',
    skills: 'anomaly-detector',
    assets: 'web-server-fleet',
    'topology-map': null,
    'agent-monitoring-traces': null,
    'agent-monitoring-spans': null,
    'app-perf-traces': null,
    'app-perf-services': null,
    tools: null,
    notebooks: 'notebook-runbook',
    'anomaly-dashboard': null,
    detectors: 'detector-cpu',
    forecasters: null,
    'alerts-detail': 'alert-cpu-threshold',
    'monitors-detail': 'monitor-uptime',
    destinations: null,
    'data-sources': 'ds-faos219prod',
    'index-patterns': 'ip-logs',
    datasets: 'dataset-web-logs',
    'assets-detail': 'asset-web-fleet',
    'sample-data': 'sample-ecommerce',
    'ai-skills': 'skill-anomaly-detector',
    'ai-memories': 'memory-incident-patterns',
    'ai-automations': 'auto-alert-triage',
    'ai-mcp-servers': 'mcp-opensearch',
  };

  const handlePageChange = (page) => {
    if (page === activePage) {
      // Re-clicking the same tab — reopen the panel if it was closed
      if (!PANEL_CLOSED_BY_DEFAULT.has(page)) {
        setIsPanelOpen(true);
        setIsPanelCollapsing(false);
      }
      setSelectedItem(DEFAULT_ITEMS[page] || null);
      return;
    }
    setActivePage(page);
    setSelectedItem(DEFAULT_ITEMS[page] || null);
  };

  const handlePopoverNavigate = useCallback((page, itemKey) => {
    skipPanelOpenRef.current = true;
    setActivePage(page);
    setSelectedItem(itemKey || null);
  }, []);

  const handleViewAll = useCallback(
    (page) => {
      if (page === activePage) {
        setIsPanelOpen(true);
        setIsPanelCollapsing(false);
      } else {
        skipPanelOpenRef.current = true;
        setActivePage(page);
        setSelectedItem(DEFAULT_ITEMS[page] || null);
        // Force panel open after the skipPanelOpenRef useEffect runs
        setTimeout(() => {
          setIsPanelOpen(true);
          setIsPanelCollapsing(false);
        }, 0);
      }
    },
    [activePage]
  );

  const handleNavAskAi = useCallback((text) => {
    setNavAskAiInitialPrompt(text || '');
    setIsNavAskAiOpen(true);
  }, []);

  const handleAskAiToggle = useCallback(() => {
    if (isAskAiPanelOpen) {
      // Trigger close animation
      setIsAskAiPanelClosing(true);
      setTimeout(() => {
        setIsAskAiPanelOpen(false);
        setIsAskAiPanelClosing(false);
      }, 200);
    } else {
      setIsAskAiPanelOpen(true);
      setAskAiDetached(false);
    }
  }, [isAskAiPanelOpen]);

  const handleAskAiDetach = useCallback(() => {
    setIsAskAiPanelClosing(true);
    setTimeout(() => {
      setIsAskAiPanelOpen(false);
      setIsAskAiPanelClosing(false);
      setAskAiDetached(true);
    }, 200);
  }, []);

  const handleAskAiDetachedClose = useCallback(() => {
    setAskAiDetached(false);
  }, []);

  const handleAskAiPanelClose = useCallback(() => {
    setIsAskAiPanelClosing(true);
    setTimeout(() => {
      setIsAskAiPanelOpen(false);
      setIsAskAiPanelClosing(false);
    }, 200);
  }, []);

  const handleAskAiPanelMinimize = useCallback(() => {
    setIsAskAiPanelClosing(true);
    setTimeout(() => {
      setIsAskAiPanelOpen(false);
      setIsAskAiPanelClosing(false);
    }, 200);
  }, []);

  // Clean up animation timer on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const handleContinueAsThread = useCallback(
    (prompt, response, popoverRect, pageTitle) => {
      const PAGE_META = {
        logs: {
          description:
            'Filtered log results showing recent entries, error distribution, and event patterns.',
        },
        metrics: {
          description:
            'Metrics visualization with time-series data and service performance indicators.',
        },
        discover: {
          description:
            'Query results from data exploration with field breakdowns and event timeline.',
        },
        alerts: {
          description:
            'Active alerts overview with severity levels, trigger conditions, and acknowledgment status.',
        },
        'alerts-detail': {
          description:
            'Alert investigation view with trigger history, correlated metrics, and notification timeline.',
        },
        dashboards: {
          description:
            'Dashboard panels showing aggregated metrics, visualizations, and saved queries.',
        },
        notebooks: {
          description:
            'Notebook with analysis steps, inline visualizations, and query results.',
        },
        'topology-map': {
          description:
            'Service topology showing dependencies, traffic flow, and health indicators.',
        },
        'application-map': {
          description:
            'Application dependency map with latency paths and error propagation.',
        },
        'app-perf-traces': {
          description:
            'Distributed traces with span breakdown, latency waterfall, and service hops.',
        },
        'agent-monitoring-traces': {
          description:
            'Agent execution traces showing tool calls, reasoning steps, and response times.',
        },
        'agent-monitoring-spans': {
          description:
            'Agent span details with duration, token usage, and execution context.',
        },
        assets: {
          description:
            'Asset inventory with resource metadata, ownership, and related configurations.',
        },
        skills: {
          description:
            'AI skill definitions with trigger conditions, actions, and execution history.',
        },
      };

      const sourcePage = activePage;
      const meta = PAGE_META[sourcePage];
      // Use the actual page title passed from DetailPageHeader, fall back to sourcePage
      const displayTitle = pageTitle || sourcePage;
      const userAttachment = {
        type: 'link-preview',
        title: displayTitle,
        description: meta ? meta.description : null,
      };

      const messages = [
        {
          role: 'user',
          author: 'You',
          content: prompt,
          attachment: userAttachment,
        },
        { role: 'assistant', content: response, streaming: false },
      ];

      if (popoverRect && contentRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect();
        // Start expand animation with both popover and page
        setExpandAnim({ fromRect: popoverRect, contentRect, prompt, response });

        // After animation completes, navigate
        animTimerRef.current = setTimeout(() => {
          setExpandAnim(null);
          skipPanelOpenRef.current = true;
          setActivePage('thread');
          if (createThreadRef.current) {
            const newKey = createThreadRef.current();
            setPendingThread({
              key: newKey,
              messages,
              sourcePage,
              pageTitle: displayTitle,
            });
          }
        }, 400);
      } else {
        // Fallback: no animation
        skipPanelOpenRef.current = true;
        setActivePage('thread');
        if (createThreadRef.current) {
          const newKey = createThreadRef.current();
          setPendingThread({
            key: newKey,
            messages,
            sourcePage,
            pageTitle: displayTitle,
          });
        }
      }
    },
    [activePage]
  );

  // Compute the animation overlay style
  const renderExpandOverlay = () => {
    if (!expandAnim || !contentRef.current) return null;

    const { fromRect, contentRect, prompt, response } = expandAnim;

    // Conversation column target: left 60% of content area
    const convWidth = contentRect.width * 0.6;
    // Canvas target: right 40% of content area
    const canvasLeft = contentRect.left + convWidth;
    const canvasWidth = contentRect.width - convWidth;

    return (
      <>
        {/* Popover expanding to conversation column */}
        <div
          className="askAiExpandOverlay askAiExpandOverlay--popover"
          style={{
            '--from-left': `${fromRect.left}px`,
            '--from-top': `${fromRect.top}px`,
            '--from-width': `${fromRect.width}px`,
            '--from-height': `${fromRect.height}px`,
            '--to-left': `${contentRect.left}px`,
            '--to-top': `${contentRect.top}px`,
            '--to-width': `${convWidth}px`,
            '--to-height': `${contentRect.height}px`,
          }}>
          <div className="askAiExpandOverlay__content">
            <div className="askAiExpandOverlay__messages">
              <div className="askAiPopover__msg askAiPopover__msg--user">
                <p style={{ margin: 0, fontSize: 14 }}>{prompt}</p>
              </div>
              <div className="askAiPopover__msg askAiPopover__msg--assistant">
                <p style={{ margin: 0, fontSize: 14 }}>{response}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Page collapsing to canvas panel */}
        <div
          className="askAiExpandOverlay askAiExpandOverlay--page"
          style={{
            '--from-left': `${contentRect.left}px`,
            '--from-top': `${contentRect.top}px`,
            '--from-width': `${contentRect.width}px`,
            '--from-height': `${contentRect.height}px`,
            '--to-left': `${canvasLeft}px`,
            '--to-top': `${contentRect.top}px`,
            '--to-width': `${canvasWidth}px`,
            '--to-height': `${contentRect.height}px`,
          }}
        />
      </>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePendingConsumed = useCallback(() => {
    setPendingThread(null);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      <SamplePagesLeftNav
        activePage={activePage}
        onPageChange={handlePageChange}
        onPopoverNavigate={handlePopoverNavigate}
        onViewAll={handleViewAll}
        onItemSelect={setSelectedItem}
        selectedItem={selectedItem}
        onLogoClick={() => handlePageChange('home')}
        createThreadRef={createThreadRef}
        onContinueAsThread={handleContinueAsThread}
        onAskAi={handleNavAskAi}
        mainItems={mainItems}
        overflowItems={overflowItems}
        onLayoutChange={handleLayoutChange}
      />
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '8px 8px 8px 0',
          display: 'flex',
        }}>
        <div
          className="samplePagesContentPanel"
          style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          {renderPage(
            activePage,
            selectedItem,
            handleContinueAsThread,
            pendingThread,
            {
              mainItems,
              overflowItems,
              onLayoutChange: handleLayoutChange,
            },
            setSelectedItem,
            isPanelOpen,
            () => (isPanelOpen ? handlePanelClose() : setIsPanelOpen(true)),
            handlePageChange,
            handlePopoverNavigate,
            isAskAiPanelOpen,
            handleAskAiToggle
          )}
          {panelConfig && isPanelOpen && (
            <>
              <div
                className={`detailPageFlyout__cover${
                  isPanelCollapsing ? ' detailPageFlyout__cover--closing' : ''
                }`}
                onClick={handlePanelClose}
              />
              <div
                className={`detailPageFlyout${
                  isPanelCollapsing ? ' detailPageFlyout--closing' : ''
                }`}>
                <DetailPagePanel
                  title={panelConfig.title}
                  items={panelConfig.items}
                  tabs={panelConfig.tabs}
                  tabItems={panelConfig.tabItems}
                  selectedItem={selectedItem}
                  onItemSelect={(key) => {
                    setSelectedItem(key);
                    handlePanelClose();
                  }}
                  onClose={handlePanelClose}
                />
              </div>
            </>
          )}
        </div>
        {isAskAiPanelOpen && (
          <div
            className={`askAiPanel${
              isAskAiPanelClosing ? ' askAiPanel--closing' : ''
            }`}>
            <AskAiPopover
              isOpen={isAskAiPanelOpen}
              mode="panel"
              onClose={handleAskAiPanelClose}
              onMinimize={handleAskAiPanelMinimize}
              onDetach={handleAskAiDetach}
              onContinueAsThread={handleContinueAsThread}
            />
          </div>
        )}
      </div>
      {renderExpandOverlay()}

      {/* Ask AI detached popover (floating mode after clicking detach from panel) */}
      {askAiDetached && (
        <div className="askAiFloating" style={{ pointerEvents: 'auto' }}>
          <AskAiPopover
            isOpen={askAiDetached}
            mode="popover"
            onClose={handleAskAiDetachedClose}
            onMinimize={handleAskAiDetachedClose}
            onContinueAsThread={handleContinueAsThread}
          />
        </div>
      )}

      {/* Ask AI popover triggered from search */}
      {isNavAskAiOpen && (
        <div className="navAskAiPopover__anchor">
          <AskAiPopover
            isOpen={isNavAskAiOpen}
            onClose={() => {
              setIsNavAskAiOpen(false);
              setNavAskAiInitialPrompt('');
            }}
            onContinueAsThread={handleContinueAsThread}
            initialPrompt={navAskAiInitialPrompt}
          />
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Session-Based Navigation View
// ---------------------------------------------------------------------------

/**
 * Initializes session state with mock data when no persisted state exists.
 * On first load, creates default sessions including the latency-spike mock
 * and page-first mock so both flows are accessible from SessionList.
 *
 * @returns {import('./session_models').PersistedSessionState}
 */
function initializeSessionState() {
  // Always start fresh — no persistence
  // Include the Latency Spike Investigation demo session in the list
  // but land on a new empty session
  const emptySession = {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    threadKey: null,
    pendingThread: null,
    title: 'New Session',
    threadPanelState: 'minimized',
    threadPanelWidth: 30,
    tabs: [],
    activeTabId: null,
    createdAt: Date.now(),
  };

  return {
    sessions: [emptySession, LATENCY_SPIKE_SESSION, ERROR_RATE_SPIKE_SESSION],
    activeSessionId: emptySession.id,
    version: 1,
  };
}

/**
 * SessionPagesView — Session-based navigation version of SamplePagesView.
 *
 * Replaces the icon-based left nav with a session model where each session
 * is an independent workspace containing a thread panel and page panel with tabs.
 */
export const SessionPagesView = () => {
  // Session state: sessions array + activeSessionId
  const [sessionState, setSessionState] = useState(initializeSessionState);

  // Active view: 'session' (show active session) or 'session-list' (browse all sessions)
  const [activeView, setActiveView] = useState('session');

  // Derive active session from state
  const activeSession = sessionState.sessions.find(
    (s) => s.id === sessionState.activeSessionId
  );

  // --- Left Nav handlers ---

  /** Plus_Button: navigate to empty session, or create one if none exists */
  const handleCreateSession = useCallback(() => {
    setSessionState((prev) => {
      // If the active session is already empty, just stay on it
      const active = prev.sessions.find((s) => s.id === prev.activeSessionId);
      if (
        active &&
        !active.threadKey &&
        !active.pendingThread &&
        active.tabs.length === 0
      ) {
        return prev;
      }
      // Otherwise create a new session
      return createSession(prev);
    });
    setActiveView('session');
  }, []);

  /** Sessions_Button: show the session list */
  const handleBrowseSessions = useCallback(() => {
    setActiveView('session-list');
  }, []);

  /** Library_Button: show the library page */
  const handleBrowseLibrary = useCallback(() => {
    setActiveView('library');
  }, []);

  // --- Session List handlers ---

  /** Select a session from the list */
  const handleSelectSession = useCallback((sessionId) => {
    setSessionState((prev) => {
      const updated = setActiveSession(prev, sessionId);
      // Unhide the session when selected
      return {
        ...updated,
        sessions: updated.sessions.map((s) =>
          s.id === sessionId ? { ...s, hidden: false } : s
        ),
      };
    });
    setActiveView('session');
  }, []);

  // --- Session Container handlers ---

  /** Partial update to the active session */
  const handleUpdateSession = useCallback((updates) => {
    setSessionState((prev) => {
      if (!prev.activeSessionId) return prev;
      return updateSession(prev, prev.activeSessionId, updates);
    });
  }, []);

  /** Open a canvas page as a tab in the active session */
  const handleOpenCanvasPage = useCallback((pageKey, title) => {
    setSessionState((prev) => {
      if (!prev.activeSessionId) return prev;
      const pageEntry = SOURCE_PAGE_MOCK[pageKey];
      const displayTitle = title || (pageEntry ? pageEntry.title : pageKey);
      return openCanvasPage(prev, prev.activeSessionId, pageKey, displayTitle);
    });
  }, []);

  // --- EmptySessionPage handlers ---

  /** Start a new thread from the empty session page */
  const handleStartThread = useCallback((prompt) => {
    setSessionState((prev) => {
      if (!prev.activeSessionId) return prev;
      const threadKey = `thread-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      const pendingThread = {
        key: threadKey,
        messages: prompt
          ? [{ role: 'user', author: 'You', content: prompt }]
          : [],
        sourcePageTitle: null,
      };
      return updateSession(prev, prev.activeSessionId, {
        threadKey,
        pendingThread,
        threadPanelState: 'full-screen',
        title: prompt ? prompt.slice(0, 40) : 'New Thread',
      });
    });
  }, []);

  /** Open a page from the empty session page */
  const handleOpenPage = useCallback(
    (pageKey, title) => {
      const pageEntry = SOURCE_PAGE_MOCK[pageKey];
      const displayTitle = title || (pageEntry ? pageEntry.title : pageKey);
      handleOpenCanvasPage(pageKey, displayTitle);
    },
    [handleOpenCanvasPage]
  );

  // --- Render ---

  /** Determine if the active session should show EmptySessionPage */
  const isEmptySession =
    activeSession &&
    !activeSession.threadKey &&
    !activeSession.pendingThread &&
    activeSession.tabs.length === 0;

  const renderMainContent = () => {
    if (activeView === 'session-list') {
      // Filter out empty sessions (not yet "created")
      const existingSessions = sessionState.sessions.filter(
        (s) => s.threadKey || s.pendingThread || s.tabs.length > 0
      );
      return (
        <SessionList
          sessions={existingSessions}
          activeSessionId={sessionState.activeSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
        />
      );
    }

    if (activeView === 'library') {
      return (
        <LibraryPage
          onSelectPage={(pageKey, title) => {
            // Create a new session with the page open and chat minimized
            setSessionState((prev) => {
              const next = createSession(prev);
              const newSessionId = next.activeSessionId;
              const tab = {
                id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                pageKey,
                title,
              };
              return updateSession(next, newSessionId, {
                tabs: [tab],
                activeTabId: tab.id,
                threadPanelState: 'minimized',
                title,
              });
            });
            setActiveView('session');
          }}
        />
      );
    }

    if (!activeSession) {
      return null;
    }

    if (isEmptySession) {
      return (
        <EmptySessionPage
          onStartThread={handleStartThread}
          onOpenPage={handleOpenPage}
          onViewSession={() => {
            handleSelectSession('latency-spike-session');
          }}
          onStartInvestigation={() => {
            // Open alert page in the right pane, expand chat pane with investigation prompt
            handleOpenCanvasPage('alerts', 'Alert: P95 Latency > 2s');
            const threadKey = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const pendingThread = {
              key: threadKey,
              messages: [
                { role: 'user', author: 'You', content: 'Investigate the alert: payment-service P99 latency exceeded 2,000ms threshold on 3 of 4 pods.' },
              ],
              sourcePageTitle: 'Alert: P95 Latency > 2s',
            };
            handleUpdateSession({
              threadPanelState: 'side-by-side',
              threadKey,
              pendingThread,
            });
          }}
          sessions={sessionState.sessions.filter(
            (s) => s.threadKey || s.pendingThread || s.tabs.length > 0
          )}
          onSelectSession={handleSelectSession}
          recentItems={[]}
          favoriteItems={[]}
          systemAlert={null}
        />
      );
    }

    return (
      <SessionContainer
        session={activeSession}
        onUpdateSession={handleUpdateSession}
        onOpenCanvasPage={handleOpenCanvasPage}
      />
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      <SessionLeftNav
        sessionCount={sessionState.sessions.filter(
          (s) => s.threadKey || s.pendingThread || s.tabs.length > 0
        ).length}
        sessions={sessionState.sessions.filter(
          (s) => s.threadKey || s.pendingThread || s.tabs.length > 0
        )}
        onCreateSession={handleCreateSession}
        onBrowseSessions={handleBrowseSessions}
        onBrowseLibrary={handleBrowseLibrary}
        onSelectSession={handleSelectSession}
        activeView={activeView}
        isEmptySession={isEmptySession}
      />
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
        }}>
        {renderMainContent()}
      </div>
    </div>
  );
};
