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

import React, { useState } from 'react';

import {
  OuiTab,
  OuiTabs,
  OuiText,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Header */}
      <DetailPageHeader title="Settings" />

      {/* Tab bar */}
      <div className="workspacePage__tabBar">
        <OuiTabs size="s" display="condensed">
          <OuiTab
            isSelected={activeTab === 'general'}
            onClick={() => setActiveTab('general')}>
            General
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}>
            Appearance
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}>
            Notifications
          </OuiTab>
        </OuiTabs>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        <OuiText color="subdued">
          <p>{activeTab.replace(/^\w/, (c) => c.toUpperCase())} content</p>
        </OuiText>
      </div>
    </div>
  );
};
