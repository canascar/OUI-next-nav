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

import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';

import {
  OuiAvatar,
  OuiIcon,
  OuiPopover,
  OuiToolTip,
} from '../../../../src/components';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { ThemeContext } from '../../components/with_theme';

const CORE_ITEMS = [
  { key: 'investigations', label: 'Investigations', icon: 'securitySignalDetected' },
  { key: 'boards', label: 'Boards', icon: 'navDashboards' },
  { key: 'spaces', label: 'Spaces', icon: 'grid' },
];

const SURFACE_ITEMS = [
  { key: 'explore', label: 'Explore', icon: 'compass', subtitle: 'logs · metrics · traces' },
  { key: 'monitor', label: 'Monitor', icon: 'navAlerting', subtitle: 'alerts · SLOs · anomaly' },
  { key: 'notebooks', label: 'Notebooks', icon: 'document' },
];

const PINNED_ITEMS = [
  { key: 'pin-1', label: 'payments p99 board', icon: 'pinFilled' },
  { key: 'pin-2', label: 'checkout SLO', icon: 'pinFilled' },
];

const RECENT_ITEMS = [
  { key: 'latency-spike', label: 'Latency spike investigation', page: 'latency-spike-session' },
  { key: 'checkout-error', label: 'Checkout error rate alert', page: 'error-rate-spike-session' },
  { key: 'disk-pressure', label: 'Node disk pressure alerts', page: 'dns-timeout-session' },
  { key: 'recent-1', label: 'Why did checkout p99 spike?' },
  { key: 'recent-2', label: 'Splunk → OS alert parity gaps', dot: 'active' },
  { key: 'recent-3', label: 'Blast radius: cart-svc cascading failure across 3 downstream services', dot: 'done' },
  { key: 'recent-4', label: 'DNS timeout root cause' },
  { key: 'recent-5', label: 'Auth token refresh regression' },
  { key: 'recent-6', label: 'Disk pressure on os-data-3' },
  { key: 'recent-7', label: 'Capacity planning Q3', dot: 'done' },
  { key: 'recent-8', label: 'Connection pool sizing review' },
  { key: 'recent-9', label: 'Error budget burn rate' },
  { key: 'recent-10', label: 'Deploy cadence vs incident rate' },
  { key: 'recent-11', label: 'Latency by region breakdown' },
  { key: 'recent-12', label: 'Cache hit ratio drop investigation' },
  { key: 'recent-13', label: 'Network partition simulation' },
  { key: 'recent-14', label: 'GC pause impact on p99' },
  { key: 'recent-15', label: 'Rate limiter tuning — payments' },
  { key: 'recent-16', label: 'SLO breach postmortem: cart' },
  { key: 'recent-17', label: 'Upstream dependency mapping' },
  { key: 'recent-18', label: 'Log volume cost optimization' },
  { key: 'recent-19', label: 'Trace sampling strategy review' },
  { key: 'recent-20', label: 'Canary deploy failure analysis' },
  { key: 'recent-21', label: 'Redis cluster failover playbook' },
  { key: 'recent-22', label: 'Kafka consumer lag spike' },
  { key: 'recent-23', label: 'CDN cache purge impact' },
  { key: 'recent-24', label: 'Database connection leak — orders-db' },
  { key: 'recent-25', label: 'Load balancer health check flapping' },
  { key: 'recent-26', label: 'Memory leak in worker pods' },
  { key: 'recent-27', label: 'Cross-region replication delay' },
  { key: 'recent-28', label: 'TLS cert expiry audit' },
  { key: 'recent-29', label: 'Kubernetes node scaling events' },
  { key: 'recent-30', label: 'API gateway timeout correlation' },
];

const WORKSPACE_MENU_ITEMS = [
  { key: 'details', label: 'Workspace details', icon: 'document' },
  { key: 'collaborators', label: 'Collaborators', icon: 'users' },
  { key: 'data-sources', label: 'Data sources', icon: 'database' },
  { key: 'index-patterns', label: 'Index patterns', icon: 'indexPatternApp' },
  { key: 'assets', label: 'Assets', icon: 'folderClosed' },
  { key: 'sample-data', label: 'Sample data', icon: 'importAction' },
  { key: 'all-workspaces', label: 'All workspaces', icon: 'grid' },
];

