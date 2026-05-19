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
  OuiStat,
  OuiButton,
  OuiButtonEmpty,
  OuiHorizontalRule,
  OuiDatePickerUnified,
} from '../../../../src/components';

// --- Feature cards at the top ---

const FEATURE_CARDS = [
  {
    icon: 'securityApp',
    title: 'Get started guide',
    description:
      'Configure Security Analytics tools and components to get started.',
  },
  {
    icon: 'discoverApp',
    title: 'Discover',
    description: 'Explore data to uncover and discover insights.',
  },
  {
    icon: 'graphApp',
    title: 'Threat detection',
    description:
      'Identify security threats in your log data with detection rules.',
  },
  {
    icon: 'heartbeatApp',
    title: 'Threat intelligence',
    description:
      'Scan your log data for malicious actors from known indicators of compromise.',
  },
];

// --- Stat cards ---

const STAT_CARDS = [
  { title: 'Total active threat alerts', value: 0 },
  { title: 'Correlations', value: 0 },
  { title: 'Detection rule findings', value: 0 },
  { title: 'Threat intel findings', value: 0 },
];

// --- Empty state for tables ---

const EmptyState = ({ noun }) => (
  <div style={{ textAlign: 'center', padding: '32px 16px' }}>
    <OuiText size="s" color="subdued">
      <p>
        No recent {noun}.
        <br />
        Adjust the time range to see more results.
      </p>
    </OuiText>
  </div>
);

// --- Main component ---

export const OverviewPage = () => {
  const [start, setStart] = useState('now-24h');
  const [end, setEnd] = useState('now');

  const handleTimeChange = ({ start: s, end: e }) => {
    setStart(s);
    setEnd(e);
  };

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Page header */}
      <OuiFlexGroup
        alignItems="center"
        justifyContent="spaceBetween"
        responsive={false}
        gutterSize="none">
        <OuiFlexItem grow={false}>
          <OuiTitle size="m">
            <h2>Overview</h2>
          </OuiTitle>
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OuiDatePickerUnified
            start={start}
            end={end}
            onTimeChange={handleTimeChange}
            compressed
          />
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="m" />
      {/* Feature cards row */}
      <OuiFlexGroup gutterSize="m" responsive={false}>
        {FEATURE_CARDS.map((card, i) => (
          <OuiFlexItem key={i}>
            <OuiPanel paddingSize="m" hasBorder>
              <OuiIcon type={card.icon} size="l" color="primary" />
              <OuiSpacer size="s" />
              <OuiText size="s">
                <p>{card.description}</p>
              </OuiText>
              <OuiSpacer size="xs" />
              <OuiText size="xs" color="subdued">
                <strong>{card.title}</strong>
              </OuiText>
            </OuiPanel>
          </OuiFlexItem>
        ))}
      </OuiFlexGroup>

      <OuiSpacer size="l" />

      {/* Stat cards row */}
      <OuiFlexGroup gutterSize="m" responsive={false}>
        {STAT_CARDS.map((stat, i) => (
          <OuiFlexItem key={i}>
            <OuiPanel paddingSize="m" hasBorder>
              <OuiStat
                title={stat.value}
                description={stat.title}
                titleSize="l"
                reverse
              />
            </OuiPanel>
          </OuiFlexItem>
        ))}
      </OuiFlexGroup>

      <OuiSpacer size="l" />

      {/* Recent alerts + Recent detection rule findings */}
      <OuiFlexGroup gutterSize="m" responsive={false}>
        <OuiFlexItem>
          <OuiPanel paddingSize="m" hasBorder>
            <OuiFlexGroup
              alignItems="center"
              justifyContent="spaceBetween"
              responsive={false}
              gutterSize="none">
              <OuiFlexItem grow={false}>
                <OuiTitle size="xs">
                  <h3>Recent threat alerts</h3>
                </OuiTitle>
              </OuiFlexItem>
              <OuiFlexItem grow={false}>
                <OuiButton size="s">View Alerts</OuiButton>
              </OuiFlexItem>
            </OuiFlexGroup>
            <EmptyState noun="alerts" />
          </OuiPanel>
        </OuiFlexItem>
        <OuiFlexItem>
          <OuiPanel paddingSize="m" hasBorder>
            <OuiFlexGroup
              alignItems="center"
              justifyContent="spaceBetween"
              responsive={false}
              gutterSize="none">
              <OuiFlexItem grow={false}>
                <OuiTitle size="xs">
                  <h3>Recent detection rule findings</h3>
                </OuiTitle>
              </OuiFlexItem>
              <OuiFlexItem grow={false}>
                <OuiButton size="s">View all</OuiButton>
              </OuiFlexItem>
            </OuiFlexGroup>
            <EmptyState noun="findings" />
          </OuiPanel>
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="l" />

      {/* Recent threat intel findings */}
      <OuiPanel paddingSize="m" hasBorder>
        <OuiFlexGroup
          alignItems="center"
          justifyContent="spaceBetween"
          responsive={false}
          gutterSize="none">
          <OuiFlexItem grow={false}>
            <OuiTitle size="xs">
              <h3>Recent threat intel findings</h3>
            </OuiTitle>
          </OuiFlexItem>
          <OuiFlexItem grow={false}>
            <OuiButton size="s">View all</OuiButton>
          </OuiFlexItem>
        </OuiFlexGroup>
        <EmptyState noun="findings" />
      </OuiPanel>
    </div>
  );
};
