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
  useMemo,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import {
  OuiButtonIcon,
  OuiCompressedTextArea,
  OuiContextMenu,
  OuiIcon,
  OuiInsightCard,
  OuiPopover,
  OuiSmallButton,
  OuiSmallButtonEmpty,
  OuiText,
  OuiTitle,
  OuiToolTip,
} from '../../../../src/components';

import { SOURCE_PAGE_MOCK } from './session_models';
import { OllyAvatar } from './olly_avatar';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

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
      const sp = 9;
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

/**
 * ChartTexture — SVG pattern fills for area charts.
 * `variant="stripe"` — diagonal hatching (for warning/orange charts).
 * `variant="dots"` — dot grid (for success/green charts).
 * Renders an SVG `<defs>` block with a `<pattern>` identified by `id`.
 */
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

/**
 * WidgetHeader — Consistent title row for all right-column widgets.
 * Ensures uniform spacing, icon sizing, and text treatment.
 */
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

/**
 * Quick access shortcut definitions.
 * Maps to existing OUI icon assets.
 */

/**
 * Filter chips for the bottom section.
 */
const FILTER_CHIPS = [
  { key: 'recent', label: null, icon: 'history', iconOnly: true },
  { key: 'activity', label: 'Overview' },
  { key: 'discover', label: 'Discover', icon: 'navDiscover' },
  { key: 'monitor', label: 'Monitor', icon: 'navAlerting' },
  { key: 'more', label: 'More', icon: 'apps' },
];

/**
 * "Open a page" grid items. Clicking one opens the related page in a new session.
 */
const WORKFLOW_ITEMS_PRIMARY = [
  { label: 'Logs', pageKey: 'logs', icon: 'navDiscover' },
  { label: 'Metrics', pageKey: 'metrics', icon: 'visArea' },
  { label: 'Dashboards', pageKey: 'dashboards', icon: 'navDashboards' },
];

const WORKFLOW_ITEMS_OVERFLOW = [
  { label: 'Alerts', pageKey: 'alerts', icon: 'navAlerting' },
  { label: 'Application Map', pageKey: 'app-map', icon: 'navServiceMap' },
  {
    label: 'Application Services',
    pageKey: 'app-perf-services',
    icon: 'navOverview',
  },
  { label: 'Application Traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Forecasting', pageKey: 'forecasting', icon: 'visLine' },
  { label: 'Agent traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Agent spans', pageKey: 'agent-spans', icon: 'visTagCloud' },
];

/**
 * Hover preview data for narrative links.
 * Shown in the right panel when hovering a session link in the left column.
 */
const SESSION_PREVIEWS = {
  'latency-spike-session': {
    summary:
      'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods.',
    stats: [
      { label: 'P99', value: '2,340ms', color: 'danger' },
      { label: 'Errors', value: '0.2%', color: 'success' },
      { label: 'Throughput', value: '1,240/s', color: 'default' },
      { label: 'Pool Util', value: '31%', color: 'success' },
    ],
    finding:
      'Connection pool at 98% — requests queuing rather than failing fast. 847 connection-acquire-timeout entries in the last 30 min.',
    action:
      'Increase pool max 50 → 150, enable circuit breaker, add monitoring dashboard.',
    meta:
      'Created by AI · 15 min ago · Alert triggered · No recent deployments · 3 of 4 pods affected',
  },
  'error-rate-spike-session': {
    summary:
      'Checkout error rate spiked to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
    stats: [
      { label: 'Error Rate', value: '12.4%', color: 'danger' },
      { label: 'P99', value: '890ms', color: 'warning' },
      { label: 'Affected', value: 'checkout', color: 'default' },
      { label: 'Deploy', value: '2h ago', color: 'warning' },
    ],
    finding:
      'Auth-service v2.4.1 introduced a regression in OIDC token validation — tokens expire before refresh, causing cascading 401s on the checkout path.',
    action:
      'Rollback auth-service to v2.3.9, verify error rate normalizes, then hotfix the token refresh logic.',
    meta:
      'Shared by team · 2 hours ago · Deployment correlated · Checkout path affected',
  },
  'dns-timeout-session': {
    summary:
      'DNS resolution timeouts spiking on os-data-3. Upstream resolver intermittently unresponsive — queries exceeding 5s threshold.',
    stats: [
      { label: 'Timeouts', value: '142', color: 'warning' },
      { label: 'Avg Resolve', value: '4.8s', color: 'warning' },
      { label: 'Affected', value: 'os-data-3', color: 'default' },
      { label: 'Duration', value: '3h', color: 'default' },
    ],
    finding:
      'Upstream DNS resolver 10.0.1.53 intermittently dropping UDP packets — correlates with network maintenance window on the resolver host.',
    action:
      'Add secondary resolver fallback, increase timeout to 10s, escalate to network team if recurrence continues.',
    meta:
      'Detected by AI · 3 hours ago · Single node affected · No customer impact yet',
  },
};

/**
 * Mock data for each filter chip.
 */
const CHIP_DATA = {
  activity: [
    {
      key: 'insight-1',
      title: 'Latency Spike Investigation',
      subtitle: 'Created by AI · 15 min ago',
      summary:
        'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
      meta: 'Alert: Payment service P99 latency breach',
      icon: 'alert',
      sessionId: 'latency-spike-session',
    },
    {
      key: 'insight-2',
      title: 'Error Rate Spike — Checkout Service',
      subtitle: 'Shared by team · 2 hours ago',
      summary:
        'Checkout error rate jumped to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
      meta: 'Shared from Sichenl',
      icon: 'user',
      sessionId: 'error-rate-spike-session',
    },
  ],
  recent: [
    {
      key: 'dash-1',
      title: 'System overview',
      subtitle: 'Dashboard · Updated 5 min ago',
    },
    {
      key: 'log-5',
      title: 'Connection timeout errors',
      subtitle: 'Saved log · source=logs | where severity="ERROR"',
    },
    {
      key: 'met-2',
      title: 'CPU utilization',
      subtitle: 'Saved metric · Updated 30 min ago',
    },
    {
      key: 'dash-4',
      title: 'Payment service — connection pool',
      subtitle: 'Dashboard · Created from thread',
    },
  ],
  favorite: [
    {
      key: 'fav-1',
      title: 'System overview',
      subtitle: 'Dashboard',
      pageKey: 'dashboards',
      typeIcon: 'navDashboards',
    },
    {
      key: 'fav-2',
      title: 'Error rate by service',
      subtitle: 'Saved log',
      pageKey: 'logs',
      typeIcon: 'navDiscover',
    },
  ],
  discover: [
    {
      key: 'log-1',
      title: 'Error rate by service',
      subtitle: 'source=logs | where level="ERROR"',
    },
    {
      key: 'log-2',
      title: 'Auth failure events',
      subtitle: 'source=logs | where event="auth_fail"',
    },
    {
      key: 'log-3',
      title: 'Slow query log',
      subtitle: 'source=logs | where duration > 5000',
    },
    {
      key: 'log-4',
      title: 'Payment service timeout logs',
      subtitle: 'source=payment | where level="WARN"',
    },
    {
      key: 'log-5b',
      title: 'Connection timeout errors',
      subtitle: 'source=logs | where severity="ERROR"',
    },
  ],
  monitor: [
    {
      key: 'alert-1',
      title: 'CPU threshold exceeded',
      subtitle: 'Critical · 10 min ago',
    },
    {
      key: 'alert-2',
      title: 'Disk usage warning',
      subtitle: 'Warning · 1 hour ago',
    },
    {
      key: 'alert-3',
      title: 'Error rate spike',
      subtitle: 'Critical · 3 hours ago',
    },
    {
      key: 'alert-4',
      title: 'Payment service P99 latency breach',
      subtitle: 'Critical · 15 min ago',
      meta: 'Active',
      icon: 'alert',
    },
  ],
  more: [
    {
      key: 'other-1',
      title: 'Inventory service dependency map',
      subtitle: 'Notebook · Updated 2 hours ago',
    },
    {
      key: 'other-2',
      title: 'Weekly capacity report',
      subtitle: 'Notebook · Updated 1 day ago',
    },
    {
      key: 'other-3',
      title: 'Deployment rollback runbook',
      subtitle: 'Notebook · Updated 3 days ago',
    },
  ],
};

