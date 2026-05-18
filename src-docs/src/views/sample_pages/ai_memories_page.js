/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'memory-incident-patterns': 'Incident patterns',
  'memory-runbook-steps': 'Runbook steps',
  'memory-team-prefs': 'Team preferences',
};

export const AiMemoriesPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Memories'}
    bodyText="Memory details will appear here."
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
    isAskAiPanelOpen={isAskAiPanelOpen}
    onAskAiToggle={onAskAiToggle}
  />
);
