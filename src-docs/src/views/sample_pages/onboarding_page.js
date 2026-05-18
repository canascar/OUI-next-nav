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
  OuiTitle,
  OuiToolTip,
  OuiCompressedTextArea,
} from '../../../../src/components';

const THREAD = {
  title: 'Getting started',
  messages: [],
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
        <p
          key={key++}
          style={{ margin: '8px 0 4px', fontSize: 12, fontWeight: 700 }}>
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

// Link preview attachment card (Tool UI style)
const LinkPreviewAttachment = ({
  href,
  title,
  description,
  onAddToCanvas,
  canvasItems,
}) => {
  const added = canvasItems.some(
    (c) => c.type === 'link-preview' && c.title === title
  );
  return (
    <div className="threadPage__attachmentWrap">
      <button
        type="button"
        className={`threadPage__addToCanvas${
          added ? ' threadPage__addToCanvas--added' : ''
        }`}
        onClick={
          added
            ? undefined
            : () =>
                onAddToCanvas({
                  type: 'link-preview',
                  href,
                  title,
                  description,
                })
        }>
        {added ? 'Added as related asset' : 'Add as related asset'}
      </button>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="threadPage__attachment threadPage__attachment--linkPreview">
          <div className="threadPage__linkPreviewBody">
            <OuiText size="xs">
              <strong>{title}</strong>
            </OuiText>
            {description && (
              <OuiText size="xs" color="subdued">
                <p style={{ margin: 0 }}>{description}</p>
              </OuiText>
            )}
            <OuiText size="xs" color="subdued">
              <span className="threadPage__linkPreviewUrl">{href}</span>
            </OuiText>
          </div>
        </a>
      ) : (
        <div className="threadPage__attachment threadPage__attachment--linkPreview">
          <div className="threadPage__linkPreviewBody">
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
      )}
    </div>
  );
};