/**
 * Saved objects data for the bottom section when a quick access item is selected.
 */
const SAVED_OBJECTS = {
  dashboards: {
    items: [
      {
        key: 'system-overview',
        title: 'System overview',
        subtitle: 'Updated 5 min ago',
      },
      {
        key: 'web-traffic',
        title: 'Web traffic analytics',
        subtitle: 'Updated 15 min ago',
      },
      {
        key: 'api-performance',
        title: 'API performance',
        subtitle: 'Updated 30 min ago',
      },
      {
        key: 'payment-pool-dashboard',
        title: 'Payment service — connection pool',
        subtitle: 'Created from thread · just now',
      },
    ],
  },
  logs: {
    tabs: [
      { id: 'saved-results', name: 'Saved results' },
      { id: 'saved-query', name: 'Saved query' },
    ],
    tabItems: {
      'saved-results': [
        {
          key: 'error-rate',
          title: 'Error rate by service',
          subtitle: 'source=logs | where level="ERROR"',
        },
        {
          key: 'auth-failures',
          title: 'Auth failure events',
          subtitle: 'source=logs | where event="auth_fail"',
        },
        {
          key: 'slow-queries',
          title: 'Slow query log',
          subtitle: 'source=logs | where duration > 5000',
        },
        {
          key: 'payment-timeout-logs',
          title: 'Payment service timeout logs',
          subtitle: 'source=payment | where level="WARN"',
        },
        {
          key: 'connection-timeout-errors',
          title: 'Connection timeout errors',
          subtitle: 'source=logs | where severity="ERROR"',
        },
      ],
      'saved-query': [
        {
          key: 'query-latency-by-host',
          title: 'Latency by host',
          subtitle: 'source=logs | stats avg(latency) by host',
        },
        {
          key: 'query-5xx-responses',
          title: '5xx responses',
          subtitle: 'source=logs | where status >= 500 | stats count() by path',
        },
        {
          key: 'query-top-users',
          title: 'Top users by request count',
          subtitle: 'source=logs | stats count() as requests by user',
        },
      ],
    },
  },
  metrics: {
    tabs: [
      { id: 'saved-results', name: 'Saved results' },
      { id: 'saved-query', name: 'Saved query' },
    ],
    tabItems: {
      'saved-results': [
        {
          key: 'throughput',
          title: 'Throughput over time',
          subtitle: 'source=metrics | stats avg(throughput)',
        },
        {
          key: 'cpu-utilization',
          title: 'CPU utilization',
          subtitle: 'source=metrics | stats avg(cpu) by host',
        },
        {
          key: 'memory-pressure',
          title: 'Memory pressure',
          subtitle: 'source=metrics | stats max(mem_used)',
        },
      ],
      'saved-query': [
        {
          key: 'query-disk-io',
          title: 'Disk I/O by volume',
          subtitle: 'source=metrics | stats avg(disk_io) by volume',
        },
        {
          key: 'query-network-errors',
          title: 'Network error rate',
          subtitle: 'source=metrics | where net_errors > 0',
        },
        {
          key: 'query-gc-pauses',
          title: 'GC pause duration',
          subtitle: 'source=metrics | stats max(gc_pause_ms) by service',
        },
      ],
    },
  },
};

/**
 * SystemCallout — Displays a system alert with red left border and pink background.
 *
 * @param {Object} props
 * @param {import('./session_models').SystemAlert} props.alert
 * @param {(pageKey: string) => void} props.onAction
 */
const SystemCallout = ({ alert, onAction }) => {
  if (!alert) return null;

  return (
    <div className="emptySessionPage__callout" role="alert">
      <div className="emptySessionPage__calloutBorder" />
      <div className="emptySessionPage__calloutContent">
        <p className="emptySessionPage__calloutText">{alert.message}</p>
        <button
          type="button"
          className="emptySessionPage__calloutCta"
          onClick={() => onAction(alert.actionTarget)}>
          {alert.actionLabel}
        </button>
      </div>
    </div>
  );
};

/**
 * DualPurposeInput — Input field that accepts AI prompts or page search queries.
 *
 * @param {Object} props
 * @param {(prompt: string) => void} props.onStartThread
 * @param {(pageKey: string) => void} props.onOpenPage
 */
