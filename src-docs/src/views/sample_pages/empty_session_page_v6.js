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
  useLayoutEffect,
  useMemo,
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

const SurroundShimmer = ({ children, hide }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const fieldRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  if (hide) return <div style={{ width: '100%' }}>{children}</div>;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const isMobile = window.innerWidth <= 768;
    const SP = isMobile ? 5 : 7;
    const SPEED = isMobile ? 0.08 : 0.04;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return null;
      sizeRef.current = { w, h };
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.round((w - SP) / SP));
      const rows = Math.max(1, Math.round((h - SP) / SP));
      const ox = (w - (cols - 1) * SP) / 2, oy = (h - (rows - 1) * SP) / 2;
      const dots = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          dots.push({ x: ox + i * SP, y: oy + j * SP, gx: i, gy: j, r: Math.random() });
      const field = { ctx, w, h, sp: SP, dots, cx: w / 2, cy: h / 2 };
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
        const sph = (t * SPEED) % 1;
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

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      // Rebuild if container resized
      const w = cv.clientWidth, h = cv.clientHeight;
      if (w !== sizeRef.current.w || h !== sizeRef.current.h) {
        fieldRef.current = build();
      }
      if (fieldRef.current) draw(fieldRef.current, t);
      rafRef.current = requestAnimationFrame(tick);
    };

    let timeout = setTimeout(() => {
      fieldRef.current = build();
      rafRef.current = requestAnimationFrame(tick);
    }, 100);

    return () => { clearTimeout(timeout); cancelAnimationFrame(rafRef.current); };
  }, []);

  const isMobileShimmer = typeof window !== 'undefined' && window.innerWidth <= 768;
  const hPad = isMobileShimmer ? 20 : 42;
  const vPad = isMobileShimmer ? 20 : 36;

  return (
    <div style={{ position: 'relative', padding: `${vPad}px ${hPad}px`, margin: `-${vPad}px -${hPad}px`, maxHeight: 200, alignSelf: 'center' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, maskImage: `radial-gradient(ellipse ${isMobileShimmer ? '55%' : '80%'} 80% at 50% 50%, black ${isMobileShimmer ? '30%' : '40%'}, transparent 100%)`, WebkitMaskImage: `radial-gradient(ellipse ${isMobileShimmer ? '55%' : '80%'} 80% at 50% 50%, black ${isMobileShimmer ? '30%' : '40%'}, transparent 100%)` }} />
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

    // Field is rebuilt from the canvas's actual size so the shimmer fills the
    // card to its edges regardless of width/height changes (resize-aware).
    const field = { ctx: null, dots: [], w: 0, h: 0, span: 0, band: 0 };
    const sp = 7;
    const speed = 0.2; // sweep speed
    const cycle = 1.35; // >1 leaves a brief calm gap between sweeps

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.round((w - sp) / sp));
      const rows = Math.max(1, Math.round((h - sp) / sp));
      const ox = (w - (cols - 1) * sp) / 2;
      const oy = (h - (rows - 1) * sp) / 2;
      const dots = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          dots.push({ x: ox + i * sp, y: oy + j * sp });
      field.ctx = ctx;
      field.dots = dots;
      field.w = w;
      field.h = h;
      field.span = w + h * 0.6;
      field.band = sp * 3.6;
    };

    // Diagonal sweep across the tile so it reads as a graceful, sequential
    // wave rather than a flat horizontal bar, plus a gentle per-dot twinkle.
    const tick = (now) => {
      const { ctx, dots, w, h, span, band } = field;
      if (ctx) {
        if (!startRef.current) startRef.current = now;
        const t = (now - startRef.current) / 1000;
        ctx.clearRect(0, 0, w, h);
        const p = (t * speed) % cycle;
        const lx = p * span;
        for (const d of dots) {
          const proj = d.x + d.y * 0.6; // diagonal projection
          const dx = (proj - lx) / band;
          const wave = Math.exp(-dx * dx);
          const tw = 0.5 + 0.5 * Math.sin(t * 1.5 + (d.x + d.y) * 0.055);
          const b = 0.03 + 0.9 * wave * (0.72 + 0.28 * tw);
          const a = (0.05 + 0.4 * b).toFixed(3);
          const gray = Math.round(140 + 70 * b);
          ctx.beginPath();
          ctx.arc(d.x, d.y, 0.6 + b * 1.5, 0, 6.2832);
          ctx.fillStyle = `rgba(${gray},${gray},${Math.round(gray + 12)},${a})`;
          ctx.fill();
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    let ro;
    const startTimer = setTimeout(() => {
      build();
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(build);
        ro.observe(cv);
      }
      rafRef.current = requestAnimationFrame(tick);
    }, 50);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(rafRef.current);
      if (ro) ro.disconnect();
    };
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

export const SCENARIOS = {
  1: {
    statusColor: 'green',
    greeting: 'Good morning, John!',
    summary: '<strong>244 of 247</strong> services healthy. Two anomalies resolved themselves overnight.',
    findings: [
      {
        key: 'resolved-anomalies',
        status: 'Resolved',
        statusColor: 'green',
        title: 'Two anomalies flagged overnight — both recovered on their own',
        widget: { type: 'status', label: 'recovered', color: '#0E6E52' },
        actions: [{ label: 'View details', key: 'see-queries' }],
        insight:
          "Both anomalies self-recovered before hitting any alert threshold — search-tool from a 03:14 cold start (back in 40s) and triage-routing from a brief 04:22 drift. No customer impact and nothing to action; I'll keep watching in case the pattern repeats.",
      },
      {
        key: 'warning-groundedness',
        status: 'Warning',
        statusColor: 'amber',
        title: 'Groundedness drifting toward alert threshold (0.74, alerts at 0.70)',
        widget: { type: 'spark', label: '0.74', color: '#8A5A00' },
        actions: [{ label: 'See trend', key: 'see-trend' }, { label: 'Adjust threshold', key: 'adjust-threshold' }],
        insight:
          'Groundedness has slid from 0.81 to 0.74 over the past week and is trending toward the 0.70 alert line — roughly two days out at the current rate. The decline tracks with recent retrieval changes; tightening the retrieval filter or refreshing the index should pull it back before the alert fires.',
      },
      {
        key: 'info-routing',
        status: 'Review',
        statusColor: 'blue',
        title: '38% of simple queries hitting the expensive model — costs up 18%',
        widget: { type: 'bignum', value: '$410', delta: '↑18%', deltaColor: 'var(--g-danger)', sub: '/DAY' },
        actions: [{ label: 'Open runbook', key: 'open-runbook' }],
        insight:
          'About 38% of simple queries are being routed to the expensive model, pushing daily cost to $410 (up 18% from $347). These could route to the lighter model with no measurable quality loss — the runbook has the exact routing rules to apply.',
      },
    ],
  },
  2: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: '<strong>Active incident</strong> — checkout-agent is looping. Immediate action needed.',
    findings: [
      {
        key: 'critical-loop',
        status: 'Critical',
        statusColor: 'red',
        title: 'checkout-agent is looping — 1,994 retries in the last 6 minutes',
        widget: { type: 'bignum', value: '1,994', delta: 'retries', deltaColor: 'var(--g-danger)', sub: '6 MIN' },
        actions: [{ label: 'Investigate', key: 'investigate' }],
        insight:
          'checkout-agent has retried order-lookup 1,994 times in 6 minutes because the call returns 200 with an empty body, which the agent reads as "try again." Customer checkout is degraded and the loop is still active — capping retries will stop the bleeding immediately while we fix the root cause.',
      },
      {
        key: 'critical-root-cause',
        status: 'Critical',
        statusColor: 'red',
        title: 'Root cause: order-db pool at 98%, handler returns 200 on empty',
        widget: { type: 'status', label: 'db 98%', color: 'var(--g-danger)' },
        actions: [{ label: 'View code', key: 'see-code' }, { label: 'View traces', key: 'open-trace' }],
        insight:
          'The trace runs from checkout-agent down to order-db at 98% pool utilization, and handler.go:88 returns 200 on an empty result instead of a 404. Raising the pool relieves the pressure, but the durable fix is correcting the 200-on-empty response so the agent stops retrying.',
      },
      {
        key: 'info-fixes',
        status: 'Review',
        statusColor: 'blue',
        title: 'Three fixes available: cap retries, raise pool, fix 200-on-empty',
        widget: { type: 'status', label: '3 fixes', color: '#1A5DA8' },
        actions: [
          { label: 'Page oncall', key: 'page-oncall' },
          { label: 'Open notebook', key: 'open-notebook' },
        ],
        insight:
          "There are three fixes, fastest to most durable: cap retries (runtime config, stops it now), raise the db pool (infra, prevents exhaustion under load), and fix the 200-on-empty handler (code, removes the trigger). I'd apply the retry cap immediately and schedule the handler fix.",
      },
    ],
  },
  3: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: '<strong>billing-agent</strong> is giving inaccurate answers to customers. I need your decision.',
    findings: [
      {
        key: 'critical-billing',
        status: 'Critical',
        statusColor: 'red',
        title: 'billing-agent accuracy dropped to 0.58 — customers are affected',
        widget: { type: 'bignum', value: '0.58', delta: '↓0.23', deltaColor: 'var(--g-danger)', sub: 'SCORE' },
        actions: [{ label: 'Investigate', key: 'investigate' }],
        insight:
          'billing-agent accuracy fell to 0.58 (down 0.23) right after today\'s 14:02 deploy, and 340 customer conversations are already affected. Groundedness dropped to 0.58 and citation match to 0.31 — the sharp, deploy-aligned drop points to a change in that release rather than gradual drift.',
      },
      {
        key: 'warning-causes',
        status: 'Warning',
        statusColor: 'amber',
        title: 'Two possible causes — prompt change vs stale index (52% / 48% likely)',
        widget: { type: 'status', label: '52 / 48', color: '#8A5A00' },
        actions: [{ label: 'Compare', key: 'open-notebook' }],
        insight:
          "I've narrowed it to two causes: the 14:02 prompt change (52% likely) which removed citation instructions, or a stale retrieval index (48%) that hasn't refreshed in 26 hours. The timing favors the prompt change, but neither is conclusive without your input.",
      },
      {
        key: 'info-tradeoff',
        status: 'Review',
        statusColor: 'blue',
        title: 'Rollback the prompt (fast, loses tuning) or reindex (20 min offline)',
        widget: { type: 'status', label: '2 options', color: '#1A5DA8' },
        actions: [{ label: 'Rollback now', key: 'rollback' }, { label: 'Page owner', key: 'page-owner' }],
        insight:
          'Two paths forward: roll back the prompt (fast, but loses today\'s tuning work) or reindex the docs (~20 min offline, but preserves the new prompt). Either resolves it if it\'s the actual cause — the trade-off is speed versus keeping the tuning, and only you can weigh that.',
      },
    ],
  },
  4: {
    statusColor: 'green',
    greeting: 'Good morning, John!',
    summary: '<strong>All services healthy.</strong> One quality regression worth reviewing.',
    findings: [
      {
        key: 'warning-tool-selection',
        status: 'Warning',
        statusColor: 'amber',
        title: 'Tool-selection accuracy dropped from 0.71 to 0.58 this week',
        widget: { type: 'bignum', value: '0.58', delta: '↓18%', deltaColor: 'var(--g-danger)', sub: 'ACCURACY' },
        actions: [{ label: 'Investigate', key: 'investigate' }],
        insight:
          'Tool-selection accuracy dropped from 0.71 to 0.58 this week while every infrastructure signal stayed clean — so this is a quality regression, not an outage. The timing lines up with Tuesday\'s prompt deploy, which is the first place I\'d look.',
      },
      {
        key: 'resolved-infra',
        status: 'Resolved',
        statusColor: 'green',
        title: 'Infrastructure is clean — all golden signals normal',
        widget: { type: 'status', label: 'all green', color: '#0E6E52' },
        actions: [],
      },
      {
        key: 'info-next-steps',
        status: 'Review',
        statusColor: 'blue',
        title: 'Likely correlated with Tuesday\'s prompt deploy — read-only analysis ready',
        widget: { type: 'status', label: 'ready', color: '#1A5DA8' },
        actions: [{ label: 'Run analysis', key: 'run-investigation' }],
        insight:
          "This most likely correlates with Tuesday's prompt deploy. A read-only analysis comparing pre- and post-deploy tool-selection traces is ready to run — it won't touch production and should confirm whether the deploy is responsible.",
      },
    ],
  },
  5: {
    statusColor: 'amber',
    greeting: 'Hey John,',
    summary: '<strong>Services healthy</strong>, but a familiar issue is back — 5th time in 30 days.',
    findings: [
      {
        key: 'warning-pattern',
        status: 'Warning',
        statusColor: 'amber',
        title: 'research-agent retry loop triggered again — same pattern as last 4 times',
        widget: { type: 'spark', label: '5th', color: '#8A5A00' },
        actions: [{ label: 'See pattern', key: 'see-pattern' }],
        insight:
          'research-agent has hit this exact retry loop 5 times in 30 days: it calls web-fetch, the upstream returns 200 with an empty body, and the agent reads that as "not done yet" and retries. It\'s the identical signature as the last four incidents — each was patched individually, never at the root.',
      },
      {
        key: 'info-root-cause',
        status: 'Review',
        statusColor: 'blue',
        title: 'Upstream returns 200 on empty instead of 404 — needs a permanent fix',
        widget: { type: 'status', label: 'code fix', color: '#1A5DA8' },
        actions: [
          { label: 'File issue', key: 'file-issue' },
          { label: 'Open notebook', key: 'open-notebook' },
        ],
        insight:
          "The durable fix is upstream: the data team's endpoint should return 404 on a miss instead of 200. As a stopgap, treating an empty 200 as terminal in client.ts:40 would break the loop now. This is the 5th symptomatic patch — filing an issue with the data team is what stops the recurrence.",
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
  red: { color: 'var(--g-danger)', bg: 'var(--g-danger-soft)' },
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

// ─── Dot countdown ring ───────────────────────────────────────────────────────

const DOT_COUNT = 12;
const RING_DURATION = 5000;

const DotCountdownRing = ({ startTime }) => {
  const [dotsRemaining, setDotsRemaining] = useState(DOT_COUNT);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DOT_COUNT - Math.floor((elapsed / RING_DURATION) * DOT_COUNT));
      setDotsRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, RING_DURATION / DOT_COUNT);
    return () => clearInterval(interval);
  }, [startTime]);

  const dots = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const angle = (i / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = 7 + Math.cos(angle) * 5;
    const y = 7 + Math.sin(angle) * 5;
    const isActive = i < dotsRemaining;
    dots.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={isActive ? 1 : 0.6}
        fill="currentColor"
        opacity={isActive ? 0.7 : 0.15}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      className="v6Scenario__dotCountdownRing">
      {dots}
    </svg>
  );
};

