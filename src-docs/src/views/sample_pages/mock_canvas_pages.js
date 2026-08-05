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

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart,
  Settings,
  Axis,
  LineSeries,
  LineAnnotation,
  AnnotationDomainType,
  ScaleType,
  RectAnnotation,
} from '@elastic/charts';
import {
  OuiBasicTable,
  OuiButton,
  OuiButtonIcon,
  OuiFlexGroup,
  OuiFlexItem,
  OuiHealth,
  OuiIcon,
  OuiLink,
  OuiPanel,
  OuiSpacer,
  OuiStat,
  OuiText,
  OuiTitle,
} from '../../../../src/components';
import { LogsPageBody, LogsPage } from './logs_page';
import { NewPplLogsPage } from './new_ppl_logs_page';

// Dot-matrix scan shimmer (same as home page widgets)
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

// Wrapper that shows shimmer for a random 1–2s before revealing content
const LoadingPanel = ({ children, delay }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!loaded) {
    return (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'inherit',
        }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
        <div
          style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
          <ScanShimmerOverlay />
        </div>
      </div>
    );
  }

  return children;
};

// Two-column key-value row
const KVRow = ({ label, children }) => (
  <OuiFlexItem grow={false} style={{ width: '50%', marginBottom: 16 }}>
    <OuiText size="xs">
      <strong>{label}</strong>
    </OuiText>
    <OuiText size="s">{children}</OuiText>
  </OuiFlexItem>
);

