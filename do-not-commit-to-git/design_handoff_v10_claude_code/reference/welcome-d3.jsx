// Welcome page · D3 blueprint visual language · light + dark
// Recreates the "Good morning, John" overview page using the iso/blueprint vocabulary.

const WMONO = "'IBM Plex Mono', ui-monospace, monospace";
const WSANS = "'Outfit', system-ui, sans-serif";

// ─── theme tokens ───────────────────────────────────────────────

const THEMES = {
  dark: {
    name: 'dark',
    bg:        '#0d3057',
    bgDeep:    '#0a2545',
    panel:     'rgba(10,37,69,0.55)',
    panelSolid:'#103e6e',
    ink:       '#cfe4f7',
    inkBright: '#ffffff',
    inkDim:    'rgba(207,228,247,0.62)',
    inkFade:   'rgba(207,228,247,0.34)',
    inkGhost:  'rgba(207,228,247,0.16)',
    cyan:      '#5dd9ff',
    cyanDim:   'rgba(93,217,255,0.45)',
    cyanSoft:  'rgba(93,217,255,0.10)',
    amber:     '#ffb86b',
    amberDim:  'rgba(255,184,107,0.45)',
    amberSoft: 'rgba(255,184,107,0.12)',
    green:     '#7be0a8',
    greenDim:  'rgba(123,224,168,0.45)',
    red:       '#ff7a7a',
    redSoft:   'rgba(255,122,122,0.10)',
    gridFine:  'rgba(207,228,247,0.05)',
    gridMajor: 'rgba(207,228,247,0.10)',
    inputBg:   'rgba(10,37,69,0.45)',
  },
  light: {
    name: 'light',
    bg:        '#eef2f7',
    bgDeep:    '#dde4ee',
    panel:     'rgba(255,255,255,0.85)',
    panelSolid:'#ffffff',
    ink:       '#0d3057',
    inkBright: '#06203f',
    inkDim:    'rgba(13,48,87,0.62)',
    inkFade:   'rgba(13,48,87,0.32)',
    inkGhost:  'rgba(13,48,87,0.14)',
    cyan:      '#1f6cb5',
    cyanDim:   'rgba(31,108,181,0.40)',
    cyanSoft:  'rgba(31,108,181,0.08)',
    amber:     '#c47a1f',
    amberDim:  'rgba(196,122,31,0.45)',
    amberSoft: 'rgba(196,122,31,0.10)',
    green:     '#2e8b6f',
    greenDim:  'rgba(46,139,111,0.45)',
    red:       '#c53961',
    redSoft:   'rgba(197,57,97,0.08)',
    gridFine:  'rgba(13,48,87,0.05)',
    gridMajor: 'rgba(13,48,87,0.10)',
    inputBg:   'rgba(255,255,255,0.7)',
  },
};

// ─── theme context ──────────────────────────────────────────────

const ThemeContext = React.createContext(THEMES.dark);
const useT = () => React.useContext(ThemeContext);

// ─── shared primitives ──────────────────────────────────────────

function CornerTicks({ accent }) {
  const T = useT();
  const a = accent || T.cyanDim;
  const f = T.inkFade;
  return (
    <React.Fragment>
      <span style={{ position: 'absolute', top: -1, left: -1, width: 6, height: 6, borderTop: `1px solid ${a}`, borderLeft: `1px solid ${a}` }}/>
      <span style={{ position: 'absolute', top: -1, right: -1, width: 6, height: 6, borderTop: `1px solid ${f}`, borderRight: `1px solid ${f}` }}/>
      <span style={{ position: 'absolute', bottom: -1, left: -1, width: 6, height: 6, borderBottom: `1px solid ${a}`, borderLeft: `1px solid ${a}` }}/>
      <span style={{ position: 'absolute', bottom: -1, right: -1, width: 6, height: 6, borderBottom: `1px solid ${f}`, borderRight: `1px solid ${f}` }}/>
    </React.Fragment>
  );
}

