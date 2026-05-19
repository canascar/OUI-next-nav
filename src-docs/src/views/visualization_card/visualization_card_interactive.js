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
import { OuiFlexGroup, OuiFlexItem, OuiText, OuiSpacer } from '../../../../src/components';
import { TempVisualizationCard } from '../sample_pages/temp_visualization_card';

export default () => {
  const [selected, setSelected] = useState(null);

  const cards = [
    { id: 'errors', title: 'Error Rate', type: 'line', color: '#ED6F73', description: 'Click to select' },
    { id: 'latency', title: 'Latency', type: 'bar', color: '#7dd3fc', description: 'Click to select' },
    { id: 'throughput', title: 'Throughput', type: 'area', color: '#5CB198', description: 'Click to select' },
  ];

  return (
    <>
      <OuiText size="s">
        <p>
          <strong>Selected:</strong> {selected || 'None'} — Click a card to select it. 
          Notice the scale animation on hover and the bouncy effect on click.
        </p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiFlexGroup gutterSize="l">
        {cards.map((card) => (
          <OuiFlexItem key={card.id} style={{ minWidth: 200, maxWidth: 250 }}>
            <TempVisualizationCard
              title={card.title}
              description={card.description}
              type={card.type}
              color={card.color}
              onClick={() => setSelected(card.title)}
              style={{
                outline: selected === card.title ? '2px solid #4168B8' : 'none',
                outlineOffset: 2,
              }}
            />
          </OuiFlexItem>
        ))}
      </OuiFlexGroup>
    </>
  );
};
