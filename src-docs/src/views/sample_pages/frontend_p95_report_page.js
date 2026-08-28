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

import React from 'react';
import { FRONTEND_P95_INCIDENT } from './mocks/frontendP95';

/**
 * Investigation report — read-only canvas page for the `frontend-p95` arrival.
 *
 * Opened from the "Investigation report" link in the pre-seeded chat thread via
 * the existing link-preview → openCanvasPage path. Nothing here is
 * interactive: it is the record of work the agent already finished.
 *
 * Every class comes from the existing analysis-page vocabulary in
 * _poc_investigation.scss (pocInvestigation__* / pocCard__*) — this page adds
 * no styles of its own. `style` is used only where the existing PocInvestigation
 * cards already use it: data-driven SVG/bar geometry.
 */

// ─── (a) Status header ────────────────────────────────────────────────────────

const StatusHeader = ({ incident }) => (
  <>
    <div className="pocInvestigation__header">
      <span className="pocInvestigation__provenance">
        {incident.date} · detected {incident.detection.at} · closed{' '}
        {incident.action.at} · {incident.rollback}
      </span>
      <span className="pocInvestigation__badge">
        {incident.status} · {incident.resolution}
      </span>
    </div>

    <div className="pocInvestigation__summary">
      <div className="pocInvestigation__summaryItem">
        <span className="pocInvestigation__summaryLabel">Root cause</span>
        <span className="pocInvestigation__summaryValue">
          {incident.rootCause.summary}
        </span>
      </div>
      <div className="pocInvestigation__summaryItem">
        <span className="pocInvestigation__summaryLabel">Impact</span>
        <span className="pocInvestigation__summaryValue">
          {incident.rootCause.impact} · recovered to{' '}
          {incident.action.recoveredTo} at {incident.action.recoveredAt}
        </span>
      </div>
      <div className="pocInvestigation__summaryItem">
        <span className="pocInvestigation__summaryLabel">Scope</span>
        <span className="pocInvestigation__summaryValue">
          {incident.rootCause.scope}
        </span>
      </div>
    </div>
  </>
);

// ─── (b) RCA timeline ─────────────────────────────────────────────────────────

const TimelineCard = ({ incident }) => (
  <div className="pocCard">
    <div className="pocCard__header">
      <span className="pocCard__sectionLabel">TIMELINE</span>
      <span className="pocCard__source">OpenSearch · agent record</span>
      <span className="pocCard__badge pocCard__badge--success">Resolved</span>
    </div>
    <div className="pocCard__body">
      <h3 className="pocCard__title">
        Flag toggled at 09:10, reverted at 09:26
      </h3>
      <p className="pocCard__subtitle">
        {incident.steps.length} investigation steps between 09:14 and 09:23
      </p>
      <div className="pocCard__logs">
        {incident.timeline.map((row, i) => (
          <div key={i} className="pocCard__logLine">
            {row}
          </div>
        ))}
      </div>
      <p className="pocCard__footnote">
        The {incident.rootCause.lead} gap between the toggle and the breach is
        what pinned the root cause to the {incident.rootCause.actor}.
      </p>
    </div>
  </div>
);

// ─── (c) p95 metric chart ─────────────────────────────────────────────────────

/**
 * p95 over the last 30 minutes with a revert marker and the recovery point.
 * Same construction as the existing MetricsCard sparkline in
 * poc_investigation_page.js — a plain SVG scaled to the series.
 */
