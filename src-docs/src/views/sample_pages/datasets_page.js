/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'dataset-web-logs': 'Web server logs',
  'dataset-app-traces': 'Application traces',
  'dataset-system-metrics': 'System metrics',
};

const ITEMS_LIST = [
  {
    key: 'dataset-web-logs',
    label: 'Web server logs',
    subtitle: '2.4 GB · Updated 5 min ago',
  },
  {
    key: 'dataset-app-traces',
    label: 'Application traces',
    subtitle: '1.1 GB · Updated 10 min ago',
  },
  {
    key: 'dataset-system-metrics',
    label: 'System metrics',
    subtitle: '890 MB · Updated 1 min ago',
  },
];

export const DatasetsPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Datasets'}
    bodyText="Dataset details will appear here."
    headerClassName="datasetsPage__header"
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
