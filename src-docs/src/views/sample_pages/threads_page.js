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

import React, { useState, useContext } from 'react';

import {
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
  OuiSpacer,
  OuiTitle,
  OuiText,
  OuiIcon,
  OuiButtonIcon,
  OuiButtonEmpty,
  OuiBadge,
  OuiThreadInput,
  OuiThreadList,
} from '../../../../src/components';
import { ThemeContext } from '../../components/with_theme';

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
    iconType: 'alert',
    title: 'Error Rate Spike',
    description: 'Thread · 2 hours ago',
    status: 'Report is ready',
    statusTextColor: 'primary',
  },
  {
    iconType: 'clock',
    title: 'Health check, Apr 11',
    description: 'Automation · 2:00 AM',
    status: 'Requires approval',
    statusTextColor: 'warning',
  },
  {
    iconType: 'sparkles',
    title: 'Orchestrator misroute',
    description: 'Investigation · 2 hours ago',
    status: 'Report is ready',
    statusTextColor: 'primary',
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

const GREETINGS = [
  'Welcome to OpenSearch.',
  'What are you working on?',
  'Ready when you are.',
  "Let's go!",
  'Explore your insights.',
  'What are we observing today?',
  'Looking for data? I got you.',
  'Analyze This.',
  'Analyze That.',
  'Your data, I just help you go through it.',
  '¯\\_(ツ)_/¯',
  'Search on!',
];

let lastGreetingIndex = -1;
const getRandomGreeting = () => {
  let index;
  do {
    index = Math.floor(Math.random() * GREETINGS.length);
  } while (index === lastGreetingIndex && GREETINGS.length > 1);
  lastGreetingIndex = index;
  return GREETINGS[index];
};

export const ThreadsPage = ({ onPageChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [greeting, setGreeting] = useState(getRandomGreeting);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  // Background color matching the parent container
  const bgColor = isDark ? '#060D1A' : '#F4F6FB';

  // Pick a new greeting each time the component mounts
  React.useEffect(() => {
    setGreeting(getRandomGreeting());
  }, []);

  const handleSubmit = (value) => {
    if (value && value.trim() && onPageChange) {
      // Store the initial message and navigate to a fresh thread
      window.__threadInitialMessage = value.trim();
      window.__threadFresh = true;
      onPageChange('thread');
    }
    setInputValue('');
  };

  // Add onClick handlers to thread items
  const threadItems = RECENT_THREADS.map((thread) => ({
    ...thread,
    onClick: () => onPageChange && onPageChange('thread'),
  }));

  return (
    <div style={{ minHeight: '100%' }}>
      <style>{`
        @keyframes breatheIn {
          0% { opacity: 0; transform: scale(0.96) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .threadsGreeting {
          animation: breatheIn 600ms cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
        }
        .threadsPageHeader {
          position: sticky;
          top: 0;
          z-index: 10;
        }
      `}</style>

      {/* Sticky header section */}
      <div
        className="threadsPageHeader"
        style={{
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          padding: '24px 16px 0',
          backgroundColor: bgColor,
        }}>
        <OuiSpacer size="xl" />

        {/* Hero heading */}
        <div style={{ textAlign: 'center' }} className="threadsGreeting">
          <OuiTitle size="l">
            <h1>{greeting}</h1>
          </OuiTitle>
        </div>

        <OuiSpacer size="xl" />

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
        <OuiSpacer size="s" />

        {/* Quick action pills */}
        <OuiFlexGroup
          gutterSize="m"
          wrap
          responsive={false}
          justifyContent="center">
          {QUICK_ACTIONS.map((action, i) => (
            <OuiFlexItem key={i} grow={false}>
              <OuiBadge
                iconType={action.icon}
                color="primary"
                onClick={() => {}}
                onClickAriaLabel={action.label}>
                {action.label}
              </OuiBadge>
            </OuiFlexItem>
          ))}
          <OuiFlexItem grow={false}>
            <OuiBadge
              iconType="plus"
              color="primary"
              onClick={() => {}}
              onClickAriaLabel="More">
              More
            </OuiBadge>
          </OuiFlexItem>
        </OuiFlexGroup>

        <OuiSpacer size="xl" />
      </div>

      {/* Scrollable content section */}
      <div
        style={{
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
          padding: '0 16px 24px',
        }}>
        {/* Pick up where you left off */}
        <OuiText size="xs" color="subdued">
          <strong
            style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Pick up where you left off
          </strong>
        </OuiText>
        <OuiSpacer size="m" />

        <OuiThreadList items={threadItems} flush />

        <OuiSpacer size="m" />
        <div style={{ textAlign: 'center' }}>
          <OuiButtonEmpty
            size="s"
            onClick={() => onPageChange && onPageChange('recents')}>
            View all threads
          </OuiButtonEmpty>
        </div>

        <OuiSpacer size="xl" />

        {/* Start something afresh */}
        <OuiText size="xs" color="subdued">
          <strong
            style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Start something afresh
          </strong>
        </OuiText>
        <OuiSpacer size="l" />

        <OuiFlexGroup gutterSize="m" wrap>
          {START_CARDS.map((card, i) => (
            <OuiFlexItem
              key={i}
              grow={false}
              style={{
                minWidth: 'calc(33.33% - 12px)',
                maxWidth: 'calc(33.33% - 12px)',
              }}>
              <OuiPanel paddingSize="m" hasBorder className="startCard">
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

        <OuiSpacer size="xl" />
      </div>
    </div>
  );
};
