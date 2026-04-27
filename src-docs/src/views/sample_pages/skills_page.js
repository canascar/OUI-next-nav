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

import { OuiText } from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

const ITEM_LABELS = {
  'anomaly-detector': 'Anomaly detector',
  'log-summarizer': 'Log summarizer',
  'root-cause-analysis': 'Root cause analysis',
};

export const SkillsPage = ({ selectedItem, onContinueAsThread }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <DetailPageHeader title={ITEM_LABELS[selectedItem] || 'Skills'} onContinueAsThread={onContinueAsThread} />
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
};
