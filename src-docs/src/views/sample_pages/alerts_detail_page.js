/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'alert-cpu-threshold': 'CPU threshold exceeded',
  'alert-disk-usage': 'Disk usage warning',
  'alert-error-spike': 'Error rate spike',
};

const ITEMS_LIST = [
  { key: 'alert-cpu-threshold', label: 'CPU threshold exceeded', subtitle: 'Critical · 10 min ago' },
  { key: 'alert-disk-usage', label: 'Disk usage warning', subtitle: 'Warning · 1 hour ago' },
  { key: 'alert-error-spike', label: 'Error rate spike', subtitle: 'Critical · 3 hours ago' },
];

export const AlertsDetailPage = ({ selectedItem, onItemSelect, onContinueAsThread, isPanelOpen, onTogglePanel }) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Alerts'}
    bodyText="Alert details will appear here."
    headerClassName="alertsDetailPage__header"
    items={ITEMS_LIST}
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
  />
);
