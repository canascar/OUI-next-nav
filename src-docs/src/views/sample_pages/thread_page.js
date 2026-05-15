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

import React, { useState, useEffect, useRef, useContext } from 'react';

import {
  OuiAvatar,
  OuiButton,
  OuiButtonIcon,
  OuiButtonEmpty,
  OuiIcon,
  OuiLoadingSpinner,
  OuiTitle,
  OuiText,
  OuiFlexGroup,
  OuiFlexItem,
  OuiThreadInput,
  OuiThreadScrollButton,
  OuiResizableContainer,
  OuiPanel,
  OuiSpacer,
  OuiBadge,
} from '../../../../src/components';

import { OllyIndicator } from './olly_indicator';
import { ThemeContext } from '../../components/with_theme';
import { TempVisualizationCard, MiniChart } from './temp_visualization_card';

const THREADS = {
  'latency-spike': {
    title: 'Latency spike investigation',
    messages: [
      {
        role: 'user',
        author: 'Sarah Lee',
        content:
          'Start investigation for the payment process error in the logs',
      },
      {
        role: 'assistant',
        content:
          'During the investigation, the primary cause of the service outage was identified as a misconfigured deployment that triggered a cascading failure across dependent services.\n\n**Key Findings**\n\n- Configuration Drift: A recent infrastructure change introduced an incorrect timeout value in the API gateway.\n- Autoscaling Feedback Loop: Increased retries caused aggressive scaling, which overwhelmed downstream services.\n- Insufficient Guardrails: Circuit breakers were not triggered due to misaligned thresholds.\n\n**Contributing Factors**\n\n1. Limited pre-deployment validation for environment-specific configurations.\n2. Monitoring alerts focused on symptoms (latency) rather than root signals (retry rates).\n3. Manual rollback required due to partial automation gaps.',
        attachment: {
          type: 'page',
          title: 'Investigation - Payment processing failure',
          url: 'https://opensearch.org/app/investigation-payment-001',
        },
      },
      {
        role: 'user',
        author: 'Sarah Lee',
        content:
          'Can you check the current retry rates on the checkout service?',
      },
      {
        role: 'assistant',
        content:
          'The checkout service is currently seeing elevated retry rates at approximately 340 retries/min, compared to the baseline of 45 retries/min. This is a 7.5x increase and correlates with the timeout misconfiguration identified earlier. The retry storm is propagating to downstream payment and inventory services.',
        attachment: {
          type: 'query',
          query:
            'source=opensearch_dashboards_sample_data_logs | where service="checkout" | stats count() as retries by span(timestamp, 1m)',
        },
      },
    ],
  },
  'checkout-error': {
    title: 'Checkout error rate alert',
    messages: [
      {
        role: 'user',
        author: 'Alex Chen',
        content:
          'Checkout error rate just crossed the 50% threshold. What is happening?',
      },
      {
        role: 'assistant',
        content:
          'The checkout service error rate is at 58.8%, primarily driven by 503 responses from the payment-service dependency. The upstream connection pool appears exhausted — active connections are at the configured maximum of 100 with a queue depth of 2,400 pending requests.\n\n**Recommended Actions**\n\n1. Increase the connection pool max from 100 to 250.\n2. Enable circuit breaker with a 50% error threshold and 30s recovery window.\n3. Add retry budget limiting to cap retries at 10% of total requests.',
        attachment: {
          type: 'page',
          title: 'Checkout error rate dashboard',
          url: 'https://opensearch.org/app/dashboards/checkout-errors',
        },
      },
    ],
  },
  'weekly-review': {
    title: 'Weekly service review',
    messages: [
      {
        role: 'user',
        author: 'Team Ops',
        content: "Give me a summary of this week's service health.",
      },
      {
        role: 'assistant',
        content:
          'Weekly summary: overall uptime 99.92%. Two incidents this week — payment-service latency spike (resolved) and a brief DNS issue on the recommendation service. Action items are tracked in the runbook.\n\n**Service Highlights**\n\n- cart: Healthy, 0% failure rate, 5ms avg latency\n- checkout: Recovered, failure rate back to 0.2% after connection pool fix\n- frontend: Stable, 310 req/s throughput\n- recommendation: Minor DNS blip resolved, no customer impact',
        attachment: {
          type: 'query',
          query:
            'source=opensearch_dashboards_sample_data_logs | stats avg(latency) as avg_latency, count() as requests by service | sort -avg_latency',
        },
      },
    ],
  },
};

