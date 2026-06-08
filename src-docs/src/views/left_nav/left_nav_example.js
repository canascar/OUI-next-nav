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

import LeftNavDemo from './left_nav_demo';
const leftNavDemoSource = require('!!raw-loader!./left_nav_demo');

export const LeftNavExample = {
  title: 'Left nav',
  sections: [
    {
      title: 'Left nav',
      text: (
        <p>
          <strong>OuiLeftNav</strong> is a vertical navigation sidebar with
          slots for a logo, navigation items, and footer actions. It provides
          the structural layout for collapsed icon-based navigation.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: leftNavDemoSource,
        },
      ],
      demo: <LeftNavDemo />,
    },
  ],
};
