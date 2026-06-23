// Olly widgets — live preview tiles for the welcome page
// Pairs with olly-welcome.jsx. Pinned dashboards/queries shown as
// at-a-glance tiles. Visually distinct from the favorites LIST
// (favorites = bookmarks; widgets = previews you don't need to click).

const WC = window.OllyColors || {
  bg: '#F4F7FB',
  ink: '#0E2A4A',
  sub: 'rgba(14, 42, 74, 0.55)',
  dim: 'rgba(14, 42, 74, 0.40)',
  hairline: 'rgba(14, 42, 74, 0.12)',
  accent: '#1F6CB5',
  green: '#2E8B6F',
  alert: '#C53961',
  alertSoft: 'rgba(197, 57, 97, 0.08)',
  alertBorder: 'rgba(197, 57, 97, 0.30)',
};
const WFONT = "'IBM Plex Sans', system-ui, sans-serif";
const WMONO = "'IBM Plex Mono', ui-monospace, monospace";

// ─── Mini chart primitives ──────────────────────────────────────

function Spark({ data, color, areaColor, w = '100%', h = 56 }) {
  const vbW = 240;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = vbW / (data.length - 1);
  const ptsXY = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 4) - 2]);
  const linePath = ptsXY.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
  const areaPath = `${linePath} L${vbW},${h} L0,${h} Z`;
  const last = ptsXY[ptsXY.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${vbW} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={areaPath} fill={areaColor}/>
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={color}/>
      <circle cx={last[0]} cy={last[1]} r="5" fill={color} opacity="0.2"/>
    </svg>
  );
}

function BarsMini({ data, color, w = '100%', h = 56 }) {
  const vbW = 240;
  const max = Math.max(...data);
  const gap = 3;
  const bw = (vbW - gap * (data.length - 1)) / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${vbW} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 4);
        return <rect key={i} x={i * (bw + gap)} y={h - bh - 2} width={bw} height={bh} rx="1" fill={color} opacity={i === data.length - 1 ? 1 : 0.55}/>;
      })}
    </svg>
  );
}

function RankRows({ rows }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map((r, i) => (
        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontFamily: WMONO, fontSize: 10, color: WC.dim, width: 12, flexShrink: 0 }}>{i + 1}</span>
          <span style={{ fontSize: 11, color: WC.ink, fontWeight: 500, flex: '0 1 80px', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
          <span style={{ flex: 1, minWidth: 16, height: 4, background: 'rgba(14,42,74,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <span style={{ display: 'block', height: '100%', width: `${r.pct}%`, background: WC.accent, opacity: 0.75 }}/>
          </span>
          <span style={{ fontFamily: WMONO, fontSize: 10, color: WC.sub, width: 28, textAlign: 'right', flexShrink: 0 }}>{r.val}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Widget tile ────────────────────────────────────────────────

function WidgetTile({ widget }) {
  const isAlert = widget.severity === 'alert';
  const trendColor = widget.trend === 'up' && isAlert ? WC.alert
                   : widget.trend === 'down' ? WC.green
                   : WC.sub;
  const trendGlyph = widget.trend === 'up' ? '↑' : widget.trend === 'down' ? '↓' : '→';

  return (
    <div style={{
      background: '#fff', border: `1px solid ${isAlert ? WC.alertBorder : WC.hairline}`,
      borderRadius: 8, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      cursor: 'pointer', minHeight: 168,
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{
            fontFamily: WMONO, fontSize: 9.5, letterSpacing: 0.8, color: WC.dim,
            textTransform: 'uppercase',
          }}>{widget.kindLabel}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: WC.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {widget.title}
          </span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: WMONO, fontSize: 9, color: WC.dim, letterSpacing: 0.6, textTransform: 'uppercase', flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: WC.green }}/>
          live
        </span>
      </div>

      {/* preview */}
      <div style={{ margin: '2px -4px', minHeight: 56 }}>
        {widget.kind === 'spark' && (
          <Spark data={widget.data} color={isAlert ? WC.alert : WC.accent}
                 areaColor={isAlert ? 'rgba(197,57,97,0.10)' : 'rgba(31,108,181,0.10)'}/>
        )}
        {widget.kind === 'bar' && <BarsMini data={widget.data} color={WC.accent}/>}
        {widget.kind === 'rank' && <RankRows rows={widget.data}/>}
      </div>

      {/* footer */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{
          fontFamily: WMONO, fontSize: 20, fontWeight: 500,
          color: isAlert ? WC.alert : WC.ink, letterSpacing: -0.5,
        }}>{widget.value}</span>
        <span style={{
          fontFamily: WMONO, fontSize: 10.5, color: trendColor,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <span>{trendGlyph}</span>
          <span>{widget.trendValue}</span>
        </span>
      </div>
    </div>
  );
}

function AddWidgetSlot() {
  return (
    <div style={{
      border: `1px dashed ${WC.hairline}`, borderRadius: 8,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 6, cursor: 'pointer', color: WC.sub, minHeight: 168,
      transition: 'border-color 0.15s, color 0.15s, background 0.15s',
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: '50%',
        border: `1px dashed ${WC.hairline}`,
        display: 'grid', placeItems: 'center', color: WC.sub,
      }}><PinIcon size={12}/></span>
      <span style={{ fontSize: 11.5, fontWeight: 500 }}>Pin something</span>
      <span style={{ fontSize: 10.5, color: WC.dim, textAlign: 'center', padding: '0 16px', lineHeight: 1.35 }}>
        Queries, dashboards, alerts, findings.
      </span>
    </div>
  );
}

function PinIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'text-bottom' }}>
      <path d="M12 17v5"/>
      <path d="M9 10.5V4h6v6.5l2.5 3.5h-11l2.5-3.5z"/>
    </svg>
  );
}

// ─── Section ────────────────────────────────────────────────────

const DEMO_WIDGETS = [
  {
    id: 1,
    kindLabel: 'Saved query',
    title: 'Payment-service · P99',
    kind: 'spark',
    value: '2,140 ms',
    trend: 'up', trendValue: '+184%',
    severity: 'alert',
    data: [820, 840, 805, 830, 825, 860, 870, 850, 890, 920, 980, 1080, 1240, 1520, 1860, 2140],
  },
  {
    id: 2,
    kindLabel: 'Saved query',
    title: 'Error rate · all services',
    kind: 'bar',
    value: '0.42 %',
    trend: 'down', trendValue: '−0.04',
    severity: 'normal',
    data: [0.62, 0.58, 0.55, 0.51, 0.49, 0.47, 0.46, 0.46, 0.45, 0.44, 0.43, 0.42],
  },
  {
    id: 3,
    kindLabel: 'Dashboard',
    title: 'Top services by traffic',
    kind: 'rank',
    value: '12.4 M rps',
    trend: 'flat', trendValue: 'stable',
    severity: 'normal',
    data: [
      { name: 'web-api',     pct: 100, val: '4.1M' },
      { name: 'payment-svc', pct: 78,  val: '3.2M' },
      { name: 'auth-svc',    pct: 64,  val: '2.6M' },
      { name: 'search-svc',  pct: 41,  val: '1.7M' },
    ],
  },
];

function WidgetsSection({ widgets = DEMO_WIDGETS, empty = false }) {
  if (empty || widgets.length === 0) return <WidgetsEmpty/>;
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10, padding: '0 2px',
      }}>
        <span style={{ fontFamily: WMONO, fontSize: 10.5, letterSpacing: 1.6, color: WC.accent }}>
          // PINNED — {String(widgets.length).padStart(2, '0')}
        </span>
        <span style={{ fontSize: 11, color: WC.sub, cursor: 'pointer' }}>Edit</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 8,
      }}>
        {widgets.map((w) => <WidgetTile key={w.id} widget={w}/>)}
        <AddWidgetSlot/>
      </div>
    </div>
  );
}

