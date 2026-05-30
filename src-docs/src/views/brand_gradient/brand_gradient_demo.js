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
  OuiBrandGradient,
  OuiSpacer,
  OuiTitle,
  OuiText,
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';

const GradientCard = ({ variant, isDark }) => (
  <OuiBrandGradient
    variant={variant}
    isDark={isDark}
    style={{
      borderRadius: 12,
      padding: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
    }}>
    <OuiPanel
      paddingSize="l"
      style={{
        backgroundColor: isDark
          ? 'rgba(36, 37, 38, 0.5)'
          : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        textAlign: 'center',
      }}>
      <OuiTitle size="s">
        <h3 style={{ textTransform: 'capitalize' }}>{variant}</h3>
      </OuiTitle>
      <OuiSpacer size="xs" />
      <OuiText size="s" color="subdued">
        <p>{isDark ? 'Dark mode' : 'Light mode'}</p>
      </OuiText>
    </OuiPanel>
  </OuiBrandGradient>
);

export default () => {
  const themeContext = useContext(ThemeContext);
  const isDark =
    themeContext.theme === 'v9-dark' || themeContext.theme === 'dark';

  return (
    <div>
      <OuiTitle size="xs">
        <h3>Gradient variants</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiFlexGroup gutterSize="m">
        <OuiFlexItem>
          <GradientCard variant="subtle" isDark={isDark} />
        </OuiFlexItem>
        <OuiFlexItem>
          <GradientCard variant="vivid" isDark={isDark} />
        </OuiFlexItem>
        <OuiFlexItem>
          <GradientCard variant="radial" isDark={isDark} />
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="xl" />

      <OuiTitle size="xs">
        <h3>Full-width example</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiBrandGradient
        variant="vivid"
        isDark={isDark}
        style={{
          borderRadius: 12,
          padding: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <div style={{ textAlign: 'center' }}>
          <OuiTitle size="l">
            <h2 style={{ color: isDark ? '#fafafa' : '#0a0a0a' }}>
              Welcome to OpenSearch
            </h2>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiText color="subdued">
            <p>Glass gradient backgrounds for login pages, hero sections, and more.</p>
          </OuiText>
        </div>
      </OuiBrandGradient>
    </div>
  );
};
