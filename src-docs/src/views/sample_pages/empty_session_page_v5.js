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

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
} from 'react';

import {
  OuiButtonIcon,
  OuiIcon,
  OuiInsightCard,
  OuiTitle,
  OuiToolTip,
} from '../../../../src/components';

import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

// ─── SurroundShimmer (copied from v3) ──────────────────────────────────────────

const SurroundShimmer = ({ children }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const fieldRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let timeout = setTimeout(() => {
      fieldRef.current = build();
      const tick = (now) => {
        if (!startRef.current) startRef.current = now;
        const t = (now - startRef.current) / 1000;
        if (fieldRef.current) draw(fieldRef.current, t);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, 100);
    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return null;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sp = 7;
      const cols = Math.max(1, Math.round((w - sp) / sp));
      const rows = Math.max(1, Math.round((h - sp) / sp));
      const ox = (w - (cols - 1) * sp) / 2, oy = (h - (rows - 1) * sp) / 2;
      const dots = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          dots.push({ x: ox + i * sp, y: oy + j * sp, gx: i, gy: j, r: Math.random() });
      const field = { ctx, w, h, sp, dots, cx: w / 2, cy: h / 2 };
      const box = cv.parentElement && cv.parentElement.querySelector('[data-surround-box]');
      if (box) {
        const cr = cv.getBoundingClientRect(), br = box.getBoundingClientRect();
        field.hole = { x0: br.left - cr.left, y0: br.top - cr.top, x1: br.right - cr.left, y1: br.bottom - cr.top };
      }
      return field;
    };
    const draw = (f, t) => {
      const { ctx, w, h, sp, dots } = f;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        let b = 0;
        const hl = f.hole;
        if (!hl) continue;
        if (d.x > hl.x0 && d.x < hl.x1 && d.y > hl.y0 && d.y < hl.y1) continue;
        const sdx = Math.max(hl.x0 - d.x, d.x - hl.x1, 0);
        const sdy = Math.max(hl.y0 - d.y, d.y - hl.y1, 0);
        const sdist = Math.hypot(sdx, sdy);
        const bcx = (hl.x0 + hl.x1) / 2, bcy = (hl.y0 + hl.y1) / 2;
        const sa = (Math.atan2(d.y - bcy, d.x - bcx) / 6.2832) + 0.5;
        const sph = (t * 0.04) % 1;
        const sdm = Math.min(Math.abs(sa - sph), 1 - Math.abs(sa - sph));
        const sph2 = (sph + 0.5) % 1;
        const sd2m = Math.min(Math.abs(sa - sph2), 1 - Math.abs(sa - sph2));
        const near = Math.exp(-Math.pow(sdist / (sp * 2.6), 2));
        const sg = Math.exp(-Math.pow(sdm * 6, 2)) + 0.4 * Math.exp(-Math.pow(sd2m * 6, 2));
        b = 0.07 * Math.exp(-Math.pow(sdist / (sp * 4.5), 2)) + 0.6 * sg * near;
        if (b < 0.01) continue;
        b = Math.max(0, Math.min(1, b));
        const a = (0.10 + 0.60 * b).toFixed(3);
        const r = Math.round(60 + 50 * b), g = Math.round(80 + 50 * b), bl = Math.round(200 + 40 * b);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.6 + b * 1.4, 0, 6.2832);
        ctx.fillStyle = `rgba(${r},${g},${bl},${a})`;
        ctx.fill();
      }
    };
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <div style={{ position: 'relative', padding: '36px 42px', margin: '-36px -42px' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)' }} />
      <div data-surround-box="1" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// ─── Chart helpers (copied from v3) ────────────────────────────────────────────

const ChartTexture = ({ id, variant = 'dots', color }) => {
  if (variant === 'stripe') {
    return (
      <pattern
        id={id}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke={color || '#DD8A3A'} strokeWidth="1" opacity="0.42" />
      </pattern>
    );
  }
  return (
    <pattern
      id={id}
      width="6.5"
      height="6.5"
      patternUnits="userSpaceOnUse">
      <circle cx="3.25" cy="3.25" r="1.05" fill={color || '#1F9D6B'} opacity="0.42" />
    </pattern>
  );
};

const WidgetHeader = ({ icon, title, action, onAction }) => (
  <div className="widgetHeader">
    {icon && (
      <span className="widgetHeader__icon">
        <OuiIcon type={icon} size="s" />
      </span>
    )}
    <span className="widgetHeader__title">{title}</span>
    {action && (
      <button
        type="button"
        className="widgetHeader__action"
        onClick={(e) => {
          e.stopPropagation();
          onAction && onAction();
        }}>
        <OuiIcon type="arrowRight" size="s" />
      </button>
    )}
  </div>
);

const ScanShimmerOverlay = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sp = 7;
      const cols = Math.max(1, Math.round((w - sp) / sp));
      const rows = Math.max(1, Math.round((h - sp) / sp));
      const ox = (w - (cols - 1) * sp) / 2, oy = (h - (rows - 1) * sp) / 2;
      const dots = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          dots.push({ x: ox + i * sp, y: oy + j * sp, gx: i, gy: j });

      const tick = (now) => {
        if (!startRef.current) startRef.current = now;
        const t = (now - startRef.current) / 1000;
        ctx.clearRect(0, 0, w, h);
        const p = (t * 0.33) % 1;
        const lx = p * w;
        for (const d of dots) {
          const dx = (d.x - lx) / (sp * 2.2);
          const b = 0.03 + 0.97 * Math.exp(-dx * dx);
          const a = (0.04 + 0.35 * b).toFixed(3);
          const gray = Math.round(140 + 60 * b);
          ctx.beginPath();
          ctx.arc(d.x, d.y, 0.6 + b * 1.4, 0, 6.2832);
          ctx.fillStyle = `rgba(${gray},${gray},${Math.round(gray + 10)},${a})`;
          ctx.fill();
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    setTimeout(init, 50);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
        borderRadius: 'inherit',
      }}
    />
  );
};

