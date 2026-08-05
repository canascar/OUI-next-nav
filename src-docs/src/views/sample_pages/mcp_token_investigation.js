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

/**
 * Second investigation journey — an agent token spike.
 *
 * Structurally identical to the checkout/p99 flow (mcp_investigation.js) and
 * built from its components: McpAppCard for every beat, the shared drill chip,
 * and the same ending — root cause → recommendation → alert rule → memory. Only
 * the content differs; a reviewer diffing the two endings should see nothing but
 * copy.
 *
 * The one beat with no counterpart in the checkout flow is the topology, and it
 * still renders inside McpAppCard: services as square nodes, agents as pill
 * nodes, one hot edge between them.
 *
 * Nothing here writes to the customer's environment. The recommendation names
 * what to change and stops; the only control is the alert rule, which is our own
 * modality.
 */

import React from 'react';
import { OuiIcon } from '../../../../src/components';
import { McpAppCard, McpDrillChip, MCP_BEAT_DELAY } from './mcp_investigation';

// ---------------------------------------------------------------------------
// Beat data
// ---------------------------------------------------------------------------

/** The context strip above the thread — where this investigation came from. */
export const TOKEN_CONTEXT =
  'Agent investigation · started from ⚠ token usage +312% · support-triage';

/** Beat 1 — token usage by agent. One line climbs; the rest stay flat. */
export const TOKEN_METRICS = {
  id: 'mcpApp-token-metrics',
  metric: 'Token usage by agent',
  scope: 'all agents · today',
  spanMinutes: 60,
  startLabel: '09:00',
  endLabel: '10:00',
  eventMinute: 38,
  eventLabel: '▲ 09:38 · kb-search index refresh failed',
  // support-triage climbs sharply from the event marker.
  hot: {
    name: 'support-triage',
    points: [
      { m: 0, v: 8 },
      { m: 10, v: 9 },
      { m: 20, v: 10 },
      { m: 30, v: 11 },
      { m: 38, v: 12 },
      { m: 44, v: 34 },
      { m: 50, v: 58 },
      { m: 55, v: 78 },
      { m: 60, v: 94 },
    ],
  },
  // Every other agent, flat for the whole hour.
  flat: [
    {
      name: 'kb-search',
      points: [
        { m: 0, v: 14 },
        { m: 20, v: 15 },
        { m: 40, v: 13 },
        { m: 60, v: 14 },
      ],
    },
    {
      name: 'billing-agent',
      points: [
        { m: 0, v: 9 },
        { m: 20, v: 10 },
        { m: 40, v: 9 },
        { m: 60, v: 10 },
      ],
    },
    {
      name: 'research-agent',
      points: [
        { m: 0, v: 5 },
        { m: 20, v: 6 },
        { m: 40, v: 5 },
        { m: 60, v: 6 },
      ],
    },
  ],
};

/** Beat 2 — services and agents in one graph, with one hot edge. */
export const TOKEN_TOPOLOGY = {
  id: 'mcpApp-token-topology',
  scope: 'prod-web · services + agents',
  // Square nodes.
  services: [
    { key: 'checkout', label: 'checkout', x: 22, y: 22 },
    { key: 'ticket-api', label: 'ticket-api', x: 22, y: 70 },
    { key: 'search-idx', label: 'search-idx', x: 78, y: 70 },
  ],
  // Pill nodes.
  agents: [
    {
      key: 'support-triage',
      label: 'support-triage',
      x: 50,
      y: 22,
      alert: true,
    },
    { key: 'kb-search', label: 'kb-search', x: 78, y: 22 },
  ],
  edges: [
    { from: 'checkout', to: 'support-triage' },
    { from: 'ticket-api', to: 'support-triage' },
    // Exactly one edge carries the hot-path treatment.
    { from: 'support-triage', to: 'kb-search', hot: true },
    { from: 'kb-search', to: 'search-idx' },
  ],
  hotPathLabel: 'hot path: support-triage → kb-search',
  drillLabel: 'Open in Topology',
  drillPageKey: 'app-map',
  drillPageTitle: 'Topology — services + agents',
};

