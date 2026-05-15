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

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import {
  OuiButtonEmpty,
  OuiCompressedFieldText,
  OuiHorizontalRule,
  OuiListGroup,
  OuiListGroupItem,
  OuiOverlayMask,
  OuiText,
} from '../../../../src/components';

// All searchable items grouped by section, matching the left nav panel data
const SEARCH_SECTIONS = [
  {
    section: 'Thread',
    page: 'thread',
    items: [
      {
        key: 'latency-spike',
        label: 'Latency spike investigation',
        subtitle: 'Sarah Lee · 2 hours ago',
      },
      {
        key: 'checkout-error',
        label: 'Checkout error rate alert',
        subtitle: 'Alex Chen · 5 hours ago',
      },

      {
        key: 'disk-pressure',
        label: 'Node disk pressure alerts',
        subtitle: 'Riley Tanaka · 1 day ago',
      },
    ],
  },
  {
    section: 'Logs',
    page: 'logs',
    items: [
      { key: 'error-rate', label: 'Error rate by service', subtitle: 'Logs' },
      { key: 'auth-failures', label: 'Auth failure events', subtitle: 'Logs' },
      { key: 'slow-queries', label: 'Slow query log', subtitle: 'Logs' },
    ],
  },
  {
    section: 'Metrics',
    page: 'metrics',
    items: [
      { key: 'throughput', label: 'Throughput over time', subtitle: 'Metrics' },
      { key: 'cpu-utilization', label: 'CPU utilization', subtitle: 'Metrics' },
      { key: 'memory-pressure', label: 'Memory pressure', subtitle: 'Metrics' },
    ],
  },
  {
    section: 'APM',
    page: 'service',
    items: [{ key: 'services', label: 'Services', subtitle: 'APM overview' }],
  },
  {
    section: 'Alerting',
    page: 'alerts',
    items: [
      {
        key: 'cpu-threshold',
        label: 'CPU threshold exceeded',
        subtitle: 'Critical · Triggered 10 min ago',
      },
      {
        key: 'disk-usage',
        label: 'Disk usage warning',
        subtitle: 'Warning · Triggered 1 hour ago',
      },
      {
        key: 'error-rate-spike',
        label: 'Error rate spike',
        subtitle: 'Critical · Triggered 3 hours ago',
      },
      {
        key: 'uptime-monitor',
        label: 'Uptime monitor',
        subtitle: 'HTTP · Every 5 min · Active',
      },
      {
        key: 'latency-monitor',
        label: 'Latency threshold',
        subtitle: 'Query · Every 1 min · Active',
      },
      {
        key: 'log-volume-monitor',
        label: 'Log volume spike',
        subtitle: 'Bucket · Every 10 min · Paused',
      },
      {
        key: 'slack-ops',
        label: 'Slack #ops-alerts',
        subtitle: 'Slack · Verified',
      },
      {
        key: 'pagerduty-critical',
        label: 'PagerDuty critical',
        subtitle: 'PagerDuty · Verified',
      },
      {
        key: 'email-oncall',
        label: 'On-call email group',
        subtitle: 'Email · Verified',
      },
    ],
  },
  {
    section: 'Dashboards',
    page: 'dashboards',
    items: [
      {
        key: 'system-overview',
        label: 'System overview',
        subtitle: 'Updated 5 min ago',
      },
      {
        key: 'web-traffic',
        label: 'Web traffic analytics',
        subtitle: 'Updated 15 min ago',
      },
      {
        key: 'api-performance',
        label: 'API performance',
        subtitle: 'Updated 30 min ago',
      },
      {
        key: 'incident-notes',
        label: 'Incident postmortem notes',
        subtitle: 'Last edited 2 hours ago',
      },
      {
        key: 'runbook-checklist',
        label: 'Runbook checklist',
        subtitle: 'Last edited 1 day ago',
      },
      {
        key: 'capacity-planning',
        label: 'Capacity planning notes',
        subtitle: 'Last edited 3 days ago',
      },
    ],
  },
  {
    section: 'Skills',
    page: 'skills',
    items: [
      {
        key: 'anomaly-detector',
        label: 'Anomaly detector',
        subtitle: 'ML · Active',
      },
      {
        key: 'log-summarizer',
        label: 'Log summarizer',
        subtitle: 'NLP · Active',
      },
      {
        key: 'root-cause-analysis',
        label: 'Root cause analysis',
        subtitle: 'ML · Draft',
      },
    ],
  },
  {
    section: 'Assets',
    page: 'assets',
    items: [
      {
        key: 'web-server-fleet',
        label: 'Web server fleet',
        subtitle: '12 hosts · Healthy',
      },
      {
        key: 'payment-gateway',
        label: 'Payment gateway',
        subtitle: '3 endpoints · Warning',
      },
      {
        key: 'data-pipeline',
        label: 'Data pipeline cluster',
        subtitle: '8 nodes · Healthy',
      },
      {
        key: 'region-latency-map',
        label: 'Region latency map',
        subtitle: 'Geo · Updated 10 min ago',
      },
      {
        key: 'traffic-origin-map',
        label: 'Traffic origin map',
        subtitle: 'Geo · Updated 30 min ago',
      },
      {
        key: 'cdn-coverage-map',
        label: 'CDN coverage map',
        subtitle: 'Geo · Updated 1 hour ago',
      },
    ],
  },
  {
    section: 'Workspace',
    page: 'manage-workspace',
    items: [
      {
        key: 'workspace-details',
        label: 'Workspace details',
        subtitle: 'Configs',
      },
      { key: 'collaborators', label: 'Collaborators', subtitle: 'Configs' },
      { key: 'index-patterns', label: 'Index patterns', subtitle: 'Configs' },
      { key: 'sample-data', label: 'Sample data', subtitle: 'Configs' },
      {
        key: 'faos219prod',
        label: 'FAOS219prod',
        subtitle: 'OpenSearch 2.19 · Production cluster',
      },
      {
        key: 'os-219',
        label: 'OS 219',
        subtitle: 'OpenSearch 2.19 · Development cluster',
      },
      {
        key: 'olly-stable-default',
        label: 'Olly@stableDefault',
        subtitle: 'OpenSearch · Observability default data source',
      },
      {
        key: 'flow219',
        label: 'flow219',
        subtitle: 'OpenSearch 2.19 · Flow framework testing',
      },
      {
        key: 'otel',
        label: 'otel',
        subtitle: 'OpenSearch · OpenTelemetry data ingestion',
      },
      {
        key: 'playground-otel-domain',
        label: 'playground-otel-domain',
        subtitle: 'OpenSearch · OTel playground environment',
      },
      {
        key: 'xinyuan-latest-model-test',
        label: 'xinyuan-latest-model-test',
        subtitle: 'OpenSearch · ML model testing cluster',
      },
    ],
  },
];

