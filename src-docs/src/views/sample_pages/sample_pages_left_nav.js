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
  OuiCheckbox,
  OuiTabs,
  OuiTab,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';
import {
  loadLayout,
  saveLayout,
  ALL_DRAGGABLE_ITEMS,
  FIXED_KEYS,
} from './nav_layout_utils';
import { SearchPopover } from './search_popover';

const NAV_ITEMS = [
  { key: 'search', label: 'Search', icon: 'search', isAction: true },
  { key: 'thread', label: 'Thread', icon: 'navTicketing' },
  { key: 'discover', label: 'Discover', icon: 'navDiscover' },
  { key: 'service', label: 'APM', icon: 'navAnomalyDetection' },
  { key: 'more', label: 'More', icon: 'navQuerySets', hoverOnly: true },
];

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
const DEFAULT_THREADS = [
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

// APM has no panel — clicking APM in the nav goes directly to the page

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

// Panel content for Dashboards tab
const DASHBOARDS_TABS = [
  { id: 'dashboards', name: 'Dashboards' },
  { id: 'notes', name: 'Notes' },
];

const DASHBOARDS_TAB_ITEMS = {
  dashboards: [
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
  ],
  notes: [
    {
      key: 'incident-notes',
      label: 'Incident postmortem notes',
      subtitle: 'Last edited 2 hours ago',
    },
    {
      key: 'runbook-checklist',
      label: 'Runbook checklist',
      subtitle: 'Last edited 1 day ago',
    },
    {
      key: 'capacity-planning',
      label: 'Capacity planning notes',
      subtitle: 'Last edited 3 days ago',
    },
  ],
};

const DashboardsPanelContent = ({ onItemSelect, selectedItem }) => {
  const [activeTab, setActiveTab] = useState('dashboards');
  return (
    <TabbedPanel
      tabs={DASHBOARDS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}>
      <PanelItemList
        items={DASHBOARDS_TAB_ITEMS[activeTab]}
        onItemSelect={onItemSelect}
        selectedItem={selectedItem}
      />
    </TabbedPanel>
  );
};

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
  onEnterCustomize,
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
          onClick={onEnterCustomize}>
          Customize navigation bar
        </OuiButtonEmpty>
      </div>
    </div>
  );
};

const PANEL_CONTENT = {
  thread: ThreadPanelContent,
  discover: DiscoverPanelContent,
  alerts: AlertsPanelContent,
  dashboards: DashboardsPanelContent,
  skills: SkillsPanelContent,
  assets: AssetsPanelContent,
  more: MorePanelContent,
};

