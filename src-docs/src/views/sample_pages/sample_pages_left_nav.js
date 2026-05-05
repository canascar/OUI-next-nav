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

import React, {
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import {
  OuiIcon,
  OuiHorizontalRule,
  OuiButtonIcon,
  OuiAvatar,
  OuiListGroup,
  OuiListGroupItem,
  OuiText,
  OuiTitle,
  OuiButtonEmpty,
  OuiPopover,
  OuiTabs,
  OuiTab,
  OuiToolTip,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';
import { ALL_DRAGGABLE_ITEMS } from './nav_layout_utils';
import { SearchPopover } from './search_popover';

const NAV_ITEMS = [
  { key: 'search', label: 'Search', icon: 'search', isAction: true },
  { key: 'thread', label: 'Threads', icon: 'navTicketing', rulerAfter: true },
  // Essentials
  {
    key: 'dashboards',
    label: 'Dashboards',
    icon: 'navDashboards',
    sectionHeader: 'Essentials',
    group: 'essentials',
  },
  { key: 'logs', label: 'Logs', icon: 'navDiscover', group: 'essentials' },
  { key: 'metrics', label: 'Metrics', icon: 'visArea', group: 'essentials' },
  {
    key: 'topology-map',
    label: 'Topology map',
    icon: 'navAiFlow',
    rulerAfter: true,
    group: 'essentials',
  },
  // Agent monitoring
  {
    key: 'agent-monitoring-traces',
    label: 'Traces',
    tooltip: 'Agent Monitoring Traces',
    sectionHeader: 'Agent monitoring',
    icon: 'visTable',
    group: 'agent-monitoring',
  },
  {
    key: 'agent-monitoring-spans',
    label: 'Spans',
    tooltip: 'Agent Monitoring Spans',
    icon: 'visTagCloud',
    rulerAfter: true,
    group: 'agent-monitoring',
  },
  // Application Performance
  {
    key: 'app-perf-traces',
    label: 'Traces',
    tooltip: 'Application Performance Traces',
    sectionHeader: 'Application Performance',
    icon: 'apmTrace',
    group: 'app-perf',
  },
  {
    key: 'app-perf-services',
    label: 'Services',
    tooltip: 'Application Performance Services',
    icon: 'navServices',
    rulerAfter: true,
    group: 'app-perf',
  },
  // More (collapsible)
  { key: 'tools', label: 'More', icon: 'navQuerySets', group: 'tools' },
];

// Items nested under Agent Monitoring in expanded mode
const AGENT_MONITORING_CHILDREN = [
  {
    key: 'agent-monitoring-traces',
    label: 'Traces',
    icon: 'visTable',
    page: 'agent-monitoring-traces',
  },
  {
    key: 'agent-monitoring-spans',
    label: 'Spans',
    icon: 'visTagCloud',
    page: 'agent-monitoring-spans',
  },
];

// Items nested under Application Performance in expanded mode
const APP_PERF_CHILDREN = [
  {
    key: 'app-perf-traces',
    label: 'Traces',
    icon: 'apmTrace',
    page: 'app-perf-traces',
  },
  {
    key: 'app-perf-services',
    label: 'Services',
    icon: 'navServices',
    page: 'app-perf-services',
  },
];

// Items nested under Tools in expanded mode
const TOOLS_CHILDREN = [
  { key: 'notebooks', label: 'Notebook', icon: 'document', page: 'notebooks' },
  {
    key: 'forecasting',
    label: 'Forecasting',
    icon: 'visLine',
    page: 'forecasters',
  },
];

// Nested sub-groups inside Tools
const TOOLS_SUBGROUPS = [
  {
    key: 'anomaly-detection',
    label: 'Anomaly Detection',
    icon: 'anomalyDetection',
    children: [
      {
        key: 'anomaly-dashboard',
        label: 'Dashboard',
        icon: 'navDashboards',
        page: 'anomaly-dashboard',
      },
      {
        key: 'detectors',
        label: 'Detectors',
        icon: 'securitySignalDetected',
        page: 'detectors',
      },
    ],
  },
  {
    key: 'alerting',
    label: 'Alerting',
    icon: 'navAlerting',
    children: [
      {
        key: 'alerts',
        label: 'Alerts',
        icon: 'navAlerting',
        page: 'alerts-detail',
      },
      {
        key: 'monitors',
        label: 'Monitors',
        icon: 'eye',
        page: 'monitors-detail',
      },
      {
        key: 'destinations',
        label: 'Destinations',
        icon: 'bullseye',
        page: 'destinations',
      },
    ],
  },
  {
    key: 'ai-configs',
    label: 'AI Configs',
    icon: 'generate',
    children: [
      {
        key: 'ai-skills',
        label: 'Skills',
        icon: 'wrench',
        page: 'ai-skills',
      },
      {
        key: 'ai-memories',
        label: 'Memories',
        icon: 'memory',
        page: 'ai-memories',
      },
      {
        key: 'ai-automations',
        label: 'Automations',
        icon: 'bolt',
        page: 'ai-automations',
      },
      {
        key: 'ai-mcp-servers',
        label: 'MCP Servers',
        icon: 'console',
        page: 'ai-mcp-servers',
      },
    ],
  },
];

// Items nested under Manage workspace in expanded mode
const WORKSPACE_CHILDREN = [
  {
    key: 'workspace-details',
    label: 'Workspace details',
    icon: 'wsSelector',
    page: 'manage-workspace',
  },
  {
    key: 'data-sources-nav',
    label: 'Data sources',
    icon: 'database',
    page: 'data-sources',
  },
  {
    key: 'index-patterns-nav',
    label: 'Index patterns',
    icon: 'indexSettings',
    page: 'index-patterns',
  },
  { key: 'datasets-nav', label: 'Datasets', icon: 'navData', page: 'datasets' },
  {
    key: 'assets-nav',
    label: 'Assets',
    icon: 'package',
    page: 'assets-detail',
  },
  {
    key: 'sample-data-nav',
    label: 'Sample data',
    icon: 'documents',
    page: 'sample-data',
  },
];

// Popover items for child pages (same data as PANEL_CONFIGS in the view)
const CHILD_PAGE_POPOVER_ITEMS = {
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
      { key: 'ip-metrics', title: 'metrics-*', subtitle: 'Matches 8 indices' },
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
};

// Generic popover content for child pages — same card style as thread popover
const ChildPagePopoverContent = ({ pageKey, onNavigate }) => {
  const config = CHILD_PAGE_POPOVER_ITEMS[pageKey];
  if (!config) return null;
  return (
    <div className="samplePagesLeftNav__threadPopover">
      <div className="samplePagesLeftNav__threadPopoverHeader">
        {config.title}
      </div>
      <div className="samplePagesLeftNav__threadPopoverContent">
        {config.items.map((item) => (
          <button
            key={item.key}
            type="button"
            className="samplePagesLeftNav__threadPopoverItem"
            onClick={() => onNavigate(pageKey, item.key)}>
            <span className="samplePagesLeftNav__threadPopoverTitle">
              {item.title}
            </span>
            {item.subtitle && (
              <span className="samplePagesLeftNav__threadPopoverSubtitle">
                {item.subtitle}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Reusable list renderer for tabbed panel items
const PanelItemList = ({ items, onItemSelect, selectedItem }) => (
  <OuiListGroup gutterSize="none">
    {items.map((item, index) => (
      <React.Fragment key={item.key}>
        {index > 0 && (
          <div className="samplePagesLeftNav__ruleDivider">
            <OuiHorizontalRule margin="none" />
          </div>
        )}
        <OuiListGroupItem
          isActive={selectedItem === item.key}
          iconType={item.icon}
          label={
            <div>
              <OuiText size="s">
                <strong>{item.label}</strong>
              </OuiText>
              {item.subtitle && (
                <OuiText size="xs" color="subdued">
                  {item.subtitle}
                </OuiText>
              )}
            </div>
          }
          onClick={() => onItemSelect(item.key)}
        />
      </React.Fragment>
    ))}
  </OuiListGroup>
);

// Reusable tabbed panel wrapper
const TabbedPanel = ({ tabs, activeTab, onTabChange, children }) => (
  <div>
    <div className="samplePagesLeftNav__panelTabs">
      <OuiTabs size="s" display="condensed">
        {tabs.map((tab) => (
          <OuiTab
            key={tab.id}
            isSelected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}>
            {tab.name}
          </OuiTab>
        ))}
      </OuiTabs>
    </div>
    {children}
  </div>
);

// Default threads for the Thread panel
export const DEFAULT_THREADS = [
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
  {
    key: 'memory-leak',
    title: 'Memory leak in catalog service',
    subtitle: 'Jordan Park · 3 hours ago',
  },
  {
    key: 'dns-timeout',
    title: 'DNS resolution timeouts',
    subtitle: 'Priya Sharma · 6 hours ago',
  },
  {
    key: 'deployment-rollback',
    title: 'Failed deployment rollback',
    subtitle: 'Marcus Webb · 8 hours ago',
  },
  {
    key: 'cert-expiry',
    title: 'TLS certificate expiry warning',
    subtitle: 'Dana Kim · 12 hours ago',
  },
  {
    key: 'disk-pressure',
    title: 'Node disk pressure alerts',
    subtitle: 'Riley Tanaka · 1 day ago',
  },
];

let newThreadCounter = 0;

// Panel content for Thread tab
const ThreadPanelContent = ({
  onItemSelect,
  selectedItem,
  threads = DEFAULT_THREADS,
}) => (
  <OuiListGroup gutterSize="none">
    {threads.map((thread, index) => (
      <React.Fragment key={thread.key}>
        {index > 0 && (
          <div className="samplePagesLeftNav__ruleDivider">
            <OuiHorizontalRule margin="none" />
          </div>
        )}
        <OuiListGroupItem
          isActive={selectedItem === thread.key}
          label={
            <div>
              <OuiText size="s">
                <strong>{thread.title}</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                {thread.subtitle}
              </OuiText>
            </div>
          }
          onClick={() => onItemSelect(thread.key)}
        />
      </React.Fragment>
    ))}
  </OuiListGroup>
);

// Panel content for Discover tab
const DISCOVER_TABS = [
  { id: 'logs', name: 'Logs' },
  { id: 'traces', name: 'Traces' },
  { id: 'metrics', name: 'Metrics' },
];

const DISCOVER_TAB_ITEMS = {
  logs: [
    {
      key: 'error-rate',
      label: 'Error rate by service',
      subtitle: 'source=logs | where level="ERROR" | stats count() by service',
    },
    {
      key: 'auth-failures',
      label: 'Auth failure events',
      subtitle: 'source=logs | where event="auth_fail" | stats count()',
    },
    {
      key: 'slow-queries',
      label: 'Slow query log',
      subtitle: 'source=logs | where duration > 5000 | sort -duration',
    },
  ],
  traces: [
    {
      key: 'latency-percentiles',
      label: 'Latency percentiles',
      subtitle: 'source=traces | stats p99(latency), p50(latency) by service',
    },
    {
      key: 'trace-errors',
      label: 'Trace error breakdown',
      subtitle: 'source=traces | where status="ERROR" | stats count() by span',
    },
    {
      key: 'service-deps',
      label: 'Service dependencies',
      subtitle: 'source=traces | stats count() by parent, child',
    },
  ],
  metrics: [
    {
      key: 'throughput',
      label: 'Throughput over time',
      subtitle: 'source=metrics | stats avg(throughput) by span(timestamp, 5m)',
    },
    {
      key: 'cpu-utilization',
      label: 'CPU utilization',
      subtitle: 'source=metrics | stats avg(cpu) by host',
    },
    {
      key: 'memory-pressure',
      label: 'Memory pressure',
      subtitle: 'source=metrics | stats max(mem_used) by host',
    },
  ],
};

const DiscoverPanelContent = ({ onItemSelect, selectedItem }) => {
  const [activeTab, setActiveTab] = useState('logs');
  return (
    <TabbedPanel
      tabs={DISCOVER_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}>
      <PanelItemList
        items={DISCOVER_TAB_ITEMS[activeTab]}
        onItemSelect={onItemSelect}
        selectedItem={selectedItem}
      />
    </TabbedPanel>
  );
};

// Panel content for Alerting tab
const ALERTING_TABS = [
  { id: 'alerts', name: 'Alerts' },
  { id: 'monitors', name: 'Monitors' },
  { id: 'destinations', name: 'Destinations' },
];

const ALERTING_TAB_ITEMS = {
  alerts: [
    {
      key: 'cpu-threshold',
      label: 'CPU threshold exceeded',
      subtitle: 'Critical · Triggered 10 min ago',
    },
    {
      key: 'disk-usage',
      label: 'Disk usage warning',
      subtitle: 'Warning · Triggered 1 hour ago',
    },
    {
      key: 'error-rate-spike',
      label: 'Error rate spike',
      subtitle: 'Critical · Triggered 3 hours ago',
    },
  ],
  monitors: [
    {
      key: 'uptime-monitor',
      label: 'Uptime monitor',
      subtitle: 'HTTP · Every 5 min · Active',
    },
    {
      key: 'latency-monitor',
      label: 'Latency threshold',
      subtitle: 'Query · Every 1 min · Active',
    },
    {
      key: 'log-volume-monitor',
      label: 'Log volume spike',
      subtitle: 'Bucket · Every 10 min · Paused',
    },
  ],
  destinations: [
    {
      key: 'slack-ops',
      label: 'Slack #ops-alerts',
      subtitle: 'Slack · Verified',
    },
    {
      key: 'pagerduty-critical',
      label: 'PagerDuty critical',
      subtitle: 'PagerDuty · Verified',
    },
    {
      key: 'email-oncall',
      label: 'On-call email group',
      subtitle: 'Email · Verified',
    },
  ],
};

const AlertsPanelContent = ({ onItemSelect, selectedItem }) => {
  const [activeTab, setActiveTab] = useState('alerts');
  return (
    <TabbedPanel
      tabs={ALERTING_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}>
      <PanelItemList
        items={ALERTING_TAB_ITEMS[activeTab]}
        onItemSelect={onItemSelect}
        selectedItem={selectedItem}
      />
    </TabbedPanel>
  );
};

// Panel content for Dashboards — flat list, no tabs
const DASHBOARDS_ITEMS = [
  {
    key: 'system-overview',
    label: 'System overview',
    subtitle: 'Updated 5 min ago',
  },
  {
    key: 'web-traffic',
    label: 'Web traffic analytics',
    subtitle: 'Updated 15 min ago',
  },
  {
    key: 'api-performance',
    label: 'API performance',
    subtitle: 'Updated 30 min ago',
  },
];

const DashboardsPanelContent = ({ onItemSelect, selectedItem }) => (
  <PanelItemList
    items={DASHBOARDS_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

// Panel content for Logs
const LOGS_ITEMS = [
  {
    key: 'error-rate',
    label: 'Error rate by service',
    subtitle: 'source=logs | where level="ERROR" | stats count() by service',
  },
  {
    key: 'auth-failures',
    label: 'Auth failure events',
    subtitle: 'source=logs | where event="auth_fail" | stats count()',
  },
  {
    key: 'slow-queries',
    label: 'Slow query log',
    subtitle: 'source=logs | where duration > 5000 | sort -duration',
  },
];

const LogsPanelContent = ({ onItemSelect, selectedItem, onPageChange }) => (
  <PanelItemList
    items={LOGS_ITEMS}
    onItemSelect={(key) => {
      onPageChange('logs');
      onItemSelect(key);
    }}
    selectedItem={selectedItem}
  />
);

// Panel content for Metrics
const METRICS_ITEMS = [
  {
    key: 'throughput',
    label: 'Throughput over time',
    subtitle: 'source=metrics | stats avg(throughput) by span(timestamp, 5m)',
  },
  {
    key: 'cpu-utilization',
    label: 'CPU utilization',
    subtitle: 'source=metrics | stats avg(cpu) by host',
  },
  {
    key: 'memory-pressure',
    label: 'Memory pressure',
    subtitle: 'source=metrics | stats max(mem_used) by host',
  },
];

const MetricsPanelContent = ({ onItemSelect, selectedItem, onPageChange }) => (
  <PanelItemList
    items={METRICS_ITEMS}
    onItemSelect={(key) => {
      onPageChange('metrics');
      onItemSelect(key);
    }}
    selectedItem={selectedItem}
  />
);

// Panel content for Skills tab
const SkillsPanelContent = ({ onItemSelect, selectedItem }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      isActive={selectedItem === 'anomaly-detector'}
      label={
        <div>
          <OuiText size="s">
            <strong>Anomaly detector</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            ML · Active
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('anomaly-detector')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'log-summarizer'}
      label={
        <div>
          <OuiText size="s">
            <strong>Log summarizer</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            NLP · Active
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('log-summarizer')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'root-cause-analysis'}
      label={
        <div>
          <OuiText size="s">
            <strong>Root cause analysis</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            ML · Draft
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('root-cause-analysis')}
    />
  </OuiListGroup>
);

// Panel content for Assets tab
const ASSETS_TABS = [
  { id: 'visualizations', name: 'Visualizations' },
  { id: 'maps', name: 'Maps' },
];

const ASSETS_TAB_ITEMS = {
  visualizations: [
    {
      key: 'web-server-fleet',
      label: 'Web server fleet',
      subtitle: '12 hosts · Healthy',
    },
    {
      key: 'payment-gateway',
      label: 'Payment gateway',
      subtitle: '3 endpoints · Warning',
    },
    {
      key: 'data-pipeline',
      label: 'Data pipeline cluster',
      subtitle: '8 nodes · Healthy',
    },
  ],
  maps: [
    {
      key: 'region-latency-map',
      label: 'Region latency map',
      subtitle: 'Geo · Updated 10 min ago',
    },
    {
      key: 'traffic-origin-map',
      label: 'Traffic origin map',
      subtitle: 'Geo · Updated 30 min ago',
    },
    {
      key: 'cdn-coverage-map',
      label: 'CDN coverage map',
      subtitle: 'Geo · Updated 1 hour ago',
    },
  ],
};

const AssetsPanelContent = ({ onItemSelect, selectedItem }) => {
  const [activeTab, setActiveTab] = useState('visualizations');
  return (
    <TabbedPanel
      tabs={ASSETS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}>
      <PanelItemList
        items={ASSETS_TAB_ITEMS[activeTab]}
        onItemSelect={onItemSelect}
        selectedItem={selectedItem}
      />
    </TabbedPanel>
  );
};

// Panel content for Workspace tab
const WORKSPACE_TABS = [
  { id: 'configs', name: 'Configs' },
  { id: 'data-sources', name: 'Data sources' },
];

const WORKSPACE_TAB_ITEMS = {
  configs: [
    {
      key: 'workspace-details',
      label: 'Workspace details',
      icon: 'wsSelector',
    },
    { key: 'collaborators', label: 'Collaborators', icon: 'users' },
    { key: 'index-patterns', label: 'Index patterns', icon: 'indexSettings' },
    { key: 'sample-data', label: 'Sample data', icon: 'navData' },
  ],
  'data-sources': [
    {
      key: 'faos219prod',
      label: 'FAOS219prod',
      subtitle: 'OpenSearch 2.19 · Production cluster',
    },
    {
      key: 'os-219',
      label: 'OS 219',
      subtitle: 'OpenSearch 2.19 · Development cluster',
    },
    {
      key: 'olly-stable-default',
      label: 'Olly@stableDefault',
      subtitle: 'OpenSearch · Observability default data source',
    },
    {
      key: 'flow219',
      label: 'flow219',
      subtitle: 'OpenSearch 2.19 · Flow framework testing',
    },
    {
      key: 'otel',
      label: 'otel',
      subtitle: 'OpenSearch · OpenTelemetry data ingestion',
    },
    {
      key: 'playground-otel-domain',
      label: 'playground-otel-domain',
      subtitle: 'OpenSearch · OTel playground environment',
    },
    {
      key: 'xinyuan-latest-model-test',
      label: 'xinyuan-latest-model-test',
      subtitle: 'OpenSearch · ML model testing cluster',
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WorkspacePanelContent = ({ onItemSelect, selectedItem }) => {
  const [activeTab, setActiveTab] = useState('configs');
  return (
    <TabbedPanel
      tabs={WORKSPACE_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}>
      <PanelItemList
        items={WORKSPACE_TAB_ITEMS[activeTab]}
        onItemSelect={onItemSelect}
        selectedItem={selectedItem}
      />
    </TabbedPanel>
  );
};

// Panel content for More tab — renders overflow items dynamically
const MorePanelContent = ({
  onPageChange,
  onNavigateToPage,
  onGoToSettings,
  overflowItems = [],
}) => {
  const items = overflowItems
    .map((key) => ALL_DRAGGABLE_ITEMS.find((d) => d.key === key))
    .filter(Boolean);
  return (
    <div>
      <OuiListGroup gutterSize="none">
        {items.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && (
              <div className="samplePagesLeftNav__ruleDivider">
                <OuiHorizontalRule margin="none" />
              </div>
            )}
            <OuiListGroupItem
              iconType={item.icon}
              label={
                <OuiText size="s">
                  <strong>{item.label}</strong>
                </OuiText>
              }
              onClick={() =>
                onNavigateToPage
                  ? onNavigateToPage(item.key)
                  : onPageChange(item.key)
              }
            />
          </React.Fragment>
        ))}
      </OuiListGroup>
      <div style={{ padding: '12px 8px 0' }}>
        <OuiButtonEmpty
          size="s"
          flush="both"
          style={{ width: '100%' }}
          onClick={onGoToSettings}>
          Customize navigation bar
        </OuiButtonEmpty>
      </div>
    </div>
  );
};

// Popover content for Thread (collapsed mode)
const ThreadPopoverContent = ({ onNavigate, onViewAll }) => {
  const items = [
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
    {
      key: 'memory-leak',
      title: 'Memory leak in catalog service',
      subtitle: 'Jordan Park · 3 hours ago',
    },
    {
      key: 'dns-timeout',
      title: 'DNS resolution timeouts',
      subtitle: 'Priya Sharma · 6 hours ago',
    },
    {
      key: 'deployment-rollback',
      title: 'Failed deployment rollback',
      subtitle: 'Marcus Webb · 8 hours ago',
    },
    {
      key: 'cert-expiry',
      title: 'TLS certificate expiry warning',
      subtitle: 'Dana Kim · 12 hours ago',
    },
    {
      key: 'disk-pressure',
      title: 'Node disk pressure alerts',
      subtitle: 'Riley Tanaka · 1 day ago',
    },
  ];
  return (
    <div className="samplePagesLeftNav__threadPopover">
      <div className="samplePagesLeftNav__threadPopoverHeader">
        <span>Recent threads</span>
        <OuiButtonIcon
          iconType="plus"
          size="xs"
          aria-label="Create new thread"
          color="primary"
          display="fill"
        />
      </div>
      <div className="samplePagesLeftNav__threadPopoverContent">
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className="samplePagesLeftNav__threadPopoverItem"
            onClick={() => onNavigate('thread', item.key)}>
            <span className="samplePagesLeftNav__threadPopoverTitle">
              {item.title}
            </span>
            <span className="samplePagesLeftNav__threadPopoverSubtitle">
              {item.subtitle}
            </span>
          </button>
        ))}
      </div>
      <div className="samplePagesLeftNav__threadPopoverFooter">
        <OuiButtonEmpty
          size="xs"
          onClick={() => onViewAll('thread')}>
          View all
        </OuiButtonEmpty>
      </div>
    </div>
  );
};

// Popover content for Dashboards (collapsed mode)
const DashboardsPopoverContent = ({ onNavigate, onViewAll }) => {
  const items = [
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
  ];
  return (
    <div className="samplePagesLeftNav__threadPopover">
      <div className="samplePagesLeftNav__threadPopoverHeader">
        <span>Recent dashboards</span>
        <OuiButtonIcon
          iconType="plus"
          size="xs"
          aria-label="Create new dashboard"
          color="primary"
          display="fill"
        />
      </div>
      <div className="samplePagesLeftNav__threadPopoverContent">
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className="samplePagesLeftNav__threadPopoverItem"
            onClick={() => onNavigate('dashboards', item.key)}>
            <span className="samplePagesLeftNav__threadPopoverTitle">
              {item.title}
            </span>
            <span className="samplePagesLeftNav__threadPopoverSubtitle">
              {item.subtitle}
            </span>
          </button>
        ))}
      </div>
      <div className="samplePagesLeftNav__threadPopoverFooter">
        <OuiButtonEmpty
          size="xs"
          onClick={() => onViewAll('dashboards')}>
          View all
        </OuiButtonEmpty>
      </div>
    </div>
  );
};

// Popover content for Logs (collapsed mode)
const LogsPopoverContent = ({ onNavigate, onViewAll }) => {
  const [activeTab, setActiveTab] = useState('saved-results');
  const tabItems = {
    'saved-results': [
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
    'saved-query': [
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
  };
  const items = tabItems[activeTab];
  return (
    <div className="samplePagesLeftNav__threadPopover">
      <div className="samplePagesLeftNav__threadPopoverHeader">
        <span>Recent logs</span>
        <OuiButtonIcon
          iconType="plus"
          size="xs"
          aria-label="Create new log query"
          color="primary"
          display="fill"
        />
      </div>
      <div style={{ padding: '0 12px', marginTop: 8 }}>
        <OuiTabs size="s" display="condensed">
          <OuiTab isSelected={activeTab === 'saved-results'} onClick={() => setActiveTab('saved-results')}>
            Saved results
          </OuiTab>
          <OuiTab isSelected={activeTab === 'saved-query'} onClick={() => setActiveTab('saved-query')}>
            Saved query
          </OuiTab>
        </OuiTabs>
      </div>
      <div className="samplePagesLeftNav__threadPopoverContent">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className="samplePagesLeftNav__threadPopoverItem"
            onClick={() => onNavigate('logs', item.key)}>
            <span className="samplePagesLeftNav__threadPopoverTitle">
              {item.title}
            </span>
            <span className="samplePagesLeftNav__threadPopoverSubtitle">
              {item.subtitle}
            </span>
          </button>
        ))}
      </div>
      <div className="samplePagesLeftNav__threadPopoverFooter">
        <OuiButtonEmpty
          size="xs"
          onClick={() => onViewAll('logs')}>
          View all
        </OuiButtonEmpty>
      </div>
    </div>
  );
};

// Popover content for Metrics (collapsed mode)
const MetricsPopoverContent = ({ onNavigate, onViewAll }) => {
  const [activeTab, setActiveTab] = useState('saved-results');
  const tabItems = {
    'saved-results': [
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
    'saved-query': [
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
  };
  const items = tabItems[activeTab];
  return (
    <div className="samplePagesLeftNav__threadPopover">
      <div className="samplePagesLeftNav__threadPopoverHeader">
        <span>Recent metrics</span>
        <OuiButtonIcon
          iconType="plus"
          size="xs"
          aria-label="Create new metric query"
          color="primary"
          display="fill"
        />
      </div>
      <div style={{ padding: '0 12px', marginTop: 8 }}>
        <OuiTabs size="s" display="condensed">
          <OuiTab isSelected={activeTab === 'saved-results'} onClick={() => setActiveTab('saved-results')}>
            Saved results
          </OuiTab>
          <OuiTab isSelected={activeTab === 'saved-query'} onClick={() => setActiveTab('saved-query')}>
            Saved query
          </OuiTab>
        </OuiTabs>
      </div>
      <div className="samplePagesLeftNav__threadPopoverContent">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            className="samplePagesLeftNav__threadPopoverItem"
            onClick={() => onNavigate('metrics', item.key)}>
            <span className="samplePagesLeftNav__threadPopoverTitle">
              {item.title}
            </span>
            <span className="samplePagesLeftNav__threadPopoverSubtitle">
              {item.subtitle}
            </span>
          </button>
        ))}
      </div>
      <div className="samplePagesLeftNav__threadPopoverFooter">
        <OuiButtonEmpty
          size="xs"
          onClick={() => onViewAll('metrics')}>
          View all
        </OuiButtonEmpty>
      </div>
    </div>
  );
};

// Helper: wraps a popover item button with a nested hover popover if data exists
const PopoverItemWithHover = ({ pageKey, children, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timer = useRef(null);
  const open = () => {
    if (timer.current) clearTimeout(timer.current);
    setIsOpen(true);
  };
  const close = () => {
    timer.current = setTimeout(() => setIsOpen(false), 150);
  };
  const config = CHILD_PAGE_POPOVER_ITEMS[pageKey];
  if (!config) return children;
  return (
    <div onMouseEnter={open} onMouseLeave={close}>
      <OuiPopover
        button={children}
        isOpen={isOpen}
        closePopover={() => setIsOpen(false)}
        anchorPosition="rightUp"
        offset={-4}
        panelPaddingSize="s"
        panelClassName="samplePagesLeftNav__popoverPanel">
        <div onMouseEnter={open} onMouseLeave={close}>
          <ChildPagePopoverContent pageKey={pageKey} onNavigate={onNavigate} />
        </div>
      </OuiPopover>
    </div>
  );
};

// Panel content for Tools (popover in collapsed mode)
const ToolsPanelContent = ({
  onPageChange,
  onOpenPanel,
  onItemSelect: onSelectItem,
  onPopoverNavigate,
}) => {
  const [subOpen, setSubOpen] = useState({
    'anomaly-detection': false,
    alerting: false,
    'ai-configs': false,
  });
  const toggleSub = (key) =>
    setSubOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleNavigate = (page, itemKey) => {
    if (onPopoverNavigate) {
      onPopoverNavigate(page, itemKey);
    } else {
      onPageChange(page);
      if (onSelectItem) onSelectItem(itemKey);
    }
  };
  return (
    <div className="samplePagesLeftNav__toolsPopover">
      <div className="samplePagesLeftNav__toolsPopoverHeader">More</div>
      <div className="samplePagesLeftNav__toolsPopoverContent">
        <PopoverItemWithHover pageKey="notebooks" onNavigate={handleNavigate}>
          <button
            type="button"
            className="samplePagesLeftNav__toolsPopoverItem"
            onClick={() => onOpenPanel('notebooks')}>
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="document" size="m" />
            </div>
            <span>Notebook</span>
          </button>
        </PopoverItemWithHover>
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => onPageChange('forecasters')}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="visLine" size="m" />
          </div>
          <span>Forecasting</span>
        </button>
        {/* Anomaly Detection */}
        <div className="samplePagesLeftNav__toolsPopoverGroup">
          <div className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--parent">
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="anomalyDetection" size="m" />
            </div>
            <span className="samplePagesLeftNav__toolsPopoverItemLabel">
              Anomaly Detection
            </span>
            <OuiButtonIcon
              iconType={subOpen['anomaly-detection'] ? 'minus' : 'plus'}
              aria-label="Toggle Anomaly Detection"
              size="xs"
              color="text"
              display="empty"
              onClick={() => toggleSub('anomaly-detection')}
            />
          </div>
          {subOpen['anomaly-detection'] && (
            <div className="samplePagesLeftNav__subgroupChildren">
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => onPageChange('anomaly-dashboard')}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Dashboard</span>
              </button>
              <PopoverItemWithHover
                pageKey="detectors"
                onNavigate={handleNavigate}>
                <button
                  type="button"
                  className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                  onClick={() => onOpenPanel('detectors')}>
                  <div className="samplePagesLeftNav__treeLine" />
                  <span>Detectors</span>
                </button>
              </PopoverItemWithHover>
            </div>
          )}
        </div>
        {/* Alerting */}
        <div className="samplePagesLeftNav__toolsPopoverGroup">
          <div className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--parent">
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="navAlerting" size="m" />
            </div>
            <span className="samplePagesLeftNav__toolsPopoverItemLabel">
              Alerting
            </span>
            <OuiButtonIcon
              iconType={subOpen.alerting ? 'minus' : 'plus'}
              aria-label="Toggle Alerting"
              size="xs"
              color="text"
              display="empty"
              onClick={() => toggleSub('alerting')}
            />
          </div>
          {subOpen.alerting && (
            <div className="samplePagesLeftNav__subgroupChildren">
              <PopoverItemWithHover
                pageKey="alerts-detail"
                onNavigate={handleNavigate}>
                <button
                  type="button"
                  className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                  onClick={() => onOpenPanel('alerts-detail')}>
                  <div className="samplePagesLeftNav__treeLine" />
                  <span>Alerts</span>
                </button>
              </PopoverItemWithHover>
              <PopoverItemWithHover
                pageKey="monitors-detail"
                onNavigate={handleNavigate}>
                <button
                  type="button"
                  className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                  onClick={() => onOpenPanel('monitors-detail')}>
                  <div className="samplePagesLeftNav__treeLine" />
                  <span>Monitors</span>
                </button>
              </PopoverItemWithHover>
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => onPageChange('destinations')}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Destinations</span>
              </button>
            </div>
          )}
        </div>
        {/* AI Configs */}
        <div className="samplePagesLeftNav__toolsPopoverGroup">
          <div className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--parent">
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="generate" size="m" />
            </div>
            <span className="samplePagesLeftNav__toolsPopoverItemLabel">
              AI Configs
            </span>
            <OuiButtonIcon
              iconType={subOpen['ai-configs'] ? 'minus' : 'plus'}
              aria-label="Toggle AI Configs"
              size="xs"
              color="text"
              display="empty"
              onClick={() => toggleSub('ai-configs')}
            />
          </div>
          {subOpen['ai-configs'] && (
            <div className="samplePagesLeftNav__subgroupChildren">
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => onPageChange('ai-skills')}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Skills</span>
              </button>
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => onPageChange('ai-memories')}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Memories</span>
              </button>
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => onPageChange('ai-automations')}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Automations</span>
              </button>
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => onPageChange('ai-mcp-servers')}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>MCP Servers</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Panel content for Workspace (popover in collapsed mode)
const WorkspaceNavPanelContent = ({
  onPageChange,
  onOpenPanel,
  onItemSelect: onSelectItem,
  onPopoverNavigate,
}) => {
  const handleNavigate = (page, itemKey) => {
    if (onPopoverNavigate) {
      onPopoverNavigate(page, itemKey);
    } else {
      onPageChange(page);
      if (onSelectItem) onSelectItem(itemKey);
    }
  };
  return (
    <div className="samplePagesLeftNav__workspacePopover">
      <div className="samplePagesLeftNav__workspacePopoverContent">
        {/* Workspace picker */}
        <div className="samplePagesLeftNav__workspacePicker">
          <div className="samplePagesLeftNav__workspacePickerInfo">
            <OuiIcon type="wsObservability" size="m" />
            <div className="samplePagesLeftNav__workspacePickerText">
              <span className="samplePagesLeftNav__workspacePickerName">
                Workspace name
              </span>
              <span className="samplePagesLeftNav__workspacePickerType">
                Observability
              </span>
            </div>
          </div>
          <OuiIcon type="arrowDown" size="s" />
        </div>
        {/* Items */}
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => onPageChange('manage-workspace')}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="wsSelector" size="m" />
          </div>
          <span>Workspace details</span>
        </button>
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => {}}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="users" size="m" />
          </div>
          <span>Collaborators</span>
        </button>
        <PopoverItemWithHover
          pageKey="data-sources"
          onNavigate={handleNavigate}>
          <button
            type="button"
            className="samplePagesLeftNav__toolsPopoverItem"
            onClick={() => onOpenPanel('data-sources')}>
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="database" size="m" />
            </div>
            <span>Data sources</span>
          </button>
        </PopoverItemWithHover>
        <PopoverItemWithHover
          pageKey="index-patterns"
          onNavigate={handleNavigate}>
          <button
            type="button"
            className="samplePagesLeftNav__toolsPopoverItem"
            onClick={() => onOpenPanel('index-patterns')}>
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="indexSettings" size="m" />
            </div>
            <span>Index patterns</span>
          </button>
        </PopoverItemWithHover>
        <PopoverItemWithHover
          pageKey="assets-detail"
          onNavigate={handleNavigate}>
          <button
            type="button"
            className="samplePagesLeftNav__toolsPopoverItem"
            onClick={() => onOpenPanel('assets-detail')}>
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="package" size="m" />
            </div>
            <span>Assets</span>
          </button>
        </PopoverItemWithHover>
        <PopoverItemWithHover pageKey="sample-data" onNavigate={handleNavigate}>
          <button
            type="button"
            className="samplePagesLeftNav__toolsPopoverItem"
            onClick={() => onOpenPanel('sample-data')}>
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="documents" size="m" />
            </div>
            <span>Sample data</span>
          </button>
        </PopoverItemWithHover>
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => {}}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="home" size="m" />
          </div>
          <span>All workspaces</span>
        </button>
      </div>
    </div>
  );
};

