/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import {
  OuiInsightCard,
  OuiFlexGroup,
  OuiFlexItem,
  OuiText,
  OuiSpacer,
  OuiIcon,
  OuiBadge,
} from '../../../../src/components';

export default () => (
  <div>
    <OuiFlexGroup gutterSize="m" wrap>
      <OuiFlexItem style={{ minWidth: 280 }}>
        <OuiInsightCard title="Top services by fault rate">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>checkout</span>
              <span style={{ fontFamily: 'var(--g-font-mono)', fontSize: 12 }}>66.67%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>frontend</span>
              <span style={{ fontFamily: 'var(--g-font-mono)', fontSize: 12 }}>14.49%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>frontend-proxy</span>
              <span style={{ fontFamily: 'var(--g-font-mono)', fontSize: 12 }}>14.29%</span>
            </div>
          </div>
        </OuiInsightCard>
      </OuiFlexItem>

      <OuiFlexItem style={{ minWidth: 280 }}>
        <OuiInsightCard
          title="Connection timeout errors"
          titleExtra={<OuiBadge color="danger">847</OuiBadge>}
          isClickable>
          <OuiText size="xs" color="subdued">
            <code>source=logs | where severity=&quot;ERROR&quot;</code>
          </OuiText>
        </OuiInsightCard>
      </OuiFlexItem>

      <OuiFlexItem style={{ minWidth: 280 }}>
        <OuiInsightCard title="Recent alerts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>P99 latency breach</span>
              <OuiBadge color="danger">Critical</OuiBadge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Disk usage warning</span>
              <OuiBadge color="warning">Warning</OuiBadge>
            </div>
          </div>
        </OuiInsightCard>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="l" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem grow={1}>
        <OuiInsightCard variant="glass" title="Frosted glass variant">
          <OuiText size="s" color="subdued">
            <p>Use for floating or featured moments where the canvas gradient should bleed through.</p>
          </OuiText>
        </OuiInsightCard>
      </OuiFlexItem>

      <OuiFlexItem grow={1}>
        <OuiInsightCard variant="add" onClick={() => {}}>
          <OuiIcon type="plus" size="l" color="primary" />
          <OuiSpacer size="xs" />
          <OuiText size="xs" color="subdued">
            <span style={{ fontFamily: 'var(--g-font-mono)', textTransform: 'uppercase', letterSpacing: '1.1px', fontSize: 10.5 }}>
              Open a page
            </span>
          </OuiText>
        </OuiInsightCard>
      </OuiFlexItem>
    </OuiFlexGroup>
  </div>
);
