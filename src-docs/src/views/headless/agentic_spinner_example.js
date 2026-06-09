/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import AgenticSpinnerDemo from './agentic_spinner_demo';
const agenticSpinnerDemoSource = require('!!raw-loader!./agentic_spinner_demo');

export const AgenticSpinnerExample = {
  title: 'Agentic spinner',
  sections: [
    {
      title: 'Agentic spinner',
      text: (
        <p>
          <strong>OuiAgenticSpinner</strong> is an organic morphing blob animation
          that replaces traditional spinners in agentic AI workflows. Use it for
          thinking states, pre-message loading, or any AI processing indicator.
          Available in three sizes: <code>s</code> (8px), <code>m</code> (12px),
          and <code>l</code> (18px).
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: agenticSpinnerDemoSource,
        },
      ],
      demo: <AgenticSpinnerDemo />,
    },
  ],
};
