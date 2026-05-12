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

import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
  OuiAccordion,
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
  OuiButtonGroup,
  OuiProgress,
  OuiToolTip,
  OuiButtonIcon,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

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

const FAILURE_RATIO_OPTIONS = [
  { id: 'low', label: '< 1%' },
  { id: 'medium', label: '1-5%' },
  { id: 'high', label: '> 5%' },
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
  const [failureSelection, setFailureSelection] = useState([]);
  const [langSelection, setLangSelection] = useState([]);

  return (
    <div style={{ padding: 16 }}>
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
        <OuiText size="xs" color="subdued" style={{ textAlign: 'center' }}>
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
        <OuiText size="xs" color="subdued" style={{ textAlign: 'center' }}>
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
        <OuiCheckboxGroup
          options={FAILURE_RATIO_OPTIONS}
          idToSelectedMap={failureSelection.reduce(
            (acc, id) => ({ ...acc, [id]: true }),
            {}
          )}
          onChange={(id) =>
            setFailureSelection((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          compressed
        />
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
      <OuiFieldSearch compressed fullWidth aria-label="Search attributes" />
      <OuiSpacer size="xs" />
      <OuiFlexGroup
        gutterSize="xs"
        responsive={false}
        justifyContent="spaceBetween">
        <OuiFlexItem grow={false}>
          <OuiButtonEmpty size="xs" flush="left">
            Select all
          </OuiButtonEmpty>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiButtonEmpty size="xs" flush="right">
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
    </div>
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

export const ServicePage = ({ onContinueAsThread, isAskAiPanelOpen, onAskAiToggle }) => {
  const [latencyTab, setLatencyTab] = useState('p99');
  const [filterWidth, setFilterWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const dragging = useRef(false);
  const bodyRef = useRef(null);

  // Drag-to-resize handlers for filter panel (same pattern as Discover fields panel)
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleResizeMove = (e) => {
      if (!dragging.current || !bodyRef.current) return;
      const bodyRect = bodyRef.current.getBoundingClientRect();
      const newWidth = e.clientX - bodyRect.left;
      setFilterWidth(Math.max(180, Math.min(newWidth, 500)));
    };
    const handleResizeEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Page title + date picker + actions */}
      <DetailPageHeader
        title="Application Performance Services"
        onContinueAsThread={onContinueAsThread}
        isAskAiPanelOpen={isAskAiPanelOpen}
        onAskAiToggle={onAskAiToggle}
      />

      {/* Tab bar */}
      <div className="servicePage__tabBar">
        <div className="servicePage__tabBarLeft">
          <OuiButtonGroup
            legend="APM view toggle"
            options={[
              { id: 'services', label: 'Services' },
              { id: 'application-map', label: 'Application map' },
            ]}
            idSelected={activeTab}
            onChange={(id) => setActiveTab(id)}
            buttonSize="compressed"
            isFullWidth
            style={{ width: 320 }}
          />
        </div>
        <div className="servicePage__tabActions">
          <OuiButtonEmpty size="s" iconType="popout" iconSide="right">
            View documentation
          </OuiButtonEmpty>
        </div>
      </div>

      {/* Body: filter panel (left) + resize handle + main content */}
      <div className="servicePage__body" ref={bodyRef}>
        {/* Filter panel (left sidebar) */}
        <div style={{ width: filterWidth, flexShrink: 0 }}>
          <OuiPanel
            paddingSize="none"
            className="servicePage__filterPanel"
            hasShadow={false}
            hasBorder>
            <div className="servicePage__filterPanelHeader">
              <OuiTitle size="xxs">
                <h2>Filters</h2>
              </OuiTitle>
            </div>
            <div style={{ padding: '8px 12px' }}>
              <OuiFieldSearch
                placeholder="Filter by service na..."
                fullWidth
                compressed
                aria-label="Filter services"
              />
            </div>
            <div className="servicePage__filterPanelScroll">
              <FilterSidebar />
            </div>
          </OuiPanel>
        </div>

        {/* Resize handle */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          className={`servicePage__resizeHandle${
            isDragging ? ' servicePage__resizeHandle--active' : ''
          }`}
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize filter panel"
          tabIndex={0}
        />

        {/* Main content column */}
        <div className="servicePage__contentCol">
          <div
            style={{
              padding: '0',
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
            }}>
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
                tableLayout="fixed"
              />
              <OuiText size="xs" color="subdued" style={{ marginTop: 8 }}>
                <p>Rows per page: 10</p>
              </OuiText>
            </OuiPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
