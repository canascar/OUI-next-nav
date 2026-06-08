/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import { GuidePage } from '../../components';
import {
  OuiText,
  OuiSpacer,
  OuiTitle,
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
  OuiCode,
} from '../../../../src/components';
import { Mascot as MascotSVG } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

const expressions = [
  {
    name: 'COMMA',
    states: 'Rest / Idle / Streaming',
    description: 'The default resting state. Eyes relaxed, body neutral.',
  },
  {
    name: 'BLINK',
    states: 'Ack / Listening',
    description: 'A brief close-and-open. Signals the mascot heard you.',
  },
  {
    name: 'DOT',
    states: 'Alert / Thinking / Tool call',
    description: 'Focused dot pupils. The mascot is processing.',
  },
  {
    name: 'SQUINT',
    states: 'Scan / Searching / Reading',
    description: 'Narrowed eyes. The mascot is reading or scanning content.',
  },
  {
    name: 'HAPPY',
    states: 'Success / Found / Resolved',
    description: 'Upturned eyes. Something went well.',
  },
  {
    name: 'WOW',
    states: 'Attention / Asking / Needs input',
    description: 'Wide eyes, body shifts gold. The mascot needs you.',
  },
  {
    name: 'WINK',
    states: 'Closed / Done / Delivered',
    description: 'One eye shut. Task complete, signing off.',
  },
  {
    name: 'HEART',
    states: 'Love / Pinned / Saved',
    description: 'Heart-shaped eyes. Something was saved or favorited.',
  },
  {
    name: 'XX',
    states: 'Failed / Error / Cancelled',
    description: 'Crossed-out eyes. Something went wrong.',
  },
];

const lifecyclePhases = [
  {
    phase: 'Listening',
    expression: 'BLINK',
    scale: '36px',
    description:
      "The user is still typing. The mascot is a small avatar inside the composer's status line, blinking at a natural rhythm. It does NOT spin or grow — presence, not pressure.",
    whyNotes: [
      'Eye = blink — natural cadence, never a spinner',
      'Soft bob is ON (4.2s breath cycle)',
      'Small (36px) — sits in the chrome, not the message',
    ],
    avoid:
      'Growing, smiling, or going to dot here. Save attentiveness for thinking.',
  },
  {
    phase: 'Planning',
    expression: 'DOT',
    scale: '56px',
    description:
      'Before any tools fire, the agent is sketching a plan. Mascot sits in the message gutter at focus size; the dot eye signals sharp attention. The plan itself streams in next to it.',
    whyNotes: [
      'Eye = dot — sharp, alert, narrowed focus',
      'Bigger (56px) than listening — focal point of the message',
      'Sits LEFT of the plan, gutter-aligned',
      'Stays in this state until the first tool fires; then shrinks + becomes squint',
    ],
    keyIdea: 'The plan is the message. The mascot is the byline.',
  },
  {
    phase: 'Working',
    expression: 'SQUINT / DOT',
    scale: '16px',
    description:
      'The agent fires tools one at a time. Only the active step has the mascot — past steps get a checkmark. The eye shape tracks the kind of work: squint for search/read, dot for code/tool execution.',
    whyNotes: [
      'Scaled DOWN to 16px — matches the step checkbox',
      'squint for retrieval / scanning kinds of work',
      'dot when an active tool (code, terminal, write) is running',
      'Eye flickers between the two as tools chain inside one step',
    ],
    avoid: 'Stacking multiple mascots. One active mascot at a time.',
  },
  {
    phase: 'Interrupt',
    expression: 'WOW + gold body',
    scale: '52px',
    description:
      "The agent needs to come back with a question. This is the ONE moment the BODY changes color — navy shifts to gold. The eye opens wide (wow). It's the loudest signal in the system.",
    whyNotes: [
      'Body goes gold — the ONLY color change in the system',
      'Eye opens to wow (O O) — wide, attentive',
      'Scales UP to 52px and inhabits a stripe-gold card',
    ],
    keyIdea:
      'If the user walks away, the eye drifts to dot after ~30s (blocked → patient waiting). A nudge, not a tantrum.',
  },
  {
    phase: 'Delivered',
    expression: 'HAPPY → WINK',
    scale: '22px',
    description:
      'One beat of happy (^ ^, 280ms ease-out) on the "found" moment, then resolves to wink for the byline. The mascot does not stay happy — that would feel needy.',
    whyNotes: [
      'Scale drops to 22px — the answer is the hero',
      'Mascot sits in the byline beside step count + timing',
      'Wink reads as "satisfied", not "look at me"',
      'If user thumbs-up, eye briefly becomes heart (1.2s) before settling',
    ],
    keyIdea:
      "Edge case — couldn't find: mascot resolves to blocked (gold dot), not error. xx is reserved for tool failures.",
  },
];

const scaleLadder = [
  { size: '18px', context: 'Step pip', description: 'Tiny indicator in a step sequence' },
  { size: '28px', context: 'Status', description: 'Inline status badge' },
  { size: '44px', context: 'Inline', description: 'Within a message or card' },
  { size: '68px', context: 'Focus', description: 'Primary attention point' },
  { size: '96px', context: 'Presence', description: 'Full presence, e.g. empty state' },
];