function WidgetsEmpty() {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10, padding: '0 2px',
      }}>
        <span style={{ fontFamily: WMONO, fontSize: 10.5, letterSpacing: 1.6, color: WC.accent }}>
          // PINNED
        </span>
      </div>
      <div style={{
        border: `1px dashed ${WC.hairline}`, borderRadius: 10,
        padding: '32px 28px',
        background: 'rgba(255,255,255,0.4)',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: WC.ink, marginBottom: 6 }}>
            Pin anything you check often.
          </div>
          <div style={{ fontSize: 13, color: WC.sub, lineHeight: 1.5, maxWidth: 480, marginBottom: 14 }}>
            A live preview shows here so you don't have to click. Look for the
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 6px 1px 5px', margin: '0 4px', border: `1px solid ${WC.hairline}`, borderRadius: 4, fontSize: 11, color: WC.ink, fontWeight: 500, verticalAlign: 'baseline' }}>
              <PinIcon size={10}/> Pin
            </span>
            button — on a query, a dashboard, an alert, a finding, or anything Olly turns up.
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Saved query', 'Dashboard', 'Alert', 'Finding', 'Service health', 'Olly answer'].map((tag) => (
              <span key={tag} style={{
                fontFamily: WMONO, fontSize: 10, color: WC.sub,
                padding: '3px 8px', background: 'rgba(14,42,74,0.04)',
                borderRadius: 999, letterSpacing: 0.4,
              }}>{tag}</span>
            ))}
          </div>
        </div>
        {/* Ghost preview */}
        <div style={{ display: 'flex', gap: 6, opacity: 0.4 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 70, height: 56, borderRadius: 6,
              background: '#fff', border: `1px solid ${WC.hairline}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 6,
            }}>
              <div style={{ width: '70%', height: 4, background: 'rgba(14,42,74,0.08)', borderRadius: 2 }}/>
              <div style={{ height: 14, background: 'rgba(14,42,74,0.06)', borderRadius: 2 }}/>
              <div style={{ width: '40%', height: 8, background: 'rgba(14,42,74,0.08)', borderRadius: 2 }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WidgetsSection, WidgetsEmpty, WidgetTile, AddWidgetSlot, PinIcon });
