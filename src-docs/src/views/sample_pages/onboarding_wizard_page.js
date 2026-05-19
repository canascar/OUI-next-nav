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

/**
 * STEPS CONFIGURATION
 * Onboarding flow for OpenSearch Observability Data Collection.
 * Steps are grouped into main steps. Steps 1–3 are sub-steps of main step 1.
 * Each step defines left panel (question + options) and right panel (preview).
 *
 * Main steps:
 *   1. What do you want to observe? (includes environment + collector config)
 *   2. Connect your data source
 *   3. Transform your data
 *   4. Review and confirm
 *   5. Collecting your data
 *   6. You're all set!
 */
const STEPS = [
  {
    title: 'What do you want to observe?',
    mainStep: 1,
    subStep: 1,
    question:
      'Welcome to OpenSearch Observability! I\u2019ll help you get your data flowing. What would you like to observe?',
    optionType: 'chips',
    options: [
      { key: 'application', label: 'Collect data from your application' },
      { key: 'cloud', label: 'Connect with cloud services' },
      { key: 'sample', label: 'Get started with sample data' },
    ],
    confirmation: (selected) => {
      const labels = {
        application: 'Collect data from your application',
        cloud: 'Connect with cloud services',
        sample: 'Get started with sample data',
      };
      return `Great choice! Let\u2019s set up ${labels[selected] || selected}.`;
    },
    rightPanel: {
      title: 'Getting Started',
      subtitle: 'Choose your observability path',
      contentType: 'getting-started',
    },
  },
  {
    title: 'Select your environment',
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
    title: 'Configure your OpenTelemetry collector',
    mainStep: 1,
    subStep: 3,
    question:
      'Run the following command to start your OpenTelemetry collector. Once it\u2019s running, click "I am ready" to continue.',
    optionType: 'chips',
    options: [
      { key: 'ready', label: 'I am ready' },
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
    title: 'Connect your data source',
    mainStep: 2,
    question:
      'Next: hook up your telemetry. Where does your infrastructure live?',
    optionType: 'chips',
    options: [
      { key: 'opensearch', label: 'OpenSearch' },
      { key: 'prometheus', label: 'Prometheus' },
      { key: 'cloudwatch', label: 'Amazon CloudWatch Logs' },
      { key: 's3', label: 'Amazon S3' },
      { key: 'skip', label: 'Skip' },
    ],
    confirmation: (selected) => {
      const labels = {
        opensearch: 'OpenSearch',
        prometheus: 'Prometheus',
        cloudwatch: 'Amazon CloudWatch Logs',
        s3: 'Amazon S3',
        skip: 'Skipped',
      };
      if (selected === 'skip') return 'Skipped data source connection.';
      const services = Math.floor(Math.random() * 5) + 4;
      const logGroups = Math.floor(Math.random() * 30) + 20;
      return `Connected to ${labels[selected]}. I\u2019m seeing ${services} services and ${logGroups} log groups.`;
    },
    rightPanel: {
      title: 'Data Sources',
      subtitle: 'Where telemetry comes from',
      contentType: 'data-sources',
    },
  },
  {
    title: 'Transform your data',
    mainStep: 3,
    question:
      'Your data is flowing! Logs from agents aren\u2019t always in the perfect format. Would you like to make any changes to your log sources? We have a few out-of-the-box options \u2014 you can always do this later if you want to just move forward.',
    optionType: 'multiselect',
    options: [
      {
        key: 'pii',
        label: 'Remove Personally Identifiable data',
        description:
          'Strip PII such as emails, IP addresses, and names from your log sources',
      },
      {
        key: 'catalog',
        label: 'Add service catalog data',
        description:
          'Enrich logs with service ownership, team, and environment metadata',
      },
    ],
    skipLabel: 'Skip for now',
    confirmation: (selected) => {
      if (!selected || (Array.isArray(selected) && selected.length === 0)) {
        return 'No transformations applied. You can configure these later from settings.';
      }
      const labels = {
        pii: 'Remove PII',
        catalog: 'Add service catalog data',
      };
      const names = (Array.isArray(selected) ? selected : [selected]).map(
        (s) => labels[s] || s
      );
      return `Applying ${names.join(' and ')} to your data pipeline.`;
    },
    rightPanel: {
      title: 'Data Transformations',
      subtitle: 'Enrich and clean your log sources',
      contentType: 'transformations',
    },
  },
  {
    title: 'Review and confirm',
    mainStep: 4,
    question: 'Here\u2019s a summary of your setup. Everything look good?',
    optionType: 'chips',
    options: [
      { key: 'deploy', label: 'Looks good \u2014 deploy my configuration' },
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
    mainStep: 5,
    question:
      'Your pipeline is deployed and data is flowing in! I\u2019m collecting logs, metrics, and traces from your sources. You can watch the live counts on the right \u2014 once you\u2019re satisfied, continue to finish setup.',
    optionType: 'chips',
    options: [{ key: 'continue', label: 'Continue' }],
    confirmation: () =>
      'Data collection verified. Your observability pipeline is active.',
    rightPanel: {
      title: 'Live Data Collection',
      subtitle: 'Watching your data flow in real-time',
      contentType: 'live-counters',
    },
  },
  {
    title: "You're all set!",
    mainStep: 6,
    question:
      'Your observability pipeline is live! Data is flowing into OpenSearch. Here are some next steps to explore.',
    optionType: 'chips',
    options: [
      { key: 'dashboards', label: 'Go to Dashboards' },
      { key: 'discover', label: 'Explore in Discover' },
      { key: 'alerts', label: 'Set up Alerts' },
      { key: 'more-sources', label: 'Add more data sources' },
    ],
    confirmation: null,
    rightPanel: {
      title: 'Observability Dashboard',
      subtitle: 'Your data is flowing',
      contentType: 'completion-dashboard',
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

const GettingStartedPanel = ({ selectedOption }) => {
  const cards = [
    {
      key: 'application',
      icon: 'app_code',
      title: 'Application Data',
      description: 'Instrument your code to collect traces, logs, and metrics.',
    },
    {
      key: 'cloud',
      icon: 'logo_cloud',
      title: 'Cloud Services',
      description:
        'Connect AWS, Azure, or GCP to stream infrastructure telemetry.',
    },
    {
      key: 'sample',
      icon: 'vis_area',
      title: 'Sample Data',
      description:
        'Explore pre-loaded datasets to see observability in action.',
    },
  ];

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="integrationObservability"
        title="Getting Started"
        subtitle="Choose your observability path"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__cardGrid">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`onboardWizard__previewCard${
              selectedOption === card.key
                ? ' onboardWizard__previewCard--active'
                : ''
            }`}>
            <OuiIcon type={card.icon} size="xl" />
            <OuiSpacer size="s" />
            <OuiText size="s">
              <strong>{card.title}</strong>
            </OuiText>
            <OuiText size="xs" color="subdued">
              <p style={{ margin: 0 }}>{card.description}</p>
            </OuiText>
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
      signals: { metrics: true, logs: true, traces: true },
      setupTime: '~5 min',
    },
    {
      key: 'eks',
      icon: 'logo_aws',
      name: 'EKS',
      badge: 'Managed service',
      signals: { metrics: true, logs: true, traces: true },
      setupTime: '~10 min',
    },
    {
      key: 'kubernetes',
      icon: 'logo_kubernetes',
      name: 'Kubernetes',
      badge: 'Self-managed',
      signals: { metrics: true, logs: true, traces: true },
      setupTime: '~8 min',
    },
    {
      key: 'other',
      icon: 'compute',
      name: 'Other',
      badge: 'Custom setup',
      signals: { metrics: true, logs: true, traces: false },
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
        {environments.map((env) => (
          <div
            key={env.key}
            className={`onboardWizard__envCard${
              selectedOption === env.key
                ? ' onboardWizard__envCard--selected'
                : ''
            }`}>
            <OuiIcon type={env.icon} size="l" />
            <OuiText size="s">
              <strong>{env.name}</strong>
            </OuiText>
            <span className="onboardWizard__envBadge">{env.badge}</span>
            <div className="onboardWizard__envSignals">
              {Object.entries(env.signals).map(([signal, supported]) => (
                <span key={signal} className="onboardWizard__envSignal">
                  <OuiIcon
                    type={supported ? 'check' : 'cross'}
                    size="s"
                    color={supported ? 'success' : 'subdued'}
                  />
                  <span>{signal}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__envDetail">
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

const DataSourcesPanel = ({ selectedOption, confirmed }) => {
  const providers = [
    {
      key: 'opensearch',
      icon: 'logo_opensearch',
      name: 'OpenSearch',
      subtitle: 'Search & analytics',
    },
    {
      key: 'prometheus',
      icon: 'logo_prometheus',
      name: 'Prometheus',
      subtitle: 'Metrics monitoring',
    },
    {
      key: 'cloudwatch',
      icon: 'logo_aws',
      name: 'CloudWatch',
      subtitle: 'AWS logs',
    },
    {
      key: 's3',
      icon: 'logo_aws',
      name: 'Amazon S3',
      subtitle: 'Object storage',
    },
  ];

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="database"
        title="Data Sources"
        subtitle="Where telemetry comes from"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__providerGrid">
        {providers.map((p) => (
          <div
            key={p.key}
            className={`onboardWizard__providerCard${
              selectedOption === p.key
                ? ' onboardWizard__providerCard--selected'
                : ''
            }`}>
            {confirmed && selectedOption === p.key && (
              <span className="onboardWizard__connectedBadge">Connected</span>
            )}
            <div className="onboardWizard__providerIcon">
              <OuiIcon type={p.icon} size="xl" />
            </div>
            <OuiText size="s">
              <strong>{p.name}</strong>
            </OuiText>
            <OuiText size="xs" color="subdued">
              <p style={{ margin: 0 }}>{p.subtitle}</p>
            </OuiText>
            {confirmed && selectedOption === p.key ? (
              <OuiText size="xs" className="onboardWizard__liveIndicator">
                <span className="onboardWizard__liveDot" />
                Live
              </OuiText>
            ) : (
              <OuiText size="xs" color="subdued">
                <p style={{ margin: 0 }}>Not connected</p>
              </OuiText>
            )}
          </div>
        ))}
      </div>
      {confirmed && selectedOption && selectedOption !== 'skip' && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__ingestPanel">
            <div className="onboardWizard__ingestHeader">
              <OuiText size="xs">
                <strong>LIVE INGEST</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                2,347 events/s
              </OuiText>
            </div>
            <OuiSpacer size="s" />
            <IngestRow label="Metrics" rate="~2,347/s" color="#00BFB3" />
            <IngestRow label="Logs" rate="~189/s" color="#006DE4" />
            <IngestRow label="Traces" rate="~56/s" color="#F5A700" />
          </div>
        </>
      )}
    </div>
  );
};

const TransformationsPanel = ({ selectedOption }) => {
  const selected = Array.isArray(selectedOption) ? selectedOption : [];

  const sampleLogBefore = {
    timestamp: '2024-03-15T14:32:01.234Z',
    level: 'INFO',
    message: 'User login successful',
    user_email: 'john.doe@example.com',
    ip_address: '192.168.1.42',
    user_name: 'John Doe',
  };

  const buildAfterLog = () => {
    const log = { ...sampleLogBefore };
    if (selected.includes('pii')) {
      log.user_email = '[REDACTED]';
      log.ip_address = '[REDACTED]';
      log.user_name = '[REDACTED]';
    }
    if (selected.includes('catalog')) {
      log['service.team'] = 'auth-platform';
      log['service.environment'] = 'production';
    }
    return log;
  };

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="logstash_filter"
        title="Data Transformations"
        subtitle="Enrich and clean your log sources"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__transformCompare">
        <div className="onboardWizard__transformBlock">
          <OuiText size="xs">
            <strong>Before</strong>
          </OuiText>
          <OuiSpacer size="xs" />
          <pre className="onboardWizard__logPreview">
            {JSON.stringify(sampleLogBefore, null, 2)}
          </pre>
        </div>
        <div className="onboardWizard__transformBlock">
          <OuiText size="xs">
            <strong>After</strong>
          </OuiText>
          <OuiSpacer size="xs" />
          <pre className="onboardWizard__logPreview">
            {selected.length === 0
              ? 'No transformations selected.'
              : JSON.stringify(buildAfterLog(), null, 2)}
          </pre>
        </div>
      </div>
      <OuiSpacer size="l" />
      <div className="onboardWizard__pipelineStatus">
        <OuiIcon type="checkInCircleFilled" size="s" color="success" />
        <OuiText size="xs">Connection valid &mdash; data flowing</OuiText>
      </div>
    </div>
  );
};

const SummaryPanel = ({ allSelections }) => {
  const summaryRows = [
    {
      label: 'Observation goal',
      stepIdx: 0,
      valueMap: {
        application: 'Collect data from your application',
        cloud: 'Connect with cloud services',
        sample: 'Get started with sample data',
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
      label: 'Data source',
      stepIdx: 3,
      valueMap: {
        opensearch: 'OpenSearch',
        prometheus: 'Prometheus',
        cloudwatch: 'Amazon CloudWatch Logs',
        s3: 'Amazon S3',
        skip: 'Skipped',
      },
    },
    {
      label: 'Transformations',
      stepIdx: 4,
      valueMap: {
        pii: 'Remove PII',
        catalog: 'Service catalog data',
      },
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
      <OuiSpacer size="l" />
      <div className="onboardWizard__estimatedResources">
        <OuiText size="xs">
          <strong>Estimated Resources</strong>
        </OuiText>
        <OuiSpacer size="xs" />
        <div className="onboardWizard__resourceGrid">
          <div className="onboardWizard__resourceItem">
            <OuiText size="xs" color="subdued">
              Storage/day
            </OuiText>
            <OuiText size="s">
              <strong>~8.5 GB</strong>
            </OuiText>
          </div>
          <div className="onboardWizard__resourceItem">
            <OuiText size="xs" color="subdued">
              Indices created
            </OuiText>
            <OuiText size="s">
              <strong>4</strong>
            </OuiText>
          </div>
          <div className="onboardWizard__resourceItem">
            <OuiText size="xs" color="subdued">
              Instance type
            </OuiText>
            <OuiText size="s">
              <strong>r6g.large</strong>
            </OuiText>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveCountersPanel = () => {
  const [counts, setCounts] = useState({
    logs: 1204,
    metrics: 8491,
    traces: 342,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        logs: prev.logs + Math.floor(Math.random() * 15) + 5,
        metrics: prev.metrics + Math.floor(Math.random() * 25) + 10,
        traces: prev.traces + Math.floor(Math.random() * 8) + 3,
      }));
    }, 1500);
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
          <div key={c.key} className="onboardWizard__counterRow">
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
            <span
              className="onboardWizard__counterDot"
              style={{ backgroundColor: c.color }}
            />
            <MiniSparkline color={c.color} />
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

const CompletionDashboardPanel = () => {
  const [eventCount, setEventCount] = useState(12847);

  useEffect(() => {
    const interval = setInterval(() => {
      setEventCount((prev) => prev + Math.floor(Math.random() * 30) + 10);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="dashboard"
        title="Observability Dashboard"
        subtitle="Your data is flowing"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__completionStatus">
        <span className="onboardWizard__healthBadge">
          <OuiIcon type="checkInCircleFilled" size="s" color="success" />
          Healthy
        </span>
      </div>
      <OuiSpacer size="m" />
      <div className="onboardWizard__completionStats">
        <div className="onboardWizard__completionStat">
          <OuiText size="xs" color="subdued">
            Ingestion rate
          </OuiText>
          <OuiTitle size="s">
            <h4>{eventCount.toLocaleString()}</h4>
          </OuiTitle>
          <OuiText size="xs" color="subdued">
            events/min
          </OuiText>
        </div>
        <div className="onboardWizard__completionStat">
          <OuiText size="xs" color="subdued">
            Indices created
          </OuiText>
          <OuiTitle size="s">
            <h4>4</h4>
          </OuiTitle>
          <OuiText size="xs" color="subdued">
            active
          </OuiText>
        </div>
        <div className="onboardWizard__completionStat">
          <OuiText size="xs" color="subdued">
            Avg latency
          </OuiText>
          <OuiTitle size="s">
            <h4>12ms</h4>
          </OuiTitle>
          <OuiText size="xs" color="subdued">
            p95
          </OuiText>
        </div>
      </div>
      <OuiSpacer size="l" />
      <div className="onboardWizard__quickLinks">
        <OuiText size="xs">
          <strong>Quick Links</strong>
        </OuiText>
        <OuiSpacer size="s" />
        <div className="onboardWizard__quickLinkRow">
          <QuickLink icon="documentation" label="Documentation" />
          <QuickLink icon="users" label="Community" />
          <QuickLink icon="help" label="Support" />
          <QuickLink icon="app_console" label="API Reference" />
        </div>
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

const MiniSparkline = ({ color }) => {
  const points = Array.from({ length: 8 }, () => Math.random() * 24 + 4);
  const path = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 10} ${28 - y}`)
    .join(' ');

  return (
    <svg
      className="onboardWizard__miniSparkline"
      viewBox="0 0 70 28"
      fill="none"
      aria-hidden="true">
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const QuickLink = ({ icon, label }) => (
  <button type="button" className="onboardWizard__quickLink">
    <OuiIcon type={icon} size="s" />
    <OuiText size="xs">{label}</OuiText>
  </button>
);

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
      return <GettingStartedPanel selectedOption={selectedOption} />;
    case 'environment':
      return <EnvironmentPanel selectedOption={selectedOption} />;
    case 'collector-setup':
      return <CollectorSetupPanel confirmed={confirmed} />;
    case 'data-sources':
      return (
        <DataSourcesPanel
          selectedOption={selectedOption}
          confirmed={confirmed}
        />
      );
    case 'transformations':
      return <TransformationsPanel selectedOption={selectedOption} />;
    case 'summary':
      return <SummaryPanel allSelections={allSelections} />;
    case 'live-counters':
      return <LiveCountersPanel />;
    case 'completion-dashboard':
      return <CompletionDashboardPanel />;
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
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [confirmedSteps, setConfirmedSteps] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const feedRef = useRef(null);

  const totalSteps = STEPS.length;
  const totalMainSteps = STEPS[STEPS.length - 1].mainStep;
  const step = STEPS[currentStep];
  const currentSelection = selections[currentStep] || null;
  const isConfirmed = !!confirmedSteps[currentStep];

  // Auto-scroll feed to bottom when conversation changes
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [currentStep, isConfirmed, isProcessing]);

  const handleChipSelect = useCallback(
    (key) => {
      if (isConfirmed || isProcessing) return;

      // Step 3 "Go back" navigates back
      if (currentStep === 2 && key === 'goback') {
        setCurrentStep(1);
        return;
      }

      setSelections((prev) => ({ ...prev, [currentStep]: key }));
      setIsProcessing(true);
      setTimeout(() => {
        setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
        setIsProcessing(false);
      }, 1200);
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
    }, 1200);
  }, [currentStep, isProcessing]);

  const handleSkip = useCallback(() => {
    if (isConfirmed || isProcessing) return;
    setSelections((prev) => ({ ...prev, [currentStep]: [] }));
    setIsProcessing(true);
    setTimeout(() => {
      setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
      setIsProcessing(false);
    }, 800);
  }, [currentStep, isConfirmed, isProcessing]);

  // Auto-advance to next step after confirmation (with brief delay to show confirmation)
  useEffect(() => {
    if (isConfirmed && currentStep < totalSteps - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, currentStep, totalSteps]);

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

  const handleFinishLater = () => {
    window.location.hash = '/sample-pages';
  };

  // Step 8: selections navigate away
  const handleFinalNavigation = () => {
    window.location.hash = '/sample-pages';
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    // Use message text as a chip selection for the current step
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

    // Current step: assistant question
    messages.push(
      <div key={`q-${currentStep}`} className="threadPage__message threadPage__message--assistant">
        <div className="threadPage__bubble threadPage__bubble--assistant">
          <OuiText size="s">
            <p>{step.question}</p>
          </OuiText>
          <OuiSpacer size="m" />
          {/* Render interactive options inside the assistant message */}
          {renderOptions()}
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
        <div className="onboardWizard__chips">
          {step.options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`onboardWizard__chip${
                currentSelection === opt.key
                  ? ' onboardWizard__chip--selected'
                  : ''
              }`}
              onClick={() =>
                isLastStep
                  ? handleFinalNavigation(opt.key)
                  : handleChipSelect(opt.key)
              }
              disabled={isConfirmed || isProcessing}>
              {opt.label}
            </button>
          ))}
        </div>
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

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      {/* Minimal left nav — logo only */}
      <nav className="samplePagesLeftNav" aria-label="Main navigation">
        <div className="samplePagesLeftNav__header">
          <OuiToolTip content="OpenSearch" position="right">
            <button
              type="button"
              className="samplePagesLeftNav__logoButton"
              aria-label="OpenSearch home">
              <OuiIcon type="logoOpenSearch" size="l" aria-hidden="true" />
            </button>
          </OuiToolTip>
        </div>
      </nav>

      {/* Content area with chrome panel */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: '8px 8px 8px 0',
          display: 'flex',
        }}>
        <div
          className="samplePagesContentPanel"
          style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div className="onboardWizard">
            {/* Left Panel — Thread-style chat interaction */}
            <div className="threadPage__body" style={{ flex: '0 0 38%', minWidth: 320, maxWidth: 480 }}>
              <div className="threadPage__conversationCol">
                {/* Step indicator header */}
                <div className="onboardWizard__stepIndicator" style={{ padding: '12px 16px 0' }}>
                  <OuiTitle size="xxxs">
                    <h5>Step {step.mainStep} of {totalMainSteps}</h5>
                  </OuiTitle>
                  <OuiTitle size="xs">
                    <h3>{step.title}</h3>
                  </OuiTitle>
                  {currentStep > 0 && (
                    <div className="onboardWizard__timeline" style={{ marginTop: 8 }}>
                      {Array.from({ length: totalMainSteps }, (_, mainIdx) => {
                        const mainNum = mainIdx + 1;
                        const isMainDone = step.mainStep > mainNum;
                        const isMainCurrent = step.mainStep === mainNum;
                        if (!isMainDone && !isMainCurrent) return null;
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
                        return (
                          <span
                            key={mainIdx}
                            className="onboardWizard__timelineDot onboardWizard__timelineDot--current"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Conversation feed — reuses threadPage__feed pattern */}
                <div className="threadPage__feed" ref={feedRef}>
                  {buildConversation()}
                </div>

                {/* Input area — reuses threadPage__inputArea pattern */}
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

            {/* Right Panel */}
            <div className="onboardWizard__right">
              <div className="onboardWizard__rightPanel">
                <RightPanelContent
                  step={step}
                  selectedOption={currentSelection}
                  confirmed={isConfirmed}
                  allSelections={selections}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="onboardWizard__footer">
              <button
                type="button"
                className="onboardWizard__finishLater"
                onClick={handleFinishLater}>
                Finish onboarding later
              </button>
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
