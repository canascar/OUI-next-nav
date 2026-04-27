/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'ip-logs': 'logs-*',
  'ip-metrics': 'metrics-*',
  'ip-traces': 'traces-*',
};

const ITEMS_LIST = [
  { key: 'ip-logs', label: 'logs-*', subtitle: 'Matches 12 indices' },
  { key: 'ip-metrics', label: 'metrics-*', subtitle: 'Matches 8 indices' },
  { key: 'ip-traces', label: 'traces-*', subtitle: 'Matches 5 indices' },
];

export const IndexPatternsPage = ({ selectedItem, onItemSelect, onContinueAsThread, isPanelOpen, onTogglePanel }) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Index Patterns'}
    bodyText="Index pattern details will appear here."
    headerClassName="indexPatternsPage__header"
    items={ITEMS_LIST}
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
  />
);
