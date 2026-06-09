/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import {
  OuiAgenticSpinner,
  OuiIcon,
  OuiSpacer,
  OuiText,
  OuiFlexGroup,
  OuiFlexItem,
} from '../../../../src/components';

import { Mascot } from '../../../../olly-mascot/Mascot';

export default () => {
  return (
    <div>
      <OuiText size="s">
        <p>The session thread uses a specific choreography for AI responses. Here are the individual states:</p>
      </OuiText>

      <OuiSpacer size="xl" />

      {/* State 1: Steps loading */}
      <OuiText size="xs"><strong>1. Steps loading (blob spinner)</strong></OuiText>
      <OuiSpacer size="s" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', border: '1px solid var(--ouiBorderColor, #ececef)', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OuiIcon type="checkInCircleEmpty" size="m" color="success" />
          <OuiText size="xs"><strong>Searching service logs</strong></OuiText>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <OuiAgenticSpinner size="s" />
          <OuiText size="xs"><strong>Analyzing error patterns</strong></OuiText>
        </div>
      </div>

      <OuiSpacer size="xl" />

      {/* State 2: Olly pulsating */}
      <OuiText size="xs"><strong>2. Olly pulsates (2s pause before text)</strong></OuiText>
      <OuiSpacer size="s" />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', border: '1px solid var(--ouiBorderColor, #ececef)', borderRadius: 12 }}>
        <div className="threadPage__responseMascot threadPage__responseMascot--pulsing" style={{ animation: 'threadMascotPopIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both, threadMascotPulse 1s ease-in-out 400ms infinite' }}>
          <Mascot size={20} idle bob={false} follow={false} />
        </div>
        <OuiText size="s" color="subdued"><em>Waiting for response...</em></OuiText>
      </div>

      <OuiSpacer size="xl" />

      {/* State 3: Streaming */}
      <OuiText size="xs"><strong>3. Text streams in next to Olly</strong></OuiText>
      <OuiSpacer size="s" />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', border: '1px solid var(--ouiBorderColor, #ececef)', borderRadius: 12 }}>
        <div>
          <Mascot size={20} idle bob={false} follow={false} />
        </div>
        <OuiText size="s">I looked into this and found a few things worth noting...</OuiText>
      </div>

      <OuiSpacer size="xl" />

      {/* State 4: Done */}
      <OuiText size="xs"><strong>4. Response complete — Olly below text</strong></OuiText>
      <OuiSpacer size="s" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '12px 16px', border: '1px solid var(--ouiBorderColor, #ececef)', borderRadius: 12 }}>
        <OuiText size="s">I looked into this and found a few things worth noting. The service metrics show a gradual increase in P99 latency.</OuiText>
        <OuiSpacer size="xs" />
        <div>
          <Mascot size={20} idle bob={false} follow={false} />
        </div>
      </div>

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <strong>Mascot expressions by state:</strong>
        <ul>
          <li><strong>Pulsating (waiting):</strong> <code>blink</code> — brief beat / acknowledgement</li>
          <li><strong>Streaming text:</strong> <code>dot</code> — attentive / speaking</li>
          <li><strong>Done (repositions below):</strong> <code>wink</code> for 600ms, then idle cycling</li>
          <li><strong>Idle (resting):</strong> micro-expression rotation (blink-heavy)</li>
          <li><strong>User hover:</strong> <code>happy</code> — cheerful</li>
          <li><strong>User mouseDown:</strong> <code>heart</code> + squish</li>
        </ul>
      </OuiText>

      <OuiSpacer size="l" />

      <OuiText size="s">
        <strong>Idle tooltip (hover):</strong> shows a random message from:
        <ul>
          <li>"Ready for your next request."</li>
          <li>"Olly olly oxen free!"</li>
          <li>"What's next for us?"</li>
          <li>"What can I help you with?"</li>
          <li>"Anything else I can do? Let me know!"</li>
        </ul>
      </OuiText>
    </div>
  );
};