// ─── Scenario data ─────────────────────────────────────────────────────────────

const SCENARIO_TABS = {
  1: 'Quiet morning',
  2: 'Live fire',
  3: 'Needs you',
  4: 'Reasoning quality',
  5: 'Recurring',
};

const SCENARIOS = {
  1: {
    statusColor: 'green',
    greeting: 'Hey hey, John!',
    summary: '<strong>244 of 247</strong> services healthy. No degradation, no cascading failures. <strong>3 findings</strong> need your attention.',
    findings: [
      {
        key: 'investigated-anomalies',
        status: 'Investigated',
        statusColor: 'teal',
        title: 'Two anomalies — both benign',
        conf: 0.91,
        sources: ['OpenSearch · traces'],
        body: 'A search-tool latency spike (cold start) and triage model drift (self-corrected). No action needed.',
        actions: [{ label: 'See the two queries', key: 'see-queries' }],
      },
      {
        key: 'watching-groundedness',
        status: 'Watching',
        statusColor: 'gray',
        title: 'Groundedness on docs-retrieval is sliding',
        sources: ['OpenSearch · eval'],
        body: "0.81 → 0.74 over three days. Within range, but trending. I'll flag it at 0.70.",
        actions: [{ label: 'Adjust the threshold', key: 'adjust-threshold' }],
      },
      {
        key: 'recommends-routing',
        status: 'Recommends',
        statusColor: 'blue',
        title: 'The planner over-uses the expensive model',
        conf: 0.79,
        sources: ['OpenSearch · gen_ai.usage'],
        body: "38% of simple intents hit the expensive model — $410/day. Routing them cheap is a runtime change, so it's yours.",
        actions: [{ label: 'Open the runbook', key: 'open-runbook' }],
      },
    ],
  },
  2: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: '<strong>Active incident</strong> — checkout-agent is looping in prod. <strong>1 finding</strong> needs you now, two more to review.',
    findings: [
      {
        key: 'traced-loop',
        status: 'Traced',
        statusColor: 'amber',
        title: "It's stuck on order-lookup",
        conf: 0.93,
        sources: ['OpenSearch · traces'],
        body: 'The tool returns 200 with an empty body on a miss. The agent reads empty as retryable and loops.',
        actions: [{ label: 'Open the trace', key: 'open-trace' }],
      },
      {
        key: 'root-cause-pool',
        status: 'Root cause',
        statusColor: 'red',
        title: 'order-db is exhausted, and the loop is a code bug',
        conf: 0.88,
        sources: ['CloudWatch', 'RDS', 'GitHub'],
        body: "The pool is at 98% (CloudWatch), so the tool times out — and it loops because the handler returns 200 on empty instead of 404 (your code).",
        actions: [{ label: 'See the code', key: 'see-code' }],
      },
      {
        key: 'recommends-fixes',
        status: 'Recommends',
        statusColor: 'blue',
        title: "Two fixes — both yours to make",
        sources: ['PagerDuty'],
        body: "Cap retries (runtime), raise the pool (infra), and fix 200-on-empty (code). I can't touch any of them. Paging on-call now.",
        actions: [
          { label: 'Page on-call', key: 'page-oncall' },
          { label: 'Open the notebook', key: 'open-notebook' },
        ],
      },
    ],
  },
  3: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: "<strong>244 of 247</strong> healthy. But <strong>1 finding</strong> needs your call — I investigated and couldn't decide it.",
    findings: [
      {
        key: 'needs-you-billing',
        status: 'Needs you',
        statusColor: 'red',
        title: 'billing-agent may be inventing dollar figures',
        sources: ['OpenSearch · eval'],
        body: 'Groundedness dropped to 0.58. The answers read fine, but citations stopped matching the source. This is customer-facing.',
        actions: [],
      },
      {
        key: 'found-causes',
        status: 'Found',
        statusColor: 'purple',
        title: "Two causes, and I can't separate them",
        body: "A prompt change yesterday lines up in time. A 26h-stale retrieval index also fits. I score them nearly even.",
        actions: [{ label: 'Open the notebook', key: 'open-notebook' }],
      },
      {
        key: 'recommends-tradeoff',
        status: 'Recommends',
        statusColor: 'blue',
        title: 'Deciding wrong is expensive',
        sources: ['PagerDuty'],
        body: "A rollback loses a day of tuning. A reindex takes the agent offline 20 minutes. That trade-off is yours.",
        actions: [{ label: 'Page the owner', key: 'page-owner' }],
      },
    ],
  },
  4: {
    statusColor: 'green',
    greeting: 'Hey hey, John!',
    summary: "<strong>All services healthy.</strong> A reasoning regression is worth a look — <strong>3 findings</strong>, none of them an outage.",
    findings: [
      {
        key: 'found-tool-selection',
        status: 'Found',
        statusColor: 'purple',
        title: 'The orchestrator picks the wrong tool more often',
        conf: 0.84,
        sources: ['OpenSearch · eval'],
        body: 'Tool-selection accuracy fell from 0.71 to 0.58 this week. Not an outage — a quality slip in the reasoning.',
        actions: [{ label: 'See the query', key: 'see-query' }],
      },
      {
        key: 'watching-infra',
        status: 'Watching',
        statusColor: 'gray',
        title: 'Infra is clean',
        sources: ['CloudWatch'],
        body: "Every golden signal is green. This lives in the model's choices, not the stack — so don't go looking there.",
        actions: [],
      },
      {
        key: 'recommends-investigation',
        status: 'Recommends',
        statusColor: 'blue',
        title: 'I can run a deeper read',
        body: "Which agent path regressed, lined up against the prompt deploy. It's read-only — say the word.",
        actions: [{ label: 'Run the investigation', key: 'run-investigation' }],
      },
    ],
  },
  5: {
    statusColor: 'amber',
    greeting: 'Hey hey, John!',
    summary: "<strong>Healthy</strong>, but a familiar loop is back — <strong>2 findings</strong>, and the real fix is yours to ship.",
    findings: [
      {
        key: 'found-pattern',
        status: 'Found',
        statusColor: 'purple',
        title: 'Same loop, every time',
        conf: 0.90,
        sources: ['OpenSearch · patterns', 'incident history'],
        body: "Across five traces this month, same signature: web-fetch returns 200 with an empty body, the agent retries forever. I matched it against the prior four.",
        actions: [{ label: 'See the pattern', key: 'see-pattern' }],
      },
      {
        key: 'recommends-code-change',
        status: 'Recommends',
        statusColor: 'blue',
        title: 'The real fix is a code change',
        sources: ['GitHub'],
        body: "The upstream returns 200 instead of 404, or the agent mishandles empty. Both are yours. I'd open a notebook and file the issue.",
        actions: [
          { label: 'Open the notebook', key: 'open-notebook' },
          { label: 'File the issue', key: 'file-issue' },
        ],
      },
    ],
  },
};

