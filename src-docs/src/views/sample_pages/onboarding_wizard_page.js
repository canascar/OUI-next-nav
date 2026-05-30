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

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import {
  OuiButtonIcon,
  OuiIcon,
  OuiText,
  OuiTitle,
  OuiSpacer,
  OuiLoadingSpinner,
  OuiCode,
  OuiCheckbox,
  OuiToolTip,
  OuiCompressedTextArea,
} from '../../../../src/components';

import { SessionLeftNav } from './session_left_nav';

/**
 * STEPS CONFIGURATION
 * Onboarding flow for OpenSearch Observability Data Collection.
 * Steps are grouped into main steps. Steps 1–3 are sub-steps of main step 1.
 * Each step defines left panel (question + options) and right panel (preview).
 *
 * Main steps:
 *   1. What do you want to observe? (includes environment + collector config)
 *   2. Review and confirm
 *   3. Collecting your data
 */
const STEPS = [
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 1,
    question:
      'Welcome to OpenSearch for Observability. I\u2019ll help you set up your data. What would you like to observe?',
    optionType: 'chips',
    options: [
      { key: 'application', label: 'Instrument application' },
      { key: 'cloud', label: 'Connect existing data sources' },
      { key: 'sample', label: 'Get started with sample data', empty: true },
    ],
    confirmation: (selected) => {
      const labels = {
        application: 'Instrument application',
        cloud: 'Connect existing data sources',
        sample: 'Get started with sample data',
      };
      return `Great choice! Let\u2019s set up ${labels[selected] || selected}.`;
    },
    rightPanel: {
      title: 'Getting Started',
      subtitle: 'Set up your data',
      contentType: 'getting-started',
    },
  },
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 2,
    question:
      'What environment are you collecting data from? This helps me recommend the right integration approach.',
    optionType: 'chips',
    options: [
      { key: 'opentelemetry', label: 'OpenTelemetry' },
      { key: 'eks', label: 'EKS' },
      { key: 'kubernetes', label: 'Kubernetes' },
      { key: 'other', label: 'Other' },
    ],
    confirmation: (selected) => {
      const labels = {
        opentelemetry: 'OpenTelemetry',
        eks: 'EKS',
        kubernetes: 'Kubernetes',
        other: 'Other',
      };
      return `${
        labels[selected] || selected
      } selected. I\u2019ll configure the collector for your environment.`;
    },
    rightPanel: {
      title: 'Environment',
      subtitle: 'Supported collection environments',
      contentType: 'environment',
    },
  },
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '2-eks',
    question:
      'Scanning your AWS account for EKS clusters and instrumented services...',
    optionType: 'auto-discovery',
    options: [],
    autoAdvanceDelay: 5000,
    confirmation: () =>
      'Discovery complete. We found 3 EKS clusters and 14 services instrumented with OpenTelemetry. Redirecting to review...',
    rightPanel: {
      title: 'EKS Discovery',
      subtitle: 'Detecting clusters and services',
      contentType: 'eks-discovery',
    },
  },
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 3,
    question:
      'Run the following command to start your OpenTelemetry collector. Once it\u2019s running, click "I am ready" to continue.',
    optionType: 'chips',
    options: [
      { key: 'ready', label: 'I am ready', primary: true },
      { key: 'goback', label: 'Go back' },
    ],
    confirmation: () =>
      'Collector configured. Moving to data source connection.',
    rightPanel: {
      title: 'Collector Setup',
      subtitle: 'Run this command to start the OTel collector',
      contentType: 'collector-setup',
    },
  },
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 4,
    question:
      'Based on your setup, I recommend storing your telemetry in an OpenSearch Serverless Collection with Optimized engine. Columnar storage handles time-series log data more efficiently.',
    optionType: 'chips',
    options: [
      { key: 'looks-good', label: 'Looks good', primary: true },
      { key: 'customize', label: 'Customize' },
      { key: 'store-existing', label: 'Store in existing' },
    ],
    confirmation: (selected) => {
      const messages = {
        'looks-good':
          'Telemetry will be stored in a new OpenSearch Serverless Collection with Optimized engine.',
        customize:
          'Telemetry storage customized. Configuration saved.',
        'store-existing':
          'Telemetry will be stored in your existing OpenSearch Serverless Collection.',
      };
      return messages[selected] || 'Storage configured.';
    },
    rightPanel: {
      title: 'Telemetry Storage',
      subtitle: 'Recommended for your setup',
      contentType: 'telemetry-storage',
    },
  },
  {
    title: 'Review and confirm',
    mainStep: 2,
    question: 'Here\u2019s a summary of your setup. Everything look good?',
    dynamicQuestion: (selections) => {
      if (selections[0] === 'application') {
        return 'Here\u2019s a summary of your setup. Everything look good?\n\nBased on your data, I recommend storing your telemetry in an OpenSearch Serverless Collection with Optimized engine. Columnar storage handles time-series log data more efficiently.';
      }
      return 'Here\u2019s a summary of your setup. Everything look good?';
    },
    optionType: 'chips',
    options: [
      { key: 'deploy', label: 'Looks good \u2014 deploy my configuration', primary: true },
      { key: 'changes', label: 'I want to make changes' },
    ],
    confirmation: () => 'Configuration deployed! Collecting data now.',
    rightPanel: {
      title: 'Configuration Summary',
      subtitle: 'Review before deploying',
      contentType: 'summary',
    },
  },
  {
    title: 'Collecting your data',
    mainStep: 3,
    question:
      'Your pipeline is deployed and data is flowing in! I\u2019m collecting logs, metrics, and traces from your sources. You can watch the live counts on the right \u2014 once you\u2019re satisfied, continue to finish setup.',
    optionType: 'chips',
    options: [
      { key: 'continue', label: 'Continue', primary: true },
      { key: 'import', label: 'Import dashboards and queries' },
    ],
    confirmation: () =>
      'Data collection verified. Your observability pipeline is active.',
    rightPanel: {
      title: 'Live Data Collection',
      subtitle: 'Watching your data flow in real-time',
      contentType: 'live-counters',
    },
  },
];

