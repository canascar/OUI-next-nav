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
  OuiAccordion,
  OuiCompressedSuperDatePicker,
  OuiFieldSearch,
  OuiBasicTable,
  OuiFlexGroup,
  OuiFlexItem,
  OuiSpacer,
  OuiHealth,
  OuiLink,
  OuiPanel,
  OuiTitle,
  OuiText,
  OuiCheckboxGroup,
  OuiDualRange,
  OuiHorizontalRule,
  OuiButtonEmpty,
  OuiButton,
  OuiButtonGroup,
  OuiProgress,
  OuiToolTip,
  OuiButtonIcon,
} from '../../../../src/components';

// --- Mock Data ---

const SERVICES = [
  {
    id: '1',
    name: 'cart',
    latency: 5,
    throughput: 50,
    failureRatio: 0.0,
    environment: 'generic',
    status: 'healthy',
  },
  {
    id: '2',
    name: 'checkout',
    latency: 443,
    throughput: 9,
    failureRatio: 58.8,
    environment: 'generic',
    status: 'danger',
  },
  {
    id: '3',
    name: 'flagd',
    latency: 5,
    throughput: 42,
    failureRatio: 24.5,
    environment: 'generic',
    status: 'warning',
  },
  {
    id: '4',
    name: 'frontend',
    latency: 5,
    throughput: 310,
    failureRatio: 55.2,
    environment: 'generic',
    status: 'danger',
  },
  {
    id: '5',
    name: 'frontend-proxy',
    latency: 5,
    throughput: 236,
    failureRatio: 58.6,
    environment: 'generic',
    status: 'danger',
  },
  {
    id: '6',
    name: 'image-provider',
    latency: 0,
    throughput: 30,
    failureRatio: 0.0,
    environment: 'generic',
    status: 'healthy',
  },
  {
    id: '7',
    name: 'product-reviews',
    latency: 25,
    throughput: 9,
    failureRatio: 0.0,
    environment: 'generic',
    status: 'healthy',
  },
  {
    id: '8',
    name: 'recommendation',
    latency: 5,
    throughput: 15,
    failureRatio: 0.0,
    environment: 'generic',
    status: 'healthy',
  },
];

const TOP_FAULT_SERVICES = [
  { service: 'frontend-proxy', faultRate: 58.62 },
  { service: 'checkout', faultRate: 58.45 },
  { service: 'frontend', faultRate: 55.03 },
  { service: 'flagd', faultRate: 24.49 },
];

const TOP_DEPENDENCY_PATHS = [
  { depService: 'checkout', service: 'frontend', faultRate: 100.0 },
  { depService: 'recommendation', service: 'frontend', faultRate: 100.0 },
  { depService: 'frontend', service: 'frontend-proxy', faultRate: 57.53 },
  { depService: 'product-reviews', service: 'frontend', faultRate: 47.06 },
];

const ENV_OPTIONS = [
  { id: 'generic', label: 'generic' },
  { id: 'eks', label: 'EKS' },
  { id: 'ecs', label: 'ECS' },
  { id: 'ec2', label: 'EC2' },
  { id: 'lambda', label: 'Lambda' },
];

const LANGUAGE_OPTIONS = [
  { id: 'cpp', label: 'cpp' },
  { id: 'dotnet', label: 'dotnet' },
  { id: 'go', label: 'go' },
  { id: 'nodejs', label: 'nodejs' },
  { id: 'python', label: 'python' },
];

const LATENCY_TABS = [
  { id: 'p99', label: 'P99' },
  { id: 'p90', label: 'P90' },
  { id: 'p50', label: 'P50' },
];

// --- Sparkline placeholder (simple inline SVG) ---

