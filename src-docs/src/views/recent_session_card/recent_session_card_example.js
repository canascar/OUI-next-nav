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

import { renderToHtml } from '../../services';

import { GuideSectionTypes } from '../../components';

import RecentSessionCard from './recent_session_card';
const recentSessionCardSource = require('!!raw-loader!./recent_session_card');
const recentSessionCardHtml = renderToHtml(RecentSessionCard);

export const RecentSessionCardExample = {
  title: 'Recent session card',
  isNew: true,
  sections: [
    {
      source: [
        {
          type: GuideSectionTypes.JS,
          code: recentSessionCardSource,
        },
        {
          type: GuideSectionTypes.HTML,
          code: recentSessionCardHtml,
        },
      ],
      text: (
        <>
          <p>
            <strong>RecentSessionCard</strong> displays a session summary card
            with title, relative time, an optional AI-generated summary, and tab
            count. Used in the empty session page to show recent sessions.
          </p>
        </>
      ),
      demo: <RecentSessionCard />,
    },
  ],
};
