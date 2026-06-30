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
  useCallback,
  useContext,
  useEffect,
} from 'react';

import {
  OuiButtonIcon,
  OuiContextMenu,
  OuiIcon,
  OuiInsightCard,
  OuiPopover,
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
        title: 'Two anomalies — cold start + drift',
        widget: { type: 'status', label: '2 checked', color: '#0E6E52' },
        actions: [{ label: 'Details', key: 'see-queries' }],
      },
      {
        key: 'watching-groundedness',
        status: 'Watching',
        statusColor: 'gray',
        title: 'Groundedness 0.81→0.74, alert at 0.70',
        widget: { type: 'spark', label: '0.74', color: '#8A5A00' },
        actions: [{ label: 'Threshold', key: 'adjust-threshold' }],
      },
      {
        key: 'recommends-routing',
        status: 'Recommends',
        statusColor: 'blue',
        title: '38% simple intents → expensive model',
        widget: { type: 'bignum', value: '$410', delta: '↑18%', deltaColor: '#B5302E', sub: '/DAY' },
        actions: [{ label: 'Runbook', key: 'open-runbook' }],
      },
    ],
  },
  2: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: '<strong>Active incident</strong> — checkout-agent looping. <strong>1</strong> needs you now.',
    findings: [
      {
        key: 'traced-loop',
        status: 'Traced',
        statusColor: 'amber',
        title: 'order-lookup looping · 200+empty → retry',
        widget: { type: 'bignum', value: '1,994', delta: 'retries', deltaColor: '#B5302E', sub: '6 MIN' },
        actions: [{ label: 'Trace', key: 'open-trace' }],
      },
      {
        key: 'root-cause-pool',
        status: 'Root cause',
        statusColor: 'red',
        title: 'order-db 98% + handler returns 200 on miss',
        widget: { type: 'status', label: 'db 98%', color: '#B5302E' },
        actions: [{ label: 'Code', key: 'see-code' }],
      },
      {
        key: 'recommends-fixes',
        status: 'Recommends',
        statusColor: 'blue',
        title: 'Cap retries + raise pool + fix 200-on-empty',
        widget: { type: 'status', label: 'paged', color: '#8A5A00' },
        actions: [
          { label: 'Page', key: 'page-oncall' },
          { label: 'Notebook', key: 'open-notebook' },
        ],
      },
    ],
  },
  3: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: "<strong>1 finding</strong> needs your call. I can't decide it.",
    findings: [
      {
        key: 'needs-you-billing',
        status: 'Needs you',
        statusColor: 'red',
        title: 'billing-agent groundedness 0.58 · customer-facing',
        widget: { type: 'bignum', value: '0.58', delta: '', deltaColor: '#B5302E', sub: 'GROUND.' },
        actions: [],
      },
      {
        key: 'found-causes',
        status: 'Found',
        statusColor: 'purple',
        title: 'Prompt change or stale index · 0.52 vs 0.48',
        widget: { type: 'status', label: 'A 0.52 B 0.48', color: '#5A4FCF' },
        actions: [{ label: 'Notebook', key: 'open-notebook' }],
      },
      {
        key: 'recommends-tradeoff',
        status: 'Recommends',
        statusColor: 'blue',
        title: 'Rollback or reindex — trade-off is yours',
        widget: { type: 'status', label: '2 options', color: '#1A5DA8' },
        actions: [{ label: 'Page owner', key: 'page-owner' }],
      },
    ],
  },
  4: {
    statusColor: 'green',
    greeting: 'Hey hey, John!',
    summary: "<strong>All healthy.</strong> Reasoning regression worth a look.",
    findings: [
      {
        key: 'found-tool-selection',
        status: 'Found',
        statusColor: 'purple',
        title: 'Tool-selection accuracy 0.71→0.58 this week',
        widget: { type: 'bignum', value: '0.58', delta: '↓', deltaColor: '#B5302E', sub: 'ACCURACY' },
        actions: [{ label: 'Query', key: 'see-query' }],
      },
      {
        key: 'watching-infra',
        status: 'Watching',
        statusColor: 'gray',
        title: "Infra clean · all golden signals green",
        widget: { type: 'status', label: 'all green', color: '#0E6E52' },
        actions: [],
      },
      {
        key: 'recommends-investigation',
        status: 'Recommends',
        statusColor: 'blue',
        title: 'Per-path regression vs prompt deploy · read-only',
        widget: { type: 'status', label: 'read-only', color: '#1A5DA8' },
        actions: [{ label: 'Run it', key: 'run-investigation' }],
      },
    ],
  },
  5: {
    statusColor: 'amber',
    greeting: 'Hey hey, John!',
    summary: "<strong>Healthy</strong>, but a familiar loop is back. 5th time.",
    findings: [
      {
        key: 'found-pattern',
        status: 'Found',
        statusColor: 'purple',
        title: 'web-fetch 200+empty → retry loop · 5th occurrence',
        widget: { type: 'spark', label: '5th', color: '#8A5A00' },
        actions: [{ label: 'Pattern', key: 'see-pattern' }],
      },
      {
        key: 'recommends-code-change',
        status: 'Recommends',
        statusColor: 'blue',
        title: '200 on miss → should be 404 · your code',
        widget: { type: 'status', label: 'code · issue', color: '#8A5A00' },
        actions: [
          { label: 'Notebook', key: 'open-notebook' },
          { label: 'File issue', key: 'file-issue' },
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
      className="v6Scenario__statusPill"
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
      className="v6Scenario__statusDot"
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

const PAGE_BROWSER_ITEMS = [
  { label: 'Logs', pageKey: 'logs', icon: 'navDiscover' },
  { label: 'Metrics', pageKey: 'metrics', icon: 'visArea' },
  { label: 'Dashboards', pageKey: 'dashboards', icon: 'navDashboards' },
  { label: 'Alerts', pageKey: 'alerts', icon: 'navAlerting' },
  { label: 'Application Map', pageKey: 'app-map', icon: 'navServiceMap' },
  { label: 'Application Services', pageKey: 'app-perf-services', icon: 'navOverview' },
  { label: 'Application Traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Forecasting', pageKey: 'forecasting', icon: 'visLine' },
  { label: 'Agent traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Agent spans', pageKey: 'agent-spans', icon: 'visTagCloud' },
];

// ─── Scenario-specific right panel evidence ───────────────────────────────────

const PPLBlock = ({ lines, result }) => (
  <div className="v6Scenario__ppl">
    {lines.map((line, i) => <div key={i}>{line}</div>)}
    {result && <div className="v6Scenario__pplResult">→ {result}</div>}
  </div>
);

const TraceSpan = ({ indent = 0, tag, tagColor, name, meta, bad }) => (
  <div className={`v6Scenario__traceSpan${bad ? ' v6Scenario__traceSpan--bad' : ''}`} style={{ paddingLeft: indent * 20 }}>
    <span className={`v6Scenario__traceTag v6Scenario__traceTag--${tagColor}`}>{tag}</span>
    <span className="v6Scenario__traceSpanName">{name}</span>
    <span className="v6Scenario__traceSpanMeta">{meta}</span>
  </div>
);

const EvidenceCard = ({ title, children }) => (
  <div className="v6Scenario__evidenceCard">
    {title && <div className="v6Scenario__evidenceCardTitle">{title}</div>}
    {children}
  </div>
);

const MetricBox = ({ label, value, sub, color }) => (
  <div className="v6Scenario__metricBox">
    <span className="v6Scenario__metricBoxLabel">{label}</span>
    <span className="v6Scenario__metricBoxValue" style={color ? { color } : undefined}>{value}</span>
    {sub && <span className="v6Scenario__metricBoxSub">{sub}</span>}
  </div>
);

const FindingEvidence = ({ scenario, findingKey }) => {
  const evidenceMap = {
    1: {
      'investigated-anomalies': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <PPLBlock
              lines={[
                'source=otel-traces tool.name="search-tool"',
                '| stats p95(duration) by window',
              ]}
              result="spike isolated to one cold-start window"
            />
          </EvidenceCard>
          <EvidenceCard title="Outcome">
            <ul className="v6Scenario__evidenceList">
              <li>search-tool: cold start, recovered in 40s</li>
              <li>triage routing: drift returned to baseline on its own</li>
            </ul>
          </EvidenceCard>
        </div>
      ),
      'watching-groundedness': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <PPLBlock
              lines={[
                'source=eval-scores metric="groundedness" path="docs"',
                '| stats avg(score) by day',
              ]}
              result="0.81 -> 0.78 -> 0.74 . alert at 0.70"
            />
          </EvidenceCard>
        </div>
      ),
      'recommends-routing': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <PPLBlock
              lines={[
                'source=otel-traces gen_ai.operation.name="chat"',
                '| stats sum(gen_ai.usage.cost) by intent.class',
              ]}
              result="simple intents . $410/day on the expensive path"
            />
          </EvidenceCard>
        </div>
      ),
    },
    2: {
      'traced-loop': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <PPLBlock
              lines={[
                'source=otel-traces gen_ai.agent.name="checkout-agent"',
                '| stats count by tool.name, http.status',
              ]}
              result="order-lookup . 1,994 calls returning 200 + empty"
            />
          </EvidenceCard>
        </div>
      ),
      'root-cause-pool': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Trace tree">
            <div className="v6Scenario__trace">
              <TraceSpan tag="invoke_agent" tagColor="accent" name="checkout-agent" meta="looping" />
              <TraceSpan indent={1} tag="execute_tool" tagColor="tool" name="order-lookup" meta="200 + empty" bad />
              <TraceSpan indent={2} tag="http" tagColor="infra" name="order-service" meta="p99 2,340ms" bad />
              <TraceSpan indent={3} tag="db" tagColor="infra" name="order-db" meta="pool 98%" bad />
              <TraceSpan indent={3} tag="code" tagColor="infra" name="returns 200 on miss" meta="handler.go:88" bad />
            </div>
            <div className="v6Scenario__traceId">stitched from OpenSearch . CloudWatch . RDS . GitHub</div>
          </EvidenceCard>
        </div>
      ),
      'recommends-fixes': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Recommended fixes">
            <ul className="v6Scenario__evidenceList">
              <li>Cap order-lookup retries — runtime change</li>
              <li>Raise the order-db pool — infra change</li>
              <li>Return 404 on empty in handler.go:88 — code change</li>
            </ul>
          </EvidenceCard>
        </div>
      ),
    },
    3: {
      'needs-you-billing': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <PPLBlock
              lines={[
                'source=eval-scores agent="billing-agent"',
                '| stats avg(groundedness), avg(citation_match)',
              ]}
              result="groundedness 0.58 . citation match 0.31"
            />
          </EvidenceCard>
        </div>
      ),
      'found-causes': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <div className="v6Scenario__hypothesis">
              <div className="v6Scenario__hypothesisHeader">
                <span>A — prompt change</span>
                <span className="v6Scenario__verdict">conf 0.52</span>
              </div>
              <PPLBlock
                lines={[
                  'source=deploys service="billing-agent"',
                  '| sort -@timestamp | head 1',
                ]}
                result="deploy 14:02 . groundedness dropped 14:10"
              />
            </div>
            <div className="v6Scenario__hypothesis">
              <div className="v6Scenario__hypothesisHeader">
                <span>B — stale retrieval index</span>
                <span className="v6Scenario__verdict">conf 0.48</span>
              </div>
              <PPLBlock
                lines={[
                  'source=retrieval-meta index="docs"',
                  '| stats max(reindex_age_h)',
                ]}
                result="26h since last reindex"
              />
            </div>
            <div className="v6Scenario__split">
              <strong>0.52 vs 0.48</strong> — neither clears the bar. Your call.
            </div>
          </EvidenceCard>
        </div>
      ),
      'recommends-tradeoff': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Trade-offs">
            <ul className="v6Scenario__evidenceList">
              <li>Roll back the prompt — loses a day of tuning, fast</li>
              <li>Reindex docs — takes the agent offline ~20 min</li>
              <li>Either fixes it if it is that cause; only you can weigh which</li>
            </ul>
          </EvidenceCard>
        </div>
      ),
    },
    4: {
      'found-tool-selection': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Accuracy this week">
            <div className="v6Scenario__metricRow">
              <MetricBox label="Accuracy" value="0.58" sub="down from 0.71" color="#DC2626" />
            </div>
          </EvidenceCard>
          <EvidenceCard title="Path breakdown">
            <div className="v6Scenario__pathBreakdown">
              <div className="v6Scenario__pathRow">
                <span className="v6Scenario__pathName">lookup</span>
                <span className="v6Scenario__pathBar"><span className="v6Scenario__pathFill" style={{ width: '51%', background: '#DC2626' }} /></span>
                <span className="v6Scenario__pathVal">0.51</span>
              </div>
              <div className="v6Scenario__pathRow">
                <span className="v6Scenario__pathName">route</span>
                <span className="v6Scenario__pathBar"><span className="v6Scenario__pathFill" style={{ width: '62%', background: '#B45309' }} /></span>
                <span className="v6Scenario__pathVal">0.62</span>
              </div>
              <div className="v6Scenario__pathRow">
                <span className="v6Scenario__pathName">summarize</span>
                <span className="v6Scenario__pathBar"><span className="v6Scenario__pathFill" style={{ width: '69%', background: '#5B4FCF' }} /></span>
                <span className="v6Scenario__pathVal">0.69</span>
              </div>
            </div>
          </EvidenceCard>
        </div>
      ),
      'watching-infra': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Golden signals">
            <div className="v6Scenario__metricRow">
              <MetricBox label="Throughput" value="9.6k" sub="steady" />
              <MetricBox label="p99" value="175ms" sub="steady" />
              <MetricBox label="Errors" value="0.1%" sub="steady" color="#1F9D6B" />
            </div>
          </EvidenceCard>
        </div>
      ),
      'recommends-investigation': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Suggested steps">
            <ul className="v6Scenario__evidenceList">
              <li>Correlate the per-path accuracy drop to the prompt deploy window</li>
              <li>Pull the tool-selection traces for the lookup path</li>
              <li>Produce a notebook — no changes, just evidence</li>
            </ul>
          </EvidenceCard>
        </div>
      ),
    },
    5: {
      'found-pattern': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Recurrence . 30 days">
            <PPLBlock
              lines={[
                'source=otel-traces gen_ai.agent.name="research-agent"',
                '| patterns tool.response | where pattern="empty"',
              ]}
              result="5 traces . identical loop signature"
            />
          </EvidenceCard>
        </div>
      ),
      'recommends-code-change': (
        <div className="v6Scenario__evidence">
          <EvidenceCard title="Recommended fixes">
            <ul className="v6Scenario__evidenceList">
              <li>Upstream should return 404 on miss, not 200 — owner: data team</li>
              <li>Or the agent should treat empty as terminal — client.ts:40</li>
              <li>This is the 5th symptomatic patch — file it once</li>
            </ul>
          </EvidenceCard>
        </div>
      ),
    },
  };

  const scenarioEvidence = evidenceMap[scenario];
  if (!scenarioEvidence) return null;
  const content = scenarioEvidence[findingKey];
  if (!content) return null;
  return content;
};

