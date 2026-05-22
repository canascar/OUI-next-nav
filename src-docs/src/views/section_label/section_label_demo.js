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

import {
  OuiSectionLabel,
  OuiSpacer,
  OuiTitle,
  OuiFlexGroup,
  OuiFlexItem,
} from '../../../../src/components';

export default () => {
  return (
    <div>
      <OuiTitle size="xs">
        <h3>With count</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiSectionLabel count={2}>ACTIVITY</OuiSectionLabel>

      <OuiSpacer size="xl" />

      <OuiTitle size="xs">
        <h3>Without count</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiSectionLabel>RECENT SESSIONS</OuiSectionLabel>

      <OuiSpacer size="xl" />

      <OuiTitle size="xs">
        <h3>Custom prefix and separator</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiFlexGroup gutterSize="l" direction="column">
        <OuiFlexItem grow={false}>
          <OuiSectionLabel prefix="#" separator="·" count={12}>
            ALERTS
          </OuiSectionLabel>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiSectionLabel prefix="→" count={5}>
            FINDINGS
          </OuiSectionLabel>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiSectionLabel prefix="" count={0}>
            NOTIFICATIONS
          </OuiSectionLabel>
        </OuiFlexItem>
      </OuiFlexGroup>
    </div>
  );
};
