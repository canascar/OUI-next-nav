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

export const WorkspacePage = ({ onContinueAsThread }) => {
  const [activeTab, setActiveTab] = useState('workspace-details');

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Header */}
      <DetailPageHeader title="Workspace" onContinueAsThread={onContinueAsThread} />

      {/* Tab bar */}
      <div className="workspacePage__tabBar">
        <OuiTabs size="s" display="condensed">
          <OuiTab
            isSelected={activeTab === 'workspace-details'}
            onClick={() => setActiveTab('workspace-details')}>
            Workspace details
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'collaborators'}
            onClick={() => setActiveTab('collaborators')}>
            Collaborators
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'index-patterns'}
            onClick={() => setActiveTab('index-patterns')}>
            Index patterns
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'sample-data'}
            onClick={() => setActiveTab('sample-data')}>
            Sample data
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'data-sources'}
            onClick={() => setActiveTab('data-sources')}>
            Data sources
          </OuiTab>
        </OuiTabs>
      </div>

      {/* Body placeholder */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <OuiText color="subdued">
          <p>
            {activeTab
              .replace(/-/g, ' ')
              .replace(/^\w/, (c) => c.toUpperCase())}{' '}
            content
          </p>
        </OuiText>
      </div>
    </div>
  );
};