// ─── Jump-to chips ─────────────────────────────────────────────────────────────

const JUMP_TO_ITEMS = [
  { label: 'Alerts', pageKey: 'alerts', icon: 'navAlerting' },
  { label: 'Dashboards', pageKey: 'dashboards', icon: 'navDashboards' },
  { label: 'Logs', pageKey: 'logs', icon: 'navDiscover' },
  { label: 'Metrics', pageKey: 'metrics', icon: 'visArea' },
];

// Pages surfaced in the "More" popover under the Jump-to pills — everything
// that isn't already shown as a pill above, grouped like the left-nav menu.
const JUMP_TO_MORE_GROUPS = [
  {
    key: 'general',
    label: null,
    items: [
      { label: 'Topology map', pageKey: 'app-map', icon: 'navAiFlow' },
    ],
  },
  {
    key: 'agent-monitoring',
    label: 'Agent monitoring',
    items: [
      { label: 'Traces', pageKey: 'app-traces', icon: 'visTable' },
      { label: 'Spans', pageKey: 'agent-spans', icon: 'visTagCloud' },
    ],
  },
  {
    key: 'app-perf',
    label: 'Application performance',
    items: [
      { label: 'Traces', pageKey: 'traces', icon: 'apmTrace' },
      { label: 'Services', pageKey: 'app-perf-services', icon: 'navServices' },
      { label: 'SLOs', pageKey: 'app-services', icon: 'visGauge' },
    ],
  },
  {
    key: 'more',
    label: 'More',
    items: [
      { label: 'Notebooks', pageKey: 'notebooks', icon: 'document' },
      { label: 'Anomaly Detection', pageKey: 'anomaly-dashboard', icon: 'anomalyDetection' },
      { label: 'Forecasting', pageKey: 'forecasters', icon: 'visLine' },
      { label: 'Alerting', pageKey: 'alerts-detail', icon: 'navAlerting' },
    ],
  },
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

const WIDGET_CATALOG = [
  { id: 'connection-timeout', label: 'Connection timeout errors', icon: 'visLine' },
  { id: 'recent-alerts', label: 'Recent alerts', icon: 'navAlerting' },
  { id: 'resource-utilization', label: 'Resource utilization', icon: 'visArea' },
  { id: 'saved-queries', label: 'Saved queries', icon: 'search' },
  { id: 'dashboards', label: 'Dashboards', icon: 'navDashboards' },
  { id: 'deployment-timeline', label: 'Deploys', icon: 'visBarVertical' },
  { id: 'top-services', label: 'Top services by fault rate', icon: 'visBarHorizontal' },
  { id: 'p99-latency', label: 'P99 latency', icon: 'visLine' },
  { id: 'error-rate', label: 'Error rate by service', icon: 'visArea' },
  { id: 'throughput', label: 'Throughput', icon: 'visLine' },
  { id: 'active-incidents', label: 'Active incidents', icon: 'alert' },
  { id: 'slo-compliance', label: 'SLO compliance', icon: 'checkInCircleFilled' },
  { id: 'cost-today', label: 'Cost today', icon: 'currency' },
  { id: 'stale-answer-rate', label: 'Stale answer rate', icon: 'machineLearningApp' },
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

// Smoothly animates its content open/closed by measuring the content height.
// Expand eases out (decelerates); collapse eases in (accelerates). Uses the Web
// Animations API for clean scheduling and cancels in-flight runs on rapid toggle,
// with a compositor-friendly fade/slide on the content for a smoother reveal.
const CollapsibleBody = ({ expanded, children }) => {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);
  const didInit = React.useRef(false);
  const animsRef = React.useRef([]);

  React.useLayoutEffect(() => {
    const el = outerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return undefined;

    // First render: set the resting state with no animation.
    if (!didInit.current) {
      didInit.current = true;
      el.style.height = expanded ? 'auto' : '0px';
      inner.style.opacity = expanded ? '1' : '0';
      inner.style.transform = expanded ? 'none' : 'translateY(-4px)';
      return undefined;
    }

    // Capture the current visual height first (so mid-animation toggles continue
    // from where they are), then stop any running animations.
    const from = el.getBoundingClientRect().height;
    animsRef.current.forEach((a) => a.cancel());
    animsRef.current = [];

    const to = expanded ? inner.offsetHeight : 0;

    // Commit the resting end-state; the animations drive the visuals while running.
    el.style.height = expanded ? 'auto' : '0px';
    inner.style.opacity = expanded ? '1' : '0';
    inner.style.transform = expanded ? 'none' : 'translateY(-4px)';

    const heightEasing = expanded
      ? 'cubic-bezier(0.22, 1, 0.36, 1)' // ease-out — quick, then settles gently
      : 'cubic-bezier(0.4, 0, 1, 1)';    // ease-in — eases in, accelerates out
    const duration = expanded ? 360 : 260;

    const heightAnim = el.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration, easing: heightEasing, fill: 'backwards' }
    );

    const fadeAnim = inner.animate(
      expanded
        ? [
            { opacity: 0, transform: 'translateY(-4px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ]
        : [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-4px)' },
          ],
      {
        duration: expanded ? 300 : 200,
        easing: expanded ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.4, 0, 1, 1)',
        fill: 'backwards',
      }
    );

    animsRef.current = [heightAnim, fadeAnim];
    const clear = () => { animsRef.current = []; };
    heightAnim.addEventListener('finish', clear);

    return () => heightAnim.removeEventListener('finish', clear);
  }, [expanded]);

  return (
    <div
      ref={outerRef}
      className="v6Scenario__findingCardBodyWrap"
      aria-hidden={!expanded}
      style={{ overflow: 'hidden', height: 0 }}>
      <div
        ref={innerRef}
        className="v6Scenario__findingCardBodyInner"
        style={{ opacity: 0, willChange: 'opacity, transform' }}>
        {children}
      </div>
    </div>
  );
};

