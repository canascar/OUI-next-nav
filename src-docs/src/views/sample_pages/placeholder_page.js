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
  OuiText,
} from '../../../../src/components';

import { DetailPageHeader } from './detail_page_header';

/**
 * Reusable placeholder page with list view (when no item selected) and detail view.
 *
 * @param {string} title - Page title
 * @param {string} bodyText - Placeholder body text for detail view
 * @param {Array} items - List items: [{ key, label, subtitle? }]. If provided and selectedItem is null, shows list.
 * @param {string} selectedItem - Currently selected item key
 * @param {function} onItemSelect - Called when a list item is clicked
 * @param {function} onContinueAsThread - Thread continuation callback
 */
export const PlaceholderPage = ({
  title,
  bodyText,
  headerClassName,
  items,
  selectedItem,
  onItemSelect,
  onContinueAsThread,
  isPanelOpen,
  onTogglePanel,
}) => {
  // Always show detail view — the left panel handles the list
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <DetailPageHeader title={title} onContinueAsThread={onContinueAsThread} isPanelOpen={isPanelOpen} onTogglePanel={onTogglePanel} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <OuiText color="subdued" textAlign="center"><p>{bodyText}</p></OuiText>
      </div>
    </div>
  );
};
