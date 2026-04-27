/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

const ITEMS_MAP = {
  'notebook-runbook': 'Runbook checklist',
  'notebook-incident': 'Incident postmortem',
  'notebook-capacity': 'Capacity planning',
};

const ITEMS_LIST = [
  { key: 'notebook-runbook', label: 'Runbook checklist', subtitle: 'Last edited 2 hours ago' },
  { key: 'notebook-incident', label: 'Incident postmortem', subtitle: 'Last edited 1 day ago' },
  { key: 'notebook-capacity', label: 'Capacity planning', subtitle: 'Last edited 3 days ago' },
];

export const NotebooksPage = ({ selectedItem, onItemSelect, onContinueAsThread, isPanelOpen, onTogglePanel }) => (
  <PlaceholderPage
    title={ITEMS_MAP[selectedItem] || 'Notebooks'}
    bodyText="Notebook content will appear here."
    headerClassName="notebooksPage__header"
    items={ITEMS_LIST}
    selectedItem={selectedItem}
    onItemSelect={onItemSelect}
    onContinueAsThread={onContinueAsThread}
    isPanelOpen={isPanelOpen}
    onTogglePanel={onTogglePanel}
  />
);