// Settings popover content (gear icon)
const APPEARANCE_OPTIONS = [
  { key: 'v9-light', label: 'Light' },
  { key: 'v9-dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

const SettingsPopoverContent = ({ onPageChange, themeContext, appearanceSelection, onAppearanceChange }) => {
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const appearanceTimer = useRef(null);
  const openAppearance = () => {
    if (appearanceTimer.current) clearTimeout(appearanceTimer.current);
    setAppearanceOpen(true);
  };
  const closeAppearance = () => {
    appearanceTimer.current = setTimeout(() => setAppearanceOpen(false), 150);
  };

  const handleThemeSelect = (themeKey) => {
    if (!themeContext) return;
    if (onAppearanceChange) onAppearanceChange(themeKey);
    if (themeKey === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeContext.changeTheme(prefersDark ? 'v9-dark' : 'v9-light');
    } else {
      themeContext.changeTheme(themeKey);
    }
  };

  return (
    <div className="samplePagesLeftNav__toolsPopover">
      <div className="samplePagesLeftNav__toolsPopoverContent">
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => {}}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="gear" size="m" />
          </div>
          <span className="samplePagesLeftNav__toolsPopoverItemLabel">
            Settings and setup
          </span>
          <OuiIcon
            type="popout"
            size="m"
            color="subdued"
            style={{ marginRight: 8 }}
          />
        </button>
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => {}}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="database" size="m" />
          </div>
          <span className="samplePagesLeftNav__toolsPopoverItemLabel">
            Data administration
          </span>
          <OuiIcon
            type="popout"
            size="m"
            color="subdued"
            style={{ marginRight: 8 }}
          />
        </button>
        <div onMouseEnter={openAppearance} onMouseLeave={closeAppearance}>
          <OuiPopover
            button={
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem">
                <div className="samplePagesLeftNav__navItemIconWrap">
                  <OuiIcon type="brush" size="m" />
                </div>
                <span className="samplePagesLeftNav__toolsPopoverItemLabel">
                  Appearance
                </span>
                <OuiIcon type="arrowRight" size="m" color="subdued" style={{ marginRight: 8 }} />
              </button>
            }
            isOpen={appearanceOpen}
            closePopover={() => setAppearanceOpen(false)}
            anchorPosition="rightUp"
            offset={-4}
            panelPaddingSize="s"
            panelClassName="samplePagesLeftNav__popoverPanel">
            <div onMouseEnter={openAppearance} onMouseLeave={closeAppearance}>
              <div className="samplePagesLeftNav__toolsPopover">
                <div className="samplePagesLeftNav__toolsPopoverContent">
                  {APPEARANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className="samplePagesLeftNav__toolsPopoverItem"
                      onClick={() => handleThemeSelect(opt.key)}>
                      <div
                        className="samplePagesLeftNav__navItemIconWrap"
                      style={{ visibility: appearanceSelection === opt.key ? 'visible' : 'hidden' }}>
                        <OuiIcon type="check" size="m" />
                      </div>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </OuiPopover>
        </div>
      </div>
    </div>
  );
};

// Profile popover content
const ProfilePopoverContent = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <div className="samplePagesLeftNav__toolsPopover">
      <div className="samplePagesLeftNav__profilePopoverHeader">
        <OuiAvatar name="OS" size="s" />
        <span className="samplePagesLeftNav__profilePopoverName">John</span>
      </div>
      <div className="samplePagesLeftNav__toolsPopoverContent">
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => {}}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="user" size="m" />
          </div>
          <span>Roles and identities</span>
        </button>
        <div className="samplePagesLeftNav__toolsPopoverGroup">
          <div className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--parent">
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="help" size="m" />
            </div>
            <span className="samplePagesLeftNav__toolsPopoverItemLabel">
              Help
            </span>
            <OuiButtonIcon
              iconType={helpOpen ? 'minus' : 'plus'}
              aria-label="Toggle Help"
              size="xs"
              color="text"
              display="empty"
              onClick={() => setHelpOpen(!helpOpen)}
            />
          </div>
          {helpOpen && (
            <div className="samplePagesLeftNav__subgroupChildren">
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => {}}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Documentation</span>
              </button>
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => {}}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Community</span>
              </button>
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => {}}>
                <div className="samplePagesLeftNav__treeLine" />
                <span>Give feedback</span>
              </button>
              <button
                type="button"
                className="samplePagesLeftNav__toolsPopoverItem samplePagesLeftNav__toolsPopoverItem--child"
                onClick={() => {}}>
                <div className="samplePagesLeftNav__treeLine samplePagesLeftNav__treeLine--last" />
                <span>Keyboard shortcut</span>
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => {}}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="logoGithub" size="m" />
          </div>
          <span>Open an issue in Github</span>
        </button>
        <button
          type="button"
          className="samplePagesLeftNav__toolsPopoverItem"
          onClick={() => {}}>
          <div className="samplePagesLeftNav__navItemIconWrap">
            <OuiIcon type="exit" size="m" />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// Simple list panel for items opened from popovers
