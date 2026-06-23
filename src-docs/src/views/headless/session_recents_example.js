/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import SessionRecentsDemo from './session_recents_demo';
const sessionRecentsDemoSource = require('!!raw-loader!./session_recents_demo');

export const SessionRecentsExample = {
  title: 'Session recents',
  sections: [
    {
      title: 'Session recents',
      text: (
        <p>
          <strong>OuiSessionRecents</strong> displays a list of recent session
          items with a dock-magnification hover effect, mouse-down squish,
          separator fading, and an animated arrow indicator. Use it for AI
          investigation threads, recent alerts, or any clickable item list.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: sessionRecentsDemoSource,
        },
      ],
      demo: <SessionRecentsDemo />,
    },
  ],
};