// Renders a single user prompt bubble (right-aligned, light background)
const UserMessage = ({ author: _author, content }) => (
  <div className="threadPage__message threadPage__message--user">
    <div className="threadPage__bubble threadPage__bubble--user">
      <OuiText size="m">
        <p>{content}</p>
      </OuiText>
    </div>
  </div>
);

// Parses simple markdown-ish content into React elements
const parseContent = (content) => {
  const lines = content.split('\n');
  const elements = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bold header
    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p
          key={key++}
          style={{ margin: '8px 0 4px', fontSize: 12, fontWeight: 700 }}>
          {line.replace(/\*\*/g, '')}
        </p>
      );
      i++;
      // Unordered list: collect consecutive "- " lines
    } else if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(<li key={key++}>{lines[i].slice(2)}</li>);
        i++;
      }
      elements.push(<ul key={key++}>{items}</ul>);
      // Ordered list: collect consecutive "N. " lines
    } else if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={key++}>{lines[i].replace(/^\d+\.\s/, '')}</li>);
        i++;
      }
      elements.push(<ol key={key++}>{items}</ol>);
      // Blank line
    } else if (line.trim() === '') {
      i++;
      // Plain text
    } else {
      elements.push(
        <p key={key++} style={{ margin: 0 }}>
          {line}
        </p>
      );
      i++;
    }
  }

  return elements;
};

// Attachment card: page link (bold title + URL)
const PageAttachment = ({ title, url }) => (
  <div className="threadPage__attachment">
    <OuiText size="xs">
      <strong>{title}</strong>
    </OuiText>
    <OuiText size="xs" color="accent">
      <a href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    </OuiText>
  </div>
);

// Attachment card: query (monospace code)
const QueryAttachment = ({ query }) => (
  <div className="threadPage__attachment">
    <code className="threadPage__attachmentQuery">{query}</code>
  </div>
);

