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
  OuiPopover,
  OuiPopoverTitle,
  OuiPopoverFooter,
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
  { key: 'expand', label: 'Expand navigation', icon: 'menuRight', isAction: true },
  { key: 'search', label: 'Search', icon: 'search', isAction: true },
  { key: 'threads', label: 'Threads', icon: 'discuss', hasPopover: true },
  { key: 'separator-1', isSeparator: true },
  { key: 'dashboards', label: 'Dashboards', icon: 'grid', group: 'Essentials' },
  { key: 'logs', label: 'Logs', icon: 'editorLink', group: 'Essentials', hasPopover: true },
  { key: 'metrics', label: 'Metrics', icon: 'visLine', group: 'Essentials' },
  { key: 'topology', label: 'Topology map', icon: 'graphApp', group: 'Essentials' },
  { key: 'separator-2', isSeparator: true },
  { key: 'agent-traces', label: 'Traces', icon: 'document', group: 'Agent monitoring' },
  { key: 'spans', label: 'Spans', icon: 'layers', group: 'Agent monitoring' },
  { key: 'separator-3', isSeparator: true },
  { key: 'app-traces', label: 'Traces', icon: 'apmTrace', group: 'Application Performance' },
  { key: 'service', label: 'Services', icon: 'compute', group: 'Application Performance' },
  { key: 'separator-4', isSeparator: true },
  { key: 'more', label: 'More', icon: 'plusInCircle', hasPopover: true },
];

const FOOTER_ITEMS = [
  { key: 'workspace', label: 'Workspace', icon: 'grid' },
  { key: 'devtools', label: 'Developer tools', icon: 'wrench' },
  { key: 'settings', label: 'Settings', icon: 'gear' },
];

// Popover content for Threads
const ThreadsPopoverContent = ({ onItemSelect, selectedItem }) => (
  <div>
    <OuiListGroup gutterSize="none">
      <OuiListGroupItem
        isActive={selectedItem === 'latency-spike'}
        label={
          <div>
            <OuiText size="s"><strong>Latency spike investigation</strong></OuiText>
            <OuiText size="xs" color="subdued">Sarah Lee · 2 hours ago</OuiText>
          </div>
        }
        onClick={() => onItemSelect && onItemSelect('latency-spike')}
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        isActive={selectedItem === 'checkout-error'}
        label={
          <div>
            <OuiText size="s"><strong>Checkout error rate alert</strong></OuiText>
            <OuiText size="xs" color="subdued">Alex Chen · 5 hours ago</OuiText>
          </div>
        }
        onClick={() => onItemSelect && onItemSelect('checkout-error')}
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        isActive={selectedItem === 'weekly-review'}
        label={
          <div>
            <OuiText size="s"><strong>Weekly service review</strong></OuiText>
            <OuiText size="xs" color="subdued">Team Ops · 1 day ago</OuiText>
          </div>
        }
        onClick={() => onItemSelect && onItemSelect('weekly-review')}
      />
    </OuiListGroup>
  </div>
);

// Popover content for Logs
const LogsPopoverContent = () => (
  <div>
    <OuiListGroup gutterSize="none">
      <OuiListGroupItem
        label={
          <div>
            <OuiText size="s"><strong>Error rate by service</strong></OuiText>
            <OuiText size="xs" color="subdued">
              source=logs | where level=&quot;ERROR&quot;
            </OuiText>
          </div>
        }
        onClick={() => {}}
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        label={
          <div>
            <OuiText size="s"><strong>Auth failure events</strong></OuiText>
            <OuiText size="xs" color="subdued">
              source=logs | where event=&quot;auth_fail&quot;
            </OuiText>
          </div>
        }
        onClick={() => {}}
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        label={
          <div>
            <OuiText size="s"><strong>Slow query log</strong></OuiText>
            <OuiText size="xs" color="subdued">
              source=logs | where duration &gt; 5000
            </OuiText>
          </div>
        }
        onClick={() => {}}
      />
    </OuiListGroup>
  </div>
);

// Popover content for More
const MorePopoverContent = () => (
  <div>
    <OuiListGroup gutterSize="none">
      <OuiListGroupItem
        iconType="navAlerting"
        label={<OuiText size="s"><strong>Alerts</strong></OuiText>}
        onClick={() => {}}
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        iconType="navDashboards"
        label={<OuiText size="s"><strong>Dashboards</strong></OuiText>}
        onClick={() => {}}
      />
      <div className="samplePagesLeftNav__ruleDivider">
        <OuiHorizontalRule margin="none" />
      </div>
      <OuiListGroupItem
        iconType="wsSelector"
        label={<OuiText size="s"><strong>Manage workspace</strong></OuiText>}
        onClick={() => {}}
      />
    </OuiListGroup>
  </div>
);

