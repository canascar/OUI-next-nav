/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'ds-faos219prod': 'FAOS219prod',
  'ds-os-219': 'OS 219',
  'ds-olly-stable': 'Olly@stableDefault',
};

const ITEMS_LIST = [
  {
    key: 'ds-faos219prod',
    label: 'FAOS219prod',
    subtitle: 'OpenSearch 2.19 · Production',
  },
  {
    key: 'ds-os-219',
    label: 'OS 219',
    subtitle: 'OpenSearch 2.19 · Development',
  },
  {
    key: 'ds-olly-stable',
    label: 'Olly@stableDefault',
    subtitle: 'OpenSearch · Observability',
  },
];

export const DataSourcesPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Data Sources'}
    bodyText="Data source details will appear here."
    headerClassName="dataSourcesPage__header"
    items={ITEMS_LIST}
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
  />
);
