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

import React, { useState } from 'react';

import {
  OuiBasicTable,
  OuiButtonGroup,
  OuiFlexGroup,
  OuiFlexItem,
  OuiIcon,
  OuiLink,
  OuiPanel,
  OuiSpacer,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

// --- Mock Data ---

const TOP_DEPENDENCIES = [
  { service: 'checkout', faultRate: 66.67 },
];

const CORRELATED_LINKS = [
  { label: 'View service attributes', icon: 'inspect' },
  { label: 'View correlated spans', icon: 'document' },
  { label: 'View correlated logs', icon: 'navDiscover' },
];

const STATS = [
  { label: 'Throughput (req/s)', sublabel: null, value: '0.232', change: null },
  { label: 'Fault rate (5xx)', sublabel: 'Avg', value: '11.41%', prev: '10.53%', change: '14.3%', changeDir: 'down', color: 'danger' },
  { label: 'Error rate (4xx)', sublabel: 'Avg', value: '0.00%', prev: '0.00%', change: null, color: null },
  { label: 'Availability', sublabel: 'Avg', value: '88.59%', prev: '89.47%', change: '2.0%', changeDir: 'up', color: 'success' },
  { label: 'Latency (P99)', sublabel: 'Avg', value: '4.95 ms', prev: '4.95 ms', change: null, color: null },
];

const LATENCY_TABS = [
  { id: 'p99', label: 'P99' },
  { id: 'p90', label: 'P90' },
  { id: 'p50', label: 'P50' },
];

// --- Fault Bar ---
const FaultBar = ({ value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
    <div style={{ flex: 1, height: 8, background: '#E4EAF2', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: '#2E4A8F', borderRadius: 4 }} />
    </div>
    <span style={{ fontSize: 12, color: '#5A6D8A', whiteSpace: 'nowrap' }}>{value.toFixed(2)}%</span>
  </div>
);

// --- Latency Chart (simple SVG mock) ---
const LatencyChart = () => {
  const width = 800;
  const height = 160;
  const p99 = 10;
  const p90 = 5.2;
  const p50 = 4.5;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Grid lines */}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <line key={v} x1={0} y1={height - (v / 10) * height} x2={width} y2={height - (v / 10) * height} stroke="#E4EAF2" strokeWidth={1} />
      ))}
      {/* P99 line (red) */}
      <line x1={0} y1={height - (p99 / 10) * height} x2={width} y2={height - (p99 / 10) * height} stroke="#ED6F73" strokeWidth={2} />
      {/* P90 line (yellow) */}
      <line x1={0} y1={height - (p90 / 10) * height} x2={width} y2={height - (p90 / 10) * height} stroke="#CDA849" strokeWidth={2} />
      {/* P50 line (teal) */}
      <line x1={0} y1={height - (p50 / 10) * height} x2={width} y2={height - (p50 / 10) * height} stroke="#5CB198" strokeWidth={2} />
    </svg>
  );
};

// --- Main Component ---
export const ServiceDetailPage = ({ serviceName = 'checkout', onOpenCanvasPage, onQueryExecute }) => {
  const [latencyTab, setLatencyTab] = useState('p99');

  const handleViewCorrelatedLogs = () => {
    if (onOpenCanvasPage) {
      onOpenCanvasPage('discover-log-correlated', 'Correlated Logs: checkout');
    }
    if (onQueryExecute) {
      setTimeout(() => {
        onQueryExecute('source = logs | where service = "checkout" | where status >= 500 | stats count() by message');
      }, 500);
    }
  };

  const depColumns = [
    { field: 'service', name: 'Dependency service', render: (name) => <OuiLink href="#" onClick={(e) => e.preventDefault()}>{name}</OuiLink> },
    { field: 'faultRate', name: 'Fault rate', render: (val) => <FaultBar value={val} /> },
  ];

  return (
    <div className="mockCanvasPage">
        {/* Top row: Dependencies + Correlated data */}
        <OuiFlexGroup gutterSize="l">
          <OuiFlexItem grow={3}>
            <OuiPanel hasBorder hasShadow={false} paddingSize="m">
              <OuiTitle size="xs"><h3>Top dependencies by fault rate</h3></OuiTitle>
              <OuiSpacer size="s" />
              <OuiBasicTable items={TOP_DEPENDENCIES} columns={depColumns} tableLayout="auto" compressed />
            </OuiPanel>
          </OuiFlexItem>
          <OuiFlexItem grow={1}>
            <OuiPanel hasBorder hasShadow={false} paddingSize="m">
              <OuiTitle size="xs"><h3>Correlated data</h3></OuiTitle>
              <OuiSpacer size="s" />
              {CORRELATED_LINKS.map((link) => (
                <div key={link.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <OuiIcon type={link.icon} size="m" color="primary" />
                  <OuiLink href="#" onClick={(e) => {
                    e.preventDefault();
                    if (link.label === 'View correlated logs') handleViewCorrelatedLogs();
                  }}>{link.label}</OuiLink>
                </div>
              ))}
            </OuiPanel>
          </OuiFlexItem>
        </OuiFlexGroup>

        <OuiSpacer size="l" />

        {/* Stats row */}
        <OuiFlexGroup gutterSize="m">
          {STATS.map((stat) => (
            <OuiFlexItem key={stat.label}>
              <OuiPanel hasBorder hasShadow={false} paddingSize="m" style={{ textAlign: 'center' }}>
                <OuiText size="xs" color="subdued">
                  <p style={{ margin: 0 }}>{stat.label} {stat.sublabel && <span>· {stat.sublabel}</span>}</p>
                </OuiText>
                <OuiSpacer size="s" />
                <OuiTitle size="m">
                  <span style={{ color: stat.color === 'danger' ? '#ED6F73' : stat.color === 'success' ? '#5CB198' : undefined }}>
                    {stat.value}
                  </span>
                </OuiTitle>
                {stat.prev && (
                  <OuiText size="xs" color="subdued">
                    <span>{stat.prev}</span>
                    {stat.change && (
                      <span style={{ marginLeft: 4, color: stat.color === 'danger' ? '#ED6F73' : '#5CB198' }}>
                        {stat.changeDir === 'down' ? '↓' : '↑'} {stat.change}
                      </span>
                    )}
                  </OuiText>
                )}
              </OuiPanel>
            </OuiFlexItem>
          ))}
        </OuiFlexGroup>

        <OuiSpacer size="l" />

        {/* Latency chart */}
        <OuiPanel hasBorder hasShadow={false} paddingSize="m">
          <OuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <OuiFlexItem grow={false}>
              <OuiTitle size="xs"><h3>Latency by dependencies</h3></OuiTitle>
            </OuiFlexItem>
            <OuiFlexItem grow={false}>
              <OuiButtonGroup
                legend="Latency percentile"
                options={LATENCY_TABS}
                idSelected={latencyTab}
                onChange={(id) => setLatencyTab(id)}
                buttonSize="compressed"
              />
            </OuiFlexItem>
          </OuiFlexGroup>
          <OuiSpacer size="m" />
          <div style={{ position: 'relative' }}>
            {/* Y-axis labels */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 50, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: '#5A6D8A' }}>
              <span>10.00 ms</span>
              <span>8.00 ms</span>
              <span>6.00 ms</span>
              <span>4.00 ms</span>
              <span>2.00 ms</span>
              <span>0</span>
            </div>
            <div style={{ marginLeft: 55 }}>
              <LatencyChart />
            </div>
          </div>
        </OuiPanel>
    </div>
  );
};