// ─── Status pill component ─────────────────────────────────────────────────────

const STATUS_COLORS = {
  teal: { color: '#0F766E', bg: 'rgba(15, 118, 110, 0.10)' },
  green: { color: '#1F9D6B', bg: 'rgba(31, 157, 107, 0.10)' },
  purple: { color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.10)' },
  gray: { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.08)' },
  amber: { color: '#B45309', bg: 'rgba(180, 83, 9, 0.10)' },
  red: { color: '#DC2626', bg: 'rgba(220, 38, 38, 0.10)' },
  blue: { color: '#2563EB', bg: 'rgba(37, 99, 235, 0.10)' },
};

const StatusPill = ({ status, color }) => {
  const scheme = STATUS_COLORS[color] || STATUS_COLORS.gray;
  return (
    <span
      className="v5Scenario__statusPill"
      style={{ color: scheme.color, backgroundColor: scheme.bg }}>
      {status}
    </span>
  );
};

// ─── Status dot for greeting ───────────────────────────────────────────────────

const StatusDot = ({ color }) => {
  const dotColors = {
    green: '#22c55e',
    red: '#ef4444',
    amber: '#f59e0b',
  };
  return (
    <span
      className="v5Scenario__statusDot"
      style={{ backgroundColor: dotColors[color] || dotColors.green }}
    />
  );
};

// ─── Jump-to chips ─────────────────────────────────────────────────────────────

