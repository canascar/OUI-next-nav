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

import React, { useContext, useState } from 'react';

import {
  OuiIcon,
  OuiHorizontalRule,
  OuiButtonIcon,
  OuiAvatar,
  OuiListGroup,
  OuiListGroupItem,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';

const NAV_ITEMS = [
  { key: 'search', label: 'Search', icon: 'search', isAction: true },
  { key: 'thread', label: 'Thread', icon: 'chatLeft' },
  { key: 'discover', label: 'Discover', icon: 'navDiscover' },
  { key: 'service', label: 'APM', icon: 'pulse' },
];

// Panel content for Thread tab
const ThreadPanelContent = ({ onItemSelect }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
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
const DiscoverPanelContent = ({ onItemSelect }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      label={
        <div>
          <OuiText size="s">
            <strong>frontend-proxy</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            ERROR 502 Bad Gateway — /api/checkout
          </OuiText>
          <OuiText size="xs" color="subdued">
            3 min ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('frontend-proxy')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      label={
        <div>
          <OuiText size="s">
            <strong>checkout</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            WARN Connection timeout to payment-service
          </OuiText>
          <OuiText size="xs" color="subdued">
            12 min ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('checkout')}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      label={
        <div>
          <OuiText size="s">
            <strong>recommendation</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            INFO Model refresh completed in 1.2s
          </OuiText>
          <OuiText size="xs" color="subdued">
            25 min ago
          </OuiText>
        </div>
      }
      onClick={() => onItemSelect('recommendation')}
    />
  </OuiListGroup>
);

// Panel content for APM tab
const ServicesPanelContent = ({ onPageChange }) => (
  <OuiListGroup gutterSize="none">
    <OuiListGroupItem
      iconType="pulse"
      label="Services"
      onClick={() => onPageChange('service')}
      extraAction={{
        iconType: 'arrowRight',
        alwaysShow: true,
        'aria-label': 'Go to Services',
      }}
    />
    <div className="samplePagesLeftNav__ruleDivider">
      <OuiHorizontalRule margin="none" />
    </div>
    <OuiListGroupItem
      iconType="graphApp"
      label="Application map"
      onClick={() => onPageChange('service')}
      extraAction={{
        iconType: 'arrowRight',
        alwaysShow: true,
        'aria-label': 'Go to Application map',
      }}
    />
  </OuiListGroup>
);

const PANEL_CONTENT = {
  thread: ThreadPanelContent,
  discover: DiscoverPanelContent,
  service: ServicesPanelContent,
};

export const SamplePagesLeftNav = ({
  activePage,
  onPageChange,
  onItemSelect,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [expandedTab, setExpandedTab] = useState(null);

  const toggleTheme = () => {
    themeContext.changeTheme(isDark ? 'v9-light' : 'v9-dark');
  };

  const handleNavClick = (item) => {
    if (item.isAction) return; // Search is held for now
    if (expandedTab === item.key) {
      // Clicking the same tab collapses the panel
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
                type="button"
                className={`samplePagesLeftNav__navItem${
                  isActive ? ' samplePagesLeftNav__navItem--active' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNavClick(item)}>
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

      {/* Expanded panel */}
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
          />
        </div>
      )}
    </div>
  );
};
