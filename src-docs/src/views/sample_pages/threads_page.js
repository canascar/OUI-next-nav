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

import React, { useState } from 'react';

import {
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
  OuiSpacer,
  OuiTitle,
  OuiText,
  OuiIcon,
  OuiButtonIcon,
  OuiBadge,
  OuiThreadInput,
  OuiHorizontalRule,
  OuiTabs,
  OuiTab,
} from '../../../../src/components';

// --- Quick action pills ---
const QUICK_ACTIONS = [
  { icon: 'visLine', label: 'Metrics Explorer' },
  { icon: 'document', label: 'Logs Explorer' },
  { icon: 'graphApp', label: 'Trace Explorer' },
  { icon: 'users', label: 'Session Explorer' },
  { icon: 'console', label: 'Prompt Playground' },
];

// --- Recent threads ---
const RECENT_THREADS = [
  {
    icon: 'alert',
    title: 'Error Rate Spike',
    type: 'Thread',
    time: '2 hours ago',
    status: 'Report is ready',
    statusColor: 'primary',
  },
  {
    icon: 'clock',
    title: 'Health check, Apr 11',
    type: 'Automation',
    time: '2:00 AM',
    status: 'Requires approval',
    statusColor: 'warning',
  },
  {
    icon: 'sparkles',
    title: 'Orchestrator misroute',
    type: 'Investigation',
    time: '2 hours ago',
    status: 'Report is ready',
    statusColor: 'primary',
  },
];

// --- Start something cards ---
const START_CARDS = [
  { icon: 'grid', title: 'Dashboards', description: 'Custom dashboards' },
  {
    icon: 'graphApp',
    title: 'Application Map',
    description: 'Service topology',
  },
  { icon: 'compute', title: 'Services', description: 'Application services' },
  { icon: 'package', title: 'Agents', description: 'AI agents' },
  { icon: 'bell', title: 'Alarms', description: 'Alert management' },
  {
    icon: 'bullseye',
    title: 'SLOs',
    description: 'Service level objectives',
  },
];

export const ThreadsPage = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (value) => {
    // In a real app, this would create a new thread
    console.log('New thread:', value);
    setInputValue('');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Tab bar */}
      <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
        <OuiFlexItem grow={false}>
          <OuiTabs size="s" style={{ marginBottom: 0 }}>
            <OuiTab isSelected>New Thread</OuiTab>
          </OuiTabs>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiButtonIcon
            iconType="plus"
            aria-label="New thread"
            size="s"
            color="text"
          />
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="xl" />

      {/* Hero heading */}
      <div style={{ textAlign: 'center' }}>
        <OuiTitle size="l">
          <h1>What are you working on?</h1>
        </OuiTitle>
      </div>

      <OuiSpacer size="l" />

      {/* Thread input */}
      <OuiThreadInput
        placeholder="Ask anything or use / for commands"
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
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
            isDisabled={!inputValue.trim()}
            onClick={() => handleSubmit(inputValue)}
          />
        }
      />

      <OuiSpacer size="l" />

      {/* Quick action pills */}
      <OuiFlexGroup
        gutterSize="s"
        wrap
        responsive={false}
        justifyContent="center">
        {QUICK_ACTIONS.map((action, i) => (
          <OuiFlexItem key={i} grow={false}>
            <OuiBadge iconType={action.icon} color="hollow">
              {action.label}
            </OuiBadge>
          </OuiFlexItem>
        ))}
        <OuiFlexItem grow={false}>
          <OuiBadge iconType="plus" color="hollow">
            More
          </OuiBadge>
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="xl" />

      {/* Pick up where you left off */}
      <OuiText size="xs" color="subdued">
        <strong style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Pick up where you left off
        </strong>
      </OuiText>
      <OuiSpacer size="m" />

      {RECENT_THREADS.map((thread, i) => (
        <div key={i}>
          <OuiFlexGroup
            alignItems="center"
            gutterSize="m"
            responsive={false}
            style={{ padding: '12px 0' }}>
            <OuiFlexItem grow={false}>
              <OuiIcon type={thread.icon} size="m" color="subdued" />
            </OuiFlexItem>
            <OuiFlexItem>
              <OuiFlexGroup
                alignItems="center"
                gutterSize="s"
                responsive={false}>
                <OuiFlexItem grow={false}>
                  <OuiText size="s">
                    <strong>{thread.title}</strong>
                  </OuiText>
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <OuiText size="xs" color="subdued">
                    {thread.type} · {thread.time}
                  </OuiText>
                </OuiFlexItem>
              </OuiFlexGroup>
            </OuiFlexItem>
            <OuiFlexItem grow={false}>
              <OuiText size="xs" color={thread.statusColor}>
                {thread.status}
              </OuiText>
            </OuiFlexItem>
          </OuiFlexGroup>
          {i < RECENT_THREADS.length - 1 && <OuiHorizontalRule margin="none" />}
        </div>
      ))}

      <OuiSpacer size="xl" />

      {/* Start something afresh */}
      <OuiText size="xs" color="subdued">
        <strong style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Start something afresh
        </strong>
      </OuiText>
      <OuiSpacer size="m" />

      <OuiFlexGroup gutterSize="m" wrap>
        {START_CARDS.map((card, i) => (
          <OuiFlexItem key={i} grow={false} style={{ minWidth: 200 }}>
            <OuiPanel paddingSize="m" hasBorder>
              <OuiFlexGroup
                gutterSize="m"
                alignItems="center"
                responsive={false}>
                <OuiFlexItem grow={false}>
                  <OuiIcon type={card.icon} size="l" color="subdued" />
                </OuiFlexItem>
                <OuiFlexItem>
                  <OuiText size="s">
                    <strong>{card.title}</strong>
                  </OuiText>
                  <OuiText size="xs" color="subdued">
                    {card.description}
                  </OuiText>
                </OuiFlexItem>
              </OuiFlexGroup>
            </OuiPanel>
          </OuiFlexItem>
        ))}
      </OuiFlexGroup>
    </div>
  );
};
