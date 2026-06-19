/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext } from 'react';

import {
  OuiOllyChatPill,
  OuiSpacer,
  OuiText,
} from '../../../../src/components';

import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

export default () => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [message, setMessage] = useState(
    'I noticed a latency spike on the checkout service. Want me to investigate?'
  );

  return (
    <div>
      <OuiText size="s">
        <p>
          Default state — collapsed pill with avatar and input. The border
          animation is paused until focused or highlighted.
        </p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiOllyChatPill
        avatar={
          <Mascot
            size={28}
            idle
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        avatarHover={
          <Mascot
            size={28}
            expression="happy"
            idle={false}
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        avatarFocused={
          <Mascot
            size={28}
            expression="blink"
            idle={false}
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        onSubmit={(val) => alert(`Submitted: ${val}`)}
        onActivate={() => alert('Chat activated')}
      />

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <p>
          With a proactive message and quick replies — pill expands, border
          animates, avatar pulses. Dismissing collapses the pill and stops all
          animations.
        </p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiOllyChatPill
        avatar={
          <Mascot
            size={28}
            idle
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        avatarHover={
          <Mascot
            size={28}
            expression="happy"
            idle={false}
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        avatarFocused={
          <Mascot
            size={28}
            expression="blink"
            idle={false}
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        message={message}
        quickReplies={[
          { label: 'Yes, investigate', primary: true },
          { label: 'Show me the data' },
        ]}
        isHighlighted
        onDismiss={() => setMessage(null)}
        onSubmit={(val) => alert(`Submitted: ${val}`)}
        onActivate={(val) => alert(`Activated: ${val || 'no value'}`)}
      />

      <OuiSpacer size="xl" />

      <OuiText size="s">
        <p>
          Custom placeholder with avatar expressions — on focus the mascot
          blinks, on hover it smiles:
        </p>
      </OuiText>
      <OuiSpacer size="m" />
      <OuiOllyChatPill
        avatar={
          <Mascot
            size={28}
            idle
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        avatarHover={
          <Mascot
            size={28}
            expression="happy"
            idle={false}
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        avatarFocused={
          <Mascot
            size={28}
            expression="blink"
            idle={false}
            bob={false}
            follow={false}
            color={mascotColor}
            eyeColor={mascotEyeColor}
          />
        }
        placeholder="Search or ask a question..."
        onSubmit={(val) => alert(`Submitted: ${val}`)}
      />
    </div>
  );
};
