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
  OuiFlexGroup,
  OuiFlexItem,
  OuiText,
  OuiSpacer,
} from '../../../../src/components';
import { TempVisualizationCard } from '../sample_pages/temp_visualization_card';

export default () => (
  <>
    <OuiText size="s">
      <p>
        The component supports multiple chart types for different visualization
        needs:
      </p>
    </OuiText>
    <OuiSpacer size="m" />
    <OuiFlexGroup gutterSize="m" wrap>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Line Chart"
          description="Trends over time"
          type="line"
          color="#4168B8"
          onClick={() => {}}
        />
      </OuiFlexItem>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Bar Chart"
          description="Categorical comparison"
          type="bar"
          color="#5CB198"
          onClick={() => {}}
        />
      </OuiFlexItem>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Area Chart"
          description="Volume over time"
          type="area"
          color="#7dd3fc"
          onClick={() => {}}
        />
      </OuiFlexItem>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Gauge"
          description="Progress indicator"
          type="gauge"
          color="#CDA849"
          onClick={() => {}}
        />
      </OuiFlexItem>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Pie Chart"
          description="Part of whole"
          type="pie"
          color="#ED6F73"
          onClick={() => {}}
        />
      </OuiFlexItem>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Table"
          description="Tabular data"
          type="table"
          color="#4168B8"
          onClick={() => {}}
        />
      </OuiFlexItem>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Heatmap"
          description="Density visualization"
          type="heatmap"
          color="#ED6F73"
          onClick={() => {}}
        />
      </OuiFlexItem>
      <OuiFlexItem style={{ minWidth: 180, maxWidth: 200 }}>
        <TempVisualizationCard
          title="Histogram"
          description="Distribution"
          type="histogram"
          color="#5CB198"
          onClick={() => {}}
        />
      </OuiFlexItem>
    </OuiFlexGroup>
  </>
);
