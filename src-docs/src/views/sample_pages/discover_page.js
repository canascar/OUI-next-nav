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

import { OuiButton, OuiTitle } from '../../../../src/components';

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
          <OuiButton iconType="refresh" size="s">
            Refresh
          </OuiButton>
          <OuiButton iconType="generate" size="s">
            Ask AI
          </OuiButton>
        </div>
      </div>
    </div>
  );
};
