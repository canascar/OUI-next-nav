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

import OuiDatePickerDemo from './oui_date_picker_demo';
const ouiDatePickerDemoSource = require('!!raw-loader!./oui_date_picker_demo');

export const DatePickerUnifiedExample = {
  title: 'Date Picker Unified',
  sections: [
    {
      title: 'Unified date picker',
      text: (
        <p>
          <strong>OuiDatePickerUnified</strong> is a simplified date range
          picker that combines quick select, absolute, relative, and now options
          into a single popover with tabs.
        </p>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: ouiDatePickerDemoSource,
        },
      ],
      demo: <OuiDatePickerDemo />,
    },
  ],
};
