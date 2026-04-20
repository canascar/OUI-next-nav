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
  OuiTitle,
  OuiSpacer,
  OuiPanel,
  OuiBasicTable,
  OuiBadge,
} from '../../../../src/components';

const LOGS = [
  {
    id: 'frontend-proxy',
    timestamp: '2026-04-20T10:32:15Z',
    level: 'ERROR',
    service: 'frontend-proxy',
    message:
      '502 Bad Gateway — upstream connect error or disconnect/reset before headers',
  },
  {
    id: 'checkout',
    timestamp: '2026-04-20T10:28:44Z',
    level: 'WARN',
    service: 'checkout',
    message: 'Connection timeout to payment-service after 30000ms',
  },
  {
    id: 'recommendation',
    timestamp: '2026-04-20T10:15:02Z',
    level: 'INFO',
    service: 'recommendation',
    message: 'Model refresh completed successfully in 1.2s',
  },
];

const columns = [
  {
    field: 'timestamp',
    name: 'Timestamp',
    render: (ts) => new Date(ts).toLocaleString(),
    width: '200px',
  },
  {
    field: 'level',
    name: 'Level',
    width: '100px',
    render: (level) => {
      const colorMap = { ERROR: 'danger', WARN: 'warning' };
      const color = colorMap[level] || 'default';
      return <OuiBadge color={color}>{level}</OuiBadge>;
    },
  },
  { field: 'service', name: 'Service', width: '160px' },
  { field: 'message', name: 'Message' },
];

export const DiscoverPage = ({ selectedItem }) => {
  const items = selectedItem
    ? LOGS.filter((log) => log.id === selectedItem)
    : LOGS;
  const title = selectedItem
    ? LOGS.find((log) => log.id === selectedItem)?.service || 'Discover'
    : 'Recent logs';

  return (
    <div style={{ padding: 16, minHeight: '100%' }}>
      <OuiTitle size="s">
        <h1>Discover</h1>
      </OuiTitle>
      <OuiSpacer size="m" />
      <OuiPanel paddingSize="m">
        <OuiTitle size="xs">
          <h3>{title}</h3>
        </OuiTitle>
        <OuiSpacer size="s" />
        <OuiBasicTable items={items} columns={columns} rowHeader="service" />
      </OuiPanel>
    </div>
  );
};
