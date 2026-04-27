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
  OuiButtonGroup,
  OuiFormRow,
  OuiSpacer,
  OuiModal,
  OuiModalHeader,
  OuiModalHeaderTitle,
  OuiModalBody,
  OuiModalFooter,
  OuiButton,
  OuiSwitch,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';

const SPACING_OPTIONS = [
  { id: 'spacing-4', label: 'Sm' },
  { id: 'spacing-8', label: 'Md' },
  { id: 'spacing-16', label: 'Lg' },
  { id: 'spacing-24', label: 'Xl' },
];

const SPACING_MAP = {
  'spacing-4': 4,
  'spacing-8': 8,
  'spacing-16': 16,
  'spacing-24': 24,
};

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
    <OuiHorizontalRule margin="none" />
    <OuiButtonEmpty
      size="s"
      flush="both"
      style={{ width: '100%', justifyContent: 'center' }}>
      Customize navigation bar
    </OuiButtonEmpty>
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
  padding,
  onPaddingChange,
  gap,
  onGapChange,
  cardPadding,
  onCardPaddingChange,
  gutter,
  onGutterChange,
  showLabels,
  onShowLabelsChange,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [expandedTab, setExpandedTab] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPanelClosing, setIsPanelClosing] = useState(false);
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

  const closePanel = useCallback(() => {
    setIsPanelClosing(true);
    setTimeout(() => {
      setExpandedTab(null);
      setIsPanelClosing(false);
    }, 220);
  }, []);

  const handleNavClick = (item) => {
    if (item.isAction || item.hoverOnly) return;
    setHoveredTab(null);
    clearHoverTimeout();
    if (expandedTab === item.key) {
      closePanel();
    } else {
      if (isPanelClosing) return;
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
        <div
          className={`samplePagesLeftNav__items${
            !showLabels ? ' samplePagesLeftNav__items--compact' : ''
          }`}>
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
                {showLabels && (
                  <span className="samplePagesLeftNav__navLabel">
                    {item.label}
                  </span>
                )}
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
            iconType="gear"
            aria-label="Layout settings"
            color="text"
            display="empty"
            size="s"
            onClick={() => setIsSettingsOpen(true)}
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
        <div
          className={`samplePagesLeftNav__expandedPanel${
            isPanelClosing ? ' samplePagesLeftNav__expandedPanel--closing' : ''
          }`}>
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
                onClick={closePanel}
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

      {/* Layout settings modal */}
      {isSettingsOpen && (
        <OuiModal
          onClose={() => setIsSettingsOpen(false)}
          style={{ width: 420 }}>
          <OuiModalHeader>
            <OuiModalHeaderTitle>Layout settings</OuiModalHeaderTitle>
          </OuiModalHeader>
          <OuiModalBody>
            <OuiFormRow label="Dark mode" display="row">
              <OuiSwitch
                label=""
                showLabel={false}
                checked={isDark}
                onChange={toggleTheme}
              />
            </OuiFormRow>
            <OuiSpacer size="s" />
            <OuiFormRow label="Show navigation labels" display="row">
              <OuiSwitch
                label=""
                showLabel={false}
                checked={showLabels}
                onChange={(e) => onShowLabelsChange(e.target.checked)}
              />
            </OuiFormRow>
            <OuiSpacer size="m" />
            <OuiFormRow label="Padding" display="row">
              <OuiButtonGroup
                legend="Padding"
                options={SPACING_OPTIONS}
                idSelected={`spacing-${padding}`}
                onChange={(id) => onPaddingChange(SPACING_MAP[id])}
                isFullWidth
              />
            </OuiFormRow>
            <OuiSpacer size="s" />
            <OuiFormRow label="Gap" display="row">
              <OuiButtonGroup
                legend="Gap"
                options={SPACING_OPTIONS}
                idSelected={`spacing-${gap}`}
                onChange={(id) => onGapChange(SPACING_MAP[id])}
                isFullWidth
              />
            </OuiFormRow>
            <OuiSpacer size="s" />
            <OuiFormRow label="Card padding" display="row">
              <OuiButtonGroup
                legend="Card padding"
                options={SPACING_OPTIONS}
                idSelected={`spacing-${cardPadding}`}
                onChange={(id) => onCardPaddingChange(SPACING_MAP[id])}
                isFullWidth
              />
            </OuiFormRow>
            <OuiSpacer size="s" />
            <OuiFormRow label="Gutter" display="row">
              <OuiButtonGroup
                legend="Gutter"
                options={SPACING_OPTIONS}
                idSelected={`spacing-${gutter}`}
                onChange={(id) => onGutterChange(SPACING_MAP[id])}
                isFullWidth
              />
            </OuiFormRow>
          </OuiModalBody>
          <OuiModalFooter>
            <OuiButton onClick={() => setIsSettingsOpen(false)} fill>
              Done
            </OuiButton>
          </OuiModalFooter>
        </OuiModal>
      )}
    </div>
  );
};
