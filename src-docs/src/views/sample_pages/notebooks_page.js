/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';
import { DetailPageHeader } from './detail_page_header';
import { InventoryAnalysisPageMock, ConnectionPoolPageMock } from './mock_canvas_pages';

const ITEMS_MAP = {
  'notebook-runbook': 'Runbook checklist',
  'notebook-incident': 'Incident postmortem',
  'notebook-capacity': 'Capacity planning',
  'notebook-inventory-analysis': 'Inventory service dependency analysis',
  'notebook-connection-pool': 'Payment service connection pool metrics',
};

const ITEMS_LIST = [
  {
    key: 'notebook-runbook',
    label: 'Runbook checklist',
    subtitle: 'Last edited 2 hours ago',
  },
  {
    key: 'notebook-incident',
    label: 'Incident postmortem',
    subtitle: 'Last edited 1 day ago',
  },
  {
    key: 'notebook-capacity',
    label: 'Capacity planning',
    subtitle: 'Last edited 3 days ago',
  },
];

export const NotebooksPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => {
  if (selectedItem === 'notebook-inventory-analysis') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DetailPageHeader
          title="Inventory service dependency analysis"
          onContinueAsThread={onContinueAsThread}
          isPanelOpen={isPanelOpen}
          onTogglePanel={onTogglePanel}
          isAskAiPanelOpen={isAskAiPanelOpen}
          onAskAiToggle={onAskAiToggle}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <InventoryAnalysisPageMock />
        </div>
      </div>
    );
  }

  if (selectedItem === 'notebook-connection-pool') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DetailPageHeader
          title="Payment service connection pool metrics"
          onContinueAsThread={onContinueAsThread}
          isPanelOpen={isPanelOpen}
          onTogglePanel={onTogglePanel}
          isAskAiPanelOpen={isAskAiPanelOpen}
          onAskAiToggle={onAskAiToggle}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <ConnectionPoolPageMock />
        </div>
      </div>
    );
  }

  return (
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
      isAskAiPanelOpen={isAskAiPanelOpen}
      onAskAiToggle={onAskAiToggle}
    />
  );
};