// Alert detail page mock
export const AlertPageMock = () => {
  const [delays] = useState(() => [
    1000 + Math.random() * 1000,
    1000 + Math.random() * 1000,
    1000 + Math.random() * 1000,
    1000 + Math.random() * 1000,
    1200 + Math.random() * 800,
  ]);

  return (
    <div className="mockCanvasPage">
      <OuiFlexGroup gutterSize="m" responsive={false}>
        <OuiFlexItem>
          <OuiPanel
            paddingSize="m"
            hasShadow={false}
            hasBorder
            style={{ overflow: 'hidden' }}>
            <LoadingPanel delay={delays[0]}>
              <OuiText color="danger" style={{ fontSize: 20, lineHeight: 1.3 }}>
                <strong>2,340ms</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                P99 latency
              </OuiText>
            </LoadingPanel>
          </OuiPanel>
        </OuiFlexItem>
        <OuiFlexItem>
          <OuiPanel
            paddingSize="m"
            hasShadow={false}
            hasBorder
            style={{ overflow: 'hidden' }}>
            <LoadingPanel delay={delays[1]}>
              <OuiText style={{ fontSize: 20, lineHeight: 1.3 }}>
                <strong>&gt; 2,000ms</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                for 15 min
              </OuiText>
            </LoadingPanel>
          </OuiPanel>
        </OuiFlexItem>
        <OuiFlexItem>
          <OuiPanel
            paddingSize="m"
            hasShadow={false}
            hasBorder
            style={{ overflow: 'hidden' }}>
            <LoadingPanel delay={delays[2]}>
              <OuiText style={{ fontSize: 20, lineHeight: 1.3 }}>
                <strong>3 of 4 pods</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                breaching
              </OuiText>
            </LoadingPanel>
          </OuiPanel>
        </OuiFlexItem>
        <OuiFlexItem>
          <OuiPanel
            paddingSize="m"
            hasShadow={false}
            hasBorder
            style={{ overflow: 'hidden' }}>
            <LoadingPanel delay={delays[3]}>
              <OuiText style={{ fontSize: 20, lineHeight: 1.3 }}>
                <strong>—</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                notification target
              </OuiText>
            </LoadingPanel>
          </OuiPanel>
        </OuiFlexItem>
      </OuiFlexGroup>

      <OuiSpacer size="m" />

      <OuiPanel
        paddingSize="m"
        hasShadow={false}
        hasBorder
        style={{ overflow: 'hidden' }}>
        <LoadingPanel delay={delays[4]}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}>
            <OuiText size="xs" color="subdued">
              <span
                style={{
                  fontFamily: 'var(--oui-code-font-family, monospace)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                P99 Latency · 6h
              </span>
            </OuiText>
            <OuiText size="xs" color="subdued">
              <span
                style={{
                  fontFamily: 'var(--oui-code-font-family, monospace)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#CE4239',
                  fontWeight: 700,
                }}>
                --- Threshold 2,000ms
              </span>
            </OuiText>
          </div>
          <OuiText size="s">
            <strong>Metric: payment-service P99 latency</strong>
          </OuiText>
          <OuiSpacer size="s" />
          <div style={{ height: 160 }}>
            <Chart>
              <Settings showLegend={false} />
              <Axis id="bottom" position="bottom" showGridLines={false} />
              <Axis
                id="left"
                position="left"
                showGridLines
                tickFormat={(d) => `${d}ms`}
              />
              <LineSeries
                id="p99"
                xScaleType={ScaleType.Linear}
                yScaleType={ScaleType.Linear}
                xAccessor="x"
                yAccessors={['y']}
                data={[
                  { x: 0, y: 120 },
                  { x: 1, y: 135 },
                  { x: 2, y: 180 },
                  { x: 3, y: 420 },
                  { x: 4, y: 1100 },
                  { x: 5, y: 2050 },
                  { x: 6, y: 2340 },
                ]}
              />
              <LineAnnotation
                id="threshold"
                domainType={AnnotationDomainType.YDomain}
                dataValues={[{ dataValue: 2000 }]}
                style={{
                  line: { stroke: '#FF6467', strokeWidth: 2, dash: [4, 4] },
                }}
              />
              <RectAnnotation
                id="breach"
                dataValues={[{ coordinates: { x0: 4, x1: 6, y0: 2000 } }]}
                style={{ fill: '#FF6467', opacity: 0.05 }}
              />
            </Chart>
          </div>
        </LoadingPanel>
      </OuiPanel>

      <OuiSpacer size="m" />

      <div className="mockAlertCallout">
        <OuiIcon type="alert" color="warning" size="m" />
        <OuiText size="s">
          Alarm triggered at May 13, 02:32 PM UTC — payment-service P99 crossed
          2,000ms threshold
        </OuiText>
      </div>

      <OuiSpacer size="m" />

      <OuiText size="s">
        <h4>Summary</h4>
        <p>payment-service P99 latency on production cluster</p>
        <h4>Recommendation</h4>
        <ul>
          <li>
            Check recent deployments to the affected service for regressions.
          </li>
          <li>
            Review upstream dependency health and connection pool metrics.
          </li>
          <li>
            Inspect application logs for error patterns correlated with the
            latency increase.
          </li>
          <li>Consider scaling the service if the issue is load-related.</li>
          <li>
            If this is a known issue, acknowledge the alert and update the
            runbook.
          </li>
        </ul>
      </OuiText>
    </div>
  );
};

// Markdown note page mock — Inventory service dependency analysis
export const InventoryAnalysisPageMock = () => (
  <div className="mockCanvasPage">
    <OuiText size="s">
      <h4>Overview</h4>
      <p>
        The inventory service is a downstream dependency of the payment service.
        During the latency spike window (14:20–14:47 UTC), the following was
        observed:
      </p>
      <h4>Connection Pool</h4>
      <ul>
        <li>Pool size: 50 (configured max)</li>
        <li>Active connections: 49–50 (saturated)</li>
        <li>Acquire wait time: 1,200–2,400ms (normally &lt;5ms)</li>
        <li>No connection errors — requests queue instead of failing</li>
      </ul>
      <h4>Response Times</h4>
      <ul>
        <li>Inventory service P99: 42ms (healthy, no degradation)</li>
        <li>Payment→Inventory network latency: 3ms (stable)</li>
        <li>
          Bottleneck is entirely in connection acquire, not downstream response
        </li>
      </ul>
      <h4>Conclusion</h4>
      <p>
        The inventory service itself is healthy. The latency is introduced by
        the payment service waiting for a free connection from its exhausted
        outbound pool.
      </p>
    </OuiText>
  </div>
);

// Markdown note page mock — Payment service connection pool metrics
export const ConnectionPoolPageMock = () => (
  <div className="mockCanvasPage">
    <OuiText size="s">
      <h4>Current Status</h4>
      <ul>
        <li>Pool max connections: 50</li>
        <li>Active connections: 50/50 (100%)</li>
        <li>Idle connections: 0</li>
        <li>Pending acquires: 847 (queued)</li>
      </ul>
      <h4>Acquire Wait Time</h4>
      <ul>
        <li>P50: 920ms</li>
        <li>P95: 1,840ms</li>
        <li>P99: 2,320ms</li>
        <li>Baseline (normal): &lt;5ms</li>
      </ul>
      <h4>Timeline</h4>
      <ul>
        <li>14:00 UTC — Pool utilization crosses 80%</li>
        <li>14:15 UTC — Pool fully saturated (100%)</li>
        <li>14:20 UTC — Acquire wait time exceeds 500ms</li>
        <li>14:32 UTC — P99 latency alert triggered</li>
      </ul>
      <h4>Recommendation</h4>
      <p>
        Increase pool max from 50 to 150. Add acquire timeout of 3s to fail fast
        instead of queuing indefinitely. Enable circuit breaker to prevent
        cascade.
      </p>
    </OuiText>
  </div>
);

// Logs page mock — uses the real LogsPageBody component with payment service data
const PAYMENT_LOG_QUERY =
  'source=opensearch_metrics_payment_service | where level="WARN" OR message LIKE "%timeout%" | sort -timestamp | head 25';

const PAYMENT_LOG_RESULTS = [
  {
    id: '1',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-xk2lp',
    FlightDelayMin: 1842,
  },
  {
    id: '2',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-mn4qr',
    FlightDelayMin: 2103,
  },
  {
    id: '3',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-xk2lp',
    FlightDelayMin: 1654,
  },
  {
    id: '4',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-ab8st',
    FlightDelayMin: 1920,
  },
  {
    id: '5',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-mn4qr',
    FlightDelayMin: 2340,
  },
  {
    id: '6',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-xk2lp',
    FlightDelayMin: 1780,
  },
  {
    id: '7',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-ab8st',
    FlightDelayMin: 1560,
  },
  {
    id: '8',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-mn4qr',
    FlightDelayMin: 2210,
  },
  {
    id: '9',
    FlightNum: 'INFO',
    Origin: 'request completed successfully',
    Dest: 'payment-7f8b9-xk2lp',
    FlightDelayMin: 45,
  },
  {
    id: '10',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-xk2lp',
    FlightDelayMin: 1890,
  },
  {
    id: '11',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-ab8st',
    FlightDelayMin: 1720,
  },
  {
    id: '12',
    FlightNum: 'DEBUG',
    Origin: 'pool checkout attempt',
    Dest: 'payment-7f8b9-mn4qr',
    FlightDelayMin: 3,
  },
  {
    id: '13',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-xk2lp',
    FlightDelayMin: 2050,
  },
  {
    id: '14',
    FlightNum: 'WARN',
    Origin: 'connection acquire timeout exceeded 1000ms',
    Dest: 'payment-7f8b9-mn4qr',
    FlightDelayMin: 1680,
  },
  {
    id: '15',
    FlightNum: 'INFO',
    Origin: 'request completed successfully',
    Dest: 'payment-7f8b9-ab8st',
    FlightDelayMin: 38,
  },
];

export const LogsPageMock = ({ onQueryExecute }) => (
  <div className="mockCanvasPage mockCanvasPage--fullBody">
    <LogsPageBody
      queryText={PAYMENT_LOG_QUERY}
      results={PAYMENT_LOG_RESULTS}
      compact
      onQueryExecute={onQueryExecute}
    />
  </div>
);

// Empty discover page — no query, no results, fully interactive
export const EmptyDiscoverPageMock = ({ onQueryExecute }) => (
  <div className="mockCanvasPage mockCanvasPage--fullBody">
    <LogsPage selectedItem={null} hideAskAi onQueryExecute={onQueryExecute} />
  </div>
);

// New PPL logs page — integrated AI query generation, source picker, code/builder toggle
export const NewPplLogsPageMock = ({ onQueryExecute }) => (
  <div className="mockCanvasPage mockCanvasPage--fullBody">
    <NewPplLogsPage hideAskAi onQueryExecute={onQueryExecute} />
  </div>
);

// Discover page with correlated logs query pre-filled and results showing
export const CorrelatedLogsDiscoverMock = ({ onQueryExecute }) => (
  <div className="mockCanvasPage mockCanvasPage--fullBody">
    <LogsPage
      selectedItem="connection-timeout-errors"
      hideAskAi
      onQueryExecute={onQueryExecute}
    />
  </div>
);

// Empty placeholder page for pages not yet implemented
export const EmptyPlaceholderPage = ({ title }) => (
  <div
    className="mockCanvasPage"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#676e75',
    }}>
    <p>{title || 'This page is empty'}</p>
  </div>
);

