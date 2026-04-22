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

import {
  OuiButtonIcon,
  OuiFlexGroup,
  OuiFlexItem,
  OuiTitle,
  OuiText,
  OuiToolTip,
} from '../../../../src/components';

import { AskAiPopover } from './ask_ai_popover';

const ITEM_LABELS = {
  'web-server-fleet': 'Web server fleet',
  'payment-gateway': 'Payment gateway',
  'data-pipeline': 'Data pipeline cluster',
};

export const AssetsPage = ({ selectedItem, onContinueAsThread }) => {
  const [isAskAiOpen, setIsAskAiOpen] = React.useState(false);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <div
        className="assetsPage__header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 16px 20px 12px',
        }}>
        <OuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
          <OuiFlexItem grow={false}>
            <OuiTitle size="s">
              <h1 style={{ margin: 0 }}>
                {ITEM_LABELS[selectedItem] || 'Assets'}
              </h1>
            </OuiTitle>
          </OuiFlexItem>
        </OuiFlexGroup>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <OuiToolTip content="Edit" position="bottom">
            <OuiButtonIcon
              iconType="pencil"
              aria-label="Edit"
              size="s"
              color="text"
            />
          </OuiToolTip>
          <div className="detailPageHeader__ruleDivider" />
          <OuiToolTip content="Share" position="bottom">
            <OuiButtonIcon
              iconType="share"
              aria-label="Share"
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
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <OuiText color="subdued" textAlign="center">
          <p>Detail view will appear here.</p>
        </OuiText>
      </div>
    </div>
  );
};