export const SamplePagesLeftNav = ({
  activePage,
  onPageChange,
  onItemSelect,
  selectedItem,
  onLogoClick,
  createThreadRef,
  onContinueAsThread,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [expandedTab, setExpandedTab] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [appsPopoverOpen, setAppsPopoverOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [mainItems, setMainItems] = useState([]);
  const [overflowItems, setOverflowItems] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState(new Set());
  const hoverTimeoutRef = useRef(null);
  const navItemRefs = useRef({});
  const [threads, setThreads] = useState(DEFAULT_THREADS);

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

  useEffect(() => {
    const layout = loadLayout(ALL_DRAGGABLE_ITEMS);
    setMainItems(layout.mainKeys);
    setOverflowItems(layout.overflowKeys);
  }, []);

  const renderedNavItems = useMemo(() => {
    const fixedItems = NAV_ITEMS.filter(
      (item) => item.key === 'search' || item.key === 'thread'
    );
    const dynamicItems = mainItems
      .map((key) => {
        const itemData = ALL_DRAGGABLE_ITEMS.find((d) => d.key === key);
        return itemData
          ? { key: itemData.key, label: itemData.label, icon: itemData.icon }
          : null;
      })
      .filter(Boolean);
    const moreItem = NAV_ITEMS.find((item) => item.key === 'more');
    const items = [...fixedItems, ...dynamicItems];
    if (overflowItems.length > 0 && moreItem) {
      items.push(moreItem);
    }
    return items;
  }, [mainItems, overflowItems]);

  const collapsePanel = useCallback(() => {
    setIsCollapsing(true);
    setTimeout(() => {
      setExpandedTab(null);
      setIsCollapsing(false);
    }, 200);
  }, []);

  const handleDoneCustomize = useCallback(() => {
    const allKeys = ALL_DRAGGABLE_ITEMS.map((item) => item.key);
    const newMainKeys = allKeys.filter((k) => checkedKeys.has(k));
    const newOverflowKeys = allKeys.filter((k) => !checkedKeys.has(k));
    saveLayout(newMainKeys, newOverflowKeys);
    setMainItems(newMainKeys);
    setOverflowItems(newOverflowKeys);
    setIsCustomizing(false);
  }, [checkedKeys]);

  const handleEnterCustomize = useCallback(() => {
    setIsCustomizing(true);
    setCheckedKeys(new Set(mainItems));
    collapsePanel();
  }, [mainItems, collapsePanel]);

  const toggleTheme = () => {
    themeContext.changeTheme(isDark ? 'v9-light' : 'v9-dark');
  };

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleNavMouseEnter = useCallback(
    (item) => {
      if (item.isAction) return;
      // Don't show hover popover if this tab is already pinned open
      if (expandedTab === item.key) return;
      clearHoverTimeout();
      setHoveredTab(item.key);
    },
    [expandedTab, clearHoverTimeout]
  );

  const handleNavMouseLeave = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
    }, 150);
  }, [clearHoverTimeout]);

  const handlePopoverMouseEnter = useCallback(() => {
    clearHoverTimeout();
  }, [clearHoverTimeout]);

  const handlePopoverMouseLeave = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
    }, 150);
  }, [clearHoverTimeout]);

  const handleNavClick = (item) => {
    if (item.hoverOnly) return;
    if (item.isAction) {
      if (item.key === 'search') {
        setIsSearchOpen((open) => !open);
      }
      return;
    }
    setHoveredTab(null);
    clearHoverTimeout();
    // Items without a panel (e.g. APM) navigate directly
    if (!PANEL_CONTENT[item.key]) {
      collapsePanel();
      onPageChange(item.key);
      return;
    }
    if (expandedTab === item.key) {
      collapsePanel();
    } else {
      setIsCollapsing(false);
      setExpandedTab(item.key);
      onPageChange(item.key);
    }
  };

  const expandedNavItem = expandedTab
    ? renderedNavItems.find((i) => i.key === expandedTab)
    : null;

  // Label map for panels that aren't in NAV_ITEMS (e.g. More sub-pages)
  const PANEL_LABELS = {
    alerting: 'Alerting',
    alerts: 'Alerting',
    dashboards: 'Dashboards',
    skills: 'Skills',
    assets: 'Assets',
    'manage-workspace': 'Workspace',
  };

  let expandedPanelLabel = null;
  if (expandedTab) {
    expandedPanelLabel = expandedNavItem
      ? expandedNavItem.label
      : PANEL_LABELS[expandedTab] || expandedTab;
  }

  const PanelComponent = expandedTab ? PANEL_CONTENT[expandedTab] : null;

  // Hover popover
  const hoveredNavItem =
    hoveredTab && hoveredTab !== expandedTab
      ? renderedNavItems.find((i) => i.key === hoveredTab)
      : null;
  const HoverPanelComponent = hoveredNavItem
    ? PANEL_CONTENT[hoveredNavItem.key]
    : null;

  // Calculate popover position based on the hovered nav item
  let hoverPopoverTop = 0;
  if (hoveredTab && navItemRefs.current[hoveredTab]) {
    const rect = navItemRefs.current[hoveredTab].getBoundingClientRect();
    hoverPopoverTop = rect.top - 32;
  }

  return (
    <div className="samplePagesLeftNav__wrapper">
      <nav
        aria-label="Sample pages navigation"
        className={`samplePagesLeftNav${
          isCustomizing ? ' samplePagesLeftNav--customizing' : ''
        }`}>
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

        {/* Nav items */}
        <div className="samplePagesLeftNav__items">
          {isCustomizing ? (
            <>
              {/* Fixed items without checkboxes */}
              {NAV_ITEMS.filter((item) => FIXED_KEYS.includes(item.key)).map(
                (item) => (
                  <div
                    key={item.key}
                    className="samplePagesLeftNav__navItem samplePagesLeftNav__navItem--fixed">
                    <div className="samplePagesLeftNav__navIcon">
                      <OuiIcon type={item.icon} size="m" />
                    </div>
                    <span className="samplePagesLeftNav__navLabel">
                      {item.label}
                    </span>
                  </div>
                )
              )}
              {/* Draggable items with checkboxes */}
              {ALL_DRAGGABLE_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="samplePagesLeftNav__navItem samplePagesLeftNav__navItem--customizable">
                  <div className="samplePagesLeftNav__navIcon">
                    <OuiIcon type={item.icon} size="m" />
                  </div>
                  <span className="samplePagesLeftNav__navLabel">
                    {item.label}
                  </span>
                  <OuiCheckbox
                    id={`customize-checkbox-${item.key}`}
                    className="samplePagesLeftNav__customizeCheckbox"
                    checked={checkedKeys.has(item.key)}
                    onChange={() => {
                      setCheckedKeys((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.key)) {
                          next.delete(item.key);
                        } else {
                          next.add(item.key);
                        }
                        return next;
                      });
                    }}
                    aria-label={item.label}
                  />
                </div>
              ))}
              {/* Done button */}
              <div className="samplePagesLeftNav__doneButton">
                <OuiButtonEmpty size="s" onClick={handleDoneCustomize}>
                  Done
                </OuiButtonEmpty>
              </div>
            </>
          ) : (
            renderedNavItems.map((item) => {
              const isActive =
                !item.isAction &&
                (activePage === item.key || expandedTab === item.key);
              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    navItemRefs.current[item.key] = el;
                  }}
                  type="button"
                  className={`samplePagesLeftNav__navItem${
                    isActive ? ' samplePagesLeftNav__navItem--active' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleNavClick(item)}
                  onMouseEnter={() => handleNavMouseEnter(item)}
                  onMouseLeave={handleNavMouseLeave}>
                  <div className="samplePagesLeftNav__navIcon">
                    <OuiIcon type={item.icon} size="m" />
                  </div>
                  <span className="samplePagesLeftNav__navLabel">
                    {item.label}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="samplePagesLeftNav__footer">
          <OuiHorizontalRule
            margin="none"
            className="samplePagesLeftNav__rule"
          />
          <OuiButtonIcon
            iconType="home"
            aria-label="Home"
            color="text"
            display="empty"
            size="s"
            onClick={() => {
              collapsePanel();
              onLogoClick();
            }}
          />
          <OuiPopover
            button={
              <OuiButtonIcon
                iconType="apps"
                aria-label="More options"
                color="text"
                display="empty"
                size="s"
                onClick={() => setAppsPopoverOpen((open) => !open)}
              />
            }
            isOpen={appsPopoverOpen}
            closePopover={() => setAppsPopoverOpen(false)}
            anchorPosition="rightDown"
            panelPaddingSize="s">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                minWidth: 180,
              }}>
              <OuiListGroup gutterSize="none">
                <OuiListGroupItem
                  iconType="brush"
                  label="Switch theme"
                  size="s"
                  onClick={toggleTheme}
                />
                <OuiListGroupItem
                  iconType="console"
                  label="Developer tools"
                  size="s"
                  onClick={() => {}}
                />
                <OuiListGroupItem
                  iconType="gear"
                  label="Settings"
                  size="s"
                  onClick={() => {}}
                />
                <OuiListGroupItem
                  iconType="keyboardShortcut"
                  label="Keyboard shortcuts"
                  size="s"
                  onClick={() => {}}
                />
                <OuiListGroupItem
                  iconType="help"
                  label="Help"
                  size="s"
                  onClick={() => {}}
                />
              </OuiListGroup>
            </div>
          </OuiPopover>
          <OuiAvatar name="OS" size="m" />
        </div>
      </nav>

      {/* Expanded (pinned) panel */}
      {PanelComponent && (
        <div
          className={`samplePagesLeftNav__panelClip${
            isCollapsing ? ' samplePagesLeftNav__panelClip--collapsing' : ''
          }`}>
          <div className="samplePagesLeftNav__expandedPanel">
            <div className="samplePagesLeftNav__expandedPanelHeader">
              <OuiTitle size="s">
                <h3>{expandedPanelLabel}</h3>
              </OuiTitle>
              <div style={{ display: 'flex', gap: 4 }}>
                <OuiButtonIcon
                  iconType={
                    expandedTab === 'service'
                      ? 'controlsHorizontal'
                      : 'plusInCircle'
                  }
                  aria-label={
                    expandedTab === 'service' ? 'Options' : 'New item'
                  }
                  color="text"
                  display="empty"
                  size="s"
                  onClick={() => {
                    if (expandedTab === 'thread') {
                      handleCreateThread();
                    }
                  }}
                />
                <OuiButtonIcon
                  iconType="menuLeft"
                  aria-label="Collapse panel"
                  color="text"
                  display="empty"
                  size="s"
                  onClick={() => collapsePanel()}
                />
              </div>
            </div>
            <PanelComponent
              onPageChange={onPageChange}
              onItemSelect={onItemSelect}
              selectedItem={selectedItem}
              onEnterCustomize={handleEnterCustomize}
              overflowItems={overflowItems}
              threads={expandedTab === 'thread' ? threads : undefined}
              onNavigateToPage={(page) => {
                setExpandedTab(page);
                onPageChange(page);
              }}
            />
          </div>
        </div>
      )}

      {/* Hover popover */}
      {HoverPanelComponent && (
        <div
          className="samplePagesLeftNav__hoverPopover"
          style={{ top: hoverPopoverTop }}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}>
          <div className="samplePagesLeftNav__expandedPanelHeader">
            <OuiTitle size="s">
              <h3>{hoveredNavItem.label}</h3>
            </OuiTitle>
          </div>
          <HoverPanelComponent
            onPageChange={(page) => {
              setHoveredTab(null);
              // Collapse any previously expanded panel
              if (expandedTab) {
                collapsePanel();
              }
              onPageChange(page);
            }}
            onItemSelect={(item) => {
              const tabKey = hoveredTab;
              setHoveredTab(null);
              // Switch expanded panel to the hovered tab's section
              setIsCollapsing(false);
              setExpandedTab(tabKey);
              onPageChange(tabKey);
              onItemSelect(item);
            }}
            selectedItem={selectedItem}
            onEnterCustomize={handleEnterCustomize}
            overflowItems={overflowItems}
            threads={threads}
            onNavigateToPage={(page) => {
              setIsCollapsing(false);
              setExpandedTab(page);
              setHoveredTab(null);
              onPageChange(page);
            }}
          />
        </div>
      )}

      {/* Search popover */}
      <SearchPopover
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(page, itemKey) => {
          collapsePanel();
          onPageChange(page);
          onItemSelect(itemKey);
        }}
        onContinueAsThread={onContinueAsThread}
      />
    </div>
  );
};
