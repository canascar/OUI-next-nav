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

import SectionLabelDemo from './section_label_demo';
const sectionLabelDemoSource = require('!!raw-loader!./section_label_demo');

export const SectionLabelExample = {
  title: 'Section label',
  sections: [
    {
      title: 'Section label',
      text: (
        <>
          <p>
            <strong>OuiSectionLabel</strong> is a monospace, uppercase label
            used to annotate content sections with a code-style aesthetic. It
            renders in the v9 code font family (JetBrains Mono) with primary
            color and wide letter-spacing.
          </p>
          <p>
            Use it to label groups of items like activity feeds, findings lists,
            or notification sections. The optional <code>count</code> prop
            displays a zero-padded number after the label text, separated by a
            configurable separator character.
          </p>
        </>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: sectionLabelDemoSource,
        },
      ],
      demo: <SectionLabelDemo />,
    },
  ],
};
