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

const themes = {};

export function registerTheme(theme, cssFiles) {
  themes[theme] = cssFiles;
}

export function applyTheme(newTheme) {
  // Apply new theme first, then remove old ones to avoid a flash of unstyled content
  themes[newTheme].forEach((cssFile) => cssFile.use());
  Object.keys(themes).forEach((theme) => {
    if (theme !== newTheme) {
      themes[theme].forEach((cssFile) => cssFile.unuse());
    }
  });
}
