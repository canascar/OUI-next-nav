/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'monitor-uptime': 'Uptime monitor',
  'monitor-latency': 'Latency threshold',
  'monitor-log-volume': 'Log volume spike',
};

const ITEMS_LIST = [
  {
    key: 'monitor-uptime',
    label: 'Uptime monitor',
    subtitle: 'HTTP · Every 5 min · Active',
  },
  {
    key: 'monitor-latency',
    label: 'Latency threshold',
    subtitle: 'Query · Every 1 min · Active',
  },
  {
    key: 'monitor-log-volume',
    label: 'Log volume spike',
    subtitle: 'Bucket · Every 10 min · Paused',
  },
];

export const MonitorsPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Monitors'}
    bodyText="Monitor details will appear here."
    headerClassName="monitorsPage__header"
    items={ITEMS_LIST}
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
    isAskAiPanelOpen={isAskAiPanelOpen}
    onAskAiToggle={onAskAiToggle}
  />
);
