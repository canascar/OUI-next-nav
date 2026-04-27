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
import { OuiButtonEmpty } from '../../../../src/components';

export const DetailPagePanel = ({ title, items, selectedItem, onItemSelect, onClose }) => (
  <div className="detailPagePanel">
    <div className="detailPagePanel__header">
      <span>{title}</span>
      <OuiButtonEmpty size="xs" iconType="plus" onClick={() => {}}>Add new</OuiButtonEmpty>
    </div>
    <div className="detailPagePanel__content">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`detailPagePanel__item${selectedItem === item.key ? ' detailPagePanel__item--active' : ''}`}
          onClick={() => onItemSelect(item.key)}>
          <span className="detailPagePanel__itemTitle">{item.title}</span>
          {item.subtitle && <span className="detailPagePanel__itemSubtitle">{item.subtitle}</span>}
        </button>
      ))}
    </div>
  </div>
);