const NavItem = ({ item, active, collapsed, onClick }) => {
  const cls = [
    'leftNavV4__item',
    item.primary && 'leftNavV4__item--primary',
    active && 'leftNavV4__item--active',
  ].filter(Boolean).join(' ');

  const button = (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}>
      <span className="leftNavV4__itemIcon">
        <OuiIcon type={item.icon || 'dot'} size="s" />
      </span>
      <span className="leftNavV4__itemContent">
        <span className="leftNavV4__itemLabel">{item.label}</span>
        {item.subtitle && (
          <span className="leftNavV4__itemSubtitle">{item.subtitle}</span>
        )}
      </span>
    </button>
  );

  if (collapsed) {
    return (
      <li>
        <OuiToolTip content={item.label} position="right">
          {button}
        </OuiToolTip>
      </li>
    );
  }
  return <li>{button}</li>;
};

export const LeftNavV4 = ({
  activePage,
  activeSessionId,
  onPageChange,
  onStartThread,
  onSelectSession,
}) => {
  const themeContext = useContext(ThemeContext);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [logoHovered, setLogoHovered] = useState(false);
  const [recentsLoading, setRecentsLoading] = useState(true);
  const [selectedRecentKey, setSelectedRecentKey] = useState(null);
  const [scrolledTop, setScrolledTop] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const scrollRef = useRef(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setRecentsLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey) setCollapsed((c) => !c);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const updateScrollShadows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrolledTop(el.scrollTop > 2);
    setScrolledBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }, []);

  useEffect(() => {
    updateScrollShadows();
  }, [collapsed, recentsLoading, updateScrollShadows]);

  const handleScroll = useCallback(() => {
    updateScrollShadows();
    if (scrollRef.current) scrollPosRef.current = scrollRef.current.scrollTop;
  }, [updateScrollShadows]);

  useEffect(() => {
    if (!collapsed && scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosRef.current;
      updateScrollShadows();
    }
  }, [collapsed, updateScrollShadows]);

  const handleItemClick = useCallback((key) => {
    setSelectedRecentKey(null);
    if (key === 'ask-olly' && onStartThread) {
      onStartThread();
    } else if (onPageChange) {
      onPageChange(key);
    }
  }, [onPageChange, onStartThread]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const primaryItem = { key: 'ask-olly', label: 'New session', icon: 'plusInCircle', primary: true };

  return (
    <nav
      className={`leftNavV4${collapsed ? ' leftNavV4--collapsed' : ''}`}
      aria-label="Main navigation">

      {/* ─── Sticky header ─── */}
      <div className="leftNavV4__stickyHeader">
        {/* Brand row */}
        <div className="leftNavV4__brandRow">
          {collapsed ? (
            <button
              type="button"
              className="leftNavV4__logoToggle"
              onClick={toggle}
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
              aria-label="Expand navigation">
              <span className={`leftNavV4__logoIcon${logoHovered ? ' leftNavV4__logoIcon--hidden' : ''}`}>
                <OuiIcon type="logoOpenSearch" size="l" />
              </span>
              <span className={`leftNavV4__expandIcon${logoHovered ? ' leftNavV4__expandIcon--visible' : ''}`}>
                <OuiIcon type="menuRight" size="s" />
              </span>
            </button>
          ) : (
            <>
              <span className="leftNavV4__brandMark">
                <OuiIcon type="logoOpenSearch" size="l" />
              </span>
              <span className="leftNavV4__brandWordmark">Observability</span>
              <button
                type="button"
                className="leftNavV4__collapseButton"
                onClick={toggle}
                aria-label="Collapse navigation">
                <OuiIcon type="menuLeft" size="s" />
              </button>
            </>
          )}
        </div>

        {/* Primary action — always visible */}
        <div className="leftNavV4__primaryRow">
          <NavItem
            item={{...primaryItem, primary: !selectedRecentKey}}
            active={false}
            collapsed={collapsed}
            onClick={() => handleItemClick('ask-olly')}
          />
        </div>

        {/* Header bottom edge */}
        <div className={`leftNavV4__headerEdge${scrolledTop ? ' leftNavV4__headerEdge--shadow' : ''}`} />
      </div>

      {/* ─── Scroll body ─── */}
      <div
        className="leftNavV4__scrollBody"
        ref={scrollRef}
        onScroll={handleScroll}>
        {/* Core items */}
        <ul className="leftNavV4__list">
          {CORE_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={activePage === item.key}
              collapsed={collapsed}
              onClick={() => handleItemClick(item.key)}
            />
          ))}
        </ul>

        {/* Divider */}
        <div className="leftNavV4__divider" />

        {/* Surfaces */}
        <div className="leftNavV4__section leftNavV4__section--surfaces">
          <div className="leftNavV4__sectionHeader">Surfaces</div>
          <ul className="leftNavV4__list">
            {SURFACE_ITEMS.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                active={activePage === item.key}
                collapsed={collapsed}
                onClick={() => handleItemClick(item.key)}
              />
            ))}
          </ul>
        </div>

        {/* Pinned — expanded only */}
        <div className="leftNavV4__section leftNavV4__section--expandedOnly">
          <div className="leftNavV4__sectionHeader">Pinned</div>
          <ul className="leftNavV4__list">
            {PINNED_ITEMS.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                active={false}
                collapsed={collapsed}
                onClick={() => handleItemClick(item.key)}
              />
            ))}
          </ul>
        </div>

        {/* Recent — expanded only */}
        <div className="leftNavV4__section leftNavV4__section--expandedOnly">
          <div className="leftNavV4__sectionHeader">Recent</div>
          {recentsLoading ? (
            <div className="leftNavV4__loader">
              <OuiAgenticSpinner size="s" />
            </div>
          ) : (
            <ul className="leftNavV4__list leftNavV4__list--recent">
              {RECENT_ITEMS.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className={`leftNavV4__recentItem${selectedRecentKey === item.key ? ' leftNavV4__recentItem--active' : ''}`}
                    onClick={() => {
                      setSelectedRecentKey(item.key);
                      if (item.page && onSelectSession) {
                        onSelectSession(item.page);
                      } else {
                        handleItemClick(item.key);
                      }
                    }}>
                    <span className="leftNavV4__recentLabel">{item.label}</span>
                    {item.dot && (
                      <span className={`leftNavV4__recentDot leftNavV4__recentDot--${item.dot}`} />
                    )}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="leftNavV4__recentItem leftNavV4__recentItem--allChats"
                  onClick={() => onPageChange && onPageChange('all-chats')}>
                  <span className="leftNavV4__itemIcon">
                    <OuiIcon type="clock" size="s" />
                  </span>
                  <span className="leftNavV4__recentLabel">All chats</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* ─── Sticky footer ─── */}
      <div className={`leftNavV4__stickyFooter${scrolledBottom ? ' leftNavV4__stickyFooter--shadow' : ''}`}>
        {/* Divider + user/workspace */}
        <div className="leftNavV4__bottom">
          <OuiPopover
            button={
              <button
                type="button"
                className="leftNavV4__bottomButton"
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                aria-label="Workspace menu">
                <OuiAvatar name="Jason" size="s" color="#7B68EE" />
                <span className="leftNavV4__bottomInfo">
                  <span className="leftNavV4__bottomName">Jason</span>
                  <span className="leftNavV4__bottomRole">Observability</span>
                </span>
              </button>
            }
            isOpen={workspaceOpen}
            closePopover={() => setWorkspaceOpen(false)}
            anchorPosition={collapsed ? 'rightDown' : 'upLeft'}
            panelPaddingSize="none"
            panelClassName="leftNavV4__workspacePanel">
            <div className="leftNavV4__workspaceMenu">
              <div className="leftNavV4__workspaceMenuHeader">
                <span className="leftNavV4__workspaceMenuTitle">Manage workspace</span>
              </div>
              <ul className="leftNavV4__workspaceMenuList">
                {WORKSPACE_MENU_ITEMS.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      className="leftNavV4__workspaceMenuItem"
                      onClick={() => setWorkspaceOpen(false)}>
                      <OuiIcon type={item.icon} size="s" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </OuiPopover>
        </div>
      </div>
    </nav>
  );
};
