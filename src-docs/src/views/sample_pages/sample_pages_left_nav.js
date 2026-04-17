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

import React, { useContext } from 'react';

import {
  OuiFieldSearch,
  OuiIcon,
  OuiButtonIcon,
  OuiAvatar,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';

const NAV_ITEMS = [
  { key: 'service', label: 'Services' },
  { key: 'discover', label: 'Discover' },
  { key: 'thread', label: 'Threads' },
];

export const SamplePagesLeftNav = ({ activePage, onPageChange }) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  const toggleTheme = () => {
    themeContext.changeTheme(isDark ? 'v9-light' : 'v9-dark');
  };

  return (
    <nav aria-label="Sample pages navigation" className="samplePagesLeftNav">
      {/* Top section: header + search — 270×124 */}
      <div className="samplePagesLeftNav__top">
        <div className="samplePagesLeftNav__header">
          <div className="samplePagesLeftNav__headerInner">
            <OuiIcon
              type="logoOpenSearch"
              size="xl"
              aria-label="OpenSearch"
              style={{ width: 32, height: 32 }}
            />
          </div>
          <div className="samplePagesLeftNav__headerCollapse">
            <OuiButtonIcon
              iconType="menuLeft"
              aria-label="Collapse navigation"
              color="text"
              display="empty"
            />
          </div>
        </div>
        <OuiFieldSearch
          compressed
          placeholder="Search the menu"
          className="samplePagesLeftNav__search"
          aria-label="Search navigation menu"
        />
      </div>

      {/* Nav items — flex-1, p-16, gap-8 */}
      <div className="samplePagesLeftNav__items">
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`samplePagesLeftNav__item${
                isActive ? ' samplePagesLeftNav__item--active' : ''
              }`}>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer — border-top, px-16 py-12, justify-between */}
      <div className="samplePagesLeftNav__footer">
        <OuiButtonIcon
          iconType="home"
          aria-label="Home"
          color="text"
          display="empty"
        />
        <OuiButtonIcon
          iconType="wsSelector"
          aria-label="Workspace selector"
          color="text"
          display="empty"
        />
        <OuiButtonIcon
          iconType="gear"
          aria-label="Settings"
          color="text"
          display="empty"
        />
        <OuiButtonIcon
          iconType="brush"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          color="text"
          display="empty"
          onClick={toggleTheme}
        />
        <OuiButtonIcon
          iconType="iInCircle"
          aria-label="Info"
          color="text"
          display="empty"
        />
        <OuiAvatar name="OS" size="s" />
      </div>
    </nav>
  );
};