const SimplePanelContent = ({ items, onItemSelect, selectedItem }) => (
  <PanelItemList
    items={items}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const NOTEBOOKS_ITEMS = [
  {
    key: 'notebook-runbook',
    label: 'Runbook checklist',
    subtitle: 'Last edited 2 hours ago',
  },
  {
    key: 'notebook-incident',
    label: 'Incident postmortem',
    subtitle: 'Last edited 1 day ago',
  },
  {
    key: 'notebook-capacity',
    label: 'Capacity planning',
    subtitle: 'Last edited 3 days ago',
  },
];
const NotebooksPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={NOTEBOOKS_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const DETECTORS_ITEMS = [
  {
    key: 'detector-cpu',
    label: 'CPU anomaly detector',
    subtitle: 'ML · Active',
  },
  {
    key: 'detector-latency',
    label: 'Latency anomaly detector',
    subtitle: 'ML · Active',
  },
  {
    key: 'detector-error',
    label: 'Error rate detector',
    subtitle: 'ML · Draft',
  },
];
const DetectorsPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={DETECTORS_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const ALERTS_PANEL_ITEMS = [
  {
    key: 'alert-cpu-threshold',
    label: 'CPU threshold exceeded',
    subtitle: 'Critical · 10 min ago',
  },
  {
    key: 'alert-disk-usage',
    label: 'Disk usage warning',
    subtitle: 'Warning · 1 hour ago',
  },
  {
    key: 'alert-error-spike',
    label: 'Error rate spike',
    subtitle: 'Critical · 3 hours ago',
  },
];
const AlertsNavPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={ALERTS_PANEL_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const MONITORS_ITEMS = [
  {
    key: 'monitor-uptime',
    label: 'Uptime monitor',
    subtitle: 'HTTP · Every 5 min · Active',
  },
  {
    key: 'monitor-latency',
    label: 'Latency threshold',
    subtitle: 'Query · Every 1 min · Active',
  },
  {
    key: 'monitor-log-volume',
    label: 'Log volume spike',
    subtitle: 'Bucket · Every 10 min · Paused',
  },
];
const MonitorsPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={MONITORS_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const DATA_SOURCES_ITEMS = [
  {
    key: 'ds-faos219prod',
    label: 'FAOS219prod',
    subtitle: 'OpenSearch 2.19 · Production',
  },
  {
    key: 'ds-os-219',
    label: 'OS 219',
    subtitle: 'OpenSearch 2.19 · Development',
  },
  {
    key: 'ds-olly-stable',
    label: 'Olly@stableDefault',
    subtitle: 'OpenSearch · Observability',
  },
];
const DataSourcesPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={DATA_SOURCES_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const INDEX_PATTERNS_ITEMS = [
  { key: 'ip-logs', label: 'logs-*', subtitle: 'Matches 12 indices' },
  { key: 'ip-metrics', label: 'metrics-*', subtitle: 'Matches 8 indices' },
  { key: 'ip-traces', label: 'traces-*', subtitle: 'Matches 5 indices' },
];
const IndexPatternsPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={INDEX_PATTERNS_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const DATASETS_ITEMS = [
  {
    key: 'dataset-web-logs',
    label: 'Web server logs',
    subtitle: '2.4 GB · Updated 5 min ago',
  },
  {
    key: 'dataset-app-traces',
    label: 'Application traces',
    subtitle: '1.1 GB · Updated 10 min ago',
  },
  {
    key: 'dataset-system-metrics',
    label: 'System metrics',
    subtitle: '890 MB · Updated 1 min ago',
  },
];
const DatasetsPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={DATASETS_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const ASSETS_PANEL_ITEMS = [
  {
    key: 'asset-web-fleet',
    label: 'Web server fleet',
    subtitle: '12 hosts · Healthy',
  },
  {
    key: 'asset-payment',
    label: 'Payment gateway',
    subtitle: '3 endpoints · Warning',
  },
  {
    key: 'asset-pipeline',
    label: 'Data pipeline cluster',
    subtitle: '8 nodes · Healthy',
  },
];
const AssetsPanelNavContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={ASSETS_PANEL_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const SAMPLE_DATA_ITEMS = [
  {
    key: 'sample-ecommerce',
    label: 'Sample eCommerce orders',
    subtitle: 'Preloaded dataset',
  },
  {
    key: 'sample-flights',
    label: 'Sample flight data',
    subtitle: 'Preloaded dataset',
  },
  {
    key: 'sample-web-logs',
    label: 'Sample web logs',
    subtitle: 'Preloaded dataset',
  },
];
const SampleDataPanelContent = ({ onItemSelect, selectedItem }) => (
  <SimplePanelContent
    items={SAMPLE_DATA_ITEMS}
    onItemSelect={onItemSelect}
    selectedItem={selectedItem}
  />
);

const PANEL_CONTENT = {
  thread: ThreadPanelContent,
  dashboards: DashboardsPanelContent,
  logs: LogsPanelContent,
  metrics: MetricsPanelContent,
  notebooks: NotebooksPanelContent,
  detectors: DetectorsPanelContent,
  'alerts-detail': AlertsNavPanelContent,
  'monitors-detail': MonitorsPanelContent,
  'data-sources': DataSourcesPanelContent,
  'index-patterns': IndexPatternsPanelContent,
  datasets: DatasetsPanelContent,
  'assets-detail': AssetsPanelNavContent,
  'sample-data': SampleDataPanelContent,
};

// Collapsible section group used in expanded mode
const NavGroup = ({ label, isOpen, onToggle, children }) => (
  <div className="samplePagesLeftNav__navGroup">
    <div className="samplePagesLeftNav__navGroupHeader">
      <span className="samplePagesLeftNav__navGroupLabel">{label}</span>
      <OuiButtonIcon
        iconType={isOpen ? 'minus' : 'plus'}
        aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
        size="xs"
        color="text"
        display="empty"
        onClick={onToggle}
      />
    </div>
    {isOpen && (
      <div className="samplePagesLeftNav__navGroupChildren">{children}</div>
    )}
  </div>
);

export const SamplePagesLeftNav = ({
  activePage,
  onPageChange,
  onPopoverNavigate,
  onViewAll,
  onItemSelect,
  selectedItem,
  onLogoClick,
  createThreadRef,
  _onContinueAsThread,
  onAskAi,
  mainItems,
  overflowItems,
  _onLayoutChange,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [appearanceSelection, setAppearanceSelection] = useState(isDark ? 'v9-dark' : 'v9-light');
  const [expandedTab, setExpandedTab] = useState(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [appsPopoverOpen, setAppsPopoverOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [navPopover, setNavPopover] = useState(null);
  const navItemRefs = useRef({});
  const navPopoverTimer = useRef(null);

  const openNavPopover = useCallback((key) => {
    if (navPopoverTimer.current) clearTimeout(navPopoverTimer.current);
    setNavPopover(key);
  }, []);

  const closeNavPopover = useCallback(() => {
    navPopoverTimer.current = setTimeout(() => setNavPopover(null), 150);
  }, []);
  const [threads, setThreads] = useState(DEFAULT_THREADS);

  // Expand/collapse state
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isNavLocked, setIsNavLocked] = useState(false);
  const [isHoveringNav, setIsHoveringNav] = useState(false);

  // Auto-collapse nav when page changes (unless locked)
  useEffect(() => {
    if (!isNavLocked) {
      setIsNavExpanded(false);
    }
  }, [activePage, isNavLocked]);

  const [groupOpen, setGroupOpen] = useState({
    'agent-monitoring': true,
    'app-perf': true,
    tools: false,
    workspace: false,
  });
  const [subgroupOpen, setSubgroupOpen] = useState({});

  const toggleGroup = useCallback((groupKey) => {
    setGroupOpen((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }, []);

  const toggleSubgroup = useCallback((key) => {
    setSubgroupOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleCreateThread = useCallback(() => {
    newThreadCounter += 1;
    const newKey = `new-thread-${newThreadCounter}`;
    const newThread = {
      key: newKey,
      title: 'New thread',
      subtitle: 'Just now',
    };
    setThreads((prev) => [newThread, ...prev]);
    onItemSelect(newKey);
    return newKey;
  }, [onItemSelect]);

  // Expose createThread to parent via ref
  useEffect(() => {
    if (createThreadRef) {
      createThreadRef.current = handleCreateThread;
    }
  }, [createThreadRef, handleCreateThread]);

  const renderedNavItems = useMemo(() => NAV_ITEMS, []);

  const collapsePanel = useCallback(() => {
    if (isNavLocked) return;
    setIsCollapsing(true);
    setTimeout(() => {
      setExpandedTab(null);
      setIsCollapsing(false);
    }, 200);
  }, [isNavLocked]);

  const handleGoToSettings = useCallback(() => {
    collapsePanel();
    onPageChange('settings');
  }, [collapsePanel, onPageChange]);

  const toggleTheme = () => {
    themeContext.changeTheme(isDark ? 'v9-light' : 'v9-dark');
  };

  // Items that show a popover in collapsed mode
  const POPOVER_KEYS = new Set([
    'thread',
    'dashboards',
    'logs',
    'metrics',
    'tools',
  ]);

  const NAV_AUTO_SELECT = {
    thread: { page: 'thread', item: 'latency-spike' },
    dashboards: { page: 'dashboards', item: 'system-overview' },
    logs: { page: 'logs', item: null },
    metrics: { page: 'metrics', item: null },
  };

  const TOOLS_PAGES = new Set([
    'notebooks',
    'forecasters',
    'anomaly-dashboard',
    'detectors',
    'alerts-detail',
    'monitors-detail',
    'destinations',
    'ai-skills',
    'ai-memories',
    'ai-automations',
    'ai-mcp-servers',
  ]);
  const WORKSPACE_PAGES = new Set([
    'manage-workspace',
    'data-sources',
    'index-patterns',
    'datasets',
    'assets-detail',
    'sample-data',
  ]);
  const isNavItemActive = (itemKey) => {
    if (activePage === itemKey) return true;
    if (itemKey === 'tools' && TOOLS_PAGES.has(activePage)) return true;
    if (itemKey === 'manage-workspace' && WORKSPACE_PAGES.has(activePage))
      return true;
    return false;
  };

  const handleNavClick = (item) => {
    if (item.hoverOnly) return;
    if (item.isAction) {
      if (item.key === 'search') {
        setIsSearchOpen((open) => !open);
      }
      return;
    }

    // In expanded mode, tools and workspace are handled by NavGroup, not click
    if (
      isNavExpanded &&
      (item.key === 'tools' || item.key === 'manage-workspace')
    ) {
      return;
    }

    // In collapsed mode, tools and workspace toggle their popover
    if (
      !isNavExpanded &&
      (item.key === 'tools' || item.key === 'manage-workspace')
    ) {
      setNavPopover((prev) => (prev === item.key ? null : item.key));
      return;
    }

    // Close any open popover
    setNavPopover(null);

    // Navigate — use auto-select if available
    const autoSelect = NAV_AUTO_SELECT[item.key];
    if (autoSelect) {
      onPageChange(autoSelect.page);
      onItemSelect(autoSelect.item);
    } else {
      onPageChange(item.key);
    }
  };

  const expandedNavItem = expandedTab
    ? renderedNavItems.find((i) => i.key === expandedTab)
    : null;

  const PANEL_LABELS = {
    dashboards: 'Dashboards',
    logs: 'Logs',
    metrics: 'Metrics',
    tools: 'Tools',
    'manage-workspace': 'Workspace',
    notebooks: 'Notebooks',
    detectors: 'Detectors',
    alerts: 'Alerts',
    'alerts-detail': 'Alerts',
    monitors: 'Monitors',
    'monitors-detail': 'Monitors',
    'data-sources': 'Data sources',
    'index-patterns': 'Index patterns',
    datasets: 'Datasets',
    'assets-detail': 'Assets',
    'sample-data': 'Sample data',
  };

  let expandedPanelLabel = null;
  if (expandedTab) {
    expandedPanelLabel = expandedNavItem
      ? expandedNavItem.label
      : PANEL_LABELS[expandedTab] || expandedTab;
  }

  const PanelComponent = expandedTab ? PANEL_CONTENT[expandedTab] : null;

  // Handle child item click in expanded Tools/Workspace groups
  const handleGroupChildClick = useCallback(
    (child) => {
      collapsePanel();
      onPageChange(child.page);
    },
    [collapsePanel, onPageChange]
  );

  // ---------- EXPANDED NAV RENDER ----------
  const renderExpandedNav = () => {
    return (
      <nav
        aria-label="Sample pages navigation"
        className="samplePagesLeftNav samplePagesLeftNav--expanded">
        {/* Header: logo left, lock + collapse icons right */}
        <div className="samplePagesLeftNav__headerExpanded">
          <button
            type="button"
            className="samplePagesLeftNav__logoButton"
            aria-label="Go to home page"
            onClick={() => {
              collapsePanel();
              onLogoClick();
            }}>
            <OuiIcon type="logoOpenSearch" size="l" aria-hidden="true" />
          </button>
          <div className="samplePagesLeftNav__headerActions">
            <OuiButtonIcon
              iconType={isNavLocked ? 'lock' : 'lockOpen'}
              aria-label={isNavLocked ? 'Unlock navigation' : 'Lock navigation open'}
              color="text"
              display="empty"
              size="xs"
              onClick={() => setIsNavLocked((locked) => !locked)}
            />
            <OuiButtonIcon
              iconType="menuLeft"
              aria-label="Collapse navigation"
              color="text"
              display="empty"
              size="xs"
              onClick={() => {
                setIsNavLocked(false);
                setIsNavExpanded(false);
              }}
            />
          </div>
        </div>

        {/* Scrollable items */}
        <div className="samplePagesLeftNav__itemsExpanded">
          {/* Search — opens search popover */}
          <button
            type="button"
            className="samplePagesLeftNav__navItemExpanded"
            onClick={() => setIsSearchOpen((open) => !open)}>
            <div className="samplePagesLeftNav__navItemIconWrap">
              <OuiIcon type="search" size="m" />
            </div>
            <span className="samplePagesLeftNav__navItemExpandedLabel">
              Search
            </span>
          </button>

          {/* Threads — with popover on hover */}
          {(() => {
            const threadItem = renderedNavItems.find((i) => i.key === 'thread');
            if (!threadItem) return null;
            const isActive = activePage === threadItem.key;
            const btn = (
              <button
                type="button"
                className={`samplePagesLeftNav__navItemExpanded${
                  isActive ? ' samplePagesLeftNav__navItemExpanded--active' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNavClick(threadItem)}>
                <div className="samplePagesLeftNav__navItemIconWrap">
                  <OuiIcon type={threadItem.icon} size="m" />
                </div>
                <span className="samplePagesLeftNav__navItemExpandedLabel">
                  {threadItem.label}
                </span>
              </button>
            );
            return (
              <div
                onMouseEnter={() => openNavPopover('thread')}
                onMouseLeave={() => closeNavPopover()}>
                <OuiPopover
                  button={btn}
                  isOpen={navPopover === 'thread'}
                  closePopover={() => setNavPopover(null)}
                  anchorPosition="rightUp"
                  offset={-4}
                  panelPaddingSize="s"
                  panelClassName="samplePagesLeftNav__popoverPanel">
                  <div
                    onMouseEnter={() => openNavPopover('thread')}
                    onMouseLeave={() => closeNavPopover()}>
                    <ThreadPopoverContent
                      onNavigate={(page, itemKey) => {
                        setNavPopover(null);
                        onPopoverNavigate(page, itemKey);
                      }}
                      onViewAll={(page) => {
                        setNavPopover(null);
                        onViewAll(page);
                      }}
                    />
                  </div>
                </OuiPopover>
              </div>
            );
          })()}
          <div className="samplePagesLeftNav__spacer" />

          {/* Essentials section */}
          <div className="samplePagesLeftNav__sectionHeader">Essentials</div>
          {renderedNavItems
            .filter((i) => i.group === 'essentials')
            .map((item) => {
              const EXPANDED_POPOVER_MAP = {
                dashboards: DashboardsPopoverContent,
                logs: LogsPopoverContent,
                metrics: MetricsPopoverContent,
              };
              const PopContent = EXPANDED_POPOVER_MAP[item.key];
              const isActive = isNavItemActive(item.key);
              const btn = (
                <button
                  type="button"
                  className={`samplePagesLeftNav__navItemExpanded${
                    isActive
                      ? ' samplePagesLeftNav__navItemExpanded--active'
                      : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleNavClick(item)}>
                  <div className="samplePagesLeftNav__navItemIconWrap">
                    <OuiIcon type={item.icon} size="m" />
                  </div>
                  <span className="samplePagesLeftNav__navItemExpandedLabel">
                    {item.label}
                  </span>
                </button>
              );
              if (PopContent) {
                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => openNavPopover(item.key)}
                    onMouseLeave={() => closeNavPopover()}>
                    <OuiPopover
                      button={btn}
                      isOpen={navPopover === item.key}
                      closePopover={() => setNavPopover(null)}
                      anchorPosition="rightUp"
                      offset={-4}
                      ownFocus={false}
                      panelPaddingSize="s"
                      panelClassName="samplePagesLeftNav__popoverPanel">
                      <div
                        onMouseEnter={() => openNavPopover(item.key)}
                        onMouseLeave={() => closeNavPopover()}>
                        <PopContent
                          onNavigate={(page, itemKey) => {
                            setNavPopover(null);
                            onPopoverNavigate(page, itemKey);
                          }}
                          onViewAll={(page) => {
                            setNavPopover(null);
                            onViewAll(page);
                          }}
                        />
                      </div>
                    </OuiPopover>
                  </div>
                );
              }
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`samplePagesLeftNav__navItemExpanded${
                    isActive
                      ? ' samplePagesLeftNav__navItemExpanded--active'
                      : ''
                  }`}
                  aria-current={activePage === item.key ? 'page' : undefined}
                  onClick={() => handleNavClick(item)}>
                  <div className="samplePagesLeftNav__navItemIconWrap">
                    <OuiIcon type={item.icon} size="m" />
                  </div>
                  <span className="samplePagesLeftNav__navItemExpandedLabel">
                    {item.label}
                  </span>
                </button>
              );
            })}
          <div className="samplePagesLeftNav__spacer" />

          {/* Agent monitoring section */}
          <div className="samplePagesLeftNav__sectionHeader">
            Agent monitoring
          </div>
          {AGENT_MONITORING_CHILDREN.map((child) => {
            const isActive = activePage === child.page;
            return (
              <button
                key={child.key}
                type="button"
                className={`samplePagesLeftNav__navItemExpanded${
                  isActive ? ' samplePagesLeftNav__navItemExpanded--active' : ''
                }`}
                onClick={() => {
                  collapsePanel();
                  onPageChange(child.page);
                }}>
                <div className="samplePagesLeftNav__navItemIconWrap">
                  <OuiIcon type={child.icon} size="m" />
                </div>
                <span className="samplePagesLeftNav__navItemExpandedLabel">
                  {child.label}
                </span>
              </button>
            );
          })}
          <div className="samplePagesLeftNav__spacer" />

          {/* Application Performance section */}
          <div className="samplePagesLeftNav__sectionHeader">
            Application Performance
          </div>
          {APP_PERF_CHILDREN.map((child) => {
            const isActive = activePage === child.page;
            return (
              <button
                key={child.key}
                type="button"
                className={`samplePagesLeftNav__navItemExpanded${
                  isActive ? ' samplePagesLeftNav__navItemExpanded--active' : ''
                }`}
                onClick={() => {
                  collapsePanel();
                  onPageChange(child.page);
                }}>
                <div className="samplePagesLeftNav__navItemIconWrap">
                  <OuiIcon type={child.icon} size="m" />
                </div>
                <span className="samplePagesLeftNav__navItemExpandedLabel">
                  {child.label}
                </span>
              </button>
            );
          })}
          <div className="samplePagesLeftNav__spacer" />

          {/* More — collapsible with minus/plus toggle */}
          <NavGroup
            label="More"
            isOpen={groupOpen.tools}
            onToggle={() => toggleGroup('tools')}>
            {TOOLS_CHILDREN.map((child) => {
              const isChildActive = activePage === child.page;
              const popoverData = CHILD_PAGE_POPOVER_ITEMS[child.page];
              const btn = (
                <button
                  type="button"
                  className={`samplePagesLeftNav__navItemExpanded${
                    isChildActive
                      ? ' samplePagesLeftNav__navItemExpanded--active'
                      : ''
                  }`}
                  onClick={() => handleGroupChildClick(child)}>
                  <div className="samplePagesLeftNav__navItemIconWrap">
                    <OuiIcon type={child.icon} size="m" />
                  </div>
                  <span className="samplePagesLeftNav__navItemExpandedLabel">
                    {child.label}
                  </span>
                </button>
              );
              if (popoverData) {
                return (
                  <div
                    key={child.key}
                    onMouseEnter={() => openNavPopover(child.page)}
                    onMouseLeave={() => closeNavPopover()}>
                    <OuiPopover
                      button={btn}
                      isOpen={navPopover === child.page}
                      closePopover={() => setNavPopover(null)}
                      anchorPosition="rightUp"
                      offset={-4}
                      panelPaddingSize="s"
                      panelClassName="samplePagesLeftNav__popoverPanel">
                      <div
                        onMouseEnter={() => openNavPopover(child.page)}
                        onMouseLeave={() => closeNavPopover()}>
                        <ChildPagePopoverContent
                          pageKey={child.page}
                          onNavigate={(page, itemKey) => {
                            setNavPopover(null);
                            onPopoverNavigate(page, itemKey);
                          }}
                        />
                      </div>
                    </OuiPopover>
                  </div>
                );
              }
              return <React.Fragment key={child.key}>{btn}</React.Fragment>;
            })}
            {TOOLS_SUBGROUPS.map((sg) => {
              const isOpen = !!subgroupOpen[sg.key];
              const isAnyChildActive = false; // don't highlight parent
              return (
                <div key={sg.key} className="samplePagesLeftNav__subgroup">
                  <div
                    className={`samplePagesLeftNav__navItemExpanded samplePagesLeftNav__navItemExpanded--parent${
                      isAnyChildActive
                        ? ' samplePagesLeftNav__navItemExpanded--active'
                        : ''
                    }`}>
                    <div className="samplePagesLeftNav__navItemIconWrap">
                      <OuiIcon type={sg.icon} size="m" />
                    </div>
                    <span className="samplePagesLeftNav__navItemExpandedLabel">
                      {sg.label}
                    </span>
                    <OuiButtonIcon
                      iconType={isOpen ? 'minus' : 'plus'}
                      aria-label={
                        isOpen ? `Collapse ${sg.label}` : `Expand ${sg.label}`
                      }
                      size="xs"
                      color="text"
                      display="empty"
                      onClick={() => toggleSubgroup(sg.key)}
                    />
                  </div>
                  {isOpen && (
                    <div className="samplePagesLeftNav__subgroupChildren">
                      {sg.children.map((child, childIdx) => {
                        const isChildActive = activePage === child.page;
                        const popoverData =
                          CHILD_PAGE_POPOVER_ITEMS[child.page];
                        const childBtn = (
                          <button
                            type="button"
                            className={`samplePagesLeftNav__navItemExpanded samplePagesLeftNav__navItemExpanded--child${
                              isChildActive
                                ? ' samplePagesLeftNav__navItemExpanded--active'
                                : ''
                            }`}
                            onClick={() => handleGroupChildClick(child)}>
                            <div className="samplePagesLeftNav__treeLine" />
                            <span className="samplePagesLeftNav__navItemExpandedLabel samplePagesLeftNav__navItemExpandedLabel--subdued">
                              {child.label}
                            </span>
                          </button>
                        );
                        if (popoverData) {
                          return (
                            <div
                              key={child.key}
                              onMouseEnter={() => openNavPopover(child.page)}
                              onMouseLeave={() => closeNavPopover()}>
                              <OuiPopover
                                button={childBtn}
                                isOpen={navPopover === child.page}
                                closePopover={() => setNavPopover(null)}
                                anchorPosition="rightUp"
                                offset={-4}
                                panelPaddingSize="s"
                                panelClassName="samplePagesLeftNav__popoverPanel">
                                <div
                                  onMouseEnter={() =>
                                    openNavPopover(child.page)
                                  }
                                  onMouseLeave={() => closeNavPopover()}>
                                  <ChildPagePopoverContent
                                    pageKey={child.page}
                                    onNavigate={(page, itemKey) => {
                                      setNavPopover(null);
                                      onPopoverNavigate(page, itemKey);
                                    }}
                                  />
                                </div>
                              </OuiPopover>
                            </div>
                          );
                        }
                        return (
                          <React.Fragment key={child.key}>
                            {childBtn}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </NavGroup>
        </div>

        {/* Footer: workspace, devtools, settings, avatar */}
        <div className="samplePagesLeftNav__footerExpanded">
          <div className="samplePagesLeftNav__footerIcons">
            <div
              className="samplePagesLeftNav__footerItem"
              onMouseEnter={() => openNavPopover('workspace-footer')}
              onMouseLeave={() => closeNavPopover()}>
              <OuiPopover
                button={
                  <OuiButtonIcon
                    iconType="wsSelector"
                    aria-label="Workspace"
                    color="text"
                    display="empty"
                    size="xs"
                  />
                }
                isOpen={navPopover === 'workspace-footer'}
                closePopover={() => setNavPopover(null)}
                anchorPosition="upCenter"
                panelPaddingSize="s"
                panelClassName="samplePagesLeftNav__popoverPanel">
                <div
                  onMouseEnter={() => openNavPopover('workspace-footer')}
                  onMouseLeave={() => closeNavPopover()}>
                  <WorkspaceNavPanelContent
                    onPageChange={(page) => {
                      setNavPopover(null);
                      onPageChange(page);
                    }}
                    onOpenPanel={(panelKey) => {
                      setNavPopover(null);
                      onPageChange(panelKey);
                    }}
                    onItemSelect={(itemKey) => {
                      setNavPopover(null);
                      onItemSelect(itemKey);
                    }}
                    onPopoverNavigate={(page, itemKey) => {
                      setNavPopover(null);
                      onPopoverNavigate(page, itemKey);
                    }}
                  />
                </div>
              </OuiPopover>
            </div>
            <div className="samplePagesLeftNav__footerItem">
              <OuiToolTip content="Developer tools" position="top">
                <OuiButtonIcon
                  iconType="navDevtools"
                  aria-label="Developer tools"
                  color="text"
                  display="empty"
                  size="xs"
                  onClick={() => {}}
                />
              </OuiToolTip>
            </div>
            <div
              className="samplePagesLeftNav__footerItem"
              onMouseEnter={() => openNavPopover('settings-footer')}
              onMouseLeave={() => closeNavPopover()}>
              <OuiPopover
                button={
                  <OuiButtonIcon
                    iconType="gear"
                    aria-label="Settings"
                    color="text"
                    display="empty"
                    size="xs"
                  />
                }
                isOpen={navPopover === 'settings-footer'}
                closePopover={() => setNavPopover(null)}
                anchorPosition="upCenter"
                panelPaddingSize="s"
                panelClassName="samplePagesLeftNav__popoverPanel">
                <div
                  onMouseEnter={() => openNavPopover('settings-footer')}
                  onMouseLeave={() => closeNavPopover()}>
                  <SettingsPopoverContent
                    themeContext={themeContext}
                    appearanceSelection={appearanceSelection}
                    onAppearanceChange={setAppearanceSelection}
                    onPageChange={(page) => {
                      setNavPopover(null);
                      collapsePanel();
                      onPageChange(page);
                    }}
                  />
                </div>
              </OuiPopover>
            </div>
            <div
              className="samplePagesLeftNav__footerItem"
              onMouseEnter={() => openNavPopover('profile')}
              onMouseLeave={() => closeNavPopover()}>
              <OuiPopover
                button={<OuiAvatar name="OS" size="s" />}
                isOpen={navPopover === 'profile'}
                closePopover={() => setNavPopover(null)}
                anchorPosition="upCenter"
                panelPaddingSize="s"
                panelClassName="samplePagesLeftNav__popoverPanel">
                <div
                  onMouseEnter={() => openNavPopover('profile')}
                  onMouseLeave={() => closeNavPopover()}>
                  <ProfilePopoverContent />
                </div>
              </OuiPopover>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // ---------- COLLAPSED NAV RENDER ----------
  const renderCollapsedNav = () => (
    <nav aria-label="Sample pages navigation" className="samplePagesLeftNav">
      {/* Logo */}
      <div className="samplePagesLeftNav__header">
        <button
          type="button"
          className="samplePagesLeftNav__logoButton"
          aria-label="Go to home page"
          onClick={() => {
            collapsePanel();
            onLogoClick();
          }}>
          <OuiIcon type="logoOpenSearch" size="l" aria-hidden="true" />
        </button>
      </div>

      {/* Nav items — expand button first */}
      <div className="samplePagesLeftNav__items">
        <button
          type="button"
          className="samplePagesLeftNav__navItem"
          aria-label="Expand navigation"
          onClick={() => setIsNavExpanded(true)}>
          <div className="samplePagesLeftNav__navIcon">
            <OuiIcon type="menuRight" size="m" />
          </div>
        </button>
        {renderedNavItems.map((item) => {
          const isActive = !item.isAction && isNavItemActive(item.key);
          const buttonEl = (
            <button
              ref={(el) => {
                navItemRefs.current[item.key] = el;
              }}
              type="button"
              className={`samplePagesLeftNav__navItem${
                isActive ? ' samplePagesLeftNav__navItem--active' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleNavClick(item)}>
              <div className="samplePagesLeftNav__navIcon">
                <OuiIcon type={item.icon} size="m" />
              </div>
            </button>
          );

          // Popover items — open on hover in collapsed mode
          let navButton;
          if (POPOVER_KEYS.has(item.key)) {
            const POPOVER_MAP = {
              thread: ThreadPopoverContent,
              dashboards: DashboardsPopoverContent,
              logs: LogsPopoverContent,
              metrics: MetricsPopoverContent,
              tools: ToolsPanelContent,
              'manage-workspace': WorkspaceNavPanelContent,
            };
            const PopoverContent = POPOVER_MAP[item.key];
            const isToolsOrWorkspace =
              item.key === 'tools' || item.key === 'manage-workspace';
            const popoverButton =
              navPopover === item.key ? (
                buttonEl
              ) : (
                <OuiToolTip
                  content={item.tooltip || item.label}
                  position="right">
                  {buttonEl}
                </OuiToolTip>
              );
            navButton = (
              <div
                onMouseEnter={() => openNavPopover(item.key)}
                onMouseLeave={() => closeNavPopover()}>
                <OuiPopover
                  button={popoverButton}
                  isOpen={navPopover === item.key}
                  closePopover={() => setNavPopover(null)}
                  anchorPosition="rightUp"
                  offset={-4}
                  ownFocus={false}
                  panelPaddingSize="s"
                  panelClassName="samplePagesLeftNav__popoverPanel">
                  <div
                    onMouseEnter={() => openNavPopover(item.key)}
                    onMouseLeave={() => closeNavPopover()}>
                    {isToolsOrWorkspace ? (
                      <PopoverContent
                        onPageChange={(page) => {
                          setNavPopover(null);
                          onPageChange(page);
                        }}
                        onOpenPanel={(panelKey) => {
                          setNavPopover(null);
                          onPageChange(panelKey);
                        }}
                        onItemSelect={(itemKey) => {
                          setNavPopover(null);
                          onItemSelect(itemKey);
                        }}
                        onPopoverNavigate={(page, itemKey) => {
                          setNavPopover(null);
                          onPopoverNavigate(page, itemKey);
                        }}
                      />
                    ) : (
                      <PopoverContent
                        onNavigate={(page, itemKey) => {
                          setNavPopover(null);
                          onPopoverNavigate(page, itemKey);
                        }}
                        onViewAll={(page) => {
                          setNavPopover(null);
                          onViewAll(page);
                        }}
                      />
                    )}
                  </div>
                </OuiPopover>
              </div>
            );
          } else {
            navButton = (
              <OuiToolTip content={item.tooltip || item.label} position="right">
                {buttonEl}
              </OuiToolTip>
            );
          }

          if (item.rulerAfter) {
            return (
              <React.Fragment key={item.key}>
                {navButton}
                <OuiHorizontalRule
                  margin="none"
                  size="quarter"
                  className="samplePagesLeftNav__rule"
                />
              </React.Fragment>
            );
          }
          return <React.Fragment key={item.key}>{navButton}</React.Fragment>;
        })}
      </div>

      {/* Footer */}
      <div className="samplePagesLeftNav__footer">
        <div
          className="samplePagesLeftNav__footerItem"
          onMouseEnter={() => openNavPopover('workspace-footer')}
          onMouseLeave={() => closeNavPopover()}>
          <OuiPopover
            button={
              <OuiButtonIcon
                iconType="wsSelector"
                aria-label="Workspace"
                color="text"
                display="empty"
                size="xs"
              />
            }
            isOpen={navPopover === 'workspace-footer'}
            closePopover={() => setNavPopover(null)}
            anchorPosition="rightDown"
            panelPaddingSize="s"
            panelClassName="samplePagesLeftNav__popoverPanel">
            <div
              onMouseEnter={() => openNavPopover('workspace-footer')}
              onMouseLeave={() => closeNavPopover()}>
              <WorkspaceNavPanelContent
                onPageChange={(page) => {
                  setNavPopover(null);
                  onPageChange(page);
                }}
                onOpenPanel={(panelKey) => {
                  setNavPopover(null);
                  onPageChange(panelKey);
                }}
                onItemSelect={(itemKey) => {
                  setNavPopover(null);
                  onItemSelect(itemKey);
                }}
                onPopoverNavigate={(page, itemKey) => {
                  setNavPopover(null);
                  onPopoverNavigate(page, itemKey);
                }}
              />
            </div>
          </OuiPopover>
        </div>
        <div className="samplePagesLeftNav__footerItem">
          <OuiToolTip content="Developer tools" position="right">
            <OuiButtonIcon
              iconType="navDevtools"
              aria-label="Developer tools"
              color="text"
              display="empty"
              size="xs"
              onClick={() => {}}
            />
          </OuiToolTip>
        </div>
        <div
          className="samplePagesLeftNav__footerItem"
          onMouseEnter={() => openNavPopover('settings-footer')}
          onMouseLeave={() => closeNavPopover()}>
          <OuiPopover
            button={
              <OuiButtonIcon
                iconType="gear"
                aria-label="Settings"
                color="text"
                display="empty"
                size="xs"
              />
            }
            isOpen={navPopover === 'settings-footer'}
            closePopover={() => setNavPopover(null)}
            anchorPosition="rightDown"
            panelPaddingSize="s"
            panelClassName="samplePagesLeftNav__popoverPanel">
            <div
              onMouseEnter={() => openNavPopover('settings-footer')}
              onMouseLeave={() => closeNavPopover()}>
              <SettingsPopoverContent
                themeContext={themeContext}
                appearanceSelection={appearanceSelection}
                onAppearanceChange={setAppearanceSelection}
                onPageChange={(page) => {
                  setNavPopover(null);
                  collapsePanel();
                  onPageChange(page);
                }}
              />
            </div>
          </OuiPopover>
        </div>
        <div
          className="samplePagesLeftNav__footerItem"
          onMouseEnter={() => openNavPopover('profile')}
          onMouseLeave={() => closeNavPopover()}>
          <OuiPopover
            button={<OuiAvatar name="OS" size="s" />}
            isOpen={navPopover === 'profile'}
            closePopover={() => setNavPopover(null)}
            anchorPosition="rightDown"
            panelPaddingSize="s"
            panelClassName="samplePagesLeftNav__popoverPanel">
            <div
              onMouseEnter={() => openNavPopover('profile')}
              onMouseLeave={() => closeNavPopover()}>
              <ProfilePopoverContent />
            </div>
          </OuiPopover>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="samplePagesLeftNav__wrapper">
      <div
        className={`samplePagesLeftNav__clip${
          isNavExpanded
            ? ' samplePagesLeftNav__clip--expanded'
            : ' samplePagesLeftNav__clip--collapsed'
        }`}>
        {isNavExpanded ? renderExpandedNav() : renderCollapsedNav()}
      </div>

      {/* Search popover */}
      <SearchPopover
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(page, itemKey) => {
          collapsePanel();
          onPopoverNavigate(page, itemKey);
        }}
        onAskAi={onAskAi}
      />
    </div>
  );
};
