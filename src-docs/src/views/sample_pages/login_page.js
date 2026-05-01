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

  const pageBackground = isDark ? '#111' : '#E5E5E5';

  const gradientBackground = isDark
    ? `radial-gradient(ellipse at 30% 40%, rgba(0, 184, 219, 0.18) 0%, transparent 50%),
       radial-gradient(ellipse at 70% 60%, rgba(0, 105, 170, 0.12) 0%, transparent 50%),
       #111`
    : `radial-gradient(ellipse at 30% 40%, rgba(0, 146, 184, 0.14) 0%, transparent 50%),
       radial-gradient(ellipse at 70% 60%, rgba(0, 85, 140, 0.08) 0%, transparent 50%),
       #E5E5E5`;

  const loginStyles = '';
  return (
    <div
      className="loginPage"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: pageBackground,
        background: gradientBackground,
        position: 'relative',
      }}>
      <style>{loginStyles}</style>

      {/* Back arrow */}
      <OuiButtonIcon
        iconType="arrowLeft"
        aria-label="Back to documentation"
        color="text"
        display="empty"
        size="m"
        href="#/"
        style={{ position: 'absolute', top: 16, left: 16 }}
      />

      {/* Theme toggle */}
      <OuiButtonIcon
        iconType={isDark ? 'cloudSunny' : 'moon'}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        color="text"
        display="empty"
        size="m"
        onClick={toggleTheme}
        style={{ position: 'absolute', top: 16, right: 16 }}
      />

      <div style={{ width: 480, maxWidth: '90vw' }}>
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
                ? 'rgba(36, 37, 38, 0.4)'
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
