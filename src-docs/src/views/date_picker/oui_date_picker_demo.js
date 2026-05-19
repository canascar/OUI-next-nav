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

import React, { useState } from 'react';

import {
  OuiDatePickerUnified,
  OuiSpacer,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

export default () => {
  const [start, setStart] = useState('now-15m');
  const [end, setEnd] = useState('now');
  const [lastChange, setLastChange] = useState(null);

  const handleTimeChange = ({ start, end, isQuickSelection, isInvalid }) => {
    setStart(start);
    setEnd(end);
    setLastChange({ start, end, isQuickSelection, isInvalid });
  };

  return (
    <div>
      <OuiTitle size="xs">
        <h3>OuiDatePickerUnified</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiDatePickerUnified
        start={start}
        end={end}
        onTimeChange={handleTimeChange}
      />

      <OuiSpacer size="l" />

      <OuiText size="s">
        <p>
          <strong>Current range:</strong> {start} → {end}
        </p>
        {lastChange && (
          <p>
            <strong>Last change:</strong> {JSON.stringify(lastChange, null, 2)}
          </p>
        )}
      </OuiText>

      <OuiSpacer size="xl" />

      <OuiTitle size="xs">
        <h3>Compressed, no update button</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiDatePickerUnified
        start={start}
        end={end}
        onTimeChange={handleTimeChange}
        compressed
        showUpdateButton={false}
      />

      <OuiSpacer size="xl" />

      <OuiTitle size="xs">
        <h3>Disabled</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiDatePickerUnified
        start={start}
        end={end}
        onTimeChange={handleTimeChange}
        isDisabled
      />
    </div>
  );
};
