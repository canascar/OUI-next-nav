/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'auto-alert-triage': 'Alert triage',
  'auto-log-cleanup': 'Log cleanup',
  'auto-report-gen': 'Report generation',
};

export const AiAutomationsPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Automations'}
    bodyText="Automation details will appear here."
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
  />
);
