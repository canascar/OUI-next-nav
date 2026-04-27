/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from 'react';

import { OuiText } from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

const DASHBOARD_TITLES = {
  'system-overview': 'System overview',
  'web-traffic': 'Web traffic analytics',
  'api-performance': 'API performance',
};

export const DashboardsPage = ({ selectedItem, onContinueAsThread, isPanelOpen, onTogglePanel }) => {
  const currentTitle = (selectedItem && DASHBOARD_TITLES[selectedItem]) || 'Dashboards';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DetailPageHeader
        title={currentTitle}
        onContinueAsThread={onContinueAsThread}
        isPanelOpen={isPanelOpen}
        onTogglePanel={onTogglePanel}
      />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <OuiText color="subdued" textAlign="center">
          <p>Dashboard detail view will appear here.</p>
        </OuiText>
      </div>
    </div>
  );
};