const JUMP_TO_ITEMS = [
  { label: 'Logs', pageKey: 'logs', icon: 'navDiscover' },
  { label: 'Metrics', pageKey: 'metrics', icon: 'visArea' },
  { label: 'Dashboards', pageKey: 'dashboards', icon: 'navDashboards' },
  { label: 'Alerts', pageKey: 'alerts', icon: 'navAlerting' },
];

// ─── Scenario-specific right panel evidence ───────────────────────────────────

const PPLBlock = ({ lines, result }) => (
  <div className="v5Scenario__ppl">
    {lines.map((line, i) => <div key={i}>{line}</div>)}
    {result && <div className="v5Scenario__pplResult">→ {result}</div>}
  </div>
);

const TraceSpan = ({ indent = 0, tag, tagColor, name, meta, bad }) => (
  <div className={`v5Scenario__traceSpan${bad ? ' v5Scenario__traceSpan--bad' : ''}`} style={{ paddingLeft: indent * 20 }}>
    <span className={`v5Scenario__traceTag v5Scenario__traceTag--${tagColor}`}>{tag}</span>
    <span className="v5Scenario__traceSpanName">{name}</span>
    <span className="v5Scenario__traceSpanMeta">{meta}</span>
  </div>
);

const EvidenceCard = ({ title, children }) => (
  <div className="v5Scenario__evidenceCard">
    {title && <div className="v5Scenario__evidenceCardTitle">{title}</div>}
    {children}
  </div>
);

const MetricBox = ({ label, value, sub, color }) => (
  <div className="v5Scenario__metricBox">
    <span className="v5Scenario__metricBoxLabel">{label}</span>
    <span className="v5Scenario__metricBoxValue" style={color ? { color } : undefined}>{value}</span>
    {sub && <span className="v5Scenario__metricBoxSub">{sub}</span>}
  </div>
);

const ScenarioEvidence = ({ scenario }) => {
  switch (scenario) {
    case 1:
      return (
        <div className="v5Scenario__evidence">
          <div className="v5Scenario__evidenceTitle">Telemetry · read-only</div>
          <div className="v5Scenario__metricRow">
            <MetricBox label="Token spend · 24h" value="$1,284" sub="↑18%" color="#DC2626" />
            <MetricBox label="Groundedness" value="0.74" sub="sliding" color="#B45309" />
          </div>
          <EvidenceCard title="Golden signals">
            <div className="v5Scenario__metricRow">
              <MetricBox label="Throughput" value="9.7k" sub="req/min" />
              <MetricBox label="p99" value="180ms" sub="steady" />
              <MetricBox label="Errors" value="0.1%" sub="steady" color="#1F9D6B" />
            </div>
          </EvidenceCard>
        </div>
      );
    case 2:
      return (
        <div className="v5Scenario__evidence">
          <div className="v5Scenario__evidenceTitle">The trace · one trace_id</div>
          <EvidenceCard>
            <div className="v5Scenario__trace">
              <TraceSpan tag="invoke_agent" tagColor="accent" name="checkout-agent" meta="1,994 tokens" />
              <TraceSpan indent={1} tag="execute_tool" tagColor="tool" name="order-lookup" meta="200 + empty · ×1,994" bad />
              <TraceSpan indent={2} tag="http" tagColor="infra" name="order-service" meta="p99 2,340ms" bad />
              <TraceSpan indent={3} tag="db" tagColor="infra" name="order-db" meta="pool 98%" bad />
            </div>
            <div className="v5Scenario__traceId">trace_id a3f9…2c1 — agent and infra, one trace</div>
          </EvidenceCard>
          <EvidenceCard title="What found it">
            <PPLBlock
              lines={[
                'source=otel-traces gen_ai.agent.name="checkout-agent"',
                '| stats count by tool.name, http.status',
              ]}
              result="order-lookup · 1,994 calls returning 200 + empty"
            />
          </EvidenceCard>
        </div>
      );
    case 3:
      return (
        <div className="v5Scenario__evidence">
          <div className="v5Scenario__evidenceTitle">Both hypotheses · the queries I ran</div>
          <EvidenceCard>
            <div className="v5Scenario__hypothesis">
              <div className="v5Scenario__hypothesisHeader">
                <span>A — prompt change</span>
                <span className="v5Scenario__verdict">supported</span>
              </div>
              <PPLBlock
                lines={[
                  'source=deploys service="billing-agent"',
                  '| sort -@timestamp | head 1',
                ]}
                result="deploy 14:02 · groundedness dropped 14:10"
              />
            </div>
            <div className="v5Scenario__hypothesis">
              <div className="v5Scenario__hypothesisHeader">
                <span>B — stale retrieval index</span>
                <span className="v5Scenario__verdict">supported</span>
              </div>
              <PPLBlock
                lines={[
                  'source=retrieval-meta index="docs"',
                  '| stats max(reindex_age_h)',
                ]}
                result="26h since last reindex"
              />
            </div>
            <div className="v5Scenario__split">
              <strong>Both supported.</strong> Your call.
            </div>
          </EvidenceCard>
        </div>
      );
    case 4:
      return (
        <div className="v5Scenario__evidence">
          <div className="v5Scenario__evidenceTitle">Tool-selection accuracy · by path</div>
          <EvidenceCard title="This week">
            <div className="v5Scenario__metricRow">
              <MetricBox label="Accuracy" value="0.58" sub="↓ from 0.71" color="#DC2626" />
            </div>
          </EvidenceCard>
          <EvidenceCard title="Where it regressed">
            <div className="v5Scenario__pathBreakdown">
              <div className="v5Scenario__pathRow">
                <span className="v5Scenario__pathName">lookup</span>
                <span className="v5Scenario__pathBar"><span className="v5Scenario__pathFill" style={{ width: '51%', background: '#DC2626' }} /></span>
                <span className="v5Scenario__pathVal">0.51</span>
              </div>
              <div className="v5Scenario__pathRow">
                <span className="v5Scenario__pathName">route</span>
                <span className="v5Scenario__pathBar"><span className="v5Scenario__pathFill" style={{ width: '62%', background: '#B45309' }} /></span>
                <span className="v5Scenario__pathVal">0.62</span>
              </div>
              <div className="v5Scenario__pathRow">
                <span className="v5Scenario__pathName">summarize</span>
                <span className="v5Scenario__pathBar"><span className="v5Scenario__pathFill" style={{ width: '69%', background: '#5B4FCF' }} /></span>
                <span className="v5Scenario__pathVal">0.69</span>
              </div>
            </div>
          </EvidenceCard>
        </div>
      );
    case 5:
      return (
        <div className="v5Scenario__evidence">
          <div className="v5Scenario__evidenceTitle">The pattern · five occurrences</div>
          <EvidenceCard title="Recurrence · 30 days">
            <PPLBlock
              lines={[
                'source=otel-traces gen_ai.agent.name="research-agent"',
                '| patterns tool.response | where pattern="empty"',
              ]}
              result="5 traces · identical loop signature"
            />
          </EvidenceCard>
          <EvidenceCard>
            <div className="v5Scenario__trace">
              <TraceSpan tag="invoke_agent" tagColor="accent" name="research-agent" meta="loops" />
              <TraceSpan indent={1} tag="execute_tool" tagColor="tool" name="web-fetch" meta="200 + empty" bad />
            </div>
          </EvidenceCard>
        </div>
      );
    default:
      return null;
  }
};

