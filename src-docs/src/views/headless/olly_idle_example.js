/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { GuideSectionTypes } from '../../components';

import OllyIdleDemo from './olly_idle_demo';
const ollyIdleDemoSource = require('!!raw-loader!./olly_idle_demo');

export const OllyIdleExample = {
  title: 'Olly idle',
  sections: [
    {
      title: 'Olly idle',
      text: (
        <p>
          <strong>OllyIdle</strong> is the reusable idle-state mascot component.
          It encapsulates all resting behavior: wink on mount, idle cycling,
          hover → happy, mouseDown → heart + squish, and a random tooltip.
          Use it anywhere Olly needs to sit in a resting/ready state — below
          chat responses, in empty states, or as a persistent presence indicator.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: ollyIdleDemoSource,
        },
      ],
      demo: <OllyIdleDemo />,
    },
  ],
};
