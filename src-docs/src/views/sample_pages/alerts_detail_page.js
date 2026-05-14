/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { OuiText } from '../../../../src/components';
import { PlaceholderPage } from './placeholder_page';
import { DetailPageHeader } from './detail_page_header';
import { AlertPageMock } from './mock_canvas_pages';

const ITEMS_MAP = {
  'alert-cpu-threshold': 'CPU threshold exceeded',
  'alert-disk-usage': 'Disk usage warning',
  'alert-error-spike': 'Error rate spike',
  'alert-payment-p99': 'Payment service P99 latency breach',
};

const ITEMS_LIST = [
  {
    key: 'alert-cpu-threshold',
    label: 'CPU threshold exceeded',
    subtitle: 'Critical · 10 min ago',
  },
  {
    key: 'alert-disk-usage',
    label: 'Disk usage warning',
    subtitle: 'Warning · 1 hour ago',
  },
  {
    key: 'alert-error-spike',
    label: 'Error rate spike',
    subtitle: 'Critical · 3 hours ago',
  },
];

export const AlertsDetailPage = ({
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => {
  if (selectedItem === 'alert-payment-p99') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DetailPageHeader
          title="Payment service P99 latency breach"
          onContinueAsThread={onContinueAsThread}
          isPanelOpen={isPanelOpen}
          onTogglePanel={onTogglePanel}
          isAskAiPanelOpen={isAskAiPanelOpen}
          onAskAiToggle={onAskAiToggle}
        />
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <AlertPageMock />
        </div>
      </div>
    );
  }

  return (
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
      isAskAiPanelOpen={isAskAiPanelOpen}
      onAskAiToggle={onAskAiToggle}
    />
  );
};
