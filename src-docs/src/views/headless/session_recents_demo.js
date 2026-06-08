/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import { OuiSessionRecents } from '../../../../src/components';

const ITEMS = [
  {
    key: 'latency',
    title: 'Payment service P99 latency breach',
    description: 'P99 crossed 2,000ms with connection pool exhaustion on 3 of 4 pods.',
    meta: 'Created by AI · 15 min ago',
  },
  {
    key: 'error-rate',
    title: 'Error Rate Spike — Checkout Service',
    description: 'Checkout error rate spiked to 12.4%. Auth-service deployment regression identified.',
    meta: 'Shared by team · 2 hours ago',
  },
  {
    key: 'dns',
    title: 'DNS Resolution Timeout',
    description: 'Resolved after the upstream fix was deployed. No further action needed.',
    meta: 'Resolved · 3 hours ago',
  },
];

export default () => (
  <div style={{ maxWidth: 640 }}>
    <OuiSessionRecents
      title="Recent"
      items={ITEMS}
      onItemClick={(key) => alert(`Clicked: ${key}`)}
    />
  </div>
);
