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
  'web-server-fleet': 'Web server fleet',
  'payment-gateway': 'Payment gateway',
  'data-pipeline': 'Data pipeline cluster',
  'region-latency-map': 'Region latency map',
  'traffic-origin-map': 'Traffic origin map',
  'cdn-coverage-map': 'CDN coverage map',
};

export const AssetsPage = ({ selectedItem, onContinueAsThread }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <DetailPageHeader
        title={ITEM_LABELS[selectedItem] || 'Assets'}
        onContinueAsThread={onContinueAsThread}
      />
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
