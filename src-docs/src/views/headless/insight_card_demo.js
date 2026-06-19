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
              <span style={{ fontFamily: 'var(--g-font-mono)', fontSize: 12 }}>
                66.67%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>frontend</span>
              <span style={{ fontFamily: 'var(--g-font-mono)', fontSize: 12 }}>
                14.49%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>frontend-proxy</span>
              <span style={{ fontFamily: 'var(--g-font-mono)', fontSize: 12 }}>
                14.29%
              </span>
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
            <p>
              Use for floating or featured moments where the canvas gradient
              should bleed through.
            </p>
          </OuiText>
        </OuiInsightCard>
      </OuiFlexItem>

      <OuiFlexItem grow={1}>
        <OuiInsightCard variant="add" onClick={() => {}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--g-accent, #6366f1)',
                flexShrink: 0,
              }}>
              <OuiIcon type="plus" size="m" color="ghost" />
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--g-ink-bright, #000)',
              }}>
              Open another page
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span className="ouiInsightCard__chip">Dashboard</span>
            <span className="ouiInsightCard__chip">Saved log</span>
            <span className="ouiInsightCard__chip">Trace</span>
            <span className="ouiInsightCard__chip">Alert</span>
          </div>
        </OuiInsightCard>
      </OuiFlexItem>
    </OuiFlexGroup>
  </div>
);
