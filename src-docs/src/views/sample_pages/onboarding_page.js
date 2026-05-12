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
  OuiCodeBlock,
  OuiFlyoutHeader,
  OuiFlyoutBody,
  OuiFlexGroup,
  OuiFlexItem,
  OuiIcon,
  OuiLoadingSpinner,
  OuiStat,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiToolTip,
  OuiCompressedTextArea,
} from '../../../../src/components';

const THREAD = {
  title: 'Getting started with OpenSearch',
  messages: [
    {
      role: 'user',
      author: 'You',
      content: 'Help me get started with OpenSearch observability.',
    },
    {
      role: 'assistant',
      content:
        'Welcome to OpenSearch Observability. Here is a quick overview of what you can do.\n\n**Key Capabilities**\n\n- Logs: Ingest, search, and analyze log data from your applications and infrastructure.\n- Metrics: Monitor system and application performance with time-series data.\n- Traces: Track requests across distributed services to identify bottlenecks.\n- Alerts: Set up monitors and notifications for anomalous behavior.\n\n**Getting Started Steps**\n\n1. Connect a data source to begin ingesting telemetry data.\n2. Create an index pattern to make your data searchable.\n3. Build a dashboard to visualize key metrics.\n4. Configure alerts to stay informed of issues.',
      attachment: {
        type: 'page',
        title: 'Observability quickstart guide',
        description:
          'Step-by-step guide to setting up log ingestion, creating dashboards, and configuring alerts.',
      },
    },
    {
      role: 'user',
      author: 'You',
      content: 'What data sources are supported?',
    },
    {
      role: 'assistant',
      content:
        'OpenSearch supports a wide range of data sources for observability.\n\n**Supported Integrations**\n\n- OpenTelemetry Collector (logs, metrics, traces)\n- Fluent Bit / Fluentd (log forwarding)\n- Prometheus remote write (metrics)\n- Jaeger (distributed tracing)\n- Data Prepper (event processing pipeline)\n\nYou can configure these from the Data Sources page. Would you like me to walk you through connecting your first data source?',
      attachment: {
        type: 'query',
        query:
          'source=opensearch_sample_data | stats count() as total_events by data_source | sort -total_events',
      },
    },
  ],
};

// Parses simple markdown-ish content into React elements
const parseContent = (content) => {
  const lines = content.split('\n');
  const elements = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={key++} style={{ margin: '8px 0 4px', fontSize: 12, fontWeight: 700 }}>
          {line.replace(/\*\*/g, '')}
        </p>
      );
      i++;
    } else if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(<li key={key++}>{lines[i].slice(2)}</li>);
        i++;
      }
      elements.push(<ul key={key++}>{items}</ul>);
    } else if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={key++}>{lines[i].replace(/^\d+\.\s/, '')}</li>);
        i++;
      }
      elements.push(<ol key={key++}>{items}</ol>);
    } else if (line.trim() === '') {
      i++;
    } else {
      elements.push(<p key={key++} style={{ margin: 0 }}>{line}</p>);
      i++;
    }
  }

  return elements;
};

// User message bubble
const UserMessage = ({ content }) => (
  <div className="threadPage__message threadPage__message--user">
    <div className="threadPage__bubble threadPage__bubble--user">
      <OuiText size="s">
        <p>{content}</p>
      </OuiText>
    </div>
  </div>
);

