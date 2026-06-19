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
  OuiSearchInput,
  OuiButtonIcon,
  OuiSpacer,
  OuiTitle,
  OuiText,
} from '../../../../src/components';

export default () => {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState([]);

  const handleSubmit = (text) => {
    setSubmitted((prev) => [...prev, text]);
    setValue('');
  };

  return (
    <div>
      <OuiTitle size="xs">
        <h3>Default with blinking caret</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiSearchInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        actionsLeft={
          <OuiButtonIcon
            iconType="plus"
            aria-label="Add attachment"
            size="s"
            color="text"
          />
        }
        actionsRight={
          <OuiButtonIcon
            iconType="sortUp"
            aria-label="Send message"
            display="fill"
            size="s"
            color="primary"
            isDisabled={!value.trim()}
            onClick={() => handleSubmit(value)}
          />
        }
      />

      {submitted.length > 0 && (
        <>
          <OuiSpacer size="m" />
          <OuiText size="s">
            <strong>Submitted:</strong>
            <ul>
              {submitted.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </OuiText>
        </>
      )}

      <OuiSpacer size="xl" />

      <OuiTitle size="xs">
        <h3>Custom placeholder</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiSearchInput
        placeholder="Search dashboards, logs, metrics..."
        placeholderHighlight="dashboards"
      />

      <OuiSpacer size="xl" />

      <OuiTitle size="xs">
        <h3>Disabled</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiSearchInput placeholder="Input is disabled..." isDisabled />
    </div>
  );
};