const MetricChartCard = ({ incident }) => {
  const { chart } = incident;
  const { series, axisMax } = chart;
  const lastIndex = series.length - 1;

  // Viewbox is 300 × 80; leave the bottom 2px for the axis labels.
  const x = (i) => (i / lastIndex) * 300;
  const y = (v) => 78 - (v / axisMax) * 74;

  const points = series.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPath = `M0,${y(series[0])} ${series
    .map((v, i) => `L${x(i)},${y(v)}`)
    .join(' ')} L300,78 L0,78 Z`;

  const revertX = x(chart.revertIndex);
  const recoveryX = x(chart.recoveryIndex);

  return (
    <div className="pocCard">
      <div className="pocCard__header">
        <span className="pocCard__sectionLabel">METRICS</span>
        <span className="pocCard__source">OpenSearch · agent record</span>
        <span className="pocCard__badge pocCard__badge--success">
          Recovered
        </span>
      </div>
      <div className="pocCard__body">
        <h3 className="pocCard__title">
          {chart.metric} · {chart.window}
        </h3>
        <p className="pocCard__subtitle">
          baseline {chart.baseline}ms · peak {chart.peak}ms · now{' '}
          {chart.recovered}ms
        </p>
        <div className="pocCard__chart pocCard__chart--full">
          <svg
            viewBox="0 0 300 80"
            className="pocCard__chartSvg pocCard__chartSvg--full"
            role="img"
            aria-label={`${chart.metric}, ${chart.window}: baseline ${chart.baseline}ms, spike to ${chart.peak}ms, flag reverted at 09:26, recovered to ${chart.recovered}ms`}>
            {/* Grid lines */}
            <line
              x1="0"
              y1="20"
              x2="300"
              y2="20"
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            <line
              x1="0"
              y1="40"
              x2="300"
              y2="40"
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            <line
              x1="0"
              y1="60"
              x2="300"
              y2="60"
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            {/* Baseline */}
            <line
              x1="0"
              y1={y(chart.baseline)}
              x2="300"
              y2={y(chart.baseline)}
              stroke="var(--ouiColorSuccess, #0e6e52)"
              strokeWidth="1"
              strokeDasharray="4,3"
              strokeOpacity="0.6"
            />
            {/* Revert marker */}
            <line
              x1={revertX}
              y1="0"
              x2={revertX}
              y2="80"
              stroke="var(--ouiColorPrimary, #1a5da8)"
              strokeWidth="1"
              strokeDasharray="2,2"
              strokeOpacity="0.6"
            />
            <text
              x={revertX + 2}
              y="10"
              fontSize="8"
              fill="var(--ouiColorPrimary, #1a5da8)"
              opacity="0.8">
              {chart.revertLabel}
            </text>
            {/* Area fill */}
            <path
              d={areaPath}
              fill="var(--ouiColorDanger, #c53961)"
              fillOpacity="0.08"
            />
            {/* Series */}
            <polyline
              fill="none"
              stroke="var(--ouiColorDanger, #c53961)"
              strokeWidth="2"
              strokeLinejoin="round"
              points={points}
            />
            {/* Recovery point */}
            <circle
              cx={recoveryX}
              cy={y(series[chart.recoveryIndex])}
              r="3"
              fill="var(--ouiColorSuccess, #0e6e52)"
            />
            <text
              x={recoveryX + 4}
              y={y(series[chart.recoveryIndex]) - 4}
              fontSize="8"
              fill="var(--ouiColorSuccess, #0e6e52)"
              opacity="0.9">
              {chart.recoveryLabel}
            </text>
            {/* X-axis labels */}
            <text
              x="0"
              y="78"
              fontSize="8"
              fill="currentColor"
              fillOpacity="0.4"
              dy="10">
              {chart.startLabel}
            </text>
            <text
              x="300"
              y="78"
              fontSize="8"
              fill="currentColor"
              fillOpacity="0.4"
              dy="10"
              textAnchor="end">
              {chart.endLabel}
            </text>
          </svg>
        </div>
        <div className="pocCard__metrics">
          <div className="pocCard__metric">
            <span className="pocCard__metricLabel">BASELINE</span>
            <span className="pocCard__metricValue">{chart.baseline}ms</span>
          </div>
          <div className="pocCard__metric">
            <span className="pocCard__metricLabel">PEAK</span>
            <span className="pocCard__metricValue pocCard__metricValue--danger">
              {chart.peak}ms
            </span>
          </div>
          <div className="pocCard__metric">
            <span className="pocCard__metricLabel">AFTER REVERT</span>
            <span className="pocCard__metricValue">{chart.recovered}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── (d) Trace evidence ───────────────────────────────────────────────────────

const TraceEvidenceCard = ({ incident }) => (
  <div className="pocCard">
    <div className="pocCard__header">
      <span className="pocCard__sectionLabel">TRACES</span>
      <span className="pocCard__source">OpenSearch · agent record</span>
      <span className="pocCard__badge pocCard__badge--danger">
        DEADLINE_EXCEEDED
      </span>
    </div>
    <div className="pocCard__body">
      <h3 className="pocCard__title">
        Frontend → CheckoutService → RecommendationService
      </h3>
      <p className="pocCard__subtitle">
        98% of request time spent waiting on the gRPC call
      </p>
      <div className="pocCard__spans">
        {incident.spans.map((span) => (
          <div
            key={span.name}
            className={`pocCard__span${
              span.highlight ? ' pocCard__span--highlight' : ''
            }`}>
            <span className="pocCard__spanName">{span.name}</span>
            <div className="pocCard__spanTrack">
              <div
                className="pocCard__spanBar"
                style={{ width: `${span.pct}%` }}
              />
            </div>
            <span className="pocCard__spanDur">{span.duration}</span>
          </div>
        ))}
      </div>
      <p className="pocCard__footnote">
        recommendation.rpc never returns — it is cut off at 3000ms with
        DEADLINE_EXCEEDED, with a cache-miss storm behind it.
      </p>
    </div>
  </div>
);

// ─── (e) Log evidence ─────────────────────────────────────────────────────────

const LogEvidenceCard = ({ incident }) => (
  <div className="pocCard">
    <div className="pocCard__header">
      <span className="pocCard__sectionLabel">LOGS</span>
      <span className="pocCard__source">OpenSearch · agent record</span>
      <span className="pocCard__badge pocCard__badge--warning">
        Cache bypassed
      </span>
    </div>
    <div className="pocCard__body">
      <h3 className="pocCard__title">
        rec-cache disabled by flag, then a miss storm
      </h3>
      <p className="pocCard__subtitle">logs-recommendation-service</p>
      <div className="pocCard__logs">
        {incident.logs.map((line, i) => (
          <div key={i} className="pocCard__logLine">
            {line}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── (f) Playbook provenance ──────────────────────────────────────────────────

const PlaybookCard = ({ incident }) => {
  const { playbook } = incident;
  return (
    <div className="pocCard">
      <div className="pocCard__header">
        <span className="pocCard__sectionLabel">PLAYBOOK</span>
        <span className="pocCard__source">OpenSearch · learned</span>
        <span className="pocCard__badge pocCard__badge--success">Applied</span>
      </div>
      <div className="pocCard__body">
        <h3 className="pocCard__title">
          Learned from {playbook.learnedFrom} · {playbook.learnedOn}
        </h3>
        <p className="pocCard__subtitle">
          {playbook.lead} by {playbook.ledBy}
        </p>
        <div className="pocCard__logs">
          {playbook.principles.map((principle) => (
            <div key={principle} className="pocCard__logLine">
              {principle}
            </div>
          ))}
        </div>
        <p className="pocCard__footnote">
          The revert at {incident.action.at} and the new monitor on{' '}
          {incident.action.monitor} both come straight from this playbook.
        </p>
      </div>
    </div>
  );
};

// ─── (g) Follow-up ────────────────────────────────────────────────────────────

const FollowUpCard = ({ incident }) => {
  const { followUp } = incident;
  return (
    <div className="pocCard">
      <div className="pocCard__header">
        <span className="pocCard__sectionLabel">FOLLOW-UP</span>
        <span className="pocCard__source">OpenSearch · agent record</span>
      </div>
      <div className="pocCard__body">
        {/* Reference only — deliberately not a link. */}
        <div className="pocCard__logs">
          <div className="pocCard__logLine">
            {followUp.reference} {followUp.branch} — {followUp.description}
          </div>
        </div>
        <p className="pocCard__footnote">
          Reference only. The report does not link out and does not track this
          change.
        </p>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'timeline', title: 'RCA timeline', Card: TimelineCard },
  { id: 'metric', title: 'Metric', Card: MetricChartCard },
  { id: 'trace', title: 'Trace evidence', Card: TraceEvidenceCard },
  { id: 'logs', title: 'Log evidence', Card: LogEvidenceCard },
  { id: 'playbook', title: 'Playbook provenance', Card: PlaybookCard },
  { id: 'follow-up', title: 'Follow-up', Card: FollowUpCard },
];

export const FrontendP95ReportPage = () => {
  const incident = FRONTEND_P95_INCIDENT;

  return (
    <div className="pocInvestigation">
      <div className="pocInvestigation__body">
        <StatusHeader incident={incident} />

        {SECTIONS.map(({ id, title, Card }) => (
          <div key={id} className="pocInvestigation__section">
            <div className="pocInvestigation__sectionHeader">
              <span className="pocInvestigation__sectionTitle">{title}</span>
            </div>
            <Card incident={incident} />
          </div>
        ))}
      </div>
    </div>
  );
};
