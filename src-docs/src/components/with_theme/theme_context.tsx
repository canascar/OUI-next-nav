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

import React from 'react';
import { OUI_THEMES, OUI_THEME } from '../../../../src/themes';
// @ts-ignore importing from a JS file
import { applyTheme } from '../../services';

const THEME_NAMES = OUI_THEMES.map(({ value }) => value);

// Default to dark. Referenced by value (not array index) so it stays correct
// if the theme list is reordered. Falls back to the last theme if v9-dark ever
// goes away.
const DEFAULT_THEME =
  THEME_NAMES.find((name) => name === 'v9-dark') ??
  THEME_NAMES[THEME_NAMES.length - 1];

const defaultState = {
  theme: DEFAULT_THEME,
  changeTheme: (themeValue: OUI_THEME['value']) => {
    applyTheme(themeValue);
  },
};

interface State {
  theme: OUI_THEME['value'];
}

export const ThemeContext = React.createContext(defaultState);

export class ThemeProvider extends React.Component<object, State> {
  constructor(props: object) {
    super(props);

    let theme = localStorage.getItem('theme');
    if (!theme || !THEME_NAMES.includes(theme)) theme = defaultState.theme;
    applyTheme(theme);

    this.state = {
      theme,
    };
  }

  changeTheme = (themeValue: OUI_THEME['value']) => {
    this.setState({ theme: themeValue }, () => {
      localStorage.setItem('theme', themeValue);
      applyTheme(themeValue);
    });
  };

  render() {
    const { children } = this.props;
    const { theme } = this.state;
    return (
      <ThemeContext.Provider
        value={{
          theme,
          changeTheme: this.changeTheme,
        }}>
        {children}
      </ThemeContext.Provider>
    );
  }
}