const FindingEvidence = ({ scenario, findingKey }) => {
  const evidenceMap = {
    1: {
      'resolved-anomalies': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I checked the last 6 hours of traces. Two spikes stood out:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>search-tool</strong> — cold start at 03:14, recovered in 40s. No user impact.</li>
            <li><strong>triage-routing</strong> — brief drift at 04:22, returned to baseline on its own.</li>
          </ul>
          <p className="v6Scenario__evidenceText">No action needed. Both resolved before any alert threshold.</p>
        </div>
      ),
      'warning-groundedness': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Groundedness scores over the past 7 days:</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="7 days ago" value="0.81" />
              <MetricBox label="3 days ago" value="0.78" />
              <MetricBox label="Today" value="0.74" color="#B45309" />
              <MetricBox label="Alert at" value="0.70" color="var(--g-danger)" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">At this rate, the alert will fire in ~2 days unless the trend reverses.</p>
        </div>
      ),
      'info-routing': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I analyzed cost by intent complexity over the past 24 hours:</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Simple intents" value="38%" sub="routed to GPT-4" color="#B45309" />
              <MetricBox label="Daily cost" value="$410" sub="up from $347" color="var(--g-danger)" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">These could route to the lighter model with no quality loss. The runbook has the routing rules.</p>
        </div>
      ),
    },
    2: {
      'critical-loop': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">checkout-agent has called <code>order-lookup</code> 1,994 times in 6 minutes. Each call returns 200 with an empty body, so the agent retries indefinitely.</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Calls" value="1,994" color="var(--g-danger)" />
              <MetricBox label="Duration" value="6 min" />
              <MetricBox label="Status" value="200" sub="empty body" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">Customer-facing checkout is degraded. The loop is ongoing.</p>
        </div>
      ),
      'critical-root-cause': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I traced it from the agent down to the database:</p>
          <EvidenceCard>
            <div className="v6Scenario__trace">
              <TraceSpan tag="agent" tagColor="accent" name="checkout-agent" meta="looping" />
              <TraceSpan indent={1} tag="tool" tagColor="tool" name="order-lookup" meta="200 + empty" bad />
              <TraceSpan indent={2} tag="http" tagColor="infra" name="order-service" meta="p99 2,340ms" bad />
              <TraceSpan indent={3} tag="db" tagColor="infra" name="order-db" meta="pool 98%" bad />
              <TraceSpan indent={3} tag="code" tagColor="infra" name="handler.go:88" meta="returns 200 on miss" bad />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">The database pool is nearly exhausted, and the handler returns 200 even when no record is found — the agent interprets this as "try again."</p>
        </div>
      ),
      'info-fixes': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Three fixes, from fastest to most permanent:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>Cap retries</strong> — runtime config change, stops the bleeding immediately</li>
            <li><strong>Raise db pool</strong> — infra change, prevents pool exhaustion under load</li>
            <li><strong>Fix handler.go:88</strong> — return 404 on empty, eliminates the root cause</li>
          </ul>
        </div>
      ),
    },
    3: {
      'critical-billing': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">billing-agent&apos;s accuracy dropped sharply after today&apos;s 14:02 deploy:</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Groundedness" value="0.58" sub="was 0.81" color="var(--g-danger)" />
              <MetricBox label="Citation match" value="0.31" sub="was 0.72" color="var(--g-danger)" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">The agent is giving customers billing answers that don&apos;t match source documents. 340 conversations affected so far.</p>
        </div>
      ),
      'warning-causes': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I narrowed it to two possible causes:</p>
          <EvidenceCard>
            <div className="v6Scenario__hypothesis">
              <div className="v6Scenario__hypothesisHeader">
                <span>A — Prompt change at 14:02</span>
                <span className="v6Scenario__verdict">52% likely</span>
              </div>
              <p className="v6Scenario__evidenceText">Scores dropped 8 minutes after the deploy. The new prompt removes citation instructions.</p>
            </div>
            <div className="v6Scenario__hypothesis">
              <div className="v6Scenario__hypothesisHeader">
                <span>B — Stale retrieval index</span>
                <span className="v6Scenario__verdict">48% likely</span>
              </div>
              <p className="v6Scenario__evidenceText">The docs index hasn&apos;t been refreshed in 26 hours. New billing policies aren&apos;t in the index.</p>
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">Neither hypothesis is conclusive — I can&apos;t rule one out without your input.</p>
        </div>
      ),
      'info-tradeoff': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Two paths forward:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>Rollback the prompt</strong> — fast, but loses today&apos;s tuning work</li>
            <li><strong>Reindex docs</strong> — takes the agent offline ~20 min, but preserves the new prompt</li>
          </ul>
          <p className="v6Scenario__evidenceText">Either fixes it if that&apos;s the actual cause. Only you can weigh the trade-off.</p>
        </div>
      ),
    },
    4: {
      'warning-tool-selection': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Tool-selection accuracy by path this week:</p>
          <EvidenceCard>
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
          <p className="v6Scenario__evidenceText">The lookup path is the worst performer. It correlates with Tuesday&apos;s prompt deploy window.</p>
        </div>
      ),
      'resolved-infra': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Throughput" value="9.6k" sub="steady" />
              <MetricBox label="p99" value="175ms" sub="steady" />
              <MetricBox label="Errors" value="0.1%" sub="steady" color="#1F9D6B" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">All golden signals are normal. This is a model/prompt issue, not infrastructure.</p>
        </div>
      ),
      'info-next-steps': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I prepared a read-only analysis that will:</p>
          <ul className="v6Scenario__evidenceList">
            <li>Correlate the per-path accuracy drop to the prompt deploy window</li>
            <li>Pull tool-selection traces for the lookup path</li>
            <li>Produce a notebook with findings — no changes, just evidence</li>
          </ul>
        </div>
      ),
    },
    5: {
      'warning-pattern': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">This is the 5th time in 30 days that research-agent has entered this retry loop. Same pattern every time:</p>
          <ul className="v6Scenario__evidenceList">
            <li>Agent calls web-fetch for a resource</li>
            <li>Upstream returns 200 with empty body</li>
            <li>Agent interprets this as "not done yet" and retries</li>
          </ul>
          <p className="v6Scenario__evidenceText">Each occurrence was patched individually. The underlying cause has never been fixed.</p>
        </div>
      ),
      'info-root-cause': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">The fix needs to happen upstream:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>Upstream (data team)</strong> — should return 404 on miss, not 200</li>
            <li><strong>Client workaround</strong> — treat empty 200 as terminal in client.ts:40</li>
          </ul>
          <p className="v6Scenario__evidenceText">This is the 5th symptomatic patch. Filing an issue to the data team would prevent recurrence.</p>
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