const DualPurposeInput = ({
  onStartThread,
  onOpenPage,
  onSearchChange,
  onFocus,
  onBlur,
  onHoverStart,
  onHoverEnd,
  borderActive,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  const matchingPages = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase();
    return Object.entries(SOURCE_PAGE_MOCK)
      .filter(([, { title }]) => title.toLowerCase().includes(query))
      .map(([key, { title }]) => ({ key, title }));
  }, [inputValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const exactMatch = Object.entries(SOURCE_PAGE_MOCK).find(
        ([, { title }]) =>
          title.toLowerCase() === inputValue.trim().toLowerCase()
      );
      if (exactMatch) {
        onOpenPage(exactMatch[0]);
      } else {
        onStartThread(inputValue.trim());
      }
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  return (
    <div
      className={`emptySessionPage__inputWrap${
        borderActive ? ' emptySessionPage__inputWrap--borderActive' : ''
      }`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}>
      <SurroundShimmer>
      <div className="emptySessionPage__inputField">
        <OuiCompressedTextArea
          placeholder="Ask AI anything, or type to search a page"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleSubmit}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={3}
          resize="none"
          fullWidth
          autoFocus
          className="emptySessionPage__textarea"
        />
        <div className="emptySessionPage__inputActions">
          <OuiToolTip content={isAttachMenuOpen ? '' : 'Attach'} position="top">
            <OuiPopover
              button={
                <OuiButtonIcon
                  iconType="plus"
                  aria-label="Add attachment"
                  size="xs"
                  color="text"
                  onMouseDown={(e) => e.preventDefault()}
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
                      {
                        name: 'Upload data',
                        icon: 'importAction',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Upload file or photo',
                        icon: 'document',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Take screenshot',
                        icon: 'fullScreen',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      { name: 'Add to session', icon: 'folderOpen', panel: 1 },
                    ],
                  },
                  {
                    id: 1,
                    title: 'Recent sessions',
                    items: [
                      {
                        name: 'Latency spike investigation',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Checkout error rate alert',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                      {
                        name: 'Node disk pressure alerts',
                        onClick: () => setIsAttachMenuOpen(false),
                      },
                    ],
                  },
                ]}
              />
            </OuiPopover>
          </OuiToolTip>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <OuiToolTip content="Dictate" position="top">
              <OuiButtonIcon
                aria-label="Dictate"
                size="xs"
                color="text"
                display="empty"
                iconType={() => (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M12 19v3" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <rect x="9" y="2" width="6" height="13" rx="3" />
                  </svg>
                )}
              />
            </OuiToolTip>
            <OuiToolTip content="Send message" position="top">
              <OuiButtonIcon
                iconType="sortUp"
                aria-label="Send"
                display="fill"
                size="xs"
                isDisabled={!inputValue.trim()}
                onClick={() => {
                  if (inputValue.trim()) {
                    const exactMatch = Object.entries(SOURCE_PAGE_MOCK).find(
                      ([, { title }]) =>
                        title.toLowerCase() === inputValue.trim().toLowerCase()
                    );
                    if (exactMatch) {
                      onOpenPage(exactMatch[0]);
                    } else {
                      onStartThread(inputValue.trim());
                    }
                    setInputValue('');
                    setShowSuggestions(false);
                  }
                }}
              />
            </OuiToolTip>
          </div>
        </div>
      </div>
      </SurroundShimmer>
    </div>
  );
};

/**
 * RecentAndFavoriteTabs — Tabbed section showing recent visits and favorites.
 *
 * @param {Object} props
 * @param {import('./session_models').RecentItem[]} props.recentItems
 * @param {import('./session_models').FavoriteItem[]} props.favoriteItems
 * @param {(pageKey: string) => void} props.onOpenPage
 */