/** Beat 3 — the agent's own spans. The retry loop is visible in the list. */
export const TOKEN_SPANS = {
  id: 'mcpApp-token-spans',
  agent: 'support-triage',
  spans: [
    { kind: 'plan', text: 'triage ticket #8841' },
    {
      kind: 'tool',
      text: 'kb-search',
      fails: ['timeout', 'timeout', 'timeout'],
    },
    {
      kind: 'retry',
      text: 're-prompt with FULL context',
      meta: ['62k tokens', '× 41'],
      bad: true,
    },
    {
      kind: 'result',
      text:
        'same 62k-token prompt re-sent every retry — nothing truncated, nothing cached',
      bad: true,
    },
  ],
};

/** Beat 4 — the root cause, plus links back to the three views above. */
export const TOKEN_ROOT_CAUSE = {
  content:
    "**Root cause: a stale index turned into a retry storm.**\n\nkb-search's index refresh failed at 09:38, so its calls started timing out. Every miss makes support-triage retry with its entire 62k-token context — 41 times so far. One stale index, 4.2M tokens.",
  evidence: [
    {
      label: 'Metrics: 4.2M tokens vs 1.0M baseline',
      targetId: TOKEN_METRICS.id,
    },
    { label: 'Topology: hot path to kb-search', targetId: TOKEN_TOPOLOGY.id },
    { label: 'Spans: 41 full-context retries', targetId: TOKEN_SPANS.id },
  ],
};

/** Beat 4 — the recommendation. Information only; their deployment, their call. */
export const TOKEN_RECOMMENDATION = {
  id: 'mcpApp-token-recommendation',
  title:
    "What I'd change: re-run the search-idx refresh · cap agent retries at 3 with truncated context",
  target: 'search-idx · support-triage · prod-web',
  body:
    'The index refresh clears the timeouts — that’s the real fix. The retry ' +
    'cap stops any future dependency failure from becoming a token bill.',
  footer: 'recommendation only — applied by your team, in your deployment',
};

/** Beat 4 — the alert rule. Watching for a pattern is our own modality. */
export const TOKEN_ALERT_RULE = {
  offer: 'Want to catch this pattern early next time?',
  cta: 'Create alert rule',
  created: 'Rule created: token usage > 3× 7-day baseline, per agent',
};

/** Beat 5 — what the agent keeps for the next token spike on this estate. */
export const TOKEN_MEMORY = {
  intro:
    'Saved for next time — token spikes on this estate now start from these:',
  title: '3 memories from this investigation',
  items: [
    'support-triage token burn tracks kb-search health — check the dependency first',
    'retry storms re-send full context — a token spike usually means a loop',
    'baseline: ~1M tokens/day for support-triage',
  ],
};

/** The closing drill chip, inside the memory turn. */
export const TOKEN_CAVEAT = {
  lead: 'Want the raw spans?',
  linkLabel: 'See every span in Trace analytics',
  pageKey: 'app-traces',
  pageTitle: 'support-triage spans',
};

// ---------------------------------------------------------------------------
// Home finding — one more row in the existing findings list
// ---------------------------------------------------------------------------

/**
 * Shaped exactly like the rows already in SCENARIOS: chip + title + a
 * right-side widget. `spark` renders the existing sparkline widget, so this row
 * is the same component as the p99 row with different props.
 */
export const TOKEN_SPIKE_FINDING = {
  key: 'warning-token-spike',
  status: 'Warning',
  statusColor: 'amber',
  title: 'Agent token usage spiked — support-triage',
  widget: { type: 'spark', label: '+312%', color: 'var(--g-danger)', up: true },
  // Opens the token investigation thread, same as the p99 row's action.
  actions: [{ label: 'Investigate', key: 'investigate-token-spike' }],
  insight:
    'support-triage has burned 4.2M tokens today against a 1.0M/day baseline, and every other agent is flat. The climb starts at 09:38, when the kb-search index refresh failed — the agent has been retrying with its full 62k-token context ever since.',
};

// ---------------------------------------------------------------------------
// Beat 1 — Metrics app (token usage by agent)
// ---------------------------------------------------------------------------

const CHART_W = 300;
const CHART_H = 100;

const tokenX = (m) => (m / TOKEN_METRICS.spanMinutes) * CHART_W;
const tokenY = (v) => CHART_H - (v / 100) * (CHART_H - 14) - 7;
const toPoints = (points) =>
  points
    .map((p) => `${tokenX(p.m).toFixed(1)},${tokenY(p.v).toFixed(1)}`)
    .join(' ');