const microMoments = [
  {
    title: 'One beat of happy, never two',
    expression: 'happy',
    description:
      "On 'found', the eye flips to ^ ^ for 280ms with a subtle 4px hop, then resolves to wink. Repeating it more than once turns it into a tic. Once is satisfying; twice is annoying.",
  },
  {
    title: 'Gold body, never gold eye',
    expression: 'wow',
    gold: true,
    description:
      'The ONLY moment the body color changes is when a human is needed. After ~30s without response, the wow eye softens to dot — patient waiting. The gold body stays.',
  },
  {
    title: 'xx flashes, then returns to comma',
    expression: 'xx',
    description:
      "X-eyes show for ~600ms after a tool failure, then settle back. The error itself lives in the message text — the mascot doesn't keep wearing it. The agent recovers.",
  },
  {
    title: 'Eyes follow data, not the cursor',
    expression: 'squint',
    description:
      "During work, idle cursor-following is OFF. Eyes belong to the agent's attention, not the user's. Cursor-following turns back on only at idle, and only on the empty state.",
  },
  {
    title: 'Idle blinks, never sleeps',
    expression: 'comma',
    idle: true,
    description:
      'At rest the mascot cycles micro-expressions: blink (40%), then dot/squint/happy/wow/wink. No xx in idle — sleeping AI is a lie. Cycle pauses while any tool runs.',
  },
  {
    title: 'Heart eye is earned',
    expression: 'heart',
    description:
      "Reserved for when the USER acts — thumbs-up, pin-to-runbook, share. The agent never wears heart on its own. It's the user's affordance, not the agent's emotion.",
  },
];

const principles = [
  { rule: 'One mascot per message', detail: 'Never show multiple mascots in the same context.' },
  { rule: 'Body is invariant', detail: 'Only the eyes change. The body shape stays constant.' },
  { rule: 'Scale signals urgency', detail: 'Bigger means more important. Smaller means background.' },
  { rule: 'State follows the current tool', detail: 'The expression maps to what the agent is doing right now.' },
  { rule: "Don't wear the result", detail: "The mascot reacts, then returns to neutral. It doesn't stay happy forever." },
  { rule: 'Gold means human-needed', detail: 'The only time the body color changes is when the agent needs your input.' },
];

