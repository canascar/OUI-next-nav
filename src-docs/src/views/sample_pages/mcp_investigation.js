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
 * MCP-app-oriented investigation journey.
 *
 * One scenario, told entirely in the chat thread: the home findings row
 * ("p99 latency > 1.5s on checkout (prod-web)") starts an investigation and
 * every step arrives inline as an MCP app card. No floating panel — the only
 * link that opens the classic product is the closing caveat line.
 *
 * The components here are shared with the token-spike flow
 * (mcp_token_investigation.js): the app card frame, the drill chip, the pacing
 * constant, and all four ending components, each of which takes its copy as
 * `data` and defaults to this flow's.
 *
 * Nothing here writes to the customer's environment: the ending recommends a
 * change, offers an alert rule (our own modality), and shows what the agent
 * learned. No control in this flow performs or simulates an infra change.
 *
 * Everything here is data plus pure presentational components, so the same
 * beats render as a static report when chat is disabled (see
 * McpInvestigationReport).
 */

import React, { useContext, useState } from 'react';
import {
  OuiButtonIcon,
  OuiIcon,
  OuiPopover,
  OuiToolTip,
} from '../../../../src/components';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';
import {
  SurroundShimmer,
  ScenarioFindingCard,
  StatusDot,
  JUMP_TO_ITEMS,
  JUMP_TO_MORE_GROUPS,
} from './empty_session_page_v6';
import { JUMP_TO_MORE_LABEL } from './jump_to_constants';

// ---------------------------------------------------------------------------
// Pacing
// ---------------------------------------------------------------------------

/**
 * How long the assistant "thinks" before each beat arrives. Shared by every
 * investigation flow so they all play at the same speed — change it here and
 * both flows change together.
 */
export const MCP_BEAT_DELAY = 2200;

// ---------------------------------------------------------------------------
// Beat data
// ---------------------------------------------------------------------------

/** Beat 1 — the firing rule, threshold vs current, when it started. */
export const MCP_ALERT = {
  id: 'mcpApp-alert',
  rule: 'checkout-p99-latency-prod',
  state: 'Firing',
  threshold: '1.5s',
  current: '1.82s',
  startedAgo: '22m ago',
  startedAt: '14:26 UTC',
  evaluation: 'Every 1m · 3 consecutive breaches',
  scope: 'service: checkout · env: prod-web',
};

/** Beat 2 — the error pattern spike in checkout logs. */
export const MCP_LOGS = {
  id: 'mcpApp-logs',
  pattern: 'connection pool timeout',
  source: 'logs-checkout-prod-web',
  query:
    "source=logs-checkout-* | where env='prod-web' and message like '%pool timeout%' | stats count() by span(@timestamp, 1m)",
  count: '2,341',
  delta: '+184%',
  window: 'in the last 20m',
  share: '91% of all checkout errors',
  samples: [
    {
      ts: '14:47:02.118',
      level: 'ERROR',
      text:
        'orders-pool: timed out waiting 1500ms for a free connection (active=20, pending=37)',
    },
    {
      ts: '14:46:58.902',
      level: 'ERROR',
      text: 'checkout.getOrders failed: ConnectionPoolTimeout after 1502ms',
    },
    {
      ts: '14:46:51.437',
      level: 'WARN',
      text: 'orders-pool saturated: active=20/20 for 41s, queueing requests',
    },
  ],
};

