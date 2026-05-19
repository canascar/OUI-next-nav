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
import { OuiFlexGroup, OuiFlexItem } from '../../../../src/components';
import { TempVisualizationCard } from '../sample_pages/temp_visualization_card';

export default () => (
  <OuiFlexGroup gutterSize="l" wrap>
    <OuiFlexItem style={{ minWidth: 200, maxWidth: 250 }}>
      <TempVisualizationCard
        title="Error Rate Over Time"
        description="Error rate across all services in the last 24h"
        type="line"
        color="#ED6F73"
        onClick={() => {}}
      />
    </OuiFlexItem>
    <OuiFlexItem style={{ minWidth: 200, maxWidth: 250 }}>
      <TempVisualizationCard
        title="P99 Latency by Service"
        description="Tail latency distribution across services"
        type="bar"
        color="#7dd3fc"
        onClick={() => {}}
      />
    </OuiFlexItem>
    <OuiFlexItem style={{ minWidth: 200, maxWidth: 250 }}>
      <TempVisualizationCard
        title="Throughput Overview"
        description="Requests per second across the stack"
        type="area"
        color="#5CB198"
        onClick={() => {}}
      />
    </OuiFlexItem>
    <OuiFlexItem style={{ minWidth: 200, maxWidth: 250 }}>
      <TempVisualizationCard
        title="Connection Pool"
        description="Active connections vs. pool capacity"
        type="gauge"
        color="#CDA849"
        onClick={() => {}}
      />
    </OuiFlexItem>
  </OuiFlexGroup>
);
