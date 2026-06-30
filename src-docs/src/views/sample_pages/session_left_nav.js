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

  // New session sub-items — all available options
  const ALL_START_ITEMS = [
    { key: 'logs', label: 'Logs', icon: 'navDiscover', page: 'discover-log', title: 'Logs' },
    { key: 'metrics', label: 'Metrics', icon: 'visArea', page: 'discover-metric', title: 'Metrics' },
    { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards', page: 'dashboards-list', title: 'Dashboards' },
    { key: 'alerts', label: 'Alerts', icon: 'navAlerting', page: 'alerts-list', title: 'Alerts' },
    { key: 'service-map', label: 'Service map', icon: 'navAiFlow', page: 'app-map', title: 'Service Map' },
    { key: 'traces', label: 'Traces', icon: 'apmTrace', page: 'app-traces', title: 'Traces' },
    { key: 'services', label: 'Services', icon: 'navServices', page: 'app-perf-services', title: 'Services' },
    { key: 'notebooks', label: 'Notebooks', icon: 'document', page: 'notebooks', title: 'Notebooks' },
  ];

  // Enabled start items (keys)
  const [enabledStartItems, setEnabledStartItems] = useState(
    () => new Set(['logs', 'metrics', 'dashboards', 'alerts', 'service-map'])
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

  const NEW_SESSION_ITEMS = ALL_START_ITEMS.filter((item) =>
    enabledStartItems.has(item.key)
  );

  // ---------- EXPANDED NAV RENDER ----------
  const renderExpandedNav = () => (
    <nav
      className={`sessionLeftNav sessionLeftNav--expanded${
        inActiveSession ? ' sessionLeftNav--inSession' : ''
      }`}
      aria-label="Session navigation">
      {/* Header: logo left, collapse icon right */}
      <div className="sessionLeftNav__headerExpanded">
        <button
          type="button"
          className="sessionLeftNav__logoButton"
          aria-label="Home"
          onClick={onCreateSession}>
          <OuiIcon type="logoOpenSearch" size="l" aria-hidden="true" />
        </button>
        <OuiButtonIcon
          iconType="menuLeft"
          aria-label="Collapse navigation"
          color="text"
          display="empty"
          size="xs"
          onClick={() => setIsNavExpanded(false)}
        />
      </div>

      {/* Expanded nav items with labels */}
      <div className="sessionLeftNav__itemsExpanded">
        {/* New session — collapsible */}
        <div className="sessionLeftNav__section">
          <div className="sessionLeftNav__navItemExpandedRow">
            <button
              type="button"
              className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--main"
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
            </button>
            <button
              type="button"
              className="sessionLeftNav__navItemArrowButton"
              aria-label={expandedSections['new-session'] ? 'Collapse' : 'Expand'}
              onClick={() => toggleSection('new-session')}>
              <OuiIcon
                type={expandedSections['new-session'] ? 'arrowDown' : 'arrowRight'}
                size="s"
              />
            </button>
          </div>
          {expandedSections['new-session'] && (
            <div className="sessionLeftNav__sectionChildren">
              <div className="sessionLeftNav__sectionSubtitleRow">
                <span className="sessionLeftNav__sectionSubtitle">
                  {NEW_SESSION_ITEMS.length > 0 ? 'Or start with' : 'Add shortcuts'}
                </span>
                <OuiPopover
                  button={
                    <OuiIcon
                      type="controlsHorizontal"
                      size="s"
                      className="sessionLeftNav__sectionSubtitleIcon"
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
                      {ALL_START_ITEMS.map((item) => (
                        <div key={item.key} className="sessionLeftNav__customizeItem">
                          <OuiIcon type={item.icon} size="s" />
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
                    </div>
                  </div>
                </OuiPopover>
              </div>
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
            </div>
          )}
        </div>

        {/* Library — collapsible */}
        <div className="sessionLeftNav__section">
          <div className="sessionLeftNav__navItemExpandedRow">
            <button
              type="button"
              className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--main${
                activeView === 'library'
                  ? ' sessionLeftNav__navItemExpanded--active'
                  : ''
              }`}
              onClick={() => {
                setIsNavExpanded(false);
                onBrowseLibrary();
              }}>
              <div className="sessionLeftNav__navItemIconWrap">
                <OuiIcon
                  type={activeView === 'library' ? 'folderOpen' : 'folderClosed'}
                  size="m"
                />
              </div>
              <span className="sessionLeftNav__navItemExpandedLabel">
                Library
              </span>
            </button>
            <button
              type="button"
              className="sessionLeftNav__navItemArrowButton"
              aria-label={expandedSections['library'] ? 'Collapse' : 'Expand'}
              onClick={() => toggleSection('library')}>
              <OuiIcon
                type={expandedSections['library'] ? 'arrowDown' : 'arrowRight'}
                size="s"
              />
            </button>
          </div>
          {expandedSections['library'] && (
            <div className="sessionLeftNav__sectionChildren">
              <div className="sessionLeftNav__sectionSubtitleRow">
                <span className="sessionLeftNav__sectionSubtitle">Pinned</span>
              </div>
              <button
                type="button"
                className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
                onClick={() => { setIsNavExpanded(false); if (onOpenPage) onOpenPage('dashboards', 'System overview'); }}>
                <div className="sessionLeftNav__navItemIconWrap">
                  <OuiIcon type="pin" size="m" />
                </div>
                <span className="sessionLeftNav__navItemExpandedLabel">System overview</span>
              </button>
              <button
                type="button"
                className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
                onClick={() => { setIsNavExpanded(false); if (onOpenPage) onOpenPage('logs', 'Error rate by service'); }}>
                <div className="sessionLeftNav__navItemIconWrap">
                  <OuiIcon type="pin" size="m" />
                </div>
                <span className="sessionLeftNav__navItemExpandedLabel">Error rate by service</span>
              </button>
              <button
                type="button"
                className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
                onClick={() => { setIsNavExpanded(false); if (onOpenPage) onOpenPage('metrics', 'Latency percentiles'); }}>
                <div className="sessionLeftNav__navItemIconWrap">
                  <OuiIcon type="pin" size="m" />
                </div>
                <span className="sessionLeftNav__navItemExpandedLabel">Latency percentiles</span>
              </button>
              <button
                type="button"
                className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
                onClick={() => { setIsNavExpanded(false); if (onOpenPage) onOpenPage('alerts', 'CPU threshold alert'); }}>
                <div className="sessionLeftNav__navItemIconWrap">
                  <OuiIcon type="pin" size="m" />
                </div>
                <span className="sessionLeftNav__navItemExpandedLabel">CPU threshold alert</span>
              </button>
              <button
                type="button"
                className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
                onClick={() => { setIsNavExpanded(false); if (onOpenPage) onOpenPage('dashboards', 'Web traffic analytics'); }}>
                <div className="sessionLeftNav__navItemIconWrap">
                  <OuiIcon type="pin" size="m" />
                </div>
                <span className="sessionLeftNav__navItemExpandedLabel">Web traffic analytics</span>
              </button>
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
            </button>
            <button
              type="button"
              className="sessionLeftNav__navItemArrowButton"
              aria-label={expandedSections['all-sessions'] ? 'Collapse' : 'Expand'}
              onClick={() => toggleSection('all-sessions')}>
              <OuiIcon
                type={expandedSections['all-sessions'] ? 'arrowDown' : 'arrowRight'}
                size="s"
              />
            </button>
          </div>
          {expandedSections['all-sessions'] && (
            <div className="sessionLeftNav__sectionChildren">
              <div className="sessionLeftNav__sectionSubtitleRow">
                <span className="sessionLeftNav__sectionSubtitle">Recents</span>
              </div>
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
      style={{ cursor: 'pointer' }}>
      {/* Logo — on hover shows expand icon, click expands nav */}
      <div className="sessionLeftNav__logo">
        <button
          type="button"
          className="sessionLeftNav__logoButton"
          aria-label="Expand navigation"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
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
                  className="sessionLeftNav__actionButton"
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
                    <span>Or start with</span>
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
                  </div>
                </div>
              </div>
            </OuiPopover>
          </div>
        ) : (
          <OuiToolTip content="New session" position="right">
            <OuiButtonIcon
              className="sessionLeftNav__actionButton"
              iconType="plusInCircle"
              aria-label="New session"
              color="text"
              display="empty"
              onClick={onCreateSession}
            />
          </OuiToolTip>
        )}

        {disableActions ? (
          <OuiButtonIcon
            className="sessionLeftNav__actionButton"
            iconType="folderClosed"
            aria-label="Library"
            color="text"
            display="empty"
            isDisabled
          />
        ) : (
          <div
            onMouseEnter={() => openNavPopover('library')}
            onMouseLeave={() => closeNavPopover()}>
            <OuiPopover
              button={
                <OuiButtonIcon
                  className={`sessionLeftNav__actionButton${
                    activeView === 'library'
                      ? ' sessionLeftNav__actionButton--active'
                      : ''
                  }`}
                  iconType={
                    activeView === 'library' ? 'folderOpen' : 'folderClosed'
                  }
                  aria-label="Library"
                  color="text"
                  display="empty"
                  onClick={onBrowseLibrary}
                />
              }
              isOpen={navPopover === 'library'}
              closePopover={() => setNavPopover(null)}
              anchorPosition="rightUp"
              panelPaddingSize="s"
              panelClassName="samplePagesLeftNav__popoverPanel">
              <div
                onMouseEnter={() => openNavPopover('library')}
                onMouseLeave={() => closeNavPopover()}>
                <div className="samplePagesLeftNav__threadPopover">
                  <div className="samplePagesLeftNav__threadPopoverHeader">
                    <span>Pinned</span>
                  </div>
                  <div className="samplePagesLeftNav__threadPopoverContent">
                    <button
                      type="button"
                      className="samplePagesLeftNav__threadPopoverItem"
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onClick={() => { setNavPopover(null); if (onOpenPage) onOpenPage('dashboards', 'System overview'); }}>
                      <OuiIcon type="pin" size="m" style={{ marginRight: 8, flexShrink: 0 }} />
                      <span className="samplePagesLeftNav__threadPopoverTitle">System overview</span>
                    </button>
                    <button
                      type="button"
                      className="samplePagesLeftNav__threadPopoverItem"
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onClick={() => { setNavPopover(null); if (onOpenPage) onOpenPage('logs', 'Error rate by service'); }}>
                      <OuiIcon type="pin" size="m" style={{ marginRight: 8, flexShrink: 0 }} />
                      <span className="samplePagesLeftNav__threadPopoverTitle">Error rate by service</span>
                    </button>
                    <button
                      type="button"
                      className="samplePagesLeftNav__threadPopoverItem"
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onClick={() => { setNavPopover(null); if (onOpenPage) onOpenPage('metrics', 'Latency percentiles'); }}>
                      <OuiIcon type="pin" size="m" style={{ marginRight: 8, flexShrink: 0 }} />
                      <span className="samplePagesLeftNav__threadPopoverTitle">Latency percentiles</span>
                    </button>
                    <button
                      type="button"
                      className="samplePagesLeftNav__threadPopoverItem"
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onClick={() => { setNavPopover(null); if (onOpenPage) onOpenPage('alerts', 'CPU threshold alert'); }}>
                      <OuiIcon type="pin" size="m" style={{ marginRight: 8, flexShrink: 0 }} />
                      <span className="samplePagesLeftNav__threadPopoverTitle">CPU threshold alert</span>
                    </button>
                    <button
                      type="button"
                      className="samplePagesLeftNav__threadPopoverItem"
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      onClick={() => { setNavPopover(null); if (onOpenPage) onOpenPage('dashboards', 'Web traffic analytics'); }}>
                      <OuiIcon type="pin" size="m" style={{ marginRight: 8, flexShrink: 0 }} />
                      <span className="samplePagesLeftNav__threadPopoverTitle">Web traffic analytics</span>
                    </button>
                  </div>
                  <div className="samplePagesLeftNav__threadPopoverFooter">
                    <OuiButtonEmpty
                      size="xs"
                      onClick={() => {
                        setNavPopover(null);
                        onBrowseLibrary();
                      }}>
                      View all
                    </OuiButtonEmpty>
                  </div>
                </div>
              </div>
            </OuiPopover>
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
                    className="sessionLeftNav__actionButton"
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
    <div className="sessionLeftNav__wrapper">
      <div
        className={`sessionLeftNav__clip${
          isNavExpanded
            ? ' sessionLeftNav__clip--expanded'
            : ' sessionLeftNav__clip--collapsed'
        }`}>
        {isNavExpanded ? renderExpandedNav() : renderCollapsedNav()}
      </div>
    </div>
  );
};
