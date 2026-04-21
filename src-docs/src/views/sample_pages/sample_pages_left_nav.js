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

import React, { useContext, useState, useRef, useCallback } from 'react';

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
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';

const NAV_ITEMS = [
  { key: 'search', label: 'Search', icon: 'search', isAction: true },
  { key: 'thread', label: 'Thread', icon: 'navTicketing' },
  { key: 'discover', label: 'Discover', icon: 'navDiscover' },
  { key: 'service', label: 'APM', icon: 'navAnomalyDetection' },
  { key: 'more', label: 'More', icon: 'navQuerySets', hoverOnly: true },
];

// Panel content for Thread tab
const ThreadPanelContent = ({ onItemSelect, selectedItem }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      isActive={selectedItem === 'latency-spike'}
      label={
        <div>
          <OuiText size="s">
            <strong>Latency spike investigation</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Sarah Lee · 2 hours ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('latency-spike')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'checkout-error'}
      label={
        <div>
          <OuiText size="s">
            <strong>Checkout error rate alert</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Alex Chen · 5 hours ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('checkout-error')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'weekly-review'}
      label={
        <div>
          <OuiText size="s">
            <strong>Weekly service review</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Team Ops · 1 day ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('weekly-review')}
    />
  </OuiListGroup>
);

// Panel content for Discover tab
const DiscoverPanelContent = ({ onItemSelect, selectedItem }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      isActive={selectedItem === 'error-rate'}
      label={
        <div>
          <OuiText size="s">
            <strong>Error rate by service</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            source=logs | where level=&quot;ERROR&quot; | stats count() by
            service
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('error-rate')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'latency-percentiles'}
      label={
        <div>
          <OuiText size="s">
            <strong>Latency percentiles</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            source=traces | stats p99(latency), p50(latency) by service
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('latency-percentiles')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'throughput'}
      label={
        <div>
          <OuiText size="s">
            <strong>Throughput over time</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            source=metrics | stats avg(throughput) by span(timestamp, 5m)
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('throughput')}
    />
  </OuiListGroup>
);

// Panel content for APM tab
const ServicesPanelContent = ({ onPageChange, selectedItem }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      isActive={selectedItem === 'services'}
      iconType="navServices"
      label={
        <OuiText size="s">
          <strong>Services</strong>
        </OuiText>
      }
      onClick={() => onPageChange('service')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'application-map'}
      iconType="navServiceMap"
      label={
        <OuiText size="s">
          <strong>Application map</strong>
        </OuiText>
      }
      onClick={() => onPageChange('application-map')}
    />
  </OuiListGroup>
);

// Panel content for Alerts tab
const AlertsPanelContent = ({ onItemSelect, selectedItem }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      isActive={selectedItem === 'cpu-threshold'}
      label={
        <div>
          <OuiText size="s">
            <strong>CPU threshold exceeded</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Critical · Triggered 10 min ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('cpu-threshold')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'disk-usage'}
      label={
        <div>
          <OuiText size="s">
            <strong>Disk usage warning</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Warning · Triggered 1 hour ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('disk-usage')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'error-rate-spike'}
      label={
        <div>
          <OuiText size="s">
            <strong>Error rate spike</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Critical · Triggered 3 hours ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('error-rate-spike')}
    />
  </OuiListGroup>
);