const RecentAndFavoriteTabs = ({ recentItems, favoriteItems, onOpenPage }) => {
  const [activeTab, setActiveTab] = useState('recent');

  const items = activeTab === 'recent' ? recentItems : favoriteItems;

  const handleItemClick = (item) => {
    if (item.pageKey) {
      onOpenPage(item.pageKey);
    }
  };

  return (
    <div className="emptySessionPage__tabs">
      <OuiTabs size="s" display="condensed" style={{ maxWidth: 'fit-content' }}>
        <OuiTab
          isSelected={activeTab === 'recent'}
          onClick={() => setActiveTab('recent')}>
          Recent
        </OuiTab>
        <OuiTab
          isSelected={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}>
          Favorite
        </OuiTab>
      </OuiTabs>
      <div className="emptySessionPage__tabContent" role="tabpanel">
        {items.length === 0 ? (
          <>
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
            <div className="emptySessionPage__placeholderRow" />
          </>
        ) : (
          <ul className="emptySessionPage__itemList">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="emptySessionPage__listItem"
                  onClick={() => handleItemClick(item)}>
                  <OuiIcon
                    type={item.type === 'page' ? 'document' : 'apps'}
                    size="s"
                  />
                  <span className="emptySessionPage__listItemTitle">
                    {item.title}
                  </span>
                  {activeTab === 'recent' && item.visitedAt && (
                    <span className="emptySessionPage__listItemTime">
                      {formatRelativeTime(item.visitedAt)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * BottomSection — Shows saved objects list when a browse key is active,
 * otherwise shows Recent/Favorite tabs.
 */
const BottomSection = ({
  browseKey,
  recentItems,
  favoriteItems,
  onOpenPage,
}) => {
  const [subTab, setSubTab] = useState(null);

  // Reset sub-tab when browse key changes
  React.useEffect(() => {
    if (browseKey && SAVED_OBJECTS[browseKey]?.tabs) {
      setSubTab(SAVED_OBJECTS[browseKey].tabs[0].id);
    } else {
      setSubTab(null);
    }
  }, [browseKey]);

  if (!browseKey || !SAVED_OBJECTS[browseKey]) {
    return (
      <RecentAndFavoriteTabs
        recentItems={recentItems}
        favoriteItems={favoriteItems}
        onOpenPage={onOpenPage}
      />
    );
  }

  const data = SAVED_OBJECTS[browseKey];

  // Simple list (dashboards)
  if (data.items && !data.tabs) {
    return (
      <div className="emptySessionPage__tabs">
        <div className="emptySessionPage__sectionTitle">Dashboards</div>
        <div className="emptySessionPage__tabContent">
          {data.items.map((item) => (
            <button
              key={item.key}
              className="emptySessionPage__listItem"
              onClick={() => onOpenPage(browseKey)}>
              <span className="emptySessionPage__listItemTitle">
                {item.title}
              </span>
              <span className="emptySessionPage__listItemTime">
                {item.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tabbed list (logs, metrics)
  const activeSubTab = subTab || (data.tabs ? data.tabs[0].id : null);
  const tabItems = data.tabItems[activeSubTab] || [];

  return (
    <div className="emptySessionPage__tabs">
      <OuiTabs size="s" display="condensed" style={{ maxWidth: 'fit-content' }}>
        {data.tabs.map((tab) => (
          <OuiTab
            key={tab.id}
            isSelected={activeSubTab === tab.id}
            onClick={() => setSubTab(tab.id)}>
            {tab.name}
          </OuiTab>
        ))}
      </OuiTabs>
      <div className="emptySessionPage__tabContent">
        {tabItems.map((item) => (
          <button
            key={item.key}
            className="emptySessionPage__listItem"
            onClick={() => onOpenPage(browseKey)}>
            <span className="emptySessionPage__listItemTitle">
              {item.title}
            </span>
            <span className="emptySessionPage__listItemTime">
              {item.subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Format a timestamp as relative time (e.g., "2 hours ago").
 * @param {number} timestamp
 * @returns {string}
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * NarrativeLink — Inline link with a hover popover showing session preview.
 */
const NarrativeLink = ({ sessionId, children, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const preview = SESSION_PREVIEWS[sessionId];

  const handleMouseEnter = () => {
    clearTimeout(closeTimerRef.current);
    timerRef.current = setTimeout(() => setIsOpen(true), 300);
  };
  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 200);
  };
  const handlePopoverEnter = () => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(timerRef.current);
  };
  const handlePopoverLeave = () => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  const button = (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a
      className="emptySessionPage__narrativeLink"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      {children}
    </a>
  );

  if (!preview) return button;

  return (
    <OuiPopover
      button={button}
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
      anchorPosition="downCenter"
      panelPaddingSize="none"
      hasArrow={false}
      panelClassName="emptySessionPage__previewPopover"
      panelProps={{
        onMouseEnter: handlePopoverEnter,
        onMouseLeave: handlePopoverLeave,
      }}>
      <div className="emptySessionPage__sessionPreview">
        <p className="emptySessionPage__previewSummary">{preview.summary}</p>
        <div className="emptySessionPage__previewStats">
          {preview.stats.map((stat, i) => (
            <div
              key={i}
              className={`emptySessionPage__previewStat emptySessionPage__previewStat--${stat.color}`}>
              <span className="emptySessionPage__previewStatValue">
                {stat.value}
              </span>
              <span className="emptySessionPage__previewStatLabel">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        <div className="emptySessionPage__previewSection">
          <span className="emptySessionPage__previewSectionLabel">Finding</span>
          <p className="emptySessionPage__previewSectionText">
            {preview.finding}
          </p>
        </div>
        <div className="emptySessionPage__previewSection">
          <span className="emptySessionPage__previewSectionLabel">
            Recommended action
          </span>
          <p className="emptySessionPage__previewSectionText">
            {preview.action}
          </p>
        </div>
        <p className="emptySessionPage__previewMeta">{preview.meta}</p>
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <OuiSmallButtonEmpty
            iconType="arrowRight"
            iconSide="right"
            size="xs"
            color="text"
            style={{ borderRadius: 999 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onClick();
            }}>
            Investigate
          </OuiSmallButtonEmpty>
        </div>
      </div>
    </OuiPopover>
  );
};

/**
 * EmptySessionPage — The welcome experience shown when a session has no thread and no pages open.
 *
 * Displays a centered panel with:
 * - Welcome title
 * - System callout (when alerts are present)
 * - Dual-purpose input (AI prompt or page search)
 * - Quick access row with shortcut buttons
 * - Recent visit / Favorite tabs
 *
 * @param {Object} props
 * @param {(prompt: string) => void} props.onStartThread - Callback to start a new AI thread
 * @param {(pageKey: string) => void} props.onOpenPage - Callback to open a page as a tab
 * @param {import('./session_models').RecentItem[]} props.recentItems - Recently visited items
 * @param {import('./session_models').FavoriteItem[]} props.favoriteItems - Favorited items
 * @param {import('./session_models').SystemAlert|null} props.systemAlert - Active system alert
 */
export const EmptySessionPage = ({
  onStartThread,
  onOpenPage,
  onOpenPageInNewSession,
  onBrowseLibrary,
  onViewSession,
  onStartInvestigation,
  onSelectSession,
  sessions = [],
  recentItems = [],
  favoriteItems = [],
  systemAlert = null,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [greeting] = useState(() => {
    const greetings = [
      'Good morning, John',
      'What are you working on John?',
      'Where should we start today John?',
      'Hey hey, John!',
      'Ready when you are, John',
      "What's for today John?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  const [briefingPhase, setBriefingPhase] = useState('loading-summary');

  useEffect(() => {
    const t1 = setTimeout(() => setBriefingPhase('summary-visible'), 500);
    const t2 = setTimeout(() => setBriefingPhase('loading-alerts'), 1000);
    const t3 = setTimeout(() => setBriefingPhase('done'), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const [activeChip, setActiveChip] = useState('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedItems, setDismissedItems] = useState(new Set());
  const [dismissingItems, setDismissingItems] = useState(new Set());
  const [inputHovered, setInputHovered] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputActive = inputHovered || inputFocused;
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrolledFromTop, setScrolledFromTop] = useState(false);
  const [mascotExpression, setMascotExpression] = useState(undefined);
  const [rightPanelWidth, setRightPanelWidth] = useState(50);
  const resizeRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [widgetOrder, setWidgetOrder] = useState([
    'top-services',
    'workflows',
    'connection-timeout',
    'recent-alerts',
    'resource-utilization',
    'saved-queries',
    'dashboards',
    'deployment-timeline',
  ]);
  const [widgetSizes, setWidgetSizes] = useState({ dashboards: 2, 'deployment-timeline': 2 });
  const [workflowsExpanded, setWorkflowsExpanded] = useState(false);
  const [workflowSearch, setWorkflowSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingWidgets, setRefreshingWidgets] = useState(() => {
    const initial = {};
    ['top-services', 'connection-timeout', 'recent-alerts', 'deployment-timeline', 'resource-utilization', 'saved-queries', 'dashboards'].forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });
  const [dataVariant, setDataVariant] = useState(0);
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const dragWidget = useRef(null);
  const dragOverWidget = useRef(null);
  const resizingWidget = useRef(null);

  const handleWidgetDragStart = (idx) => {
    dragWidget.current = idx;
  };
  const handleWidgetDragOver = (e, idx) => {
    e.preventDefault();
    dragOverWidget.current = idx;
  };
  const handleWidgetDrop = () => {
    if (dragWidget.current === null || dragOverWidget.current === null) return;
    const newOrder = [...widgetOrder];
    const [dragged] = newOrder.splice(dragWidget.current, 1);
    newOrder.splice(dragOverWidget.current, 0, dragged);
    setWidgetOrder(newOrder);
    dragWidget.current = null;
    dragOverWidget.current = null;
  };
  const handleWidgetResize = (widgetId) => {
    setWidgetSizes((prev) => {
      const current = prev[widgetId] || 1;
      const next = current >= 2 ? 1 : 2;
      return { ...prev, [widgetId]: next };
    });
  };
  const handleWidgetRemove = (widgetId) => {
    setWidgetOrder((prev) => prev.filter((id) => id !== widgetId));
    setConfirmingRemoval(null);
  };
  const [hasAnimatedBriefing, setHasAnimatedBriefing] = useState(false);
  const scrollRef = useRef(null);
  const briefingRef = useRef(null);
  const insightsRef = useRef(null);

  // Staggered initial load — each widget resolves after 1-3s
  useEffect(() => {
    const ids = ['top-services', 'connection-timeout', 'recent-alerts', 'deployment-timeline', 'resource-utilization', 'saved-queries', 'dashboards'];
    const timers = ids.map((id) => {
      const delay = 1000 + Math.random() * 2000;
      return setTimeout(() => {
        setRefreshingWidgets((prev) => ({ ...prev, [id]: false }));
      }, delay);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Mark briefing animations as done after initial load
  React.useEffect(() => {
    const timer = setTimeout(() => setHasAnimatedBriefing(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrolledFromTop(scrollRef.current.scrollTop > 0);
    }
  }, []);

  // Insight card hover — single card only, no proximity
  const handleInsightHover = useCallback((hoveredIndex) => {
    if (!insightsRef.current) return;
    const cards = insightsRef.current.querySelectorAll('.ouiInsightCard');
    cards.forEach((el, i) => {
      el.style.transform = i === hoveredIndex ? 'scale(1.02)' : '';
    });
  }, []);

  const handleInsightMouseDown = useCallback((pressedIndex) => {
    if (!insightsRef.current) return;
    const cards = insightsRef.current.querySelectorAll('.ouiInsightCard');
    cards.forEach((el, i) => {
      el.style.transform = i === pressedIndex ? 'scale(0.97)' : '';
    });
  }, []);

  const handleInsightMouseLeave = useCallback(() => {
    if (!insightsRef.current) return;
    insightsRef.current.querySelectorAll('.ouiInsightCard').forEach((el) => {
      el.style.transform = '';
    });
  }, []);

  // Build a flat searchable list from all chip data + SOURCE_PAGE_MOCK
  const allSearchableItems = useMemo(() => {
    const items = [];
    // Add all chip data items
    Object.entries(CHIP_DATA).forEach(([category, categoryItems]) => {
      categoryItems.forEach((item) => {
        items.push({
          ...item,
          category,
          pageKey:
            category === 'discover'
              ? 'logs'
              : category === 'monitor'
              ? 'alerts'
              : category === 'recent'
              ? 'dashboards'
              : category === 'favorite'
              ? 'dashboards'
              : 'notebooks',
        });
      });
    });
    // Add SOURCE_PAGE_MOCK pages
    Object.entries(SOURCE_PAGE_MOCK).forEach(([pageKey, { title }]) => {
      items.push({
        key: `page-${pageKey}`,
        title,
        subtitle: 'Page',
        category: 'pages',
        pageKey,
      });
    });
    return items;
  }, []);

  // Filter items based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query))
    );
  }, [searchQuery, allSearchableItems]);

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    const twoCol = e.target.closest('.emptySessionPage__twoCol');
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

  return (
    <div className="emptySessionPage">
      <div className="emptySessionPage__panel">
        {/* Two-column layout */}
        <div className="emptySessionPage__twoCol">
          {/* Left column — AI-generated reading paragraph with inline widgets */}
          <div className="emptySessionPage__leftCol">
            {/* Mascot + status — above title */}
            <div className="emptySessionPage__headerRow">
              <OuiToolTip content="Hi, I'm Olly — your OpenSearch agent assistant" position="right">
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
                    color={mascotColor}
                    eyeColor={mascotEyeColor}
                  />
                </div>
              </OuiToolTip>
            </div>
            <OuiTitle size="m">
              <h1>{greeting}</h1>
            </OuiTitle>

            <div className="emptySessionPage__briefingNarrative emptySessionPage__briefingNarrative--news">
              {briefingPhase === 'loading-summary' && (
                <div className="emptySessionPage__briefingSpinner">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
              {briefingPhase !== 'loading-summary' && (
                <p className="emptySessionPage__narrativePara emptySessionPage__newsSummary emptySessionPage__briefingFadeIn">
                  <strong>244 of 247</strong> services healthy. No degradation,
                  no cascading failures.
                </p>
              )}
              {briefingPhase === 'loading-alerts' && (
                <div className="emptySessionPage__briefingSpinner">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
              {briefingPhase === 'done' && (
                <>
                  <div className="emptySessionPage__newsItem emptySessionPage__briefingFadeIn">
                    <span className="emptySessionPage__newsBadge emptySessionPage__newsBadge--critical">
                      Critical
                    </span>
                    <span className="emptySessionPage__newsBody">
                      <NarrativeLink
                        sessionId="latency-spike-session"
                        onClick={() =>
                          onSelectSession('latency-spike-session')
                        }>
                        Payment service P99 breached 2,000ms
                      </NarrativeLink>{' '}
                      — connection pool exhaustion on 3 of 4 pods. Root cause
                      identified.
                    </span>
                  </div>
                  <div className="emptySessionPage__newsItem emptySessionPage__briefingFadeIn emptySessionPage__briefingFadeIn--2">
                    <span className="emptySessionPage__newsBadge emptySessionPage__newsBadge--warning">
                      Warning
                    </span>
                    <span className="emptySessionPage__newsBody">
                      <NarrativeLink
                        sessionId="error-rate-spike-session"
                        onClick={() =>
                          onSelectSession('error-rate-spike-session')
                        }>
                        Checkout error-rate spike
                      </NarrativeLink>{' '}
                      tied to auth-service regression. Elevated but not yet
                      customer-impacting.
                    </span>
                  </div>
                  <div className="emptySessionPage__newsItem emptySessionPage__briefingFadeIn emptySessionPage__briefingFadeIn--3">
                    <span className="emptySessionPage__newsBadge emptySessionPage__newsBadge--warning">
                      Warning
                    </span>
                    <span className="emptySessionPage__newsBody">
                      <NarrativeLink
                        sessionId="dns-timeout-session"
                        onClick={() => onSelectSession('dns-timeout-session')}>
                        DNS resolution timeout
                      </NarrativeLink>{' '}
                      flagged 3 hours ago — not yet resolved. Monitoring for
                      recurrence.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Chat input — fixed at bottom of container */}
            <div className="emptySessionPage__inlineInput">
              <DualPurposeInput
                onStartThread={onStartThread}
                onOpenPage={onOpenPage}
                onSearchChange={setSearchQuery}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onHoverStart={() => setInputHovered(true)}
                onHoverEnd={() => setInputHovered(false)}
                borderActive={inputActive}
              />
            </div>
          </div>

          {/* Resize handle */}
          <div
            className="emptySessionPage__resizeHandle"
            onMouseDown={handleResizeMouseDown}
            ref={resizeRef}
          />

          {/* Right column — briefing items */}
          <div
            className="emptySessionPage__rightCol"
            style={{ flex: `0 0 ${rightPanelWidth}%` }}>
            <div
              className={`emptySessionPage__briefing${
                hasAnimatedBriefing ? ' emptySessionPage__briefing--noAnim' : ''
              }`}
              style={{ padding: 24, gap: 0 }}
              ref={briefingRef}
              onMouseLeave={() => {
                if (briefingRef.current) {
                  briefingRef.current
                    .querySelectorAll('.emptySessionPage__briefingItem')
                    .forEach((el) => {
                      el.style.transform = '';
                    });
                  briefingRef.current
                    .querySelectorAll('.emptySessionPage__briefingSeparator')
                    .forEach((el) => {
                      el.style.opacity = '';
                    });
                }
              }}>
              <div className="emptySessionPage__tabRow emptySessionPage__tabRow--sticky">
                <span className="emptySessionPage__overviewTitle">Overview</span>
                <span className="emptySessionPage__overviewStatus">
                  <span className="emptySessionPage__overviewStatusDot" />
                  updated 2m ago
                </span>
                <div className="emptySessionPage__tabRowActions">
                  <OuiToolTip content="Refresh" position="left">
                    <OuiButtonIcon
                      iconType="refresh"
                      aria-label="Refresh"
                      size="s"
                      color="text"
                      display="empty"
                      isDisabled={Object.values(refreshingWidgets).some(Boolean)}
                      onClick={() => {
                        const ids = ['top-services', 'connection-timeout', 'recent-alerts', 'deployment-timeline', 'resource-utilization', 'saved-queries', 'dashboards'];
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
                    <OuiSmallButtonEmpty
                      size="xs"
                      color="primary"
                      onClick={() => setIsEditMode(false)}>
                      Done
                    </OuiSmallButtonEmpty>
                  ) : (
                    <OuiToolTip content="Edit widgets" position="left">
                      <OuiButtonIcon
                        iconType="controlsHorizontal"
                        aria-label="Edit widgets"
                        size="s"
                        color="text"
                        display="empty"
                        onClick={() => {
                          setIsEditMode(true);
                          const rightCol = document.querySelector(
                            '.emptySessionPage__rightCol'
                          );
                          if (rightCol)
                            rightCol.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </OuiToolTip>
                  )}
                </div>
              </div>

              <div className="emptySessionPage__briefingContent">
                {workflowsExpanded ? (
                  <div className="emptySessionPage__pageBrowser">
                    <div className="emptySessionPage__pageBrowserHeader">
                      <div className="emptySessionPage__pageBrowserSearch">
                        <OuiIcon type="search" size="s" />
                        <input
                          type="text"
                          placeholder="Search pages..."
                          value={workflowSearch}
                          onChange={(e) => setWorkflowSearch(e.target.value)}
                          className="emptySessionPage__pageBrowserInput"
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        className="emptySessionPage__pageBrowserClose"
                        onClick={() => setWorkflowsExpanded(false)}>
                        <OuiIcon type="cross" size="m" />
                      </button>
                    </div>
                    <div className="emptySessionPage__pageBrowserGrid">
                      {[...WORKFLOW_ITEMS_PRIMARY, ...WORKFLOW_ITEMS_OVERFLOW]
                        .filter((item) =>
                          !workflowSearch ||
                          item.label.toLowerCase().includes(workflowSearch.toLowerCase())
                        )
                        .map((item, i) => (
                          <button
                            key={i}
                            type="button"
                            className="emptySessionPage__pageBrowserItem"
                            onClick={() => {
                              onOpenPageInNewSession(item.pageKey, item.label);
                              setWorkflowsExpanded(false);
                            }}>
                            <OuiIcon type={item.icon} size="l" />
                            <span>{item.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                <div className="emptySessionPage__briefingPanel">
                  <div
                    className={`emptySessionPage__widgetGrid${
                      isEditMode ? ' emptySessionPage__widgetGrid--editing' : ''
                    }`}
                    ref={insightsRef}
                    onMouseLeave={handleInsightMouseLeave}>
                    {widgetOrder.map((widgetId, idx) => {
                      const size = widgetSizes[widgetId] || 1;
                      const wrapClass = `emptySessionPage__widgetWrap${
                        size >= 2 ? ' emptySessionPage__widget--wide' : ''
                      }`;
                      const dragProps =
                        isEditMode && !confirmingRemoval
                          ? {
                              draggable: true,
                              onDragStart: () => handleWidgetDragStart(idx),
                              onDragOver: (e) => handleWidgetDragOver(e, idx),
                              onDrop: handleWidgetDrop,
                            }
                          : {};

                      const renderWidget = () => {
                        switch (widgetId) {
                          case 'workflows':
                            return (
                              <div className="emptySessionPage__workflowsWidget">
                                <div className="emptySessionPage__workflowsHeader">
                                  <span className="emptySessionPage__workflowsTitle">
                                    Open a page
                                  </span>
                                </div>
                                <div className="emptySessionPage__workflowsGrid">
                                  {WORKFLOW_ITEMS_PRIMARY.map((item, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      className="emptySessionPage__workflowItem"
                                      onClick={() =>
                                        onOpenPageInNewSession(item.pageKey, item.label)
                                      }>
                                      <OuiIcon type={item.icon} size="s" />
                                      <span>{item.label}</span>
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    className="emptySessionPage__workflowItem emptySessionPage__workflowItem--more"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setWorkflowsExpanded(true);
                                      setWorkflowSearch('');
                                    }}>
                                    <OuiIcon type="apps" size="s" />
                                    <span>More</span>
                                  </button>
                                </div>
                              </div>
                            );
                          case 'top-services':
                            return (
                              <OuiInsightCard
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession(
                                    'app-perf-services',
                                    'Application Services'
                                  )
                                }>

                                <WidgetHeader title="Top services by fault rate" />
                                <div className="widgetCard__tableHeader">
                                  <span>SERVICE</span>
                                  <span>FAULT RATE</span>
                                </div>
                                <div className="widgetCard__rows">
                                  <div className="widgetCard__barRow">
                                    <span className="widgetCard__barLabel">checkout</span>
                                    <div className="widgetCard__barTrack"><div className="widgetCard__barFill" style={{ width: '67%' }} /></div>
                                    <span className="widgetCard__barValue">{dataVariant % 2 === 0 ? '66.67%' : '58.23%'}</span>
                                  </div>
                                  <div className="widgetCard__barRow">
                                    <span className="widgetCard__barLabel">frontend</span>
                                    <div className="widgetCard__barTrack"><div className="widgetCard__barFill widgetCard__barFill--secondary" style={{ width: dataVariant % 2 === 0 ? '14.5%' : '22%' }} /></div>
                                    <span className="widgetCard__barValue">{dataVariant % 2 === 0 ? '14.49%' : '21.88%'}</span>
                                  </div>
                                  <div className="widgetCard__barRow">
                                    <span className="widgetCard__barLabel">frontend-proxy</span>
                                    <div className="widgetCard__barTrack"><div className="widgetCard__barFill widgetCard__barFill--secondary" style={{ width: dataVariant % 2 === 0 ? '14.3%' : '11%' }} /></div>
                                    <span className="widgetCard__barValue">{dataVariant % 2 === 0 ? '14.29%' : '10.94%'}</span>
                                  </div>
                                </div>
                              </OuiInsightCard>
                            );
                          case 'connection-timeout':
                            return (
                              <OuiInsightCard
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('logs', 'Logs')
                                }>

                                <WidgetHeader title="Connection timeout errors" />
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                                  <span className="widgetCard__bigNumber">{dataVariant % 2 === 0 ? '847' : '923'}</span>
                                  <span className="widgetCard__trend widgetCard__trend--warning">{dataVariant % 2 === 0 ? '↑ 312%' : '↑ 340%'}</span>
                                </div>
                                <svg viewBox="0 0 280 68" preserveAspectRatio="none" style={{ width: '100%', height: 68, display: 'block', marginTop: 8 }}>
                                  <defs>
                                    <ChartTexture id="connStripe" variant="stripe" />
                                  </defs>
                                  <line x1="0" y1="8" x2="280" y2="8" stroke="#DD8A3A" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.45" />
                                  <path d="M0,56 C50,55 90,53 130,47 C170,41 210,26 280,8 L280,68 L0,68 Z" fill="url(#connStripe)" />
                                  <path d="M0,56 C50,55 90,53 130,47 C170,41 210,26 280,8" fill="none" stroke="#DD8A3A" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                              </OuiInsightCard>
                            );
                          case 'recent-alerts':
                            return (
                              <OuiInsightCard
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('alerts', 'Alerts')
                                }>

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
                          case 'deployment-timeline':
                            return (
                              <OuiInsightCard
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('dashboards', 'Dashboards')
                                }>

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
                          case 'resource-utilization':
                            return (
                              <OuiInsightCard
                                onClick={() =>
                                  !isEditMode &&
                                  onOpenPageInNewSession('metrics', 'Metrics')
                                }>

                                <WidgetHeader title="Resource utilization" />
                                <span style={{ fontSize: 22, fontWeight: 700, color: '#1F9D6B', letterSpacing: '-0.01em', marginBottom: 4, display: 'block' }}>56%</span>
                                <svg
                                  viewBox="0 0 220 80"
                                  style={{ width: '100%', height: 80 }}>
                                  <line x1="30" y1="14" x2="210" y2="14" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
                                  <line x1="30" y1="38" x2="210" y2="38" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
                                  <line x1="30" y1="62" x2="210" y2="62" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
                                  <text x="22" y="17" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="end">50</text>
                                  <text x="22" y="41" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="end">25</text>
                                  <text x="22" y="65" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="end">0</text>
                                  <defs>
                                    <ChartTexture id="resDots" variant="dots" />
                                  </defs>
                                  <path
                                    d="M40,38 L75,34 L110,30 L145,32 L175,26 L195,24 L210,26 V62 H40 Z"
                                    fill="url(#resDots)"
                                  />
                                  <polyline
                                    fill="none"
                                    stroke="#34d399"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    points="40,38 75,34 110,30 145,32 175,26 195,24 210,26"
                                  />
                                  <circle cx="210" cy="26" r="3" fill="#34d399" />
                                  <text x="40" y="74" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="middle">0m</text>
                                  <text x="125" y="74" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="middle">30m</text>
                                  <text x="210" y="74" fontSize="7" fill="currentColor" opacity="0.65" textAnchor="middle">60m</text>
                                </svg>
                              </OuiInsightCard>
                            );
                          case 'saved-queries':
                            return (
                              <div
                                className="emptySessionPage__widgetList">
                                <WidgetHeader
                                  icon="search"
                                  title="Saved queries"
                                  action
                                  onAction={() => onBrowseLibrary && onBrowseLibrary('query')}
                                />
                                <div className="emptySessionPage__widgetListItems">
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListItem"
                                    onClick={() => !isEditMode && onOpenPageInNewSession('logs', '5xx by service')}>
                                    <div>
                                      <strong>5xx by service</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        last 1h
                                      </span>
                                    </div>
                                  </button>
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListItem"
                                    onClick={() => !isEditMode && onOpenPageInNewSession('logs', 'Slow traces > 2s')}>
                                    <div>
                                      <strong>Slow traces &gt; 2s</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        all services
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            );
                          case 'dashboards':
                            return (
                              <div
                                className="emptySessionPage__widgetList">
                                <WidgetHeader
                                  icon="dashboard"
                                  title="Dashboards"
                                  action
                                  onAction={() => onBrowseLibrary && onBrowseLibrary('dashboard')}
                                />
                                <div className="emptySessionPage__widgetListItems">
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListItem"
                                    onClick={() => !isEditMode && onOpenPageInNewSession('dashboards', 'Service overview')}>
                                    <div>
                                      <strong>Service overview</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        12 panels · opened 2h ago
                                      </span>
                                    </div>
                                    <svg
                                      viewBox="0 0 60 20"
                                      style={{
                                        width: 60,
                                        height: 20,
                                        flexShrink: 0,
                                      }}>
                                      <defs>
                                        <ChartTexture id="dashDots1" variant="dots" />
                                      </defs>
                                      <path d="M0,14 L10,10 L20,12 L30,8 L40,10 L50,6 L60,8 V20 H0 Z" fill="url(#dashDots1)" />
                                      <polyline
                                        fill="none"
                                        stroke="#34d399"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        points="0,14 10,10 20,12 30,8 40,10 50,6 60,8"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListItem"
                                    onClick={() => !isEditMode && onOpenPageInNewSession('dashboards', 'p99 latency')}>
                                    <div>
                                      <strong>p99 latency</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        8 panels · opened today
                                      </span>
                                    </div>
                                    <svg
                                      viewBox="0 0 60 20"
                                      style={{
                                        width: 60,
                                        height: 20,
                                        flexShrink: 0,
                                      }}>
                                      <defs>
                                        <ChartTexture id="dashStripe1" variant="stripe" />
                                      </defs>
                                      <path d="M0,16 L10,14 L20,12 L30,10 L40,8 L50,6 L60,4 V20 H0 Z" fill="url(#dashStripe1)" />
                                      <polyline
                                        fill="none"
                                        stroke="#d97706"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        points="0,16 10,14 20,12 30,10 40,8 50,6 60,4"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListItem"
                                    onClick={() => !isEditMode && onOpenPageInNewSession('dashboards', 'Error rate by service')}>
                                    <div>
                                      <strong>Error rate by service</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        6 panels · opened yesterday
                                      </span>
                                    </div>
                                    <svg
                                      viewBox="0 0 60 20"
                                      style={{
                                        width: 60,
                                        height: 20,
                                        flexShrink: 0,
                                      }}>
                                      <defs>
                                        <ChartTexture id="dashStripe2" variant="stripe" color="#ef4444" />
                                      </defs>
                                      <path d="M0,16 L10,12 L20,14 L30,8 L40,10 L50,4 L60,6 V20 H0 Z" fill="url(#dashStripe2)" />
                                      <polyline
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        points="0,16 10,12 20,14 30,8 40,10 50,4 60,6"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="emptySessionPage__widgetListItem"
                                    onClick={() => !isEditMode && onOpenPageInNewSession('dashboards', 'Connection pool health')}>
                                    <div>
                                      <strong>Connection pool health</strong>
                                      <br />
                                      <span
                                        style={{ fontSize: 11, opacity: 0.6 }}>
                                        4 panels · opened 3h ago
                                      </span>
                                    </div>
                                    <svg
                                      viewBox="0 0 60 20"
                                      style={{
                                        width: 60,
                                        height: 20,
                                        flexShrink: 0,
                                      }}>
                                      <defs>
                                        <ChartTexture id="dashDots2" variant="dots" />
                                      </defs>
                                      <path d="M0,12 L10,10 L20,8 L30,10 L40,6 L50,8 L60,6 V20 H0 Z" fill="url(#dashDots2)" />
                                      <polyline
                                        fill="none"
                                        stroke="#34d399"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        points="0,12 10,10 20,8 30,10 40,6 50,8 60,6"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            );
                          default:
                            return null;
                        }
                      };

                      return (
                        <div
                          key={widgetId}
                          className={wrapClass}
                          {...dragProps}>
                          {isEditMode && (
                            <>
                              <div
                                className="emptySessionPage__widgetDragHandle"
                                title="Drag to reorder">
                                <OuiIcon type="grab" size="s" />
                              </div>
                              <button
                                type="button"
                                className="emptySessionPage__widgetResizeHandle"
                                title={
                                  size >= 2 ? 'Shrink to 1×1' : 'Expand to 2×1'
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWidgetResize(widgetId);
                                }}>
                                <OuiIcon
                                  type={size >= 2 ? 'minimize' : 'expand'}
                                  size="s"
                                />
                              </button>
                              <button
                                type="button"
                                className="emptySessionPage__widgetRemoveHandle"
                                title="Remove widget"
                                aria-label="Remove widget"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmingRemoval(widgetId);
                                }}>
                                <OuiIcon type="trash" size="s" />
                              </button>
                            </>
                          )}
                          {isEditMode && confirmingRemoval === widgetId && (
                            <div
                              className="emptySessionPage__widgetConfirm"
                              onClick={(e) => e.stopPropagation()}>
                              <span className="emptySessionPage__widgetConfirmText">
                                Remove this widget?
                              </span>
                              <div className="emptySessionPage__widgetConfirmActions">
                                <OuiSmallButton
                                  color="text"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmingRemoval(null);
                                  }}>
                                  Cancel
                                </OuiSmallButton>
                                <OuiSmallButton
                                  fill
                                  color="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWidgetRemove(widgetId);
                                  }}>
                                  Remove
                                </OuiSmallButton>
                              </div>
                            </div>
                          )}
                          {(isRefreshing || refreshingWidgets[widgetId]) && widgetId !== 'workflows' ? (
                            <div style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
                              <div style={{ visibility: 'hidden' }}>{renderWidget()}</div>
                              <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}>
                                <div className="ouiInsightCard" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                                  <ScanShimmerOverlay />
                                </div>
                              </div>
                            </div>
                          ) : renderWidget()}
                        </div>
                      );
                    })}
                  </div>

                  {/* Widget Gallery — visible in edit mode */}
                  {isEditMode && (
                    <div className="emptySessionPage__widgetGallery">
                      <div className="emptySessionPage__galleryHeader">
                        <OuiIcon type="apps" size="m" />
                        <strong>Widget Gallery</strong>
                      </div>
                      <div className="emptySessionPage__gallerySearch">
                        <OuiIcon
                          type="search"
                          size="s"
                          className="emptySessionPage__gallerySearchIcon"
                        />
                        <input
                          type="text"
                          placeholder="Search dashboards, queries, links..."
                          value={gallerySearch}
                          onChange={(e) => setGallerySearch(e.target.value)}
                          className="emptySessionPage__gallerySearchInput"
                        />
                      </div>
                      <div className="emptySessionPage__galleryCategories">
                        {[
                          {
                            category: 'Dashboards',
                            items: [
                              {
                                icon: 'grid',
                                label: 'System overview',
                                size: '2×1',
                              },
                              {
                                icon: 'grid',
                                label: 'Payment service pool',
                                size: '1×1',
                              },
                              {
                                icon: 'grid',
                                label: 'Network traffic',
                                size: '2×1',
                              },
                            ],
                          },
                          {
                            category: 'Queries',
                            items: [
                              {
                                icon: 'search',
                                label: '5xx by service',
                                size: '1×1',
                              },
                              {
                                icon: 'search',
                                label: 'Slow traces > 2s',
                                size: '1×1',
                              },
                              {
                                icon: 'search',
                                label: 'Auth failures last 24h',
                                size: '1×1',
                              },
                            ],
                          },
                          {
                            category: 'Monitoring',
                            items: [
                              {
                                icon: 'visArea',
                                label: 'CPU utilization',
                                size: '1×1',
                              },
                              {
                                icon: 'visLine',
                                label: 'Request throughput',
                                size: '2×1',
                              },
                              {
                                icon: 'apmTrace',
                                label: 'Trace explorer',
                                size: '1×1',
                              },
                            ],
                          },
                          {
                            category: 'Links',
                            items: [
                              {
                                icon: 'link',
                                label: 'Runbook: On-call playbook',
                                size: '1×1',
                              },
                              {
                                icon: 'link',
                                label: 'Team Slack channel',
                                size: '1×1',
                              },
                            ],
                          },
                        ]
                          .filter(
                            (cat) =>
                              !gallerySearch ||
                              cat.items.some((item) =>
                                item.label
                                  .toLowerCase()
                                  .includes(gallerySearch.toLowerCase())
                              )
                          )
                          .map((cat, ci) => (
                            <div
                              key={ci}
                              className="emptySessionPage__galleryCategory">
                              <span className="emptySessionPage__galleryCategoryTitle">
                                {cat.category}
                              </span>
                              {cat.items
                                .filter(
                                  (item) =>
                                    !gallerySearch ||
                                    item.label
                                      .toLowerCase()
                                      .includes(gallerySearch.toLowerCase())
                                )
                                .map((item, ii) => (
                                  <div
                                    key={ii}
                                    className="emptySessionPage__galleryItem"
                                    draggable>
                                    <OuiIcon type={item.icon} size="s" />
                                    <span className="emptySessionPage__galleryItemLabel">
                                      {item.label}
                                    </span>
                                    <span className="emptySessionPage__galleryItemSize">
                                      {item.size}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          ))}
                      </div>
                      <div className="emptySessionPage__galleryFooter">
                        <OuiText size="xs" color="subdued">
                          <p>Drag items into the grid above, or click to add</p>
                        </OuiText>
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
