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
import { OuiButtonIcon, OuiIcon, OuiInsightCard } from '../../../../src/components';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';

// Reusable widget header
const WidgetHeader = ({ title }) => (
  <div className="widgetHeader">
    <span className="widgetHeader__title">{title}</span>
  </div>
);

// Chart texture pattern
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
    <pattern id={id} width="6.5" height="6.5" patternUnits="userSpaceOnUse">
      <circle cx="3.25" cy="3.25" r="1.05" fill={color || '#1F9D6B'} opacity="0.42" />
    </pattern>
  );
};

// Status pill colors
const STATUS_COLORS = {
  red: { bg: 'rgba(220, 38, 38, 0.08)', color: '#DC2626' },
  amber: { bg: 'rgba(180, 83, 9, 0.08)', color: '#B45309' },
  green: { bg: 'rgba(14, 110, 82, 0.08)', color: '#0E6E52' },
  blue: { bg: 'rgba(26, 93, 168, 0.08)', color: '#1A5DA8' },
};

// Findings data (scenario 2 — active incident)
const FINDINGS = [
  {
    key: 'critical-loop',
    status: 'Critical',
    statusColor: 'red',
    title: 'checkout-agent is looping — 1,994 retries in the last 6 minutes',
    body: 'The checkout-agent entered an infinite retry loop at 14:26 UTC. Each retry hits the order-db connection pool, which is now at 98% capacity. No circuit breaker is configured.',
    evidence: ['1,994 retries in 6 min', 'order-db pool: 98%', 'No circuit breaker configured'],
  },
  {
    key: 'critical-root-cause',
    status: 'Critical',
    statusColor: 'red',
    title: 'Root cause: order-db pool at 98%, handler returns 200 on empty',
    body: 'The /checkout endpoint handler returns HTTP 200 even when no rows are found. The agent interprets this as "not done yet" and retries indefinitely.',
    evidence: ['Handler returns 200 on empty result set', 'Agent retry logic expects 404 for "not found"'],
  },
  {
    key: 'info-fixes',
    status: 'Review',
    statusColor: 'blue',
    title: 'Three fixes available: cap retries, raise pool, fix 200-on-empty',
    body: 'Recommended action: apply all three fixes in sequence. Cap retries at 5 (immediate), raise pool limit to 200 (config change), fix 200-on-empty to return 404 (code change).',
    evidence: ['Cap retries → immediate relief', 'Raise pool → prevents exhaustion', 'Fix 200-on-empty → root cause'],
  },
];

// Widget data
const WIDGET_DATA = {
  services: [
    { name: 'checkout', pct: 88, value: '88.24%' },
    { name: 'order-service', pct: 41, value: '41.18%' },
    { name: 'payment', pct: 18, value: '17.65%' },
    { name: 'frontend', pct: 5, value: '5.47%' },
  ],
  timeout: {
    value: '2,341',
    trend: '↑ 184%',
    curve: 'M0,55 C30,52 60,48 100,40 C150,30 200,15 280,5',
    fill: 'M0,55 C30,52 60,48 100,40 C150,30 200,15 280,5 L280,68 L0,68 Z',
  },
  alerts: [
    { name: 'checkout-agent loop', status: 'CRITICAL' },
    { name: 'order-db pool 98%', status: 'CRITICAL' },
    { name: 'Connection pool exhaustion', status: 'CRITICAL' },
  ],
  utilization: {
    value: '94%',
    curve: 'M0,40 C30,38 70,32 120,26 C170,20 220,12 280,8',
    fill: 'M0,40 C30,38 70,32 120,26 C170,20 220,12 280,8 L280,68 L0,68 Z',
  },
  deploys: [8, 12, 15, 11, 9],
};

// Dot-matrix scan shimmer (same as home page widgets)
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

const WIDGET_CATALOG = [
  { id: 'connection-timeout', label: 'Connection timeout errors', icon: 'visLine' },
  { id: 'recent-alerts', label: 'Recent alerts', icon: 'navAlerting' },
  { id: 'resource-utilization', label: 'Resource utilization', icon: 'visArea' },
  { id: 'top-services', label: 'Top services by fault rate', icon: 'visBarHorizontal' },
  { id: 'deployment-timeline', label: 'Deploys', icon: 'visBarVertical' },
  { id: 'saved-queries', label: 'Saved queries', icon: 'search' },
  { id: 'dashboards', label: 'Dashboards', icon: 'navDashboards' },
  { id: 'p99-latency', label: 'P99 latency', icon: 'visLine' },
  { id: 'error-rate', label: 'Error rate by service', icon: 'visArea' },
  { id: 'throughput', label: 'Throughput', icon: 'visLine' },
  { id: 'active-incidents', label: 'Active incidents', icon: 'alert' },
  { id: 'slo-compliance', label: 'SLO compliance', icon: 'checkInCircleFilled' },
  { id: 'cost-today', label: 'Cost today', icon: 'currency' },
];