// ─── Finding widget (right-side status dot / sparkline / big number) ────────────
// Extracted so the home greeting and the chat session render identical widgets.
// `idPrefix` keeps SVG pattern ids unique when the same finding is rendered in
// more than one place on the page.
export const FindingWidget = ({ finding, idPrefix = 'sc' }) => {
  const w = finding.widget;
  if (!w) return null;

  if (w.type === 'status') {
    return (
      <div className="v6Scenario__findingWidget">
        <span className="v6Scenario__fwDot" style={{ background: w.color }} />
        <span className="v6Scenario__fwLabel">{w.label}</span>
      </div>
    );
  }

  if (w.type === 'spark') {
    const patternId = `spark-stripe-${idPrefix}-${finding.key}`;
    return (
      <div className="v6Scenario__findingWidget">
        <svg viewBox="0 0 60 20" className="v6Scenario__fwSpark">
          <defs>
            <pattern id={patternId} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="4" stroke={w.color} strokeWidth="1" opacity="0.35" />
            </pattern>
          </defs>
          <path d="M0,4 L15,6 L30,8 L45,12 L60,18 L60,20 L0,20 Z" fill={`url(#${patternId})`} />
          <polyline points="0,4 15,6 30,8 45,12 60,18" fill="none" stroke={w.color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="v6Scenario__fwSubLabel">{w.label}</span>
      </div>
    );
  }

  if (w.type === 'bignum') {
    return (
      <div className="v6Scenario__findingWidget">
        <span className="v6Scenario__fwBignum">{w.value}</span>
        {w.delta && (
          <span className="v6Scenario__fwDelta" style={{ color: w.deltaColor }}>{w.delta}</span>
        )}
        {w.sub && <span className="v6Scenario__fwSubLabel">{w.sub}</span>}
      </div>
    );
  }

  return null;
};

// ─── Reusable expandable finding card ───────────────────────────────────────────
// Self-contained (manages its own expand + feedback state) so it can be dropped
// into the chat session and render the same warnings, with the same expand
// behavior and evidence, as the home greeting.
export const ScenarioFindingCard = ({
  finding,
  scenario,
  idPrefix = 'sc',
  onAction,
  showFeedback = true,
  initialExpanded = false,
  hideActions = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [feedback, setFeedback] = useState(null);

  return (
    <div
      className={`v6Scenario__findingCard${isExpanded ? ' v6Scenario__findingCard--expanded' : ''}`}
      onClick={() => setIsExpanded((v) => !v)}>
      <div className="v6Scenario__findingCardMain">
        <div className="v6Scenario__findingCardLeft">
          <div className="v6Scenario__findingHeader">
            <StatusPill status={finding.status} color={finding.statusColor} />
            <span className="v6Scenario__findingTitle">{finding.title}</span>
          </div>
        </div>
        <div className="v6Scenario__findingCardRight">
          <FindingWidget finding={finding} idPrefix={idPrefix} />
          <OuiIcon
            type="arrowDown"
            size="s"
            className={`v6Scenario__findingChevron${isExpanded ? ' v6Scenario__findingChevron--expanded' : ''}`}
          />
        </div>
      </div>
      {showFeedback && (
        <div className={`v6Scenario__findingActions__side${isExpanded ? ' v6Scenario__findingActions__side--visible' : ''}`}>
          {isExpanded && (
            <>
              <button
                type="button"
                className={`v6Scenario__findingSideBtn${feedback === 'up' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                aria-label="Helpful"
                onClick={(e) => { e.stopPropagation(); setFeedback((f) => (f === 'up' ? null : 'up')); }}>
                <OuiIcon type="thumbsUp" size="s" />
              </button>
              <button
                type="button"
                className={`v6Scenario__findingSideBtn${feedback === 'down' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                aria-label="Not helpful"
                onClick={(e) => { e.stopPropagation(); setFeedback((f) => (f === 'down' ? null : 'down')); }}>
                <OuiIcon type="thumbsDown" size="s" />
              </button>
            </>
          )}
        </div>
      )}
      <CollapsibleBody expanded={isExpanded}>
        <div className="v6Scenario__findingCardBody">
          <FindingEvidence scenario={scenario} findingKey={finding.key} />
          {!hideActions && finding.actions && finding.actions.length > 0 && (
            <div className="v6Scenario__findingActions">
              {finding.actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className="v6Scenario__findingAction"
                  tabIndex={isExpanded ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAction) onAction(action.label, action.key);
                  }}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </CollapsibleBody>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export const EmptySessionPageV6 = ({
  scenario: scenarioProp,
  onStartThread,
  onFindingAction,
  onOpenPage,
  onOpenPageInNewSession,
  onJumpToPage,
  onSelectSession,
  onBrowseLibrary,
  onOpenMobileNav,
  layout,
  sessions = [],
}) => {
  const isSingleColumn = layout === 'single-column';
  // Use the caller-provided scenario when present so the greeting matches the
  // chat session that follows; otherwise pick one at random.
  const [scenario] = useState(
    () => scenarioProp || Math.floor(Math.random() * 5) + 1
  );
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [inputValue, setInputValue] = useState('');
  const [mascotExpression, setMascotExpression] = useState(undefined);
  const [rightPanelWidth, setRightPanelWidth] = useState(40);
  const resizeRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [widgetPickerSearch, setWidgetPickerSearch] = useState('');
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [showPageBrowser, setShowPageBrowser] = useState(false);
  const [pageBrowserSearch, setPageBrowserSearch] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState(() => new Set());
  const [dismissedFindings, setDismissedFindings] = useState({});
  const [removedFindings, setRemovedFindings] = useState(() => new Set());
  const [feedbackFindings, setFeedbackFindings] = useState({});
  const dismissTimersRef = useRef({});
  const [refreshingWidgets, setRefreshingWidgets] = useState(() => {
    const initial = {};
    ['connection-timeout', 'recent-alerts', 'resource-utilization', 'saved-queries', 'dashboards', 'deployment-timeline'].forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });
  // Widgets stay idle (no loading shimmer) until the left panel has fully loaded.
  const [widgetsArmed, setWidgetsArmed] = useState(false);
  const [dataVariant, setDataVariant] = useState(0);
  const [widgetOrder, setWidgetOrder] = useState([
    'connection-timeout',
    'recent-alerts',
    'resource-utilization',
    'top-services',
    'dashboards',
    'deployment-timeline',
  ]);
  const [widgetSizes, setWidgetSizes] = useState({});
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [findingsLoaded, setFindingsLoaded] = useState(0);

  // Smoothly animate the findings container's height as cards load in, so the
  // space between the summary and the input opens up gracefully.
  const findingsRef = useRef(null);
  const prevFindingsHeightRef = useRef(null);
  useLayoutEffect(() => {
    const el = findingsRef.current;
    if (!el) return undefined;
    el.style.height = 'auto';
    const target = el.scrollHeight;
    const prev = prevFindingsHeightRef.current;
    prevFindingsHeightRef.current = target;
    if (prev == null || prev === target) return undefined;
    el.style.overflow = 'hidden';
    el.style.height = `${prev}px`;
    void el.offsetHeight; // force reflow so the transition runs
    el.style.height = `${target}px`;
    const timer = setTimeout(() => {
      if (!el) return;
      el.style.height = 'auto';
      el.style.overflow = '';
    }, 460);
    return () => clearTimeout(timer);
  }, [findingsLoaded, summaryLoading]);

  const scenarioData = SCENARIOS[scenario] || SCENARIOS[1];

  // Shared agentic load schedule so widgets can start after the left side settles.
  const loadSchedule = useMemo(() => {
    const summaryDelay = isSingleColumn ? 600 : (1000 + Math.random() * 2000);
    const findingCount = scenarioData.findings.length;
    const findingDelays = [];
    for (let i = 0; i < findingCount; i++) {
      const findingGap = isSingleColumn ? (600 + Math.random() * 400) : (1000 + Math.random() * 1500);
      findingDelays.push(summaryDelay + (isSingleColumn ? 1000 : 800) + (i * findingGap));
    }
    // Time at which the last finding has appeared (plus its entrance animation).
    const leftDoneTime = (findingDelays.length ? Math.max(...findingDelays) : summaryDelay) + 440;
    return { summaryDelay, findingDelays, leftDoneTime };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Staggered agentic loading: summary first, then findings one by one
  useEffect(() => {
    const summaryTimer = setTimeout(() => {
      setSummaryLoading(false);
    }, loadSchedule.summaryDelay);

    const findingTimers = loadSchedule.findingDelays.map((delay) =>
      setTimeout(() => {
        setFindingsLoaded((prev) => prev + 1);
      }, delay)
    );

    return () => {
      clearTimeout(summaryTimer);
      findingTimers.forEach(clearTimeout);
    };
  }, []);

  // Widgets stay idle until the entire left panel has loaded, then begin their
  // own shimmer-load sequence and reveal one by one.
  useEffect(() => {
    const ids = ['connection-timeout', 'recent-alerts', 'resource-utilization', 'saved-queries', 'dashboards', 'deployment-timeline'];
    // Arm (start the loading shimmer) once the left side is fully loaded.
    const armAt = loadSchedule.leftDoneTime + 400;
    const armTimer = setTimeout(() => setWidgetsArmed(true), armAt);
    // Hold the shimmer briefly so it reads as "loading", then reveal, staggered.
    const revealBase = armAt + 700;
    const timers = ids.map((id, i) => {
      const delay = revealBase + (i * (280 + Math.random() * 320));
      return setTimeout(() => {
        setRefreshingWidgets((prev) => ({ ...prev, [id]: false }));
      }, delay);
    });
    return () => {
      clearTimeout(armTimer);
      timers.forEach(clearTimeout);
    };
  }, []);

  const toggleFinding = (key) => {
    if (key in dismissedFindings) return;
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

  const dismissFinding = (key) => {
    const dismissedAt = Date.now();
    setDismissedFindings((prev) => ({ ...prev, [key]: dismissedAt }));
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    dismissTimersRef.current[key] = setTimeout(() => {
      setRemovedFindings((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setDismissedFindings((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      delete dismissTimersRef.current[key];
    }, 5000);
  };

  const undoDismissFinding = (key) => {
    if (dismissTimersRef.current[key]) {
      clearTimeout(dismissTimersRef.current[key]);
      delete dismissTimersRef.current[key];
    }
    setDismissedFindings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setFeedback = (key, direction) => {
    setFeedbackFindings((prev) => {
      if (prev[key] === direction) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: direction };
    });
  };

  // Collapsible body for a finding card. Always rendered so it can smoothly
  // animate open (ease-out) and closed (ease-in) via a measured height transition.
  const renderFindingBody = (finding, isExpanded) => (
    <CollapsibleBody expanded={isExpanded}>
      <div className="v6Scenario__findingCardBody">
        <FindingEvidence scenario={scenario} findingKey={finding.key} />
        {finding.actions && finding.actions.length > 0 && (
          <div className="v6Scenario__findingActions">
            {finding.actions.map((action) => (
              <button
                key={action.key}
                type="button"
                className="v6Scenario__findingAction"
                tabIndex={isExpanded ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation();
                  // Starting from a callout opens a new session scoped to just
                  // this finding (with a related canvas page). Fall back to a
                  // plain thread if no finding-action handler is wired.
                  if (onFindingAction) onFindingAction(finding, action);
                  else if (onStartThread) onStartThread(action.label);
                }}>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </CollapsibleBody>
  );

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

  const buildInsightsContext = () => {
    const loadedFindings = scenarioData.findings.slice(0, findingsLoaded);
    if (!loadedFindings.length) return null;
    const lines = loadedFindings.map((f) => `• **${f.status}**: ${f.title}`);
    return `${scenarioData.summary.replace(/<[^>]+>/g, '')}\n\n${lines.join('\n')}`;
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (onStartThread) onStartThread(inputValue.trim(), buildInsightsContext());
      setInputValue('');
    }
  };

  // Per-scenario widget data
  const WIDGET_DATA = {
    1: {
      timeout: { value: '847', trend: '↑ 31%', curve: 'M0,52 C50,50 90,46 130,40 C170,34 210,20 280,8', fill: 'M0,52 C50,50 90,46 130,40 C170,34 210,20 280,8 L280,68 L0,68 Z' },
      alerts: [
        { name: 'P99 latency breach', status: 'CRITICAL' },
        { name: 'Disk usage warning', status: 'WARNING' },
        { name: 'Error rate spike', status: 'CRITICAL' },
      ],
      utilization: { value: '56%', curve: 'M0,34 C50,32 90,30 140,28 C180,26 220,24 280,26', fill: 'M0,34 C50,32 90,30 140,28 C180,26 220,24 280,26 L280,68 L0,68 Z' },
      services: [
        { name: 'checkout', pct: 67, value: '66.67%' },
        { name: 'frontend', pct: 15, value: '14.49%' },
        { name: 'frontend-proxy', pct: 14, value: '14.29%' },
        { name: 'payment', pct: 8, value: '7.84%' },
      ],
      dashboards: [
        { name: 'Service overview', value: '244 healthy', age: '2h ago' },
        { name: 'p99 latency', value: '175ms', age: 'today' },
        { name: 'Error rate by service', value: '2.1%', age: 'yesterday' },
      ],
      deploys: [8, 12, 15, 11, 9],
    },
    2: {
      timeout: { value: '2,341', trend: '↑ 184%', curve: 'M0,60 C40,58 80,52 120,40 C160,28 200,12 280,2', fill: 'M0,60 C40,58 80,52 120,40 C160,28 200,12 280,2 L280,68 L0,68 Z' },
      alerts: [
        { name: 'checkout-agent loop', status: 'CRITICAL' },
        { name: 'order-db pool 98%', status: 'CRITICAL' },
        { name: 'Connection pool exhaustion', status: 'CRITICAL' },
      ],
      utilization: { value: '94%', curve: 'M0,50 C50,42 90,30 140,18 C180,10 220,6 280,4', fill: 'M0,50 C50,42 90,30 140,18 C180,10 220,6 280,4 L280,68 L0,68 Z' },
      services: [
        { name: 'checkout', pct: 89, value: '88.91%' },
        { name: 'order-service', pct: 42, value: '41.67%' },
        { name: 'payment', pct: 18, value: '17.82%' },
        { name: 'frontend', pct: 6, value: '5.44%' },
      ],
      dashboards: [
        { name: 'Checkout flow', value: '1,994 retries', age: 'just now' },
        { name: 'Order DB health', value: '98% pool', age: 'just now' },
        { name: 'Service overview', value: '3 critical', age: '1h ago' },
      ],
      deploys: [11, 14, 9, 13, 2],
    },
    3: {
      timeout: { value: '1,204', trend: '↑ 62%', curve: 'M0,54 C50,50 90,44 130,36 C170,26 210,14 280,6', fill: 'M0,54 C50,50 90,44 130,36 C170,26 210,14 280,6 L280,68 L0,68 Z' },
      alerts: [
        { name: 'billing-agent accuracy', status: 'CRITICAL' },
        { name: 'Citation match below SLO', status: 'CRITICAL' },
        { name: 'Groundedness drift', status: 'WARNING' },
      ],
      utilization: { value: '41%', curve: 'M0,42 C50,44 90,43 140,44 C180,45 220,44 280,45', fill: 'M0,42 C50,44 90,43 140,44 C180,45 220,44 280,45 L280,68 L0,68 Z' },
      services: [
        { name: 'billing-agent', pct: 72, value: '71.88%' },
        { name: 'retrieval-index', pct: 34, value: '33.50%' },
        { name: 'frontend', pct: 8, value: '7.92%' },
        { name: 'auth-service', pct: 3, value: '2.81%' },
      ],
      dashboards: [
        { name: 'Agent accuracy', value: '0.58 score', age: 'just now' },
        { name: 'Billing conversations', value: '340 affected', age: '1h ago' },
        { name: 'Retrieval latency', value: '890ms', age: 'today' },
      ],
      deploys: [6, 9, 12, 8, 7],
    },
    4: {
      timeout: { value: '203', trend: '↓ 12%', curve: 'M0,24 C50,26 90,30 140,34 C180,38 220,42 280,48', fill: 'M0,24 C50,26 90,30 140,34 C180,38 220,42 280,48 L280,68 L0,68 Z' },
      alerts: [
        { name: 'Tool-selection accuracy', status: 'WARNING' },
        { name: 'Lookup path degraded', status: 'WARNING' },
        { name: 'Prompt deploy drift', status: 'LOW' },
      ],
      utilization: { value: '38%', curve: 'M0,46 C50,45 90,46 140,45 C180,46 220,46 280,45', fill: 'M0,46 C50,45 90,46 140,45 C180,46 220,46 280,45 L280,68 L0,68 Z' },
      services: [
        { name: 'research-agent', pct: 42, value: '42.11%' },
        { name: 'lookup-tool', pct: 31, value: '31.25%' },
        { name: 'route-tool', pct: 12, value: '11.72%' },
        { name: 'summarize-tool', pct: 5, value: '4.69%' },
      ],
      dashboards: [
        { name: 'Tool accuracy', value: '0.58', age: 'today' },
        { name: 'Agent throughput', value: '9.6k/hr', age: '3h ago' },
        { name: 'p99 latency', value: '175ms', age: 'yesterday' },
      ],
      deploys: [10, 8, 14, 11, 12],
    },
    5: {
      timeout: { value: '512', trend: '↑ 47%', curve: 'M0,48 C50,46 90,42 130,36 C170,28 210,18 280,10', fill: 'M0,48 C50,46 90,42 130,36 C170,28 210,18 280,10 L280,68 L0,68 Z' },
      alerts: [
        { name: 'research-agent retry loop', status: 'WARNING' },
        { name: 'Upstream 200-on-empty', status: 'WARNING' },
        { name: 'Pattern recurrence (5th)', status: 'LOW' },
      ],
      utilization: { value: '62%', curve: 'M0,38 C50,36 90,34 140,30 C180,28 220,26 280,26', fill: 'M0,38 C50,36 90,34 140,30 C180,28 220,26 280,26 L280,68 L0,68 Z' },
      services: [
        { name: 'research-agent', pct: 58, value: '57.81%' },
        { name: 'web-fetch', pct: 44, value: '43.75%' },
        { name: 'data-service', pct: 22, value: '21.88%' },
        { name: 'frontend', pct: 6, value: '5.47%' },
      ],
      dashboards: [
        { name: 'Agent retry rate', value: '47/min', age: 'just now' },
        { name: 'web-fetch errors', value: '512 timeouts', age: '1h ago' },
        { name: 'Service overview', value: '245 healthy', age: '4h ago' },
      ],
      deploys: [9, 11, 7, 13, 10],
    },
  };

  const wd = WIDGET_DATA[scenario] || WIDGET_DATA[1];

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
              {wd.services.map((svc, i) => (
                <div key={svc.name} className="widgetCard__barRow" style={{ cursor: 'pointer' }} onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('app-perf-services', svc.name)}>
                  <span className="widgetCard__barLabel">{svc.name}</span>
                  <div className="widgetCard__barTrack"><div className={`widgetCard__barFill${i > 0 ? ' widgetCard__barFill--secondary' : ''}`} style={{ width: `${svc.pct}%` }} /></div>
                  <span className="widgetCard__barValue">{svc.value}</span>
                </div>
              ))}
            </div>
          </OuiInsightCard>
        );
      case 'connection-timeout': {
        const isDown = wd.timeout.trend.includes('↓');
        const connColor = isDown ? '#1F9D6B' : '#DD8A3A';
        const connTrendClass = isDown ? 'widgetCard__trend--success' : 'widgetCard__trend--warning';
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('logs', 'Logs')}>
            <WidgetHeader title="Connection timeout errors" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">{wd.timeout.value}</span>
              <span className={`widgetCard__trend ${connTrendClass}`}>{wd.timeout.trend}</span>
            </div>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs>
                  <ChartTexture id="v5connStripe" variant="stripe" color={connColor} />
                </defs>
                <path d={wd.timeout.fill} fill="url(#v5connStripe)" />
                <path d={wd.timeout.curve} fill="none" stroke={connColor} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      }
      case 'recent-alerts':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Recent alerts" />
            <div className="widgetCard__tableHeader">
              <span>ALERT</span>
              <span>STATUS</span>
            </div>
            <div className="widgetCard__rows">
              {wd.alerts.map((alert) => (
                <div key={alert.name} className="widgetCard__statusRow" style={{ cursor: 'pointer' }} onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('alerts', alert.name)}>
                  <span className="widgetCard__statusLabel">{alert.name}</span>
                  <span className={`widgetCard__statusBadge widgetCard__statusBadge--${alert.status === 'CRITICAL' ? 'critical' : 'warning'}`}>{alert.status}</span>
                </div>
              ))}
            </div>
          </OuiInsightCard>
        );
      case 'resource-utilization': {
        const utilNum = parseInt(wd.utilization.value);
        // Danger red, resolved per theme (SVG stroke/pattern attrs can't use var()).
        const dangerRed = isDark ? '#f87171' : '#dc2626';
        const utilColor = utilNum > 80 ? 'var(--g-danger)' : utilNum > 60 ? '#B45309' : '#1F9D6B';
        const utilStroke = utilNum > 80 ? dangerRed : utilNum > 60 ? '#f59e0b' : '#34d399';
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('metrics', 'Metrics')}>
            <WidgetHeader title="Resource utilization" />
            <span className="widgetCard__bigNumber" style={{ color: utilColor }}>{wd.utilization.value}</span>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs>
                  <ChartTexture id="v5resStripe" variant="stripe" color={utilStroke} />
                </defs>
                <path d={wd.utilization.fill} fill="url(#v5resStripe)" />
                <path d={wd.utilization.curve} fill="none" stroke={utilStroke} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      }
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
          <OuiInsightCard>
            <WidgetHeader title="Dashboards" />
            <div className="widgetCard__rows">
              {wd.dashboards.map((item) => (
                <div key={item.name} className="widgetCard__dashRow" style={{ cursor: 'pointer' }} onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('dashboards', item.name)}>
                  <div className="widgetCard__dashLeft">
                    <span className="widgetCard__dashName">{item.name}</span>
                    <span className="widgetCard__dashValue">{item.value}</span>
                  </div>
                  <span className="widgetCard__dashAge">{item.age}</span>
                </div>
              ))}
            </div>
          </OuiInsightCard>
        );
      case 'deployment-timeline': {
        const deployMax = Math.max(...wd.deploys);
        const deployAvg = Math.round(wd.deploys.reduce((a, b) => a + b, 0) / wd.deploys.length);
        return (
          <OuiInsightCard onClick={() => onOpenPageInNewSession && onOpenPageInNewSession('dashboards', 'Dashboards')}>
            <WidgetHeader title="Deployment timeline" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">{deployAvg}</span>
              <span className="widgetCard__trend" style={{ opacity: 0.45 }}>avg/wk</span>
            </div>
            <div className="widgetCard__chart">
              <div style={{ position: 'relative', height: 56, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(deployAvg / (deployMax + 2)) * 100}%`, borderTop: '1px dashed rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 1 }} />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%', padding: '0 2px' }}>
                  {wd.deploys.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
                      <div style={{ width: '60%', height: `${(v / (deployMax + 2)) * 100}%`, background: '#2BA98A', borderRadius: 1 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </OuiInsightCard>
        );
      }
      case 'p99-latency':
        return (
          <OuiInsightCard>
            <WidgetHeader title="P99 latency" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">175ms</span>
              <span className="widgetCard__trend widgetCard__trend--success">↓ 8%</span>
            </div>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs>
                  <ChartTexture id="v6p99Stripe" variant="stripe" color="#1F9D6B" />
                </defs>
                <path d="M0,20 C50,22 90,26 140,30 C180,34 220,38 280,42 L280,68 L0,68 Z" fill="url(#v6p99Stripe)" />
                <path d="M0,20 C50,22 90,26 140,30 C180,34 220,38 280,42" fill="none" stroke="#1F9D6B" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      case 'error-rate':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Error rate by service" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">2.1%</span>
              <span className="widgetCard__trend widgetCard__trend--warning">↑ 0.3%</span>
            </div>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs>
                  <ChartTexture id="v6errStripe" variant="stripe" color="#DD8A3A" />
                </defs>
                <path d="M0,52 C50,50 90,46 140,40 C180,34 220,28 280,22 L280,68 L0,68 Z" fill="url(#v6errStripe)" />
                <path d="M0,52 C50,50 90,46 140,40 C180,34 220,28 280,22" fill="none" stroke="#DD8A3A" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      case 'throughput':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Throughput" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">9.6k</span>
              <span className="widgetCard__trend" style={{ opacity: 0.45 }}>req/s</span>
            </div>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs>
                  <ChartTexture id="v6tpStripe" variant="stripe" color="#2BA98A" />
                </defs>
                <path d="M0,36 C50,34 90,32 140,33 C180,34 220,33 280,34 L280,68 L0,68 Z" fill="url(#v6tpStripe)" />
                <path d="M0,36 C50,34 90,32 140,33 C180,34 220,33 280,34" fill="none" stroke="#2BA98A" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      case 'active-incidents':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Active incidents" />
            <span className="widgetCard__bigNumber" style={{ color: 'var(--g-danger)' }}>3</span>
            <div className="widgetCard__rows">
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">checkout-agent loop</span>
                <span className="widgetCard__statusBadge widgetCard__statusBadge--critical">P1</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">db pool exhaustion</span>
                <span className="widgetCard__statusBadge widgetCard__statusBadge--critical">P1</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">latency regression</span>
                <span className="widgetCard__statusBadge widgetCard__statusBadge--warning">P2</span>
              </div>
            </div>
          </OuiInsightCard>
        );
      case 'slo-compliance':
        return (
          <OuiInsightCard>
            <WidgetHeader title="SLO compliance" />
            <span className="widgetCard__bigNumber" style={{ color: '#1F9D6B' }}>98.2%</span>
            <div className="widgetCard__rows">
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">Availability (99.9%)</span>
                <span className="widgetCard__statusBadge" style={{ background: 'rgba(31,157,107,0.1)', color: '#1F9D6B' }}>PASS</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">Latency P99 (&lt;500ms)</span>
                <span className="widgetCard__statusBadge" style={{ background: 'rgba(31,157,107,0.1)', color: '#1F9D6B' }}>PASS</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">Error budget</span>
                <span className="widgetCard__statusBadge widgetCard__statusBadge--warning">12% left</span>
              </div>
            </div>
          </OuiInsightCard>
        );
      case 'cost-today':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Cost today" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">$410</span>
              <span className="widgetCard__trend widgetCard__trend--warning">↑ 18%</span>
            </div>
            <div className="widgetCard__rows">
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">Compute</span>
                <span className="widgetCard__statusLabel" style={{ opacity: 0.5 }}>$248</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">LLM inference</span>
                <span className="widgetCard__statusLabel" style={{ opacity: 0.5 }}>$127</span>
              </div>
              <div className="widgetCard__statusRow">
                <span className="widgetCard__statusLabel">Storage</span>
                <span className="widgetCard__statusLabel" style={{ opacity: 0.5 }}>$35</span>
              </div>
            </div>
          </OuiInsightCard>
        );
      case 'stale-answer-rate':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Stale answer rate" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">4.2%</span>
              <span className="widgetCard__trend widgetCard__trend--warning">↑ 1.1%</span>
            </div>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs>
                  <ChartTexture id="v6staleStripe" variant="stripe" color="#DD8A3A" />
                </defs>
                <path d="M0,56 C50,54 90,50 140,44 C180,38 220,30 280,24 L280,68 L0,68 Z" fill="url(#v6staleStripe)" />
                <path d="M0,56 C50,54 90,50 140,44 C180,38 220,30 280,24" fill="none" stroke="#DD8A3A" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`v6Scenario${isSingleColumn ? ' v6Scenario--singleColumn' : ''}`}>
      {/* Mobile menu — floating top-left, visible at <= 768px */}
      <button
        type="button"
        className="v6Scenario__mobileMenuBtn"
        onClick={() => onOpenMobileNav && onOpenMobileNav()}
        aria-label="Open menu">
        <OuiIcon type="menu" size="m" />
      </button>


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
          </div>

          {/* Greeting */}
          <OuiTitle size="m" className="v6Scenario__title">
            <h1>{scenarioData.greeting}</h1>
          </OuiTitle>
          {summaryLoading ? (
            <div className="v6Scenario__summaryLoader">
              <OuiAgenticSpinner size="s" />
            </div>
          ) : (
            <p className="v6Scenario__summary" dangerouslySetInnerHTML={{ __html: scenarioData.summary }} />
          )}

          {/* Inline findings (single-column layout) */}
          {isSingleColumn && !summaryLoading && (
            <div className="v6Scenario__findings v6Scenario__findings--inline" ref={findingsRef}>
              {scenarioData.findings.map((finding, findingIndex) => {
                if (findingIndex >= findingsLoaded) return null;
                if (removedFindings.has(finding.key)) return null;
                const isDismissed = finding.key in dismissedFindings;
                const isExpanded = expandedFindings.has(finding.key);
                const feedback = feedbackFindings[finding.key];

                if (isDismissed) {
                  return (
                    <div key={finding.key} className="v6Scenario__findingCard v6Scenario__findingCard--dismissed">
                      <div className="v6Scenario__findingCardMain">
                        <div className="v6Scenario__findingCardLeft">
                          <span className="v6Scenario__findingDismissedText">
                            {finding.title}
                          </span>
                        </div>
                        <div className="v6Scenario__findingCardRight">
                          <DotCountdownRing startTime={dismissedFindings[finding.key]} />
                          <button
                            type="button"
                            className="v6Scenario__findingUndoBtn"
                            onClick={(e) => { e.stopPropagation(); undoDismissFinding(finding.key); }}>
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={finding.key} className={`v6Scenario__findingCard${isExpanded ? ' v6Scenario__findingCard--expanded' : ''}`} onClick={() => toggleFinding(finding.key)}>
                    <div className="v6Scenario__findingCardMain">
                      <div className="v6Scenario__findingCardLeft">
                        <div className="v6Scenario__findingHeader">
                          <StatusPill status={finding.status} color={finding.statusColor} />
                          <span className="v6Scenario__findingTitle">{finding.title}</span>
                        </div>
                      </div>
                      <div className="v6Scenario__findingCardRight">
                        <FindingWidget finding={finding} idPrefix="sc" />
                        <OuiIcon type="arrowDown" size="s" className={`v6Scenario__findingChevron${isExpanded ? ' v6Scenario__findingChevron--expanded' : ''}`} />
                      </div>
                    </div>
                    <div className={`v6Scenario__findingActions__side${isExpanded ? ' v6Scenario__findingActions__side--visible' : ''}`}>
                      {isExpanded && (
                        <>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'up' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'up'); }}>
                            <OuiIcon type="thumbsUp" size="s" />
                          </button>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'down' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Not helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'down'); }}>
                            <OuiIcon type="thumbsDown" size="s" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="v6Scenario__findingSideBtn"
                        aria-label="Dismiss"
                        onClick={(e) => { e.stopPropagation(); dismissFinding(finding.key); }}>
                        <OuiIcon type="cross" size="s" />
                      </button>
                    </div>
                    {renderFindingBody(finding, isExpanded)}
                  </div>
                );
              })}
              {findingsLoaded < scenarioData.findings.length && (
                <div className="v6Scenario__findingsLoader">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="v6Scenario__inputArea">
            <SurroundShimmer hide={false}>
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
                          onStartThread(inputValue.trim(), buildInsightsContext());
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
                onClick={() => {
                  const open = onJumpToPage || onOpenPageInNewSession;
                  if (open) open(item.pageKey, item.label);
                }}>
                <OuiIcon type={item.icon} size="s" />
                <span>{item.label}</span>
              </button>
            ))}
            <OuiPopover
              anchorPosition="upRight"
              panelPaddingSize="none"
              isOpen={moreMenuOpen}
              closePopover={() => setMoreMenuOpen(false)}
              button={
                <OuiToolTip content="More pages" position="top">
                  <button
                    type="button"
                    className={`v6Scenario__jumpToChip v6Scenario__jumpToChip--round${
                      moreMenuOpen ? ' v6Scenario__jumpToChip--active' : ''
                    }`}
                    aria-label="More pages"
                    onClick={() => setMoreMenuOpen((open) => !open)}>
                    <OuiIcon type="boxesHorizontal" size="s" />
                  </button>
                </OuiToolTip>
              }>
              <div className="v6Scenario__morePagesMenu">
                {JUMP_TO_MORE_GROUPS.map((group) => (
                  <div key={group.key} className="v6Scenario__morePagesGroup">
                    {group.label && (
                      <div className="v6Scenario__morePagesGroupLabel">
                        {group.label}
                      </div>
                    )}
                    {group.items.map((item) => (
                      <button
                        key={`${group.key}-${item.pageKey}-${item.label}`}
                        type="button"
                        className="v6Scenario__morePagesItem"
                        onClick={() => {
                          const open = onJumpToPage || onOpenPageInNewSession;
                          if (open) open(item.pageKey, item.label);
                          setMoreMenuOpen(false);
                        }}>
                        <OuiIcon type={item.icon} size="m" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </OuiPopover>
          </div>
        </div>

        {/* Resize handle */}
        {!isSingleColumn && (
        <div
          className="v6Scenario__resizeHandle"
          onMouseDown={handleResizeMouseDown}
          ref={resizeRef}
        />
        )}

        {/* Right column */}
        {!isSingleColumn && (
        <div
          className="v6Scenario__rightCol"
          style={{ flex: `0 0 ${rightPanelWidth}%` }}>
          {/* Header: title + actions */}
          <div className="v6Scenario__tabRow">
            <div className="v6Scenario__overviewTitleGroup">
              <span className="v6Scenario__overviewTitle">{showPageBrowser ? 'Open a page' : 'Overview'}</span>
              {!showPageBrowser && (
                <span className="v6Scenario__overviewStatus">
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
                  onClick={() => { setIsEditMode(false); setShowWidgetPicker(false); setWidgetPickerSearch(''); }}>
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
              {scenarioData.findings.map((finding, findingIndex) => {
                if (findingIndex >= findingsLoaded) return null;
                if (removedFindings.has(finding.key)) return null;
                const isDismissed = finding.key in dismissedFindings;
                const isExpanded = expandedFindings.has(finding.key);
                const feedback = feedbackFindings[finding.key];

                if (isDismissed) {
                  return (
                    <div key={finding.key} className="v6Scenario__findingCard v6Scenario__findingCard--dismissed">
                      <div className="v6Scenario__findingCardMain">
                        <div className="v6Scenario__findingCardLeft">
                          <span className="v6Scenario__findingDismissedText">
                            {finding.title}
                          </span>
                        </div>
                        <div className="v6Scenario__findingCardRight">
                          <DotCountdownRing startTime={dismissedFindings[finding.key]} />
                          <button
                            type="button"
                            className="v6Scenario__findingUndoBtn"
                            onClick={() => undoDismissFinding(finding.key)}>
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={finding.key} className={`v6Scenario__findingCard${isExpanded ? ' v6Scenario__findingCard--expanded' : ''}`} onClick={() => toggleFinding(finding.key)}>
                    <div className="v6Scenario__findingCardMain">
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
                              <defs>
                                <pattern id={`spark-stripe-${finding.key}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                  <line x1="0" y1="0" x2="0" y2="4" stroke={finding.widget.color} strokeWidth="1" opacity="0.35" />
                                </pattern>
                              </defs>
                              <path d="M0,4 L15,6 L30,8 L45,12 L60,18 L60,20 L0,20 Z" fill={`url(#spark-stripe-${finding.key})`} />
                              <polyline points="0,4 15,6 30,8 45,12 60,18" fill="none" stroke={finding.widget.color} strokeWidth="1.5" strokeLinecap="round" />
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
                    <div className={`v6Scenario__findingActions__side${isExpanded ? ' v6Scenario__findingActions__side--visible' : ''}`}>
                      {isExpanded && (
                        <>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'up' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'up'); }}>
                            <OuiIcon type="thumbsUp" size="s" />
                          </button>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'down' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Not helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'down'); }}>
                            <OuiIcon type="thumbsDown" size="s" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="v6Scenario__findingSideBtn"
                        aria-label="Dismiss"
                        onClick={(e) => { e.stopPropagation(); dismissFinding(finding.key); }}>
                        <OuiIcon type="cross" size="s" />
                      </button>
                    </div>
                    {renderFindingBody(finding, isExpanded)}
                  </div>
                );
              })}
              {findingsLoaded < scenarioData.findings.length && (
                <div className="v6Scenario__findingsLoader">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
            </div>

            {/* Pinned widgets (favorites) */}
            <div className={`v6Scenario__widgetGrid${isEditMode ? ' v6Scenario__widgetGrid--editing' : ''}`}>
              {widgetOrder.map((widgetId) => {
                const size = widgetSizes[widgetId] || 1;
                const isDragging = draggedWidget === widgetId;
                const isDragOver = dragOverWidget === widgetId;
                const wrapClass = `v6Scenario__widgetWrap v6Scenario__widget--span${size}${isDragging ? ' v6Scenario__widgetWrap--dragging' : ''}${isDragOver ? ' v6Scenario__widgetWrap--dragOver' : ''}`;
                return (
                  <div
                    key={widgetId}
                    className={wrapClass}
                    data-widget={widgetId}
                    draggable={isEditMode}
                    onDragStart={(e) => {
                      if (!isEditMode) return;
                      setDraggedWidget(widgetId);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => {
                      setDraggedWidget(null);
                      setDragOverWidget(null);
                    }}
                    onDragOver={(e) => {
                      if (!isEditMode || !draggedWidget || draggedWidget === widgetId) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverWidget(widgetId);
                    }}
                    onDragLeave={() => {
                      if (dragOverWidget === widgetId) setDragOverWidget(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!draggedWidget || draggedWidget === widgetId) return;
                      setWidgetOrder((prev) => {
                        const next = prev.filter((id) => id !== draggedWidget);
                        const dropIdx = next.indexOf(widgetId);
                        next.splice(dropIdx, 0, draggedWidget);
                        return next;
                      });
                      setDraggedWidget(null);
                      setDragOverWidget(null);
                    }}>
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
                          draggable={false}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const startX = e.clientX;
                            const startSize = widgetSizes[widgetId] || 1;
                            const gridEl = e.currentTarget.closest('.v6Scenario__widgetGrid');
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
                              document.body.style.userSelect = '';
                            };
                            document.body.style.cursor = 'ew-resize';
                            document.body.style.userSelect = 'none';
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
                        {widgetsArmed && (
                          <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
                            <div className="ouiInsightCard" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                              <ScanShimmerOverlay />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : renderWidget(widgetId)}
                  </div>
                );
              })}
              {isEditMode && (
                <div
                  className="v6Scenario__widgetWrap v6Scenario__widgetAdd"
                  onClick={() => setShowWidgetPicker(true)}>
                  <OuiIcon type="plusInCircle" size="m" />
                  <span>Add widget</span>
                </div>
              )}
            </div>

            {/* Widget picker */}
            {showWidgetPicker && (
              <div className="v6Scenario__widgetPicker">
                <div className="v6Scenario__widgetPickerHeader">
                  <div className="v6Scenario__widgetPickerSearch">
                    <OuiIcon type="search" size="s" />
                    <input
                      type="text"
                      placeholder="Search widgets..."
                      value={widgetPickerSearch}
                      onChange={(e) => setWidgetPickerSearch(e.target.value)}
                      className="v6Scenario__widgetPickerInput"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    className="v6Scenario__widgetPickerClose"
                    onClick={() => { setShowWidgetPicker(false); setWidgetPickerSearch(''); setIsEditMode(false); }}>
                    <OuiIcon type="cross" size="m" />
                  </button>
                </div>
                <div className="v6Scenario__widgetPickerList">
                  {WIDGET_CATALOG
                    .filter((w) => !widgetPickerSearch || w.label.toLowerCase().includes(widgetPickerSearch.toLowerCase()))
                    .map((w) => {
                      const alreadyAdded = widgetOrder.includes(w.id);
                      const atLimit = widgetOrder.length >= 9;
                      const isDisabled = alreadyAdded || atLimit;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          className={`v6Scenario__widgetPickerItem${alreadyAdded ? ' v6Scenario__widgetPickerItem--added' : ''}${atLimit && !alreadyAdded ? ' v6Scenario__widgetPickerItem--disabled' : ''}`}
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled) {
                              setWidgetOrder((prev) => [...prev, w.id]);
                            }
                          }}>
                          <OuiIcon type={w.icon} size="s" />
                          <span>{w.label}</span>
                          {alreadyAdded && <span className="v6Scenario__widgetPickerAdded">Added</span>}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

          </div>
          </>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
