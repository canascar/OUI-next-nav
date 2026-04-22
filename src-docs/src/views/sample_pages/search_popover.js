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
  OuiButtonIcon,
  OuiCompressedFieldText,
  OuiHorizontalRule,
  OuiIcon,
  OuiListGroup,
  OuiListGroupItem,
  OuiText,
} from '../../../../src/components';

// Mock AI responses (same pool as Ask AI popover)
const MOCK_AI_RESPONSES = [
  'I looked into this and found a few things worth noting. The service metrics show a gradual increase in P99 latency over the past 6 hours. Error rates remain within acceptable thresholds but are trending upward. I recommend checking the downstream dependency health and reviewing recent config changes.',
  'Based on the available data, the connection pool utilization is at 87%, approaching the configured limit. Garbage collection pauses have increased by 40% compared to last week. Consider scaling horizontally or increasing the connection pool ceiling.',
  'The spike aligns with a traffic surge from the EU region starting at 14:32 UTC. Cache hit ratio dropped from 94% to 61% during the same window. The system should stabilize once the cache warms back up.',
  'Here is a quick health check: cart is healthy at 4ms latency, checkout is degraded with 12.3% error rate, and payment-service is unhealthy with 67% connection timeouts. The payment-service is the bottleneck.',
];

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
        key: 'weekly-review',
        label: 'Weekly service review',
        subtitle: 'Team Ops · 1 day ago',
      },
    ],
  },
  {
    section: 'Discover',
    page: 'discover',
    items: [
      { key: 'error-rate', label: 'Error rate by service', subtitle: 'Logs' },
      { key: 'auth-failures', label: 'Auth failure events', subtitle: 'Logs' },
      { key: 'slow-queries', label: 'Slow query log', subtitle: 'Logs' },
      {
        key: 'latency-percentiles',
        label: 'Latency percentiles',
        subtitle: 'Traces',
      },
      {
        key: 'trace-errors',
        label: 'Trace error breakdown',
        subtitle: 'Traces',
      },
      {
        key: 'service-deps',
        label: 'Service dependencies',
        subtitle: 'Traces',
      },
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

export const SearchPopover = ({
  isOpen,
  onClose,
  onNavigate,
  onContinueAsThread,
}) => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState(null); // { prompt, response }
  const [isStreaming, setIsStreaming] = useState(false);
  const responseIdx = useRef(0);
  const streamTimers = useRef([]);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  // Clean up stream timers on unmount
  useEffect(() => {
    return () => streamTimers.current.forEach(clearTimeout);
  }, []);

  // Reset state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setConversation(null);
      setIsStreaming(false);
      setHasBeenDragged(false);
      setPosition({ x: 0, y: 0 });
      streamTimers.current.forEach(clearTimeout);
      streamTimers.current = [];
    }
  }, [isOpen]);

  // Auto-focus the search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  // Drag handlers (same pattern as Ask AI popover)
  const handleDragStart = useCallback((e) => {
    if (!popoverRef.current) return;
    e.preventDefault();
    const rect = popoverRef.current.getBoundingClientRect();
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!dragState.current.isDragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setPosition({
        x: dragState.current.origX + dx,
        y: dragState.current.origY + dy,
      });
      setHasBeenDragged(true);
    };
    const handleDragEnd = () => {
      dragState.current.isDragging = false;
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  const handleSend = () => {
    const text = query.trim();
    if (!text || isStreaming) return;

    const idx = responseIdx.current % MOCK_AI_RESPONSES.length;
    responseIdx.current += 1;
    const fullResponse = MOCK_AI_RESPONSES[idx];

    setConversation({ prompt: text, response: '' });
    setQuery('');
    setIsStreaming(true);

    const words = fullResponse.split(/(\s+)/);
    let built = '';
    words.forEach((word, i) => {
      const timer = setTimeout(() => {
        built += word;
        setConversation({ prompt: text, response: built });
        if (i === words.length - 1) {
          setIsStreaming(false);
        }
      }, i * 25);
      streamTimers.current.push(timer);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && query.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter items by query (only when not in conversation mode)
  const filteredSections = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return SEARCH_SECTIONS;
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

  const handleItemClick = (itemKey) => {
    const page = ITEM_TO_PAGE[itemKey];
    if (page && onNavigate) {
      onNavigate(page, itemKey);
    }
    onClose();
  };

  if (!isOpen) return null;

  const popoverStyle = hasBeenDragged
    ? { position: 'fixed', left: position.x, top: position.y, zIndex: 10000 }
    : {};

  return (
    <div
      ref={popoverRef}
      className={`searchPopover${
        hasBeenDragged ? ' searchPopover--dragged' : ''
      }`}
      style={popoverStyle}>
      {/* Draggable header */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="searchPopover__header"
        onMouseDown={handleDragStart}
        role="banner">
        <div className="searchPopover__headerLeft">
          <OuiIcon type={conversation ? 'generate' : 'search'} size="m" />
          <span className="searchPopover__title">
            {conversation ? 'Ask AI' : 'Search'}
          </span>
        </div>
        <div className="searchPopover__headerRight">
          {conversation && conversation.response && !isStreaming && (
            <OuiButtonEmpty
              iconType="navTicketing"
              size="xs"
              onClick={() => {
                if (onContinueAsThread && popoverRef.current) {
                  const rect = popoverRef.current.getBoundingClientRect();
                  onContinueAsThread(
                    conversation.prompt,
                    conversation.response,
                    rect
                  );
                }
                onClose();
              }}>
              Continue as thread
            </OuiButtonEmpty>
          )}
          <OuiButtonIcon
            iconType="cross"
            aria-label="Close"
            size="xs"
            color="text"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Search mode: input on top, then results */}
      {!conversation && (
        <>
          <div className="searchPopover__input">
            <div className="searchPopover__inputWrapper">
              <OuiCompressedFieldText
                inputRef={inputRef}
                placeholder="Search items..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
              />
              {query.trim() && (
                <OuiButtonIcon
                  iconType="generate"
                  aria-label="Send message"
                  display="empty"
                  size="s"
                  onClick={handleSend}
                />
              )}
            </div>
          </div>
          <div className="searchPopover__body">
            {filteredSections.length === 0 ? (
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
                  <OuiListGroup gutterSize="none">
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
        </>
      )}

      {/* Conversation mode: body on top with padding, input at bottom */}
      {conversation && (
        <>
          <div className="searchPopover__body searchPopover__body--conversation">
            <div className="askAiPopover__messages">
              <div className="askAiPopover__msg askAiPopover__msg--user">
                <OuiText size="s">
                  <p>{conversation.prompt}</p>
                </OuiText>
              </div>
              <div className="askAiPopover__msg askAiPopover__msg--assistant">
                <OuiText size="s">
                  <p>{conversation.response}</p>
                </OuiText>
                {!isStreaming && conversation.response && (
                  <div className="askAiPopover__feedback">
                    <OuiButtonIcon
                      iconType="thumbsUp"
                      aria-label="Helpful"
                      size="xs"
                      color="text"
                    />
                    <OuiButtonIcon
                      iconType="thumbsDown"
                      aria-label="Not helpful"
                      size="xs"
                      color="text"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="searchPopover__input">
            <div className="searchPopover__inputWrapper">
              <OuiCompressedFieldText
                inputRef={inputRef}
                placeholder="Ask a follow-up..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
              />
              <OuiButtonIcon
                iconType="sortUp"
                aria-label="Send message"
                display="fill"
                size="s"
                isDisabled={!query.trim() || isStreaming}
                onClick={handleSend}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