function SectionLabel({ children }) {
  const T = useT();
  return (
    <div style={{
      fontFamily: WMONO, fontSize: 10.5, letterSpacing: 1.8,
      color: T.cyan, fontWeight: 700,
      marginBottom: 10, marginTop: 4,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span>// {children}</span>
      <span style={{ flex: 1, borderTop: `1px dashed ${T.inkGhost}` }}/>
    </div>
  );
}

function GhostBtn({ children, style }) {
  const T = useT();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 12px',
      border: `1px solid ${T.inkFade}`,
      color: T.inkDim,
      fontFamily: WMONO, fontSize: 10.5, letterSpacing: 1.2,
      fontWeight: 600, textTransform: 'uppercase',
      cursor: 'pointer', userSelect: 'none',
      ...style,
    }}>{children}</span>
  );
}

// ─── iso cubes (from D3) ────────────────────────────────────────

function IsoCube({ x, broken, ok }) {
  const T = useT();
  const c = broken ? T.amber : (ok ? T.green : T.cyan);
  const fillBroken = T === THEMES.dark ? 'rgba(255,184,107,0.16)' : 'rgba(196,122,31,0.14)';
  const fillOk = T === THEMES.dark ? 'rgba(123,224,168,0.14)' : 'rgba(46,139,111,0.12)';
  const fillDef = T === THEMES.dark ? 'rgba(93,217,255,0.10)' : 'rgba(31,108,181,0.08)';
  const fill = broken ? fillBroken : (ok ? fillOk : fillDef);
  return (
    <g transform={`translate(${x},0)`}>
      <polygon points="6,2 14,6 8,10 0,6" fill={fill} stroke={c} strokeWidth="0.9"/>
      <polygon points="0,6 8,10 8,18 0,14" fill={fill} stroke={c} strokeWidth="0.9" opacity="0.85"/>
      <polygon points="8,10 14,6 14,14 8,18" fill={fill} stroke={c} strokeWidth="0.9" opacity="0.7"/>
      {broken && <line x1="2" y1="9" x2="12" y2="15" stroke={c} strokeWidth="0.7"/>}
    </g>
  );
}

function IsoStack({ total, bad, allOk }) {
  const T = useT();
  const shown = Math.min(total, 7);
  const overflow = total - shown;
  const w = shown * 14 + 16 + (overflow ? 22 : 0);
  return (
    <svg width={w} height="22" viewBox={`0 0 ${w} 22`} style={{ flexShrink: 0 }}>
      {Array.from({length: shown}).map((_,i)=>(
        <IsoCube key={i} x={i * 14} broken={!allOk && i < bad} ok={allOk}/>
      ))}
      {overflow > 0 && (
        <text x={shown * 14 + 4} y="14" fontFamily={WMONO} fontSize="9" fill={T.inkDim}>+{overflow}</text>
      )}
    </svg>
  );
}

function LatencyBar({ tone = 'warn', deltaDir = 'up', solid }) {
  const T = useT();
  const col = tone === 'ok' ? T.green : (tone === 'shared' ? T.cyan : T.amber);
  const barH = deltaDir === 'down' ? 5 : 11;
  const barY = 15 - barH;
  return (
    <svg width="32" height="16" viewBox="0 0 32 16" style={{ flexShrink: 0 }}>
      <line x1="0" y1="15" x2="32" y2="15" stroke={T.inkFade} strokeWidth="0.6"/>
      <line x1="0" y1="10" x2="32" y2="10" stroke={col} strokeWidth="0.5" strokeDasharray="2 2"/>
      <rect x="2"  y={barY}                width="4" height={barH}                fill={solid || col} stroke={col} strokeWidth="0.6"/>
      <rect x="8"  y={barY + 1}            width="4" height={Math.max(2, barH-2)} fill="none" stroke={col} strokeWidth="0.6" opacity="0.6"/>
      <rect x="14" y={barY + 2}            width="4" height={Math.max(2, barH-4)} fill="none" stroke={col} strokeWidth="0.6" opacity="0.4"/>
    </svg>
  );
}

// ─── avatar ─────────────────────────────────────────────────────

