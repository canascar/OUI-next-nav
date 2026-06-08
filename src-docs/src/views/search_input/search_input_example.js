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

import { GuideSectionTypes } from '../../components';

import SearchInputDemo from './search_input_demo';
const searchInputDemoSource = require('!!raw-loader!./search_input_demo');

export const SearchInputExample = {
  title: 'Search input',
  sections: [
    {
      title: 'Search input',
      text: (
        <>
          <p>
            <strong>OuiSearchInput</strong> is a styled text input designed for
            search and AI prompt entry. It features an animated blinking caret
            in the placeholder state, a highlighted keyword segment, and a
            focus-activated bottom border animation with lift effect.
          </p>
          <p>
            The component supports controlled and uncontrolled modes, left/right
            action slots (for buttons like send or attach), and submits on Enter
            (Shift+Enter for new line). When the input is empty, the custom
            animated placeholder is shown instead of the native browser
            placeholder.
          </p>
        </>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: searchInputDemoSource,
        },
      ],
      demo: <SearchInputDemo />,
    },
  ],
};
