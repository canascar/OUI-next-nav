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

import React, { useState, useCallback, useRef, useContext, useEffect } from 'react';

import {
  OuiAvatar,
  OuiButtonEmpty,
  OuiButtonIcon,
  OuiIcon,
  OuiPopover,
  OuiSwitch,
  OuiToolTip,
} from '../../../../src/components';
import { ThemeContext } from '../../components/with_theme';
import {
  WorkspaceNavPanelContent,
  SettingsPopoverContent,
  ProfilePopoverContent,
} from './sample_pages_left_nav';

/**
 * SessionLeftNav — Same visual design as SamplePagesLeftNav collapsed,
 * but with session-specific actions (create session, browse sessions).
 */
export const SessionLeftNav = ({
  sessionCount = 0,
  onCreateSession,
  onBrowseSessions,
  onBrowseLibrary,
  onSelectSession,
  onOpenPage,
  sessions = [],
  activeView,
  activeSessionId,
  isEmptySession,
  disableActions = false,
  expandRef,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [appearanceSelection, setAppearanceSelection] = useState(
    isDark ? 'v9-dark' : 'v9-light'
  );
  const [navPopover, setNavPopover] = useState(null);
  const navPopoverTimer = useRef(null);

  // Expand/collapse state
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  // The rendered content lags behind the collapse so the expanded panel stays
  // mounted while the rail narrows — you see it clip away, then swap to icons.
  const [renderExpandedContent, setRenderExpandedContent] = useState(false);
  const collapseSwapTimer = useRef(null);

  useEffect(() => {
    if (collapseSwapTimer.current) {
      clearTimeout(collapseSwapTimer.current);
      collapseSwapTimer.current = null;
    }
    if (isNavExpanded) {
      // Reveal the expanded panel right away; the clip widens to show it.
      setRenderExpandedContent(true);
    } else {
      // Keep it mounted through the width transition, then swap to the rail.
      collapseSwapTimer.current = setTimeout(() => {
        setRenderExpandedContent(false);
        collapseSwapTimer.current = null;
      }, 240);
    }
    return () => {
      if (collapseSwapTimer.current) clearTimeout(collapseSwapTimer.current);
    };
  }, [isNavExpanded]);

  // Expose expand trigger to parent
  useEffect(() => {
    if (expandRef) {
      expandRef.current = () => setIsNavExpanded(true);
    }
  }, [expandRef]);

  // Reset logo hover when nav expands
  useEffect(() => {
    if (isNavExpanded) {
      setIsLogoHovered(false);
    }
  }, [isNavExpanded]);

  const openNavPopover = useCallback((key) => {
    if (navPopoverTimer.current) clearTimeout(navPopoverTimer.current);
    setNavPopover(key);
  }, []);

  const closeNavPopover = useCallback(() => {
    navPopoverTimer.current = setTimeout(() => setNavPopover(null), 150);
  }, []);

  // Glass nav surface is visible by default (empty session, recents, library,
  // onboarding) and fades out when viewing an active (non-empty) session.
  const inActiveSession = activeView === 'session' && !isEmptySession;

  // Expand/collapse state for nav sections
  const [expandedSections, setExpandedSections] = useState({ 'new-session': true });
  const toggleSection = useCallback((key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // New session sub-items — structured with groups
  const START_ITEMS = [
    { key: 'alerts', label: 'Alerts', icon: 'navAlerting', page: 'alerts-list', title: 'Alerts' },
    { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards', page: 'dashboards-list', title: 'Dashboards' },
    { key: 'logs', label: 'Logs', icon: 'navDiscover', page: 'discover-log', title: 'Logs' },
    { key: 'metrics', label: 'Metrics', icon: 'visArea', page: 'discover-metric', title: 'Metrics' },
    { key: 'topology-map', label: 'Topology map', icon: 'navAiFlow', page: 'app-map', title: 'Topology Map' },
  ];

  const START_GROUPS = [
    {
      key: 'agent-monitoring',
      label: 'Agent monitoring',
      children: [
        { key: 'agent-traces', label: 'Traces', icon: 'visTable', page: 'app-traces', title: 'Agent Traces' },
        { key: 'agent-spans', label: 'Spans', icon: 'visTagCloud', page: 'agent-spans', title: 'Agent Spans' },
      ],
    },
    {
      key: 'app-perf',
      label: 'Application performance',
      children: [
        { key: 'app-traces', label: 'Traces', icon: 'apmTrace', page: 'traces', title: 'Application Traces' },
        { key: 'app-services', label: 'Services', icon: 'navServices', page: 'app-perf-services', title: 'Application Services' },
        { key: 'app-slos', label: 'SLOs', icon: 'visGauge', page: 'app-services', title: 'Application SLOs' },
      ],
    },
    {
      key: 'more',
      label: 'More',
      children: [
        { key: 'notebooks', label: 'Notebooks', icon: 'document', page: 'notebooks', title: 'Notebooks' },
        { key: 'anomaly-detection', label: 'Anomaly Detection', icon: 'anomalyDetection', page: 'anomaly-dashboard', title: 'Anomaly Detection' },
        { key: 'forecasting', label: 'Forecasting', icon: 'visLine', page: 'forecasters', title: 'Forecasting' },
        { key: 'alerting', label: 'Alerting', icon: 'navAlerting', page: 'alerts-detail', title: 'Alerting' },
      ],
    },
  ];

  // All items flat for the customize popover (individual items only)
  const ALL_START_ITEMS = [
    ...START_ITEMS,
    ...START_GROUPS.flatMap((g) => g.children),
  ];

  // Enabled individual items (keys). Agent monitoring and Application
  // performance groups are off by default (toggle them on via Customize).
  const [enabledStartItems, setEnabledStartItems] = useState(
    () => new Set([
      'alerts', 'dashboards', 'logs', 'metrics', 'topology-map',
    ])
  );
  const [customizePopoverOpen, setCustomizePopoverOpen] = useState(false);

  const toggleStartItem = useCallback((key) => {
    setEnabledStartItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Visible items: filtered by enabled state
  const NEW_SESSION_ITEMS = START_ITEMS.filter((item) => enabledStartItems.has(item.key));
  const VISIBLE_GROUPS = START_GROUPS.map((g) => ({
    ...g,
    children: g.children.filter((item) => enabledStartItems.has(item.key)),
  })).filter((g) => g.children.length > 0);

  // ---------- EXPANDED NAV RENDER ----------
  const renderExpandedNav = () => (
    <nav
      className={`sessionLeftNav sessionLeftNav--expanded${
        inActiveSession ? ' sessionLeftNav--inSession' : ''
      }`}
      aria-label="Session navigation">
      {/* Header: logo left, controls + collapse icons right */}
      <div className="sessionLeftNav__headerExpanded">
        <button
          type="button"
          className="sessionLeftNav__logoButton"
          aria-label="Home"
          onClick={onCreateSession}>
          <OuiIcon type="logoOpenSearch" size="l" aria-hidden="true" />
        </button>
        <div className="sessionLeftNav__headerActions">
          <OuiPopover
            button={
              <OuiButtonIcon
                iconType="controlsHorizontal"
                aria-label="Customize shortcuts"
                color="text"
                display="empty"
                size="xs"
                onClick={() => setCustomizePopoverOpen(!customizePopoverOpen)}
              />
            }
            isOpen={customizePopoverOpen}
            closePopover={() => setCustomizePopoverOpen(false)}
            anchorPosition="downLeft"
            panelPaddingSize="s"
            panelClassName="sessionLeftNav__customizePanel">
            <div className="sessionLeftNav__customizePopover">
              <div className="sessionLeftNav__customizeHeader">Customize shortcuts</div>
              <div className="sessionLeftNav__customizeList">
                {START_ITEMS.map((item) => (
                  <div key={item.key} className="sessionLeftNav__customizeItem">
                    <OuiIcon type={item.icon} size="m" />
                    <span className="sessionLeftNav__customizeItemLabel">{item.label}</span>
                    <OuiSwitch
                      compressed
                      label=""
                      showLabel={false}
                      checked={enabledStartItems.has(item.key)}
                      onChange={() => toggleStartItem(item.key)}
                    />
                  </div>
                ))}
                {START_GROUPS.map((group) => (
                  <React.Fragment key={group.key}>
                    <div className="sessionLeftNav__customizeItem sessionLeftNav__customizeItem--group">
                      <span className="sessionLeftNav__customizeItemLabel">{group.label}</span>
                    </div>
                    {group.children.map((item) => (
                      <div key={item.key} className="sessionLeftNav__customizeItem sessionLeftNav__customizeItem--child">
                        <OuiIcon type={item.icon} size="m" />
                        <span className="sessionLeftNav__customizeItemLabel">{item.label}</span>
                        <OuiSwitch
                          compressed
                          label=""
                          showLabel={false}
                          checked={enabledStartItems.has(item.key)}
                          onChange={() => toggleStartItem(item.key)}
                        />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </OuiPopover>
          <OuiButtonIcon
            iconType="menuLeft"
            aria-label="Collapse navigation"
            color="text"
            display="empty"
            size="xs"
            onClick={() => setIsNavExpanded(false)}
          />
        </div>
      </div>

      {/* Expanded nav items with labels */}
      <div className="sessionLeftNav__itemsExpanded">
        {/* New session */}
        <div className="sessionLeftNav__section">
          <div className="sessionLeftNav__navItemExpandedRow">
            <button
              type="button"
              className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--main${
                activeView === 'session' && isEmptySession
                  ? ' sessionLeftNav__navItemExpanded--active'
                  : ''
              }`}
              onClick={() => {
                setIsNavExpanded(false);
                onCreateSession();
              }}>
              <div className="sessionLeftNav__navItemIconWrap">
                <OuiIcon type="plusInCircle" size="m" />
              </div>
              <span className="sessionLeftNav__navItemExpandedLabel">
                New session
              </span>
              <span
                className="sessionLeftNav__inlineArrow"
                role="button"
                tabIndex={0}
                aria-label={expandedSections['new-session'] ? 'Collapse' : 'Expand'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('new-session');
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleSection('new-session'); } }}>
                <OuiIcon
                  type={expandedSections['new-session'] ? 'arrowDown' : 'arrowRight'}
                  size="s"
                />
              </span>
            </button>
          </div>
          {expandedSections['new-session'] && (
          <div className="sessionLeftNav__sectionChildren">
            {NEW_SESSION_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
                onClick={() => {
                  setIsNavExpanded(false);
                  if (onOpenPage) onOpenPage(item.page, item.title);
                }}>
                <div className="sessionLeftNav__navItemIconWrap">
                  <OuiIcon type={item.icon} size="m" />
                </div>
                <span className="sessionLeftNav__navItemExpandedLabel">
                  {item.label}
                </span>
              </button>
            ))}
            {/* Group sections */}
            {VISIBLE_GROUPS.map((group) => (
              <div key={group.key} className="sessionLeftNav__groupSection">
                <span className="sessionLeftNav__sectionSubtitle">{group.label}</span>
                {group.children.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
                    onClick={() => {
                      setIsNavExpanded(false);
                      if (onOpenPage) onOpenPage(item.page, item.title);
                    }}>
                    <div className="sessionLeftNav__navItemIconWrap">
                      <OuiIcon type={item.icon} size="m" />
                    </div>
                    <span className="sessionLeftNav__navItemExpandedLabel">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          )}
        </div>

        {/* All sessions — collapsible */}
        <div className="sessionLeftNav__section">
          <div className="sessionLeftNav__navItemExpandedRow">
            <button
              type="button"
              className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--main${
                activeView === 'session-list'
                  ? ' sessionLeftNav__navItemExpanded--active'
                  : ''
              }`}
              onClick={() => {
                setIsNavExpanded(false);
                onBrowseSessions();
              }}>
              <div className="sessionLeftNav__navItemIconWrap">
                <OuiIcon type="navTicketing" size="m" />
              </div>
              <span className="sessionLeftNav__navItemExpandedLabel">
                All sessions
              </span>
              <span
                className="sessionLeftNav__inlineArrow"
                role="button"
                tabIndex={0}
                aria-label={expandedSections['all-sessions'] ? 'Collapse' : 'Expand'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('all-sessions');
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleSection('all-sessions'); } }}>
                <OuiIcon
                  type={expandedSections['all-sessions'] ? 'arrowDown' : 'arrowRight'}
                  size="s"
                />
              </span>
            </button>
          </div>
          {expandedSections['all-sessions'] && (
            <div className="sessionLeftNav__sectionChildren" style={{ marginTop: 0 }}>
              {sessions.slice(0, 5).map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child${
                    session.id === activeSessionId
                      ? ' sessionLeftNav__navItemExpanded--active'
                      : ''
                  }`}
                  onClick={() => {
                    setIsNavExpanded(false);
                    onSelectSession(session.id);
                  }}>
                  <div className="sessionLeftNav__navItemIconWrap">
                    <OuiIcon type="clock" size="m" />
                  </div>
                  <span className="sessionLeftNav__navItemExpandedLabel">
                    {session.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer (expanded) */}
      <div className="sessionLeftNav__footerExpanded">
        <div
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
                onPageChange={() => setNavPopover(null)}
                onOpenPanel={() => setNavPopover(null)}
                onItemSelect={() => setNavPopover(null)}
                onPopoverNavigate={() => setNavPopover(null)}
              />
            </div>
          </OuiPopover>
        </div>
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
        <div
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
                onPageChange={() => setNavPopover(null)}
              />
            </div>
          </OuiPopover>
        </div>
        <div
          onMouseEnter={() => openNavPopover('profile')}
          onMouseLeave={() => closeNavPopover()}>
          <OuiPopover
            button={<OuiAvatar name="John" size="s" color="#F8A5C2" />}
            isOpen={navPopover === 'profile'}
            closePopover={() => setNavPopover(null)}
            anchorPosition="rightDown"
            panelPaddingSize="s"
            panelClassName="samplePagesLeftNav__popoverPanel">
            <div
              onMouseEnter={() => openNavPopover('profile')}
              onMouseLeave={() => closeNavPopover()}>
              <ProfilePopoverContent
                onPageChange={(page) => {
                  setNavPopover(null);
                  window.location.href = `#/${page}`;
                }}
              />
            </div>
          </OuiPopover>
        </div>
      </div>
    </nav>
  );

  // ---------- COLLAPSED NAV RENDER ----------
  const handleNavBackgroundClick = useCallback((e) => {
    // Don't expand if user clicked on a button, link, or popover content
    const interactive = e.target.closest('button, a, [role="button"], .ouiPopover__panel');
    if (!interactive) {
      setIsNavExpanded(true);
    }
  }, []);

  const renderCollapsedNav = () => (
    <nav
      className={`sessionLeftNav${
        inActiveSession ? ' sessionLeftNav--inSession' : ''
      }`}
      aria-label="Session navigation"
      onClick={handleNavBackgroundClick}
      onMouseEnter={() => setIsLogoHovered(true)}
      onMouseLeave={() => setIsLogoHovered(false)}
      style={{ cursor: 'pointer' }}>
      {/* Logo — shows expand icon when nav body is hovered */}
      <div className="sessionLeftNav__logo">
        <button
          type="button"
          className="sessionLeftNav__logoButton"
          aria-label="Expand navigation"
          onClick={() => setIsNavExpanded(true)}>
          {isLogoHovered ? (
            <div className="sessionLeftNav__expandIconWrap">
              <OuiIcon type="menuRight" size="m" aria-hidden="true" />
            </div>
          ) : (
            <OuiIcon type="logoOpenSearch" size="l" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Primary actions */}
      <div className="sessionLeftNav__actions">
        {disableActions ? (
          <OuiButtonIcon
            className="sessionLeftNav__actionButton"
            iconType="plusInCircle"
            aria-label="New session"
            color="text"
            display="empty"
            isDisabled
          />
        ) : NEW_SESSION_ITEMS.length > 0 ? (
          <div
            onMouseEnter={() => openNavPopover('new-session')}
            onMouseLeave={() => closeNavPopover()}>
            <OuiPopover
              button={
                <OuiButtonIcon
                  className={`sessionLeftNav__actionButton${
                    activeView === 'session' && isEmptySession
                      ? ' sessionLeftNav__actionButton--active'
                      : ''
                  }`}
                  iconType="plusInCircle"
                  aria-label="New session"
                  color="text"
                  display="empty"
                  onClick={onCreateSession}
                />
              }
              isOpen={navPopover === 'new-session'}
              closePopover={() => setNavPopover(null)}
              anchorPosition="rightUp"
              panelPaddingSize="s"
              panelClassName="samplePagesLeftNav__popoverPanel">
              <div
                onMouseEnter={() => openNavPopover('new-session')}
                onMouseLeave={() => closeNavPopover()}>
                <div className="samplePagesLeftNav__threadPopover">
                  <div className="samplePagesLeftNav__threadPopoverHeader">
                    <span>Start with</span>
                  </div>
                  <div className="samplePagesLeftNav__threadPopoverContent">
                    {NEW_SESSION_ITEMS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className="samplePagesLeftNav__threadPopoverItem"
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onClick={() => {
                          setNavPopover(null);
                          if (onOpenPage) onOpenPage(item.page, item.title);
                        }}>
                        <OuiIcon type={item.icon} size="m" style={{ marginRight: 8, flexShrink: 0 }} />
                        <span className="samplePagesLeftNav__threadPopoverTitle">
                          {item.label}
                        </span>
                      </button>
                    ))}
                    {VISIBLE_GROUPS.map((group) => (
                      <React.Fragment key={group.key}>
                        <div className="samplePagesLeftNav__threadPopoverGroupLabel">
                          {group.label}
                        </div>
                        {group.children.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            className="samplePagesLeftNav__threadPopoverItem"
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onClick={() => {
                              setNavPopover(null);
                              if (onOpenPage) onOpenPage(item.page, item.title);
                            }}>
                            <OuiIcon type={item.icon} size="m" style={{ marginRight: 8, flexShrink: 0 }} />
                            <span className="samplePagesLeftNav__threadPopoverTitle">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </OuiPopover>
          </div>
        ) : (
          <OuiToolTip content="New session" position="right">
            <OuiButtonIcon
              className={`sessionLeftNav__actionButton${
                activeView === 'session' && isEmptySession
                  ? ' sessionLeftNav__actionButton--active'
                  : ''
              }`}
              iconType="plusInCircle"
              aria-label="New session"
              color="text"
              display="empty"
              onClick={onCreateSession}
            />
          </OuiToolTip>
        )}

        {/* Visible start items as icons */}
        {!disableActions && (
          <div className="sessionLeftNav__shortcutIcons">
            <div className="sessionLeftNav__divider sessionLeftNav__divider--edge" />
            {NEW_SESSION_ITEMS.map((item) => (
              <OuiToolTip key={item.key} content={item.label} position="right">
                <OuiButtonIcon
                  className="sessionLeftNav__actionButton"
                  iconType={item.icon}
                  aria-label={item.label}
                  color="text"
                  display="empty"
                  onClick={() => { if (onOpenPage) onOpenPage(item.page, item.title); }}
                />
              </OuiToolTip>
            ))}
            {/* Visible group items as icons */}
            {VISIBLE_GROUPS.map((group, groupIdx) => (
              <React.Fragment key={group.key}>
                <div className="sessionLeftNav__divider" />
                {group.children.map((item) => (
                  <OuiToolTip key={item.key} content={item.label} position="right">
                    <OuiButtonIcon
                      className="sessionLeftNav__actionButton"
                      iconType={item.icon}
                      aria-label={item.label}
                      color="text"
                      display="empty"
                      onClick={() => { if (onOpenPage) onOpenPage(item.page, item.title); }}
                    />
                  </OuiToolTip>
                ))}
              </React.Fragment>
            ))}
            <div className="sessionLeftNav__divider sessionLeftNav__divider--edge" />
          </div>
        )}

        {disableActions ? (
          <OuiButtonIcon
            className="sessionLeftNav__actionButton"
            iconType="navTicketing"
            aria-label="All sessions"
            color="text"
            display="empty"
            isDisabled
          />
        ) : (
          <div
            onMouseEnter={() => openNavPopover('sessions')}
            onMouseLeave={() => closeNavPopover()}>
            <OuiPopover
              button={
                <div className="sessionLeftNav__sessionsButtonWrap">
                  <OuiButtonIcon
                    className={`sessionLeftNav__actionButton${
                      activeView === 'session-list'
                        ? ' sessionLeftNav__actionButton--active'
                        : ''
                    }`}
                    iconType="navTicketing"
                    aria-label="All sessions"
                    color="text"
                    display="empty"
                    onClick={onBrowseSessions}
                  />
                </div>
              }
              isOpen={navPopover === 'sessions'}
              closePopover={() => setNavPopover(null)}
              anchorPosition="rightUp"
              panelPaddingSize="s"
              panelClassName="samplePagesLeftNav__popoverPanel">
              <div
                onMouseEnter={() => openNavPopover('sessions')}
                onMouseLeave={() => closeNavPopover()}>
                <div className="samplePagesLeftNav__threadPopover">
                  <div className="samplePagesLeftNav__threadPopoverHeader">
                    <span>Recent sessions</span>
                  </div>
                  <div className="samplePagesLeftNav__threadPopoverContent">
                    {sessions.slice(0, 5).map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        className="samplePagesLeftNav__threadPopoverItem"
                        onClick={() => {
                          setNavPopover(null);
                          onSelectSession(session.id);
                        }}>
                        <span className="samplePagesLeftNav__threadPopoverTitle">
                          {session.title}
                        </span>
                        <span className="samplePagesLeftNav__threadPopoverSubtitle">
                          {session.tabs.length > 0
                            ? `${session.tabs.length} ${
                                session.tabs.length === 1 ? 'tab' : 'tabs'
                              }`
                            : 'No tabs'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="samplePagesLeftNav__threadPopoverFooter">
                    <OuiButtonEmpty
                      size="xs"
                      onClick={() => {
                        setNavPopover(null);
                        onBrowseSessions();
                      }}>
                      View all
                    </OuiButtonEmpty>
                  </div>
                </div>
              </div>
            </OuiPopover>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sessionLeftNav__footer">
        {disableActions ? (
          <div className="sessionLeftNav__footerButton">
            <OuiButtonIcon
              iconType="wsSelector"
              aria-label="Workspace"
              color="text"
              display="empty"
              size="xs"
              isDisabled
            />
          </div>
        ) : (
          <div
            className="sessionLeftNav__footerButton"
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
                  onPageChange={() => setNavPopover(null)}
                  onOpenPanel={() => setNavPopover(null)}
                  onItemSelect={() => setNavPopover(null)}
                  onPopoverNavigate={() => setNavPopover(null)}
                />
              </div>
            </OuiPopover>
          </div>
        )}
        <div className="sessionLeftNav__footerButton">
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
          className="sessionLeftNav__footerButton"
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
                onPageChange={() => setNavPopover(null)}
              />
            </div>
          </OuiPopover>
        </div>
        <div
          className="sessionLeftNav__footerButton"
          onMouseEnter={() => openNavPopover('profile')}
          onMouseLeave={() => closeNavPopover()}>
          <OuiPopover
            button={<OuiAvatar name="John" size="s" color="#F8A5C2" />}
            isOpen={navPopover === 'profile'}
            closePopover={() => setNavPopover(null)}
            anchorPosition="rightDown"
            panelPaddingSize="s"
            panelClassName="samplePagesLeftNav__popoverPanel">
            <div
              onMouseEnter={() => openNavPopover('profile')}
              onMouseLeave={() => closeNavPopover()}>
              <ProfilePopoverContent
                onPageChange={(page) => {
                  setNavPopover(null);
                  window.location.href = `#/${page}`;
                }}
              />
            </div>
          </OuiPopover>
        </div>
      </div>
    </nav>
  );

  // ---------- MAIN RENDER ----------
  return (
    <div
      className="sessionLeftNav__wrapper"
      onClick={(e) => {
        if (isNavExpanded && e.target === e.currentTarget) {
          setIsNavExpanded(false);
        }
      }}>
      <div
        className={`sessionLeftNav__clip${
          isNavExpanded
            ? ' sessionLeftNav__clip--expanded'
            : ' sessionLeftNav__clip--collapsed'
        }`}>
        {renderExpandedContent ? renderExpandedNav() : renderCollapsedNav()}
      </div>
    </div>
  );
};
