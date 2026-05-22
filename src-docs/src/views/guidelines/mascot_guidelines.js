/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GuidePage } from '../../components';
import {
  OuiText,
  OuiSpacer,
  OuiTitle,
  OuiFlexGroup,
  OuiFlexItem,
  OuiPanel,
  OuiCode,
  OuiIcon,
} from '../../../../src/components';
import { Mascot as MascotSVG } from '../../../../olly-mascot/Mascot';

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
    description: 'The user is still typing. The mascot is a small avatar inside the composer\'s status line, blinking at a natural rhythm. It does NOT spin or grow — presence, not pressure.',
    example: null,
    richListening: true,
    whyNotes: [
      'Eye = blink — natural cadence, never a spinner',
      'Soft bob is ON (4.2s breath cycle)',
      'Small (36px) — sits in the chrome, not the message',
    ],
    avoid: 'Growing, smiling, or going to dot here. Save attentiveness for thinking.',
  },
  {
    phase: 'Planning',
    expression: 'DOT',
    scale: '56px',
    description: 'Before any tools fire, the agent is sketching a plan. Mascot sits in the message gutter at focus size; the dot eye signals sharp attention. The plan itself streams in next to it.',
    example: null,
    richPlanning: true,
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
    description: 'The agent fires tools one at a time. Only the active step has the mascot — past steps get a checkmark. The eye shape tracks the kind of work: squint for search/read, dot for code/tool execution.',
    example: null,
    richExample: true,
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
    description: 'The agent needs to come back with a question. This is the ONE moment the BODY changes color — navy shifts to gold. The eye opens wide (wow). It\'s the loudest signal in the system.',
    example: null,
    richInterrupt: true,
    whyNotes: [
      'Body goes gold — the ONLY color change in the system',
      'Eye opens to wow (O O) — wide, attentive',
      'Scales UP to 52px and inhabits a stripe-gold card',
    ],
    keyIdea: 'If the user walks away, the eye drifts to dot after ~30s (blocked → patient waiting). A nudge, not a tantrum.',
  },
  {
    phase: 'Delivered',
    expression: 'HAPPY → WINK',
    scale: '22px',
    description: 'One beat of happy (^ ^, 280ms ease-out) on the "found" moment, then resolves to wink for the byline. The mascot does not stay happy — that would feel needy.',
    example: null,
    richDelivered: true,
    whyNotes: [
      'Scale drops to 22px — the answer is the hero',
      'Mascot sits in the byline beside step count + timing',
      'Wink reads as "satisfied", not "look at me"',
      'If user thumbs-up, eye briefly becomes heart (1.2s) before settling',
    ],
    keyIdea: 'Edge case — couldn\'t find: mascot resolves to blocked (gold dot), not error. xx is reserved for tool failures.',
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
    description: 'On \'found\', the eye flips to ^ ^ for 280ms with a subtle 4px hop, then resolves to wink. Repeating it more than once turns it into a tic. Once is satisfying; twice is annoying.',
  },
  {
    title: 'Gold body, never gold eye',
    expression: 'wow',
    gold: true,
    description: 'The ONLY moment the body color changes is when a human is needed. After ~30s without response, the wow eye softens to dot — patient waiting. The gold body stays.',
  },
  {
    title: 'xx flashes, then returns to comma',
    expression: 'xx',
    description: 'X-eyes show for ~600ms after a tool failure, then settle back. The error itself lives in the message text — the mascot doesn\'t keep wearing it. The agent recovers.',
  },
  {
    title: 'Eyes follow data, not the cursor',
    expression: 'squint',
    description: 'During work, idle cursor-following is OFF. Eyes belong to the agent\'s attention, not the user\'s. Cursor-following turns back on only at idle, and only on the empty state.',
  },
  {
    title: 'Idle blinks, never sleeps',
    expression: 'comma',
    idle: true,
    description: 'At rest the mascot cycles micro-expressions: blink (40%), dot, squint, happy, wow, wink. No xx in idle — sleeping AI is a lie. Cycle pauses while any tool runs.',
  },
  {
    title: 'Heart eye is earned',
    expression: 'heart',
    description: 'Reserved for when the USER acts — thumbs-up, pin-to-runbook, share. The agent never wears heart on its own. It\'s the user\'s affordance, not the agent\'s emotion.',
  },
];

