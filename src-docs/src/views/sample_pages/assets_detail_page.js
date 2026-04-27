/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'asset-web-fleet': 'Web server fleet',
  'asset-payment': 'Payment gateway',
  'asset-pipeline': 'Data pipeline cluster',
};

const ITEMS_LIST = [
  { key: 'asset-web-fleet', label: 'Web server fleet', subtitle: '12 hosts · Healthy' },
  { key: 'asset-payment', label: 'Payment gateway', subtitle: '3 endpoints · Warning' },
  { key: 'asset-pipeline', label: 'Data pipeline cluster', subtitle: '8 nodes · Healthy' },
];

export const AssetsDetailPage = ({ selectedItem, onItemSelect, onContinueAsThread, isPanelOpen, onTogglePanel }) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Assets'}
    bodyText="Asset details will appear here."
    headerClassName="assetsDetailPage__header"
    items={ITEMS_LIST}
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
  />
);