// Renders a single assistant response (left-aligned, plain text + feedback)
const AssistantMessage = ({ content, streaming, attachment, visualizations, onVizClick }) => (
  <div className="threadPage__message threadPage__message--assistant">
    <div className="threadPage__bubble threadPage__bubble--assistant">
      <OuiText size="m">{parseContent(content)}</OuiText>
      {!streaming && visualizations && visualizations.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginTop: 12 }}>
          {visualizations.map((viz, idx) => (
            <TempVisualizationCard 
              key={viz.id} 
              title={viz.title}
              description={viz.description}
              type={viz.type}
              color={viz.color}
              onClick={() => onVizClick(viz)} 
              index={idx} 
            />
          ))}
        </div>
      )}
      {!streaming && attachment && attachment.type === 'page' && (
        <PageAttachment title={attachment.title} url={attachment.url} />
      )}
      {!streaming && attachment && attachment.type === 'query' && (
        <QueryAttachment query={attachment.query} />
      )}
      {!streaming && (
        <div className="threadPage__feedback">
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
);

// Mock task pairs for each response
const MOCK_TASKS = [
  ['Searching service logs', 'Analyzing error patterns'],
  ['Querying connection metrics', 'Evaluating pool utilization'],
  ['Correlating traffic data', 'Checking cache performance'],
  ['Fetching service health', 'Comparing baseline metrics'],
];

// Task list that runs before AI response
const TaskListMessage = ({ tasks, statuses, collapsed }) => {
  if (collapsed) {
    return (
      <div className="threadPage__message threadPage__message--assistant">
        <div className="threadPage__taskCollapsed">
          <div className="threadPage__taskIconWrap">
            <OuiIcon type="check" size="m" color="success" />
          </div>
          <OuiText size="m">
            <span>{tasks.length} tasks finished</span>
          </OuiText>
        </div>
      </div>
    );
  }

  return (
    <div className="threadPage__message threadPage__message--assistant">
      <div className="threadPage__taskList">
        {tasks.map((task, i) => {
          if (i >= statuses.length) return null;
          return (
            <div key={i} className="threadPage__taskItem">
              <div className="threadPage__taskIconWrap">
                {statuses[i] === 'running' ? (
                  <OuiLoadingSpinner size="m" />
                ) : (
                  <OuiIcon type="check" size="m" color="success" />
                )}
              </div>
              <OuiText size="m">
                <span>{task}</span>
              </OuiText>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Pool of mock AI responses to cycle through
const MOCK_RESPONSES = [
  {
    content:
      'I looked into this and found a few things worth noting.\n\n**Summary**\n\n- The service metrics show a gradual increase in P99 latency over the past 6 hours.\n- Error rates remain within acceptable thresholds but are trending upward.\n- No recent deployments correlate with the change.\n\nI recommend checking the downstream dependency health and reviewing recent config changes in the environment.',
    attachment: {
      type: 'page',
      title: 'Service health overview',
      url: 'https://opensearch.org/app/observability/services',
    },
  },
  {
    content:
      'Based on the available data, here is what I found.\n\n**Analysis**\n\n1. The connection pool utilization is at 87%, which is approaching the configured limit.\n2. Garbage collection pauses have increased by 40% compared to last week.\n3. The thread count on the primary nodes is elevated.\n\nConsider scaling horizontally or increasing the connection pool ceiling to provide headroom.',
    attachment: {
      type: 'query',
      query:
        'source=opensearch_dashboards_sample_data_logs | where pool_utilization > 80 | stats max(pool_utilization) by service',
    },
  },
  {
    content:
      'I ran a correlation analysis across the affected services.\n\n**Key Observations**\n\n- The spike aligns with a traffic surge from the EU region starting at 14:32 UTC.\n- Cache hit ratio dropped from 94% to 61% during the same window.\n- The CDN origin pull rate tripled, putting pressure on the backend.\n\nThis looks like a cache invalidation event combined with organic traffic growth. The system should stabilize once the cache warms back up.',
    attachment: {
      type: 'page',
      title: 'Traffic analysis - EU region surge',
      url: 'https://opensearch.org/app/dashboards/traffic-eu',
    },
  },
  {
    content:
      'Here is a quick health check of the relevant services.\n\n**Service Status**\n\n- cart: Healthy, latency 4ms, throughput 52 req/s\n- checkout: Degraded, latency 380ms, error rate 12.3%\n- payment-service: Unhealthy, connection timeouts at 67%\n- frontend-proxy: Healthy, acting as passthrough\n\nThe payment-service is the bottleneck. I suggest checking its resource allocation and recent deployment history.',
    attachment: {
      type: 'query',
      query:
        'source=opensearch_dashboards_sample_data_logs | stats avg(latency) as avg_latency, avg(error_rate) as avg_errors by service | sort -avg_errors',
    },
  },
];

// Visualization cards that can appear in responses
const VISUALIZATIONS = [
  {
    id: 'error-rate-timeline',
    title: 'Error Rate Over Time',
    type: 'line',
    description: 'Error rate across all services in the last 24h',
    color: '#FF6467',
    related: [
      { title: 'Error Rate by Service', type: 'bar', color: '#FF6467' },
      { title: 'Top Error Messages', type: 'table', color: '#FBBF24' },
      { title: 'Error Distribution by Region', type: 'pie', color: '#10B981' },
    ],
  },
  {
    id: 'latency-p99',
    title: 'P99 Latency by Service',
    type: 'bar',
    description: 'Tail latency distribution across services',
    color: '#7dd3fc',
    related: [
      { title: 'Latency Percentiles (P50/P90/P99)', type: 'line', color: '#7dd3fc' },
      { title: 'Slow Requests Log', type: 'table', color: '#FBBF24' },
      { title: 'Latency Heatmap', type: 'heatmap', color: '#FB64B6' },
    ],
  },
  {
    id: 'throughput-overview',
    title: 'Throughput Overview',
    type: 'area',
    description: 'Requests per second across the stack',
    color: '#10B981',
    related: [
      { title: 'Throughput by Endpoint', type: 'bar', color: '#10B981' },
      { title: 'Traffic Sources', type: 'pie', color: '#7dd3fc' },
      { title: 'Request Size Distribution', type: 'histogram', color: '#FBBF24' },
    ],
  },
  {
    id: 'connection-pool',
    title: 'Connection Pool Utilization',
    type: 'gauge',
    description: 'Active connections vs. pool capacity',
    color: '#FBBF24',
    related: [
      { title: 'Pool Saturation Timeline', type: 'line', color: '#FBBF24' },
      { title: 'Connection Wait Times', type: 'bar', color: '#FF6467' },
      { title: 'Pool Config Comparison', type: 'table', color: '#7dd3fc' },
    ],
  },
];

// Enhanced mock responses with visualization references
const ENHANCED_RESPONSES = [
  {
    content: 'I analyzed the service metrics and found some interesting patterns.\n\n**Key Findings**\n\n- Error rates spiked 3x in the last 2 hours, concentrated on the checkout service.\n- P99 latency crossed 800ms threshold on 3 services.\n- Throughput remains stable, suggesting the issue is downstream.\n\nHere are the relevant visualizations:',
    visualizations: ['error-rate-timeline', 'latency-p99'],
    tasks: ['Querying service metrics', 'Correlating error patterns'],
  },
  {
    content: 'Based on the connection data, the bottleneck is clear.\n\n**Analysis**\n\n1. Connection pool is at 92% capacity — dangerously close to exhaustion.\n2. The throughput pattern shows a gradual ramp that started 4 hours ago.\n3. No recent deployments correlate with this change.\n\nI recommend reviewing these dashboards:',
    visualizations: ['connection-pool', 'throughput-overview'],
    tasks: ['Checking connection metrics', 'Analyzing capacity trends'],
  },
  {
    content: 'The latency investigation reveals a cascading pattern.\n\n**Root Cause**\n\n- A cache invalidation event at 14:32 UTC triggered a thundering herd.\n- Backend services saw 7x normal load as cache misses propagated.\n- The system is self-healing but recovery will take ~20 minutes.\n\nThese visualizations show the full picture:',
    visualizations: ['latency-p99', 'throughput-overview', 'error-rate-timeline'],
    tasks: ['Running correlation analysis', 'Checking cache metrics'],
  },
  {
    content: 'Here is the current health assessment.\n\n**Service Status**\n\n- cart: Healthy, 4ms latency\n- checkout: Degraded, 380ms latency, 12% errors\n- payment-service: Critical, 67% timeout rate\n- frontend: Healthy, passthrough\n\nDrill into these for more detail:',
    visualizations: ['error-rate-timeline', 'connection-pool'],
    tasks: ['Fetching service health', 'Comparing baselines'],
  },
];

// Investigation panel content
const InvestigationPanel = ({ viz, onClose }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 16, overflowY: 'auto' }}>
    <OuiFlexGroup alignItems="center" justifyContent="spaceBetween" responsive={false}>
      <OuiFlexItem grow={false}>
        <OuiTitle size="xs"><h3>{viz.title}</h3></OuiTitle>
      </OuiFlexItem>
      <OuiFlexItem grow={false}>
        <OuiButtonIcon iconType="cross" aria-label="Close" onClick={onClose} color="text" />
      </OuiFlexItem>
    </OuiFlexGroup>
    <OuiSpacer size="s" />
    <OuiText size="xs" color="subdued">{viz.description}</OuiText>
    <OuiSpacer size="m" />
    <OuiPanel hasBorder paddingSize="m">
      <MiniChart type={viz.type} color={viz.color} height={120} />
    </OuiPanel>
    <OuiSpacer size="l" />
    <OuiText size="xs"><strong>Related visualizations</strong></OuiText>
    <OuiSpacer size="s" />
    {viz.related && viz.related.map((rel, i) => (
      <OuiPanel key={i} hasBorder paddingSize="s" style={{ marginBottom: 8 }}>
        <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
          <OuiFlexItem grow={false}>
            <OuiBadge color="hollow">{rel.type}</OuiBadge>
          </OuiFlexItem>
          <OuiFlexItem>
            <OuiText size="xs"><strong>{rel.title}</strong></OuiText>
          </OuiFlexItem>
        </OuiFlexGroup>
        <div style={{ marginTop: 8 }}>
          <MiniChart type={rel.type} color={rel.color} height={50} />
        </div>
      </OuiPanel>
    ))}
  </div>
);

export const ThreadPage = ({ selectedItem }) => {
  const threadKey = selectedItem || 'latency-spike';
  const thread = THREADS[threadKey];
  const [messages, setMessages] = useState(thread.messages);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [investigationViz, setInvestigationViz] = useState(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [threadTitle, setThreadTitle] = useState(thread.title);
  const [ollyState, setOllyState] = useState(window.__threadInitialMessage ? 'process-label' : 'idle');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const feedRef = useRef(null);
  const responseIndex = useRef(0);
  const enhancedIndex = useRef(0);

  const streamTimers = useRef([]);

  // Track scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = feed;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      // Show button if scrolled up more than 100px from bottom
      setShowScrollButton(distanceFromBottom > 100);
    };

    feed.addEventListener('scroll', handleScroll);
    return () => feed.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Reset messages when switching threads
  useEffect(() => {
    // Check if this is a fresh thread from the home page
    if (window.__threadFresh) {
      window.__threadFresh = false;
      setMessages([]);
      setThreadTitle('New thread');
    } else {
      setMessages(thread.messages);
      setThreadTitle(thread.title);
    }
    setMessage('');
    setIsTyping(false);
    setInvestigationViz(null);
    streamTimers.current.forEach(clearTimeout);
    streamTimers.current = [];

    // Check if there's an initial message from ThreadsPage
    if (window.__threadInitialMessage) {
      const initialMsg = window.__threadInitialMessage;
      window.__threadInitialMessage = null;
      // Delay slightly to let the component mount
      setTimeout(() => {
        setMessage(initialMsg);
        setTimeout(() => {
          // Set thread title from the user's first message
          const titleText = initialMsg.length > 50 ? initialMsg.slice(0, 50) + '…' : initialMsg;
          setThreadTitle(titleText);

          const userMsg = { role: 'user', author: 'You', content: initialMsg };
          setMessages((prev) => [...prev, userMsg]);
          setMessage('');
          setIsTyping(true);
          setOllyState('process-label');

          const idx = enhancedIndex.current % ENHANCED_RESPONSES.length;
          const mockResponse = ENHANCED_RESPONSES[idx];
          const tasks = mockResponse.tasks;
          enhancedIndex.current += 1;
          const fullContent = mockResponse.content;
          const vizIds = mockResponse.visualizations;
          const vizs = vizIds.map(id => VISUALIZATIONS.find(v => v.id === id)).filter(Boolean);

          // Show olly process-label for 6s, then stream content
          const t3 = setTimeout(() => {
            setIsTyping(false); setOllyState('process-breath');
            const tokens = fullContent.split(/(\s+)/);
            setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true, visualizations: vizs }]);
            let built = '';
            tokens.forEach((token, i) => {
              const timer = setTimeout(() => {
                built += token;
                setMessages((prev) => { const u=[...prev]; u[u.length-1]={role:'assistant',content:built,streaming:i<tokens.length-1,visualizations:vizs}; return u; });
              }, i * 30);
              streamTimers.current.push(timer);
            });
            const idleTimer = setTimeout(() => setOllyState('idle'), tokens.length * 30 + 100);
            streamTimers.current.push(idleTimer);
          }, 6000);
          streamTimers.current.push(t3);
        }, 100);
      }, 200);
    }
  }, [threadKey, thread.messages]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => streamTimers.current.forEach(clearTimeout);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;

    // Update title from first user message if still default
    if (threadTitle === 'New thread') {
      setThreadTitle(text.length > 50 ? text.slice(0, 50) + '…' : text);
    }

    const userMsg = { role: 'user', author: 'You', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);
    setOllyState('process-empty');

    const idx = enhancedIndex.current % ENHANCED_RESPONSES.length;
    const mockResponse = ENHANCED_RESPONSES[idx];
    const tasks = mockResponse.tasks;
    enhancedIndex.current += 1;
    const fullContent = mockResponse.content;
    const vizIds = mockResponse.visualizations;
    const vizs = vizIds.map(id => VISUALIZATIONS.find(v => v.id === id)).filter(Boolean);

    // Show olly process-empty for 3s, then stream content with process-breath
    const t3 = setTimeout(() => {
      setIsTyping(false); setOllyState('process-breath');

      const tokens = fullContent.split(/(\s+)/);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', streaming: true, visualizations: vizs },
      ]);

      let built = '';
      tokens.forEach((token, i) => {
        const timer = setTimeout(() => {
          built += token;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: built,
              streaming: i < tokens.length - 1,
              visualizations: vizs,
            };
            return updated;
          });
        }, i * 30);
        streamTimers.current.push(timer);
      });

      // When streaming finishes, go to idle
      const idleTimer = setTimeout(() => {
        setOllyState('idle');
      }, tokens.length * 30 + 100);
      streamTimers.current.push(idleTimer);
    }, 3000);
    streamTimers.current.push(t3);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Collect unique participants for the avatar group
  const authors = [
    ...new Set(messages.filter((m) => m.role === 'user').map((m) => m.author)),
  ];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <style>{`
        .tempVisualizationCard {
          opacity: 0;
          animation: vizFadeIn 400ms ease forwards;
          transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
        }
        .tempVisualizationCard:hover {
          border-color: rgba(65, 104, 184, 0.4) !important;
          box-shadow: 0 4px 20px rgba(46, 74, 143, 0.15);
          transform: scale(1.03);
        }
        .tempVisualizationCard:active {
          transform: scale(0.97);
          transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @media (prefers-color-scheme: dark) {
          .tempVisualizationCard:hover {
            border-color: rgba(122, 159, 212, 0.4) !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
        }
        [data-theme="v9-dark"] .tempVisualizationCard:hover {
          border-color: rgba(122, 159, 212, 0.4) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes panelSlideIn {
          from { width: 0; min-width: 0; opacity: 0; }
          to { width: 380px; min-width: 380px; opacity: 1; }
        }
        @keyframes vizFadeIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .threadPage__scrollButtonWrap {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: -40px;
          z-index: 10;
        }
      `}</style>

      {/* Header */}
      <div
        className="threadPage__header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          flexShrink: 0,
        }}>
        <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
          <OuiFlexItem grow={false}>
            <OuiTitle size="s">
              <h1 style={{ margin: 0 }}>{threadTitle}</h1>
            </OuiTitle>
          </OuiFlexItem>
          <OuiFlexItem grow={false}>
            <div className="threadPage__avatarGroup">
              {authors.map((name) => (
                <OuiAvatar key={name} size="s" name={name} />
              ))}
            </div>
          </OuiFlexItem>
        </OuiFlexGroup>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <OuiButton iconType="share" size="s">
            Share
          </OuiButton>
          <OuiButton iconType="layers" size="s">
            Canvas
          </OuiButton>
          <OuiButton iconType="clock" size="s">
            History
          </OuiButton>
        </div>
      </div>

      {/* Main content area: chat + investigation panel */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {investigationViz && panelExpanded ? (
          <OuiResizableContainer style={{ height: '100%' }}>
            {(ResizablePanel, ResizableButton) => (
              <>
                <ResizablePanel initialSize={60} minSize="30%" paddingSize="none" style={{ background: 'transparent' }}>
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="threadPage__feed" ref={feedRef} style={{ flex: 1, minHeight: 0 }}>
                      {messages.map((msg, i) => {
                        if (msg.role === 'user') return <UserMessage key={i} author={msg.author} content={msg.content} />;
                        if (msg.role === 'tasks') return <TaskListMessage key={i} tasks={msg.tasks} statuses={msg.statuses} collapsed={msg.collapsed} />;
                        return <AssistantMessage key={i} content={msg.content} streaming={msg.streaming} attachment={msg.attachment} visualizations={msg.visualizations} onVizClick={(viz) => { setInvestigationViz(viz); setPanelExpanded(true); }} />;
                      })}
                      <OllyIndicator state={ollyState} isDark={isDark} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div className="threadPage__scrollButtonWrap">
                        <OuiThreadScrollButton
                          isVisible={showScrollButton}
                          onClick={scrollToBottom}
                        />
                      </div>
                      <div className="threadPage__inputArea">
                        <OuiThreadInput value={message} onChange={setMessage} onSubmit={handleSend} isDisabled={isTyping || messages.some((m) => m.streaming)}
                          actionsLeft={<OuiButtonIcon iconType="plus" aria-label="Add attachment" size="s" color="text" />}
                          actionsRight={<OuiButtonIcon iconType="sortUp" aria-label="Send" display="fill" size="s" color="primary" isDisabled={!message.trim() || isTyping || messages.some((m) => m.streaming)} onClick={() => handleSend(message)} />}
                        />
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableButton />
                <ResizablePanel initialSize={40} minSize="20%" paddingSize="none" style={{ background: 'transparent' }}>
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(128,128,128,0.1)', flexShrink: 0 }}>
                      <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                        <OuiFlexItem grow={false}><OuiIcon type="visArea" size="m" color="primary" /></OuiFlexItem>
                        <OuiFlexItem grow={false}><OuiText size="s"><strong>{investigationViz.title}</strong></OuiText></OuiFlexItem>
                      </OuiFlexGroup>
                      <OuiButtonIcon iconType="cross" aria-label="Close panel" onClick={() => { setInvestigationViz(null); setPanelExpanded(false); }} size="s" color="text" />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                      <OuiText size="xs" color="subdued">{investigationViz.description}</OuiText>
                      <OuiSpacer size="m" />
                      <OuiPanel hasBorder paddingSize="m"><MiniChart type={investigationViz.type} color={investigationViz.color} height={120} /></OuiPanel>
                      <OuiSpacer size="l" />
                      <OuiText size="xs"><strong>Related visualizations</strong></OuiText>
                      <OuiSpacer size="s" />
                      {investigationViz.related && investigationViz.related.map((rel, i) => (
                        <OuiPanel key={i} hasBorder paddingSize="s" style={{ marginBottom: 8, cursor: 'pointer' }}>
                          <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                            <OuiFlexItem grow={false}><OuiBadge color="hollow">{rel.type}</OuiBadge></OuiFlexItem>
                            <OuiFlexItem><OuiText size="xs"><strong>{rel.title}</strong></OuiText></OuiFlexItem>
                          </OuiFlexGroup>
                          <div style={{ marginTop: 8 }}><MiniChart type={rel.type} color={rel.color} height={50} /></div>
                        </OuiPanel>
                      ))}
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </OuiResizableContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="threadPage__feed" ref={feedRef} style={{ flex: 1, minHeight: 0 }}>
              {messages.map((msg, i) => {
                if (msg.role === 'user') return <UserMessage key={i} author={msg.author} content={msg.content} />;
                if (msg.role === 'tasks') return <TaskListMessage key={i} tasks={msg.tasks} statuses={msg.statuses} collapsed={msg.collapsed} />;
                return <AssistantMessage key={i} content={msg.content} streaming={msg.streaming} attachment={msg.attachment} visualizations={msg.visualizations} onVizClick={(viz) => { setInvestigationViz(viz); setPanelExpanded(true); }} />;
              })}
              <OllyIndicator state={ollyState} isDark={isDark} />
            </div>
            <div style={{ position: 'relative' }}>
              <div className="threadPage__scrollButtonWrap">
                <OuiThreadScrollButton
                  isVisible={showScrollButton}
                  onClick={scrollToBottom}
                />
              </div>
              <div className="threadPage__inputArea">
                <OuiThreadInput value={message} onChange={setMessage} onSubmit={handleSend} isDisabled={isTyping || messages.some((m) => m.streaming)}
                  actionsLeft={<OuiButtonIcon iconType="plus" aria-label="Add attachment" size="s" color="text" />}
                  actionsRight={<OuiButtonIcon iconType="sortUp" aria-label="Send" display="fill" size="s" color="primary" isDisabled={!message.trim() || isTyping || messages.some((m) => m.streaming)} onClick={() => handleSend(message)} />}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
