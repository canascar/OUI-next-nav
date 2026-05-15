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
  OuiPanel,
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

  // Agentic OSD Utility: Graph paper grid background (matching sample pages)
  const gridColor = isDark
    ? 'rgba(122, 159, 212, 0.06)'
    : 'rgba(46, 74, 143, 0.04)';
  const gridColorSmall = isDark
    ? 'rgba(122, 159, 212, 0.025)'
    : 'rgba(46, 74, 143, 0.015)';
  const bgColor = isDark ? '#060D1A' : '#F4F6FB';

  const gridBackground = `
    linear-gradient(to right, ${gridColor} 1px, transparent 1px),
    linear-gradient(to bottom, ${gridColor} 1px, transparent 1px),
    linear-gradient(to right, ${gridColorSmall} 1px, transparent 1px),
    linear-gradient(to bottom, ${gridColorSmall} 1px, transparent 1px)
  `;

  // Vignette effect - fades edges and corners
  const vignetteColor = isDark
    ? 'rgba(6, 13, 26, 0.85)'
    : 'rgba(244, 246, 251, 0.9)';
  const vignette = `radial-gradient(ellipse at center, transparent 40%, ${vignetteColor} 100%)`;

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
        backgroundSize: '24px 24px, 24px 24px, 6px 6px, 6px 6px',
      }}>
      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: vignette,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

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

      <div style={{ width: 480, maxWidth: '90vw', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            borderRadius: 12,
            boxShadow:
              '0 40px 60px rgba(0, 0, 0, 0.06), 0 16px 20px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.06)'
              : '1px solid rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}>
          <OuiPanel
            paddingSize="xl"
            style={{
              padding: 48,
              backgroundColor: isDark
                ? 'rgba(36, 37, 38, 0.75)'
                : 'rgba(255, 255, 255, 0.4)',
            }}>
            {/* Logo */}
            <OuiFlexGroup justifyContent="center" gutterSize="none">
              <OuiFlexItem grow={false}>
                <OuiIcon
                  type="logoOpenSearch"
                  size="xxl"
                  style={
                    isDark
                      ? {
                          '--ouiLogoPrimary': '#3B9FD9',
                          '--ouiLogoSecondary': '#1A7BBF',
                        }
                      : {}
                  }
                />
              </OuiFlexItem>
            </OuiFlexGroup>

            <OuiSpacer size="l" />

            {/* Title */}
            <OuiTitle size="m">
              <h1 style={{ textAlign: 'center' }}>
                Log in to OpenSearch Dashboards
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
          </OuiPanel>
        </div>
      </div>
    </div>
  );
};
