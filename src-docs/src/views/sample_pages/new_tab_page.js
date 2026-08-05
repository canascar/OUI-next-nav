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

import React, { useState, useMemo } from 'react';
import { OuiFieldSearch, OuiIcon } from '../../../../src/components';
import { OpenSearch3DLogo } from './opensearch_3d_logo';

const HERO_TITLE = 'This canvas is waiting for your visualizations';

/**
 * Every page reachable from a new tab, in three labeled groups. All groups
 * render at once — there is no pre-selection step, so a page is one click away.
 *
 * `pageKey` is the SOURCE_PAGE_MOCK key loaded into the current tab; `label`
 * becomes the tab name and `icon` its tab icon.
 */
const PAGE_GROUPS = [
  {
    key: 'discover',
    label: 'Discover',
    items: [
      {
        key: 'logs',
        label: 'Logs',
        icon: 'navDiscover',
        pageKey: 'discover-log',
      },
      {
        key: 'traces',
        label: 'Traces',
        icon: 'visTagCloud',
        pageKey: 'traces',
      },
      {
        key: 'metrics',
        label: 'Metrics',
        icon: 'visLine',
        pageKey: 'discover-metric',
      },
      {
        key: 'dashboards',
        label: 'Dashboards',
        icon: 'navDashboards',
        pageKey: 'dashboards-list',
      },
    ],
  },
  {
    key: 'monitor',
    label: 'Monitor',
    items: [
      {
        key: 'app-map',
        label: 'Application Map',
        icon: 'navServiceMap',
        pageKey: 'app-map',
      },
      {
        key: 'app-services',
        label: 'Application Services',
        icon: 'navOverview',
        pageKey: 'app-perf-services',
      },
      {
        key: 'app-traces',
        label: 'Application Traces',
        icon: 'visTagCloud',
        pageKey: 'app-traces',
      },
      {
        key: 'forecasting',
        label: 'Forecasting',
        icon: 'visLine',
        pageKey: 'forecasting',
      },
      {
        key: 'agent-traces',
        label: 'Agent traces',
        icon: 'visTagCloud',
        pageKey: 'app-traces',
      },
      {
        key: 'agent-spans',
        label: 'Agent spans',
        icon: 'visTagCloud',
        pageKey: 'agent-spans',
      },
    ],
  },
  {
    key: 'more',
    label: 'More',
    items: [
      {
        key: 'notebook',
        label: 'Notebook',
        icon: 'document',
        pageKey: 'notebooks',
      },
      {
        key: 'alert-rules',
        label: 'Alert rules',
        icon: 'navAlerting',
        pageKey: 'alerts-list',
      },
    ],
  },
];

export const NewTabPage = ({ onSelectPage }) => {
  const [query, setQuery] = useState('');

  // Filtering happens on every keystroke, across all groups at once. A group
  // with no matches drops out entirely — label included.
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return PAGE_GROUPS;
    return PAGE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(needle)
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <div className="newTabPage">
      <div className="newTabPage__hero">
        <div className="newTabPage__logoWrap">
          <OpenSearch3DLogo size={160} />
        </div>
        <h2 className="newTabPage__title">{HERO_TITLE}</h2>
      </div>

      <div className="newTabPage__search">
        <OuiFieldSearch
          placeholder="Search pages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search pages"
          fullWidth
        />
      </div>

      <div className="newTabPage__groups">
        {groups.map((group) => (
          <div className="newTabPage__group" key={group.key}>
            <div className="newTabPage__groupLabel">{group.label}</div>
            <div className="newTabPage__grid">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="newTabPage__card"
                  // One click loads the page and renames this tab.
                  onClick={() => onSelectPage(item.pageKey, item.label)}>
                  <OuiIcon type={item.icon} size="m" />
                  <span className="newTabPage__cardLabel">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="newTabPage__noResults">No pages match “{query}”.</p>
        )}
      </div>
    </div>
  );
};
