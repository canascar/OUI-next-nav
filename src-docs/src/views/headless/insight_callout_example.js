/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import InsightCalloutDemo from './insight_callout_demo';
const insightCalloutDemoSource = require('!!raw-loader!./insight_callout_demo');

export const InsightCalloutExample = {
  title: 'Insight callout',
  sections: [
    {
      title: 'Insight callout',
      text: (
        <p>
          <strong>OuiInsightCallout</strong> is a severity-railed callout for
          AI-generated insights, alerts, and investigation threads. The left
          border color indicates severity: <code>default</code> (indigo),{' '}
          <code>warning</code> (amber), <code>danger</code> (red),{' '}
          <code>success</code> (green), <code>info</code> (blue). Use it for
          proactive notifications, investigation links, and agent findings.
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