const POPOVER_CONTENT = {
  threads: {
    title: 'Threads',
    Component: ThreadsPopoverContent,
    hasAddButton: false,
    hasFooter: false,
  },
  logs: {
    title: 'Recent logs',
    Component: LogsPopoverContent,
    hasAddButton: true,
    hasFooter: true,
    footerText: 'View all',
  },
  more: {
    title: 'More',
    Component: MorePopoverContent,
    hasAddButton: false,
    hasFooter: true,
    footerText: 'Customize navigation bar',
  },
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
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [openPopover, setOpenPopover] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const hoverTimeoutRef = useRef(null);

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
      if (isExpanded) return;
      if (!item.hasPopover) return;
      clearHoverTimeout();
      setOpenPopover(item.key);
    },
    [isExpanded, clearHoverTimeout]
  );

  const handleNavMouseLeave = useCallback(() => {
    if (isExpanded) return;
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenPopover(null);
    }, 200);
  }, [isExpanded, clearHoverTimeout]);

  const handlePopoverMouseEnter = useCallback(() => {
    clearHoverTimeout();
  }, [clearHoverTimeout]);

  const handlePopoverMouseLeave = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenPopover(null);
    }, 200);
  }, [clearHoverTimeout]);

  const closePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleNavClick = (item) => {
    if (item.key === 'expand') {
      setIsExpanded(!isExpanded);
      setOpenPopover(null);
      return;
    }
    if (item.key === 'search') return;
    if (item.key === 'threads') {
      onPageChange('threads');
      return;
    }
    if (item.key === 'service') {
      onPageChange('service');
      return;
    }
    if (item.key === 'more') return;
  };

  // Group items for expanded state rendering
  const renderExpandedNavItems = () => {
    const items = NAV_ITEMS.filter((item) => !item.isSeparator);
    const groups = {};
    const ungrouped = [];

    items.forEach((item) => {
      if (item.group) {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
      } else if (item.key !== 'more') {
        ungrouped.push(item);
      }
    });

    const sections = [];

    // Ungrouped items first (expand toggle, search, threads)
    ungrouped.forEach((item) => {
      const isActive = !item.isAction && activePage === item.key;
      const icon = item.key === 'expand' ? 'menuLeft' : item.icon;
      const label = item.key === 'expand' ? 'Collapse navigation' : item.label;

      sections.push(
        <button
          key={item.key}
          type="button"
          className={`samplePagesLeftNav__navItem${
            isActive ? ' samplePagesLeftNav__navItem--active' : ''
          }`}
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 'auto',
            padding: '8px 12px',
            gap: '12px',
            justifyContent: 'flex-start',
          }}
          aria-current={isActive ? 'page' : undefined}
          onClick={() => handleNavClick(item)}>
          <div className="samplePagesLeftNav__navIcon">
            <OuiIcon type={icon} size="m" />
          </div>
          <span
            className="samplePagesLeftNav__navLabel"
            style={{ fontSize: '14px', whiteSpace: 'nowrap', display: 'inline' }}>
            {label}
          </span>
        </button>
      );
    });

    // Grouped items with section headers
    const groupNames = ['Essentials', 'Agent monitoring', 'Application Performance'];
    groupNames.forEach((groupName) => {
      if (!groups[groupName]) return;

      sections.push(
        <OuiHorizontalRule
          key={`rule-${groupName}`}
          margin="none"
          className="samplePagesLeftNav__rule"
        />
      );

      sections.push(
        <OuiText
          key={`header-${groupName}`}
          size="xs"
          color="subdued"
          style={{
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.5px',
            padding: '8px 12px 4px',
            width: '100%',
          }}>
          {groupName}
        </OuiText>
      );

      groups[groupName].forEach((item) => {
        const isActive = activePage === item.key;
        sections.push(
          <button
            key={item.key}
            type="button"
            className={`samplePagesLeftNav__navItem${
              isActive ? ' samplePagesLeftNav__navItem--active' : ''
            }`}
            style={{
              flexDirection: 'row',
              width: '100%',
              height: 'auto',
              padding: '8px 12px',
              gap: '12px',
              justifyContent: 'flex-start',
            }}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleNavClick(item)}>
            <div className="samplePagesLeftNav__navIcon">
              <OuiIcon type={item.icon} size="m" />
            </div>
            <span
              className="samplePagesLeftNav__navLabel"
              style={{ fontSize: '14px', whiteSpace: 'nowrap', display: 'inline' }}>
              {item.label}
            </span>
          </button>
        );
      });
    });

    // More section
    const moreItem = items.find((i) => i.key === 'more');
    if (moreItem) {
      sections.push(
        <OuiHorizontalRule
          key="rule-more"
          margin="none"
          className="samplePagesLeftNav__rule"
        />
      );
      sections.push(
        <button
          key={moreItem.key}
          type="button"
          className="samplePagesLeftNav__navItem"
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 'auto',
            padding: '8px 12px',
            gap: '12px',
            justifyContent: 'flex-start',
          }}
          onClick={() => handleNavClick(moreItem)}>
          <div className="samplePagesLeftNav__navIcon">
            <OuiIcon type={moreItem.icon} size="m" />
          </div>
          <span
            className="samplePagesLeftNav__navLabel"
            style={{ fontSize: '14px', whiteSpace: 'nowrap', display: 'inline' }}>
            {moreItem.label}
          </span>
        </button>
      );
    }

    return sections;
  };

  // Render collapsed nav items with hover popovers
  const renderCollapsedNavItems = () => {
    return NAV_ITEMS.map((item) => {
      if (item.isSeparator) {
        return (
          <OuiHorizontalRule
            key={item.key}
            margin="none"
            className="samplePagesLeftNav__rule"
          />
        );
      }

      const isActive = !item.isAction && activePage === item.key;
      const popoverConfig = POPOVER_CONTENT[item.key];

      const navButton = (
        <button
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
          <span className="samplePagesLeftNav__navLabel">{item.label}</span>
        </button>
      );

      if (item.hasPopover && popoverConfig) {
        const { title, Component, hasAddButton, hasFooter, footerText } = popoverConfig;
        return (
          <OuiPopover
            key={item.key}
            button={navButton}
            isOpen={openPopover === item.key}
            closePopover={closePopover}
            anchorPosition="rightUp"
            panelPaddingSize="none"
            hasArrow={false}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}>
            <OuiPopoverTitle paddingSize="s">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{title}</span>
                {hasAddButton && (
                  <OuiButtonIcon
                    iconType="plusInCircle"
                    aria-label="Add new"
                    color="text"
                    display="empty"
                    size="s"
                  />
                )}
              </div>
            </OuiPopoverTitle>
            <div style={{ width: 280 }}>
              <Component onItemSelect={onItemSelect} selectedItem={selectedItem} />
            </div>
            {hasFooter && (
              <OuiPopoverFooter paddingSize="s">
                <OuiButtonEmpty
                  size="s"
                  flush="both"
                  style={{ width: '100%', justifyContent: 'center' }}>
                  {footerText}
                </OuiButtonEmpty>
              </OuiPopoverFooter>
            )}
          </OuiPopover>
        );
      }

      return (
        <React.Fragment key={item.key}>
          {navButton}
        </React.Fragment>
      );
    });
  };

  const navStyle = {
    width: isExpanded ? 220 : 72,
    minWidth: isExpanded ? 220 : 72,
    transition: 'width 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94), min-width 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  return (
    <div className="samplePagesLeftNav__wrapper">
      <nav
        aria-label="Sample pages navigation"
        className="samplePagesLeftNav"
        style={navStyle}>
        {/* Logo */}
        <div className="samplePagesLeftNav__header">
          <OuiIcon type="logoOpenSearch" size="l" aria-label="OpenSearch" />
        </div>

        {/* Nav items */}
        <div
          className="samplePagesLeftNav__items"
          style={isExpanded ? { alignItems: 'stretch', gap: '4px' } : undefined}>
          {isExpanded ? renderExpandedNavItems() : renderCollapsedNavItems()}
        </div>

        {/* Footer */}
        <div className="samplePagesLeftNav__footer">
          <OuiHorizontalRule
            margin="none"
            className="samplePagesLeftNav__rule"
          />
          {FOOTER_ITEMS.map((item) => {
            if (item.key === 'settings') {
              return (
                <OuiButtonIcon
                  key={item.key}
                  iconType={item.icon}
                  aria-label={item.label}
                  color="text"
                  display="empty"
                  size="s"
                  onClick={() => setIsSettingsOpen(true)}
                />
              );
            }
            return (
              <OuiButtonIcon
                key={item.key}
                iconType={item.icon}
                aria-label={item.label}
                color="text"
                display="empty"
                size="s"
              />
            );
          })}
          <OuiButtonIcon
            iconType="brush"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            color="text"
            display="empty"
            size="s"
            onClick={toggleTheme}
          />
          <OuiAvatar name="OS" size="s" />
        </div>
      </nav>

      {/* Layout settings modal */}
      {isSettingsOpen && (
        <OuiModal
          onClose={() => setIsSettingsOpen(false)}
          style={{ width: 420 }}>
          <OuiModalHeader>
            <OuiModalHeaderTitle>Layout settings</OuiModalHeaderTitle>
          </OuiModalHeader>
          <OuiModalBody>
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
