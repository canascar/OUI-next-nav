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
  OuiCheckbox,
  OuiIcon,
  OuiPanel,
  OuiRadioGroup,
  OuiSpacer,
  OuiTab,
  OuiTabs,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

import { ALL_DRAGGABLE_ITEMS, FIXED_KEYS } from './nav_layout_utils';

const NAV_FIXED_ITEMS = [
  { key: 'search', label: 'Search', icon: 'search' },
  { key: 'thread', label: 'Thread', icon: 'navTicketing' },
];

const APPEARANCE_OPTIONS = [
  { id: 'icon-text', label: 'Icons & text' },
  { id: 'icon-only', label: 'Icons only' },
];

export const SettingsPage = ({
  mainItems,
  _overflowItems,
  onLayoutChange,
  navAppearance,
  onNavAppearanceChange,
}) => {
  const [activeTab, setActiveTab] = useState('navigation');

  const handleToggleItem = (key) => {
    if (FIXED_KEYS.includes(key)) return;
    const isMain = mainItems.includes(key);
    const allKeys = ALL_DRAGGABLE_ITEMS.map((item) => item.key);
    let newMain;
    let newOverflow;
    if (isMain) {
      const mainSet = new Set(mainItems);
      mainSet.delete(key);
      newMain = allKeys.filter((k) => mainSet.has(k));
      newOverflow = allKeys.filter((k) => !mainSet.has(k));
    } else {
      const mainSet = new Set(mainItems);
      mainSet.add(key);
      newMain = allKeys.filter((k) => mainSet.has(k));
      newOverflow = allKeys.filter((k) => !mainSet.has(k));
    }
    onLayoutChange(newMain, newOverflow);
  };

  const renderNavigationTab = () => (
    <div style={{ maxWidth: 480 }}>
      <OuiPanel paddingSize="l">
        <OuiTitle size="xxs">
          <h3>Show these tabs in the navigation bar:</h3>
        </OuiTitle>

        {/* Fixed items (always checked, disabled) */}
        {NAV_FIXED_ITEMS.map((item) => (
          <div key={item.key} className="settingsPage__navCheckItem">
            <OuiCheckbox
              id={`settings-nav-${item.key}`}
              checked={true}
              disabled={true}
              onChange={() => {}}
              label={
                <span className="settingsPage__navCheckLabel">
                  <OuiIcon type={item.icon} size="m" />
                  {item.label}
                </span>
              }
            />
          </div>
        ))}

        {/* Draggable items */}
        {ALL_DRAGGABLE_ITEMS.map((item) => (
          <div key={item.key} className="settingsPage__navCheckItem">
            <OuiCheckbox
              id={`settings-nav-${item.key}`}
              checked={mainItems.includes(item.key)}
              onChange={() => handleToggleItem(item.key)}
              label={
                <span className="settingsPage__navCheckLabel">
                  <OuiIcon type={item.icon} size="m" />
                  {item.label}
                </span>
              }
            />
          </div>
        ))}
      </OuiPanel>

      <OuiSpacer size="s" />

      <OuiPanel paddingSize="l">
        <OuiTitle size="xxs">
          <h3>Navigation Tab Appearance</h3>
        </OuiTitle>
        <OuiSpacer size="m" />
        <OuiRadioGroup
          options={APPEARANCE_OPTIONS}
          idSelected={navAppearance}
          onChange={(id) => onNavAppearanceChange(id)}
          className="settingsPage__appearanceRadio"
        />
      </OuiPanel>
    </div>
  );

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
          <h1 style={{ margin: 0, whiteSpace: 'nowrap' }}>Settings</h1>
        </OuiTitle>
      </div>

      {/* Tab bar */}
      <div className="workspacePage__tabBar">
        <OuiTabs size="s" display="condensed">
          <OuiTab
            isSelected={activeTab === 'general'}
            onClick={() => setActiveTab('general')}>
            General
          </OuiTab>
          <OuiTab
            isSelected={activeTab === 'navigation'}
            onClick={() => setActiveTab('navigation')}>
            Navigation
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
        {activeTab === 'navigation' ? (
          renderNavigationTab()
        ) : (
          <OuiText color="subdued">
            <p>{activeTab.replace(/^\w/, (c) => c.toUpperCase())} content</p>
          </OuiText>
        )}
      </div>
    </div>
  );
};