/** Beat 3 — waterfall for one slow request. The long span is clickable. */
export const MCP_TRACE = {
  id: 'mcpApp-trace',
  traceId: '7f3c1a94b2e05d68',
  endpoint: 'POST /checkout',
  total: 1.82,
  spans: [
    {
      key: 'root',
      name: 'checkout.handleRequest',
      depth: 0,
      start: 0,
      duration: 1.82,
    },
    {
      key: 'validate',
      name: 'cart.validate',
      depth: 1,
      start: 0.03,
      duration: 0.06,
    },
    {
      key: 'pool-wait',
      name: 'db.getConnection.wait',
      depth: 1,
      start: 0.1,
      duration: 1.4,
      bad: true,
      clickable: true,
      attributes: [
        ['pool.name', 'orders-pool'],
        ['pool.max_size', '20'],
        ['pool.active', '20'],
        ['pool.pending', '37'],
        ['wait.ms', '1402'],
        ['db.system', 'postgresql'],
      ],
    },
    {
      key: 'query',
      name: 'db.query orders',
      depth: 1,
      start: 1.51,
      duration: 0.21,
    },
    {
      key: 'serialize',
      name: 'response.serialize',
      depth: 1,
      start: 1.73,
      duration: 0.02,
    },
  ],
};

/** Beat 4 — pool utilization, climbing since the 14:02 deploy. */
export const MCP_METRICS = {
  id: 'mcpApp-metrics',
  metric: 'Connection pool utilization',
  scope: 'orders-pool · checkout · prod-web',
  current: '94%',
  deployLabel: '14:02 deploy',
  deployMinute: 2,
  spanMinutes: 48,
  startLabel: '14:00',
  endLabel: '14:48',
  points: [
    { m: 0, v: 44 },
    { m: 2, v: 46 },
    { m: 6, v: 55 },
    { m: 12, v: 63 },
    { m: 18, v: 71 },
    { m: 24, v: 79 },
    { m: 30, v: 84 },
    { m: 36, v: 88 },
    { m: 42, v: 91 },
    { m: 48, v: 94 },
  ],
};

/** Beat 5 — the root-cause summary, as plain text plus evidence links. */
export const MCP_ROOT_CAUSE = {
  content:
    '**Root cause: pool exhaustion on prod-web.**\n\nThe 14:02 deploy roughly doubled how long each checkout request holds a database connection (0.6s → 1.3s), so the 20-connection orders-pool no longer covers peak concurrency. Requests queue for a free connection instead of failing, which is why p99 crossed 1.5s while the error rate stayed flat.',
  evidence: [
    { label: 'Alert: threshold 1.5s vs 1.82s', targetId: MCP_ALERT.id },
    { label: 'Logs: pool timeouts +184%', targetId: MCP_LOGS.id },
    { label: 'Trace: 1.40s in getConnection.wait', targetId: MCP_TRACE.id },
    { label: 'Metrics: pool at 94% since 14:02', targetId: MCP_METRICS.id },
  ],
};

/**
 * Beat 6 — the recommendation. Information, not action: the pool size lives in
 * the customer's own config, so this flow states what to change and stops.
 */
export const MCP_RECOMMENDATION = {
  id: 'mcpApp-recommendation',
  title: "What I'd change: connection pool 20 → 40 on prod-web",
  target: 'orders-pool · checkout · prod-web',
  body:
    'The pool size lives in your service config. Bumping it buys immediate ' +
    'headroom while the 14:02 deploy gets reviewed — the deploy is the real fix.',
  footer: 'recommendation only — applied by your team, in your deployment',
};

/** Beat 7 — the alert rule. Watching for a pattern is our own modality. */
export const MCP_ALERT_RULE = {
  offer: 'Want to be alerted if this pattern returns?',
  cta: 'Create alert rule',
  created: 'Rule created: pool utilization > 85% for 5m on prod-web',
};

/** Beat 8 — what the agent keeps, so the next occurrence starts further along. */
export const MCP_MEMORY = {
  intro:
    'I saved what I learned here. Next time something like this fires, I start from these instead of from zero:',
  title: '3 memories from this investigation',
  items: [
    'checkout p99 is deploy-sensitive — correlate deploys first',
    'pool exhaustion signature: timeouts + 20/20 in-use + queued waiters',
    'healthy pool baseline for prod-web: < 70% utilization',
  ],
};

/**
 * The home findings row for this investigation. Same shape as the rows in
 * SCENARIOS — chip + title + a right-side widget — so the home list renders one
 * component for every finding regardless of which flow it opens.
 */
