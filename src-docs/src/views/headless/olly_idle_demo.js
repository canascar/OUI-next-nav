/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import {
  OuiSpacer,
  OuiText,
  OuiFlexGroup,
  OuiFlexItem,
} from '../../../../src/components';

import { OllyIdle } from '../sample_pages/olly_idle';

export default () => {
  return (
    <div>
      <OuiText size="s">
        <p>
          <strong>OllyIdle</strong> is the standard resting state for the Olly
          mascot. It winks on mount, cycles through idle micro-expressions,
          responds to hover (happy), mouseDown (heart + squish), and shows a
          random tooltip.
        </p>
      </OuiText>

      <OuiSpacer size="xl" />

      <OuiText size="xs">
        <strong>Default (20px) — winks on mount, then idle</strong>
      </OuiText>
      <OuiSpacer size="s" />
      <OllyIdle size={20} />

      <OuiSpacer size="xl" />

      <OuiText size="xs">
        <strong>Larger (32px) — hover for happy, click for heart</strong>
      </OuiText>
      <OuiSpacer size="s" />
      <OllyIdle size={32} />

      <OuiSpacer size="xl" />

      <OuiText size="xs">
        <strong>No wink on mount</strong>
      </OuiText>
      <OuiSpacer size="s" />
      <OllyIdle size={24} winkOnMount={false} />

      <OuiSpacer size="xl" />

      <OuiText size="xs">
        <strong>Multiple sizes side-by-side</strong>
      </OuiText>
      <OuiSpacer size="s" />
      <OuiFlexGroup alignItems="center" gutterSize="l">
        <OuiFlexItem grow={false}>
          <OllyIdle size={16} />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OllyIdle size={24} />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OllyIdle size={32} />
        </OuiFlexItem>
        <OuiFlexItem grow={false}>
          <OllyIdle size={48} />
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <strong>Light / Dark mode colors:</strong>
        <ul>
          <li>
            <strong>Light mode:</strong> Body{' '}
            <code>['#14558E', '#153A5A']</code> (navy gradient), Eyes{' '}
            <code>#fff</code>
          </li>
          <li>
            <strong>Dark mode:</strong> Body <code>['#FFFFFF', '#D9DEE5']</code>{' '}
            (white gradient), Eyes <code>#181028</code>
          </li>
          <li>
            Colors are automatically applied via <code>ThemeContext</code> — no
            manual configuration needed
          </li>
          <li>
            Gold body (<code>['#B8860B', '#8B6914']</code>) is reserved for
            "human input needed" state only
          </li>
        </ul>
      </OuiText>

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <strong>Interaction states:</strong>
        <ul>
          <li>
            <strong>Idle:</strong> cycles through micro-expressions
            (blink-heavy)
          </li>
          <li>
            <strong>Hover:</strong> <code>happy</code> expression (^ ^)
          </li>
          <li>
            <strong>mouseDown:</strong> <code>heart</code> expression + squish
            to 80%
          </li>
          <li>
            <strong>mouseUp / mouseLeave:</strong> reverts to idle
          </li>
          <li>
            <strong>Mount:</strong> <code>wink</code> for 600ms, then idle
          </li>
          <li>
            <strong>Tooltip:</strong> random message on hover (long delay)
          </li>
        </ul>
      </OuiText>
    </div>
  );
};
