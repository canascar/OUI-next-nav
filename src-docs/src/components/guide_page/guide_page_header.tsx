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

import React, { useState, useContext } from 'react';

import {
  OuiHeaderLogo,
  OuiHeader,
  OuiHeaderSectionItemButton,
} from '../../../../src/components/header';
import { OuiIcon } from '../../../../src/components/icon';
import { OuiToolTip } from '../../../../src/components/tool_tip';
import { OuiPopover } from '../../../../src/components/popover';
import { useIsWithinBreakpoints } from '../../../../src/services/hooks';
import {
  OuiButton,
  OuiButtonEmpty,
  OuiButtonIcon,
} from '../../../../src/components/button';
import {
  OuiContextMenuPanel,
  OuiContextMenuItem,
} from '../../../../src/components/context_menu';
import { OuiBetaBadge } from '../../../../src/components/badge/beta_badge';

import { GuideThemeSelector } from '../guide_theme_selector';
import { ThemeContext } from '../with_theme';
import figmaLogo from '../../images/logo-figma.svg';

export const GuidePageHeader: React.FunctionComponent<{}> = () => {
  const isMobileSize = useIsWithinBreakpoints(['xs', 's']);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  const toggleTheme = () => {
    themeContext.changeTheme(isDark ? 'v9-light' : 'v9-dark');
  };

  function renderLogo() {
    return (
      <OuiHeaderLogo iconType="logoOpenSearch" href="#/" aria-label="OUI home">
        OpenSearch AUI{' '}
        <OuiBetaBadge
          label="Beta"
          size="s"
          style={{ verticalAlign: 'middle' }}
        />
      </OuiHeaderLogo>
    );
  }

  function renderThemeToggle() {
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    const iconType = isDark ? 'cloudSunny' : 'moon';
    return (
      <OuiToolTip content={label}>
        <OuiButtonIcon
          aria-label={label}
          iconType={iconType}
          onClick={toggleTheme}
          size="s"
          color="ghost"
          display="empty"
        />
      </OuiToolTip>
    );
  }

  function renderGithub() {
    const href = 'https://github.com/opensearch-project/oui';
    const label = 'OUI GitHub repo';
    return isMobileSize ? (
      <OuiButtonEmpty size="s" flush="both" iconType="logoGithub" href={href}>
        {label}
      </OuiButtonEmpty>
    ) : (
      <OuiToolTip content="Github">
        <OuiHeaderSectionItemButton aria-label={label} href={href}>
          <OuiIcon type="logoGithub" aria-hidden="true" />
        </OuiHeaderSectionItemButton>
      </OuiToolTip>
    );
  }

  function renderFigma() {
    const href = 'https://www.figma.com/community/file/1319043629276905995';
    const label = 'OUI Figma component library';
    return isMobileSize ? (
      <OuiButtonEmpty size="s" flush="both" iconType={figmaLogo} href={href}>
        {label}
      </OuiButtonEmpty>
    ) : (
      <OuiToolTip content="Figma Component Library">
        <OuiHeaderSectionItemButton aria-label={label} href={href}>
          <OuiIcon type={figmaLogo} aria-hidden="true" />
        </OuiHeaderSectionItemButton>
      </OuiToolTip>
    );
  }

  const [samplePagesPopoverOpen, setSamplePagesPopoverOpen] = useState(false);

  function renderSamplePages() {
    const button = (
      <OuiButton
        size="s"
        iconType="arrowDown"
        iconSide="right"
        color="ghost"
        minWidth={0}
        onClick={() => setSamplePagesPopoverOpen((isOpen) => !isOpen)}>
        Sample Pages
      </OuiButton>
    );

    return (
      <OuiPopover
        id="samplePagesSelector"
        repositionOnScroll
        button={button}
        isOpen={samplePagesPopoverOpen}
        closePopover={() => setSamplePagesPopoverOpen(false)}
        panelPaddingSize="none"
        anchorPosition="downRight">
        <OuiContextMenuPanel
          size="s"
          items={[
            <OuiContextMenuItem
              key="onboarding"
              icon="empty"
              onClick={() => {
                setSamplePagesPopoverOpen(false);
                window.location.hash = '/onboarding-wizard';
              }}>
              Onboarding
            </OuiContextMenuItem>,
            <OuiContextMenuItem
              key="first-run"
              icon="empty"
              onClick={() => {
                setSamplePagesPopoverOpen(false);
                window.location.hash = '/first-run?firstrun=1';
              }}>
              First run
            </OuiContextMenuItem>,
            <OuiContextMenuItem
              key="day-n"
              icon="empty"
              onClick={() => {
                setSamplePagesPopoverOpen(false);
                window.location.hash = '/login';
              }}>
              Day N experience
            </OuiContextMenuItem>,
            <OuiContextMenuItem
              key="home"
              icon="empty"
              onClick={() => {
                setSamplePagesPopoverOpen(false);
                window.location.hash = '/home';
              }}>
              Home
            </OuiContextMenuItem>,
          ]}
        />
      </OuiPopover>
    );
  }

  const [mobilePopoverIsOpen, setMobilePopoverIsOpen] = useState(false);

  function renderMobileMenu() {
    const button = (
      <OuiHeaderSectionItemButton
        aria-label="Open OUI options menu"
        onClick={() => setMobilePopoverIsOpen((isOpen) => !isOpen)}>
        <OuiIcon type="apps" aria-hidden="true" />
      </OuiHeaderSectionItemButton>
    );

    return (
      <OuiPopover
        id="guidePageChromeThemePopover"
        button={button}
        isOpen={mobilePopoverIsOpen}
        closePopover={() => setMobilePopoverIsOpen(false)}>
        <div className="guideOptionsPopover">{renderGithub()}</div>
        <div className="guideOptionsPopover">{renderFigma()}</div>
        <div className="guideOptionsPopover">{renderSamplePages()}</div>
      </OuiPopover>
    );
  }

  const rightSideItems = isMobileSize
    ? [<GuideThemeSelector />, renderMobileMenu()]
    : [
        renderSamplePages(),
        <GuideThemeSelector />,
        renderGithub(),
        renderFigma(),
      ];

  return (
    <OuiHeader
      position="fixed"
      theme="dark"
      sections={[
        {
          items: [renderLogo(), renderThemeToggle()],
          borders: 'none',
        },
        {
          items: rightSideItems,
          borders: 'none',
        },
      ]}
    />
  );
};
