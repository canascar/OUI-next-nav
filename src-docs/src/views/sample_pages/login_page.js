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

  // Glass theme tokens
  const bgColor = isDark ? '#0d0818' : '#f8f7fc';
  const panelBg = isDark
    ? 'rgba(26, 23, 33, 0.55)'
    : 'rgba(255, 255, 255, 0.62)';
  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.10)'
    : 'rgba(255, 255, 255, 0.9)';

  // Glass canvas gradient — uses brand gradient via CSS class
  const bgGradient = undefined; // handled by .loginPage class now

  return (
    <div
      className="loginPage"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        position: 'relative',
        animation: 'screenFadeIn 500ms ease-out both',
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

      <div
        style={{
          width: 440,
          maxWidth: '90vw',
          position: 'relative',
          zIndex: 1,
        }}>
        {/* Panel — Frosted glass: translucent, blur, hairline border, elevated shadow */}
        <div
          style={{
            position: 'relative',
            background: panelBg,
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: '48px 40px',
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.2)'
              : '0 1px 2px rgba(15,15,15,0.04), 0 8px 24px rgba(15,15,15,0.06), 0 24px 48px rgba(15,15,15,0.04)',
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
            <h1 style={{ textAlign: 'center' }}>Log in to OpenSearch</h1>
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
