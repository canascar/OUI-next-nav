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
      onClick={() => onPageChange('service')}
    />
  </OuiListGroup>
);

// Panel content for More tab
const MorePanelContent = () => (
  <div>
    <OuiListGroup gutterSize="none">
      <OuiListGroupItem
        iconType="navAlerting"
        label={
          <OuiText size="s">
            <strong>Alerts</strong>
          </OuiText>
        }
        onClick={() => {}}
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
        onClick={() => {}}
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
  const hoverTimeoutRef = useRef(null);
  const navItemRefs = useRef({});

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
      setExpandedTab(null);
    } else {
      setExpandedTab(item.key);
      onPageChange(item.key);
    }
  };

  const expandedNavItem = expandedTab
    ? NAV_ITEMS.find((i) => i.key === expandedTab)
    : null;
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
          <OuiButtonIcon
            iconType="gear"
            aria-label="Settings"
            color="text"
            display="empty"
            size="s"
          />
          <OuiButtonIcon
            iconType="brush"
            aria-label={
              isDark ? 'Switch to light theme' : 'Switch to dark theme'
            }
            color="text"
            display="empty"
            size="s"
            onClick={toggleTheme}
          />
          <OuiButtonIcon
            iconType="iInCircle"
            aria-label="Info"
            color="text"
            display="empty"
            size="s"
          />
          <OuiAvatar name="OS" size="s" />
        </div>
      </nav>

      {/* Expanded (pinned) panel */}
      {PanelComponent && (
        <div className="samplePagesLeftNav__expandedPanel">
          <div className="samplePagesLeftNav__expandedPanelHeader">
            <OuiTitle size="s">
              <h3>{expandedNavItem.label}</h3>
            </OuiTitle>
            <div style={{ display: 'flex', gap: 4 }}>
              <OuiButtonIcon
                iconType="plusInCircle"
                aria-label="New item"
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
                onClick={() => setExpandedTab(null)}
              />
            </div>
          </div>
          <PanelComponent
            onPageChange={onPageChange}
            onItemSelect={onItemSelect}
            selectedItem={selectedItem}
          />
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
          />
        </div>
      )}
    </div>
  );
};