// Panel content for Dashboards tab
const DashboardsPanelContent = ({ onItemSelect, selectedItem }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      isActive={selectedItem === 'system-overview'}
      label={
        <div>
          <OuiText size="s">
            <strong>System overview</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Updated 5 min ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('system-overview')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'web-traffic'}
      label={
        <div>
          <OuiText size="s">
            <strong>Web traffic analytics</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Updated 15 min ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('web-traffic')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      isActive={selectedItem === 'api-performance'}
      label={
        <div>
          <OuiText size="s">
            <strong>API performance</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Updated 30 min ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('api-performance')}
    />
  </OuiListGroup>
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

// Panel content for More tab
const MorePanelContent = ({ onPageChange, onNavigateToPage }) => (
  <div>
    <OuiListGroup gutterSize="none">
      <OuiListGroupItem
        iconType="navAlerting"
        label={
          <OuiText size="s">
            <strong>Alerts</strong>
          </OuiText>
        }
        onClick={() =>
          onNavigateToPage ? onNavigateToPage('alerts') : onPageChange('alerts')
        }
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        iconType="navDashboards"
        label={
          <OuiText size="s">
            <strong>Dashboards</strong>
          </OuiText>
        }
        onClick={() =>
          onNavigateToPage
            ? onNavigateToPage('dashboards')
            : onPageChange('dashboards')
        }
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        iconType="navReports"
        label={
          <OuiText size="s">
            <strong>Skills</strong>
          </OuiText>
        }
        onClick={() =>
          onNavigateToPage ? onNavigateToPage('skills') : onPageChange('skills')
        }
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        iconType="wsSelector"
        label={
          <OuiText size="s">
            <strong>Manage workspace</strong>
          </OuiText>
        }
        onClick={() => {}}
      />
    </OuiListGroup>
    <div style={{ padding: '12px 8px 0' }}>
      <OuiButtonEmpty size="s" flush="both" style={{ width: '100%' }}>
        Customize navigation bar
      </OuiButtonEmpty>
    </div>
  </div>
);

const PANEL_CONTENT = {
  thread: ThreadPanelContent,
  discover: DiscoverPanelContent,
  service: ServicesPanelContent,
  alerts: AlertsPanelContent,
  dashboards: DashboardsPanelContent,
  skills: SkillsPanelContent,
  more: MorePanelContent,
};

export const SamplePagesLeftNav = ({
  activePage,
  onPageChange,
  onItemSelect,
  selectedItem,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [expandedTab, setExpandedTab] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [appsPopoverOpen, setAppsPopoverOpen] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const navItemRefs = useRef({});

  const collapsePanel = useCallback(() => {
    setIsCollapsing(true);
    setTimeout(() => {
      setExpandedTab(null);
      setIsCollapsing(false);
    }, 200);
  }, []);

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
    if (item.isAction || item.hoverOnly) return;
    setHoveredTab(null);
    clearHoverTimeout();
    if (expandedTab === item.key) {
      collapsePanel();
    } else {
      setIsCollapsing(false);
      setExpandedTab(item.key);
      onPageChange(item.key);
    }
  };

  const expandedNavItem = expandedTab
    ? NAV_ITEMS.find((i) => i.key === expandedTab)
    : null;

  // Label map for panels that aren't in NAV_ITEMS (e.g. More sub-pages)
  const PANEL_LABELS = {
    alerts: 'Alerts',
    dashboards: 'Dashboards',
    skills: 'Skills',
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
      ? NAV_ITEMS.find((i) => i.key === hoveredTab)
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
      <nav aria-label="Sample pages navigation" className="samplePagesLeftNav">
        {/* Logo */}
        <div className="samplePagesLeftNav__header">
          <OuiIcon type="logoOpenSearch" size="l" aria-label="OpenSearch" />
        </div>

        {/* Nav items */}
        <div className="samplePagesLeftNav__items">
          {NAV_ITEMS.map((item) => {
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
          })}
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
                  iconType="wsSelector"
                  label="Workspace"
                  size="s"
                  onClick={() => {}}
                />
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
              const tabKey = hoveredTab;
              setExpandedTab(tabKey);
              setHoveredTab(null);
              onPageChange(page);
            }}
            onItemSelect={(item) => {
              const tabKey = hoveredTab;
              setExpandedTab(tabKey);
              setHoveredTab(null);
              onPageChange(tabKey);
              onItemSelect(item);
            }}
            selectedItem={selectedItem}
            onNavigateToPage={(page) => {
              setExpandedTab(page);
              setHoveredTab(null);
              onPageChange(page);
            }}
          />
        </div>
      )}
    </div>
  );
};