export const MascotGuidelinesView = () => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';
  const goldColor = ['#B8860B', '#8B6914'];

  return (
    <GuidePage title="Agentic Mascot Guidelines">
      {/* Page intro */}
      <OuiText>
        <p>
          The OpenSearch mascot is a single circular character with comma-shaped
          eyes. It communicates agent state through nine eye expressions and a
          scale ladder from 18px to 96px. The body never morphs — only the eyes
          change. Color shifts to gold only when the agent needs human input.
        </p>
      </OuiText>

      <OuiSpacer size="xxl" />
      <OuiSpacer size="l" />

      {/* Section A — Vocabulary */}
      <OuiTitle>
        <h2>A · Vocabulary</h2>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiText>
        <p>One body, nine expressions — the alphabet the mascot uses.</p>
      </OuiText>
      <OuiSpacer size="l" />

      <OuiFlexGroup wrap gutterSize="m">
        {expressions.map((expr) => (
          <OuiFlexItem key={expr.name} style={{ minWidth: 180, maxWidth: 220 }}>
            <OuiPanel paddingSize="m" style={{ textAlign: 'center' }}>
              <MascotSVG
                size={56}
                expression={expr.name.toLowerCase()}
                color={expr.name === 'WOW' ? goldColor : mascotColor}
                eyeColor={expr.name === 'WOW' ? '#fff' : mascotEyeColor}
                idle={false}
                follow={false}
                bob={false}
              />
              <OuiSpacer size="s" />
              <OuiTitle size="xxs">
                <h4>{expr.name}</h4>
              </OuiTitle>
              <OuiSpacer size="xs" />
              <OuiText size="xs" color="subdued">
                <p><strong>{expr.states}</strong></p>
              </OuiText>
              <OuiSpacer size="xs" />
              <OuiText size="xs">
                <p>{expr.description}</p>
              </OuiText>
            </OuiPanel>
          </OuiFlexItem>
        ))}
      </OuiFlexGroup>

      <OuiSpacer size="xxl" />
      <OuiSpacer size="l" />

      {/* Section B — Lifecycle */}
      <OuiTitle>
        <h2>B · Lifecycle</h2>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiText>
        <p>What the mascot does at each phase of an agent run.</p>
      </OuiText>
      <OuiSpacer size="l" />

      {lifecyclePhases.map((phase, idx) => (
        <div key={phase.phase}>
          <OuiPanel paddingSize="l">
            <OuiText size="xs" color="subdued">
              <p>B · LIFECYCLE · {idx + 1} OF 5</p>
            </OuiText>
            <OuiSpacer size="s" />
            <OuiTitle size="s">
              <h3>
                {phase.phase} — {phase.expression.toLowerCase()} ({phase.scale})
              </h3>
            </OuiTitle>
            <OuiSpacer size="m" />
            <OuiText size="s">
              <p>{phase.description}</p>
            </OuiText>
            {phase.whyNotes && (
              <>
                <OuiSpacer size="m" />
                <OuiTitle size="xxs">
                  <h5>Why this state</h5>
                </OuiTitle>
                <OuiSpacer size="xs" />
                <OuiText size="s">
                  <ul>
                    {phase.whyNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </OuiText>
              </>
            )}
            {phase.avoid && (
              <>
                <OuiSpacer size="s" />
                <OuiText size="s" color="danger">
                  <p>
                    <strong>Avoid:</strong> {phase.avoid}
                  </p>
                </OuiText>
              </>
            )}
            {phase.keyIdea && (
              <>
                <OuiSpacer size="s" />
                <OuiText size="s" color="subdued">
                  <p>
                    <em>{phase.keyIdea}</em>
                  </p>
                </OuiText>
              </>
            )}
          </OuiPanel>
          <OuiSpacer size="l" />
        </div>
      ))}

      <OuiSpacer size="xxl" />
      <OuiSpacer size="l" />

      {/* Section C — Placement & Scale */}
      <OuiTitle>
        <h2>C · Placement &amp; Scale</h2>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiText>
        <p>Where the mascot lives, and how big.</p>
      </OuiText>
      <OuiSpacer size="l" />
      <OuiText size="s">
        <p>
          <strong>Rule:</strong> mascot scale ∝ how much the agent wants you to
          look.
        </p>
      </OuiText>
      <OuiSpacer size="m" />

      {scaleLadder.map((step) => (
        <div key={step.size}>
          <OuiPanel paddingSize="s">
            <OuiFlexGroup alignItems="center" gutterSize="m">
              <OuiFlexItem
                grow={false}
                style={{
                  minWidth: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <MascotSVG size={parseInt(step.size)} expression="comma" color={mascotColor} eyeColor={mascotEyeColor} />
              </OuiFlexItem>
              <OuiFlexItem grow={false} style={{ minWidth: 60 }}>
                <OuiCode>{step.size}</OuiCode>
              </OuiFlexItem>
              <OuiFlexItem grow={false} style={{ minWidth: 100 }}>
                <OuiText size="s">
                  <strong>{step.context}</strong>
                </OuiText>
              </OuiFlexItem>
              <OuiFlexItem>
                <OuiText size="s">
                  <p>{step.description}</p>
                </OuiText>
              </OuiFlexItem>
            </OuiFlexGroup>
          </OuiPanel>
          <OuiSpacer size="xs" />
        </div>
      ))}

      <OuiSpacer size="xxl" />
      <OuiSpacer size="l" />

      {/* Section D — Micro-moments */}
      <OuiTitle>
        <h2>D · Micro-moments</h2>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiText>
        <p>Small opinions on the in-betweens.</p>
      </OuiText>
      <OuiSpacer size="l" />

      <OuiFlexGroup wrap gutterSize="m">
        {microMoments.map((moment, index) => (
          <OuiFlexItem key={index} style={{ minWidth: 280, maxWidth: 340 }}>
            <OuiPanel paddingSize="m" style={{ height: '100%' }}>
              <div style={{ marginBottom: 12 }}>
                <MascotSVG
                  size={40}
                  expression={moment.expression}
                  color={moment.gold ? goldColor : mascotColor}
                  eyeColor={moment.gold ? '#fff' : mascotEyeColor}
                  idle={moment.idle || false}
                  follow={false}
                  bob={false}
                />
              </div>
              <OuiTitle size="xxs">
                <h4>{moment.title}</h4>
              </OuiTitle>
              <OuiSpacer size="xs" />
              <OuiText size="xs" color="subdued">
                <p>{moment.description}</p>
              </OuiText>
            </OuiPanel>
          </OuiFlexItem>
        ))}
      </OuiFlexGroup>

      <OuiSpacer size="xxl" />
      <OuiSpacer size="l" />

      {/* Principles */}
      <OuiTitle>
        <h2>Principles</h2>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiText>
        <p>Six rules the mascot follows.</p>
      </OuiText>
      <OuiSpacer size="l" />

      {principles.map((p, index) => (
        <div key={index}>
          <OuiPanel paddingSize="m">
            <OuiFlexGroup alignItems="baseline" gutterSize="m">
              <OuiFlexItem grow={false} style={{ minWidth: 30 }}>
                <OuiText size="s">
                  <strong>{index + 1}.</strong>
                </OuiText>
              </OuiFlexItem>
              <OuiFlexItem grow={false} style={{ minWidth: 220 }}>
                <OuiText size="s">
                  <strong>{p.rule}</strong>
                </OuiText>
              </OuiFlexItem>
              <OuiFlexItem>
                <OuiText size="s">
                  <p>{p.detail}</p>
                </OuiText>
              </OuiFlexItem>
            </OuiFlexGroup>
          </OuiPanel>
          <OuiSpacer size="s" />
        </div>
      ))}
    </GuidePage>
  );
};

export default MascotGuidelinesView;
