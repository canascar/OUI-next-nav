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
  OuiButtonIcon,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
  OuiToolTip,
} from '../../../../src/components';

import { AskAiPopover } from './ask_ai_popover';

export const WorkspacePage = ({ onContinueAsThread }) => {
  const [activeTab, setActiveTab] = useState('workspace-details');
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* Header */}
      <div
        className="workspacePage__header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '20px 16px 20px 12px',
        }}>
        <OuiTitle size="s">
          <h1 style={{ margin: 0, whiteSpace: 'nowrap' }}>Workspace</h1>
        </OuiTitle>
        <div style={{ flexGrow: 1 }} />
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexShrink: 0,
          }}>
          <OuiToolTip content="Refresh" position="bottom">
            <OuiButtonIcon
              iconType="refresh"
              aria-label="Refresh"
              size="s"
              color="text"
            />
          </OuiToolTip>
          <div className="detailPageHeader__ruleDivider" />
          <div className="askAiPopover__anchor">
            <OuiToolTip content="Ask AI" position="bottom">
              <OuiButtonIcon
                iconType="generate"
                aria-label="Ask AI"
                size="s"
                color={isAskAiOpen ? 'primary' : 'text'}
                onClick={() => setIsAskAiOpen(!isAskAiOpen)}
              />
            </OuiToolTip>
            <AskAiPopover
              isOpen={isAskAiOpen}
              onClose={() => setIsAskAiOpen(false)}
              onContinueAsThread={onContinueAsThread}
            />
          </div>
        </div>
      </div>

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