export const AppMapPageMock = () => (
  <EmptyPlaceholderPage title="Application Map" />
);
export const AppTracesPageMock = () => (
  <EmptyPlaceholderPage title="Application Traces" />
);
export const AppServicesPageMock = () => (
  <EmptyPlaceholderPage title="Application Services" />
);

// Trace analysis page mock — payments-db trace waterfall
export const TraceAnalysisPageMock = () => (
  <div className="mockCanvasPage">
    <OuiFlexGroup gutterSize="m" responsive={false}>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiText size="m" color="danger">
            <strong>8,400ms</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Peak latency
          </OuiText>
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiText size="m">
            <strong>12ms → 8,400ms</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Latency spike
          </OuiText>
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiText size="m">
            <strong>14:29:58</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Spike start
          </OuiText>
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiText size="m" color="danger">
            <strong>3 prior</strong>
          </OuiText>
          <OuiText size="xs" color="subdued">
            Matching incidents
          </OuiText>
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
      <OuiTitle size="xs">
        <h3>Trace waterfall — payments-db dependency</h3>
      </OuiTitle>
      <OuiSpacer size="s" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OuiText size="xs" style={{ width: 140, flexShrink: 0 }}>
            payment-service
          </OuiText>
          <div
            style={{
              flex: 1,
              height: 20,
              background: 'rgba(0,119,204,0.15)',
              borderRadius: 3,
              position: 'relative',
            }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '100%',
                background: '#0077CC',
                borderRadius: 3,
                opacity: 0.8,
              }}
            />
            <OuiText
              size="xs"
              style={{ position: 'absolute', right: 4, top: 2, color: '#fff' }}>
              8,400ms
            </OuiText>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OuiText
            size="xs"
            style={{ width: 140, flexShrink: 0, paddingLeft: 16 }}>
            → acquire_conn
          </OuiText>
          <div
            style={{
              flex: 1,
              height: 20,
              background: 'rgba(255,100,103,0.15)',
              borderRadius: 3,
              position: 'relative',
            }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '95%',
                background: '#FF6467',
                borderRadius: 3,
                opacity: 0.8,
              }}
            />
            <OuiText
              size="xs"
              style={{ position: 'absolute', right: 4, top: 2, color: '#fff' }}>
              8,200ms
            </OuiText>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OuiText
            size="xs"
            style={{ width: 140, flexShrink: 0, paddingLeft: 16 }}>
            → query payments-db
          </OuiText>
          <div
            style={{
              flex: 1,
              height: 20,
              background: 'rgba(0,191,179,0.15)',
              borderRadius: 3,
              position: 'relative',
            }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '2%',
                background: '#00BFB3',
                borderRadius: 3,
                opacity: 0.8,
              }}
            />
            <OuiText
              size="xs"
              style={{ position: 'absolute', left: '3%', top: 2 }}>
              12ms
            </OuiText>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OuiText
            size="xs"
            style={{ width: 140, flexShrink: 0, paddingLeft: 16 }}>
            → serialize
          </OuiText>
          <div
            style={{
              flex: 1,
              height: 20,
              background: 'rgba(0,191,179,0.15)',
              borderRadius: 3,
              position: 'relative',
            }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '1%',
                background: '#00BFB3',
                borderRadius: 3,
                opacity: 0.8,
              }}
            />
            <OuiText
              size="xs"
              style={{ position: 'absolute', left: '2%', top: 2 }}>
              3ms
            </OuiText>
          </div>
        </div>
      </div>
    </OuiPanel>

    <OuiSpacer size="m" />

    <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
      <OuiTitle size="xs">
        <h3>Connection pool exhaustion timeline</h3>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiBasicTable
        items={[
          { time: '14:29:00', latency: '12ms', pool: '45%', status: 'healthy' },
          { time: '14:29:30', latency: '85ms', pool: '72%', status: 'healthy' },
          {
            time: '14:29:58',
            latency: '1,200ms',
            pool: '94%',
            status: 'warning',
          },
          {
            time: '14:30:15',
            latency: '4,800ms',
            pool: '100%',
            status: 'danger',
          },
          {
            time: '14:30:30',
            latency: '8,400ms',
            pool: '100%',
            status: 'danger',
          },
        ]}
        columns={[
          { field: 'time', name: 'Time (UTC)' },
          { field: 'latency', name: 'Latency' },
          { field: 'pool', name: 'Pool Util.' },
          {
            field: 'status',
            name: 'Status',
            render: (status) => (
              <OuiHealth
                color={
                  status === 'healthy'
                    ? 'success'
                    : status === 'warning'
                    ? 'warning'
                    : 'danger'
                }>
                {status}
              </OuiHealth>
            ),
          },
        ]}
        compressed
      />
    </OuiPanel>

    <OuiSpacer size="m" />

    <OuiText size="s">
      <h4>Pattern match</h4>
      <p>
        This matches a pattern from 3 previous incidents where connection pool
        exhaustion caused cascading timeouts. In each case, the pool reached
        100% utilization before latency spiked above 5,000ms.
      </p>
    </OuiText>
  </div>
);