export const McpTokenMetricsApp = () => {
  const hotLine = toPoints(TOKEN_METRICS.hot.points);
  const hotArea = `${hotLine} ${CHART_W},${CHART_H} 0,${CHART_H}`;
  const eventX = tokenX(TOKEN_METRICS.eventMinute);

  return (
    <McpAppCard
      id={TOKEN_METRICS.id}
      app="Metrics"
      icon="visLine"
      title={`${TOKEN_METRICS.metric} — support-triage +312%`}
      subtitle={TOKEN_METRICS.scope}
      badge="+312%"
      badgeTone="danger">
      <div className="mcpApp__chart">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="mcpApp__chartSvg"
          role="img"
          aria-label="support-triage token usage climbing sharply from 09:38 while every other agent stays flat">
          <defs>
            <pattern
              id="mcpTokenStripe"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="var(--g-danger)"
                strokeWidth="1"
                opacity="0.34"
              />
            </pattern>
          </defs>
          {/* Every other agent — flat, and quiet. */}
          {TOKEN_METRICS.flat.map((series) => (
            <polyline
              key={series.name}
              points={toPoints(series.points)}
              fill="none"
              stroke="var(--g-accent-dim)"
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* The one agent responsible for the spike. */}
          <polygon points={hotArea} fill="url(#mcpTokenStripe)" />
          <polyline
            points={hotLine}
            fill="none"
            stroke="var(--g-danger)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* The moment the dependency broke. */}
          <line
            x1={eventX}
            y1="0"
            x2={eventX}
            y2={CHART_H}
            stroke="var(--g-warn)"
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="mcpApp__chartMarker mcpApp__chartMarker--warn"
          style={{ left: `${(eventX / CHART_W) * 100}%` }}>
          {TOKEN_METRICS.eventLabel}
        </span>
      </div>
      <div className="mcpApp__chartAxis">
        <span>{TOKEN_METRICS.startLabel}</span>
        <span>{TOKEN_METRICS.endLabel}</span>
      </div>
      <div className="mcpApp__statRow">
        <div className="mcpApp__stat">
          <span className="mcpApp__statLabel">support-triage today</span>
          <span className="mcpApp__statValue mcpApp__statValue--danger">
            4.2M tokens
          </span>
        </div>
        <div className="mcpApp__stat">
          <span className="mcpApp__statLabel">7-day baseline</span>
          <span className="mcpApp__statValue">1.0M / day</span>
        </div>
        <div className="mcpApp__stat">
          <span className="mcpApp__statLabel">All other agents</span>
          <span className="mcpApp__statValue">flat</span>
        </div>
      </div>
    </McpAppCard>
  );
};

// ---------------------------------------------------------------------------
// Beat 2 — Topology app (services + agents in one graph)
// ---------------------------------------------------------------------------

/**
 * One graph, two node shapes. Services are squares, agents are pills, and
 * exactly one edge — support-triage → kb-search — carries the hot-path
 * treatment (animated dash + accent color).
 */
export const McpTokenTopologyApp = ({ onOpenPage }) => {
  const nodes = {};
  TOKEN_TOPOLOGY.services.forEach((n) => {
    nodes[n.key] = { ...n, kind: 'service' };
  });
  TOKEN_TOPOLOGY.agents.forEach((n) => {
    nodes[n.key] = { ...n, kind: 'agent' };
  });

  return (
    <McpAppCard
      id={TOKEN_TOPOLOGY.id}
      app="Topology"
      icon="navServiceMap"
      title="Services and agents — one hot path"
      subtitle={TOKEN_TOPOLOGY.scope}
      badge="1 agent alerting"
      badgeTone="danger">
      <div className="mcpTopo">
        {/* Edges sit under the nodes; percentage coordinates keep the graph
            fluid inside the card. */}
        <svg
          className="mcpTopo__edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true">
          {TOKEN_TOPOLOGY.edges.map((edge) => {
            const a = nodes[edge.from];
            const b = nodes[edge.to];
            if (!a || !b) return null;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`mcpTopo__edge${
                  edge.hot ? ' mcpTopo__edge--hot' : ''
                }`}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {Object.values(nodes).map((node) => (
          <div
            key={node.key}
            className={`mcpTopo__node mcpTopo__node--${node.kind}${
              node.alert ? ' mcpTopo__node--alert' : ''
            }`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            {node.label}
          </div>
        ))}
      </div>

      <div className="mcpTopo__legend">
        <span className="mcpTopo__legendItem">
          <span className="mcpTopo__swatch mcpTopo__swatch--service" />
          service
        </span>
        <span className="mcpTopo__legendItem">
          <span className="mcpTopo__swatch mcpTopo__swatch--agent" />
          agent
        </span>
        <span className="mcpTopo__legendItem">
          <span className="mcpTopo__swatch mcpTopo__swatch--hot" />
          {TOKEN_TOPOLOGY.hotPathLabel}
        </span>
      </div>

      <div className="mcpTopo__drill">
        <McpDrillChip
          label={TOKEN_TOPOLOGY.drillLabel}
          onClick={() => {
            if (onOpenPage) {
              onOpenPage(
                TOKEN_TOPOLOGY.drillPageKey,
                TOKEN_TOPOLOGY.drillPageTitle
              );
            }
          }}
        />
      </div>
    </McpAppCard>
  );
};

// ---------------------------------------------------------------------------
// Beat 3 — Agent spans app
// ---------------------------------------------------------------------------

export const McpTokenSpansApp = () => (
  <McpAppCard
    id={TOKEN_SPANS.id}
    app="Agent spans"
    icon="apmTrace"
    title={`${TOKEN_SPANS.agent} — stuck in a retry loop`}
    subtitle={`Agent ${TOKEN_SPANS.agent} · ticket #8841`}
    badge="41 retries"
    badgeTone="danger">
    <div className="mcpSpans">
      {TOKEN_SPANS.spans.map((span) => (
        <div
          key={span.kind}
          className={`mcpSpans__row${span.bad ? ' mcpSpans__row--bad' : ''}`}>
          <span className="mcpSpans__kind">{span.kind}</span>
          <span className="mcpSpans__arrow">→</span>
          <span className="mcpSpans__text">
            {span.text}
            {span.fails &&
              span.fails.map((fail, i) => (
                <span key={i} className="mcpSpans__fail">
                  <OuiIcon type="cross" size="s" />
                  {fail}
                </span>
              ))}
            {span.meta &&
              span.meta.map((meta) => (
                <span key={meta} className="mcpSpans__meta">
                  {meta}
                </span>
              ))}
          </span>
        </div>
      ))}
    </div>
  </McpAppCard>
);

// ---------------------------------------------------------------------------
// Attachment dispatch — used by the chat thread
// ---------------------------------------------------------------------------

const TOKEN_APPS = {
  'token-metrics': McpTokenMetricsApp,
  'token-topology': McpTokenTopologyApp,
  'token-spans': McpTokenSpansApp,
};

/** Renders a `{ type: 'token-app', app }` attachment inside the thread. */
export const McpTokenAppAttachment = ({ app, onOpenPage }) => {
  const Component = TOKEN_APPS[app];
  return Component ? <Component onOpenPage={onOpenPage} /> : null;
};

// ---------------------------------------------------------------------------
// Thread messages — same turn structure and pacing as the checkout flow
// ---------------------------------------------------------------------------

export const TOKEN_INVESTIGATION_MESSAGES = [
  {
    role: 'user',
    author: 'You',
    content: 'Debug: which agent is burning tokens, on what, and why?',
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content:
      'Token spend first. One agent is responsible for nearly all of the spike:',
    attachments: [{ type: 'token-app', app: 'token-metrics' }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content:
      "Here's your estate — services and agents in one topology. The hot path lights up:",
    attachments: [{ type: 'token-app', app: 'token-topology' }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content:
      "Following the hot edge into the agent's spans — it's stuck in a retry loop:",
    attachments: [{ type: 'token-app', app: 'token-spans' }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content: TOKEN_ROOT_CAUSE.content,
    attachments: [{ type: 'mcp-evidence', items: TOKEN_ROOT_CAUSE.evidence }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content: 'Here is what I would change, and why.',
    attachments: [
      { type: 'mcp-recommendation', data: TOKEN_RECOMMENDATION },
      { type: 'mcp-alert-rule', data: TOKEN_ALERT_RULE },
    ],
  },
  // The memory turn arrives on its own and is the last thing the thread renders.
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content: TOKEN_MEMORY.intro,
    hideFeedback: true,
    attachments: [
      { type: 'mcp-memory', data: TOKEN_MEMORY },
      { type: 'mcp-caveat', data: TOKEN_CAVEAT },
    ],
  },
];
