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
  const panelBg = isDark ? '#181028' : '#ffffff';
  const borderColor = isDark ? '#2c2042' : '#ececef';

  // Glass canvas gradient (enhanced indigo/violet blobs)
  const bgGradient = isDark
    ? `radial-gradient(ellipse 50% 45% at 0% 0%, hsla(268, 80%, 32%, 0.55), transparent 65%),
       radial-gradient(ellipse 45% 38% at 100% 5%, hsla(250, 75%, 28%, 0.48), transparent 60%),
       radial-gradient(ellipse 50% 50% at 50% 50%, hsla(270, 60%, 22%, 0.30), transparent 70%),
       radial-gradient(ellipse 42% 38% at 95% 95%, hsla(285, 75%, 28%, 0.50), transparent 60%),
       radial-gradient(ellipse 40% 35% at 5% 100%, hsla(258, 70%, 26%, 0.48), transparent 60%)`
    : `radial-gradient(ellipse 50% 45% at 0% 0%, hsla(245, 85%, 90%, 0.65), transparent 65%),
       radial-gradient(ellipse 45% 38% at 100% 5%, hsla(215, 90%, 92%, 0.55), transparent 60%),
       radial-gradient(ellipse 50% 50% at 50% 50%, hsla(260, 70%, 94%, 0.35), transparent 70%),
       radial-gradient(ellipse 42% 38% at 95% 95%, hsla(270, 80%, 92%, 0.55), transparent 60%),
       radial-gradient(ellipse 40% 35% at 5% 100%, hsla(230, 80%, 92%, 0.50), transparent 60%)`;

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
        backgroundImage: bgGradient,
        backgroundAttachment: 'fixed',
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
        {/* Panel — Glass style: rounded, hairline border, feather shadow */}
        <div
          style={{
            position: 'relative',
            background: panelBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: '48px 40px',
            boxShadow: '0 1px 2px rgba(15,15,15,0.04), 0 8px 24px rgba(15,15,15,0.04)',
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
