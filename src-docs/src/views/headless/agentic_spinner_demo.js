/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import {
  OuiAgenticSpinner,
  OuiFlexGroup,
  OuiFlexItem,
  OuiSpacer,
  OuiText,
} from '../../../../src/components';

export default () => {
  return (
    <div>
      <OuiText size="s">
        <p>The agentic spinner is an organic morphing blob that communicates AI thinking or processing states. Use it in place of a traditional spinner for agentic workflows.</p>
      </OuiText>
      <OuiSpacer size="l" />

      <OuiFlexGroup alignItems="center" gutterSize="xl">
        <OuiFlexItem grow={false}>
          <OuiText size="xs"><p>Small</p></OuiText>
          <OuiSpacer size="s" />
          <OuiAgenticSpinner size="s" />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiText size="xs"><p>Medium (default)</p></OuiText>
          <OuiSpacer size="s" />
          <OuiAgenticSpinner size="m" />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiText size="xs"><p>Large</p></OuiText>
          <OuiSpacer size="s" />
          <OuiAgenticSpinner size="l" />
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <p>Inline usage — the spinner works inline with text for streaming or typing indicators:</p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiText>
        <p>Thinking <OuiAgenticSpinner size="s" /></p>
      </OuiText>
    </div>
  );
};