// Dashboard mock — Payment service connection pool dashboard
export const DashboardPageMock = () => (
  <div
    className="mockCanvasPage mockCanvasPage--fullBody"
    style={{ padding: 12, overflow: 'auto' }}>
    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="98%"
            description="Pool utilization"
            titleColor="danger"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="1,840ms"
            description="Acquire wait (P95)"
            titleColor="danger"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="50/50"
            description="Active connections"
            titleColor="accent"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiStat
            title="OFF"
            description="Circuit breaker"
            titleColor="subdued"
            titleSize="m"
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiFlexGroup gutterSize="m">
      <OuiFlexItem grow={2}>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Connection pool by pod</h3>
          </OuiTitle>
          <OuiSpacer size="s" />
          <OuiBasicTable
            items={[
              {
                pod: 'payment-7f8b9-xk2lp',
                active: '50/50',
                waiting: 312,
                acquireP99: '2,320ms',
                status: 'danger',
              },
              {
                pod: 'payment-7f8b9-mn4qr',
                active: '50/50',
                waiting: 287,
                acquireP99: '2,180ms',
                status: 'danger',
              },
              {
                pod: 'payment-7f8b9-ab8st',
                active: '50/50',
                waiting: 248,
                acquireP99: '1,940ms',
                status: 'danger',
              },
              {
                pod: 'payment-7f8b9-jd7wp',
                active: '42/50',
                waiting: 0,
                acquireP99: '12ms',
                status: 'healthy',
              },
            ]}
            columns={[
              { field: 'pod', name: 'Pod' },
              { field: 'active', name: 'Active' },
              { field: 'waiting', name: 'Waiting' },
              { field: 'acquireP99', name: 'Acquire P99' },
              {
                field: 'status',
                name: 'Status',
                render: (status) => (
                  <OuiHealth
                    color={status === 'healthy' ? 'success' : 'danger'}>
                    {status === 'healthy' ? 'healthy' : 'saturated'}
                  </OuiHealth>
                ),
              },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
      <OuiFlexItem grow={1}>
        <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
          <OuiTitle size="xs">
            <h3>Recent events</h3>
          </OuiTitle>
          <OuiSpacer size="m" />
          <OuiBasicTable
            items={[
              {
                severity: 'danger',
                event: 'Pool saturated',
                detail: '3 of 4 pods',
                time: '15 min ago',
              },
              {
                severity: 'warning',
                event: 'Acquire wait > 1s',
                detail: 'payment-7f8b9-xk2lp',
                time: '20 min ago',
              },
              {
                severity: 'warning',
                event: 'Pool utilization > 80%',
                detail: 'All pods',
                time: '32 min ago',
              },
            ]}
            columns={[
              {
                field: 'severity',
                name: '',
                width: '24px',
                render: (severity) => (
                  <OuiIcon type="alert" color={severity} size="s" />
                ),
              },
              {
                field: 'event',
                name: 'Event',
                render: (v) => <strong>{v}</strong>,
              },
              { field: 'detail', name: 'Source' },
              { field: 'time', name: 'When' },
            ]}
            compressed
          />
        </OuiPanel>
      </OuiFlexItem>
    </OuiFlexGroup>

    <OuiSpacer size="m" />

    <OuiPanel paddingSize="m" hasShadow={false} hasBorder>
      <OuiTitle size="xs">
        <h3>P99 latency timeline</h3>
      </OuiTitle>
      <OuiSpacer size="s" />
      <OuiBasicTable
        items={[
          { time: '14:00', latency: '120ms', pool: '72%', waiting: 0 },
          { time: '14:10', latency: '180ms', pool: '85%', waiting: 12 },
          { time: '14:20', latency: '520ms', pool: '94%', waiting: 89 },
          { time: '14:30', latency: '1,840ms', pool: '100%', waiting: 312 },
          { time: '14:40', latency: '2,320ms', pool: '100%', waiting: 847 },
          { time: '14:47', latency: '2,410ms', pool: '100%', waiting: 891 },
        ]}
        columns={[
          { field: 'time', name: 'Time (UTC)' },
          { field: 'latency', name: 'P99 Latency' },
          { field: 'pool', name: 'Pool Util.' },
          { field: 'waiting', name: 'Queued Requests' },
        ]}
        compressed
      />
    </OuiPanel>
  </div>
);

// Dashboard list page mock
const DASHBOARD_LIST_ITEMS = [
  {
    id: 'dash-1',
    title: 'System overview',
    updated: '5 min ago',
    pageKey: 'dashboards',
  },
  {
    id: 'dash-2',
    title: 'Web traffic analytics',
    updated: '15 min ago',
    pageKey: 'dashboards',
  },
  {
    id: 'dash-3',
    title: 'API performance',
    updated: '30 min ago',
    pageKey: 'dashboards',
  },
  {
    id: 'dash-4',
    title: 'Payment service — connection pool',
    updated: 'Just now',
    pageKey: 'dashboards',
  },
  {
    id: 'dash-5',
    title: 'Infrastructure health',
    updated: '2 hours ago',
    pageKey: 'dashboards',
  },
  {
    id: 'dash-6',
    title: 'Network throughput',
    updated: '1 day ago',
    pageKey: 'dashboards',
  },
];

export const DashboardListPageMock = ({ onSelectPage }) => (
  <div
    className="mockCanvasPage mockCanvasPage--fullBody"
    style={{ padding: 24 }}>
    <div
      style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <OuiButton iconType="plusInCircle" size="s">
        Create dashboard
      </OuiButton>
    </div>
    <OuiBasicTable
      items={DASHBOARD_LIST_ITEMS}
      columns={[
        {
          field: 'title',
          name: 'Name',
          render: (title, item) => (
            <OuiLink
              onClick={() => onSelectPage && onSelectPage(item.pageKey, title)}>
              {title}
            </OuiLink>
          ),
        },
        { field: 'updated', name: 'Last updated' },
      ]}
      compressed
    />
  </div>
);

// Alert list page mock
const ALERT_LIST_ITEMS = [
  {
    id: 'alert-1',
    title: 'CPU threshold exceeded',
    severity: 'Critical',
    triggered: '10 min ago',
    pageKey: 'alerts',
  },
  {
    id: 'alert-2',
    title: 'Disk usage warning',
    severity: 'Warning',
    triggered: '1 hour ago',
    pageKey: 'alerts',
  },
  {
    id: 'alert-3',
    title: 'Error rate spike',
    severity: 'Critical',
    triggered: '3 hours ago',
    pageKey: 'alerts',
  },
  {
    id: 'alert-4',
    title: 'Payment service P99 latency breach',
    severity: 'Critical',
    triggered: '15 min ago',
    pageKey: 'alerts',
  },
  {
    id: 'alert-5',
    title: 'Memory pressure warning',
    severity: 'Warning',
    triggered: '6 hours ago',
    pageKey: 'alerts',
  },
  {
    id: 'alert-6',
    title: 'Connection pool exhaustion',
    severity: 'Critical',
    triggered: '20 min ago',
    pageKey: 'alerts',
  },
];

export const AlertListPageMock = ({ onSelectPage }) => (
  <div
    className="mockCanvasPage mockCanvasPage--fullBody"
    style={{ padding: 24 }}>
    <div
      style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <OuiButton iconType="plusInCircle" size="s">
        Create monitor
      </OuiButton>
    </div>
    <OuiBasicTable
      items={ALERT_LIST_ITEMS}
      columns={[
        {
          field: 'title',
          name: 'Alert',
          render: (title, item) => (
            <OuiLink
              onClick={() => onSelectPage && onSelectPage(item.pageKey, title)}>
              {title}
            </OuiLink>
          ),
        },
        { field: 'severity', name: 'Severity' },
        { field: 'triggered', name: 'Triggered' },
      ]}
      compressed
    />
  </div>
);