const principles = [
  { rule: 'One mascot per message', detail: 'Never show multiple mascots in the same context.' },
  { rule: 'Body is invariant', detail: 'Only the eyes change. The body shape stays constant.' },
  { rule: 'Scale signals urgency', detail: 'Bigger means more important. Smaller means background.' },
  { rule: 'State follows the current tool', detail: 'The expression maps to what the agent is doing right now.' },
  { rule: "Don't wear the result", detail: 'The mascot reacts, then returns to neutral. It doesn\'t stay happy forever.' },
  { rule: 'Gold means human-needed', detail: 'The only time the body color changes is when the agent needs your input.' },
];

export const MascotGuidelinesView = () => {
  return (
    <GuidePage title="Agentic Mascot Guidelines">
      {/* Page intro */}
      <OuiText>
        <p>
          The OpenSearch mascot is a single circular character with comma-shaped eyes.
          It communicates agent state through nine eye expressions and a scale ladder from 18px to 96px.
          The body never morphs — only the eyes change. Color shifts to gold only when the agent needs human input.
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
              <MascotSVG size={56} expression={expr.name.toLowerCase()} color={expr.name === 'WOW' ? ['#B8860B', '#8B6914'] : undefined} idle={false} follow={false} bob={false} />
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
              <h3>{phase.phase} — {phase.expression.toLowerCase()} ({phase.scale})</h3>
            </OuiTitle>
            <OuiSpacer size="m" />
            <OuiText size="s">
              <p>{phase.description}</p>
            </OuiText>

            {phase.example && (
              <>
                <OuiSpacer size="m" />
                <OuiPanel color="subdued" paddingSize="m">
                  <OuiFlexGroup gutterSize="m" alignItems="center">
                    <OuiFlexItem grow={false}>
                      <MascotSVG
                        size={parseInt(phase.scale)}
                        expression={phase.expression.split(' ')[0].toLowerCase().replace('/', '')}
                        color={phase.expression.includes('gold') ? ['#B8860B', '#8B6914'] : undefined} idle={false} follow={false} bob={false}
                      />
                    </OuiFlexItem>
                    <OuiFlexItem>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {phase.example}
                        {phase.exampleMeta && (
                          <div style={{ marginTop: 8, opacity: 0.6 }}>{phase.exampleMeta}</div>
                        )}
                      </div>
                    </OuiFlexItem>
                  </OuiFlexGroup>
                </OuiPanel>
              </>
            )}

            {phase.richExample && (
              <>
                <OuiSpacer size="m" />
                <OuiPanel paddingSize="l" style={{ borderRadius: 12 }}>
                  {/* Step 1 — completed */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2E4A8F', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ouiTitleColor, #0E1525)' }}>Querying connection metrics</div>
                      <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #5A6D8A)', marginTop: 2 }}>Fetching pool utilization and acquire wait times</div>
                    </div>
                  </div>
                  {/* Step 2 — completed */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2E4A8F', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ouiTitleColor, #0E1525)' }}>Reading deployment log</div>
                      <div style={{ fontSize: 12, color: 'var(--ouiColorMediumShade, #5A6D8A)', marginTop: 2 }}>Last 4 hours, checkout-svc namespace</div>
                    </div>
                  </div>
                  {/* Step 3 — active with mascot */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      <MascotSVG size={24} expression="squint" idle={false} follow={false} bob={false} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ouiTitleColor, #0E1525)' }}>Searching trace index</div>
                      <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: 'var(--ouiColorMediumShade, #5A6D8A)', marginTop: 2 }}>service.name:checkout-svc · last 6h</div>
                    </div>
                  </div>
                  {/* Loading bars */}
                  <div style={{ marginLeft: 36, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--ouiColorLightestShade, #E4EAF2)', width: '80%' }} />
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--ouiColorLightestShade, #E4EAF2)', width: '60%' }} />
                  </div>
                </OuiPanel>
              </>
            )}

            {phase.richListening && (
              <>
                <OuiSpacer size="m" />
                <OuiPanel paddingSize="l" style={{ borderRadius: 12 }}>
                  {/* User message — right aligned */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                    <div style={{ background: 'var(--ouiColorLightestShade, #E4EAF2)', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 500, color: 'var(--ouiTitleColor, #0E1525)' }}>
                      why is checkout p99 spiking?
                    </div>
                  </div>
                  {/* Mascot listening */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MascotSVG size={36} expression="blink" idle={true} follow={false} bob={true} />
                    <span style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #5A6D8A)' }}>Operator is listening…</span>
                  </div>
                </OuiPanel>
              </>
            )}

            {phase.richPlanning && (
              <>
                <OuiSpacer size="m" />
                <OuiPanel paddingSize="l" style={{ borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      <MascotSVG size={56} expression="dot" idle={false} follow={false} bob={false} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--ouiColorPrimary, #2E4A8F)', marginBottom: 8 }}>Planning 4 steps</div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ouiTitleColor, #0E1525)', lineHeight: 2 }}>
                        1. Pull checkout p99 series (last 6h)<br />
                        2. Check recent deploys + config changes<br />
                        <span style={{ opacity: 0.5 }}>3. Cross-check downstream dependencies</span><br />
                        <span style={{ opacity: 0.5 }}>4. Summarise + recommend next action</span>
                      </div>
                    </div>
                  </div>
                </OuiPanel>
              </>
            )}

            {phase.richInterrupt && (
              <>
                <OuiSpacer size="m" />
                <OuiPanel paddingSize="l" style={{ borderRadius: 12 }}>
                  {/* Completed step above */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2E4A8F', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ouiTitleColor, #0E1525)' }}>Reading trace index</div>
                      <div style={{ fontSize: 12, color: 'var(--ouiColorSuccess, #5CB198)', marginTop: 2 }}>Found 2 candidate dependencies</div>
                    </div>
                  </div>
                  {/* Gold interrupt card */}
                  <div style={{ border: '1px solid #CDA849', borderRadius: 10, background: 'rgba(205, 168, 73, 0.06)', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{ flexShrink: 0, marginTop: 2 }}>
                        <MascotSVG size={52} expression="wow" color={['#B8860B', '#8B6914']} idle={false} follow={false} bob={false} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ouiTitleColor, #0E1525)', marginBottom: 4 }}>Two services look related — which should I dig into first?</div>
                        <div style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #5A6D8A)', marginBottom: 14 }}>Both showed elevated tail latency in the same window.</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <span style={{ padding: '6px 16px', borderRadius: 999, border: '1px solid var(--ouiBorderColor, #D4DCE8)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>payment-svc</span>
                          <span style={{ padding: '6px 16px', borderRadius: 999, border: '1px solid var(--ouiBorderColor, #D4DCE8)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>auth-svc</span>
                          <span style={{ padding: '6px 16px', borderRadius: 999, border: '1px solid var(--ouiBorderColor, #D4DCE8)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>both</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </OuiPanel>
              </>
            )}

            {phase.richDelivered && (
              <>
                <OuiSpacer size="m" />
                <OuiPanel paddingSize="l" style={{ borderRadius: 12 }}>
                  {/* Byline with mascot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <MascotSVG size={22} expression="wink" idle={false} follow={false} bob={false} />
                    <span style={{ fontSize: 13, color: 'var(--ouiColorMediumShade, #5A6D8A)' }}>4 steps complete · 6.2s</span>
                  </div>
                  {/* Result text */}
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ouiTitleColor, #0E1525)', marginBottom: 20 }}>
                    Connection pool exhaustion on <strong>payment-svc</strong> drove the spike. Three of four pods hit max-acquire. No deploy correlates — traffic shifted at 14:12 when the upstream cache rolled.
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ padding: '8px 18px', borderRadius: 999, background: '#2E4A8F', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Open dashboard</span>
                    <span style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--ouiBorderColor, #D4DCE8)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Pin to runbook</span>
                  </div>
                </OuiPanel>
              </>
            )}

            {phase.whyNotes && (
              <>
                <OuiSpacer size="m" />
                <OuiTitle size="xxs">
                  <h5>Why this state</h5>
                </OuiTitle>
                <OuiSpacer size="xs" />
                <OuiText size="s">
                  <ul>
                    {phase.whyNotes.map((note, i) => <li key={i}>{note}</li>)}
                  </ul>
                </OuiText>
              </>
            )}

            {phase.avoid && (
              <>
                <OuiSpacer size="s" />
                <OuiText size="s" color="danger">
                  <p><strong>Avoid:</strong> {phase.avoid}</p>
                </OuiText>
              </>
            )}

            {phase.keyIdea && (
              <>
                <OuiSpacer size="s" />
                <OuiText size="s" color="subdued">
                  <p><em>{phase.keyIdea}</em></p>
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
          <strong>Rule:</strong> mascot scale ∝ how much the agent wants you to look.
        </p>
      </OuiText>

      <OuiSpacer size="m" />

      {scaleLadder.map((step) => (
        <div key={step.size}>
          <OuiPanel paddingSize="s">
            <OuiFlexGroup alignItems="center" gutterSize="m">
              <OuiFlexItem grow={false} style={{ minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MascotSVG size={parseInt(step.size)} expression="comma" />
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
                  color={moment.gold ? ['#B8860B', '#8B6914'] : undefined}
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