// Build a flat lookup: item key → page key
const ITEM_TO_PAGE = {};
SEARCH_SECTIONS.forEach(({ page, items }) => {
  items.forEach(({ key }) => {
    ITEM_TO_PAGE[key] = page;
  });
});

export const SearchPopover = ({ isOpen, onClose, onNavigate, onAskAi }) => {
  const [query, setQuery] = useState('');
  const popoverRef = useRef(null);
  const inputRef = useRef(null);

  // Reset state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Auto-focus the search input when opened
  // Longer delay needed because OuiOverlayMask renders via a portal
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);


  // Filter items by query
  const filteredSections = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return SEARCH_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          section.section.toLowerCase().includes(q)
      ),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  const handleItemClick = useCallback(
    (itemKey) => {
      const page = ITEM_TO_PAGE[itemKey];
      if (page && onNavigate) {
        onNavigate(page, itemKey);
      }
      onClose();
    },
    [onNavigate, onClose]
  );

  const handleAskAi = useCallback(() => {
    const text = query.trim();
    onClose();
    if (onAskAi) {
      onAskAi(text);
    }
  }, [query, onClose, onAskAi]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;
  const hasResults = filteredSections.length > 0;

  return (
    <OuiOverlayMask onClick={onClose} headerZindexLocation="below">
    <div ref={popoverRef} className="searchPopover">
      {/* Search input */}
      <div className="searchPopover__input">
        <div className="searchPopover__inputWrapper">
          <OuiCompressedFieldText
            inputRef={inputRef}
            placeholder="Search anything or Ask AI"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
          />
          {hasQuery && (
            <OuiButtonEmpty
              className="searchPopover__askAiButton"
              size="s"
              iconType="generate"
              onClick={handleAskAi}>
              Ask AI
            </OuiButtonEmpty>
          )}
        </div>
      </div>

      {/* Results — only show when typing */}
      {hasQuery && (
        <div className="searchPopover__body">
          {!hasResults ? (
            <div className="searchPopover__empty">
              <OuiText size="s" color="subdued">
                <p>No results found</p>
              </OuiText>
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.section} className="searchPopover__section">
                <div className="searchPopover__sectionTitle">
                  <OuiText size="xs" color="subdued">
                    <strong>{section.section}</strong>
                  </OuiText>
                </div>
                <OuiListGroup gutterSize="none" maxWidth={false}>
                  {section.items.map((item, index) => (
                    <React.Fragment key={item.key}>
                      {index > 0 && (
                        <div className="searchPopover__ruleDivider">
                          <OuiHorizontalRule margin="none" />
                        </div>
                      )}
                      <OuiListGroupItem
                        label={
                          <div>
                            <OuiText size="s">
                              <strong>{item.label}</strong>
                            </OuiText>
                            {item.subtitle && (
                              <OuiText size="xs" color="subdued">
                                {item.subtitle}
                              </OuiText>
                            )}
                          </div>
                        }
                        onClick={() => handleItemClick(item.key)}
                      />
                    </React.Fragment>
                  ))}
                </OuiListGroup>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    </OuiOverlayMask>
  );
};
