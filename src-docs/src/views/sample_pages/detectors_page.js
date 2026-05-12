/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'detector-cpu': 'CPU anomaly detector',
  'detector-latency': 'Latency anomaly detector',
  'detector-error': 'Error rate detector',
};

const ITEMS_LIST = [
  {
    key: 'detector-cpu',
    label: 'CPU anomaly detector',
    subtitle: 'ML · Active',
  },
  {
    key: 'detector-latency',
    label: 'Latency anomaly detector',
    subtitle: 'ML · Active',
  },
  {
    key: 'detector-error',
    label: 'Error rate detector',
    subtitle: 'ML · Draft',
  },
];

export const DetectorsPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Detectors'}
    bodyText="Detector details will appear here."
    headerClassName="detectorsPage__header"
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
