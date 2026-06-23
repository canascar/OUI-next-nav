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
  OuiBasicTable,
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
  OuiSpacer,
  OuiText,
  OuiTitle,
  OuiHealth,
  OuiBadge,
} from '../../../../src/components';

// --- Mock Data ---

const OVERVIEW_FIELDS = [
  { label: 'Monitor type', value: 'Per cluster metrics monitor' },
  { label: 'Index', value: 'opensearch-cluster' },
  { label: 'Schedule', value: 'Every 1 minutes' },
  { label: 'Last updated', value: '05/19/2026 6:27 pm PDT' },
];

const ALERTS = [
  {
    id: '1',
    startTime: '05/19/26 12:38 am',
    endTime: '—',
    triggerName: 'payments-db-latency-trigger',
    severity: '1',
    state: 'Active',
    acknowledged: '—',
    clusters: 'opensearch-cluster',
  },
];

const HISTORY_TIMES = [
  '02:15',
  '02:20',
  '02:25',
  '02:30',
  '02:35',
  '02:40',
  '02:45',
  '02:50',
  '02:55',
  '03:00',
  '03:05',
  '03:10',
];

// --- History Chart (simple SVG) ---
const HistoryChart = () => (
  <div>
    {/* Trigger timeline */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
      }}>
      <span
        style={{ fontSize: 12, color: '#5A6D8A', width: 140, flexShrink: 0 }}>
        payments-db-latency-trigger
      </span>
      <div
        style={{ flex: 1, height: 6, background: '#ED6F73', borderRadius: 3 }}
      />
    </div>
    {/* Time axis */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: 152,
        fontSize: 11,
        color: '#5A6D8A',
      }}>
      {HISTORY_TIMES.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
    <OuiSpacer size="s" />
    {/* Bar chart placeholder */}
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2,
        height: 60,
        paddingLeft: 152,
      }}>
      {Array.from({ length: 48 }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: i === 47 ? 60 : 2,
            background: i === 47 ? '#5A6D8A' : '#E4EAF2',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
    {/* Date axis */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: 152,
        fontSize: 11,
        color: '#5A6D8A',
        marginTop: 4,
      }}>
      <span>Tue 19</span>
      <span>03 AM</span>
      <span>06 AM</span>
      <span>09 AM</span>
      <span>12 PM</span>
      <span>03 PM</span>
      <span>06 PM</span>
      <span>09 PM</span>
      <span>Wed 20</span>
      <span>03 AM</span>
      <span>06 AM</span>
    </div>
    <OuiSpacer size="s" />
    {/* Legend */}
    <OuiFlexGroup gutterSize="m" responsive={false}>
      <OuiFlexItem grow={false}>
        <OuiHealth color="danger">Triggered</OuiHealth>
      </OuiFlexItem>
      <OuiFlexItem grow={false}>
        <OuiHealth color="#5A6D8A">Error</OuiHealth>
      </OuiFlexItem>
      <OuiFlexItem grow={false}>
        <OuiHealth color="warning">Acknowledge</OuiHealth>
      </OuiFlexItem>
      <OuiFlexItem grow={false}>
        <OuiHealth color="success">No alerts</OuiHealth>
      </OuiFlexItem>
    </OuiFlexGroup>
  </div>
);

// --- Main Component ---
export const AlertRulePage = () => {
  const alertColumns = [
    { field: 'startTime', name: 'Alert start time', sortable: true },
    { field: 'endTime', name: 'Alert end time' },
    { field: 'triggerName', name: 'Trigger name' },
    { field: 'severity', name: 'Severity' },
    {
      field: 'state',
      name: 'State',
      render: (state) => (
        <OuiBadge color={state === 'Active' ? 'danger' : 'default'}>
          {state}
        </OuiBadge>
      ),
    },
    { field: 'acknowledged', name: 'Time acknowledged' },
    { field: 'clusters', name: 'Triggered clusters' },
  ];

  return (
    <div className="mockCanvasPage">
      {/* Overview */}
      <OuiPanel hasBorder hasShadow={false} paddingSize="m">
        <OuiTitle size="xs">
          <h3>Overview</h3>
        </OuiTitle>
        <OuiSpacer size="s" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px 24px',
          }}>
          {OVERVIEW_FIELDS.map((field) => (
            <div key={field.label}>
              <OuiText size="xs" color="subdued">
                <strong>{field.label}</strong>
              </OuiText>
              <OuiText size="s">{field.value}</OuiText>
            </div>
          ))}
        </div>
      </OuiPanel>

      <OuiSpacer size="l" />

      {/* Alert history */}
      <OuiPanel hasBorder hasShadow={false} paddingSize="m">
        <OuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <OuiFlexItem grow={false}>
            <OuiTitle size="xs">
              <h3>Alert history</h3>
            </OuiTitle>
          </OuiFlexItem>
          <OuiFlexItem grow={false}>
            <OuiText size="xs" color="subdued">
              05/19/2026 12:00 AM → 05/21/2026 03:14 PM
            </OuiText>
          </OuiFlexItem>
        </OuiFlexGroup>
        <OuiSpacer size="m" />
        <HistoryChart />
        <OuiSpacer size="m" />
        <OuiBasicTable
          items={ALERTS}
          columns={alertColumns}
          tableLayout="auto"
          compressed
        />
        <OuiSpacer size="s" />
        <OuiText size="xs" color="subdued">
          Rows per page: 20
        </OuiText>
      </OuiPanel>
    </div>
  );
};