// ─── Main component ────────────────────────────────────────────────────────────

export const EmptySessionPageV6 = ({
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
  const [rightPanelWidth, setRightPanelWidth] = useState(50);
  const resizeRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [showPageBrowser, setShowPageBrowser] = useState(false);
  const [pageBrowserSearch, setPageBrowserSearch] = useState('');
  const [expandedFindings, setExpandedFindings] = useState(() => new Set());
  const [refreshingWidgets, setRefreshingWidgets] = useState(() => {
    const initial = {};
    ['connection-timeout', 'recent-alerts', 'resource-utilization', 'saved-queries', 'dashboards', 'deployment-timeline'].forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });
  const [dataVariant, setDataVariant] = useState(0);
  const [widgetOrder, setWidgetOrder] = useState([
    'connection-timeout',
    'recent-alerts',
    'resource-utilization',
    'saved-queries',
    'dashboards',
    'deployment-timeline',
  ]);
  const [widgetSizes, setWidgetSizes] = useState({});

  const scenarioData = SCENARIOS[scenario] || SCENARIOS[1];

  // Staggered initial load for widgets
  useEffect(() => {
    const ids = ['connection-timeout', 'recent-alerts', 'resource-utilization', 'saved-queries', 'dashboards', 'deployment-timeline'];
    const timers = ids.map((id) => {
      const delay = 1000 + Math.random() * 2000;
      return setTimeout(() => {
        setRefreshingWidgets((prev) => ({ ...prev, [id]: false }));
      }, delay);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const toggleFinding = (key) => {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    const twoCol = e.target.closest('.v6Scenario__twoCol');
    if (!twoCol) return;
    const startX = e.clientX;
    const startWidth = rightPanelWidth;
    const totalWidth = twoCol.getBoundingClientRect().width;

    const onMove = (ev) => {
      const delta = startX - ev.clientX;
      const pctDelta = (delta / totalWidth) * 100;
      const next = Math.min(70, Math.max(25, startWidth + pctDelta));
      setRightPanelWidth(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [rightPanelWidth]);

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
      case 'saved-queries':
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('logs', 'Logs')}>
            <WidgetHeader title="Saved queries" />
            <div className="widgetCard__rows">
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">5xx by service</span>
                <OuiIcon type="search" size="s" style={{ opacity: 0.4 }} />
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">{"Slow traces > 2s"}</span>
                <OuiIcon type="search" size="s" style={{ opacity: 0.4 }} />
              </div>
            </div>
          </OuiInsightCard>
        );
      case 'dashboards':
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('dashboards', 'Dashboards')}>
            <WidgetHeader title="Dashboards" />
            <div className="widgetCard__rows">
              {[
                { name: 'Service overview', points: '0,14 15,12 30,10 45,11 60,9' },
                { name: 'p99 latency', points: '0,8 15,10 30,14 45,12 60,16' },
                { name: 'Error rate by service', points: '0,10 15,8 30,6 45,9 60,7' },
                { name: 'Connection pool health', points: '0,12 15,11 30,13 45,10 60,8' },
              ].map((item) => (
                <div key={item.name} className="widgetCard__statusRow">
                  <span className="widgetCard__statusLabel">{item.name}</span>
                  <svg viewBox="0 0 60 20" style={{ width: 48, height: 16, flexShrink: 0 }}>
                    <polyline points={item.points} fill="none" stroke="#1F9D6B" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
          </OuiInsightCard>
        );
      case 'deployment-timeline':
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('dashboards', 'Dashboards')}>
            <WidgetHeader title="Deploys" />
            <div style={{ position: 'relative', height: 60, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, rgba(59,93,214,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,93,214,0.06) 1px, transparent 1px)', backgroundSize: '14px 12px' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%', padding: '0 2px' }}>
                {[8,12,15,11,9].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                    <div style={{ width: '60%', height: `${(v / 16) * 100}%`, background: '#2BA98A', borderRadius: 1 }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="widgetCard__mono" style={{ fontSize: 8, marginTop: 3 }}>avg 11/wk</div>
          </OuiInsightCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="v6Scenario">
      <div className="v6Scenario__twoCol">
        {/* Left column */}
        <div className="v6Scenario__leftCol">
          {/* Mascot */}
          <div className="v6Scenario__mascotRow">
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
            <StatusDot color={scenarioData.statusColor} />
          </div>

          {/* Greeting */}
          <OuiTitle size="m" className="v6Scenario__title">
            <h1>{scenarioData.greeting}</h1>
          </OuiTitle>
          <p className="v6Scenario__summary" dangerouslySetInnerHTML={{ __html: scenarioData.summary }} />

          {/* Input */}
          <div className="v6Scenario__inputArea">
            <SurroundShimmer>
              <div className="emptySessionPage__inputField">
                <textarea
                  className="v6Scenario__textarea"
                  placeholder="Ask AI anything, or type to search a page"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleSubmit}
                  rows={3}
                  autoFocus
                />
                <div className="emptySessionPage__inputActions">
                  <OuiPopover
                    button={
                      <OuiButtonIcon
                        iconType="plus"
                        aria-label="Add attachment"
                        size="xs"
                        color="text"
                        onClick={() => setIsAttachMenuOpen((open) => !open)}
                      />
                    }
                    isOpen={isAttachMenuOpen}
                    closePopover={() => setIsAttachMenuOpen(false)}
                    anchorPosition="upLeft"
                    panelPaddingSize="s">
                    <OuiContextMenu
                      initialPanelId={0}
                      panels={[
                        {
                          id: 0,
                          items: [
                            { name: 'Upload data', icon: 'importAction', onClick: () => setIsAttachMenuOpen(false) },
                            { name: 'Upload file or photo', icon: 'document', onClick: () => setIsAttachMenuOpen(false) },
                            { name: 'Take screenshot', icon: 'fullScreen', onClick: () => setIsAttachMenuOpen(false) },
                            { name: 'Add to session', icon: 'folderOpen', onClick: () => setIsAttachMenuOpen(false) },
                          ],
                        },
                      ]}
                    />
                  </OuiPopover>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <OuiButtonIcon
                      iconType={() => (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><rect x="9" y="2" width="6" height="13" rx="3" />
                        </svg>
                      )}
                      aria-label="Dictate"
                      size="xs"
                      color="text"
                      display="empty"
                    />
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
                  </div>
                </div>
              </div>
            </SurroundShimmer>
          </div>

          {/* Jump-to chips */}
          <div className="v6Scenario__jumpTo">
            <span className="v6Scenario__jumpToLabel">Jump to</span>
            {JUMP_TO_ITEMS.map((item) => (
              <button
                key={item.pageKey}
                type="button"
                className="v6Scenario__jumpToChip"
                onClick={() => onOpenPageInNewSession && onOpenPageInNewSession(item.pageKey, item.label)}>
                <OuiIcon type={item.icon} size="s" />
                <span>{item.label}</span>
              </button>
            ))}
            <OuiToolTip content="More" position="top">
              <button
                type="button"
                className="v6Scenario__jumpToChip v6Scenario__jumpToChip--round"
                onClick={() => setShowPageBrowser(true)}>
                <OuiIcon type="plusInCircle" size="s" />
              </button>
            </OuiToolTip>
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="v6Scenario__resizeHandle"
          onMouseDown={handleResizeMouseDown}
          ref={resizeRef}
        />

        {/* Right column */}
        <div
          className="v6Scenario__rightCol"
          style={{ flex: `0 0 ${rightPanelWidth}%` }}>
          {/* Header: title + actions */}
          <div className="v6Scenario__tabRow">
            <div className="v6Scenario__overviewTitleGroup">
              <span className="v6Scenario__overviewTitle">{showPageBrowser ? 'Open a page' : 'Overview'}</span>
              {!showPageBrowser && (
                <span className="v6Scenario__overviewStatus">
                  <span className="v6Scenario__overviewStatusDot" />
                  Updated 2m ago
                </span>
              )}
            </div>
            {!showPageBrowser && (
            <div className="v6Scenario__tabRowActions">
              <OuiToolTip content="Refresh" position="left">
                <OuiButtonIcon
                  iconType="refresh"
                  aria-label="Refresh"
                  size="s"
                  color="text"
                  display="empty"
                  isDisabled={Object.values(refreshingWidgets).some(Boolean)}
                  onClick={() => {
                    const ids = ['connection-timeout', 'recent-alerts', 'resource-utilization', 'saved-queries', 'dashboards', 'deployment-timeline'];
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
              {isEditMode ? (
                <button
                  type="button"
                  className="v6Scenario__doneButton"
                  onClick={() => setIsEditMode(false)}>
                  Done
                </button>
              ) : (
                <OuiToolTip content="Edit widgets" position="left">
                  <OuiButtonIcon
                    iconType="controlsHorizontal"
                    aria-label="Edit widgets"
                    size="s"
                    color="text"
                    display="empty"
                    onClick={() => setIsEditMode(true)}
                  />
                </OuiToolTip>
              )}
            </div>
            )}
          </div>

          {showPageBrowser ? (
            <div className="v6Scenario__pageBrowser">
              <div className="v6Scenario__pageBrowserHeader">
                <div className="v6Scenario__pageBrowserSearch">
                  <OuiIcon type="search" size="s" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={pageBrowserSearch}
                    onChange={(e) => setPageBrowserSearch(e.target.value)}
                    className="v6Scenario__pageBrowserInput"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  className="v6Scenario__pageBrowserClose"
                  onClick={() => { setShowPageBrowser(false); setPageBrowserSearch(''); }}>
                  <OuiIcon type="cross" size="m" />
                </button>
              </div>
              <div className="v6Scenario__pageBrowserGrid">
                {PAGE_BROWSER_ITEMS
                  .filter((item) => !pageBrowserSearch || item.label.toLowerCase().includes(pageBrowserSearch.toLowerCase()))
                  .map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      className="v6Scenario__pageBrowserItem"
                      onClick={() => {
                        onOpenPageInNewSession && onOpenPageInNewSession(item.pageKey, item.label);
                        setShowPageBrowser(false);
                        setPageBrowserSearch('');
                      }}>
                      <OuiIcon type={item.icon} size="l" />
                      <span>{item.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          ) : (
          <>
          {/* All in one section: findings → evidence → correlated widgets → custom widgets */}
          <div className="v6Scenario__overviewContent">
            {/* Findings */}
            <div className="v6Scenario__findings">
              {scenarioData.findings.map((finding) => {
                const isExpanded = expandedFindings.has(finding.key);
                return (
                  <div key={finding.key} className={`v6Scenario__findingCard${isExpanded ? ' v6Scenario__findingCard--expanded' : ''}`}>
                    <div className="v6Scenario__findingCardMain" onClick={() => toggleFinding(finding.key)} style={{ cursor: 'pointer' }}>
                      <div className="v6Scenario__findingCardLeft">
                        <div className="v6Scenario__findingHeader">
                          <StatusPill status={finding.status} color={finding.statusColor} />
                          <span className="v6Scenario__findingTitle">{finding.title}</span>
                        </div>
                      </div>
                      {/* Right-side widget + chevron */}
                      <div className="v6Scenario__findingCardRight">
                        {finding.widget && finding.widget.type === 'status' && (
                          <div className="v6Scenario__findingWidget">
                            <span className="v6Scenario__fwDot" style={{ background: finding.widget.color }} />
                            <span className="v6Scenario__fwLabel">{finding.widget.label}</span>
                          </div>
                        )}
                        {finding.widget && finding.widget.type === 'spark' && (
                          <div className="v6Scenario__findingWidget">
                            <svg viewBox="0 0 60 20" className="v6Scenario__fwSpark">
                              <polyline points="0,4 15,6 30,8 45,12 60,18" fill="none" stroke={finding.widget.color} strokeWidth="2" />
                            </svg>
                            <span className="v6Scenario__fwSubLabel">{finding.widget.label}</span>
                          </div>
                        )}
                        {finding.widget && finding.widget.type === 'bignum' && (
                          <div className="v6Scenario__findingWidget">
                            <span className="v6Scenario__fwBignum">{finding.widget.value}</span>
                            {finding.widget.delta && (
                              <span className="v6Scenario__fwDelta" style={{ color: finding.widget.deltaColor }}>{finding.widget.delta}</span>
                            )}
                            {finding.widget.sub && (
                              <span className="v6Scenario__fwSubLabel">{finding.widget.sub}</span>
                            )}
                          </div>
                        )}
                        <OuiIcon type="arrowDown" size="s" className={`v6Scenario__findingChevron${isExpanded ? ' v6Scenario__findingChevron--expanded' : ''}`} />
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="v6Scenario__findingCardBody">
                        <FindingEvidence scenario={scenario} findingKey={finding.key} />
                        {finding.actions && finding.actions.length > 0 && (
                          <div className="v6Scenario__findingActions">
                            {finding.actions.map((action) => (
                              <button
                                key={action.key}
                                type="button"
                                className="v6Scenario__findingAction"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onStartThread) onStartThread(action.label);
                                }}>
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pinned widgets (favorites) */}
            <div className={`v6Scenario__widgetGrid${isEditMode ? ' v6Scenario__widgetGrid--editing' : ''}`}>
              {widgetOrder.map((widgetId) => {
                const size = widgetSizes[widgetId] || 1;
                const wrapClass = `v6Scenario__widgetWrap v6Scenario__widget--span${size}`;
                return (
                  <div key={widgetId} className={wrapClass} data-widget={widgetId}>
                    {isEditMode && (
                      <>
                        <button
                          type="button"
                          className="v6Scenario__widgetRemove"
                          aria-label="Remove widget"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWidgetOrder((prev) => prev.filter((id) => id !== widgetId));
                          }}>
                          <OuiIcon type="cross" size="s" />
                        </button>
                        <span
                          className="v6Scenario__widgetExpand"
                          aria-label="Drag to resize"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const startX = e.clientX;
                            const startSize = widgetSizes[widgetId] || 1;
                            const gridEl = e.target.closest('.v6Scenario__widgetGrid');
                            const colWidth = gridEl ? gridEl.clientWidth / 3 : 100;
                            const onMove = (ev) => {
                              const dx = ev.clientX - startX;
                              const colsDelta = Math.round(dx / colWidth);
                              const newSize = Math.max(1, Math.min(3, startSize + colsDelta));
                              setWidgetSizes((prev) => ({ ...prev, [widgetId]: newSize }));
                            };
                            const onUp = () => {
                              document.removeEventListener('mousemove', onMove);
                              document.removeEventListener('mouseup', onUp);
                              document.body.style.cursor = '';
                            };
                            document.body.style.cursor = 'nwse-resize';
                            document.addEventListener('mousemove', onMove);
                            document.addEventListener('mouseup', onUp);
                          }}>
                          <OuiIcon type="grab" size="s" />
                        </span>
                      </>
                    )}
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

          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};
