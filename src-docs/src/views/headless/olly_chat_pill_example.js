/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import OllyChatPillDemo from './olly_chat_pill_demo';
const ollyChatPillDemoSource = require('!!raw-loader!./olly_chat_pill_demo');

export const OllyChatPillExample = {
  title: 'Olly chat pill',
  sections: [
    {
      title: 'Olly chat pill',
      text: (
        <p>
          <strong>OuiOllyChatPill</strong> is a floating chat input pill with
          an avatar, borderless text input, and optional proactive message.
          It expands on focus, shows a primary border when active, and lifts
          on hover. Use it as a persistent entry point for AI chat in any page.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: ollyChatPillDemoSource,
        },
      ],
      demo: <OllyChatPillDemo />,
    },
  ],
};
