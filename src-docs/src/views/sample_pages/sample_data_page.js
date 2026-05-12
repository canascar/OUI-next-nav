/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'sample-ecommerce': 'Sample eCommerce orders',
  'sample-flights': 'Sample flight data',
  'sample-web-logs': 'Sample web logs',
};

const ITEMS_LIST = [
  {
    key: 'sample-ecommerce',
    label: 'Sample eCommerce orders',
    subtitle: 'Preloaded dataset',
  },
  {
    key: 'sample-flights',
    label: 'Sample flight data',
    subtitle: 'Preloaded dataset',
  },
  {
    key: 'sample-web-logs',
    label: 'Sample web logs',
    subtitle: 'Preloaded dataset',
  },
];

export const SampleDataPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Sample Data'}
    bodyText="Sample data details will appear here."
    headerClassName="sampleDataPage__header"
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
