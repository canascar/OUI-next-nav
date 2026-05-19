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
    title: 'Error Rate Spike',
    description: 'Thread · 2 hours ago',
    iconType: 'alert',
    status: 'Report is ready',
    statusTextColor: 'primary',
    onClick: () => {},
  },
  {
    title: 'Health check, Apr 11',
    description: 'Automation · 2:00 AM',
    iconType: 'clock',
    status: 'Requires approval',
    statusTextColor: 'warning',
    onClick: () => {},
  },
  {
    title: 'Orchestrator misroute',
    description: 'Investigation · 2 hours ago',
    iconType: 'sparkles',
    status: 'Report is ready',
    statusTextColor: 'primary',
    onClick: () => {},
  },
];

export default () => (
  <OuiThreadList items={items} bordered />
);