function OllyAvatar({ size = 40 }) {
  const T = useT();
  const sw = size < 30 ? 1.6 : size < 60 ? 1.2 : 1.0;
  const bodyFill = T.name === 'dark' ? T.bgDeep : '#dde9f5';
  const ringFill = T.name === 'dark' ? 'rgba(93,217,255,0.08)' : 'rgba(31,108,181,0.08)';

  // Small-size eye legibility — scale eyes up + pull pair inward as size shrinks.
  const eyeScale = (() => {
    if (size >= 80) return 1.0;
    if (size <= 20) return 2.0;
    const t = (80 - size) / (80 - 20);
    return 1.0 + Math.pow(t, 1.3) * 1.0;
  })();
  const eyeSpread = (() => {
    let pref;
    if (size >= 80) pref = 1.0;
    else if (size <= 20) pref = 0.85;
    else {
      const t = (80 - size) / (80 - 20);
      pref = 1.0 - Math.pow(t, 1.3) * 0.15;
    }
    const minSpread = (4 + 6 * eyeScale) / 18;
    return Math.max(pref, minSpread);
  })();
  const LEFT_CX = 39, RIGHT_CX = 57, EYE_CY = 31, PAIR_CX = 48;
  const leftDx  =  (PAIR_CX - LEFT_CX)  * (1 - eyeSpread);
  const rightDx = -(RIGHT_CX - PAIR_CX) * (1 - eyeSpread);

  // Comma eyes (lifted from OpenSearch mascot, 80×80 viewBox).
  const EYE_L = "M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z";
  const EYE_R = "M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z";

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="40" cy="40" r="38" fill={ringFill} stroke={T.cyanDim} strokeWidth={sw * 0.4}/>
      <circle cx="40" cy="40" r="34" fill={bodyFill} stroke={T.cyan} strokeWidth={sw}/>
      {[0, 90, 180, 270].map(a => {
        const r = a * Math.PI / 180;
        const x1 = 40 + Math.cos(r) * 34;
        const y1 = 40 + Math.sin(r) * 34;
        const x2 = 40 + Math.cos(r) * 38;
        const y2 = 40 + Math.sin(r) * 38;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.cyan} strokeWidth={sw * 0.6}/>;
      })}
      <g transform={`translate(${leftDx} 0) translate(${LEFT_CX} ${EYE_CY}) scale(${eyeScale}) translate(${-LEFT_CX} ${-EYE_CY})`}>
        <path d={EYE_L} fill={T.cyan}/>
      </g>
      <g transform={`translate(${rightDx} 0) translate(${RIGHT_CX} ${EYE_CY}) scale(${eyeScale}) translate(${-RIGHT_CX} ${-EYE_CY})`}>
        <path d={EYE_R} fill={T.cyan}/>
      </g>
    </svg>
  );
}

