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

import React, { useState, useEffect, useRef } from 'react';

import {
  OuiIcon,
  OuiText,
  OuiTitle,
  OuiSpacer,
  OuiFlexGroup,
  OuiFlexItem,
  OuiLoadingSpinner,
} from '../../../../src/components';

/**
 * STEPS CONFIGURATION
 * Each step defines:
 *  - title: shown in the step indicator
 *  - question: the system message / prompt
 *  - optionType: 'chips' | 'cards'
 *  - options: array of { key, label, icon? }
 *  - confirmation: function(selectedKey) => string shown in DONE card
 *  - rightPanel: { title, subtitle, content (React element or function(selectedKey, confirmed)) }
 */
const STEPS = [
  {
    title: 'Choose your goal',
    question:
      'Welcome! What would you like to set up with OpenSearch Observability?',
    optionType: 'cards',
    options: [
      {
        key: 'monitor-infra',
        label: 'Monitor infrastructure',
        description: 'Track servers, containers, and cloud resources',
        icon: 'monitoringApp',
      },
      {
        key: 'app-perf',
        label: 'Application performance',
        description: 'Trace requests, measure latency, find bottlenecks',
        icon: 'apmTrace',
      },
      {
        key: 'log-analytics',
        label: 'Log analytics',
        description: 'Centralize, search, and analyze application logs',
        icon: 'logsApp',
      },
    ],
    confirmation: (selected) => {
      const labels = {
        'monitor-infra': 'infrastructure monitoring',
        'app-perf': 'application performance monitoring',
        'log-analytics': 'log analytics',
      };
      return `Setting up ${
        labels[selected] || selected
      }. Let's configure your environment.`;
    },
    rightPanel: {
      title: 'Observability overview',
      subtitle: 'What you can monitor',
      contentType: 'info',
    },
  },
  {
    title: 'Select your environment',
    question: 'What environment is your application running in?',
    optionType: 'chips',
    options: [
      { key: 'kubernetes', label: 'Kubernetes' },
      { key: 'docker', label: 'Docker' },
      { key: 'ec2', label: 'EC2 / VMs' },
      { key: 'lambda', label: 'Serverless' },
      { key: 'bare-metal', label: 'Bare metal' },
    ],
    confirmation: (selected) => {
      const labels = {
        kubernetes: 'Kubernetes',
        docker: 'Docker',
        ec2: 'EC2 / VMs',
        lambda: 'Serverless',
        'bare-metal': 'Bare metal',
      };
      return `Environment: ${
        labels[selected] || selected
      }. I'll tailor the collector setup for this.`;
    },
    rightPanel: {
      title: 'Environment details',
      subtitle: 'How data will be collected',
      contentType: 'info',
    },
  },
  {
    title: 'Connect your data source',
    question:
      'Next: hook up your telemetry. Where does your infrastructure live?',
    optionType: 'chips',
    options: [
      { key: 'aws', label: 'AWS' },
      { key: 'azure', label: 'Azure' },
      { key: 'gcp', label: 'GCP' },
      { key: 'on-prem', label: 'On-premises' },
    ],
    confirmation: (selected) => {
      const labels = {
        aws: 'AWS',
        azure: 'Azure',
        gcp: 'GCP',
        'on-prem': 'On-premises',
      };
      const counts = {
        aws: '8 services and 56 log groups',
        azure: '6 services and 42 log groups',
        gcp: '5 services and 38 log groups',
        'on-prem': '4 services and 22 log groups',
      };
      return `Connected to ${labels[selected]}. I'm seeing ${
        counts[selected] || '4 services and 20 log groups'
      }.`;
    },
    rightPanel: {
      title: 'Data sources',
      subtitle: 'Where telemetry comes from',
      contentType: 'data-sources',
    },
  },
  {
    title: 'Choose signals',
    question: 'Which telemetry signals do you want to collect?',
    optionType: 'chips',
    multiSelect: true,
    options: [
      { key: 'metrics', label: 'Metrics' },
      { key: 'logs', label: 'Logs' },
      { key: 'traces', label: 'Traces' },
    ],
    confirmation: (selected) => {
      if (Array.isArray(selected)) {
        return `Collecting: ${selected.join(', ')}. Configuring pipelines now.`;
      }
      return `Collecting: ${selected}. Configuring pipelines now.`;
    },
    rightPanel: {
      title: 'Signal configuration',
      subtitle: 'What data will be ingested',
      contentType: 'signals',
    },
  },
  {
    title: 'Configure retention',
    question: 'How long should we retain your observability data?',
    optionType: 'chips',
    options: [
      { key: '7d', label: '7 days' },
      { key: '30d', label: '30 days' },
      { key: '90d', label: '90 days' },
      { key: '1y', label: '1 year' },
      { key: 'custom', label: 'Custom' },
    ],
    confirmation: (selected) => {
      const labels = {
        '7d': '7 days',
        '30d': '30 days',
        '90d': '90 days',
        '1y': '1 year',
        custom: 'custom period',
      };
      return `Retention set to ${
        labels[selected] || selected
      }. Index lifecycle policies configured.`;
    },
    rightPanel: {
      title: 'Storage estimate',
      subtitle: 'Projected data usage',
      contentType: 'retention',
    },
  },
  {
    title: 'Review and finish',
    question:
      'Everything is configured. Review your setup and start collecting data.',
    optionType: 'chips',
    options: [
      { key: 'start', label: 'Start collecting' },
      { key: 'edit', label: 'Edit configuration' },
    ],
    confirmation: (selected) => {
      if (selected === 'start')
        return 'Data collection started. Your dashboards are being prepared.';
      return 'Going back to edit configuration.';
    },
    rightPanel: {
      title: 'Setup summary',
      subtitle: 'Your configuration',
      contentType: 'summary',
    },
  },
];

