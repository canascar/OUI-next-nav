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
          <strong>OuiDatePickerUnified</strong> is a single-screen date range
          picker. The left sidebar lists relative quick-select ranges, the main
          area has From/To inputs with calendar popovers, and a recents list
          tracks previously selected ranges. A timezone dropdown and
          documentation link sit in the footer.
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