function PersonAvatar({ initial, size = 24 }) {
  const T = useT();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.4px solid ${T.amber}`,
      display: 'grid', placeItems: 'center',
      color: T.amber, fontWeight: 700,
      fontSize: size * 0.46, fontFamily: WMONO,
      letterSpacing: 0.5, flexShrink: 0,
      boxShadow: `inset 0 0 0 2px ${T.bg}, inset 0 0 0 3px ${T.amberDim}`,
    }}>{initial}</div>
  );
}

// ─── theme toggle ───────────────────────────────────────────────

function ThemeToggle({ mode, setMode }) {
  const T = useT();
  const onLight = mode === 'light';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `1px solid ${T.inkFade}`,
      background: T.panel,
      fontFamily: WMONO, fontSize: 10, letterSpacing: 1.4,
      userSelect: 'none',
    }}>
      <button
        type="button"
        onClick={() => setMode('light')}
        style={{
          appearance: 'none', border: 'none',
          padding: '6px 12px', cursor: 'pointer',
          background: onLight ? T.cyanSoft : 'transparent',
          color: onLight ? T.cyan : T.inkDim,
          fontWeight: onLight ? 700 : 500,
          fontFamily: WMONO, fontSize: 10, letterSpacing: 1.4,
          display: 'inline-flex', alignItems: 'center', gap: 5,
          borderRight: `1px solid ${T.inkFade}`,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11">
          <circle cx="5.5" cy="5.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1"/>
          {[0,45,90,135,180,225,270,315].map(a=>{
            const r = a*Math.PI/180;
            const x1 = 5.5+Math.cos(r)*3.8, y1 = 5.5+Math.sin(r)*3.8;
            const x2 = 5.5+Math.cos(r)*5.1, y2 = 5.5+Math.sin(r)*5.1;
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1"/>;
          })}
        </svg>
        LIGHT
      </button>
      <button
        type="button"
        onClick={() => setMode('dark')}
        style={{
          appearance: 'none', border: 'none',
          padding: '6px 12px', cursor: 'pointer',
          background: !onLight ? T.cyanSoft : 'transparent',
          color: !onLight ? T.cyan : T.inkDim,
          fontWeight: !onLight ? 700 : 500,
          fontFamily: WMONO, fontSize: 10, letterSpacing: 1.4,
          display: 'inline-flex', alignItems: 'center', gap: 5,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11">
          <path d="M8 6.4 A3.6 3.6 0 1 1 4.6 3 a2.8 2.8 0 0 0 3.4 3.4 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
        DARK
      </button>
    </div>
  );
}

// ─── header ─────────────────────────────────────────────────────

function Header() {
  const T = useT();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
      <OllyAvatar size={52}/>
      <div style={{ flex: 1 }}>
        <h1 style={{
          margin: 0,
          fontFamily: WSANS, fontWeight: 600,
          fontSize: 32, letterSpacing: -0.8,
          color: T.inkBright, lineHeight: 1.1,
        }}>Good morning, John</h1>
        <div style={{
          marginTop: 6,
          fontFamily: WSANS, fontSize: 14.5, color: T.inkDim, letterSpacing: -0.05,
        }}>
          All <span style={{ color: T.ink, fontWeight: 600 }}>247</span> services steady.
          {' '}<span style={{ color: T.amber, fontWeight: 600 }}>2</span> activities to review.
        </div>
      </div>
    </div>
  );
}

// ─── ask bar ────────────────────────────────────────────────────

function AskBar() {
  const T = useT();
  return (
    <div style={{
      position: 'relative',
      background: T.inputBg,
      border: `1px solid ${T.inkGhost}`,
      padding: '14px 16px',
      marginBottom: 22,
    }}>
      <CornerTicks accent={T.cyanDim}/>
      <div style={{
        fontFamily: WSANS, fontSize: 15, color: T.inkDim,
        minHeight: 44,
      }}>Ask AI anything, or type to search a page</div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 8,
      }}>
        {/* + plus button */}
        <span style={{
          width: 26, height: 26, borderRadius: '50%',
          border: `1px solid ${T.inkFade}`,
          display: 'grid', placeItems: 'center',
          color: T.inkDim, fontSize: 16, lineHeight: 1,
          cursor: 'pointer',
        }}>+</span>
        {/* send */}
        <span style={{
          width: 30, height: 30, borderRadius: '50%',
          border: `1px solid ${T.cyanDim}`,
          background: T.cyanSoft,
          display: 'grid', placeItems: 'center',
          color: T.cyan, cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <line x1="7" y1="11" x2="7" y2="3" stroke="currentColor" strokeWidth="1.4"/>
            <polyline points="3,7 7,3 11,7" fill="none" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

// ─── tab bar ────────────────────────────────────────────────────

function TabBar() {
  const T = useT();
  const tabs = ['Overview', 'Discover', 'Monitor', 'More'];
  const [active, setActive] = React.useState('Overview');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
      {/* history glyph */}
      <span style={{
        width: 36, height: 36,
        border: `1px solid ${T.inkFade}`,
        background: T.panel,
        display: 'grid', placeItems: 'center',
        color: T.inkDim, cursor: 'pointer',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/>
          <polyline points="8,4 8,8 11,10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
        </svg>
      </span>
      {tabs.map(label => {
        const isActive = active === label;
        const hasDot = label === 'Overview';
        return (
          <button
            key={label}
            type="button"
            onClick={() => setActive(label)}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '9px 18px',
              border: `1px solid ${isActive ? T.cyanDim : T.inkFade}`,
              background: isActive ? T.cyanSoft : T.panel,
              color: isActive ? T.cyan : T.ink,
              fontFamily: WMONO, fontSize: 11.5,
              letterSpacing: 1.6, fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {label}
            {hasDot && (
              <span style={{
                position: 'absolute', top: 7, right: 9,
                width: 6, height: 6,
                background: T.amber,
                boxShadow: `0 0 0 2px ${isActive ? T.amberSoft : 'transparent'}`,
              }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── latest: finding cards ──────────────────────────────────────

function FindingMeta({ d }) {
  const T = useT();
  const tone = d.severity === 'shared' ? 'shared' : 'warn';
  const accent = d.severity === 'shared' ? T.cyan : T.amber;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: WMONO, flexWrap: 'wrap' }}>
      {d.source === 'ai' ? <OllyAvatar size={22}/> : <PersonAvatar initial={d.sharedInitial} size={22}/>}
      <IsoStack total={d.scopeTotal} bad={d.scopeBad}/>
      <span style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 0.5 }}>
        {d.scopeBad}/{d.scopeTotal} {d.scopeUnit}
      </span>
      <span style={{ fontSize: 11, color: T.inkFade }}>│</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <LatencyBar tone={tone} deltaDir={d.deltaDir} solid={d.severity === 'shared' ? T.cyanSoft : T.amberSoft}/>
        <span style={{ fontSize: 11.5, color: T.inkBright, fontWeight: 700 }}>{d.metric}</span>
        <span style={{ fontSize: 9.5, color: T.inkFade, letterSpacing: 1, textTransform: 'uppercase' }}>{d.metricLabel}</span>
        <span style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 0.4 }}>
          {d.deltaDir === 'up' ? '↑' : '↓'} {d.delta}
        </span>
      </span>
      <span style={{ fontSize: 11, color: T.inkFade }}>│</span>
      <span style={{ fontSize: 10, color: T.inkDim, letterSpacing: 1.2 }}>
        T+{d.ageShort} · CONF {d.confidence}% · 3 TABS
      </span>
    </div>
  );
}

function FindingCard({ d }) {
  const T = useT();
  const accent = d.severity === 'shared' ? T.cyan : T.amber;
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      borderLeft: `2px solid ${accent}`,
      padding: '16px 20px',
      position: 'relative',
    }}>
      <CornerTicks accent={accent}/>

      {/* top row: title + dismiss */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: WSANS, fontSize: 17, fontWeight: 600,
            color: T.inkBright, letterSpacing: -0.2, lineHeight: 1.3,
          }}>{d.title}</div>
          <div style={{
            marginTop: 4,
            fontFamily: WMONO, fontSize: 10, letterSpacing: 1.4,
            color: T.inkDim, textTransform: 'uppercase',
          }}>
            {d.source === 'ai' ? 'Created by AI' : `Shared by team · ${d.sharedFrom}`} · {d.ageLong}
          </div>
        </div>
        <GhostBtn>Dismiss</GhostBtn>
      </div>

      {/* finding sentence */}
      <div style={{
        fontFamily: WSANS, fontSize: 14.5, fontWeight: 500,
        color: T.ink, lineHeight: 1.45, letterSpacing: -0.1,
        marginBottom: 12,
      }}>{d.finding}</div>

      <FindingMeta d={d}/>
    </div>
  );
}

function Latest() {
  const findings = [
    {
      title: 'Latency Spike Investigation',
      source: 'ai',
      ageLong: '15 min ago',
      finding: 'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
      severity: 'alert',
      metric: '2,140ms', metricLabel: 'P99', delta: '+184%', deltaDir: 'up',
      scopeTotal: 4, scopeBad: 3, scopeUnit: 'pods',
      confidence: 92, ageShort: '15m',
    },
    {
      title: 'Error Rate Spike — Checkout Service',
      source: 'team',
      sharedFrom: 'Sichenl',
      sharedInitial: 'S',
      ageLong: '2 hours ago',
      finding: 'Checkout error rate jumped to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
      severity: 'shared',
      metric: '12.4%', metricLabel: 'err rate', delta: '+12.4 pts', deltaDir: 'up',
      scopeTotal: 1, scopeBad: 1, scopeUnit: 'svc',
      confidence: 88, ageShort: '2h',
    },
  ];
  return (
    <div>
      <SectionLabel>LATEST</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {findings.map((f, i) => <FindingCard key={i} d={f}/>)}
      </div>
    </div>
  );
}

// ─── service: top services by fault rate ────────────────────────

function FaultBar({ pct }) {
  const T = useT();
  // Iso-styled progress: filled is a small iso block, rest is dashed
  const filledW = Math.max(2, pct * 1.6);
  const totalW = 160;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      <div style={{
        height: 12, width: filledW,
        background: T.cyanSoft,
        border: `1px solid ${T.cyan}`,
      }}/>
      <div style={{
        height: 12, width: totalW - filledW,
        background: 'transparent',
        borderTop: `1px solid ${T.inkFade}`,
        borderBottom: `1px solid ${T.inkFade}`,
        borderRight: `1px solid ${T.inkFade}`,
        backgroundImage: `repeating-linear-gradient(45deg, ${T.inkGhost} 0 1px, transparent 1px 6px)`,
      }}/>
    </div>
  );
}

function TopServices() {
  const T = useT();
  const rows = [
    { svc: 'checkout',       pct: 66.67 },
    { svc: 'frontend',       pct: 14.49 },
    { svc: 'frontend-proxy', pct: 14.29 },
  ];
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      padding: '16px 20px',
      position: 'relative',
      height: '100%', boxSizing: 'border-box',
    }}>
      <CornerTicks/>
      <div style={{
        fontFamily: WSANS, fontSize: 16, fontWeight: 600,
        color: T.inkBright, letterSpacing: -0.2, marginBottom: 14,
      }}>Top services by fault rate</div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 160px 60px',
        fontFamily: WMONO, fontSize: 9.5, letterSpacing: 1.4,
        color: T.inkFade, textTransform: 'uppercase',
        paddingBottom: 6, borderBottom: `1px solid ${T.inkGhost}`,
        marginBottom: 8, alignItems: 'center',
      }}>
        <span>Service</span>
        <span>Fault rate</span>
        <span style={{ textAlign: 'right' }}>%</span>
      </div>

      {rows.map((r,i)=>(
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 60px',
          alignItems: 'center', padding: '8px 0',
          borderBottom: i < rows.length - 1 ? `1px dashed ${T.inkGhost}` : 'none',
        }}>
          <span style={{ fontFamily: WMONO, fontSize: 12.5, color: T.cyan, fontWeight: 600, letterSpacing: 0.3 }}>{r.svc}</span>
          <FaultBar pct={r.pct}/>
          <span style={{
            fontFamily: WMONO, fontSize: 12, color: T.inkBright,
            fontWeight: 700, textAlign: 'right', letterSpacing: 0.3,
          }}>{r.pct.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── saved query: connection timeout errors ─────────────────────

function ConnTimeouts() {
  const T = useT();
  const pts = [30, 28, 32, 35, 40, 50, 65, 90, 140, 220, 380, 600, 720, 800, 847];
  const min = Math.min(...pts), max = Math.max(...pts);
  const w = 200, h = 56;
  const sx = w / (pts.length - 1);
  const sy = (v) => h - ((v - min) / (max - min)) * (h - 4) - 2;
  const linePts = pts.map((v,i)=>`${i*sx},${sy(v)}`).join(' ');
  const fillPts = `0,${h} ${linePts} ${w},${h}`;
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      padding: '16px 20px',
      position: 'relative',
      height: '100%', boxSizing: 'border-box',
    }}>
      <CornerTicks accent={T.amberDim}/>
      <div style={{
        fontFamily: WSANS, fontSize: 16, fontWeight: 600,
        color: T.inkBright, letterSpacing: -0.2, marginBottom: 4,
      }}>Connection timeout errors</div>
      <div style={{
        fontFamily: WMONO, fontSize: 11, color: T.cyan,
        letterSpacing: 0.4, marginBottom: 16,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        <span style={{ color: T.inkFade }}>$</span> source=logs <span style={{ color: T.inkFade }}>|</span> where seve…
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, marginTop: 18, flexWrap: 'wrap' }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
          {/* grid lines */}
          {[0.25, 0.5, 0.75].map(p => (
            <line key={p} x1="0" y1={h*p} x2={w} y2={h*p} stroke={T.inkGhost} strokeWidth="0.5" strokeDasharray="2 3"/>
          ))}
          <polygon points={fillPts} fill={T.amberSoft}/>
          <polyline points={linePts} fill="none" stroke={T.amber} strokeWidth="1.6"/>
          {/* end marker */}
          <circle cx={w} cy={sy(pts[pts.length-1])} r="3" fill={T.amber}/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: WMONO, fontSize: 28, color: T.amber, fontWeight: 700, letterSpacing: -0.5 }}>847</span>
          <span style={{ fontFamily: WMONO, fontSize: 11, color: T.amber, fontWeight: 700, letterSpacing: 0.4 }}>↑ +312%</span>
          <span style={{ fontFamily: WMONO, fontSize: 9.5, color: T.inkDim, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>Last 15 min</span>
        </div>
      </div>
    </div>
  );
}

// ─── favorites ──────────────────────────────────────────────────

function FavoriteRow({ title, kind, icon }) {
  const T = useT();
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      padding: '14px 20px',
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer',
    }}>
      <CornerTicks/>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: WSANS, fontSize: 15, fontWeight: 600,
          color: T.inkBright, letterSpacing: -0.2,
        }}>{title}</div>
        <div style={{
          fontFamily: WMONO, fontSize: 10, letterSpacing: 1.4,
          color: T.inkDim, textTransform: 'uppercase', marginTop: 3,
        }}>{kind}</div>
      </div>
      <div style={{ color: T.cyan, opacity: 0.8 }}>{icon}</div>
    </div>
  );
}

function Favorites() {
  const T = useT();
  return (
    <div>
      <SectionLabel>FAVORITES</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FavoriteRow
          title="System overview"
          kind="Dashboard"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="2" y="2" width="7" height="7"/>
              <rect x="11" y="2" width="7" height="7"/>
              <rect x="2" y="11" width="7" height="7"/>
              <rect x="11" y="11" width="7" height="7"/>
            </svg>
          }
        />
        <FavoriteRow
          title="Error rate by service"
          kind="Saved log"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="10" cy="10" r="8"/>
              <polygon points="10,4 13,10 10,16 7,10" fill="currentColor" stroke="none"/>
            </svg>
          }
        />
      </div>
    </div>
  );
}

// ─── page ───────────────────────────────────────────────────────

function Welcome() {
  const [mode, setMode] = React.useState('dark');
  const T = THEMES[mode];
  return (
    <ThemeContext.Provider value={T}>
      <div style={{
        minHeight: '100vh',
        background: T.bg,
        backgroundImage: `
          linear-gradient(to right, ${T.gridFine} 1px, transparent 1px),
          linear-gradient(to bottom, ${T.gridFine} 1px, transparent 1px),
          linear-gradient(to right, ${T.gridMajor} 1px, transparent 1px),
          linear-gradient(to bottom, ${T.gridMajor} 1px, transparent 1px)
        `,
        backgroundSize: '16px 16px, 16px 16px, 80px 80px, 80px 80px',
        color: T.ink,
        fontFamily: WSANS,
        padding: '40px 0 80px',
        position: 'relative',
        transition: 'background-color 200ms ease, color 200ms ease',
      }}>
        {/* corner registration marks */}
        {[{top: 14, left: 14}, {top: 14, right: 14}, {bottom: 14, left: 14}, {bottom: 14, right: 14}].map((s, i) => (
          <div key={i} style={{ position: 'fixed', width: 14, height: 14, ...s, pointerEvents: 'none', zIndex: 1 }}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="4" fill="none" stroke={T.cyanDim} strokeWidth="0.7"/>
              <line x1="0" y1="7" x2="14" y2="7" stroke={T.cyanDim} strokeWidth="0.7"/>
              <line x1="7" y1="0" x2="7" y2="14" stroke={T.cyanDim} strokeWidth="0.7"/>
            </svg>
          </div>
        ))}

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 28px' }}>

          {/* top row: theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <ThemeToggle mode={mode} setMode={setMode}/>
          </div>

          <Header/>
          <AskBar/>
          <TabBar/>
          <Latest/>

          <div style={{ height: 28 }}/>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <SectionLabel>SERVICE</SectionLabel>
              <TopServices/>
            </div>
            <div>
              <SectionLabel>SAVED QUERY</SectionLabel>
              <ConnTimeouts/>
            </div>
          </div>

          <div style={{ height: 28 }}/>

          <Favorites/>

          {/* edit overview footer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
            <span style={{
              padding: '8px 22px',
              border: `1px solid ${T.inkFade}`,
              background: T.panel,
              color: T.inkDim,
              fontFamily: WMONO, fontSize: 10.5, letterSpacing: 1.6,
              fontWeight: 600, textTransform: 'uppercase',
              cursor: 'pointer',
            }}>◷ Edit overview</span>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

Object.assign(window, { WelcomeD3: Welcome });
