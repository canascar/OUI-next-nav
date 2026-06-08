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

import BrandGradientDemo from './brand_gradient_demo';
const brandGradientDemoSource = require('!!raw-loader!./brand_gradient_demo');

export const BrandGradientExample = {
  title: 'Brand gradient',
  sections: [
    {
      title: 'Brand gradient backgrounds',
      text: (
        <p>
          <strong>OuiBrandGradient</strong> provides branded gradient
          backgrounds using the Glass theme&apos;s indigo/violet corner blobs. It supports three
          variants: <code>subtle</code> for ambient page backgrounds,{' '}
          <code>vivid</code> for hero sections and login pages, and{' '}
          <code>radial</code> for focused centered layouts. Each variant
          adapts to light and dark mode.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: brandGradientDemoSource,
        },
      ],
      demo: <BrandGradientDemo />,
    },
  ],
};