/**
 * OverviewHomePage — Merged insights + widgets as a canvas page.
 * Used as the default tab in /home2 (v7 variant).
 */
export const OverviewHomePage = () => {
  const [findingsLoaded, setFindingsLoaded] = useState(0);
  const [expandedFindings, setExpandedFindings] = useState(() => new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [widgetPickerSearch, setWidgetPickerSearch] = useState('');
  const [widgetOrder, setWidgetOrder] = useState([
    'connection-timeout', 'recent-alerts', 'resource-utilization', 'top-services', 'deployment-timeline',
  ]);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);
  const [refreshingWidgets, setRefreshingWidgets] = useState({
    'connection-timeout': true,
    'recent-alerts': true,
    'resource-utilization': true,
    'top-services': true,
    'deployment-timeline': true,
  });

  // Staggered findings: one by one
  useEffect(() => {
    const timers = [];
    const baseDelay = 1200;
    for (let i = 0; i < FINDINGS.length; i++) {
      timers.push(setTimeout(() => {
        setFindingsLoaded((prev) => prev + 1);
      }, baseDelay + i * (1000 + Math.random() * 1200)));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  // Listen for edit toggle from page panel header settings button
  useEffect(() => {
    const handleEditToggle = () => {
      setIsEditMode((prev) => {
        if (prev) {
          setShowWidgetPicker(false);
          setWidgetPickerSearch('');
        }
        return !prev;
      });
    };
    window.addEventListener('overview-home-edit-toggle', handleEditToggle);
    return () => window.removeEventListener('overview-home-edit-toggle', handleEditToggle);
  }, []);

  // Listen for refresh event from page panel header
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshingWidgets({
        'connection-timeout': true,
        'recent-alerts': true,
        'resource-utilization': true,
        'top-services': true,
        'deployment-timeline': true,
      });
      setFindingsLoaded(0);
      const ids = ['connection-timeout', 'recent-alerts', 'resource-utilization', 'top-services', 'deployment-timeline'];
      ids.forEach((id) => {
        setTimeout(() => {
          setRefreshingWidgets((prev) => ({ ...prev, [id]: false }));
        }, 1000 + Math.random() * 2000);
      });
      for (let i = 0; i < FINDINGS.length; i++) {
        setTimeout(() => {
          setFindingsLoaded((prev) => prev + 1);
        }, 800 + i * (800 + Math.random() * 1000));
      }
    };
    window.addEventListener('overview-home-refresh', handleRefresh);
    return () => window.removeEventListener('overview-home-refresh', handleRefresh);
  }, []);

  // Staggered widgets: random delays like v6
  useEffect(() => {
    const ids = ['connection-timeout', 'recent-alerts', 'resource-utilization', 'top-services', 'deployment-timeline'];
    const timers = ids.map((id) =>
      setTimeout(() => {
        setRefreshingWidgets((prev) => ({ ...prev, [id]: false }));
      }, 1500 + Math.random() * 2500)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const utilNum = parseInt(WIDGET_DATA.utilization.value);
  const utilColor = utilNum > 80 ? '#DC2626' : utilNum > 60 ? '#B45309' : '#1F9D6B';
  const utilStroke = utilNum > 80 ? '#ef4444' : utilNum > 60 ? '#f59e0b' : '#34d399';

  const renderWidgetContent = (widgetId) => {
    switch (widgetId) {
      case 'connection-timeout':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Connection timeout errors" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">{WIDGET_DATA.timeout.value}</span>
              <span className="widgetCard__trend widgetCard__trend--warning">{WIDGET_DATA.timeout.trend}</span>
            </div>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs><ChartTexture id="v7connStripe" variant="stripe" color="#DD8A3A" /></defs>
                <path d={WIDGET_DATA.timeout.fill} fill="url(#v7connStripe)" />
                <path d={WIDGET_DATA.timeout.curve} fill="none" stroke="#DD8A3A" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      case 'recent-alerts':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Recent alerts" />
            <div className="widgetCard__tableHeader"><span>ALERT</span><span>STATUS</span></div>
            <div className="widgetCard__rows">
              {WIDGET_DATA.alerts.map((alert) => (
                <div key={alert.name} className="widgetCard__statusRow">
                  <span className="widgetCard__statusLabel">{alert.name}</span>
                  <span className="widgetCard__statusBadge widgetCard__statusBadge--critical">{alert.status}</span>
                </div>
              ))}
            </div>
          </OuiInsightCard>
        );
      case 'resource-utilization':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Resource utilization" />
            <span className="widgetCard__bigNumber" style={{ color: utilColor }}>{WIDGET_DATA.utilization.value}</span>
            <div className="widgetCard__chart">
              <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 56, display: 'block' }}>
                <defs><ChartTexture id="v7resStripe" variant="stripe" color={utilStroke} /></defs>
                <path d={WIDGET_DATA.utilization.fill} fill="url(#v7resStripe)" />
                <path d={WIDGET_DATA.utilization.curve} fill="none" stroke={utilStroke} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </OuiInsightCard>
        );
      case 'top-services':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Top services by fault rate" />
            <div className="widgetCard__tableHeader"><span>SERVICE</span><span>FAULT RATE</span></div>
            <div className="widgetCard__rows">
              {WIDGET_DATA.services.map((svc, i) => (
                <div key={svc.name} className="widgetCard__barRow">
                  <span className="widgetCard__barLabel">{svc.name}</span>
                  <div className="widgetCard__barTrack"><div className={`widgetCard__barFill${i > 0 ? ' widgetCard__barFill--secondary' : ''}`} style={{ width: `${svc.pct}%` }} /></div>
                  <span className="widgetCard__barValue">{svc.value}</span>
                </div>
              ))}
            </div>
          </OuiInsightCard>
        );
      case 'deployment-timeline':
        return (
          <OuiInsightCard>
            <WidgetHeader title="Deployment timeline" />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span className="widgetCard__bigNumber">{Math.round(WIDGET_DATA.deploys.reduce((a, b) => a + b, 0) / WIDGET_DATA.deploys.length)}</span>
              <span className="widgetCard__trend" style={{ opacity: 0.45 }}>avg/day</span>
            </div>
            <div className="widgetCard__chart">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
                {WIDGET_DATA.deploys.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: '60%', height: `${(d / Math.max(...WIDGET_DATA.deploys)) * 36}px`, background: '#2BA98A', borderRadius: 2 }} />
                    <span style={{ fontSize: 8, color: 'rgba(0,0,0,0.35)' }}>{['M','T','W','T','F'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </OuiInsightCard>
        );
      default:
        return <OuiInsightCard><WidgetHeader title={widgetId} /><span className="widgetCard__bigNumber">—</span></OuiInsightCard>;
    }
  };

  return (
    <div className="overviewHomePage">
      {/* Findings / Insights section */}
      <div className="overviewHomePage__section">
        <div className="overviewHomePage__sectionHeader">
          <span className="overviewHomePage__sectionTitle">Insights</span>
          <span className="overviewHomePage__sectionMeta">Updated 2m ago</span>
        </div>
        <div className="overviewHomePage__findings">
          {FINDINGS.map((finding, i) => {
            if (i >= findingsLoaded) return null;
            const colors = STATUS_COLORS[finding.statusColor] || STATUS_COLORS.blue;
            const isExpanded = expandedFindings.has(finding.key);
            return (
              <div
                key={finding.key}
                className={`overviewHomePage__findingCard${isExpanded ? ' overviewHomePage__findingCard--expanded' : ''}`}
                onClick={() => {
                  setExpandedFindings((prev) => {
                    const next = new Set(prev);
                    if (next.has(finding.key)) next.delete(finding.key);
                    else next.add(finding.key);
                    return next;
                  });
                }}>
                <div className="overviewHomePage__findingCardMain">
                  <span
                    className="overviewHomePage__statusPill"
                    style={{ background: colors.bg, color: colors.color }}>
                    {finding.status}
                  </span>
                  <span className="overviewHomePage__findingTitle">{finding.title}</span>
                  <OuiIcon
                    type="arrowDown"
                    size="s"
                    className={`overviewHomePage__findingChevron${isExpanded ? ' overviewHomePage__findingChevron--expanded' : ''}`}
                  />
                </div>
                {isExpanded && (
                  <div className="overviewHomePage__findingBody">
                    <p className="overviewHomePage__findingBodyText">{finding.body}</p>
                    {finding.evidence && (
                      <ul className="overviewHomePage__evidenceList">
                        {finding.evidence.map((e, idx) => <li key={idx}>{e}</li>)}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {findingsLoaded < FINDINGS.length && (
            <div className="overviewHomePage__findingsLoader">
              <OuiAgenticSpinner size="s" />
            </div>
          )}
        </div>
      </div>

      {/* Widget grid */}
      <div className="overviewHomePage__section">
        <div className={`overviewHomePage__widgetGrid${isEditMode ? ' overviewHomePage__widgetGrid--editing' : ''}`}>
          {widgetOrder.map((widgetId) => (
            <div
              key={widgetId}
              className={`overviewHomePage__widgetWrap${draggedWidget === widgetId ? ' overviewHomePage__widgetWrap--dragging' : ''}${dragOverWidget === widgetId ? ' overviewHomePage__widgetWrap--dragOver' : ''}`}
              draggable={isEditMode}
              onDragStart={() => { if (isEditMode) setDraggedWidget(widgetId); }}
              onDragOver={(e) => { if (isEditMode && draggedWidget && draggedWidget !== widgetId) { e.preventDefault(); setDragOverWidget(widgetId); } }}
              onDragLeave={() => setDragOverWidget(null)}
              onDrop={() => {
                if (draggedWidget && draggedWidget !== widgetId) {
                  setWidgetOrder((prev) => {
                    const next = [...prev];
                    const fromIdx = next.indexOf(draggedWidget);
                    const toIdx = next.indexOf(widgetId);
                    next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, draggedWidget);
                    return next;
                  });
                }
                setDraggedWidget(null);
                setDragOverWidget(null);
              }}
              onDragEnd={() => { setDraggedWidget(null); setDragOverWidget(null); }}
            >
              {isEditMode && (
                <button
                  type="button"
                  className="overviewHomePage__widgetRemove"
                  onClick={() => setWidgetOrder((prev) => prev.filter((id) => id !== widgetId))}>
                  <OuiIcon type="cross" size="s" />
                </button>
              )}
              {refreshingWidgets[widgetId] ? (
                <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
                  <div style={{ visibility: 'hidden' }}>
                    <OuiInsightCard><WidgetHeader title={widgetId} /><span className="widgetCard__bigNumber">—</span></OuiInsightCard>
                  </div>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
                    <div className="ouiInsightCard" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><ScanShimmerOverlay /></div>
                  </div>
                </div>
              ) : renderWidgetContent(widgetId)}
            </div>
          ))}

          {/* Add widget tile (edit mode) */}
          {isEditMode && (
            <div
              className="overviewHomePage__widgetAdd"
              onClick={() => setShowWidgetPicker(true)}>
              <OuiIcon type="plusInCircle" size="m" />
              <span>Add widget</span>
            </div>
          )}
          </div>

          {/* Widget picker */}
          {showWidgetPicker && (
            <div className="overviewHomePage__widgetPicker">
              <div className="overviewHomePage__widgetPickerHeader">
                <div className="overviewHomePage__widgetPickerSearch">
                  <OuiIcon type="search" size="s" />
                  <input
                    type="text"
                    placeholder="Search widgets..."
                    value={widgetPickerSearch}
                    onChange={(e) => setWidgetPickerSearch(e.target.value)}
                    className="overviewHomePage__widgetPickerInput"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  className="overviewHomePage__widgetPickerClose"
                  onClick={() => { setShowWidgetPicker(false); setWidgetPickerSearch(''); setIsEditMode(false); }}>
                  <OuiIcon type="cross" size="m" />
                </button>
              </div>
              <div className="overviewHomePage__widgetPickerList">
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
                        className={`overviewHomePage__widgetPickerItem${alreadyAdded ? ' overviewHomePage__widgetPickerItem--added' : ''}${atLimit && !alreadyAdded ? ' overviewHomePage__widgetPickerItem--disabled' : ''}`}
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setWidgetOrder((prev) => [...prev, w.id]);
                          }
                        }}>
                        <OuiIcon type={w.icon} size="s" />
                        <span>{w.label}</span>
                        {alreadyAdded && <span className="overviewHomePage__widgetPickerAdded">Added</span>}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