export const MCP_P99_FINDING = {
  key: 'warning-checkout-p99',
  status: 'Warning',
  statusColor: 'amber',
  title: 'p99 latency > 1.5s on checkout (prod-web)',
  widget: { type: 'spark', label: '1.82s', color: 'var(--g-danger)', up: true },
};

/** The closing line, and the only link out to the classic product. */
export const MCP_CAVEAT = {
  lead: 'Need to go deeper on any of this?',
  linkLabel: 'Open these logs in Discover',
  trail: 'every view above is also available in the classic product.',
  pageKey: 'discover-log-correlated',
  pageTitle: 'Checkout pool timeout logs',
};

// ---------------------------------------------------------------------------
// Shared card chrome
// ---------------------------------------------------------------------------

/**
 * Frame for every MCP app card. Built on the existing thread attachment card
 * style so these read as the same object family as the rest of the thread.
 */
export const McpAppCard = ({
  id,
  app,
  icon,
  title,
  subtitle,
  badge,
  badgeTone = 'neutral',
  children,
}) => (
  <div className="threadPage__attachmentWrap">
    <div className="threadPage__attachment mcpApp" id={id}>
      <div className="mcpApp__head">
        <span className="mcpApp__app">
          <OuiIcon type={icon} size="s" />
          <span>{app}</span>
        </span>
        {badge && (
          <span className={`mcpApp__badge mcpApp__badge--${badgeTone}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mcpApp__title">{title}</div>
      {subtitle && <div className="mcpApp__subtitle">{subtitle}</div>}
      <div className="mcpApp__body">{children}</div>
    </div>
  </div>
);

const McpStat = ({ label, value, tone }) => (
  <div className="mcpApp__stat">
    <span className="mcpApp__statLabel">{label}</span>
    <span
      className={`mcpApp__statValue${
        tone ? ` mcpApp__statValue--${tone}` : ''
      }`}>
      {value}
    </span>
  </div>
);

const McpMetaRow = ({ items }) => (
  <div className="mcpApp__metaRow">
    {items.map(([label, value]) => (
      <div key={label} className="mcpApp__metaItem">
        <span className="mcpApp__metaLabel">{label}</span>
        <span className="mcpApp__metaValue">{value}</span>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Beat 1 — Alert detail app
// ---------------------------------------------------------------------------

export const McpAlertApp = () => (
  <McpAppCard
    id={MCP_ALERT.id}
    app="Alerting"
    icon="navAlerting"
    title="p99 latency > 1.5s on checkout (prod-web)"
    subtitle={`Rule ${MCP_ALERT.rule}`}
    badge={MCP_ALERT.state}
    badgeTone="danger">
    <div className="mcpApp__statRow">
      <McpStat label="Threshold" value={MCP_ALERT.threshold} />
      <McpStat label="Current p99" value={MCP_ALERT.current} tone="danger" />
      <McpStat label="Started" value={MCP_ALERT.startedAgo} />
    </div>
    <McpMetaRow
      items={[
        ['First breach', MCP_ALERT.startedAt],
        ['Evaluation', MCP_ALERT.evaluation],
        ['Scope', MCP_ALERT.scope],
      ]}
    />
  </McpAppCard>
);

// ---------------------------------------------------------------------------
// Beat 2 — Logs app
// ---------------------------------------------------------------------------

export const McpLogsApp = () => (
  <McpAppCard
    id={MCP_LOGS.id}
    app="Logs"
    icon="navDiscover"
    title={`Error pattern: ${MCP_LOGS.pattern}`}
    subtitle={MCP_LOGS.source}
    badge={MCP_LOGS.delta}
    badgeTone="danger">
    <div className="mcpApp__statRow">
      <McpStat label="Events" value={MCP_LOGS.count} tone="danger" />
      <McpStat label="Change" value={`${MCP_LOGS.delta} ${MCP_LOGS.window}`} />
      <McpStat label="Share of errors" value={MCP_LOGS.share} />
    </div>
    <div className="mcpApp__query">{MCP_LOGS.query}</div>
    <div className="mcpApp__logLines">
      {MCP_LOGS.samples.map((line) => (
        <div key={line.ts} className="mcpApp__logLine">
          <span className="mcpApp__logTs">{line.ts}</span>
          <span
            className={`mcpApp__logLevel mcpApp__logLevel--${line.level.toLowerCase()}`}>
            {line.level}
          </span>
          <span className="mcpApp__logText">{line.text}</span>
        </div>
      ))}
    </div>
  </McpAppCard>
);

// ---------------------------------------------------------------------------
// Beat 3 — Trace app (waterfall, clickable span)
// ---------------------------------------------------------------------------

export const McpTraceApp = ({ initialSelectedSpan = null }) => {
  const [selected, setSelected] = useState(initialSelectedSpan);
  const scale = (value) => `${(value / MCP_TRACE.total) * 100}%`;

  return (
    <McpAppCard
      id={MCP_TRACE.id}
      app="Traces"
      icon="apmTrace"
      title={`${MCP_TRACE.endpoint} — ${MCP_TRACE.total.toFixed(2)}s`}
      subtitle={`Trace ${MCP_TRACE.traceId}`}
      badge="Slowest span 1.40s"
      badgeTone="danger">
      <div className="mcpApp__waterfall">
        {MCP_TRACE.spans.map((span) => {
          const isOpen = selected === span.key;
          const rowClass = [
            'mcpApp__span',
            span.bad ? 'mcpApp__span--bad' : '',
            span.clickable ? 'mcpApp__span--clickable' : '',
            isOpen ? 'mcpApp__span--open' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const row = (
            <>
              <span
                className="mcpApp__spanName"
                style={{ paddingLeft: span.depth * 14 }}>
                {span.clickable && (
                  <OuiIcon
                    type={isOpen ? 'arrowDown' : 'arrowRight'}
                    size="s"
                    className="mcpApp__spanCaret"
                  />
                )}
                {span.name}
              </span>
              <span className="mcpApp__spanTrack">
                <span
                  className="mcpApp__spanBar"
                  style={{
                    left: scale(span.start),
                    width: scale(span.duration),
                  }}
                />
              </span>
              <span className="mcpApp__spanDuration">
                {span.duration.toFixed(2)}s
              </span>
            </>
          );

          return (
            <div key={span.key} className="mcpApp__spanGroup">
              {span.clickable ? (
                <button
                  type="button"
                  className={rowClass}
                  aria-expanded={isOpen}
                  onClick={() => setSelected(isOpen ? null : span.key)}>
                  {row}
                </button>
              ) : (
                <div className={rowClass}>{row}</div>
              )}
              {isOpen && span.attributes && (
                <div className="mcpApp__spanDetail">
                  {span.attributes.map(([label, value]) => (
                    <div key={label} className="mcpApp__spanAttr">
                      <span className="mcpApp__spanAttrKey">{label}</span>
                      <span className="mcpApp__spanAttrValue">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mcpApp__note">
        1.40s of the 1.82s is spent waiting for a connection — before the query
        even runs.
      </p>
    </McpAppCard>
  );
};

// ---------------------------------------------------------------------------
// Beat 4 — Metrics app (pool utilization with deploy marker)
// ---------------------------------------------------------------------------

const CHART_W = 300;
const CHART_H = 100;

export const McpMetricsApp = () => {
  const x = (m) => (m / MCP_METRICS.spanMinutes) * CHART_W;
  const y = (v) => CHART_H - (v / 100) * (CHART_H - 14) - 7;
  const line = MCP_METRICS.points
    .map((p) => `${x(p.m).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(' ');
  const area = `${line} ${CHART_W},${CHART_H} 0,${CHART_H}`;
  const deployX = x(MCP_METRICS.deployMinute);

  return (
    <McpAppCard
      id={MCP_METRICS.id}
      app="Metrics"
      icon="visArea"
      title={`${MCP_METRICS.metric} — ${MCP_METRICS.current}`}
      subtitle={MCP_METRICS.scope}
      badge="Climbing"
      badgeTone="danger">
      <div className="mcpApp__chart">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="mcpApp__chartSvg"
          role="img"
          aria-label={`${MCP_METRICS.metric} climbing to ${MCP_METRICS.current} since the ${MCP_METRICS.deployLabel}`}>
          <defs>
            <pattern
              id="mcpPoolStripe"
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
          <polygon points={area} fill="url(#mcpPoolStripe)" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--g-danger)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={deployX}
            y1="0"
            x2={deployX}
            y2={CHART_H}
            stroke="var(--g-ink-mute)"
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="mcpApp__chartMarker"
          style={{ left: `${(deployX / CHART_W) * 100}%` }}>
          {MCP_METRICS.deployLabel}
        </span>
      </div>
      <div className="mcpApp__chartAxis">
        <span>{MCP_METRICS.startLabel}</span>
        <span>{MCP_METRICS.endLabel}</span>
      </div>
      <div className="mcpApp__statRow">
        <McpStat label="Now" value={MCP_METRICS.current} tone="danger" />
        <McpStat label="Before deploy" value="46%" />
        <McpStat label="Pool size" value="20 connections" />
      </div>
    </McpAppCard>
  );
};

// ---------------------------------------------------------------------------
// Beat 5 — evidence links back to the four cards above
// ---------------------------------------------------------------------------

const scrollToCard = (targetId) => {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('mcpApp--flash');
  setTimeout(() => el.classList.remove('mcpApp--flash'), 1200);
};

export const McpEvidenceLinks = ({ items, staticMode }) => (
  <div className="mcpEvidence">
    <span className="mcpEvidence__label">Evidence</span>
    <div className="mcpEvidence__items">
      {items.map((item) =>
        staticMode ? (
          <span key={item.label} className="mcpEvidence__chip">
            {item.label}
          </span>
        ) : (
          <button
            key={item.label}
            type="button"
            className="mcpEvidence__chip mcpEvidence__chip--clickable"
            onClick={() => scrollToCard(item.targetId)}>
            {item.label}
          </button>
        )
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Beat 6 — the recommendation. Information only; no control writes to prod.
// ---------------------------------------------------------------------------

export const McpRecommendationCard = ({ data = MCP_RECOMMENDATION }) => (
  <McpAppCard
    id={data.id}
    app="Recommendation"
    icon="wrench"
    title={data.title}
    subtitle={data.target}>
    <p className="mcpApp__note">{data.body}</p>
    <div className="mcpApp__handoff">{data.footer}</div>
  </McpAppCard>
);

// ---------------------------------------------------------------------------
// Beat 7 — the alert rule. Watching for a pattern is our own modality.
// ---------------------------------------------------------------------------

export const McpAlertRuleOffer = ({ staticMode, data = MCP_ALERT_RULE }) => {
  const [isCreated, setIsCreated] = useState(false);

  return (
    <div className="mcpRule">
      {!isCreated && <span className="mcpRule__offer">{data.offer}</span>}
      {isCreated ? (
        <span className="mcpRule__created">
          <OuiIcon type="check" size="s" />
          {data.created}
        </span>
      ) : (
        !staticMode && (
          <button
            type="button"
            className="mcpRule__btn"
            onClick={() => setIsCreated(true)}>
            <OuiIcon type="bell" size="s" />
            {data.cta}
          </button>
        )
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Beat 8 — what the agent keeps, plus the one link out to the classic product
// ---------------------------------------------------------------------------

export const McpMemoryCard = ({ data = MCP_MEMORY }) => (
  <div className="threadPage__attachmentWrap">
    <div className="threadPage__attachment mcpMemory">
      <div className="mcpMemory__head">
        <OuiIcon type="sparkleFilled" size="m" />
        <span className="mcpMemory__title">{data.title}</span>
      </div>
      <ul className="mcpMemory__list">
        {data.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  </div>
);

/**
 * The one drill-down chip style, used both by the closing caveat line and by
 * any card that offers a way into the classic product. Same chip everywhere —
 * a link icon plus a label.
 */
export const McpDrillChip = ({
  label,
  onClick,
  icon = 'link',
  iconAfter = false,
}) => (
  <button
    type="button"
    className="mcpCaveat__link"
    onClick={() => {
      if (onClick) onClick();
    }}>
    {!iconAfter && <OuiIcon type={icon} size="s" />}
    {label}
    {iconAfter && <OuiIcon type={icon} size="s" />}
  </button>
);

/**
 * The closing line, inside the memory turn rather than a turn of its own. The
 * link opens the right-side views panel on the correlated checkout logs.
 */
export const McpCaveatLine = ({ onOpenDiscover, data = MCP_CAVEAT }) => (
  <p className="mcpCaveat">
    <span className="mcpCaveat__lead">{data.lead}</span>{' '}
    <McpDrillChip
      label={data.linkLabel}
      icon="arrowRight"
      iconAfter
      onClick={() => {
        if (onOpenDiscover) onOpenDiscover(data.pageKey, data.pageTitle);
      }}
    />{' '}
    {data.trail && <span className="mcpCaveat__lead">— {data.trail}</span>}
  </p>
);

// ---------------------------------------------------------------------------
// Attachment dispatch — used by the chat thread
// ---------------------------------------------------------------------------

const MCP_APPS = {
  alert: McpAlertApp,
  logs: McpLogsApp,
  trace: McpTraceApp,
  metrics: McpMetricsApp,
};

/** Renders an `{ type: 'mcp-app', app }` attachment inside the thread. */
export const McpAppAttachment = ({ app }) => {
  const Component = MCP_APPS[app];
  return Component ? <Component /> : null;
};

// ---------------------------------------------------------------------------
// Thread messages
// ---------------------------------------------------------------------------

/**
 * The whole journey as one scrollable story. Beats arrive in order; each one is
 * visible in-thread with no floating panel.
 */
export const MCP_INVESTIGATION_MESSAGES = [
  {
    role: 'user',
    author: 'You',
    content: 'Investigate: p99 latency > 1.5s on checkout (prod-web)',
  },
  {
    role: 'assistant',
    delayBefore: 2400,
    content:
      "Picking this up. Here's the rule that fired and where it stands right now.",
    attachments: [{ type: 'mcp-app', app: 'alert' }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content:
      'Checkout logs point at one error pattern doing nearly all of the damage — connection pool timeouts.',
    attachments: [{ type: 'mcp-app', app: 'logs' }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content:
      'I sampled a trace from one of the slow requests. Select the long span to see its attributes.',
    attachments: [{ type: 'mcp-app', app: 'trace' }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content:
      'The pool itself confirms it — utilization has climbed steadily since the 14:02 deploy and is now pinned at 94%.',
    attachments: [{ type: 'mcp-app', app: 'metrics' }],
  },
  {
    role: 'assistant',
    delayBefore: 2400,
    content: MCP_ROOT_CAUSE.content,
    attachments: [{ type: 'mcp-evidence', items: MCP_ROOT_CAUSE.evidence }],
  },
  {
    role: 'assistant',
    delayBefore: MCP_BEAT_DELAY,
    content: 'Here is what I would change, and why.',
    attachments: [{ type: 'mcp-recommendation' }, { type: 'mcp-alert-rule' }],
  },
  // The memory turn arrives on its own — nothing the user does triggers it —
  // and it is the last thing the thread renders.
  {
    role: 'assistant',
    delayBefore: 2000,
    content: MCP_MEMORY.intro,
    hideFeedback: true,
    attachments: [{ type: 'mcp-memory' }, { type: 'mcp-caveat' }],
  },
];

// ---------------------------------------------------------------------------
// Home greeting — the findings rows that start an investigation
// ---------------------------------------------------------------------------

/**
 * The chips shown inline; everything else lives behind the "more" chip. Pulled
 * from the shared Overview home list by key so the labels and icons stay in one
 * place — this page just surfaces fewer of them.
 */
const MCP_JUMP_TO_CHIPS = ['logs', 'metrics', 'dashboards'];
const MCP_JUMP_TO_ITEMS = MCP_JUMP_TO_CHIPS.map((pageKey) =>
  JUMP_TO_ITEMS.find((item) => item.pageKey === pageKey)
).filter(Boolean);

/**
 * The "more" popover carries everything the chips don't — the shared groups,
 * plus the Overview chips left off this page's shorter row.
 */
const MCP_JUMP_TO_MORE_GROUPS = [
  {
    key: 'mcp-rest',
    label: null,
    items: JUMP_TO_ITEMS.filter(
      (item) => !MCP_JUMP_TO_CHIPS.includes(item.pageKey)
    ),
  },
  ...JUMP_TO_MORE_GROUPS,
];

/**
 * The MCP home. Olly's avatar and status dot over a greeting and a list of
 * findings; clicking a row starts that finding's investigation in the chat
 * thread. The rows are the shared ScenarioFindingCard, so every flow's entry
 * point looks the same. Under the list sits the same shimmering ask-anything
 * input and Jump-to chip row used on Overview home, so the two greetings are
 * one family.
 */
export const McpHomeGreeting = ({
  onStartInvestigation,
  onSend,
  findings = [],
  onSelectFinding,
  onJumpToPage,
}) => {
  const [inputValue, setInputValue] = useState('');

  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';
  const [mascotExpression, setMascotExpression] = useState(undefined);

  const submit = () => {
    const text = inputValue.trim();
    if (!text) return;
    if (onSend) {
      onSend(text);
    } else if (onStartInvestigation) {
      // Fall back to the host's own handler so a free-form ask never dead-ends.
      onStartInvestigation();
    }
    setInputValue('');
  };

  const jumpTo = (pageKey, label) => {
    if (onJumpToPage) onJumpToPage(pageKey, label);
  };

  return (
    <div className="mcpHome">
      <div className="mcpHome__inner">

        {/* Olly — the same mascot row
            Overview home opens with. */}
        <div className="v6Scenario__mascotRow mcpHome__mascotRow">
          <OuiToolTip content="Hi, I'm Olly" position="right">
            <div
              className="v6Scenario__mascotWrap"
              onMouseEnter={() => setMascotExpression('happy')}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.85)';
                setMascotExpression('heart');
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                setMascotExpression('happy');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                setMascotExpression(undefined);
              }}>
              <Mascot
                size={24}
                expression={mascotExpression}
                idle={!mascotExpression}
                bob
                follow
                color={mascotColor}
                eyeColor={mascotEyeColor}
              />
            </div>
          </OuiToolTip>
        </div>

        <h1 className="mcpHome__title">Good afternoon.</h1>
        <p className="mcpHome__lede">
          {findings.length > 1
            ? 'A couple of things need a look. Start with either and I’ll take it from the top.'
            : 'One thing needs a look. Start here and I’ll take it from the top.'}
        </p>

        {/* Findings list — one row per finding, all the same component. Clicking
            a row opens that investigation. */}
        <div className="v6Scenario__findings v6Scenario__findings--inline mcpHome__findings">
          {findings.map((finding) => (
            <ScenarioFindingCard
              key={finding.key}
              finding={finding}
              idPrefix="mcpHome"
              showFeedback={false}
              canDismiss
              onSelect={() => {
                if (onSelectFinding) onSelectFinding(finding);
              }}
            />
          ))}
        </div>

        {/* Shimmering ask-anything input — same visual treatment as Overview
            home so the two greetings feel like one family. */}
        <div className="mcpHome__inputArea">
          <SurroundShimmer hide={false}>
            <div className="emptySessionPage__inputField">
              <textarea
                className="mcpHome__textarea"
                placeholder="Ask AI anything, or type to search a page"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={3}
              />
              <div className="emptySessionPage__inputActions">
                <OuiButtonIcon
                  iconType="plus"
                  aria-label="Add attachment"
                  size="xs"
                  color="text"
                />
                <OuiButtonIcon
                  iconType="sortUp"
                  aria-label="Send"
                  display="fill"
                  size="xs"
                  isDisabled={!inputValue.trim()}
                  onClick={submit}
                />
              </div>
            </div>
          </SurroundShimmer>
        </div>

        {/* Jump-to chips — the same rows and popover as Overview home, so a
            question isn't the only way off this page. */}
        <div className="v6Scenario__jumpTo mcpHome__jumpTo">
          <span className="v6Scenario__jumpToLabel">Jump to</span>
          {MCP_JUMP_TO_ITEMS.map((item) => (
            <button
              key={item.pageKey}
              type="button"
              className="v6Scenario__jumpToChip"
              onClick={() => jumpTo(item.pageKey, item.label)}>
              <OuiIcon type={item.icon} size="s" />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            type="button"
            className="v6Scenario__jumpToChip"
            aria-label={JUMP_TO_MORE_LABEL}
            onClick={() => jumpTo('new-tab', 'New Tab')}>
            <OuiIcon type="plus" size="s" />
            <span>{JUMP_TO_MORE_LABEL}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Degraded form — the same thread as a static report page
// ---------------------------------------------------------------------------

/**
 * The identical beats with chat turned off: no streaming, no approval buttons,
 * no scroll-to-evidence. Proves the thread reads as a report on its own.
 */
export const McpInvestigationReport = () => (
  <div className="mcpReport">
    <h1 className="mcpReport__title">
      p99 latency &gt; 1.5s on checkout (prod-web)
    </h1>
    <p className="mcpReport__meta">
      Investigation report · started {MCP_ALERT.startedAgo} · {MCP_ALERT.scope}
    </p>

    <p className="mcpReport__text">
      The rule that fired and where it stands right now.
    </p>
    <McpAlertApp />

    <p className="mcpReport__text">
      Checkout logs point at one error pattern doing nearly all of the damage —
      connection pool timeouts.
    </p>
    <McpLogsApp />

    <p className="mcpReport__text">
      A trace from one of the slow requests, with the long span expanded.
    </p>
    <McpTraceApp initialSelectedSpan="pool-wait" />

    <p className="mcpReport__text">
      Pool utilization has climbed steadily since the 14:02 deploy.
    </p>
    <McpMetricsApp />

    <h2 className="mcpReport__heading">
      Root cause: pool exhaustion on prod-web
    </h2>
    <p className="mcpReport__text">
      The 14:02 deploy roughly doubled how long each checkout request holds a
      database connection (0.6s → 1.3s), so the 20-connection orders-pool no
      longer covers peak concurrency. Requests queue for a free connection
      instead of failing, which is why p99 crossed 1.5s while the error rate
      stayed flat.
    </p>
    <McpEvidenceLinks items={MCP_ROOT_CAUSE.evidence} staticMode />

    <h2 className="mcpReport__heading">Recommendation</h2>
    <McpRecommendationCard />
    <McpAlertRuleOffer staticMode />

    <h2 className="mcpReport__heading">{MCP_MEMORY.title}</h2>
    <p className="mcpReport__text">{MCP_MEMORY.intro}</p>
    <McpMemoryCard />

    <p className="mcpReport__text mcpReport__text--caveat">
      {MCP_CAVEAT.lead} {MCP_CAVEAT.linkLabel} → — {MCP_CAVEAT.trail}
    </p>
  </div>
);
