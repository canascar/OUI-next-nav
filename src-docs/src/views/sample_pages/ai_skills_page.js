/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'skill-anomaly-detector': 'Anomaly detector',
  'skill-log-summarizer': 'Log summarizer',
  'skill-root-cause': 'Root cause analysis',
};

export const AiSkillsPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
}) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Skills'}
    bodyText="Skill details will appear here."
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
  />
);
