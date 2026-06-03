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
    ? 'rgba(24, 16, 40, 0.55)'
    : 'rgba(255, 255, 255, 0.62)';
  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.10)'
    : 'rgba(255, 255, 255, 0.9)';

  // Glass canvas gradient (fractal satin — layered shimmer)
  const bgGradient = isDark
    ? `radial-gradient(ellipse 38% 30% at 8% 12%, hsla(258, 35%, 42%, 0.55), transparent 55%),
       radial-gradient(ellipse 30% 24% at 92% 8%, hsla(240, 30%, 40%, 0.48), transparent 50%),
       radial-gradient(ellipse 50% 44% at 50% 45%, hsla(248, 15%, 46%, 0.50), transparent 65%),
       radial-gradient(ellipse 32% 26% at 75% 70%, hsla(275, 32%, 42%, 0.48), transparent 55%),
       radial-gradient(ellipse 34% 28% at 20% 80%, hsla(245, 28%, 40%, 0.45), transparent 55%),
       radial-gradient(ellipse 26% 22% at 60% 20%, hsla(252, 22%, 44%, 0.40), transparent 50%),
       radial-gradient(ellipse 24% 20% at 35% 65%, hsla(262, 25%, 43%, 0.38), transparent 50%)`
    : `radial-gradient(ellipse 35% 28% at 8% 12%, hsla(245, 60%, 82%, 0.55), transparent 55%),
       radial-gradient(ellipse 28% 22% at 92% 8%, hsla(220, 55%, 84%, 0.45), transparent 50%),
       radial-gradient(ellipse 45% 40% at 50% 45%, hsla(250, 25%, 80%, 0.50), transparent 65%),
       radial-gradient(ellipse 30% 25% at 75% 70%, hsla(265, 50%, 84%, 0.45), transparent 55%),
       radial-gradient(ellipse 32% 28% at 20% 80%, hsla(235, 45%, 83%, 0.42), transparent 55%),
       radial-gradient(ellipse 25% 20% at 60% 20%, hsla(255, 35%, 86%, 0.38), transparent 50%),
       radial-gradient(ellipse 22% 18% at 35% 65%, hsla(240, 40%, 85%, 0.35), transparent 50%)`;

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
