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

import ThreadScrollDemo from './thread_scroll_demo';
const threadScrollDemoSource = require('!!raw-loader!./thread_scroll_demo');

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
    {
      title: 'Thread scroll',
      text: (
        <p>
          <strong>OuiThreadScrollButton</strong> is a pill-shaped button that
          appears when the user scrolls up in a thread conversation. It provides
          a quick way to scroll back to the latest messages. The button fades in
          when there is overflow content below the visible area and fades out
          when clicked or when the user scrolls to the bottom.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: threadScrollDemoSource,
        },
      ],
      demo: <ThreadScrollDemo />,
    },
  ],
};
