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

import { OuiThreadList } from '../../../../src/components';

const items = [
  {
    title: 'Auto-scaling triggered for Catalog service - 3 new instances',
    description: 'test-domain | os688a',
    statusColor: '#7dd3fc',
    meta: '2h 24m ago',
    metaSecondary: 'May 8, 2026 @ 08:03:04',
    onClick: () => {},
  },
  {
    title: 'Kubernetes pod restart detected for auth-proxy in us-east-1',
    description: 'otel-domain | os219',
    statusColor: '#10B981',
    meta: '3h ago',
    metaSecondary: 'May 8, 2026 @ 07:27:04',
    onClick: () => {},
  },
  {
    title: 'Memory leak pattern detected in NotificationWorker',
    description: 'os-domain | dd76-x5',
    statusColor: '#FF6467',
    meta: '3h 20m ago',
    metaSecondary: 'May 8, 2026 @ 07:07:04',
    onClick: () => {},
  },
  {
    title: 'Cache hit ratio dropped below 70% on Redis cluster-3',
    description: 'os233 | os688a',
    statusColor: '#FBBF24',
    meta: '4h 50m ago',
    metaSecondary: 'May 8, 2026 @ 05:37:04',
    onClick: () => {},
  },
];

export default () => <OuiThreadList items={items} flush />;
