/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

import {
  OuiOllyChatPill,
  OuiSpacer,
  OuiText,
} from '../../../../src/components';

import { Mascot } from '../../../../olly-mascot/Mascot';

export default () => {
  const [message, setMessage] = useState(
    'I noticed a latency spike on the checkout service. Want me to investigate?'
  );

  return (
    <div>
      <OuiText size="s">
        <p>Default state — collapsed pill with avatar and input:</p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiOllyChatPill
        avatar={<Mascot size={28} idle bob={false} follow={false} />}
        onSubmit={(val) => alert(`Submitted: ${val}`)}
        onActivate={() => alert('Chat activated')}
      />

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <p>With a proactive message — pill expands to show the insight:</p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiOllyChatPill
        avatar={<Mascot size={28} idle bob={false} follow={false} />}
        message={message}
        isHighlighted
        onDismiss={() => setMessage(null)}
        onSubmit={(val) => alert(`Submitted: ${val}`)}
        onActivate={() => alert('Chat activated')}
      />

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <p>Custom placeholder:</p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiOllyChatPill
        avatar={<Mascot size={28} idle bob={false} follow={false} />}
        placeholder="Search or ask a question..."
        onSubmit={(val) => alert(`Submitted: ${val}`)}
      />
    </div>
  );
};
