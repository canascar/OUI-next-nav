/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import InsightCardDemo from './insight_card_demo';
const insightCardDemoSource = require('!!raw-loader!./insight_card_demo');

export const InsightCardExample = {
  title: 'Insight card',
  sections: [
    {
      title: 'Insight card',
      text: (
        <p>
          <strong>OuiInsightCard</strong> is a widget card for displaying
          metrics, charts, tables, or any content in a consistent surface.
          Supports <code>default</code> (solid), <code>glass</code> (frosted),
          and <code>add</code> (dashed placeholder) variants. Use it for
          dashboard widgets, AI-generated summaries, and data visualizations.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: insightCardDemoSource,
        },
      ],
      demo: <InsightCardDemo />,
    },
  ],
};