// Renders a single attachment by type
const renderAttachment = (att, idx, onAddToCanvas, canvasItems) => {
  if (att.type === 'link-preview') {
    return (
      <LinkPreviewAttachment
        key={idx}
        href={att.href}
        title={att.title}
        description={att.description}
        onAddToCanvas={onAddToCanvas}
        canvasItems={canvasItems}
      />
    );
  }
  if (att.type === 'code-block') {
    return (
      <div key={idx} className="threadPage__attachmentWrap">
        <div className="threadPage__attachment threadPage__attachment--codeBlock">
          {att.title && (
            <OuiText size="xs" style={{ marginBottom: 4 }}>
              <strong>{att.title}</strong>
            </OuiText>
          )}
          <OuiCodeBlock
            language={att.language}
            fontSize="s"
            paddingSize="s"
            isCopyable>
            {att.code}
          </OuiCodeBlock>
        </div>
      </div>
    );
  }
  if (att.type === 'data-table') {
    return (
      <div key={idx} className="threadPage__attachmentWrap">
        <div className="threadPage__attachment threadPage__attachment--dataTable">
          {att.title && (
            <OuiText size="xs" style={{ marginBottom: 8 }}>
              <strong>{att.title}</strong>
            </OuiText>
          )}
          <div className="threadPage__dataTableScroll">
            <table className="threadPage__dataTable">
              <thead>
                <tr>
                  {att.columns.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {att.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Assistant message with attachments and feedback
const AssistantMessage = ({
  content,
  streaming,
  attachment,
  attachments,
  onAddToCanvas,
  canvasItems,
}) => {
  const allAttachments = attachments || (attachment ? [attachment] : []);
  return (
    <div className="threadPage__message threadPage__message--assistant">
      <div className="threadPage__bubble threadPage__bubble--assistant">
        {content && <OuiText size="s">{parseContent(content)}</OuiText>}
        {!streaming &&
          allAttachments.map((att, idx) =>
            renderAttachment(att, idx, onAddToCanvas, canvasItems)
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
};

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

// Scripted conversation steps (triggered sequentially)
const CONVERSATION_STEPS = [
  {
    // Step 0: User says "I am using k8s"
    tasks: [
      'Scanning project structure',
      'Detecting infrastructure',
      'Analyzing dependencies',
    ],
    responses: [
      {
        content:
          'Got it, Kubernetes. I have prepared an OpenTelemetry Collector configuration for your cluster that will capture logs and metrics from your pods and nodes:',
        attachment: {
          type: 'code-block',
          title: 'otel-collector-config.yaml',
          language: 'yaml',
          code: `apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
spec:
  mode: daemonset
  config: |
    receivers:
      otlp:
        protocols:
          grpc: { endpoint: 0.0.0.0:4317 }
    exporters:
      opensearch:
        endpoint: "https://opensearch-cluster:9200"
    service:
      pipelines:
        logs:
          receivers: [otlp]
          exporters: [opensearch]
        metrics:
          receivers: [otlp]
          exporters: [opensearch]`,
        },
      },
      {
        content:
          'Where do you want to store your observability data? I can send logs, metrics, and traces to either of these:\n\n- CloudWatch — AWS-native, integrates with your existing AWS monitoring stack.\n- OpenSearch — Full-text search, flexible dashboards, and advanced analytics with PPL queries.\n\nWhich one works best for your team?',
      },
    ],
  },
  {
    // Step 1: User says "OpenSearch"
    tasks: null,
    responses: [
      {
        content:
          'Got it. I will configure OpenSearch as your data store. I am setting up the index templates for logs, metrics, and traces with optimized mappings for Kubernetes metadata.\n\nWhen you are ready, I will start collecting data from your cluster. Just say the word.',
      },
    ],
  },
  {
    // Step 2: User says "I am ready"
    tasks: [
      'Deploying collector to cluster',
      'Verifying data pipeline',
      'Waiting for first events',
    ],
    responses: [
      {
        content:
          'Now collecting data from your project. Here is what is flowing in so far:',
        attachment: {
          type: 'data-table',
          title: 'Ingestion Summary',
          columns: ['Signal', 'Count', 'Status'],
          rows: [
            ['Logs', '12,847', 'Active'],
            ['Metrics', '3,291', 'Active'],
            ['Traces', '1,056', 'Active'],
          ],
        },
      },
      {
        content:
          'I also mapped your service dependencies based on the trace data:',
        tasksBefore: ['Mapping service topology', 'Analyzing trace spans'],
        attachment: {
          type: 'link-preview',
          title: 'Application service map',
          description:
            'Auto-discovered service topology showing frontend → checkout → payment-service → inventory, with health indicators and latency between nodes.',
        },
      },
      {
        content: "I've generated a few dashboards for you to get started:",
        tasksBefore: ['Building dashboards', 'Configuring visualizations'],
        attachments: [
          {
            type: 'link-preview',
            title: 'Kubernetes Cluster Overview',
            description:
              'Node health, pod status, resource requests vs limits, and namespace utilization across your cluster.',
          },
          {
            type: 'link-preview',
            title: 'Service Latency & Error Rates',
            description:
              'P50/P95/P99 latency and error rate trends for each service, with breakdown by endpoint.',
          },
          {
            type: 'link-preview',
            title: 'Log Volume by Namespace',
            description:
              'Log ingestion rates per namespace with severity distribution and top error patterns.',
          },
        ],
      },
      {
        content:
          'Great. Your OpenSearch dashboard is live, data is flowing, and your first dashboards are ready. Welcome aboard.',
      },
    ],
  },
  {
    // Step 3: User says "Start use" — navigate to sample-pages
    tasks: null,
    responses: [],
    navigate: '/sample-pages',
  },
];

export const OnboardingPage = () => {
  const [messages, setMessages] = useState(THREAD.messages);
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState([]);
  const [activeCanvasTab, setActiveCanvasTab] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [setupPlanSteps, setSetupPlanSteps] = useState([]);
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

  // Pre-populate panel (empty by default)
  useEffect(() => {
    setIsCanvasOpen(false);
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

    const stepIdx = responseIndex.current;
    const step = CONVERSATION_STEPS[stepIdx % CONVERSATION_STEPS.length];
    responseIndex.current += 1;

    // If this step triggers navigation, redirect after a short delay
    if (step.navigate) {
      setIsTyping(false);
      setTimeout(() => {
        window.location.hash = step.navigate;
      }, 800);
      return;
    }

    const tasks = step.tasks;
    const responses = step.responses;

    // Reveal setup plan steps based on conversation progress
    const PLAN_STEPS_BY_STAGE = [
      // Step 0: after "Check my project set up"
      [
        { label: 'Detect project infrastructure', status: 'done' },
        { label: 'Configure collector', status: 'done' },
        { label: 'Choose data store', status: 'current' },
      ],
      // Step 1: after "OpenSearch"
      [
        { label: 'Detect project infrastructure', status: 'done' },
        { label: 'Configure collector', status: 'done' },
        { label: 'Choose data store', status: 'done' },
        { label: 'Start data collection', status: 'current' },
      ],
      // Step 2: after "I am ready"
      [
        { label: 'Detect project infrastructure', status: 'done' },
        { label: 'Configure collector', status: 'done' },
        { label: 'Choose data store', status: 'done' },
        { label: 'Start data collection', status: 'done' },
        { label: 'Generate dashboards', status: 'done' },
        { label: 'Setup complete', status: 'done' },
      ],
    ];

    if (stepIdx < PLAN_STEPS_BY_STAGE.length) {
      setSetupPlanSteps(PLAN_STEPS_BY_STAGE[stepIdx]);
      setIsCanvasOpen(true);
      setActiveCanvasTab(0);
    }

    const startStreaming = (delay) => {
      let cumulativeDelay = delay;

      responses.forEach((response, rIdx) => {
        // If this response has tasksBefore, show a task list first
        if (response.tasksBefore && response.tasksBefore.length > 0) {
          const inlineTasks = response.tasksBefore;
          const taskDelay = cumulativeDelay;

          // Add task list message
          const tTask = setTimeout(() => {
            const taskMsg = {
              role: 'tasks',
              tasks: inlineTasks,
              statuses: ['running'],
              collapsed: false,
            };
            setMessages((prev) => [...prev, taskMsg]);
          }, taskDelay);
          streamTimers.current.push(tTask);

          // Animate each task
          inlineTasks.forEach((_, ti) => {
            if (ti === 0) return;
            const tAnim = setTimeout(() => {
              setMessages((prev) => {
                const updated = [...prev];
                const idx = updated.findLastIndex(
                  (m) => m.role === 'tasks' && !m.collapsed
                );
                if (idx >= 0) {
                  const newStatuses = [...updated[idx].statuses];
                  newStatuses[ti - 1] = 'done';
                  newStatuses[ti] = 'running';
                  updated[idx] = { ...updated[idx], statuses: newStatuses };
                }
                return updated;
              });
            }, taskDelay + ti * 1000);
            streamTimers.current.push(tAnim);
          });

          // Finish and collapse
          const finishDelay = taskDelay + inlineTasks.length * 1000;
          const tFinish = setTimeout(() => {
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findLastIndex(
                (m) => m.role === 'tasks' && !m.collapsed
              );
              if (idx >= 0) {
                updated[idx] = {
                  ...updated[idx],
                  statuses: inlineTasks.map(() => 'done'),
                };
              }
              return updated;
            });
          }, finishDelay);
          streamTimers.current.push(tFinish);

          const collapseDelay = finishDelay + 400;
          const tCollapse = setTimeout(() => {
            setMessages((prev) => {
              const updated = [...prev];
              const idx = updated.findLastIndex(
                (m) => m.role === 'tasks' && !m.collapsed
              );
              if (idx >= 0) {
                updated[idx] = { ...updated[idx], collapsed: true };
              }
              return updated;
            });
          }, collapseDelay);
          streamTimers.current.push(tCollapse);

          cumulativeDelay = collapseDelay + 300;
        }

        const responseDelay = cumulativeDelay;
        const t = setTimeout(() => {
          if (rIdx === 0) setIsTyping(false);

          const tokens = response.content.split(/(\s+)/);
          const msgData = {
            role: 'assistant',
            content: '',
            streaming: true,
            ...(response.attachments
              ? { attachments: response.attachments }
              : { attachment: response.attachment }),
          };
          setMessages((prev) => [...prev, msgData]);

          let built = '';
          tokens.forEach((token, i) => {
            const timer = setTimeout(() => {
              built += token;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: built,
                  streaming: i < tokens.length - 1,
                };
                return updated;
              });

              // Auto-add attachments to right panel when streaming finishes
              if (i === tokens.length - 1) {
                const atts =
                  response.attachments ||
                  (response.attachment ? [response.attachment] : []);
                if (atts.length > 0) {
                  setCanvasItems((prev) => [...prev, ...atts]);
                  setIsCanvasOpen(true);
                }
              }
            }, i * 30);
            streamTimers.current.push(timer);
          });
        }, responseDelay);
        streamTimers.current.push(t);

        // Estimate time for this response to finish streaming
        const tokenCount = response.content.split(/(\s+)/).length;
        cumulativeDelay += tokenCount * 30 + 800; // streaming time + gap between responses
      });
    };

    if (tasks) {
      // Show task list first
      const taskMsg = {
        role: 'tasks',
        tasks,
        statuses: ['running'],
        collapsed: false,
      };
      setMessages((prev) => [...prev, taskMsg]);

      // Animate tasks
      tasks.forEach((_, i) => {
        if (i === 0) return; // first task starts as running
        const t = setTimeout(() => {
          setMessages((prev) => {
            const updated = [...prev];
            const ti = updated.findLastIndex((m) => m.role === 'tasks');
            if (ti >= 0) {
              const newStatuses = [...updated[ti].statuses];
              newStatuses[i - 1] = 'done';
              newStatuses[i] = 'running';
              updated[ti] = { ...updated[ti], statuses: newStatuses };
            }
            return updated;
          });
        }, i * 1500);
        streamTimers.current.push(t);
      });

      // Finish last task
      const finishTasksDelay = tasks.length * 1500;
      const tFinish = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const ti = updated.findLastIndex((m) => m.role === 'tasks');
          if (ti >= 0) {
            const newStatuses = tasks.map(() => 'done');
            updated[ti] = { ...updated[ti], statuses: newStatuses };
          }
          return updated;
        });
      }, finishTasksDelay);
      streamTimers.current.push(tFinish);

      // Collapse tasks and start streaming
      const collapseDelay = finishTasksDelay + 500;
      const tCollapse = setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev];
          const ti = updated.findLastIndex((m) => m.role === 'tasks');
          if (ti >= 0) updated[ti] = { ...updated[ti], collapsed: true };
          return updated;
        });
      }, collapseDelay);
      streamTimers.current.push(tCollapse);

      startStreaming(collapseDelay + 300);
    } else {
      // No tasks, start streaming immediately
      startStreaming(800);
    }
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
              {messages.length > 0 ? 'Set up from new' : THREAD.title}
              {messages.length > 0 && (
                <button
                  type="button"
                  className="onboardingPage__startOver"
                  onClick={() => window.location.reload()}>
                  Start over
                </button>
              )}
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
                {messages.length === 0 ? (
                  <div className="onboardingPage__options">
                    <OuiTitle size="m">
                      <h2>Set up observability solution</h2>
                    </OuiTitle>
                    <OuiFlexGroup gutterSize="l" style={{ marginTop: 24 }}>
                      <OuiFlexItem key="new">
                        <button
                          type="button"
                          className={`onboardingPage__optionCard${
                            selectedOption === 'new'
                              ? ' onboardingPage__optionCard--selected'
                              : ''
                          }`}
                          onClick={() => setSelectedOption('new')}>
                          <OuiIcon
                            type="plusInCircle"
                            size="l"
                            color="primary"
                          />
                          <OuiText size="s">
                            <strong>Set up from new</strong>
                          </OuiText>
                          <OuiText size="xs" color="subdued">
                            <p style={{ margin: 0 }}>
                              Start fresh with a new observability configuration
                              tailored to your environment.
                            </p>
                          </OuiText>
                        </button>
                        {selectedOption === 'new' && (
                          <OuiText
                            size="s"
                            className="onboardingPage__optionDetail">
                            <p>
                              Tell me about your infrastructure setup — what
                              services are you running, and where are they
                              deployed? I will configure the right collectors
                              and pipelines for you.
                            </p>
                          </OuiText>
                        )}
                      </OuiFlexItem>
                      <OuiFlexItem key="migrate">
                        <button
                          type="button"
                          className={`onboardingPage__optionCard${
                            selectedOption === 'migrate'
                              ? ' onboardingPage__optionCard--selected'
                              : ''
                          }`}
                          onClick={() => setSelectedOption('migrate')}>
                          <OuiIcon
                            type="importAction"
                            size="l"
                            color="primary"
                          />
                          <OuiText size="s">
                            <strong>Migrate from others</strong>
                          </OuiText>
                          <OuiText size="xs" color="subdued">
                            <p style={{ margin: 0 }}>
                              Bring your existing observability configuration
                              from another platform to OpenSearch.
                            </p>
                          </OuiText>
                        </button>
                        {selectedOption === 'migrate' && (
                          <OuiText
                            size="s"
                            className="onboardingPage__optionDetail">
                            <p>
                              Tell me about your current observability platform
                              — what tools are you using today, and what data
                              are you collecting? I will help you migrate
                              everything over.
                            </p>
                          </OuiText>
                        )}
                      </OuiFlexItem>
                    </OuiFlexGroup>
                  </div>
                ) : (
                  messages.map((msg, i) => {
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
                        attachments={msg.attachments}
                        onAddToCanvas={() => {}}
                        canvasItems={canvasItems}
                      />
                    );
                  })
                )}
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
                      isDisabled={
                        !message.trim() ||
                        isTyping ||
                        messages.some((m) => m.streaming)
                      }
                      onClick={handleSend}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas flyout (push panel) */}
            <div
              className={`threadPage__canvasFlyout${
                isCanvasOpen ? ' threadPage__canvasFlyout--open' : ''
              }${
                isCanvasDragging ? ' threadPage__canvasFlyout--dragging' : ''
              }`}
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
                  <OuiTabs size="s" className="threadPage__canvasTabs">
                    <OuiTab
                      isSelected={activeCanvasTab === 0}
                      onClick={() => setActiveCanvasTab(0)}>
                      Setup plan
                    </OuiTab>
                    {canvasItems.map((item, i) => (
                      <OuiTab
                        key={i}
                        isSelected={activeCanvasTab === i + 1}
                        onClick={() => setActiveCanvasTab(i + 1)}>
                        {item.title ||
                          (item.type === 'query' ? 'Query' : `Asset ${i + 1}`)}
                      </OuiTab>
                    ))}
                  </OuiTabs>
                </OuiFlyoutHeader>
                <OuiFlyoutBody>
                  {activeCanvasTab === 0 ? (
                    <div className="onboardingPage__planList">
                      {setupPlanSteps.length === 0 ? (
                        <OuiText size="s" color="subdued">
                          <p>
                            Your setup plan will appear here as you progress.
                          </p>
                        </OuiText>
                      ) : (
                        setupPlanSteps.map((step, i) => (
                          <div key={i} className="onboardingPage__planItem">
                            <div className="onboardingPage__planIcon">
                              {step.status === 'done' ? (
                                <OuiIcon
                                  type="checkInCircleEmpty"
                                  size="m"
                                  color="success"
                                />
                              ) : (
                                <OuiIcon type="dot" size="m" color="primary" />
                              )}
                            </div>
                            <OuiText size="s">
                              <span
                                className={
                                  step.status === 'current'
                                    ? 'onboardingPage__planLabel--current'
                                    : ''
                                }>
                                {step.label}
                              </span>
                            </OuiText>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="threadPage__canvasDetail">
                      {canvasItems[activeCanvasTab - 1] &&
                        canvasItems[activeCanvasTab - 1].type === 'page' && (
                          <>
                            <OuiText size="s">
                              <strong>
                                {canvasItems[activeCanvasTab - 1].title}
                              </strong>
                            </OuiText>
                            <OuiText size="s" color="subdued">
                              <p>
                                {canvasItems[activeCanvasTab - 1].description}
                              </p>
                            </OuiText>
                          </>
                        )}
                      {canvasItems[activeCanvasTab - 1] &&
                        canvasItems[activeCanvasTab - 1].type === 'query' && (
                          <OuiCodeBlock fontSize="s" paddingSize="s" isCopyable>
                            {canvasItems[activeCanvasTab - 1].query}
                          </OuiCodeBlock>
                        )}
                      {canvasItems[activeCanvasTab - 1] &&
                        canvasItems[activeCanvasTab - 1].type ===
                          'code-block' && (
                          <>
                            {canvasItems[activeCanvasTab - 1].title && (
                              <OuiText size="s">
                                <strong>
                                  {canvasItems[activeCanvasTab - 1].title}
                                </strong>
                              </OuiText>
                            )}
                            <OuiCodeBlock
                              language={
                                canvasItems[activeCanvasTab - 1].language
                              }
                              fontSize="s"
                              paddingSize="s"
                              isCopyable>
                              {canvasItems[activeCanvasTab - 1].code}
                            </OuiCodeBlock>
                          </>
                        )}
                      {canvasItems[activeCanvasTab - 1] &&
                        canvasItems[activeCanvasTab - 1].type ===
                          'data-table' && (
                          <>
                            {canvasItems[activeCanvasTab - 1].title && (
                              <OuiText size="s">
                                <strong>
                                  {canvasItems[activeCanvasTab - 1].title}
                                </strong>
                              </OuiText>
                            )}
                            <div className="threadPage__dataTableScroll">
                              <table className="threadPage__dataTable">
                                <thead>
                                  <tr>
                                    {canvasItems[
                                      activeCanvasTab - 1
                                    ].columns.map((col, i) => (
                                      <th key={i}>{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {canvasItems[activeCanvasTab - 1].rows.map(
                                    (row, i) => (
                                      <tr key={i}>
                                        {row.map((cell, j) => (
                                          <td key={j}>{cell}</td>
                                        ))}
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </>
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
