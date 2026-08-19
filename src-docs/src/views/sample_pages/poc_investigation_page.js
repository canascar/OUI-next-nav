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

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { OuiIcon } from '../../../../src/components';
import { pocTelemetry } from './poc_entry_handler';

/**
 * POC Investigation Page — dashboard-style canvas with 4 completed steps.
 * Each step has a dark card panel with section label, metrics, and content.
 */

// ─── Dot-matrix scan shimmer (0.5s on load) ──────────────────────────────────

const ScanShimmer = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const sp = 7;
    const speed = 0.4;
    const field = { ctx: null, dots: [], w: 0, h: 0, span: 0, band: 0 };
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
      Object.assign(field, { ctx, dots, w, h, span: w + h * 0.6, band: sp * 3.6 });
    };
    const tick = (now) => {
      const { ctx, dots, w, h, span, band } = field;
      if (ctx) {
        if (!startRef.current) startRef.current = now;
        const t = (now - startRef.current) / 1000;
        ctx.clearRect(0, 0, w, h);
        const p = (t * speed) % 1.35;
        const lx = p * span;
        for (const d of dots) {
          const proj = d.x + d.y * 0.6;
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
    build();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  if (!visible) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pocInvestigation__shimmer"
    />
  );
};

// ─── Card renderers (dashboard-style) ─────────────────────────────────────────

const AlertCard = ({ card }) => (
  <div className="pocCard">
    <div className="pocCard__header">
      <span className="pocCard__sectionLabel">ALERTING</span>
      <span className="pocCard__source">OpenSearch · MCP app</span>
      <span className="pocCard__badge pocCard__badge--danger">Firing</span>
    </div>
    <div className="pocCard__body">
      <h3 className="pocCard__title">p99 latency {card.current} &gt; {card.threshold} threshold on checkout (pay-prod-a)</h3>
      <p className="pocCard__subtitle">monitor checkout-p99-latency · created from observed baseline</p>
      <div className="pocCard__metrics">
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">THRESHOLD</span>
          <span className="pocCard__metricValue">{card.threshold}</span>
        </div>
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">CURRENT P99</span>
          <span className="pocCard__metricValue pocCard__metricValue--danger">{card.current}</span>
        </div>
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">BASELINE</span>
          <span className="pocCard__metricValue">{card.baseline}</span>
        </div>
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">STARTED</span>
          <span className="pocCard__metricValue">{card.startedAgo}</span>
        </div>
      </div>
      <p className="pocCard__footnote">
        First breach {card.firstBreach} · Evaluation {card.evalInterval}, 3 consecutive breaches · Scope service: {card.scope}
      </p>
    </div>
  </div>
);

const LogsCard = ({ card }) => (
  <div className="pocCard">
    <div className="pocCard__header">
      <span className="pocCard__sectionLabel">LOGS</span>
      <span className="pocCard__source">OpenSearch · MCP app</span>
      <span className="pocCard__badge pocCard__badge--warning">+184%</span>
    </div>
    <div className="pocCard__body">
      <h3 className="pocCard__title">Error pattern: connection pool timeout</h3>
      <p className="pocCard__subtitle">logs-checkout-pay-prod-a</p>
      <div className="pocCard__metrics">
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">EVENTS</span>
          <span className="pocCard__metricValue pocCard__metricValue--primary">{card.eventCount}</span>
        </div>
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">CHANGE</span>
          <span className="pocCard__metricValue pocCard__metricValue--danger">+184% in the last 20m</span>
        </div>
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">SHARE OF ERRORS</span>
          <span className="pocCard__metricValue">91%</span>
        </div>
      </div>
      <pre className="pocCard__code">{card.query}</pre>
      <div className="pocCard__logs">
        {card.sampleLines.map((line, i) => (
          <div key={i} className="pocCard__logLine">{line}</div>
        ))}
      </div>
      <button type="button" className="pocCard__link" onClick={() => {
        window.dispatchEvent(new CustomEvent('open-canvas-in-new-session', {
          detail: { pageKey: 'discover-log-correlated', title: 'Checkout pool timeout logs' },
        }));
      }}>
        Open these logs in Discover ↗
      </button>
    </div>
  </div>
);

const TraceCard = ({ card }) => (
  <div className="pocCard">
    <div className="pocCard__header">
      <span className="pocCard__sectionLabel">TRACES</span>
      <span className="pocCard__source">OpenSearch · MCP app</span>
      <span className="pocCard__badge pocCard__badge--danger">Slowest span 1.10s</span>
    </div>
    <div className="pocCard__body">
      <h3 className="pocCard__title">{card.endpoint} · {card.totalDuration}</h3>
      <p className="pocCard__subtitle">trace {card.traceId}</p>
      <div className="pocCard__spans">
        {card.spans.map((span, i) => (
          <div key={i} className={`pocCard__span${span.highlight ? ' pocCard__span--highlight' : ''}`}>
            <span className="pocCard__spanName">{span.name}</span>
            <div className="pocCard__spanTrack">
              <div className="pocCard__spanBar" style={{ width: `${span.pct}%` }} />
            </div>
            <span className="pocCard__spanDur">{span.duration}</span>
          </div>
        ))}
      </div>
      <p className="pocCard__footnote">1.10s of the 1.42s is spent waiting for a connection before the query even runs.</p>
    </div>
  </div>
);

const MetricsCard = ({ card }) => (
  <div className="pocCard">
    <div className="pocCard__header">
      <span className="pocCard__sectionLabel">METRICS</span>
      <span className="pocCard__source">OpenSearch · MCP app</span>
      <span className="pocCard__badge pocCard__badge--warning">Climbing</span>
    </div>
    <div className="pocCard__body">
      <h3 className="pocCard__title">Connection pool utilization · {card.current}</h3>
      <p className="pocCard__subtitle">orders-pool · checkout · pay-prod-a</p>
      <div className="pocCard__chart pocCard__chart--full">
        <svg viewBox="0 0 300 80" className="pocCard__chartSvg pocCard__chartSvg--full">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeOpacity="0.08" />
          <line x1="0" y1="40" x2="300" y2="40" stroke="currentColor" strokeOpacity="0.08" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" strokeOpacity="0.08" />
          {/* 85% monitor threshold */}
          <line x1="0" y1="12" x2="300" y2="12" stroke="var(--ouiColorWarning, #c47a1f)" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.6" />
          {/* Deploy marker */}
          <line x1="100" y1="0" x2="100" y2="80" stroke="var(--ouiColorDanger, #c53961)" strokeWidth="1" strokeDasharray="2,2" strokeOpacity="0.5" />
          <text x="102" y="10" fontSize="8" fill="var(--ouiColorDanger, #c53961)" opacity="0.8">14:02 deploy</text>
          {/* Area fill */}
          <path
            d={`M0,${78 - (card.sparkline[0] / 100) * 74} ${card.sparkline.map((v, i) => `L${(i / (card.sparkline.length - 1)) * 300},${78 - (v / 100) * 74}`).join(' ')} L300,78 L0,78 Z`}
            fill="var(--ouiColorDanger, #c53961)"
            fillOpacity="0.08"
          />
          {/* Sparkline */}
          <polyline
            fill="none"
            stroke="var(--ouiColorDanger, #c53961)"
            strokeWidth="2"
            strokeLinejoin="round"
            points={card.sparkline.map((v, i) => `${(i / (card.sparkline.length - 1)) * 300},${78 - (v / 100) * 74}`).join(' ')}
          />
          <circle
            cx="300"
            cy={78 - (card.sparkline[card.sparkline.length - 1] / 100) * 74}
            r="3"
            fill="var(--ouiColorDanger, #c53961)"
          />
          {/* X-axis labels */}
          <text x="0" y="78" fontSize="8" fill="currentColor" fillOpacity="0.4" dy="10">14:00</text>
          <text x="300" y="78" fontSize="8" fill="currentColor" fillOpacity="0.4" dy="10" textAnchor="end">14:48</text>
        </svg>
      </div>
      <div className="pocCard__metrics">
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">NOW</span>
          <span className="pocCard__metricValue pocCard__metricValue--danger">{card.current}</span>
        </div>
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">BEFORE DEPLOY</span>
          <span className="pocCard__metricValue">{card.before}</span>
        </div>
        <div className="pocCard__metric">
          <span className="pocCard__metricLabel">POOL SIZE</span>
          <span className="pocCard__metricValue">{card.poolSize} connections</span>
        </div>
      </div>
    </div>
  </div>
);

const CARD_RENDERERS = { alert: AlertCard, logs: LogsCard, trace: TraceCard, metrics: MetricsCard };

// ─── Step row ─────────────────────────────────────────────────────────────────

const StepRow = ({ step, isOpen, onToggle }) => {
  const CardRenderer = CARD_RENDERERS[step.card.type];
  return (
    <div className="pocStep">
      <button
        type="button"
        className="pocStep__header"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <OuiIcon type="checkInCircleEmpty" size="s" color="success" />
        <span className="pocStep__label">Step {step.number} · {step.label}</span>
        <span className="pocStep__result">{step.result}</span>
        <span className="pocStep__duration">{step.duration}</span>
        <OuiIcon type={isOpen ? 'arrowDown' : 'arrowRight'} size="s" color="subdued" />
      </button>
      {isOpen && CardRenderer && (
        <div className="pocStep__body">
          <CardRenderer card={step.card} />
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const PocInvestigationPage = () => {
  const alert = typeof window !== 'undefined' ? window.__pocAlert : null;
  const steps = alert ? alert.steps : [];
  const totalDuration = alert ? alert.totalDuration : '';

  const [openSteps, setOpenSteps] = useState(() => {
    const initial = {};
    steps.forEach((s) => { initial[s.id] = true; });
    return initial;
  });

  // Force all steps open when alert data becomes available
  useEffect(() => {
    if (steps.length > 0) {
      const allOpen = {};
      steps.forEach((s) => { allOpen[s.id] = true; });
      setOpenSteps(allOpen);
    }
  }, [steps.length]);

  useEffect(() => {
    const handler = (e) => {
      const { stepId } = e.detail || {};
      if (stepId) {
        setOpenSteps((prev) => ({ ...prev, [stepId]: true }));
        pocTelemetry('step_expanded', { step: stepId });
      }
    };
    window.addEventListener('poc-expand-step', handler);
    return () => window.removeEventListener('poc-expand-step', handler);
  }, []);

  const toggleStep = useCallback((stepId) => {
    setOpenSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      if (next[stepId]) pocTelemetry('step_expanded', { step: stepId });
      return next;
    });
  }, []);

  return (
    <div className="pocInvestigation">
      <div className="pocInvestigation__body">
        {/* Header */}
        <div className="pocInvestigation__header">
          <span className="pocInvestigation__provenance">Investigation started 14:44 UTC · {steps.length} steps · {totalDuration}</span>
          <span className="pocInvestigation__badge">Root cause found</span>
        </div>

        {/* Summary grid */}
        <div className="pocInvestigation__summary">
          <div className="pocInvestigation__summaryItem">
            <span className="pocInvestigation__summaryLabel">Root cause</span>
            <span className="pocInvestigation__summaryValue">14:02 deploy holds DB connections 2.2× longer; orders-pool (20) saturates at peak.</span>
          </div>
          <div className="pocInvestigation__summaryItem">
            <span className="pocInvestigation__summaryLabel">Impact</span>
            <span className="pocInvestigation__summaryValue">p99 1.42s vs 1.2s threshold · errors flat at 2.8%</span>
          </div>
          <div className="pocInvestigation__summaryItem">
            <span className="pocInvestigation__summaryLabel">Scope</span>
            <span className="pocInvestigation__summaryValue">checkout · pay-prod-a · since 14:02 · 42m</span>
          </div>
        </div>

        {/* What the agent did */}
        <div className="pocInvestigation__section">
          <div className="pocInvestigation__sectionHeader">
            <span className="pocInvestigation__sectionTitle">What the agent did</span>
          </div>
          <div className="pocInvestigation__steps">
            <ScanShimmer />
            {steps.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                isOpen={!!openSteps[step.id]}
                onToggle={() => toggleStep(step.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
