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
import { OuiIcon, OuiText, OuiTitle } from '../../../../src/components';
import { SOURCE_PAGE_MOCK } from './session_models';

/**
 * Icon mapping for each page key. Uses existing OUI icon assets.
 */
const PAGE_ICONS = {
  logs: 'navDiscover',
  alerts: 'navAlerting',
  'alerts-detail': 'navAlerting',
  dashboards: 'navDashboards',
  notebooks: 'navNotebooks',
  metrics: 'visArea',
  discover: 'navDiscover',
  traces: 'navServices',
};

/**
 * NewTabPage — Displays a grid of available pages for the user to navigate to.
 *
 * When the user selects a page, calls onSelectPage to load it in the current tab.
 *
 * @param {Object} props
 * @param {(pageKey: string, title: string) => void} props.onSelectPage - Callback to load a page in the current tab
 */
export const NewTabPage = ({ onSelectPage }) => {
  return (
    <div className="newTabPage">
      <div className="newTabPage__header">
        <OuiTitle size="s">
          <h2>Open a page</h2>
        </OuiTitle>
        <OuiText size="s" color="subdued">
          <p>Select a page to open in this tab</p>
        </OuiText>
      </div>
      <div className="newTabPage__grid">
        {Object.entries(SOURCE_PAGE_MOCK).map(([pageKey, { title }]) => (
          <button
            key={pageKey}
            className="newTabPage__card"
            onClick={() => onSelectPage(pageKey, title)}
            aria-label={`Open ${title}`}>
            <OuiIcon
              type={PAGE_ICONS[pageKey] || 'document'}
              size="xl"
              className="newTabPage__cardIcon"
            />
            <span className="newTabPage__cardTitle">{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
