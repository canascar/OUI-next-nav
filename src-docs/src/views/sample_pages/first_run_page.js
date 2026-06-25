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
  OuiButtonIcon,
  OuiCompressedTextArea,
  OuiIcon,
  OuiInsightCard,
  OuiSmallButton,
  OuiTitle,
  OuiToolTip,
} from '../../../../src/components';

import { SessionLeftNav } from './session_left_nav';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';

// ─── Reusable components (same as empty session page) ─────────

const ScanShimmerOverlay = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth,
        h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sp = 9;
      const cols = Math.max(1, Math.round((w - sp) / sp));
      const rows = Math.max(1, Math.round((h - sp) / sp));
      const ox = (w - (cols - 1) * sp) / 2,
        oy = (h - (rows - 1) * sp) / 2;
      const dots = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          dots.push({ x: ox + i * sp, y: oy + j * sp });

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
      const w = cv.clientWidth,
        h = cv.clientHeight;
      if (!w || !h) return null;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sp = 7;
      const cols = Math.max(1, Math.round((w - sp) / sp));
      const rows = Math.max(1, Math.round((h - sp) / sp));
      const ox = (w - (cols - 1) * sp) / 2,
        oy = (h - (rows - 1) * sp) / 2;
      const dots = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          dots.push({ x: ox + i * sp, y: oy + j * sp });
      const field = { ctx, w, h, sp, dots, cx: w / 2, cy: h / 2 };
      const box =
        cv.parentElement &&
        cv.parentElement.querySelector('[data-surround-box]');
      if (box) {
        const cr = cv.getBoundingClientRect(),
          br = box.getBoundingClientRect();
        field.hole = {
          x0: br.left - cr.left,
          y0: br.top - cr.top,
          x1: br.right - cr.left,
          y1: br.bottom - cr.top,
        };
      }
      return field;
    };
    const draw = (f, t) => {
      const { ctx, w, h, sp, dots } = f;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const hl = f.hole;
        if (!hl) continue;
        if (d.x > hl.x0 && d.x < hl.x1 && d.y > hl.y0 && d.y < hl.y1) continue;
        const sdx = Math.max(hl.x0 - d.x, d.x - hl.x1, 0);
        const sdy = Math.max(hl.y0 - d.y, d.y - hl.y1, 0);
        const sdist = Math.hypot(sdx, sdy);
        const bcx = (hl.x0 + hl.x1) / 2,
          bcy = (hl.y0 + hl.y1) / 2;
        const sa = Math.atan2(d.y - bcy, d.x - bcx) / 6.2832 + 0.5;
        const sph = (t * 0.04) % 1;
        const sdm = Math.min(Math.abs(sa - sph), 1 - Math.abs(sa - sph));
        const sph2 = (sph + 0.5) % 1;
        const sd2m = Math.min(Math.abs(sa - sph2), 1 - Math.abs(sa - sph2));
        const near = Math.exp(-Math.pow(sdist / (sp * 2.6), 2));
        const sg =
          Math.exp(-Math.pow(sdm * 6, 2)) +
          0.4 * Math.exp(-Math.pow(sd2m * 6, 2));
        let b =
          0.07 * Math.exp(-Math.pow(sdist / (sp * 4.5), 2)) + 0.6 * sg * near;
        if (b < 0.01) continue;
        b = Math.max(0, Math.min(1, b));
        const a = (0.1 + 0.6 * b).toFixed(3);
        const r = Math.round(60 + 50 * b),
          g = Math.round(80 + 50 * b),
          bl = Math.round(200 + 40 * b);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.6 + b * 1.4, 0, 6.2832);
        ctx.fillStyle = `rgba(${r},${g},${bl},${a})`;
        ctx.fill();
      }
    };
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        padding: '36px 42px',
        margin: '-36px -42px',
      }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />
      <div data-surround-box="1" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

const WidgetHeader = ({ title }) => (
  <div className="widgetHeader">
    <span className="widgetHeader__title">{title}</span>
  </div>
);

// ─── Data ─────────────────────────────────────────────────────