// ─── Main component ────────────────────────────────────────────────────────────

export const EmptySessionPageV5 = ({
  scenario = 1,
  onStartThread,
  onOpenPage,
  onOpenPageInNewSession,
  onSelectSession,
  onBrowseLibrary,
  sessions = [],
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [inputValue, setInputValue] = useState('');
  const [mascotExpression, setMascotExpression] = useState(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshingWidgets, setRefreshingWidgets] = useState(() => {
    const initial = {};
    ['top-services', 'connection-timeout', 'recent-alerts', 'deployment-timeline', 'resource-utilization'].forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });
  const [dataVariant, setDataVariant] = useState(0);
  const [widgetOrder] = useState([
    'top-services',
    'connection-timeout',
    'recent-alerts',
    'resource-utilization',
    'deployment-timeline',
  ]);
  const [widgetSizes] = useState({ 'deployment-timeline': 2 });

  const scenarioData = SCENARIOS[scenario] || SCENARIOS[1];

  // Staggered initial load for widgets
  useEffect(() => {
    const ids = ['top-services', 'connection-timeout', 'recent-alerts', 'deployment-timeline', 'resource-utilization'];
    const timers = ids.map((id) => {
      const delay = 1000 + Math.random() * 2000;
      return setTimeout(() => {
        setRefreshingWidgets((prev) => ({ ...prev, [id]: false }));
      }, delay);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (onStartThread) onStartThread(inputValue.trim());
      setInputValue('');
    }
  };

  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'top-services':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Top services by fault rate" />
            <div className="widgetCard__tableHeader">
              <span>SERVICE</span>
              <span>FAULT RATE</span>
            </div>
            <div className="widgetCard__rows">
              <div className="widgetCard__barRow" data-row="checkout" style={{ cursor: 'pointer' }} onClick={() => onSelectSession && onSelectSession('error-rate-spike-session')}>
                <span className="widgetCard__barLabel">checkout</span>
                <div className="widgetCard__barTrack"><div className="widgetCard__barFill" style={{ width: '67%' }} /></div>
                <span className="widgetCard__barValue">{dataVariant % 2 === 0 ? '66.67%' : '58.23%'}</span>
              </div>
              <div className="widgetCard__barRow" data-row="frontend" style={{ cursor: 'pointer' }} onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('app-perf-services', 'Frontend service')}>
                <span className="widgetCard__barLabel">frontend</span>
                <div className="widgetCard__barTrack"><div className="widgetCard__barFill widgetCard__barFill--secondary" style={{ width: dataVariant % 2 === 0 ? '14.5%' : '22%' }} /></div>
                <span className="widgetCard__barValue">{dataVariant % 2 === 0 ? '14.49%' : '21.88%'}</span>
              </div>
              <div className="widgetCard__barRow" data-row="frontend-proxy" style={{ cursor: 'pointer' }} onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('app-perf-services', 'Frontend-proxy service')}>
                <span className="widgetCard__barLabel">frontend-proxy</span>
                <div className="widgetCard__barTrack"><div className="widgetCard__barFill widgetCard__barFill--secondary" style={{ width: dataVariant % 2 === 0 ? '14.3%' : '11%' }} /></div>
                <span className="widgetCard__barValue">{dataVariant % 2 === 0 ? '14.29%' : '10.94%'}</span>
              </div>
              <div className="widgetCard__barRow" data-row="payment" style={{ cursor: 'pointer' }} onClick={() => onSelectSession && onSelectSession('latency-spike-session')}>
                <span className="widgetCard__barLabel">payment</span>
                <div className="widgetCard__barTrack"><div className="widgetCard__barFill widgetCard__barFill--secondary" style={{ width: dataVariant % 2 === 0 ? '8%' : '6%' }} /></div>
                <span className="widgetCard__barValue">{dataVariant % 2 === 0 ? '7.84%' : '5.91%'}</span>
              </div>
            </div>
          </OuiInsightCard>
        );
      case 'connection-timeout':
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('logs', 'Logs')}>
            <WidgetHeader title="Connection timeout errors" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">{dataVariant % 2 === 0 ? '847' : '923'}</span>
              <span className="widgetCard__trend widgetCard__trend--warning">{dataVariant % 2 === 0 ? '↑ 31%' : '↑ 34%'}</span>
            </div>
            <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 68, display: 'block', marginTop: 8 }}>
              <defs>
                <ChartTexture id="v5connStripe" variant="stripe" />
              </defs>
              <line x1="0" y1="8" x2="280" y2="8" stroke="#DD8A3A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.45" />
              <path d="M0,56 C50,55 90,53 130,47 C170,41 210,26 280,8 L280,68 L0,68 Z" fill="url(#v5connStripe)" />
              <path d="M0,56 C50,55 90,53 130,47 C170,41 210,26 280,8" fill="none" stroke="#DD8A3A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </OuiInsightCard>
        );
      case 'recent-alerts':
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('alerts', 'Alerts')}>
            <WidgetHeader title="Recent alerts" />
            <div className="widgetCard__tableHeader">
              <span>ALERT</span>
              <span>STATUS</span>
            </div>
            <div className="widgetCard__rows">
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">P99 latency breach</span>
                <span className="widgetCard__statusBadge widgetCard__statusBadge--critical">CRITICAL</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">Disk usage warning</span>
                <span className="widgetCard__statusBadge widgetCard__statusBadge--warning">WARNING</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">Error rate spike</span>
                <span className="widgetCard__statusBadge widgetCard__statusBadge--critical">CRITICAL</span>
              </div>
            </div>
          </OuiInsightCard>
        );
      case 'resource-utilization':
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('metrics', 'Metrics')}>
            <WidgetHeader title="Resource utilization" />
            <span style={{ fontSize: 22, fontWeight: 700, color: '#1F9D6B', letterSpacing: '-0.01em', marginBottom: 4, display: 'block' }}>56%</span>
            <svg viewBox="0 0 220 80" style={{ width: '100%', height: 80 }}>
              <line x1="30" y1="14" x2="210" y2="14" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
              <line x1="30" y1="38" x2="210" y2="38" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
              <line x1="30" y1="62" x2="210" y2="62" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
              <text x="22" y="17" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="end">50</text>
              <text x="22" y="41" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="end">25</text>
              <text x="22" y="65" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="end">0</text>
              <defs>
                <ChartTexture id="v5resStripe" variant="stripe" color="#1F9D6B" />
              </defs>
              <path d="M40,38 L75,34 L110,30 L145,32 L175,26 L195,24 L210,26 V62 H40 Z" fill="url(#v5resStripe)" />
              <polyline fill="none" stroke="#34d399" strokeWidth="3.2" strokeLinecap="round" points="40,38 75,34 110,30 145,32 175,26 195,24 210,26" />
              <circle cx="210" cy="26" r="3" fill="#34d399">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="40" y="74" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="middle">0m</text>
              <text x="125" y="74" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="middle">30m</text>
              <text x="210" y="74" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="middle">60m</text>
            </svg>
          </OuiInsightCard>
        );
      case 'deployment-timeline':
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('dashboards', 'Dashboards')}>
            <WidgetHeader title="Deployment timeline" />
            <div style={{ position: 'relative', background: 'rgba(255,255,255,0.32)', padding: '12px 14px 0', borderRadius: 4 }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, rgba(59,93,214,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,93,214,0.06) 1px, transparent 1px)', backgroundSize: '18px 16px', borderRadius: 'inherit' }} />
              <div style={{ position: 'relative', height: 92, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 53, borderTop: '1px dashed rgba(52,72,140,0.32)' }} />
                <div className="widgetCard__mono" style={{ position: 'absolute', left: 0, bottom: 55, fontSize: 8, letterSpacing: '0.1em', color: '#7B8FE6' }}>AVG 11</div>
                {[{v:8,h:38},{v:12,h:58},{v:15,h:72},{v:11,h:53},{v:9,h:43}].map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                    <span className="widgetCard__mono" style={{ fontSize: 9.5, fontWeight: 600, color: '#1F9D6B' }}>{d.v}</span>
                    <div style={{ width: '58%', height: d.h, background: '#2BA98A', borderRadius: 1 }} />
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: 'rgba(52,72,140,0.32)' }} />
              <div style={{ display: 'flex', gap: 16, padding: '6px 0 12px' }}>
                {['1-3','5-7','9-11','13-15','17-23'].map((l, i) => (
                  <div key={i} className="widgetCard__mono" style={{ flex: 1, textAlign: 'center', fontSize: 10 }}>{l}</div>
                ))}
              </div>
            </div>
          </OuiInsightCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="v5Scenario">
      <div className="v5Scenario__twoCol">
        {/* Left column */}
        <div className="v5Scenario__leftCol">
          {/* Mascot */}
          <div className="v5Scenario__mascotRow">
            <OuiToolTip content="Hi, I'm Olly" position="right">
              <div
                className="v5Scenario__mascotWrap"
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
            <StatusDot color={scenarioData.statusColor} />
          </div>

          {/* Greeting */}
          <OuiTitle size="m" className="v5Scenario__title">
            <h1>{scenarioData.greeting}</h1>
          </OuiTitle>
          <p className="v5Scenario__summary" dangerouslySetInnerHTML={{ __html: scenarioData.summary }} />

          {/* Input */}
          <div className="v5Scenario__inputArea">
            <SurroundShimmer>
              <div className="v5Scenario__inputField">
                <input
                  type="text"
                  className="v5Scenario__input"
                  placeholder="Ask Olly, or pick up an investigation..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleSubmit}
                  autoFocus
                />
                <div className="v5Scenario__inputButtons">
                  <OuiToolTip content="Send" position="top">
                    <OuiButtonIcon
                      iconType="sortUp"
                      aria-label="Send"
                      display="fill"
                      size="xs"
                      isDisabled={!inputValue.trim()}
                      onClick={() => {
                        if (inputValue.trim() && onStartThread) {
                          onStartThread(inputValue.trim());
                          setInputValue('');
                        }
                      }}
                    />
                  </OuiToolTip>
                </div>
              </div>
            </SurroundShimmer>
          </div>

          {/* Jump-to chips */}
          <div className="v5Scenario__jumpTo">
            <span className="v5Scenario__jumpToLabel">Jump to</span>
            {JUMP_TO_ITEMS.map((item) => (
              <button
                key={item.pageKey}
                type="button"
                className="v5Scenario__jumpToChip"
                onClick={() => onOpenPageInNewSession && onOpenPageInNewSession(item.pageKey, item.label)}>
                <OuiIcon type={item.icon} size="s" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="v5Scenario__rightCol">
          {/* Header: System Overview + actions */}
          <div className="v5Scenario__tabRow">
            <div className="v5Scenario__overviewTitleGroup">
              <span className="v5Scenario__overviewTitle">System Overview</span>
              <span className="v5Scenario__overviewStatus">
                <span className="v5Scenario__overviewStatusDot" />
                Updated 2m ago
              </span>
            </div>
            <div className="v5Scenario__tabRowActions">
              <OuiToolTip content="Refresh" position="left">
                <OuiButtonIcon
                  iconType="refresh"
                  aria-label="Refresh"
                  size="s"
                  color="text"
                  display="empty"
                  isDisabled={Object.values(refreshingWidgets).some(Boolean)}
                  onClick={() => {
                    const ids = ['top-services', 'connection-timeout', 'recent-alerts', 'deployment-timeline', 'resource-utilization'];
                    const updated = {};
                    ids.forEach((id) => { updated[id] = true; });
                    setRefreshingWidgets((prev) => ({ ...prev, ...updated }));
                    ids.forEach((id) => {
                      const delay = 1000 + Math.random() * 2000;
                      setTimeout(() => {
                        setRefreshingWidgets((prev) => ({ ...prev, [id]: false }));
                      }, delay);
                    });
                    setDataVariant((v) => v + 1);
                  }}
                />
              </OuiToolTip>
              <OuiToolTip content="Edit custom widgets" position="left">
                <OuiButtonIcon
                  iconType="controlsHorizontal"
                  aria-label="Edit custom widgets"
                  size="s"
                  color="text"
                  display="empty"
                  onClick={() => setIsEditMode(!isEditMode)}
                />
              </OuiToolTip>
            </div>
          </div>

          {/* All in one section: findings → evidence → correlated widgets → custom widgets */}
          <div className="v5Scenario__overviewContent">
            {/* Section: System findings */}
            <div className="v5Scenario__sectionEyebrow">System findings</div>
            {/* Findings */}
            <div className="v5Scenario__findings">
              {scenarioData.findings.map((finding) => (
                <div key={finding.key} className="v5Scenario__finding">
                  <div className="v5Scenario__findingHeader">
                    <StatusPill status={finding.status} color={finding.statusColor} />
                    <span className="v5Scenario__findingTitle">{finding.title}</span>
                  </div>
                  <p className="v5Scenario__findingBody">{finding.body}</p>
                  {/* Meta: confidence + sources */}
                  {(finding.conf || finding.sources) && (
                    <div className="v5Scenario__findingMeta">
                      {finding.conf && (
                        <span className="v5Scenario__confBadge">
                          conf {finding.conf.toFixed(2)}
                          <span className="v5Scenario__confBar">
                            <span className="v5Scenario__confFill" style={{ width: `${finding.conf * 100}%` }} />
                          </span>
                        </span>
                      )}
                      {finding.sources && finding.sources.map((s, i) => (
                        <span key={i} className="v5Scenario__sourceBadge">{s}</span>
                      ))}
                    </div>
                  )}
                  {finding.actions && finding.actions.length > 0 && (
                    <div className="v5Scenario__findingActions">
                      {finding.actions.map((action) => (
                        <button
                          key={action.key}
                          type="button"
                          className="v5Scenario__findingAction"
                          onClick={() => {
                            if (onStartThread) onStartThread(action.label);
                          }}>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Scenario-specific evidence */}
            <ScenarioEvidence scenario={scenario} />

            {/* Pinned widgets */}
            <div className="v5Scenario__sectionEyebrow">Pinned widgets</div>
            <div className="v5Scenario__widgetGrid">
              {widgetOrder.map((widgetId) => {
                const size = widgetSizes[widgetId] || 1;
                const wrapClass = `v5Scenario__widgetWrap${size >= 2 ? ' v5Scenario__widget--wide' : ''}`;
                return (
                  <div key={widgetId} className={wrapClass} data-widget={widgetId}>
                    {refreshingWidgets[widgetId] ? (
                      <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
                        <div style={{ visibility: 'hidden' }}>{renderWidget(widgetId)}</div>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
                          <div className="ouiInsightCard" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                            <ScanShimmerOverlay />
                          </div>
                        </div>
                      </div>
                    ) : renderWidget(widgetId)}
                  </div>
                );
              })}
            </div>

            {/* Custom widgets (bookmarked) */}
            <div className="v5Scenario__customWidgetsSection">
              <div className="v5Scenario__customWidgetsHeader">
                <span className="v5Scenario__customWidgetsLabel">Favorites</span>
              </div>
              <div className="v5Scenario__widgetGrid">
                <div className="v5Scenario__widgetWrap" data-widget="custom-1">
                  <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('dashboards', 'Payment pool health')}>
                    <div className="v5Scenario__customWidgetHeader">
                      <WidgetHeader title="Payment pool health" />
                      <OuiIcon type="starFilled" size="s" className="v5Scenario__bookmarkStar" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1F9D6B', display: 'block' }}>31%</span>
                    <span className="widgetCard__mono" style={{ fontSize: 10 }}>pool utilization · steady</span>
                  </OuiInsightCard>
                </div>
                <div className="v5Scenario__widgetWrap" data-widget="custom-2">
                  <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('metrics', 'Token spend')}>
                    <div className="v5Scenario__customWidgetHeader">
                      <WidgetHeader title="Token spend · 24h" />
                      <OuiIcon type="starFilled" size="s" className="v5Scenario__bookmarkStar" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#DC2626', display: 'block' }}>$1,284</span>
                    <span className="widgetCard__mono" style={{ fontSize: 10 }}>↑18% from yesterday</span>
                  </OuiInsightCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
