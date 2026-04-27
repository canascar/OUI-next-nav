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
  'cpu-threshold': 'CPU threshold exceeded',
  'disk-usage': 'Disk usage warning',
  'error-rate-spike': 'Error rate spike',
  'uptime-monitor': 'Uptime monitor',
  'latency-monitor': 'Latency threshold',
  'log-volume-monitor': 'Log volume spike',
  'slack-ops': 'Slack #ops-alerts',
  'pagerduty-critical': 'PagerDuty critical',
  'email-oncall': 'On-call email group',
};

export const AlertsPage = ({ selectedItem, onContinueAsThread }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <DetailPageHeader title={ITEM_LABELS[selectedItem] || 'Alerts'} onContinueAsThread={onContinueAsThread} />
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
