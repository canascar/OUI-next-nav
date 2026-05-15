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

import React, { useState, useContext } from 'react';

// Import brace themes for the dev tools code editor (must import brace first)
import 'brace';
import 'brace/theme/github';
import 'brace/theme/tomorrow_night';
import 'brace/mode/json';

import {
  OuiLeftNav,
  OuiIcon,
  OuiButtonIcon,
  OuiAvatar,
  OuiPopover,
  OuiTabs,
  OuiTab,
  OuiToolTip,
  OuiSheet,
  OuiCodeEditor,
  OuiTitle,
  OuiSpacer,
  OuiButton,
  OuiButtonEmpty,
  OuiResizableContainer,
  OuiFlexGroup,
  OuiFlexItem,
} from '../../../../src/components';
import { ThemeContext } from '../../components/with_theme';

export const SamplePagesLeftNav = ({
  activePage,
  onPageChange,
  onItemSelect,
  selectedItem,
  padding,
  onPaddingChange,
  gap,
  onGapChange,
  cardPadding,
  onCardPaddingChange,
  gutter,
  onGutterChange,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [isThreadsOpen, setIsThreadsOpen] = useState(false);
  const [isDashboardsOpen, setIsDashboardsOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [discoverTab, setDiscoverTab] = useState('results');
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [metricsTab, setMetricsTab] = useState('results');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [expandedMoreSections, setExpandedMoreSections] = useState(new Set());
  const [showNotebooks, setShowNotebooks] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [showUserHelp, setShowUserHelp] = useState(false);
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('observability');
  const [showWorkspaceSelect, setShowWorkspaceSelect] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [devToolsQuery, setDevToolsQuery] = useState('GET _search\n{\n  "query": {\n    "match_all": {}\n  }\n}');
  const [devToolsResponse, setDevToolsResponse] = useState('');
  const [devToolsTab, setDevToolsTab] = useState('console');
  const notebooksTimeout = React.useRef(null);
  const userTimeout = React.useRef(null);
  const workspacesTimeout = React.useRef(null);
  const appearanceTimeout = React.useRef(null);
  const threadsTimeout = React.useRef(null);
  const dashboardsTimeout = React.useRef(null);
  const discoverTimeout = React.useRef(null);
  const metricsTimeout = React.useRef(null);
  const moreTimeout = React.useRef(null);
  const settingsTimeout = React.useRef(null);
  const themeContext = useContext(ThemeContext);
  const currentTheme = themeContext.theme;

  const handleAppearanceEnter = () => {
    clearTimeout(appearanceTimeout.current);
    setShowAppearance(true);
  };
  const handleAppearanceLeave = () => {
    appearanceTimeout.current = setTimeout(() => {
      setShowAppearance(false);
      setIsSettingsOpen(false);
    }, 300);
  };

  const handleThreadsEnter = () => {
    clearTimeout(threadsTimeout.current);
    setIsThreadsOpen(true);
  };
  const handleThreadsLeave = () => {
    threadsTimeout.current = setTimeout(() => setIsThreadsOpen(false), 200);
  };

  const handleDashboardsEnter = () => {
    clearTimeout(dashboardsTimeout.current);
    setIsDashboardsOpen(true);
  };
  const handleDashboardsLeave = () => {
    dashboardsTimeout.current = setTimeout(() => setIsDashboardsOpen(false), 200);
  };

  const handleDiscoverEnter = () => {
    clearTimeout(discoverTimeout.current);
    setIsDiscoverOpen(true);
  };
  const handleDiscoverLeave = () => {
    discoverTimeout.current = setTimeout(() => setIsDiscoverOpen(false), 200);
  };

  const handleMetricsEnter = () => {
    clearTimeout(metricsTimeout.current);
    setIsMetricsOpen(true);
  };
  const handleMetricsLeave = () => {
    metricsTimeout.current = setTimeout(() => setIsMetricsOpen(false), 200);
  };

  const handleMoreEnter = () => {
    clearTimeout(moreTimeout.current);
    setIsMoreOpen(true);
  };
  const handleMoreLeave = () => {
    moreTimeout.current = setTimeout(() => {
      setIsMoreOpen(false);
      setExpandedMoreSections(new Set());
    }, 200);
  };

  const toggleMoreSection = (id) => {
    setExpandedMoreSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNotebooksEnter = () => {
    clearTimeout(notebooksTimeout.current);
    setShowNotebooks(true);
  };
  const handleNotebooksLeave = () => {
    notebooksTimeout.current = setTimeout(() => setShowNotebooks(false), 200);
  };

  const handleUserEnter = () => {
    clearTimeout(userTimeout.current);
    setIsUserOpen(true);
  };
  const handleUserLeave = () => {
    userTimeout.current = setTimeout(() => {
      setIsUserOpen(false);
      setShowUserHelp(false);
    }, 200);
  };

  const handleSettingsEnter = () => {
    clearTimeout(settingsTimeout.current);
    setIsSettingsOpen(true);
  };
  const handleSettingsLeave = () => {
    settingsTimeout.current = setTimeout(() => {
      setIsSettingsOpen(false);
      setShowAppearance(false);
    }, 200);
  };

  const handleWorkspacesEnter = () => {
    clearTimeout(workspacesTimeout.current);
    setIsWorkspacesOpen(true);
  };
  const handleWorkspacesLeave = () => {
    workspacesTimeout.current = setTimeout(() => {
      setIsWorkspacesOpen(false);
      setShowWorkspaceSelect(false);
    }, 200);
  };

  const workspaceOptions = [
    { value: 'observability', label: 'Workspace name', sub: 'Observability' },
    { value: 'security', label: 'Security ops', sub: 'Security analytics' },
    { value: 'search', label: 'Search team', sub: 'Enterprise search' },
  ];
  const currentWorkspace = workspaceOptions.find((w) => w.value === selectedWorkspace) || workspaceOptions[0];

  const notebooks = [
    { title: 'Runbook checklist', edited: '2 hours ago' },
    { title: 'Incident postmortem', edited: '1 day ago' },
    { title: 'Capacity planning', edited: '3 days ago' },
  ];

  const moreItems = [
    { id: 'notebook', icon: 'document', label: 'Notebook' },
    { id: 'forecasting', icon: 'visArea', label: 'Forecasting' },
    {
      id: 'anomaly',
      icon: 'anomalyDetection',
      label: 'Anomaly Detection',
      children: ['Dashboard', 'Detectors'],
    },
    {
      id: 'alerting',
      icon: 'bell',
      label: 'Alerting',
      children: ['Alerts', 'Monitors', 'Destinations'],
    },
    {
      id: 'ai',
      icon: 'generate',
      label: 'AI Configs',
      children: ['Skills', 'Memories', 'Automations', 'MCP Servers'],
    },
  ];

  const metricsSavedResults = [
    { title: 'Throughput over time', query: 'source=metrics | stats avg(throughput)' },
    { title: 'CPU utilization', query: 'source=metrics | stats avg(cpu) by host' },
    { title: 'Memory pressure', query: 'source=metrics | stats max(mem_used)' },
  ];

  const metricsSavedQueries = [
    { title: 'Disk I/O by volume', query: 'source=metrics | stats avg(disk_io) by volume | sort -avg_disk_io' },
    { title: 'Network error rate', query: 'source=metrics | where net_errors > 0 | stats sum(net_errors) by interface' },
    { title: 'GC pause duration', query: 'source=metrics | stats max(gc_pause_ms) by service | sort -max_gc_pause_ms' },
  ];

  const discoverSavedResults = [
    { title: 'Error rate by service', query: 'source=logs | where level="ERROR"' },
    { title: 'Auth failure events', query: 'source=logs | where event="auth_fail"' },
    { title: 'Slow query log', query: 'source=logs | where duration > 5000' },
  ];

  const discoverSavedQueries = [
    { title: 'Latency by host', query: 'source=logs | stats avg(latency) by host' },
    { title: '5xx responses', query: 'source=logs | where status >= 500 | stats count() by path' },
    { title: 'Top users by request count', query: 'source=logs | stats count() as requests by user | sort -requests | head 50' },
  ];

  const dashboards = [
    { title: 'System overview', updated: '5 min ago' },
    { title: 'Web traffic analytics', updated: '15 min ago' },
    { title: 'API performance', updated: '30 min ago' },
    { title: 'Service health', updated: '1 hour ago' },
    { title: 'Error rates by region', updated: '2 hours ago' },
  ];

  const threads = [
    { title: 'Latency spike investigation', author: 'Sarah Lee', time: '2 hours ago' },
    { title: 'Checkout error rate alert', author: 'Alex Chen', time: '5 hours ago' },
    { title: 'Weekly service review', author: 'Team Ops', time: '1 day ago' },
    { title: 'Memory leak in catalog service', author: 'Jordan Park', time: '3 hours ago' },
    { title: 'DNS resolution timeouts', author: 'Priya Sharma', time: '6 hours ago' },
    { title: 'Failed deployment rollback', author: 'Marcus Webb', time: '8 hours ago' },
    { title: 'TLS certificate expiry warning', author: 'Dana Kim', time: '12 hours ago' },
    { title: 'Node disk pressure alerts', author: 'Riley Tanaka', time: '1 day ago' },
  ];

  const threadsContent = (
    <div style={{ width: 300 }}>
      <style>{`
        .threadItem {
          display: block;
          padding: 16px;
          margin: 2px 8px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          transition: background 150ms ease;
          background: transparent;
        }
        .threadItem:hover {
          background: rgba(46, 74, 143, 0.08);
        }
        .threadItem:active {
          background: rgba(46, 74, 143, 0.15);
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ouiColorDarkShade, #69707D)' }}>Recent threads</span>
        <OuiButtonIcon
          iconType="plus"
          aria-label="New thread"
          color="primary"
          display="fill"
          size="s"
          onClick={() => { setIsThreadsOpen(false); onPageChange('threads'); }}
        />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: 0 }} />
      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '4px 0 8px' }}>
        {threads.map((thread, i) => (
          <div key={i} className="threadItem" onClick={() => { setIsThreadsOpen(false); onPageChange('thread'); }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{thread.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #98A2B3)' }}>
              {thread.author} · {thread.time}
            </div>
          </div>
        ))}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: '8px 0 0' }} />
      <div style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #98A2B3)', cursor: 'pointer' }} onClick={() => { setIsThreadsOpen(false); onPageChange('recents'); }}>View all</span>
      </div>
    </div>
  );

  const discoverItems = discoverTab === 'results' ? discoverSavedResults : discoverSavedQueries;

  const metricsItems = metricsTab === 'results' ? metricsSavedResults : metricsSavedQueries;

  const metricsContent = (
    <div style={{ width: 320 }}>
      <style>{`
        .metricsItem {
          display: block;
          padding: 16px;
          margin: 2px 8px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          transition: background 150ms ease;
          background: transparent;
        }
        .metricsItem:hover {
          background: rgba(46, 74, 143, 0.08);
        }
        .metricsItem:active {
          background: rgba(46, 74, 143, 0.15);
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ouiColorDarkShade, #69707D)' }}>Recent metrics</span>
        <OuiButtonIcon
          iconType="plus"
          aria-label="New metric"
          color="primary"
          display="fill"
          size="s"
          onClick={() => { setIsMetricsOpen(false); onPageChange('metrics'); }}
        />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: 0 }} />
      <div style={{ padding: '4px 8px' }}>
        <OuiTabs size="s" expand>
          <OuiTab
            isSelected={metricsTab === 'results'}
            onClick={() => setMetricsTab('results')}>
            Saved results
          </OuiTab>
          <OuiTab
            isSelected={metricsTab === 'queries'}
            onClick={() => setMetricsTab('queries')}>
            Saved query
          </OuiTab>
        </OuiTabs>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '4px 0 8px' }}>
        {metricsItems.map((item, i) => (
          <div key={i} className="metricsItem" onClick={() => { setIsMetricsOpen(false); onPageChange('metrics'); }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #98A2B3)', fontFamily: 'monospace' }}>
              {item.query}
            </div>
          </div>
        ))}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: '8px 0 0' }} />
      <div style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #98A2B3)', cursor: 'pointer' }}>View all</span>
      </div>
    </div>
  );

  const moreContent = (
    <div style={{ width: 280, padding: 8 }}>
      <style>{`
        .moreRow {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          transition: background 150ms ease;
          background: transparent;
        }
        .moreRow:hover {
          background: rgba(46, 74, 143, 0.08);
        }
        .moreChild {
          display: block;
          padding: 8px 12px 8px 40px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          color: var(--ouiColorMediumShade, #69707D);
          position: relative;
          transition: background 150ms ease;
        }
        .moreChild::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 50%;
          width: 8px;
          height: 1px;
          background: rgba(128, 128, 128, 0.3);
        }
        .moreChildren {
          border-left: 1px solid rgba(46, 74, 143, 0.2);
          margin-left: 20px;
          padding-left: 0;
        }
        .moreChild:hover {
          background: rgba(46, 74, 143, 0.08);
        }
      `}</style>
      <div style={{ padding: '4px 12px 12px', fontSize: 13, color: 'var(--ouiColorMediumShade, #69707D)' }}>More</div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: '0 0 8px' }} />
      {moreItems.map((item) => {
        const isExpanded = expandedMoreSections.has(item.id);
        const hasChildren = item.children && item.children.length > 0;

        if (item.id === 'notebook') {
          return (
            <div key={item.id} onMouseEnter={handleNotebooksEnter} onMouseLeave={handleNotebooksLeave}>
              <OuiPopover
                display="block"
                button={
                  <div className="moreRow">
                    <OuiIcon type={item.icon} size="m" />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </div>
                }
                isOpen={showNotebooks}
                closePopover={() => setShowNotebooks(false)}
                anchorPosition="rightUp"
                hasArrow={false}
                panelPaddingSize="none"
                panelProps={{ onMouseEnter: handleNotebooksEnter, onMouseLeave: handleNotebooksLeave }}
                ownFocus={false}>
                <div style={{ width: 280 }}>
                  <style>{`
                    .notebookItem {
                      display: block;
                      padding: 16px;
                      margin: 2px 8px;
                      cursor: pointer;
                      border-radius: 8px;
                      font-size: 14px;
                      transition: background 150ms ease;
                      background: transparent;
                    }
                    .notebookItem:hover {
                      background: rgba(46, 74, 143, 0.08);
                    }
                  `}</style>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ouiColorDarkShade, #69707D)' }}>Recent notebooks</span>
                    <OuiButtonIcon iconType="plus" aria-label="New notebook" color="primary" display="fill" size="s" />
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: 0 }} />
                  <div style={{ padding: '4px 0 8px' }}>
                    {notebooks.map((nb, i) => (
                      <div key={i} className="notebookItem">
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{nb.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #98A2B3)' }}>Last edited {nb.edited}</div>
                      </div>
                    ))}
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: '8px 0 0' }} />
                  <div style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #98A2B3)', cursor: 'pointer' }}>View all</span>
                  </div>
                </div>
              </OuiPopover>
            </div>
          );
        }

        return (
          <div key={item.id}>
            <div
              className="moreRow"
              onClick={() => hasChildren && toggleMoreSection(item.id)}>
              <OuiIcon type={item.icon} size="m" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {hasChildren && (
                <OuiIcon type={isExpanded ? 'minus' : 'plus'} size="s" color="subdued" />
              )}
            </div>
            {hasChildren && isExpanded && (
              <div className="moreChildren">
                {item.children.map((child) => (
                  <div key={child} className="moreChild">
                    {child}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const discoverContent = (
    <div style={{ width: 320 }}>
      <style>{`
        .discoverItem {
          display: block;
          padding: 16px;
          margin: 2px 8px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          transition: background 150ms ease;
          background: transparent;
        }
        .discoverItem:hover {
          background: rgba(46, 74, 143, 0.08);
        }
        .discoverItem:active {
          background: rgba(46, 74, 143, 0.15);
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ouiColorDarkShade, #69707D)' }}>Recent logs</span>
        <OuiButtonIcon
          iconType="plus"
          aria-label="New discover"
          color="primary"
          display="fill"
          size="s"
          onClick={() => { setIsDiscoverOpen(false); onPageChange('discover'); }}
        />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: 0 }} />
      <div style={{ padding: '4px 8px' }}>
        <OuiTabs size="s" expand>
          <OuiTab
            isSelected={discoverTab === 'results'}
            onClick={() => setDiscoverTab('results')}>
            Saved results
          </OuiTab>
          <OuiTab
            isSelected={discoverTab === 'queries'}
            onClick={() => setDiscoverTab('queries')}>
            Saved query
          </OuiTab>
        </OuiTabs>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '4px 0 8px' }}>
        {discoverItems.map((item, i) => (
          <div key={i} className="discoverItem" onClick={() => { setIsDiscoverOpen(false); onPageChange('discover'); }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #98A2B3)', fontFamily: 'monospace' }}>
              {item.query}
            </div>
          </div>
        ))}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: '8px 0 0' }} />
      <div style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #98A2B3)', cursor: 'pointer' }}>View all</span>
      </div>
    </div>
  );

  const dashboardsContent = (
    <div style={{ width: 280 }}>
      <style>{`
        .dashboardItem {
          display: block;
          padding: 16px;
          margin: 2px 8px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          transition: background 150ms ease;
          background: transparent;
        }
        .dashboardItem:hover {
          background: rgba(46, 74, 143, 0.08);
        }
        .dashboardItem:active {
          background: rgba(46, 74, 143, 0.15);
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ouiColorDarkShade, #69707D)' }}>Recent dashboards</span>
        <OuiButtonIcon
          iconType="plus"
          aria-label="New dashboard"
          color="primary"
          display="fill"
          size="s"
          onClick={() => { setIsDashboardsOpen(false); onPageChange('dashboards'); }}
        />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: 0 }} />
      <div style={{ maxHeight: 400, overflowY: 'auto', padding: '4px 0 8px' }}>
        {dashboards.map((dashboard, i) => (
          <div key={i} className="dashboardItem" onClick={() => { setIsDashboardsOpen(false); onPageChange('dashboards'); }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{dashboard.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #98A2B3)' }}>
              Updated {dashboard.updated}
            </div>
          </div>
        ))}
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: '8px 0 0' }} />
      <div style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #98A2B3)', cursor: 'pointer' }}>View all</span>
      </div>
    </div>
  );

  const settingsContent = (
    <div style={{ padding: 8, minWidth: 220 }}>
      <style>{`
        .settingsMenuItem {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          position: relative;
          transition: background 150ms ease;
          background: transparent;
        }
        .settingsMenuItem:hover {
          background: rgba(46, 74, 143, 0.12);
        }
        .settingsMenuItem:active {
          background: rgba(46, 74, 143, 0.2);
        }
        .settingsMenuItem--active {
          background: rgba(46, 74, 143, 0.1);
        }
        .appearanceMenuItem {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          transition: background 150ms ease;
          background: transparent;
        }
        .appearanceMenuItem:hover {
          background: rgba(46, 74, 143, 0.12);
        }
        .appearanceMenuItem:active {
          background: rgba(46, 74, 143, 0.2);
        }
        .threadItem {
          display: block;
          padding: 16px;
          margin: 2px 8px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          transition: background 150ms ease;
          background: transparent;
        }
        .threadItem:hover {
          background: rgba(46, 74, 143, 0.08);
        }
        .threadItem:active {
          background: rgba(46, 74, 143, 0.15);
        }
      `}</style>
      <div
        className="settingsMenuItem"
        onMouseEnter={() => setShowAppearance(false)}>
        <OuiIcon type="gear" size="m" />
        <span style={{ flex: 1 }}>Settings and setup</span>
        <OuiIcon type="popout" size="s" color="subdued" />
      </div>
      <div
        className="settingsMenuItem"
        onMouseEnter={() => setShowAppearance(false)}>
        <OuiIcon type="database" size="m" />
        <span style={{ flex: 1 }}>Data administration</span>
        <OuiIcon type="popout" size="s" color="subdued" />
      </div>
      <div
        onMouseEnter={handleAppearanceEnter}
        onMouseLeave={handleAppearanceLeave}>
      <OuiPopover
        display="block"
        button={
          <div
            className={`settingsMenuItem ${showAppearance ? 'settingsMenuItem--active' : ''}`}>
            <OuiIcon type="invert" size="m" />
            <span style={{ flex: 1 }}>Appearance</span>
            <OuiIcon type="arrowRight" size="s" color="subdued" />
          </div>
        }
        isOpen={showAppearance}
        closePopover={() => setShowAppearance(false)}
        anchorPosition="rightCenter"
        hasArrow={false}
        panelPaddingSize="none" panelClassName="navPopoverPanel"
        panelStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)' }}
        panelProps={{ onMouseEnter: handleAppearanceEnter, onMouseLeave: handleAppearanceLeave }}
        ownFocus={false}>
        <div style={{ padding: 8, minWidth: 160 }}>
          <div
            className="appearanceMenuItem"
            onClick={() => {
              themeContext.changeTheme('v9-light');
              setIsSettingsOpen(false);
              setShowAppearance(false);
            }}>
            <OuiIcon type={currentTheme === 'v9-light' ? 'check' : 'empty'} size="m" />
            <span>Light</span>
          </div>
          <div
            className="appearanceMenuItem"
            onClick={() => {
              themeContext.changeTheme('v9-dark');
              setIsSettingsOpen(false);
              setShowAppearance(false);
            }}>
            <OuiIcon type={currentTheme === 'v9-dark' ? 'check' : 'empty'} size="m" />
            <span>Dark</span>
          </div>
          <div
            className="appearanceMenuItem"
            onClick={() => {
              setIsSettingsOpen(false);
              setShowAppearance(false);
            }}>
            <OuiIcon type="empty" size="m" />
            <span>System</span>
          </div>
        </div>
      </OuiPopover>
      </div>
    </div>
  );

  return (
    <>
    <OuiLeftNav
      aria-label="Sample pages navigation"
      logo={<OuiIcon type="logoOpenSearch" size="l" />}
      footer={
        <>
          <div onMouseEnter={handleWorkspacesEnter} onMouseLeave={handleWorkspacesLeave}>
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
            isOpen={isWorkspacesOpen}
            closePopover={() => { setIsWorkspacesOpen(false); setShowWorkspaceSelect(false); }}
            anchorPosition="rightUp"
            hasArrow={false}
            panelPaddingSize="none"
            panelProps={{ onMouseEnter: handleWorkspacesEnter, onMouseLeave: handleWorkspacesLeave }}>
            <div style={{ width: 300, padding: 8 }}>
              <style>{`
                .wsMenuItem {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 10px 12px;
                  cursor: pointer;
                  border-radius: 8px;
                  font-size: 14px;
                  transition: background 150ms ease;
                }
                .wsMenuItem:hover {
                  background: rgba(46, 74, 143, 0.08);
                }
                .wsSelectTrigger {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 12px;
                  margin-bottom: 8px;
                  border: 1px solid rgba(128,128,128,0.25);
                  border-radius: 8px;
                  cursor: pointer;
                  transition: border-color 150ms ease, background 150ms ease;
                }
                .wsSelectTrigger:hover {
                  border-color: var(--ouiColorPrimary, #0092B8);
                  background: rgba(46, 74, 143, 0.04);
                }
                .wsSelectOption {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 10px 12px;
                  cursor: pointer;
                  border-radius: 8px;
                  transition: background 150ms ease;
                }
                .wsSelectOption:hover {
                  background: rgba(46, 74, 143, 0.08);
                }
              `}</style>

              {/* Super select trigger */}
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <div className="wsSelectTrigger" style={{ marginBottom: 0 }} onClick={() => setShowWorkspaceSelect(!showWorkspaceSelect)}>
                  <OuiIcon type="glasses" size="m" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{currentWorkspace.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #98A2B3)' }}>
                      {currentWorkspace.sub}
                    </div>
                  </div>
                  <OuiIcon type="arrowDown" size="s" color="subdued" />
                </div>

                {showWorkspaceSelect && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    padding: 4,
                    border: '1px solid rgba(128,128,128,0.25)',
                    borderRadius: 8,
                    background: 'var(--ouiColorEmptyShade, #fff)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 10,
                  }}>
                    {workspaceOptions.map((ws) => (
                      <div
                        key={ws.value}
                        className="wsSelectOption"
                        onClick={() => {
                          setSelectedWorkspace(ws.value);
                          setShowWorkspaceSelect(false);
                        }}>
                        <OuiIcon
                          type={ws.value === selectedWorkspace ? 'check' : 'empty'}
                          size="m"
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{ws.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #98A2B3)' }}>
                            {ws.sub}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="wsMenuItem">
                <OuiIcon type="apps" size="m" />
                <span>Workspace details</span>
              </div>
              <div className="wsMenuItem">
                <OuiIcon type="users" size="m" />
                <span>Collaborators</span>
              </div>
              <div className="wsMenuItem">
                <OuiIcon type="database" size="m" />
                <span>Data sources</span>
              </div>
              <div className="wsMenuItem">
                <OuiIcon type="indexSettings" size="m" />
                <span>Index patterns</span>
              </div>
              <div className="wsMenuItem">
                <OuiIcon type="package" size="m" />
                <span>Assets</span>
              </div>
              <div className="wsMenuItem">
                <OuiIcon type="document" size="m" />
                <span>Sample data</span>
              </div>
              <div className="wsMenuItem">
                <OuiIcon type="home" size="m" />
                <span>All workspaces</span>
              </div>
            </div>
          </OuiPopover>
          </div>
          <OuiToolTip content="Developer tools" position="right" delay="regular">
            <OuiButtonIcon
              iconType="navDevtools"
              aria-label="Developer tools"
              color="text"
              display="empty"
              size="xs"
              onClick={() => setIsDevToolsOpen(true)}
            />
          </OuiToolTip>
          <div onMouseEnter={handleSettingsEnter} onMouseLeave={handleSettingsLeave}>
          <OuiPopover
            button={
              <OuiButtonIcon
                iconType="gear"
                aria-label="Settings"
                color="text"
                display="empty"
                size="xs"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              />
            }
            isOpen={isSettingsOpen}
            closePopover={() => { setIsSettingsOpen(false); setShowAppearance(false); }}
            anchorPosition="rightDown"
            hasArrow={false}
            panelPaddingSize="none" panelClassName="navPopoverPanel"
            panelProps={{ onMouseEnter: handleSettingsEnter, onMouseLeave: handleSettingsLeave }}
            panelStyle={{ borderRadius: 12, overflow: 'visible', border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)' }}>
            {settingsContent}
          </OuiPopover>
          </div>
          <div onMouseEnter={handleUserEnter} onMouseLeave={handleUserLeave}>
          <OuiPopover
            button={
              <div
                style={{ cursor: 'pointer', display: 'inline-block' }}
                onClick={() => setIsUserOpen(!isUserOpen)}>
                <OuiAvatar name="John" size="s" color="#F8A5C2" />
              </div>
            }
            isOpen={isUserOpen}
            closePopover={() => { setIsUserOpen(false); setShowUserHelp(false); }}
            anchorPosition="rightUp"
            hasArrow={false}
            panelPaddingSize="none"
            panelClassName="avatarPopover"
            panelProps={{ onMouseEnter: handleUserEnter, onMouseLeave: handleUserLeave }}>
            <div style={{ width: 300, padding: 8 }}>
              <style>{`
                .userMenuItem {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 10px 12px;
                  cursor: pointer;
                  border-radius: 8px;
                  font-size: 14px;
                  transition: background 150ms ease;
                }
                .userMenuItem:hover {
                  background: rgba(46, 74, 143, 0.08);
                }
                .userMenuChild {
                  display: block;
                  padding: 8px 12px 8px 40px;
                  cursor: pointer;
                  border-radius: 8px;
                  font-size: 14px;
                  color: var(--ouiColorDarkShade, #69707D);
                  position: relative;
                  transition: background 150ms ease;
                }
                .userMenuChild::before {
                  content: '';
                  position: absolute;
                  left: 24px;
                  top: 50%;
                  width: 8px;
                  height: 1px;
                  background: rgba(128, 128, 128, 0.3);
                }
                .userMenuChildren {
                  border-left: 1px solid rgba(46, 74, 143, 0.2);
                  margin-left: 20px;
                }
                .userMenuChild:hover {
                  background: rgba(46, 74, 143, 0.08);
                }
              `}</style>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
                <OuiAvatar name="John" size="s" color="#F8A5C2" />
                <span style={{ fontSize: 14, fontWeight: 500 }}>John</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(128,128,128,0.15)', margin: '8px 0' }} />
              <div className="userMenuItem">
                <OuiIcon type="user" size="m" />
                <span>Roles and identities</span>
              </div>
              <div className="userMenuItem" onClick={() => setShowUserHelp(!showUserHelp)}>
                <OuiIcon type="help" size="m" />
                <span style={{ flex: 1 }}>Help</span>
                <OuiIcon type={showUserHelp ? 'minus' : 'plus'} size="s" color="subdued" />
              </div>
              {showUserHelp && (
                <div className="userMenuChildren">
                  <div className="userMenuChild">Documentation</div>
                  <div className="userMenuChild">Community</div>
                  <div className="userMenuChild">Give feedback</div>
                  <div className="userMenuChild">Keyboard shortcut</div>
                </div>
              )}
              <div className="userMenuItem">
                <OuiIcon type="logoGithub" size="m" />
                <span>Open an issue in Github</span>
              </div>
              <div
                className="userMenuItem"
                onClick={() => { setIsUserOpen(false); onPageChange('login'); }}>
                <OuiIcon type="exit" size="m" />
                <span>Logout</span>
              </div>
            </div>
          </OuiPopover>
          </div>
        </>
      }>
      <OuiToolTip content="Expand" position="right" delay="regular">
        <OuiButtonIcon
          iconType="menuRight"
          aria-label="Menu"
          color="text"
          display="empty"
          size="xs"
        />
      </OuiToolTip>
      <OuiToolTip content="Search" position="right" delay="regular">
        <OuiButtonIcon
          iconType="search"
          aria-label="Search"
          color="text"
          display="empty"
          size="xs"
        />
      </OuiToolTip>
      <div onMouseEnter={handleThreadsEnter} onMouseLeave={handleThreadsLeave}>
        <OuiPopover
          display="block"
          button={
            <OuiButtonIcon
              iconType="navTicketing"
              aria-label="Ticketing"
              color="text"
              display="empty"
              size="xs"
              onClick={() => onPageChange('threads')}
            />
          }
          isOpen={isThreadsOpen}
          closePopover={() => setIsThreadsOpen(false)}
          anchorPosition="rightUp"
          hasArrow={false}
          panelPaddingSize="none" panelClassName="navPopoverPanel"
          panelStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)' }}
          panelProps={{ onMouseEnter: handleThreadsEnter, onMouseLeave: handleThreadsLeave }}
          ownFocus={false}>
          {threadsContent}
        </OuiPopover>
      </div>
      <hr style={{ width: '60%', border: 'none', borderTop: '1px solid currentColor', opacity: 0.2, margin: 0 }} />
      <OuiToolTip content="Overview" position="right" delay="regular">
        <OuiButtonIcon
          iconType="globe"
          aria-label="Overview"
          color="text"
          display="empty"
          size="xs"
          onClick={() => onPageChange('overview')}
        />
      </OuiToolTip>
      <div onMouseEnter={handleDashboardsEnter} onMouseLeave={handleDashboardsLeave}>
        <OuiPopover
          display="block"
          button={
            <OuiButtonIcon
              iconType="navDashboards"
              aria-label="Dashboards"
              color="text"
              display="empty"
              size="xs"
            />
          }
          isOpen={isDashboardsOpen}
          closePopover={() => setIsDashboardsOpen(false)}
          anchorPosition="rightUp"
          hasArrow={false}
          panelPaddingSize="none"
          panelProps={{ onMouseEnter: handleDashboardsEnter, onMouseLeave: handleDashboardsLeave }}
          ownFocus={false}>
          {dashboardsContent}
        </OuiPopover>
      </div>
      <div onMouseEnter={handleDiscoverEnter} onMouseLeave={handleDiscoverLeave}>
        <OuiPopover
          display="block"
          button={
            <OuiButtonIcon
              iconType="navDiscover"
              aria-label="Discover"
              color="text"
              display="empty"
              size="xs"
            />
          }
          isOpen={isDiscoverOpen}
          closePopover={() => setIsDiscoverOpen(false)}
          anchorPosition="rightUp"
          hasArrow={false}
          panelPaddingSize="none"
          panelProps={{ onMouseEnter: handleDiscoverEnter, onMouseLeave: handleDiscoverLeave }}
          ownFocus={false}>
          {discoverContent}
        </OuiPopover>
      </div>
      <div onMouseEnter={handleMetricsEnter} onMouseLeave={handleMetricsLeave}>
        <OuiPopover
          display="block"
          button={
            <OuiButtonIcon
              iconType="visArea"
              aria-label="Visualizations"
              color="text"
              display="empty"
              size="xs"
            />
          }
          isOpen={isMetricsOpen}
          closePopover={() => setIsMetricsOpen(false)}
          anchorPosition="rightUp"
          hasArrow={false}
          panelPaddingSize="none"
          panelProps={{ onMouseEnter: handleMetricsEnter, onMouseLeave: handleMetricsLeave }}
          ownFocus={false}>
          {metricsContent}
        </OuiPopover>
      </div>
      <OuiToolTip content="AI Flow" position="right" delay="regular">
        <OuiButtonIcon
          iconType="navAiFlow"
          aria-label="AI Flow"
          color="text"
          display="empty"
          size="xs"
        />
      </OuiToolTip>
      <hr style={{ width: '60%', border: 'none', borderTop: '1px solid currentColor', opacity: 0.2, margin: 0 }} />
      <OuiToolTip content="Tables" position="right" delay="regular">
        <OuiButtonIcon
          iconType="visTable"
          aria-label="Table"
          color="text"
          display="empty"
          size="xs"
        />
      </OuiToolTip>
      <OuiToolTip content="Tag cloud" position="right" delay="regular">
        <OuiButtonIcon
          iconType="visTagCloud"
          aria-label="Tag cloud"
          color="text"
          display="empty"
          size="xs"
        />
      </OuiToolTip>
      <hr style={{ width: '60%', border: 'none', borderTop: '1px solid currentColor', opacity: 0.2, margin: 0 }} />
      <OuiToolTip content="Traces" position="right" delay="regular">
        <OuiButtonIcon
          iconType="apmTrace"
          aria-label="Traces"
          color="text"
          display="empty"
          size="xs"
        />
      </OuiToolTip>
      <OuiToolTip content="Services" position="right" delay="regular">
        <OuiButtonIcon
          iconType="navServices"
          aria-label="Services"
          color="text"
          display="empty"
          size="xs"
          onClick={() => onPageChange('service')}
        />
      </OuiToolTip>
      <hr style={{ width: '60%', border: 'none', borderTop: '1px solid currentColor', opacity: 0.2, margin: 0 }} />
      <div onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
        <OuiPopover
          display="block"
          button={
            <OuiButtonIcon
              iconType="boxesHorizontal"
              aria-label="More"
              color="text"
              display="empty"
              size="xs"
            />
          }
          isOpen={isMoreOpen}
          closePopover={() => setIsMoreOpen(false)}
          anchorPosition="rightDown"
          hasArrow={false}
          panelPaddingSize="none"
          panelProps={{ onMouseEnter: handleMoreEnter, onMouseLeave: handleMoreLeave }}
          ownFocus={false}>
          {moreContent}
        </OuiPopover>
      </div>
    </OuiLeftNav>
    {isDevToolsOpen && (
      <OuiSheet onClose={() => setIsDevToolsOpen(false)}>
        <div style={{ padding: '20px 32px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <OuiTitle size="m">
            <h2>Dev Tools</h2>
          </OuiTitle>
          <OuiButtonIcon
            iconType="gear"
            aria-label="Dev Tools settings"
            color="text"
            display="empty"
          />
        </div>
        <div style={{ padding: '12px 0 0', margin: '0 0 16px', borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
          <OuiFlexGroup alignItems="center" gutterSize="none" responsive={false} style={{ padding: '0 24px 12px 32px' }}>
            <OuiFlexItem grow={false}>
              <OuiTabs>
                <OuiTab
                  isSelected={devToolsTab === 'console'}
                  onClick={() => setDevToolsTab('console')}>
                  Console
                </OuiTab>
                <OuiTab
                  isSelected={devToolsTab === 'workbench'}
                  onClick={() => setDevToolsTab('workbench')}>
                  Query Workbench
                </OuiTab>
              </OuiTabs>
            </OuiFlexItem>
            <OuiFlexItem />
            <OuiFlexItem grow={false}>
              <OuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                <OuiFlexItem grow={false}>
                  <OuiButtonEmpty iconType="refresh" size="s">
                    History
                  </OuiButtonEmpty>
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <OuiButtonEmpty iconType="exportAction" size="s">
                    Export
                  </OuiButtonEmpty>
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <OuiButton iconType="play" size="s" fill>
                    Run
                  </OuiButton>
                </OuiFlexItem>
              </OuiFlexGroup>
            </OuiFlexItem>
          </OuiFlexGroup>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <OuiResizableContainer style={{ height: '100%' }}>
            {(OuiResizablePanel, OuiResizableButton) => (
              <>
                <OuiResizablePanel initialSize={50} minSize="20%" paddingSize="s">
                  <OuiCodeEditor
                    mode="json"
                    theme={currentTheme === 'v9-dark' ? 'tomorrow_night' : 'github'}
                    width="100%"
                    height="100%"
                    value={devToolsQuery}
                    onChange={setDevToolsQuery}
                    setOptions={{ showLineNumbers: true, tabSize: 2 }}
                    aria-label="Query editor"
                  />
                </OuiResizablePanel>

                <OuiResizableButton />

                <OuiResizablePanel initialSize={50} minSize="20%" paddingSize="s">
                  <OuiCodeEditor
                    mode="json"
                    theme={currentTheme === 'v9-dark' ? 'tomorrow_night' : 'github'}
                    width="100%"
                    height="100%"
                    value={devToolsResponse}
                    onChange={setDevToolsResponse}
                    setOptions={{ showLineNumbers: true, tabSize: 2, readOnly: true }}
                    aria-label="Response"
                  />
                </OuiResizablePanel>
              </>
            )}
          </OuiResizableContainer>
        </div>
      </OuiSheet>
    )}
    </>
  );
};
