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
  OuiButtonIcon,
  OuiAvatar,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';

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

  return (
    <nav
      aria-label="Sample pages navigation"
      className="samplePagesLeftNav"
      style={{
        width: 48,
        minWidth: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
      }}>
      {/* Logo */}
      <div style={{ padding: '12px 0' }}>
        <OuiIcon type="logoOpenSearch" size="l" aria-label="OpenSearch" />
      </div>

      {/* Spacer to push footer to bottom */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: '12px 0',
        }}>
        <OuiButtonIcon
          iconType="spacesApp"
          aria-label="Workspace"
          color="text"
          display="empty"
          size="xs"
        />
        <OuiButtonIcon
          iconType="console"
          aria-label="Developer tools"
          color="text"
          display="empty"
          size="xs"
        />
        <OuiButtonIcon
          iconType="gear"
          aria-label="Settings"
          color="text"
          display="empty"
          size="xs"
        />
        <OuiAvatar name="OS" size="s" />
      </div>
    </nav>
  );
};