// Docker command for Step 3
const OTEL_COMMAND = `docker run \\
  -e CLICKHOUSE_ENDPOINT="https://d9vcnuuz5c.us-west-2.aws.clickhouse.cloud:8443" \\
  -e CLICKHOUSE_USER="default" \\
  -e CLICKHOUSE_PASSWORD="<your_password_here>" \\
  -p 4317:4317 \\
  -p 4318:4318 \\
  clickhouse/clickstack-otel-collector:latest`;

// ─────────────────────────────────────────────
// RIGHT PANEL SUBCOMPONENTS
// ─────────────────────────────────────────────

const CHECKLIST_STEPS = [
  { label: 'Set observability goal', description: 'Choose what you want to observe' },
  { label: 'Collect data from environment', description: 'Configure your collector and environment' },
];

const GettingStartedPanel = () => {
  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="integrationObservability"
        title="Getting Started"
        subtitle="Set up your data"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__checklist">
        {CHECKLIST_STEPS.map((item, i) => (
          <div key={i} className="onboardWizard__checklistItem">
            <div className="onboardWizard__checklistText">
              <OuiText size="s">
                <strong>{item.label}</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                <p style={{ margin: 0 }}>{item.description}</p>
              </OuiText>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EnvironmentPanel = ({ selectedOption }) => {
  const environments = [
    {
      key: 'opentelemetry',
      icon: 'integrationObservability',
      name: 'OpenTelemetry',
      badge: 'Native integration',
      setupTime: '~5 min',
    },
    {
      key: 'eks',
      icon: 'logo_aws',
      name: 'EKS',
      badge: 'Managed service',
      setupTime: '~10 min',
    },
    {
      key: 'kubernetes',
      icon: 'logo_kubernetes',
      name: 'Kubernetes',
      badge: 'Self-managed',
      setupTime: '~8 min',
    },
    {
      key: 'other',
      icon: 'compute',
      name: 'Other',
      badge: 'Custom setup',
      setupTime: '~15 min',
    },
  ];

  const selected = environments.find((e) => e.key === selectedOption);

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="compute"
        title="Environment"
        subtitle="Supported collection environments"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__envGrid">
        {environments.map((env, index) => (
          <div
            key={env.key}
            className={`onboardWizard__envCard onboardWizard__envCard--staggerIn${
              selectedOption === env.key
                ? ' onboardWizard__envCard--selected'
                : ''
            }`}
            style={{ animationDelay: `${index * 80}ms` }}>
            <OuiIcon type={env.icon} size="l" />
            <OuiText size="s">
              <strong>{env.name}</strong>
            </OuiText>
            <span className="onboardWizard__envBadge">{env.badge}</span>
          </div>
        ))}
      </div>
      {selected && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__envDetail onboardWizard__envDetail--fadeIn">
            <OuiText size="xs">
              <strong>What&rsquo;s included</strong>
            </OuiText>
            <OuiSpacer size="xs" />
            <ul className="onboardWizard__envDetailList">
              <li>Collector configuration</li>
              <li>Pre-built dashboards</li>
              <li>Alerting templates</li>
            </ul>
            <OuiSpacer size="xs" />
            <OuiText size="xs" color="subdued">
              Estimated setup time: {selected.setupTime}
            </OuiText>
          </div>
        </>
      )}
    </div>
  );
};

const EKS_DISCOVERY_CLUSTERS = [
  { name: 'prod-app-cluster', region: 'us-west-2', services: 6, status: 'Active' },
  { name: 'staging-services', region: 'us-west-2', services: 5, status: 'Active' },
  { name: 'dev-playground', region: 'us-east-1', services: 3, status: 'Active' },
];

const EKSDiscoveryPanel = ({ discoveryPhase }) => {
  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="logo_aws"
        title="EKS Discovery"
        subtitle="Detecting clusters and services"
      />
      <OuiSpacer size="l" />
      {discoveryPhase === 'scanning' && (
        <div className="onboardWizard__eksScanning">
          <div className="onboardWizard__eksScanRow">
            <OuiLoadingSpinner size="s" />
            <OuiText size="s">Scanning AWS account for EKS clusters...</OuiText>
          </div>
          <OuiSpacer size="m" />
          <div className="onboardWizard__eksScanProgress">
            <div className="onboardWizard__eksScanProgressBar" />
          </div>
        </div>
      )}
      {discoveryPhase === 'found' && (
        <div className="onboardWizard__eksResults">
          <div className="onboardWizard__eksResultSummary">
            <div className="onboardWizard__eksResultBadge">
              <OuiIcon type="checkInCircleFilled" size="s" color="success" />
              <OuiText size="s">
                <strong>3 EKS clusters</strong> detected
              </OuiText>
            </div>
            <OuiSpacer size="xs" />
            <div className="onboardWizard__eksResultBadge">
              <OuiIcon type="checkInCircleFilled" size="s" color="success" />
              <OuiText size="s">
                <strong>14 services</strong> instrumented with OpenTelemetry
              </OuiText>
            </div>
          </div>
          <OuiSpacer size="l" />
          <div className="onboardWizard__eksClusterList">
            {EKS_DISCOVERY_CLUSTERS.map((cluster) => (
              <div key={cluster.name} className="onboardWizard__eksClusterCard">
                <div className="onboardWizard__eksClusterHeader">
                  <OuiIcon type="compute" size="m" />
                  <div>
                    <OuiText size="s">
                      <strong>{cluster.name}</strong>
                    </OuiText>
                    <OuiText size="xs" color="subdued">
                      {cluster.region} &middot; {cluster.status}
                    </OuiText>
                  </div>
                </div>
                <div className="onboardWizard__eksClusterServices">
                  <OuiText size="xs" color="subdued">
                    {cluster.services} instrumented services
                  </OuiText>
                  <span className="onboardWizard__eksClusterLive">
                    <span className="onboardWizard__liveDot" />
                    <OuiText size="xs">Active</OuiText>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <OuiSpacer size="m" />
          <OuiText size="xs" color="subdued">
            <p style={{ margin: 0 }}>
              Waiting for additional data... Auto-advancing to review.
            </p>
          </OuiText>
        </div>
      )}
    </div>
  );
};

const CollectorSetupPanel = ({ confirmed }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(OTEL_COMMAND.replace(/\\\n\s*/g, ' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="logo_docker"
        title="Collector Setup"
        subtitle="Run this command to start the OTel collector"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__codeBlock">
        <button
          type="button"
          className="onboardWizard__copyBtn"
          onClick={handleCopy}
          aria-label="Copy command to clipboard">
          <OuiIcon type={copied ? 'check' : 'copy'} size="s" />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <OuiCode language="bash" className="onboardWizard__code">
          {OTEL_COMMAND}
        </OuiCode>
      </div>
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p>
          Replace <code>&lt;your_password_here&gt;</code> with your actual
          password. The collector will listen on ports 4317 (gRPC) and 4318
          (HTTP) for incoming telemetry data.
        </p>
      </OuiText>
      {confirmed && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__verifiedStatus">
            <OuiIcon type="checkInCircleFilled" size="m" color="success" />
            <OuiText size="s">
              <strong>Collector detected</strong>
            </OuiText>
          </div>
        </>
      )}
    </div>
  );
};

const TelemetryStoragePanel = ({ selectedOption }) => {
  const recommendation = {
    type: 'OpenSearch Serverless Collection',
    subtitle: 'Optimized engine \u2014 Columnar storage',
    icon: 'logo_opensearch',
    reason:
      'Serverless with columnar storage handles time-series log data more efficiently, giving you faster queries, lower storage costs, and no infrastructure to manage for observability workloads.',
    specs: [
      { label: 'Engine', value: 'Optimized (Columnar)' },
      { label: 'Index pattern', value: 'otel-v1-*' },
      { label: 'Default retention', value: '30 days' },
    ],
  };

  const alternative = {
    type: 'OpenSearch Managed Cluster',
    reason:
      'Better suited for workloads requiring full cluster control, custom plugin support, or dedicated infrastructure.',
  };

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="database"
        title="Telemetry Storage"
        subtitle="Recommended for your setup"
      />
      <OuiSpacer size="l" />
      <div
        className={`onboardWizard__storageCard${
          selectedOption === 'looks-good'
            ? ' onboardWizard__storageCard--confirmed'
            : ''
        }`}>
        <div className="onboardWizard__storageCardHeader">
          <OuiIcon type={recommendation.icon} size="l" />
          <div>
            <OuiText size="s">
              <strong>{recommendation.type}</strong>
            </OuiText>
            <OuiText size="xs" color="subdued">
              {recommendation.subtitle}
            </OuiText>
            <span className="onboardWizard__storageBadge">Recommended</span>
          </div>
        </div>
        <OuiSpacer size="s" />
        <OuiText size="xs" color="subdued">
          <p style={{ margin: 0 }}>{recommendation.reason}</p>
        </OuiText>
        <OuiSpacer size="m" />
        <div className="onboardWizard__storageSpecs">
          {recommendation.specs.map((spec) => (
            <div key={spec.label} className="onboardWizard__storageSpecRow">
              <OuiText size="xs" color="subdued">
                {spec.label}
              </OuiText>
              <OuiText size="xs">
                <strong>{spec.value}</strong>
              </OuiText>
            </div>
          ))}
        </div>
      </div>
      <OuiSpacer size="m" />
      <div className="onboardWizard__storageAlt">
        <OuiText size="xs" color="subdued">
          <strong>Alternative:</strong> {alternative.type} &mdash;{' '}
          {alternative.reason}
        </OuiText>
      </div>
      {selectedOption === 'customize' && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__storageCustomize">
            <OuiText size="xs">
              <strong>Customize configuration</strong>
            </OuiText>
            <OuiSpacer size="s" />
            <OuiText size="xs" color="subdued">
              <p style={{ margin: 0 }}>
                Adjust resource type, OCU allocation, replicas, retention policy,
                and index naming from the Data Management page after setup.
              </p>
            </OuiText>
          </div>
        </>
      )}
      {selectedOption === 'store-existing' && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__storageExisting">
            <OuiText size="xs">
              <strong>Select existing resource</strong>
            </OuiText>
            <OuiSpacer size="s" />
            <div className="onboardWizard__storageExistingList">
              <div className="onboardWizard__storageExistingItem">
                <OuiIcon type="logo_opensearch" size="s" />
                <div>
                  <OuiText size="xs">
                    <strong>prod-observability-cluster</strong>
                  </OuiText>
                  <OuiText size="xs" color="subdued">
                    Serverless Collection &middot; us-west-2 &middot; Active
                  </OuiText>
                </div>
              </div>
              <div className="onboardWizard__storageExistingItem">
                <OuiIcon type="logo_opensearch" size="s" />
                <div>
                  <OuiText size="xs">
                    <strong>dev-telemetry-collection</strong>
                  </OuiText>
                  <OuiText size="xs" color="subdued">
                    Serverless Collection &middot; us-east-1 &middot; Active
                  </OuiText>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p style={{ margin: 0 }}>
          You can change storage settings later from the Data Management page.
        </p>
      </OuiText>
    </div>
  );
};

const SummaryPanel = ({ allSelections }) => {
  const summaryRows = [
    {
      label: 'Services instrumented',
      stepIdx: 0,
      valueMap: {
        application: '14 services',
        cloud: '14 services',
        sample: '14 services',
      },
    },
    {
      label: 'Environment',
      stepIdx: 1,
      valueMap: {
        opentelemetry: 'OpenTelemetry',
        eks: 'EKS',
        kubernetes: 'Kubernetes',
        other: 'Other',
      },
    },
    {
      label: 'Telemetry storage',
      stepIdx: 4,
      valueMap: {
        'looks-good': 'OpenSearch Serverless Collection (Optimized engine)',
        customize: 'Custom configuration',
        'store-existing': 'Existing resource',
      },
      // When user chose "Instrument application" or "EKS", 1d is skipped — auto-recommended
      skippedWhen: () => allSelections[0] === 'application' || allSelections[1] === 'eks',
      skippedLabel: 'OpenSearch Serverless Collection (Optimized engine)',
    },
  ];

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="checkInCircleFilled"
        title="Configuration Summary"
        subtitle="Review before deploying"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__summaryList">
        {summaryRows.map((row) => {
          // If this step was skipped due to earlier selection, show skipped label
          if (row.skippedWhen && row.skippedWhen()) {
            return (
              <div key={row.stepIdx} className="onboardWizard__summaryRow">
                <OuiText size="xs" color="subdued">
                  {row.label}
                </OuiText>
                <OuiText size="s">
                  <strong>{row.skippedLabel}</strong>
                </OuiText>
              </div>
            );
          }
          const val = allSelections[row.stepIdx];
          let display = '\u2014';
          if (Array.isArray(val) && val.length > 0) {
            display = val.map((v) => row.valueMap[v] || v).join(', ');
          } else if (val && !Array.isArray(val)) {
            display = row.valueMap[val] || val;
          }
          return (
            <div key={row.stepIdx} className="onboardWizard__summaryRow">
              <OuiText size="xs" color="subdued">
                {row.label}
              </OuiText>
              <OuiText size="s">
                <strong>{display}</strong>
              </OuiText>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Generates initial data points for the streaming area chart
const generateInitialData = (points, baseValue, variance) =>
  Array.from({ length: points }, () =>
    baseValue + Math.floor(Math.random() * variance)
  );

// Attempt a smooth cubic bezier path through points (mimics monotone interpolation)
const buildSmoothPath = (points, width, height, padding) => {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, i) => ({
    x: (i / (points.length - 1)) * width,
    y: padding + (1 - (val - min) / range) * (height - padding * 2),
  }));

  // Build a smooth cubic bezier path
  let path = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return path;
};

// A single streaming area chart using pure SVG — gradient fill like shadcn's area chart
const LiveStreamAreaChart = ({ color, data }) => {
  const width = 320;
  const height = 80;
  const padding = 4;
  const gradientId = useMemo(
    () => `area-grad-${color.replace('#', '')}`,
    [color]
  );

  // Build a sharp polyline (no smooth curves — blueprint style)
  const points = data.map((val, i) => {
    const max = Math.max(...data);
    const x = (i / (data.length - 1)) * width;
    const y = padding + ((1 - val / max) * (height - padding * 2));
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      className="onboardWizard__areaChart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Horizontal grid — dashed, blueprint style */}
      {[0.25, 0.5, 0.75].map((ratio, i) => (
        <line key={i} x1="0" y1={height * ratio} x2={width} y2={height * ratio}
          stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.12" />
      ))}
      {/* Baseline */}
      <line x1="0" y1={height} x2={width} y2={height}
        stroke="currentColor" strokeWidth="0.7" opacity="0.15" />
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
};

const LiveCountersPanel = () => {
  const MAX_POINTS = 30;

  const [counts, setCounts] = useState({
    logs: 1204,
    metrics: 8491,
    traces: 342,
  });

  const [chartData, setChartData] = useState({
    logs: generateInitialData(MAX_POINTS, 12, 8),
    metrics: generateInitialData(MAX_POINTS, 18, 12),
    traces: generateInitialData(MAX_POINTS, 6, 4),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        logs: prev.logs + Math.floor(Math.random() * 15) + 5,
        metrics: prev.metrics + Math.floor(Math.random() * 25) + 10,
        traces: prev.traces + Math.floor(Math.random() * 8) + 3,
      }));

      setChartData((prev) => ({
        logs: [...prev.logs.slice(1), 8 + Math.floor(Math.random() * 12)],
        metrics: [...prev.metrics.slice(1), 12 + Math.floor(Math.random() * 18)],
        traces: [...prev.traces.slice(1), 3 + Math.floor(Math.random() * 8)],
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const counters = [
    {
      key: 'logs',
      icon: 'document',
      label: 'Logs',
      count: counts.logs,
      rate: '+12/s',
      color: '#006DE4',
    },
    {
      key: 'metrics',
      icon: 'vis_area',
      label: 'Metrics',
      count: counts.metrics,
      rate: '+18/s',
      color: '#00BFB3',
    },
    {
      key: 'traces',
      icon: 'branch',
      label: 'Traces',
      count: counts.traces,
      rate: '+6/s',
      color: '#F5A700',
    },
  ];

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="pulse"
        title="Live Data Collection"
        subtitle="Watching your data flow in real-time"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__liveCounters">
        {counters.map((c) => (
          <div key={c.key} className="onboardWizard__counterRow onboardWizard__counterRow--withChart">
            <div className="onboardWizard__counterMeta">
              <div className="onboardWizard__counterIcon">
                <OuiIcon type={c.icon} size="l" color={c.color} />
              </div>
              <div className="onboardWizard__counterInfo">
                <OuiText size="xs" color="subdued">
                  {c.label}
                </OuiText>
                <div className="onboardWizard__counterValue">
                  <span className="onboardWizard__counterNumber">
                    {c.count.toLocaleString()}
                  </span>
                  <span
                    className="onboardWizard__counterRate"
                    style={{ color: c.color }}>
                    {c.rate}
                  </span>
                </div>
              </div>
            </div>
            <div className="onboardWizard__counterChart">
              <LiveStreamAreaChart
                color={c.color}
                data={chartData[c.key]}
              />
            </div>
          </div>
        ))}
      </div>
      <OuiSpacer size="l" />
      <div className="onboardWizard__collectionHealth">
        <OuiIcon type="checkInCircleFilled" size="s" color="success" />
        <OuiText size="xs">
          <strong>Healthy</strong> &middot; Uptime: 2m 34s &middot; Avg latency:
          12ms
        </OuiText>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED SUBCOMPONENTS
// ─────────────────────────────────────────────

const RightPanelHeader = ({ icon, title, subtitle }) => (
  <div className="onboardWizard__rightHeader">
    <OuiIcon type={icon} size="m" />
    <div>
      <OuiTitle size="xs">
        <h3>{title}</h3>
      </OuiTitle>
      <OuiText size="xs" color="subdued">
        {subtitle}
      </OuiText>
    </div>
  </div>
);

const IngestRow = ({ label, rate, color }) => {
  const dots = Array.from({ length: 12 }, (_, i) => (
    <span
      key={i}
      className="onboardWizard__sparkDot"
      style={{
        backgroundColor: color,
        opacity: 0.4 + Math.random() * 0.6,
      }}
    />
  ));

  return (
    <div className="onboardWizard__ingestRow">
      <span className="onboardWizard__ingestLabel">{label}</span>
      <span className="onboardWizard__ingestRate" style={{ color }}>
        {rate}
      </span>
      <div className="onboardWizard__sparkline">{dots}</div>
    </div>
  );
};

// ─────────────────────────────────────────────
// RIGHT PANEL CONTENT ROUTER
// ─────────────────────────────────────────────

const RightPanelContent = ({
  step,
  selectedOption,
  confirmed,
  allSelections,
}) => {
  const { rightPanel } = step;

  switch (rightPanel.contentType) {
    case 'getting-started':
      return <GettingStartedPanel />;
    case 'environment':
      return <EnvironmentPanel selectedOption={selectedOption} />;
    case 'eks-discovery':
      return <EKSDiscoveryPanel discoveryPhase={confirmed ? 'found' : (selectedOption ? 'scanning' : 'scanning')} />;
    case 'collector-setup':
      return <CollectorSetupPanel confirmed={confirmed} />;
    case 'telemetry-storage':
      return <TelemetryStoragePanel selectedOption={selectedOption} />;
    case 'summary':
      return <SummaryPanel allSelections={allSelections} />;
    case 'live-counters':
      return <LiveCountersPanel />;
    default:
      return (
        <div className="onboardWizard__rightContent">
          <RightPanelHeader
            icon="iInCircle"
            title={rightPanel.title}
            subtitle={rightPanel.subtitle}
          />
          <OuiSpacer size="l" />
          <div className="onboardWizard__infoPlaceholder">
            <OuiText size="s" color="subdued" style={{ textAlign: 'center' }}>
              <p>Select an option to see more details here.</p>
            </OuiText>
          </div>
        </div>
      );
  }
};

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────

export const OnboardingWizardPage = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introExiting, setIntroExiting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [confirmedSteps, setConfirmedSteps] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [rightPanelFade, setRightPanelFade] = useState(true);
  const feedRef = useRef(null);
  const feedEndRef = useRef(null);
  const streamTimers = useRef([]);

  const handleStartOnboarding = () => {
    setIntroExiting(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  const totalSteps = STEPS.length;
  const totalMainSteps = STEPS[STEPS.length - 1].mainStep;
  const step = STEPS[currentStep];
  const currentSelection = selections[currentStep] ?? step.defaultSelection ?? null;
  const isConfirmed = !!confirmedSteps[currentStep];

  // Stream the current step's question text when step changes
  useEffect(() => {
    // Clear previous timers
    streamTimers.current.forEach(clearTimeout);
    streamTimers.current = [];

    // Use dynamicQuestion if available, passing selections for context
    const fullText = step.dynamicQuestion
      ? step.dynamicQuestion(selections)
      : step.question;
    const tokens = fullText.split(/(\s+)/);
    setStreamedText('');
    setIsStreaming(true);

    let built = '';
    tokens.forEach((token, i) => {
      const timer = setTimeout(() => {
        built += token;
        setStreamedText(built);
        if (i === tokens.length - 1) {
          setIsStreaming(false);
        }
      }, i * 30);
      streamTimers.current.push(timer);
    });

    return () => {
      streamTimers.current.forEach(clearTimeout);
      streamTimers.current = [];
    };
  }, [currentStep, step.question]);

  // Auto-discovery step: auto-confirm after scanning animation
  useEffect(() => {
    if (step.optionType === 'auto-discovery' && !isConfirmed && !isProcessing) {
      // Wait for the streaming text to finish, then auto-confirm
      const streamDuration = step.question.split(/(\s+)/).length * 30 + 500;
      const timer = setTimeout(() => {
        setIsProcessing(true);
        // Show scanning for 2 seconds, then confirm (discovery found)
        setTimeout(() => {
          setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
          setIsProcessing(false);
          // Update the streamed text to the discovery result
          setStreamedText(
            'We found 3 EKS clusters and 14 services instrumented with OpenTelemetry. Waiting for additional data...'
          );
        }, 2000);
      }, streamDuration);
      return () => clearTimeout(timer);
    }
  }, [currentStep, step.optionType, isConfirmed, isProcessing]);

  // Fade in the right panel when step changes
  useEffect(() => {
    setRightPanelFade(false);
    const timer = setTimeout(() => setRightPanelFade(true), 80);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Auto-scroll feed to bottom when conversation changes
  useEffect(() => {
    requestAnimationFrame(() => {
      if (feedEndRef.current) {
        feedEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }, [currentStep, isConfirmed, isProcessing, streamedText]);

  const handleChipSelect = useCallback(
    (key) => {
      if (isConfirmed || isProcessing) return;

      // Step 1c (OTel collector, index 3) "Go back" navigates back to 1b
      if (currentStep === 3 && key === 'goback') {
        setCurrentStep(1);
        return;
      }

      setSelections((prev) => ({ ...prev, [currentStep]: key }));
      setIsProcessing(true);
      setTimeout(() => {
        setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
        setIsProcessing(false);
      }, 1000);
    },
    [currentStep, isConfirmed, isProcessing]
  );

  const handleMultiSelectToggle = useCallback(
    (key) => {
      if (isConfirmed || isProcessing) return;
      const current = Array.isArray(selections[currentStep])
        ? selections[currentStep]
        : [];
      const updated = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      setSelections((prev) => ({ ...prev, [currentStep]: updated }));
    },
    [currentStep, isConfirmed, isProcessing, selections]
  );

  const handleMultiSelectConfirm = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
      setIsProcessing(false);
    }, 1000);
  }, [currentStep, isProcessing]);

  const handleSkip = useCallback(() => {
    if (isConfirmed || isProcessing) return;
    setSelections((prev) => ({ ...prev, [currentStep]: [] }));
    setIsProcessing(true);
    setTimeout(() => {
      setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
      setIsProcessing(false);
    }, 700);
  }, [currentStep, isConfirmed, isProcessing]);

  // Auto-advance to next step after confirmation (with brief delay to show confirmation)
  // Branching logic from sub-step 1b (index 1):
  //   - "opentelemetry" → go to 1c (OTel collector, index 3)
  //   - "eks" → go to EKS discovery (index 2), which auto-advances to Step 2 (Review)
  //   - Other → go to 1c (OTel collector, index 3)
  // If user selected "Instrument application" in step 1a:
  //   - Skip sub-step 1d (index 4, telemetry storage) 
  useEffect(() => {
    if (isConfirmed && currentStep < totalSteps - 1) {
      const currentStepDef = STEPS[currentStep];

      // EKS Discovery auto-advance: wait 5 seconds then go to Step 2 (review/confirm)
      if (currentStepDef.optionType === 'auto-discovery') {
        const timer = setTimeout(() => {
          // Find the index of Step 2 (Review and confirm, mainStep === 2)
          const step2Idx = STEPS.findIndex((s) => s.mainStep === 2);
          setCurrentStep(step2Idx);
        }, 5000);
        return () => clearTimeout(timer);
      }

      const timer = setTimeout(() => {
        setCurrentStep((prev) => {
          let nextStep = prev + 1;

          // From sub-step 1b (index 1): branch based on environment selection
          if (prev === 1) {
            if (selections[1] === 'eks') {
              // Go to EKS discovery (index 2)
              return 2;
            }
            // OpenTelemetry or other → skip EKS discovery, go to OTel collector (index 3)
            return 3;
          }

          // From EKS discovery (index 2): this is handled by auto-advance above, 
          // but as safety: go to Step 2 (Review)
          if (prev === 2) {
            const step2Idx = STEPS.findIndex((s) => s.mainStep === 2);
            return step2Idx;
          }

          if (selections[0] === 'application') {
            // From 1c (index 3) → skip 1d (index 4), jump to Review (step 2, index 5)
            if (nextStep === 4) {
              return 5;
            }
          }
          return nextStep;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, currentStep, totalSteps, selections]);

  const handleStepClick = useCallback(
    (stepIdx) => {
      if (stepIdx < currentStep && confirmedSteps[stepIdx]) {
        setCurrentStep(stepIdx);
        // Reset subsequent steps
        const newSelections = { ...selections };
        const newConfirmed = { ...confirmedSteps };
        for (let i = stepIdx; i < totalSteps; i++) {
          delete newSelections[i];
          delete newConfirmed[i];
        }
        setSelections(newSelections);
        setConfirmedSteps(newConfirmed);
      }
    },
    [currentStep, confirmedSteps, selections, totalSteps]
  );

  const [isExiting, setIsExiting] = useState(false);

  const handleFinishLater = () => {
    setIsExiting(true);
    setTimeout(() => { window.location.hash = '/sample-pages'; }, 600);
  };

  // Last step: selections navigate away
  const handleFinalNavigation = () => {
    setIsExiting(true);
    setTimeout(() => { window.location.hash = '/sample-pages'; }, 600);
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    const matchedOption = step.options.find(
      (opt) => opt.label.toLowerCase() === text.toLowerCase()
    );
    if (matchedOption) {
      handleChipSelect(matchedOption.key);
    }
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  // Build the conversation messages from completed steps + current step
  const buildConversation = () => {
    const messages = [];
    const currentMainStep = step.mainStep;

    // Only show chat history from sub-steps within the same main step
    for (let i = 0; i < currentStep; i++) {
      const pastStep = STEPS[i];
      const pastSelection = selections[i];

      // Skip steps from previous main steps — only show sub-step history
      if (pastStep.mainStep !== currentMainStep) continue;

      // Assistant question
      messages.push(
        <div key={`q-${i}`} className="threadPage__message threadPage__message--assistant">
          <div className="threadPage__bubble threadPage__bubble--assistant">
            <OuiText size="s">
              <p>{pastStep.question}</p>
            </OuiText>
          </div>
        </div>
      );

      // User selection as user message
      if (pastSelection) {
        const selectionLabel = getSelectionLabel(pastStep, pastSelection);
        messages.push(
          <div key={`a-${i}`} className="threadPage__message threadPage__message--user">
            <div className="threadPage__bubble threadPage__bubble--user">
              <OuiText size="s">
                <p>{selectionLabel}</p>
              </OuiText>
            </div>
          </div>
        );
      }

      // Confirmation
      if (confirmedSteps[i] && pastStep.confirmation) {
        messages.push(
          <div key={`c-${i}`} className="threadPage__message threadPage__message--assistant">
            <div className="threadPage__bubble threadPage__bubble--assistant">
              <div className="onboardWizard__confirmInline">
                <OuiIcon type="checkInCircleFilled" size="s" color="success" />
                <OuiText size="xs">
                  <span>{pastStep.confirmation(pastSelection)}</span>
                </OuiText>
              </div>
            </div>
          </div>
        );
      }
    }

    // Current step: assistant question (with typing animation)
    messages.push(
      <div key={`q-${currentStep}`} className="threadPage__message threadPage__message--assistant">
        <div className="threadPage__bubble threadPage__bubble--assistant">
          <OuiText size="s">
            {streamedText.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </OuiText>
          {!isStreaming && !isConfirmed && (
            <>
              <OuiSpacer size="m" />
              {/* Render interactive options after typing completes */}
              {renderOptions()}
            </>
          )}
        </div>
      </div>
    );

    // If the current step has a selection, show user message
    if (currentSelection && isConfirmed) {
      const selectionLabel = getSelectionLabel(step, currentSelection);
      messages.push(
        <div key={`a-${currentStep}`} className="threadPage__message threadPage__message--user">
          <div className="threadPage__bubble threadPage__bubble--user">
            <OuiText size="s">
              <p>{selectionLabel}</p>
            </OuiText>
          </div>
        </div>
      );
    }

    // Processing indicator
    if (isProcessing) {
      messages.push(
        <div key="processing" className="threadPage__message threadPage__message--assistant">
          <div className="threadPage__bubble threadPage__bubble--assistant">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <OuiLoadingSpinner size="s" />
              <OuiText size="xs" color="subdued">Processing...</OuiText>
            </div>
          </div>
        </div>
      );
    }

    // Confirmation for current step
    if (isConfirmed && step.confirmation) {
      messages.push(
        <div key={`c-${currentStep}`} className="threadPage__message threadPage__message--assistant">
          <div className="threadPage__bubble threadPage__bubble--assistant">
            <div className="onboardWizard__confirmInline">
              <OuiIcon type="checkInCircleFilled" size="s" color="success" />
              <OuiText size="xs">
                <span>{step.confirmation(currentSelection)}</span>
              </OuiText>
            </div>
          </div>
        </div>
      );
    }

    return messages;
  };

  // Render interactive options (chips or multi-select) for the current step
  const renderOptions = () => {
    if (isConfirmed) return null;

    if (step.optionType === 'chips') {
      return (
        <>
          <div className="onboardWizard__chips">
            {step.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`onboardWizard__chip${
                  currentSelection === opt.key
                    ? ' onboardWizard__chip--selected'
                    : ''
                }${opt.primary ? ' onboardWizard__chip--confirm' : ''}${opt.empty ? ' onboardWizard__chip--empty' : ''}`}
                onClick={() =>
                  isLastStep
                    ? handleFinalNavigation(opt.key)
                    : handleChipSelect(opt.key)
                }
                disabled={isConfirmed || isProcessing}>
                <span>{opt.label}</span>
                {opt.description && (
                  <span className="onboardWizard__chipDescription">{opt.description}</span>
                )}
              </button>
            ))}
          </div>
          {step.skipLabel && (
            <div className="onboardWizard__multiActions" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="onboardWizard__skipLink"
                onClick={handleSkip}
                disabled={isProcessing}>
                {step.skipLabel}
              </button>
            </div>
          )}
        </>
      );
    }

    if (step.optionType === 'multiselect') {
      return (
        <div className="onboardWizard__multiSelect">
          {step.options.map((opt) => {
            const checked =
              Array.isArray(currentSelection) &&
              currentSelection.includes(opt.key);
            return (
              <div key={opt.key} className="onboardWizard__multiOption">
                <OuiCheckbox
                  id={`transform-${opt.key}`}
                  label={opt.label}
                  checked={checked}
                  onChange={() => handleMultiSelectToggle(opt.key)}
                  disabled={isConfirmed || isProcessing}
                />
                <OuiText
                  size="xs"
                  color="subdued"
                  className="onboardWizard__multiDesc">
                  {opt.description}
                </OuiText>
              </div>
            );
          })}
          {!isConfirmed && (
            <div className="onboardWizard__multiActions">
              <button
                type="button"
                className="onboardWizard__chip onboardWizard__chip--confirm"
                onClick={handleMultiSelectConfirm}
                disabled={
                  isProcessing ||
                  !currentSelection ||
                  (Array.isArray(currentSelection) &&
                    currentSelection.length === 0)
                }>
                Apply transformations
              </button>
              <button
                type="button"
                className="onboardWizard__skipLink"
                onClick={handleSkip}
                disabled={isProcessing}>
                {step.skipLabel}
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (showIntro) {
    return (
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
        <SessionLeftNav
          isEmptySession={true}
          activeView="session"
          disableActions={true}
          onCreateSession={() => {}}
          onBrowseSessions={() => {}}
          onBrowseLibrary={() => {}}
          onSelectSession={() => {}}
        />
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
          }}>
          <div
            className="samplePagesContentPanel"
            style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <div className={`onboardWizard__intro${introExiting ? ' onboardWizard__intro--exiting' : ''}`}>
              <div className="onboardWizard__introContent">
                <OuiIcon type="logo_opensearch" size="xxl" />
                <OuiSpacer size="l" />
                <OuiTitle size="l">
                  <h1>Welcome to OpenSearch</h1>
                </OuiTitle>
                <OuiSpacer size="s" />
                <OuiText color="subdued">
                  <p>Set up your observability pipeline in minutes. We'll guide you through connecting your data sources, configuring collectors, and getting insights from your telemetry.</p>
                </OuiText>
                <OuiSpacer size="xl" />
                <button
                  type="button"
                  className="onboardWizard__introCta"
                  onClick={handleStartOnboarding}>
                  Get started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      {/* Left nav — matches Day N session experience */}
      <SessionLeftNav
        isEmptySession={true}
        activeView="session"
        disableActions={true}
        onCreateSession={() => {}}
        onBrowseSessions={() => {}}
        onBrowseLibrary={() => {}}
        onSelectSession={() => {}}
      />

      {/* Content area with chrome panel */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
        }}>
        <div
          className="samplePagesContentPanel"
          style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div className={`onboardWizard${isExiting ? ' onboardWizard--exiting' : ''}`}>
            {/* Left Panel — Thread-style chat interaction */}
            <div className="onboardWizard__left">
              <div className="onboardWizard__leftPanel">
                <div className="threadPage__body">
                  <div className="threadPage__conversationCol">
                    {/* Step indicator header */}
                    <div className="onboardWizard__stepIndicator" style={{ padding: '12px 16px 0' }}>
                      <OuiTitle size="xxxs">
                        <h6>Step {step.mainStep} of {totalMainSteps}</h6>
                      </OuiTitle>
                      <OuiTitle size="s">
                        <h3>{step.title}</h3>
                      </OuiTitle>
                      <div className="onboardWizard__timeline" style={{ marginTop: 8 }}>
                          {Array.from({ length: totalMainSteps }, (_, mainIdx) => {
                            const mainNum = mainIdx + 1;
                            const isMainDone = step.mainStep > mainNum;
                            const isMainCurrent = step.mainStep === mainNum;
                            // Find the first sub-step index for this main step (for navigation)
                            const firstSubIdx = STEPS.findIndex((s) => s.mainStep === mainNum);
                            if (isMainDone) {
                              return (
                                <button
                                  key={mainIdx}
                                  type="button"
                                  className="onboardWizard__timelineDot onboardWizard__timelineDot--done"
                                  onClick={() => handleStepClick(firstSubIdx)}
                                  aria-label={`Go back to step ${mainNum}: ${STEPS[firstSubIdx].title}`}
                                  title={STEPS[firstSubIdx].title}
                                />
                              );
                            }
                            if (isMainCurrent) {
                              return (
                                <span
                                  key={mainIdx}
                                  className="onboardWizard__timelineDot onboardWizard__timelineDot--current"
                                />
                              );
                            }
                            return (
                              <span
                                key={mainIdx}
                                className="onboardWizard__timelineDot onboardWizard__timelineDot--inactive"
                              />
                            );
                          })}
                        </div>
                    </div>

                    {/* Conversation feed — reuses threadPage__feed pattern */}
                    <div className="threadPage__feed" ref={feedRef}>
                      {buildConversation()}
                      <div ref={feedEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="threadPage__inputArea">
                      <div className="threadPage__inputWrapper">
                        <OuiCompressedTextArea
                          placeholder="Ask anything or use / for commands"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          rows={2}
                          resize="none"
                          fullWidth
                          className="threadPage__textarea"
                        />
                        <div className="threadPage__inputActions">
                          <OuiButtonIcon
                            iconType="plus"
                            aria-label="Add attachment"
                            size="s"
                            color="text"
                          />
                          <OuiButtonIcon
                            iconType="sortUp"
                            aria-label="Send message"
                            display="fill"
                            size="s"
                            isDisabled={!message.trim() || isProcessing}
                            onClick={handleSend}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="onboardWizard__right">
              <div className={`onboardWizard__rightPanel${rightPanelFade ? ' onboardWizard__rightPanel--fadeIn' : ''}`} key={currentStep}>
                <RightPanelContent
                  step={step}
                  selectedOption={currentSelection}
                  confirmed={isConfirmed}
                  allSelections={selections}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to get a label for a user's selection
function getSelectionLabel(step, selection) {
  if (Array.isArray(selection)) {
    if (selection.length === 0) return 'Skipped';
    return selection
      .map((key) => {
        const opt = step.options.find((o) => o.key === key);
        return opt ? opt.label : key;
      })
      .join(', ');
  }
  const opt = step.options.find((o) => o.key === selection);
  return opt ? opt.label : selection;
}
