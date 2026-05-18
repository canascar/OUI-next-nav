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
  OuiButton,
  OuiButtonIcon,
  OuiTab,
  OuiTabs,
} from '../../../../src/components';

export const DetailPagePanel = ({
  title,
  items,
  tabs,
  tabItems,
  selectedItem,
  onItemSelect,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].id : null);
  const displayItems = tabs && tabItems ? tabItems[activeTab] || [] : items;

  return (
    <div className="detailPagePanel">
      <div className="detailPagePanel__header">
        <span className="detailPagePanel__headerTitle">
          All{' '}
          {title.toLowerCase().endsWith('s')
            ? title.toLowerCase()
            : `${title.toLowerCase()}s`}
        </span>
        <div className="detailPagePanel__headerActions">
          <OuiButton size="s" iconType="plus" fill>
            Create new
          </OuiButton>
          <OuiButtonIcon
            iconType="cross"
            aria-label="Close panel"
            size="s"
            color="text"
            display="empty"
            onClick={onClose}
          />
        </div>
      </div>
      {tabs && (
        <div className="detailPagePanel__tabs">
          <OuiTabs size="s" display="condensed">
            {tabs.map((tab) => (
              <OuiTab
                key={tab.id}
                isSelected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}>
                {tab.name}
              </OuiTab>
            ))}
          </OuiTabs>
        </div>
      )}
      <div className="detailPagePanel__content">
        {displayItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`detailPagePanel__item${
              selectedItem === item.key ? ' detailPagePanel__item--active' : ''
            }`}
            onClick={() => onItemSelect(item.key)}>
            <span className="detailPagePanel__itemTitle">{item.title}</span>
            {item.subtitle && (
              <span className="detailPagePanel__itemSubtitle">
                {item.subtitle}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