const Sparkline = ({
  values,
  className = 'servicePage__sparkline--primary',
}) => {
  const max = Math.max(...values, 1);
  const width = 60;
  const height = 20;
  const points = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * width},${height - (v / max) * height}`
    )
    .join(' ');
  return (
    <svg width={width} height={height} style={{ verticalAlign: 'middle' }}>
      <polyline
        fill="none"
        className={className}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
};

// Simple bar for fault rate visualization
const FaultBar = ({ value, max = 100 }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <OuiProgress
        value={value}
        max={max}
        size="m"
        // eslint-disable-next-line no-nested-ternary
        color={value > 50 ? 'danger' : value > 20 ? 'warning' : 'success'}
        style={{ width: 120 }}
      />
      <OuiText size="xs">
        <span>{value.toFixed(2)}%</span>
      </OuiText>
    </div>
  );
};

// --- Filter Sidebar ---

const FilterSidebar = () => {
  const [envSelection, setEnvSelection] = useState([]);
  const [latencyRange, setLatencyRange] = useState(['4', '443']);
  const [throughputRange, setThroughputRange] = useState(['8', '310']);
  const [langSelection, setLangSelection] = useState([]);

  return (
    <OuiPanel
      paddingSize="m"
      style={{ width: 200, minWidth: 200, flexShrink: 0 }}>
      <OuiTitle size="xxs">
        <h3>Filters</h3>
      </OuiTitle>
      <OuiSpacer size="m" />

      <OuiAccordion
        id="filter-environment"
        buttonContent="Environment"
        initialIsOpen>
        <OuiSpacer size="xs" />
        <OuiCheckboxGroup
          options={ENV_OPTIONS}
          idToSelectedMap={envSelection.reduce(
            (acc, id) => ({ ...acc, [id]: true }),
            {}
          )}
          onChange={(id) =>
            setEnvSelection((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          compressed
        />
      </OuiAccordion>

      <OuiSpacer size="s" />

      <OuiAccordion id="filter-latency" buttonContent="Latency" initialIsOpen>
        <OuiSpacer size="xs" />
        <OuiDualRange
          min={0}
          max={500}
          value={latencyRange}
          onChange={setLatencyRange}
          showInput={false}
          compressed
          aria-label="Latency range"
        />
        <OuiText size="xs" color="subdued">
          <p>
            {latencyRange[0]}ms – {latencyRange[1]}ms
          </p>
        </OuiText>
      </OuiAccordion>

      <OuiSpacer size="s" />

      <OuiAccordion
        id="filter-throughput"
        buttonContent="Throughput"
        initialIsOpen>
        <OuiSpacer size="xs" />
        <OuiDualRange
          min={0}
          max={400}
          value={throughputRange}
          onChange={setThroughputRange}
          showInput={false}
          compressed
          aria-label="Throughput range"
        />
        <OuiText size="xs" color="subdued">
          <p>
            {throughputRange[0]} req/int – {throughputRange[1]} req/int
          </p>
        </OuiText>
      </OuiAccordion>

      <OuiSpacer size="s" />

      <OuiAccordion
        id="filter-failure-ratio"
        buttonContent="Failure ratio"
        initialIsOpen>
        <OuiSpacer size="xs" />
        <OuiHealth color="success">{'< 1%'}</OuiHealth>
        <OuiHealth color="warning">1-5%</OuiHealth>
        <OuiHealth color="danger">{'> 5%'}</OuiHealth>
      </OuiAccordion>

      <OuiSpacer size="m" />
      <OuiHorizontalRule margin="s" />
      <OuiTitle size="xxxs">
        <h4>Attributes</h4>
      </OuiTitle>
      <OuiSpacer size="xs" />
      <OuiText size="xs" color="subdued">
        <p>telemetry.sdk.language</p>
      </OuiText>
      <OuiSpacer size="xs" />
      <OuiFieldSearch
        placeholder="Search"
        compressed
        aria-label="Search attributes"
      />
      <OuiSpacer size="xs" />
      <OuiFlexGroup gutterSize="xs" responsive={false}>
        <OuiFlexItem grow={false}>
          <OuiButtonEmpty size="xs" flush="left">
            Select all
          </OuiButtonEmpty>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiButtonEmpty size="xs" flush="left">
            Clear all
          </OuiButtonEmpty>
        </OuiFlexItem>
      </OuiFlexGroup>
      <OuiCheckboxGroup
        options={LANGUAGE_OPTIONS}
        idToSelectedMap={langSelection.reduce(
          (acc, id) => ({ ...acc, [id]: true }),
          {}
        )}
        onChange={(id) =>
          setLangSelection((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          )
        }
        compressed
      />
    </OuiPanel>
  );
};

// --- Summary Panels ---

const faultServiceColumns = [
  {
    field: 'service',
    name: 'Service',
    render: (name) => (
      <OuiLink href="#" onClick={(e) => e.preventDefault()}>
        {name}
      </OuiLink>
    ),
  },
  {
    field: 'faultRate',
    name: 'Fault rate',
    render: (value) => <FaultBar value={value} />,
  },
];

const TopFaultServicesPanel = () => (
  <OuiPanel paddingSize="m">
    <OuiTitle size="xs">
      <h3>Top services by fault rate</h3>
    </OuiTitle>
    <OuiSpacer size="s" />
    <OuiBasicTable
      items={TOP_FAULT_SERVICES}
      columns={faultServiceColumns}
      tableLayout="auto"
      compressed
    />
  </OuiPanel>
);

const depPathColumns = [
  {
    field: 'depService',
    name: 'Dependency service',
    render: (name) => (
      <OuiLink href="#" onClick={(e) => e.preventDefault()}>
        {name}
      </OuiLink>
    ),
  },
  {
    field: 'service',
    name: 'Service',
    render: (name) => (
      <OuiLink href="#" onClick={(e) => e.preventDefault()}>
        {name}
      </OuiLink>
    ),
  },
  {
    field: 'faultRate',
    name: 'Fault rate',
    render: (value) => <FaultBar value={value} />,
  },
];

const TopDependencyPathsPanel = () => (
  <OuiPanel paddingSize="m">
    <OuiTitle size="xs">
      <h3>Top dependency paths by fault rate</h3>
    </OuiTitle>
    <OuiSpacer size="s" />
    <OuiBasicTable
      items={TOP_DEPENDENCY_PATHS}
      columns={depPathColumns}
      tableLayout="auto"
      compressed
    />
  </OuiPanel>
);

// --- Service Catalog Table ---

const catalogColumns = [
  {
    field: 'name',
    name: 'Service',
    sortable: true,
    render: (name, item) => (
      <OuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <OuiFlexItem grow={false}>
          <OuiHealth
            color={
              // eslint-disable-next-line no-nested-ternary
              item.status === 'danger'
                ? 'danger'
                : item.status === 'warning'
                ? 'warning'
                : 'success'
            }
          />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiLink href="#" onClick={(e) => e.preventDefault()}>
            {name}
          </OuiLink>
        </OuiFlexItem>
      </OuiFlexGroup>
    ),
  },
  {
    field: 'id',
    name: 'Correlations',
    width: '100px',
    render: () => (
      <OuiFlexGroup gutterSize="xs" responsive={false}>
        <OuiFlexItem grow={false}>
          <OuiToolTip content="Alerts">
            <OuiButtonIcon
              iconType="bell"
              aria-label="Alerts"
              size="xs"
              color="text"
            />
          </OuiToolTip>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiToolTip content="Dashboards">
            <OuiButtonIcon
              iconType="dashboardApp"
              aria-label="Dashboards"
              size="xs"
              color="text"
            />
          </OuiToolTip>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiToolTip content="Connections">
            <OuiButtonIcon
              iconType="kqlFunction"
              aria-label="Connections"
              size="xs"
              color="text"
            />
          </OuiToolTip>
        </OuiFlexItem>
      </OuiFlexGroup>
    ),
  },
  {
    field: 'latency',
    name: 'Avg. Latency (P99)',
    sortable: true,
    render: (latency) => (
      <OuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <OuiFlexItem grow={false}>
          <span>{latency === 0 ? '0 ms' : `${latency} ms`}</span>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          {latency > 0 && (
            <Sparkline
              values={[
                latency * 0.6,
                latency * 0.8,
                latency,
                latency * 0.9,
                latency * 0.7,
                latency * 0.85,
              ]}
            />
          )}
        </OuiFlexItem>
      </OuiFlexGroup>
    ),
  },
  {
    field: 'throughput',
    name: 'Avg. throughput',
    sortable: true,
    render: (throughput) => (
      <OuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <OuiFlexItem grow={false}>
          <span>{throughput} req/int</span>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <Sparkline
            values={[
              throughput * 0.7,
              throughput * 0.9,
              throughput,
              throughput * 0.8,
              throughput * 0.95,
              throughput * 0.85,
            ]}
            className="servicePage__sparkline--subdued"
          />
        </OuiFlexItem>
      </OuiFlexGroup>
    ),
  },
  {
    field: 'failureRatio',
    name: 'Avg. failure ratio',
    sortable: true,
    render: (ratio) => (
      <OuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <OuiFlexItem grow={false}>
          <span>{ratio.toFixed(1)}%</span>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          {ratio > 0 && (
            <Sparkline
              values={[
                ratio * 0.8,
                ratio * 1.1,
                ratio,
                ratio * 0.9,
                ratio * 1.05,
                ratio * 0.95,
              ]}
              className={
                ratio > 20
                  ? 'servicePage__sparkline--danger'
                  : 'servicePage__sparkline--subdued'
              }
            />
          )}
        </OuiFlexItem>
      </OuiFlexGroup>
    ),
  },
  {
    field: 'environment',
    name: 'Environment',
    sortable: true,
  },
];

// --- Main ServicePage Component ---

export const ServicePage = () => {
  const [latencyTab, setLatencyTab] = useState('p99');
  const [start, setStart] = useState('now-15m');
  const [end, setEnd] = useState('now');

  const onTimeChange = ({ start: s, end: e }) => {
    setStart(s);
    setEnd(e);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflow: 'hidden',
      }}>
      {/* Page title + actions */}
      <div
        className="servicePage__header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
        }}>
        <OuiTitle size="s">
          <h1 style={{ margin: 0 }}>Services</h1>
        </OuiTitle>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <OuiButton iconType="gear" size="s">
            APM Settings
          </OuiButton>
          <OuiButton iconType="refresh" size="s">
            Refresh
          </OuiButton>
          <OuiButton iconType="generate" size="s">
            Ask AI
          </OuiButton>
        </div>
      </div>

      {/* Search bar + time controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
        }}>
        <OuiFieldSearch
          placeholder="Filter by service name or environment"
          fullWidth
          compressed
        />
        <OuiCompressedSuperDatePicker
          start={start}
          end={end}
          onTimeChange={onTimeChange}
          showUpdateButton={false}
        />
      </div>

      {/* Main content: filter sidebar + panels */}
      <OuiFlexGroup
        gutterSize="m"
        responsive={false}
        style={{ padding: '0 12px', alignItems: 'flex-start' }}>
        <OuiFlexItem grow={false}>
          <FilterSidebar />
        </OuiFlexItem>

        <OuiFlexItem>
          {/* Top summary panels */}
          <OuiFlexGroup gutterSize="m">
            <OuiFlexItem>
              <TopFaultServicesPanel />
            </OuiFlexItem>
            <OuiFlexItem>
              <TopDependencyPathsPanel />
            </OuiFlexItem>
          </OuiFlexGroup>

          {/* Service Catalog */}
          <OuiPanel paddingSize="m" style={{ marginTop: 16 }}>
            <OuiFlexGroup
              justifyContent="spaceBetween"
              alignItems="center"
              responsive={false}>
              <OuiFlexItem grow={false}>
                <OuiTitle size="xs">
                  <h3>Service Catalog</h3>
                </OuiTitle>
              </OuiFlexItem>
              <OuiFlexItem grow={false}>
                <OuiFlexGroup
                  gutterSize="s"
                  alignItems="center"
                  responsive={false}>
                  <OuiFlexItem grow={false}>
                    <OuiText size="xs">Latency</OuiText>
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
              </OuiFlexItem>
            </OuiFlexGroup>

            <OuiBasicTable
              items={SERVICES}
              columns={catalogColumns}
              rowHeader="name"
              tableLayout="auto"
            />
            <OuiText size="xs" color="subdued" style={{ marginTop: 8 }}>
              <p>Rows per page: 10</p>
            </OuiText>
          </OuiPanel>
        </OuiFlexItem>
      </OuiFlexGroup>
    </div>
  );
};