// Page attachment card
const PageAttachment = ({ title, description, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some((c) => c.type === 'page' && c.title === title);
  return (
    <div className="threadPage__attachmentWrap">
      <button
        type="button"
        className={`threadPage__addToCanvas${added ? ' threadPage__addToCanvas--added' : ''}`}
        onClick={added ? undefined : () => onAddToCanvas({ type: 'page', title, description })}>
        {added ? 'Added as related asset' : 'Add as related asset'}
      </button>
      <div className="threadPage__attachment" role="presentation">
        <OuiText size="xs">
          <strong>{title}</strong>
        </OuiText>
        {description && (
          <OuiText size="xs" color="subdued">
            <p style={{ margin: 0 }}>{description}</p>
          </OuiText>
        )}
      </div>
    </div>
  );
};

// Query attachment card
const QueryAttachment = ({ query, onAddToCanvas, canvasItems }) => {
  const added = canvasItems.some((c) => c.type === 'query' && c.query === query);
  return (
    <div className="threadPage__attachmentWrap">
      <button
        type="button"
        className={`threadPage__addToCanvas${added ? ' threadPage__addToCanvas--added' : ''}`}
        onClick={added ? undefined : () => onAddToCanvas({ type: 'query', query })}>
        {added ? 'Added as related asset' : 'Add as related asset'}
      </button>
      <div className="threadPage__attachment">
        <code className="threadPage__attachmentQuery">{query}</code>
      </div>
    </div>
  );
};

// Assistant message with attachments and feedback
const AssistantMessage = ({ content, streaming, attachment, onAddToCanvas, canvasItems }) => (
  <div className="threadPage__message threadPage__message--assistant">
    <div className="threadPage__bubble threadPage__bubble--assistant">
      <OuiText size="s">{parseContent(content)}</OuiText>
      {!streaming && attachment && attachment.type === 'page' && (
        <PageAttachment
          title={attachment.title}
          description={attachment.description}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && attachment && attachment.type === 'query' && (
        <QueryAttachment
          query={attachment.query}
          onAddToCanvas={onAddToCanvas}
          canvasItems={canvasItems}
        />
      )}
      {!streaming && (
        <div className="threadPage__feedback">
          <OuiButtonIcon iconType="thumbsUp" aria-label="Helpful" size="xs" color="text" />
          <OuiButtonIcon iconType="thumbsDown" aria-label="Not helpful" size="xs" color="text" />
        </div>
      )}
    </div>
  </div>
);

// Task list message
const TaskListMessage = ({ tasks, statuses, collapsed }) => {
  if (collapsed) {
    return (
      <div className="threadPage__message threadPage__message--assistant">
        <div className="threadPage__taskCollapsed">
          <div className="threadPage__taskIconWrap">
            <OuiIcon type="checkInCircleEmpty" size="m" color="success" />
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
                  <OuiIcon type="checkInCircleEmpty" size="m" color="success" />
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

// Mock responses for new messages
const MOCK_TASKS = [
  ['Searching documentation', 'Preparing response'],
  ['Querying data sources', 'Analyzing results'],
];

const MOCK_RESPONSES = [
  {
    content:
      'Here is what I found.\n\n**Summary**\n\n- Your cluster is healthy and ready to receive data.\n- No data sources are currently configured.\n- I recommend starting with the OpenTelemetry Collector for a unified ingestion pipeline.\n\nWould you like me to generate a sample collector configuration?',
    attachment: {
      type: 'page',
      title: 'OpenTelemetry Collector setup',
      description: 'Configuration guide for deploying the OTel Collector with OpenSearch as the backend.',
    },
  },
  {
    content:
      'I checked the cluster status and here are the details.\n\n**Cluster Health**\n\n1. Status: Green\n2. Nodes: 3 active\n3. Indices: 0 (no data ingested yet)\n4. Disk usage: 12% utilized\n\nEverything looks good to start ingesting data. Let me know what you would like to do next.',
    attachment: {
      type: 'query',
      query: 'source=cluster_health | stats latest(status), count(nodes) as active_nodes',
    },
  },
];

export const OnboardingPage = () => {
  const [messages, setMessages] = useState(THREAD.messages);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeCanvasTab, setActiveCanvasTab] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const isDragging = useRef(false);
  const feedRef = useRef(null);
  const responseIndex = useRef(0);
  const streamTimers = useRef([]);

  // Drag-to-resize handlers for related assets flyout
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    setIsCanvasDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDragging.current) return;
      const newWidth = window.innerWidth - e.clientX;
      const maxCanvasWidth = window.innerWidth - 400;
      setCanvasWidth(Math.max(240, Math.min(newWidth, maxCanvasWidth)));
    };
    const handleDragEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsCanvasDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);

  const handleAddToCanvas = useCallback((item) => {
    setCanvasItems((prev) => {
      const exists = prev.some(
        (existing) =>
          existing.type === item.type &&
          (item.type === 'page'
            ? existing.title === item.title
            : existing.query === item.query)
      );
      if (exists) return prev;
      return [...prev, item];
    });
    setIsCanvasOpen(true);
  }, []);

  // Pre-populate canvas with attachments from initial messages
  useEffect(() => {
    const items = [];
    THREAD.messages.forEach((msg) => {
      if (msg.attachment) items.push(msg.attachment);
    });
    setCanvasItems(items);
    setIsCanvasOpen(items.length > 0);
  }, []);

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

    // Phase 1: Show task list
    const taskMsg = { role: 'tasks', tasks, statuses: ['running'], collapsed: false };
    setMessages((prev) => [...prev, taskMsg]);

    const t1 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0) updated[ti] = { ...updated[ti], statuses: ['done', 'running'] };
        return updated;
      });
    }, 1500);
    streamTimers.current.push(t1);

    const t2 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0) updated[ti] = { ...updated[ti], statuses: ['done', 'done'] };
        return updated;
      });
    }, 3000);
    streamTimers.current.push(t2);

    const t3 = setTimeout(() => {
      setMessages((prev) => {
        const updated = [...prev];
        const ti = updated.findLastIndex((m) => m.role === 'tasks');
        if (ti >= 0) updated[ti] = { ...updated[ti], collapsed: true };
        return updated;
      });

      setIsTyping(false);

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
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: 8,
          display: 'flex',
        }}>
        <div
          className="samplePagesContentPanel"
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
      {/* Simple header — no left nav toggle, no thread flyout */}
      <div className="detailPageHeader">
        <div className="detailPageHeader__title">
          {THREAD.title}
        </div>
        <div className="detailPageHeader__actions">
          <OuiToolTip content="Related Assets" position="bottom">
            <OuiButtonIcon
              iconType="dockedRight"
              aria-label="Related Assets"
              size="s"
              color="text"
              display="empty"
              onClick={() => setIsCanvasOpen((open) => !open)}
            />
          </OuiToolTip>
        </div>
      </div>

      {/* Body: feed + optional canvas flyout */}
      <div className="threadPage__body">
        {/* Conversation column */}
        <div className="threadPage__conversationCol">
          <div className="threadPage__feed" ref={feedRef}>
            {messages.map((msg, i) => {
              if (msg.role === 'user') {
                return <UserMessage key={i} content={msg.content} />;
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
                  onAddToCanvas={handleAddToCanvas}
                  canvasItems={canvasItems}
                />
              );
            })}
          </div>

          {/* Input area */}
          <div className="threadPage__inputArea">
            <div className="threadPage__inputWrapper">
              <OuiCompressedTextArea
                placeholder="Ask anything. Type / for actions."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
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
                  isDisabled={!message.trim() || isTyping || messages.some((m) => m.streaming)}
                  onClick={handleSend}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Canvas flyout (push panel) */}
        <div
          className={`threadPage__canvasFlyout${isCanvasOpen ? ' threadPage__canvasFlyout--open' : ''}${isCanvasDragging ? ' threadPage__canvasFlyout--dragging' : ''}`}
          style={isCanvasOpen ? { width: canvasWidth } : undefined}>
          <div className="threadPage__canvasFlyoutInner">
            <div
              className="threadPage__canvasResizeHandle"
              onMouseDown={handleDragStart}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize canvas"
              tabIndex={0}>
              <span className="threadPage__canvasResizeGrip">
                <OuiIcon type="grab" size="s" />
              </span>
            </div>
            <OuiFlyoutHeader>
              {canvasItems.length > 0 && (
                <OuiTabs size="s" className="threadPage__canvasTabs">
                  {canvasItems.map((item, i) => (
                    <OuiTab
                      key={i}
                      isSelected={activeCanvasTab === i}
                      onClick={() => setActiveCanvasTab(i)}>
                      {item.title || (item.type === 'query' ? 'Query' : `Asset ${i + 1}`)}
                    </OuiTab>
                  ))}
                </OuiTabs>
              )}
            </OuiFlyoutHeader>
            <OuiFlyoutBody>
              {canvasItems.length === 0 ? (
                <OuiText size="s" color="subdued">
                  <p>
                    Items added here will appear as related assets. Hover over
                    attachments in the conversation and click &ldquo;Add as related asset&rdquo;.
                  </p>
                </OuiText>
              ) : (
                <div className="threadPage__canvasTabContent">
                  {canvasItems[activeCanvasTab] && (
                    <div className="threadPage__canvasDetail">
                      {canvasItems[activeCanvasTab].type === 'page' && (
                        <>
                          <OuiText size="s">
                            <strong>{canvasItems[activeCanvasTab].title}</strong>
                          </OuiText>
                          <OuiText size="s" color="subdued">
                            <p>{canvasItems[activeCanvasTab].description}</p>
                          </OuiText>
                        </>
                      )}
                      {canvasItems[activeCanvasTab].type === 'query' && (
                        <OuiCodeBlock fontSize="s" paddingSize="s" isCopyable>
                          {canvasItems[activeCanvasTab].query}
                        </OuiCodeBlock>
                      )}
                    </div>
                  )}
                </div>
              )}
            </OuiFlyoutBody>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};
