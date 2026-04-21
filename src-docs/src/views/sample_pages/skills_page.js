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
  OuiButtonIcon,
  OuiFlexGroup,
  OuiFlexItem,
  OuiTitle,
  OuiText,
  OuiToolTip,
} from '../../../../src/components';

const ITEM_LABELS = {
  'anomaly-detector': 'Anomaly detector',
  'log-summarizer': 'Log summarizer',
  'root-cause-analysis': 'Root cause analysis',
};

export const SkillsPage = ({ selectedItem }) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
    <div
      className="skillsPage__header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
      }}>
      <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
        <OuiFlexItem grow={false}>
          <OuiTitle size="s">
            <h1 style={{ margin: 0 }}>
              {ITEM_LABELS[selectedItem] || 'Skills'}
            </h1>
          </OuiTitle>
        </OuiFlexItem>
      </OuiFlexGroup>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <OuiToolTip content="Edit" position="bottom">
          <OuiButtonIcon
            iconType="pencil"
            aria-label="Edit"
            size="s"
            color="text"
          />
        </OuiToolTip>
        <div style={{ width: 1, height: 16, backgroundColor: '#D3DAE6' }} />
        <OuiToolTip content="Share" position="bottom">
          <OuiButtonIcon
            iconType="share"
            aria-label="Share"
            size="s"
            color="text"
          />
        </OuiToolTip>
        <div style={{ width: 1, height: 16, backgroundColor: '#D3DAE6' }} />
        <OuiToolTip content="Ask AI" position="bottom">
          <OuiButtonIcon
            iconType="generate"
            aria-label="Ask AI"
            size="s"
            color="text"
          />
        </OuiToolTip>
      </div>
    </div>
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <OuiText color="subdued" textAlign="center">
        <p>Detail view will appear here.</p>
      </OuiText>
    </div>
  </div>
);
