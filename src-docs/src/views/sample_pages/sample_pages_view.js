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
  onNavigate
) => {
  switch (activePage) {
    case 'home':
      return (
        <OuiErrorBoundary>
          <HomePage />
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
            isPanelOpen={isPanelOpen}
            onTogglePanel={onTogglePanel}
            onPageChange={onPageChange}
          />
        </OuiErrorBoundary>
      );
    case 'alerts':
      return (
        <OuiErrorBoundary>
          <AlertsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
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
          />
        </OuiErrorBoundary>
      );
    case 'skills':
      return (
        <OuiErrorBoundary>
          <SkillsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
          />
        </OuiErrorBoundary>
      );
    case 'assets':
      return (
        <OuiErrorBoundary>
          <AssetsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
          />
        </OuiErrorBoundary>
      );
    case 'application-map':
      return (
        <OuiErrorBoundary>
          <ApplicationMapPage onContinueAsThread={onContinueAsThread} />
        </OuiErrorBoundary>
      );
    case 'topology-map':
      return (
        <OuiErrorBoundary>
          <TopologyMapPage onContinueAsThread={onContinueAsThread} />
        </OuiErrorBoundary>
      );
    case 'agent-monitoring-traces':
      return (
        <OuiErrorBoundary>
          <AgentMonitoringTracesPage onContinueAsThread={onContinueAsThread} />
        </OuiErrorBoundary>
      );
    case 'agent-monitoring-spans':
      return (
        <OuiErrorBoundary>
          <AgentMonitoringSpansPage onContinueAsThread={onContinueAsThread} />
        </OuiErrorBoundary>
      );
    case 'app-perf-traces':
      return (
        <OuiErrorBoundary>
          <AppPerfTracesPage onContinueAsThread={onContinueAsThread} />
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
          />
        </OuiErrorBoundary>
      );
    case 'anomaly-dashboard':
      return (
        <OuiErrorBoundary>
          <AnomalyDashboardPage onContinueAsThread={onContinueAsThread} />
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
          />
        </OuiErrorBoundary>
      );
    case 'forecasters':
      return (
        <OuiErrorBoundary>
          <ForecastersPage onContinueAsThread={onContinueAsThread} />
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
          />
        </OuiErrorBoundary>
      );
    case 'destinations':
      return (
        <OuiErrorBoundary>
          <DestinationsPage onContinueAsThread={onContinueAsThread} />
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
          />
        </OuiErrorBoundary>
      );
    case 'manage-workspace':
      return (
        <OuiErrorBoundary>
          <WorkspacePage onContinueAsThread={onContinueAsThread} />
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
          <ServicePage onContinueAsThread={onContinueAsThread} />
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
          subtitle: 'Sarah Lee · 2 hours ago',
        },
        {
          key: 'checkout-error',
          title: 'Checkout error rate alert',
          subtitle: 'Alex Chen · 5 hours ago',
        },
        {
          key: 'weekly-review',
          title: 'Weekly service review',
          subtitle: 'Team Ops · 1 day ago',
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
            subtitle: 'source=logs | where status >= 500 | stats count() by path',
          },
          {
            key: 'query-top-users',
            title: 'Top users by request count',
            subtitle: 'source=logs | stats count() as requests by user | sort -requests | head 50',
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
            subtitle: 'source=metrics | stats avg(disk_io) by volume | sort -avg_disk_io',
          },
          {
            key: 'query-network-errors',
            title: 'Network error rate',
            subtitle: 'source=metrics | where net_errors > 0 | stats sum(net_errors) by interface',
          },
          {
            key: 'query-gc-pauses',
            title: 'GC pause duration',
            subtitle: 'source=metrics | stats max(gc_pause_ms) by service | sort -max_gc_pause_ms',
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

  const handleNavAskAi = useCallback((text) => {
    setNavAskAiInitialPrompt(text || '');
    setIsNavAskAiOpen(true);
  }, []);

  // Clean up animation timer on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const handleContinueAsThread = useCallback(
    (prompt, response, popoverRect) => {
      const messages = [
        { role: 'user', author: 'You', content: prompt },
        { role: 'assistant', content: response, streaming: false },
      ];

      if (popoverRect && contentRef.current) {
        // Start expand animation
        setExpandAnim({ fromRect: popoverRect, prompt, response });

        // After animation completes, navigate
        animTimerRef.current = setTimeout(() => {
          setExpandAnim(null);
          setActivePage('thread');
          if (createThreadRef.current) {
            const newKey = createThreadRef.current();
            setPendingThread({ key: newKey, messages });
          }
        }, 350);
      } else {
        // Fallback: no animation
        setActivePage('thread');
        if (createThreadRef.current) {
          const newKey = createThreadRef.current();
          setPendingThread({ key: newKey, messages });
        }
      }
    },
    []
  );

  // Compute the animation overlay style
  const renderExpandOverlay = () => {
    if (!expandAnim || !contentRef.current) return null;

    const targetRect = contentRef.current.getBoundingClientRect();
    const { fromRect, prompt, response } = expandAnim;

    return (
      <div
        className="askAiExpandOverlay"
        style={{
          '--from-left': `${fromRect.left}px`,
          '--from-top': `${fromRect.top}px`,
          '--from-width': `${fromRect.width}px`,
          '--from-height': `${fromRect.height}px`,
          '--to-left': `${targetRect.left}px`,
          '--to-top': `${targetRect.top}px`,
          '--to-width': `${targetRect.width}px`,
          '--to-height': `${targetRect.height}px`,
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
            handlePopoverNavigate
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
      </div>
      {renderExpandOverlay()}

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
