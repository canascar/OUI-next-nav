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
  OuiTitle,
  OuiToolTip,
} from '../../../../src/components';

const QUERY_TITLES = {
  'error-rate': 'Error rate by service',
  'latency-percentiles': 'Latency percentiles',
  throughput: 'Throughput over time',
};

export const DiscoverPage = ({ selectedItem }) => {
  const headerTitle =
    selectedItem && QUERY_TITLES[selectedItem]
      ? QUERY_TITLES[selectedItem]
      : 'Discover';

  return (
    <div
      style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        className="discoverPage__header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
        }}>
        <OuiTitle size="s">
          <h1 style={{ margin: 0 }}>{headerTitle}</h1>
        </OuiTitle>
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
    </div>
  );
};