const DISCOVERY_ITEMS = [
  { icon: 'heart', label: 'Services', count: 247 },
  { icon: 'logsApp', label: 'Log groups', count: 34 },
  { icon: 'grid', label: 'Applications', count: 12 },
  { icon: 'bolt', label: 'Traces', count: '1.2M' },
  { icon: 'copyClipboard', label: 'Agents', count: 8 },
  { icon: 'bell', label: 'Alarms', count: 19 },
];

const WORKFLOW_ITEMS = [
  { label: 'Logs', icon: 'navDiscover' },
  { label: 'Metrics', icon: 'visArea' },
  { label: 'Dashboards', icon: 'navDashboards' },
  { label: 'Alerts', icon: 'navAlerting' },
  { label: 'Application Map', icon: 'navServiceMap' },
  { label: 'More', icon: 'apps' },
];

// ─── Page Component ───────────────────────────────────────────

export const FirstRunPage = () => {
  const [phase, setPhase] = useState('scanning');
  const [revealedItems, setRevealedItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [mascotExpression, setMascotExpression] = useState(undefined);

  useEffect(() => {
    const timers = [];
    DISCOVERY_ITEMS.forEach((_, idx) => {
      const t = setTimeout(() => {
        setRevealedItems((prev) => [...prev, idx]);
      }, 1200 + idx * 600);
      timers.push(t);
    });
    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, 1200 + DISCOVERY_ITEMS.length * 600 + 400);
    timers.push(doneTimer);
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleUseSampleData = () => {
    window.location.hash = '/sample-pages';
  };

  return (
    <div
      className="samplePagesWrapper"
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      <SessionLeftNav
        sessionCount={0}
        sessions={[]}
        onCreateSession={handleUseSampleData}
        onBrowseSessions={() => {}}
        onBrowseLibrary={() => {}}
        onSelectSession={() => {}}
        activeView="session"
        isEmptySession={true}
        disableActions
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div className="emptySessionPage">
          <div className="emptySessionPage__panel">
            <div className="emptySessionPage__twoCol">
              {/* Left column — Welcome + chat input */}
              <div className="emptySessionPage__leftCol">
                <div className="emptySessionPage__headerRow">
                  <OuiToolTip
                    content="Hi, I'm Olly — your OpenSearch agent assistant"
                    position="right">
                    <div
                      className="emptySessionPage__avatarWrap"
                      onMouseEnter={() => {
                        if (!mascotExpression) setMascotExpression('happy');
                      }}
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
                      />
                    </div>
                  </OuiToolTip>
                </div>

                <OuiTitle size="m">
                  <h1>Welcome to OpenSearch Dashboards.</h1>
                </OuiTitle>

                <div className="emptySessionPage__briefingNarrative emptySessionPage__briefingNarrative--news">
                  <p className="emptySessionPage__narrativePara emptySessionPage__newsSummary emptySessionPage__briefingFadeIn">
                    We&rsquo;ve detected services, log groups, and telemetry in
                    your environment. Your first dashboard is ready.
                  </p>

                  <OuiTitle size="xs" style={{ paddingTop: 8 }}>
                    <h3>What would you like to do?</h3>
                  </OuiTitle>
                </div>

                {/* Chat input — same structure as day-n page */}
                <div className="emptySessionPage__inlineInput">
                  <div className="emptySessionPage__inputWrap">
                    <SurroundShimmer>
                      <div className="emptySessionPage__inputField">
                        <OuiCompressedTextArea
                          placeholder="Ask Olly anything…"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          rows={3}
                          resize="none"
                          fullWidth
                          className="emptySessionPage__textarea"
                        />
                        <div className="emptySessionPage__inputActions">
                          <span />
                          <OuiToolTip content="Send message" position="top">
                            <OuiButtonIcon
                              iconType="sortUp"
                              aria-label="Send"
                              display="fill"
                              size="xs"
                              isDisabled={!inputValue.trim()}
                            />
                          </OuiToolTip>
                        </div>
                      </div>
                    </SurroundShimmer>
                  </div>

                  <div style={{ paddingTop: 16 }}>
                    <OuiSmallButton
                      onClick={handleUseSampleData}
                      iconType="play">
                      Use OpenSearch Sample data
                    </OuiSmallButton>
                  </div>
                </div>
              </div>

              {/* Right column — Discovery then Overview */}
              <div className="emptySessionPage__rightCol">
                <div
                  className="emptySessionPage__briefing"
                  style={{ padding: 24, gap: 0 }}>
                  <div className="emptySessionPage__tabRow emptySessionPage__tabRow--sticky">
                    <span className="emptySessionPage__overviewTitle">
                      {phase === 'scanning'
                        ? 'Discovering your environment…'
                        : 'Overview'}
                    </span>
                    <span className="emptySessionPage__overviewStatus">
                      {phase === 'scanning' ? (
                        <>
                          <OuiAgenticSpinner size="s" />
                          <span style={{ marginLeft: 6 }}>Scanning…</span>
                        </>
                      ) : (
                        <>
                          <span className="emptySessionPage__overviewStatusDot" />
                          just now
                        </>
                      )}
                    </span>
                  </div>

                  <div className="emptySessionPage__briefingContent">
                    <div className="emptySessionPage__briefingPanel">
                      <div className="emptySessionPage__widgetGrid">
                        {/* Discovery cards — span full width */}
                        <div className="emptySessionPage__widgetWrap emptySessionPage__widget--wide">
                          <div className="firstRunPage__discoveryGrid">
                            {DISCOVERY_ITEMS.map((item, idx) => {
                              const isRevealed = revealedItems.includes(idx);
                              return (
                                <div
                                  key={item.label}
                                  className={`firstRunPage__discoveryCard ${
                                    isRevealed
                                      ? 'firstRunPage__discoveryCard--revealed'
                                      : ''
                                  }`}>
                                  {!isRevealed && <ScanShimmerOverlay />}
                                  <OuiIcon
                                    type={item.icon}
                                    size="l"
                                    color="subdued"
                                  />
                                  <div className="firstRunPage__discoveryCardText">
                                    <strong>{item.label}</strong>
                                    <span className="firstRunPage__discoveryCardCount">
                                      {isRevealed
                                        ? `${item.count} found`
                                        : 'scanning…'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Open a page — left widget */}
                        {phase === 'done' && (
                          <div className="emptySessionPage__widgetWrap">
                            <div className="emptySessionPage__workflowsWidget">
                              <div className="emptySessionPage__workflowsHeader">
                                <span className="emptySessionPage__workflowsTitle">
                                  Open a page
                                </span>
                              </div>
                              <div className="emptySessionPage__workflowsGrid">
                                {WORKFLOW_ITEMS.map((item, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    className="emptySessionPage__workflowItem"
                                    onClick={handleUseSampleData}>
                                    <OuiIcon type={item.icon} size="s" />
                                    <span>{item.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Top services — right widget */}
                        {phase === 'done' && (
                          <div className="emptySessionPage__widgetWrap">
                            <OuiInsightCard>
                              <WidgetHeader title="Top services by fault rate" />
                              <div className="widgetCard__tableHeader">
                                <span>SERVICE</span>
                                <span>FAULT RATE</span>
                              </div>
                              <div className="widgetCard__rows">
                                <div className="widgetCard__barRow">
                                  <span className="widgetCard__barLabel">
                                    checkout
                                  </span>
                                  <div className="widgetCard__barTrack">
                                    <div
                                      className="widgetCard__barFill"
                                      style={{ width: '67%' }}
                                    />
                                  </div>
                                  <span className="widgetCard__barValue">
                                    66.67%
                                  </span>
                                </div>
                                <div className="widgetCard__barRow">
                                  <span className="widgetCard__barLabel">
                                    frontend
                                  </span>
                                  <div className="widgetCard__barTrack">
                                    <div
                                      className="widgetCard__barFill widgetCard__barFill--secondary"
                                      style={{ width: '14.5%' }}
                                    />
                                  </div>
                                  <span className="widgetCard__barValue">
                                    14.49%
                                  </span>
                                </div>
                                <div className="widgetCard__barRow">
                                  <span className="widgetCard__barLabel">
                                    frontend-proxy
                                  </span>
                                  <div className="widgetCard__barTrack">
                                    <div
                                      className="widgetCard__barFill widgetCard__barFill--secondary"
                                      style={{ width: '14.3%' }}
                                    />
                                  </div>
                                  <span className="widgetCard__barValue">
                                    14.29%
                                  </span>
                                </div>
                              </div>
                            </OuiInsightCard>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
