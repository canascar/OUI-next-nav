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
  OuiLoadingSpinner,
  OuiPopover,
  OuiToolTip,
} from '../../../../src/components';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { ThemeContext } from '../../components/with_theme';
import {
  WorkspaceNavPanelContent,
  SettingsPopoverContent,
  ProfilePopoverContent,
} from './sample_pages_left_nav';
import {
  NAV_FLOOR,
  loadNavConfig,
  saveNavConfig,
  getPromotedItems,
  getCollapsedGroupItems,
} from './nav_config';
import { SearchPopover } from './search_popover';

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
  activePageKey,
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
  const [expandedSections, setExpandedSections] = useState({ 'new-session': true, 'all-sessions': true });
  const toggleSection = useCallback((key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ─── NavConfig state (persisted) ───────────────────────────────────────────
  const [navConfig, setNavConfig] = useState(loadNavConfig);
  const [searchOpen, setSearchOpen] = useState(false);

  const updateNavConfig = useCallback((updater) => {
    setNavConfig((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveNavConfig(next);
      return next;
    });
  }, []);

  // Derived nav item lists
  const promotedItems = getPromotedItems(navConfig.promoted);
  const collapsedGroupItems = getCollapsedGroupItems(navConfig.promoted);

  // Legacy compatibility: NEW_SESSION_ITEMS used in collapsed rail popover
  const NEW_SESSION_ITEMS = [...NAV_FLOOR, ...promotedItems];
  const VISIBLE_GROUPS = [];

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
          <OuiButtonIcon
            iconType="dockedLeft"
            aria-label="Collapse navigation"
            color="text"
            display="empty"
            size="xs"
            onClick={() => setIsNavExpanded(false)}
          />
        </div>
      </div>

      {/* Expanded nav items — v8 unified slot-and-label grid */}
      <div className="sessionLeftNav__itemsExpanded">
        {/* New session */}
        <button
          type="button"
          className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--main${
            activeView === 'session' &&
            (isEmptySession || activePageKey === 'overview-home')
              ? ' sessionLeftNav__navItemExpanded--active'
              : ''
          }`}
          onClick={() => {
            setIsNavExpanded(false);
            onCreateSession();
          }}>
          <div className="sessionLeftNav__navItemIconWrap">
            <OuiIcon
              type="plusInCircle"
              size="m"
              color={
                activeView === 'session' &&
                (isEmptySession || activePageKey === 'overview-home')
                  ? 'primary'
                  : undefined
              }
            />
          </div>
          <span className="sessionLeftNav__navItemExpandedLabel">
            New session
          </span>
        </button>

        {/* All sessions */}
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
            <OuiIcon type="navTicketing" size="m" color={activeView === 'session-list' ? 'primary' : undefined} />
          </div>
          <span className="sessionLeftNav__navItemExpandedLabel">
            All sessions
          </span>
        </button>

        {/* Floor items — always shown */}
        {NAV_FLOOR.map((item) => {
          const isActive = activePageKey != null && item.page === activePageKey;
          return (
            <button
              key={item.key}
              type="button"
              className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child${
                isActive ? ' sessionLeftNav__navItemExpanded--active' : ''
              }`}
              onClick={() => {
                setIsNavExpanded(false);
                if (onOpenPage) onOpenPage(item.page, item.label);
              }}>
              <div className="sessionLeftNav__navItemIconWrap">
                <OuiIcon type={item.icon} size="m" color={isActive ? 'primary' : undefined} />
              </div>
              <span className="sessionLeftNav__navItemExpandedLabel">
                {item.label}
              </span>
            </button>
          );
        })}
        {/* Promoted items */}
        {promotedItems.map((item) => {
          const isActive = activePageKey != null && item.page === activePageKey;
          return (
            <button
              key={item.key}
              type="button"
              className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child${
                isActive ? ' sessionLeftNav__navItemExpanded--active' : ''
              }`}
              onClick={() => {
                setIsNavExpanded(false);
                if (onOpenPage) onOpenPage(item.page, item.label);
              }}>
              <div className="sessionLeftNav__navItemIconWrap">
                <OuiIcon type={item.icon} size="m" color={isActive ? 'primary' : undefined} />
              </div>
              <span className="sessionLeftNav__navItemExpandedLabel">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More — disclosure for collapsed-group items */}
        {collapsedGroupItems.length > 0 && (
          <>
            <button
              type="button"
              className="sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child"
              style={{ opacity: 0.6 }}
              aria-expanded={navConfig.groupOpen}
              onClick={() => updateNavConfig((prev) => ({ ...prev, groupOpen: !prev.groupOpen }))}>
              <div className="sessionLeftNav__navItemIconWrap">
                <OuiIcon
                  type={navConfig.groupOpen ? 'arrowDown' : 'arrowRight'}
                  size="s"
                />
              </div>
              <span className="sessionLeftNav__navItemExpandedLabel">
                More
              </span>
            </button>
            {navConfig.groupOpen && collapsedGroupItems.map((item) => {
              const isActive = activePageKey != null && item.page === activePageKey;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`sessionLeftNav__navItemExpanded sessionLeftNav__navItemExpanded--child${
                    isActive ? ' sessionLeftNav__navItemExpanded--active' : ''
                  }`}
                  onClick={() => {
                    setIsNavExpanded(false);
                    if (onOpenPage) onOpenPage(item.page, item.label);
                  }}>
                  <div className="sessionLeftNav__navItemIconWrap">
                    <OuiIcon type={item.icon} size="m" color={isActive ? 'primary' : undefined} />
                  </div>
                  <span className="sessionLeftNav__navItemExpandedLabel">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer (expanded) */}
      <div className="sessionLeftNav__divider sessionLeftNav__divider--edge" style={{ margin: '0 12px 0', opacity: 0.5 }} />
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
              <OuiIcon type="dockedLeft" size="m" aria-hidden="true" />
            </div>
          ) : (
            <OuiIcon type="logoOpenSearch" size="l" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Primary actions */}
      <div className="sessionLeftNav__actions" style={{ flex: 'none' }}>
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
                    activeView === 'session' &&
                    (isEmptySession || activePageKey === 'overview-home')
                      ? ' sessionLeftNav__actionButton--active'
                      : ''
                  }`}
                  iconType="plusInCircle"
                  aria-label="New session"
                  color={
                    activeView === 'session' &&
                    (isEmptySession || activePageKey === 'overview-home')
                      ? 'primary'
                      : 'text'
                  }
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
                activeView === 'session' &&
                (isEmptySession || activePageKey === 'overview-home')
                  ? ' sessionLeftNav__actionButton--active'
                  : ''
              }`}
              iconType="plusInCircle"
              aria-label="New session"
              color={
                activeView === 'session' &&
                (isEmptySession || activePageKey === 'overview-home')
                  ? 'primary'
                  : 'text'
              }
              display="empty"
              onClick={onCreateSession}
            />
          </OuiToolTip>
        )}

        {/* All sessions — toggles a persistent side panel */}
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
          <OuiToolTip content="All sessions" position="right">
            <OuiButtonIcon
              className={`sessionLeftNav__actionButton${
                activeView === 'session-list'
                  ? ' sessionLeftNav__actionButton--active'
                  : ''
              }`}
              iconType="navTicketing"
              aria-label="All sessions"
              color={activeView === 'session-list' ? 'primary' : 'text'}
              display="empty"
              onClick={onBrowseSessions}
            />
          </OuiToolTip>
        )}

        {/* Floor items as icons — always visible in collapsed state */}
        {!disableActions && (
          <div className="sessionLeftNav__shortcutIcons">
            <div className="sessionLeftNav__divider sessionLeftNav__divider--edge" />
            {NAV_FLOOR.map((item) => {
              const isActive = activePageKey != null && item.page === activePageKey;
              return (
                <OuiToolTip key={item.key} content={item.label} position="right">
                  <OuiButtonIcon
                    className={`sessionLeftNav__actionButton${
                      isActive ? ' sessionLeftNav__actionButton--active' : ''
                    }`}
                    iconType={item.icon}
                    aria-label={item.label}
                    color={isActive ? 'primary' : 'text'}
                    display="empty"
                    onClick={() => { if (onOpenPage) onOpenPage(item.page, item.label); }}
                  />
                </OuiToolTip>
              );
            })}
          </div>
        )}
      </div>

      {/* Spacer pushes footer to bottom */}
      <div style={{ flex: 1 }} />

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
      {/* Universal search popover — rendered at component level so it works from both states */}
      <SearchPopover
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(pageKey, title) => {
          setSearchOpen(false);
          setIsNavExpanded(false);
          if (onOpenPage) onOpenPage(pageKey, title);
        }}
        onAskAi={() => {
          setSearchOpen(false);
          setIsNavExpanded(false);
        }}
      />
    </div>
  );
};
