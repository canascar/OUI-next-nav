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
  OuiButton,
  OuiButtonIcon,
  OuiFieldText,
  OuiFieldPassword,
  OuiFormRow,
  OuiIcon,
  OuiSpacer,
  OuiText,
  OuiTitle,
  OuiHorizontalRule,
  OuiFlexGroup,
  OuiFlexItem,
} from '../../../../src/components';

import { ThemeContext } from '../../components/with_theme';

export const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  const toggleTheme = () => {
    themeContext.changeTheme(isDark ? 'v9-light' : 'v9-dark');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin();
  };

  // v10 Blueprint tokens
  const bgColor = isDark ? '#0d3057' : '#eef2f7';
  const panelBg = isDark ? 'rgba(10, 37, 69, 0.55)' : 'rgba(255, 255, 255, 0.85)';
  const inkGhost = isDark ? 'rgba(207, 228, 247, 0.16)' : 'rgba(13, 48, 87, 0.14)';
  const inkFade = isDark ? 'rgba(207, 228, 247, 0.34)' : 'rgba(13, 48, 87, 0.32)';
  const cyanDim = isDark ? 'rgba(93, 217, 255, 0.45)' : 'rgba(31, 108, 181, 0.40)';
  const gridColor = isDark ? 'rgba(207, 228, 247, 0.03)' : 'rgba(13, 48, 87, 0.03)';

  // v10 grid: simple 40px squares
  const gridBackground = `
    linear-gradient(to right, ${gridColor} 1px, transparent 1px),
    linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
  `;

  // Corner tick style helper
  const tick = (top, left, right, bottom, accent) => ({
    position: 'absolute',
    width: 6,
    height: 6,
    pointerEvents: 'none',
    ...(top !== undefined && { top }),
    ...(bottom !== undefined && { bottom }),
    ...(left !== undefined && { left }),
    ...(right !== undefined && { right }),
    ...(top !== undefined && left !== undefined && { borderTop: `1px solid ${accent ? cyanDim : inkFade}`, borderLeft: `1px solid ${accent ? cyanDim : inkFade}` }),
    ...(top !== undefined && right !== undefined && { borderTop: `1px solid ${inkFade}`, borderRight: `1px solid ${inkFade}` }),
    ...(bottom !== undefined && left !== undefined && { borderBottom: `1px solid ${accent ? cyanDim : inkFade}`, borderLeft: `1px solid ${accent ? cyanDim : inkFade}` }),
    ...(bottom !== undefined && right !== undefined && { borderBottom: `1px solid ${inkFade}`, borderRight: `1px solid ${inkFade}` }),
  });

  return (
    <div
      className="loginPage"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: bgColor,
        backgroundImage: gridBackground,
        backgroundSize: '40px 40px',
      }}>

      {/* Back arrow */}
      <OuiButtonIcon
        iconType="arrowLeft"
        aria-label="Back to documentation"
        color="text"
        display="empty"
        size="m"
        href="#/"
        style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
      />

      {/* Theme toggle */}
      <OuiButtonIcon
        iconType={isDark ? 'cloudSunny' : 'moon'}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        color="text"
        display="empty"
        size="m"
        onClick={toggleTheme}
        style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
      />

      <div style={{ width: 440, maxWidth: '90vw', position: 'relative', zIndex: 1 }}>
        {/* Panel — v10 style: square, hairline border, corner ticks, no shadow */}
        <div
          style={{
            position: 'relative',
            background: panelBg,
            border: `1px solid ${inkGhost}`,
            padding: '48px 40px',
          }}>
          {/* Corner ticks */}
          <span style={tick(-1, -1, undefined, undefined, true)} />
          <span style={tick(-1, undefined, -1, undefined, false)} />
          <span style={tick(undefined, -1, undefined, -1, true)} />
          <span style={tick(undefined, undefined, -1, -1, false)} />

          {/* Logo */}
          <OuiFlexGroup justifyContent="center" gutterSize="none">
            <OuiFlexItem grow={false}>
              <OuiIcon
                type="logoOpenSearch"
                size="xxl"
                style={
                  isDark
                    ? {
                        '--ouiLogoPrimary': '#0284C7',
                        '--ouiLogoSecondary': '#BAE6FD',
                      }
                    : {
                        '--ouiLogoPrimary': '#075985',
                        '--ouiLogoSecondary': '#082F49',
                      }
                }
              />
            </OuiFlexItem>
          </OuiFlexGroup>

          <OuiSpacer size="l" />

          {/* Title */}
          <OuiTitle size="m">
            <h1 style={{ textAlign: 'center' }}>
              Log in to OpenSearch
            </h1>
          </OuiTitle>

          <OuiSpacer size="s" />

          <OuiText size="s" textAlign="center" color="subdued">
            <p>
              If you have forgotten your username or password, contact your
              system administrator.
            </p>
          </OuiText>

          <OuiSpacer size="l" />

          {/* Form */}
          <form onSubmit={handleLogin}>
            <OuiFormRow fullWidth>
              <OuiFieldText
                placeholder="Username"
                icon="user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                aria-label="Username"
              />
            </OuiFormRow>

            <OuiSpacer size="m" />

            <OuiFormRow fullWidth>
              <OuiFieldPassword
                placeholder="Password"
                type="dual"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                aria-label="Password"
              />
            </OuiFormRow>

            <OuiSpacer size="l" />

            <OuiButton type="submit" fill fullWidth>
              Log in
            </OuiButton>

            <OuiSpacer size="m" />

            <OuiButton fullWidth color="primary" onClick={onLogin}>
              Log in as anonymous
            </OuiButton>
          </form>

          <OuiSpacer size="l" />
          <OuiHorizontalRule />
          <OuiSpacer size="l" />

          {/* Google login */}
          <OuiButton
            fullWidth
            color="primary"
            iconType="logoGoogleG"
            onClick={onLogin}>
            Log in with Google account
          </OuiButton>
          <OuiSpacer size="s" />
        </div>
      </div>
    </div>
  );
};
