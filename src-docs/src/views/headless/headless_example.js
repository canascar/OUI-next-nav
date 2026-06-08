/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import InsightCardDemo from './insight_card_demo';
const insightCardDemoSource = require('!!raw-loader!./insight_card_demo');

import InsightCalloutDemo from './insight_callout_demo';
const insightCalloutDemoSource = require('!!raw-loader!./insight_callout_demo');

export const HeadlessExample = {
  title: 'Headless',
  intro: (
    <p>
      Headless components are agentic UI primitives designed for AI-driven
      interfaces — dashboards, investigation flows, and proactive insights.
    </p>
  ),
  sections: [
    {
      title: 'Insight card',
      text: (
        <p>
          <strong>OuiInsightCard</strong> is a widget card for displaying
          metrics, charts, tables, or any content in a consistent surface.
          Supports <code>default</code> (solid), <code>glass</code> (frosted),
          and <code>add</code> (dashed placeholder) variants.
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
    {
      title: 'Insight callout',
      text: (
        <p>
          <strong>OuiInsightCallout</strong> is a severity-railed callout for
          AI-generated insights, alerts, and investigation threads. The left
          border color indicates severity: <code>default</code> (indigo),{' '}
          <code>warning</code> (amber), <code>danger</code> (red),{' '}
          <code>success</code> (green), <code>info</code> (blue).
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: insightCalloutDemoSource,
        },
      ],
      demo: <InsightCalloutDemo />,
    },
  ],
};
