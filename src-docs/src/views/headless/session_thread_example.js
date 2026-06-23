/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import SessionThreadDemo from './session_thread_demo';
const sessionThreadDemoSource = require('!!raw-loader!./session_thread_demo');

export const SessionThreadExample = {
  title: 'Session thread',
  sections: [
    {
      title: 'Session thread',
      text: (
        <p>
          The <strong>Session Thread</strong> pattern defines the response
          choreography for AI chat interactions. It coordinates the Olly mascot,
          the agentic blob spinner for loading steps, and character-by-character
          text streaming to create a conversational feel. Steps use the blob,
          text responses use Olly. Olly&apos;s expression changes per state:{' '}
          <code>blink</code> while waiting, <code>dot</code> while speaking,{' '}
          <code>wink</code> when done. In idle state, hovering shows a random
          tooltip and clicking triggers a heart expression.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: sessionThreadDemoSource,
        },
      ],
      demo: <SessionThreadDemo />,
    },
  ],
};