// Cloud provider card for the data sources step
const ProviderCard = ({ provider, isSelected, isConnected }) => {
  const providers = {
    aws: { name: 'AWS', subtitle: 'Amazon Web Services', icon: 'logoAWS' },
    azure: { name: 'Azure', subtitle: 'Microsoft Azure', icon: 'logoAzure' },
    gcp: { name: 'GCP', subtitle: 'Google Cloud Platform', icon: 'logoGCP' },
    'on-prem': {
      name: 'On-prem',
      subtitle: 'Self-managed servers',
      icon: 'compute',
    },
  };
  const p = providers[provider] || {
    name: provider,
    subtitle: '',
    icon: 'node',
  };

  return (
    <div
      className={`onboardWizard__providerCard${
        isSelected ? ' onboardWizard__providerCard--selected' : ''
      }`}>
      {isConnected && (
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
      {isConnected ? (
        <OuiText size="xs" className="onboardWizard__liveIndicator">
          <span className="onboardWizard__liveDot" />
          Live
        </OuiText>
      ) : (
        <OuiText size="xs" color="subdued">
          <p style={{ margin: 0 }}>+ Not connected</p>
        </OuiText>
      )}
    </div>
  );
};

// Live ingest sparkline row (mocked)
const IngestRow = ({ label, rate, color }) => {
  // Generate mock sparkline dots
  const dots = Array.from({ length: 12 }, (_, i) => (
    <span
      key={i}
      className="onboardWizard__sparkDot"
      style={{
        backgroundColor: color,
        opacity: 0.4 + Math.random() * 0.6,
        width: 8,
        height: 8,
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
      <span className="onboardWizard__ingestToggle">
        <OuiIcon type="eye" size="s" color="subdued" />
      </span>
    </div>
  );
};

// Right panel content renderer
const RightPanelContent = ({
  step,
  selectedOption,
  confirmed,
  allSelections,
}) => {
  const { rightPanel } = step;

  if (rightPanel.contentType === 'data-sources') {
    const providers = ['aws', 'azure', 'gcp', 'on-prem'];
    return (
      <div className="onboardWizard__rightContent">
        <div className="onboardWizard__rightHeader">
          <OuiIcon type="database" size="m" />
          <div>
            <OuiTitle size="xs">
              <h3>{rightPanel.title}</h3>
            </OuiTitle>
            <OuiText size="xs" color="subdued">
              {rightPanel.subtitle}
            </OuiText>
          </div>
        </div>
        <OuiSpacer size="m" />
        <div className="onboardWizard__providerGrid">
          {providers.map((p) => (
            <ProviderCard
              key={p}
              provider={p}
              isSelected={selectedOption === p}
              isConnected={confirmed && selectedOption === p}
            />
          ))}
        </div>
        {confirmed && (
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
              <IngestRow label="METRICS" rate="~2,347/s" color="#00BFB3" />
              <IngestRow label="LOGS" rate="~189/s" color="#006DE4" />
              <IngestRow label="TRACES" rate="~56/s" color="#F5A700" />
            </div>
          </>
        )}
      </div>
    );
  }

  if (rightPanel.contentType === 'signals') {
    const signalInfo = {
      metrics: {
        icon: 'visArea',
        description:
          'Numeric measurements collected at intervals — CPU, memory, request counts, latency percentiles.',
      },
      logs: {
        icon: 'logsApp',
        description:
          'Structured or unstructured text records from applications, services, and infrastructure.',
      },
      traces: {
        icon: 'apmTrace',
        description:
          'Distributed traces following requests across service boundaries with timing data.',
      },
    };
    const selected = Array.isArray(selectedOption)
      ? selectedOption
      : selectedOption
      ? [selectedOption]
      : [];

    return (
      <div className="onboardWizard__rightContent">
        <div className="onboardWizard__rightHeader">
          <OuiIcon type="visPie" size="m" />
          <div>
            <OuiTitle size="xs">
              <h3>{rightPanel.title}</h3>
            </OuiTitle>
            <OuiText size="xs" color="subdued">
              {rightPanel.subtitle}
            </OuiText>
          </div>
        </div>
        <OuiSpacer size="m" />
        <div className="onboardWizard__signalList">
          {Object.entries(signalInfo).map(([key, info]) => (
            <div
              key={key}
              className={`onboardWizard__signalCard${
                selected.includes(key)
                  ? ' onboardWizard__signalCard--active'
                  : ''
              }`}>
              <OuiIcon type={info.icon} size="l" />
              <div>
                <OuiText size="s">
                  <strong style={{ textTransform: 'capitalize' }}>{key}</strong>
                </OuiText>
                <OuiText size="xs" color="subdued">
                  <p style={{ margin: 0 }}>{info.description}</p>
                </OuiText>
              </div>
              {selected.includes(key) && (
                <OuiIcon
                  type="checkInCircleFilled"
                  color="success"
                  className="onboardWizard__signalCheck"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rightPanel.contentType === 'retention') {
    const estimates = {
      '7d': { storage: '~2.1 GB', cost: 'Low' },
      '30d': { storage: '~8.7 GB', cost: 'Moderate' },
      '90d': { storage: '~25 GB', cost: 'High' },
      '1y': { storage: '~95 GB', cost: 'Very high' },
      custom: { storage: 'Varies', cost: 'Custom' },
    };
    const est = estimates[selectedOption] || { storage: '—', cost: '—' };

    return (
      <div className="onboardWizard__rightContent">
        <div className="onboardWizard__rightHeader">
          <OuiIcon type="storage" size="m" />
          <div>
            <OuiTitle size="xs">
              <h3>{rightPanel.title}</h3>
            </OuiTitle>
            <OuiText size="xs" color="subdued">
              {rightPanel.subtitle}
            </OuiText>
          </div>
        </div>
        <OuiSpacer size="l" />
        <div className="onboardWizard__retentionStats">
          <div className="onboardWizard__statCard">
            <OuiText size="xs" color="subdued">
              Estimated storage
            </OuiText>
            <OuiTitle size="m">
              <h4>{est.storage}</h4>
            </OuiTitle>
          </div>
          <div className="onboardWizard__statCard">
            <OuiText size="xs" color="subdued">
              Cost tier
            </OuiText>
            <OuiTitle size="m">
              <h4>{est.cost}</h4>
            </OuiTitle>
          </div>
        </div>
      </div>
    );
  }

  if (rightPanel.contentType === 'summary') {
    return (
      <div className="onboardWizard__rightContent">
        <div className="onboardWizard__rightHeader">
          <OuiIcon type="checkInCircleFilled" size="m" color="success" />
          <div>
            <OuiTitle size="xs">
              <h3>{rightPanel.title}</h3>
            </OuiTitle>
            <OuiText size="xs" color="subdued">
              {rightPanel.subtitle}
            </OuiText>
          </div>
        </div>
        <OuiSpacer size="l" />
        <div className="onboardWizard__summaryList">
          {Object.entries(allSelections).map(([stepIdx, val]) => {
            const s = STEPS[stepIdx];
            if (!s || val == null) return null;
            const display = Array.isArray(val) ? val.join(', ') : val;
            return (
              <div key={stepIdx} className="onboardWizard__summaryRow">
                <OuiText size="xs" color="subdued">
                  {s.title}
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
  }

  // Default info panel
  return (
    <div className="onboardWizard__rightContent">
      <div className="onboardWizard__rightHeader">
        <OuiIcon type="iInCircle" size="m" />
        <div>
          <OuiTitle size="xs">
            <h3>{rightPanel.title}</h3>
          </OuiTitle>
          <OuiText size="xs" color="subdued">
            {rightPanel.subtitle}
          </OuiText>
        </div>
      </div>
      <OuiSpacer size="l" />
      <div className="onboardWizard__infoPlaceholder">
        <OuiText size="s" color="subdued" style={{ textAlign: 'center' }}>
          <p>Select an option to see more details here.</p>
        </OuiText>
      </div>
    </div>
  );
};

export const OnboardingWizardPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [confirmedSteps, setConfirmedSteps] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];

  const currentSelection = selections[currentStep] || null;
  const isConfirmed = !!confirmedSteps[currentStep];

  const handleOptionSelect = (key) => {
    if (isConfirmed || isProcessing) return;

    if (step.multiSelect) {
      const current = Array.isArray(selections[currentStep])
        ? selections[currentStep]
        : [];
      const updated = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      setSelections({ ...selections, [currentStep]: updated });
    } else {
      setSelections({ ...selections, [currentStep]: key });
      // Auto-confirm after a brief delay for single-select
      setIsProcessing(true);
      setTimeout(() => {
        setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
        setIsProcessing(false);
      }, 1200);
    }
  };

  const handleMultiSelectConfirm = () => {
    if (
      !currentSelection ||
      (Array.isArray(currentSelection) && currentSelection.length === 0)
    )
      return;
    setIsProcessing(true);
    setTimeout(() => {
      setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
      setIsProcessing(false);
    }, 1200);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinishLater = () => {
    window.location.hash = '/sample-pages';
  };

  const isOptionSelected = (key) => {
    if (step.multiSelect) {
      return Array.isArray(currentSelection) && currentSelection.includes(key);
    }
    return currentSelection === key;
  };

  return (
    <div className="onboardWizard">
      {/* Left Panel */}
      <div className="onboardWizard__left">
        <div className="onboardWizard__leftInner">
          {/* Step indicator */}
          <div className="onboardWizard__stepIndicator">
            <OuiText size="xs" color="subdued">
              Step {currentStep + 1}/{totalSteps} · {step.title}
            </OuiText>
          </div>

          <OuiSpacer size="l" />

          {/* Question */}
          <div className="onboardWizard__question">
            <OuiText size="s">
              <p>{step.question}</p>
            </OuiText>
          </div>

          <OuiSpacer size="m" />

          {/* Options */}
          {step.optionType === 'chips' && (
            <div className="onboardWizard__chips">
              {step.options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`onboardWizard__chip${
                    isOptionSelected(opt.key)
                      ? ' onboardWizard__chip--selected'
                      : ''
                  }`}
                  onClick={() => handleOptionSelect(opt.key)}
                  disabled={isConfirmed || isProcessing}>
                  {opt.label}
                </button>
              ))}
              {step.multiSelect && !isConfirmed && (
                <button
                  type="button"
                  className="onboardWizard__chip onboardWizard__chip--confirm"
                  onClick={handleMultiSelectConfirm}
                  disabled={
                    !currentSelection ||
                    (Array.isArray(currentSelection) &&
                      currentSelection.length === 0) ||
                    isProcessing
                  }>
                  Confirm
                </button>
              )}
            </div>
          )}

          {step.optionType === 'cards' && (
            <div className="onboardWizard__optionCards">
              {step.options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`onboardWizard__optionCard${
                    isOptionSelected(opt.key)
                      ? ' onboardWizard__optionCard--selected'
                      : ''
                  }`}
                  onClick={() => handleOptionSelect(opt.key)}
                  disabled={isConfirmed || isProcessing}>
                  {opt.icon && <OuiIcon type={opt.icon} size="l" />}
                  <div>
                    <OuiText size="s">
                      <strong>{opt.label}</strong>
                    </OuiText>
                    {opt.description && (
                      <OuiText size="xs" color="subdued">
                        <p style={{ margin: 0 }}>{opt.description}</p>
                      </OuiText>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <>
              <OuiSpacer size="m" />
              <div className="onboardWizard__processing">
                <OuiLoadingSpinner size="s" />
                <OuiText size="xs" color="subdued">
                  Processing...
                </OuiText>
              </div>
            </>
          )}

          {/* Progress dots */}
          <div className="onboardWizard__progressDots">
            <span className="onboardWizard__dotLine" />
            <span
              className={`onboardWizard__dot${
                isConfirmed ? ' onboardWizard__dot--done' : ''
              }`}
            />
          </div>

          {/* Confirmation card */}
          {isConfirmed && (
            <div className="onboardWizard__confirmation">
              <div className="onboardWizard__confirmIcon">
                <OuiIcon type="checkInCircleFilled" size="m" color="success" />
                <OuiText size="xs">
                  <strong>DONE</strong>
                </OuiText>
              </div>
              <OuiText size="s">
                <p>{step.confirmation(currentSelection)}</p>
              </OuiText>
            </div>
          )}

          {/* Next / Advance */}
          {isConfirmed && currentStep < totalSteps - 1 && (
            <>
              <OuiSpacer size="m" />
              <button
                type="button"
                className="onboardWizard__nextBtn"
                onClick={handleNextStep}>
                Continue →
              </button>
            </>
          )}

          {/* Final step completion */}
          {isConfirmed &&
            currentStep === totalSteps - 1 &&
            currentSelection === 'start' && (
              <>
                <OuiSpacer size="m" />
                <button
                  type="button"
                  className="onboardWizard__nextBtn"
                  onClick={() => {
                    window.location.hash = '/sample-pages';
                  }}>
                  Go to dashboard →
                </button>
              </>
            )}
        </div>

        {/* Input area placeholder at bottom */}
        <div className="onboardWizard__inputArea">
          <div className="onboardWizard__inputPlaceholder">
            <OuiText size="xs" color="subdued">
              Ask anything or use / for commands
            </OuiText>
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
  );
};
