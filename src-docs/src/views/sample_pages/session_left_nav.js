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

import React, { useState, useCallback, useRef, useContext } from 'react';

import {
  OuiAvatar,
  OuiButtonEmpty,
  OuiButtonIcon,
  OuiIcon,
  OuiPopover,
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
  sessions = [],
  activeView,
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

  const openNavPopover = useCallback((key) => {
    if (navPopoverTimer.current) clearTimeout(navPopoverTimer.current);
    setNavPopover(key);
  }, []);

  const closeNavPopover = useCallback(() => {
    navPopoverTimer.current = setTimeout(() => setNavPopover(null), 150);
  }, []);

  return (
    <nav className="sessionLeftNav" aria-label="Session navigation">
      {/* Logo */}
      <div className="sessionLeftNav__logo">
        <OuiIcon type="logoOpenSearch" size="l" />
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
                        {session.tabs.length > 0 ? `${session.tabs.length} ${session.tabs.length === 1 ? 'tab' : 'tabs'}` : 'No tabs'}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="samplePagesLeftNav__threadPopoverFooter">
                  <OuiButtonEmpty size="xs" onClick={() => { setNavPopover(null); onBrowseSessions(); }}>
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
            iconType="folderClosed"
            aria-label="Library"
            color="text"
            display="empty"
            isDisabled
          />
        ) : (
          <OuiToolTip content="Library" position="right">
            <OuiButtonIcon
              className={`sessionLeftNav__actionButton${
                activeView === 'library'
                  ? ' sessionLeftNav__actionButton--active'
                  : ''
              }`}
              iconType={activeView === 'library' ? 'folderOpen' : 'folderClosed'}
              aria-label="Library"
              color="text"
              display="empty"
              onClick={onBrowseLibrary}
            />
          </OuiToolTip>
        )}
      </div>

      {/* Footer — exact copy from SamplePagesLeftNav collapsed */}
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
                onPageChange={() => {
                  setNavPopover(null);
                }}
                onOpenPanel={() => {
                  setNavPopover(null);
                }}
                onItemSelect={() => {
                  setNavPopover(null);
                }}
                onPopoverNavigate={() => {
                  setNavPopover(null);
                }}
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
                onPageChange={() => {
                  setNavPopover(null);
                }}
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
              <ProfilePopoverContent />
            </div>
          </OuiPopover>
        </div>
      </div>
    </nav>
  );
};
