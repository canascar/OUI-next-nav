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
  OuiAvatar,
  OuiButton,
  OuiButtonIcon,
  OuiIcon,
  OuiLoadingSpinner,
  OuiTitle,
  OuiText,
  OuiFlexGroup,
  OuiFlexItem,
  OuiThreadInput,
} from '../../../../src/components';

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
      <OuiText size="s">
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
const AssistantMessage = ({ content, streaming, attachment }) => (
  <div className="threadPage__message threadPage__message--assistant">
    <div className="threadPage__bubble threadPage__bubble--assistant">
      <OuiText size="s">{parseContent(content)}</OuiText>
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
          <OuiText size="s">
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
              <OuiText size="s">
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

export const ThreadPage = ({ selectedItem }) => {
  const threadKey = selectedItem || 'latency-spike';
  const thread = THREADS[threadKey];
  const [messages, setMessages] = useState(thread.messages);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedRef = useRef(null);
  const responseIndex = useRef(0);

  const streamTimers = useRef([]);

  // Reset messages when switching threads
  useEffect(() => {
    setMessages(thread.messages);
    setMessage('');
    setIsTyping(false);
    streamTimers.current.forEach(clearTimeout);
    streamTimers.current = [];
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

    // Add user message
    const userMsg = { role: 'user', author: 'You', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    const idx = responseIndex.current % MOCK_RESPONSES.length;
    const mockResponse = MOCK_RESPONSES[idx];
    const tasks = MOCK_TASKS[idx % MOCK_TASKS.length];
    responseIndex.current += 1;
    const fullContent = mockResponse.content;
    const attachment = mockResponse.attachment;

    // Phase 1: Show task list with first task running
    const taskMsg = {
      role: 'tasks',
      tasks,
      statuses: ['running'],
      collapsed: false,
    };
    setMessages((prev) => [...prev, taskMsg]);

    // After 1.5s, first task finishes, second task appears running
    const t1 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0)
          updated[ti] = { ...updated[ti], statuses: ['done', 'running'] };
        return updated;
      });
    }, 1500);
    streamTimers.current.push(t1);

    // After 3s, second task finishes
    const t2 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0)
          updated[ti] = { ...updated[ti], statuses: ['done', 'done'] };
        return updated;
      });
    }, 3000);
    streamTimers.current.push(t2);

    // After 3.5s, collapse tasks and start streaming response
    const t3 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0) updated[ti] = { ...updated[ti], collapsed: true };
        return updated;
      });

      setIsTyping(false);

      // Split into words, preserving newlines as separate tokens
      const tokens = fullContent.split(/(\s+)/);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', streaming: true, attachment },
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
              attachment,
            };
            return updated;
          });
        }, i * 30);
        streamTimers.current.push(timer);
      });
    }, 3500);
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
      {/* Header — same pattern as service page */}
      <div
        className="threadPage__header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
        }}>
        <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
          <OuiFlexItem grow={false}>
            <OuiTitle size="s">
              <h1 style={{ margin: 0 }}>{thread.title}</h1>
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

      {/* Conversation feed — scrollable */}
      <div className="threadPage__feed" ref={feedRef}>
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <UserMessage key={i} author={msg.author} content={msg.content} />
            );
          }
          if (msg.role === 'tasks') {
            return (
              <TaskListMessage
                key={i}
                tasks={msg.tasks}
                statuses={msg.statuses}
                collapsed={msg.collapsed}
              />
            );
          }
          return (
            <AssistantMessage
              key={i}
              content={msg.content}
              streaming={msg.streaming}
              attachment={msg.attachment}
            />
          );
        })}
        {isTyping && null}
      </div>

      {/* Input area */}
      <div className="threadPage__inputArea">
        <OuiThreadInput
          value={message}
          onChange={setMessage}
          onSubmit={handleSend}
          isDisabled={isTyping || messages.some((m) => m.streaming)}
          actionsLeft={
            <OuiButtonIcon
              iconType="plus"
              aria-label="Add attachment"
              size="s"
              color="text"
            />
          }
          actionsRight={
            <OuiButtonIcon
              iconType="sortUp"
              aria-label="Send message"
              display="fill"
              size="s"
              color="primary"
              isDisabled={
                !message.trim() || isTyping || messages.some((m) => m.streaming)
              }
              onClick={() => handleSend(message)}
            />
          }
        />
      </div>
    </div>
  );
};
