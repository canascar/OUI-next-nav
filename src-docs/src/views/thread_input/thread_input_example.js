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

import ThreadInputDemo from './thread_input_demo';
const threadInputDemoSource = require('!!raw-loader!./thread_input_demo');

export const ThreadInputExample = {
  title: 'Thread input',
  sections: [
    {
      title: 'Thread input',
      text: (
        <p>
          <strong>OuiThreadInput</strong> is a chat-style input component with
          a multi-line textarea and action buttons. It supports keyboard
          submission (Enter to send, Shift+Enter for new line), configurable
          placeholder text, and left/right action slots for buttons like
          attachments and send.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: threadInputDemoSource,
        },
      ],
      demo: <ThreadInputDemo />,
    },
  ],
};
