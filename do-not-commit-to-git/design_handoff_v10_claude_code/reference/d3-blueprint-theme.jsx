// D3 blueprint theme — shared tokens, context, and primitives
// Used by Welcome D3 and Dashboard D3.

const D3FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";
const D3FONT_SANS = "'Outfit', system-ui, sans-serif";

const D3_THEMES = {
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
    greenSoft: 'rgba(123,224,168,0.10)',
    red:       '#ff7a7a',
    redDim:    'rgba(255,122,122,0.45)',
    redSoft:   'rgba(255,122,122,0.10)',
    gridFine:  'rgba(207,228,247,0.05)',
    gridMajor: 'rgba(207,228,247,0.10)',
    inputBg:   'rgba(10,37,69,0.45)',
    codeBg:    'rgba(10,37,69,0.7)',
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
    greenSoft: 'rgba(46,139,111,0.08)',
    red:       '#c53961',
    redDim:    'rgba(197,57,97,0.45)',
    redSoft:   'rgba(197,57,97,0.08)',
    gridFine:  'rgba(13,48,87,0.05)',
    gridMajor: 'rgba(13,48,87,0.10)',
    inputBg:   'rgba(255,255,255,0.7)',
    codeBg:    'rgba(13,48,87,0.05)',
  },
};

const D3ThemeContext = React.createContext(D3_THEMES.dark);
const useD3T = () => React.useContext(D3ThemeContext);

// ─── primitives ─────────────────────────────────────────────────

function D3CornerTicks({ accent }) {
  const T = useD3T();
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

function D3SectionLabel({ children, style }) {
  const T = useD3T();
  return (
    <div style={{
      fontFamily: D3FONT_MONO, fontSize: 10.5, letterSpacing: 1.8,
      color: T.cyan, fontWeight: 700,
      marginBottom: 10,
      display: 'flex', alignItems: 'center', gap: 10,
      ...style,
    }}>
      <span>// {children}</span>
      <span style={{ flex: 1, borderTop: `1px dashed ${T.inkGhost}` }}/>
    </div>
  );
}

function D3OllyAvatar({ size = 40 }) {
  const T = useD3T();
  // Stroke widths scale slightly with size for legibility
  const sw = size < 30 ? 1.6 : size < 60 ? 1.2 : 1.0;
  const bodyFill = T.name === 'dark' ? T.bgDeep : '#dde9f5';
  const ringFill = T.name === 'dark' ? 'rgba(93,217,255,0.08)' : 'rgba(31,108,181,0.08)';

  // Small-size eye legibility: scale eyes up + pull pair inward as size shrinks.
  // (Lifted from the OpenSearch mascot's eye-pop logic.)
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
      {/* outer faint ring */}
      <circle cx="40" cy="40" r="38" fill={ringFill} stroke={T.cyanDim} strokeWidth={sw * 0.4}/>
      {/* body */}
      <circle cx="40" cy="40" r="34" fill={bodyFill} stroke={T.cyan} strokeWidth={sw}/>
      {/* cardinal registration ticks */}
      {[0, 90, 180, 270].map(a => {
        const r = a * Math.PI / 180;
        const x1 = 40 + Math.cos(r) * 34;
        const y1 = 40 + Math.sin(r) * 34;
        const x2 = 40 + Math.cos(r) * 38;
        const y2 = 40 + Math.sin(r) * 38;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.cyan} strokeWidth={sw * 0.6}/>;
      })}
      {/* eyes — scaled for small-size legibility */}
      <g transform={`translate(${leftDx} 0) translate(${LEFT_CX} ${EYE_CY}) scale(${eyeScale}) translate(${-LEFT_CX} ${-EYE_CY})`}>
        <path d={EYE_L} fill={T.cyan}/>
      </g>
      <g transform={`translate(${rightDx} 0) translate(${RIGHT_CX} ${EYE_CY}) scale(${eyeScale}) translate(${-RIGHT_CX} ${-EYE_CY})`}>
        <path d={EYE_R} fill={T.cyan}/>
      </g>
    </svg>
  );
}

function D3PersonAvatar({ initial, color, size = 24 }) {
  const T = useD3T();
  const c = color || T.amber;
  const dim = color === T.red ? T.redDim : T.amberDim;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.4px solid ${c}`,
      display: 'grid', placeItems: 'center',
      color: c, fontWeight: 700,
      fontSize: size * 0.46, fontFamily: D3FONT_MONO,
      letterSpacing: 0.5, flexShrink: 0,
      boxShadow: `inset 0 0 0 2px ${T.bg}, inset 0 0 0 3px ${dim}`,
    }}>{initial}</div>
  );
}

function D3IsoCube({ x, broken, ok }) {
  const T = useD3T();
  const c = broken ? T.amber : (ok ? T.green : T.cyan);
  const fillBroken = T.name === 'dark' ? 'rgba(255,184,107,0.16)' : 'rgba(196,122,31,0.14)';
  const fillOk     = T.name === 'dark' ? 'rgba(123,224,168,0.14)' : 'rgba(46,139,111,0.12)';
  const fillDef    = T.name === 'dark' ? 'rgba(93,217,255,0.10)'  : 'rgba(31,108,181,0.08)';
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

function D3IsoStack({ total, bad, allOk }) {
  const T = useD3T();
  const shown = Math.min(total, 7);
  const overflow = total - shown;
  const w = shown * 14 + 16 + (overflow ? 22 : 0);
  return (
    <svg width={w} height="22" viewBox={`0 0 ${w} 22`} style={{ flexShrink: 0 }}>
      {Array.from({length: shown}).map((_,i)=>(
        <D3IsoCube key={i} x={i * 14} broken={!allOk && i < bad} ok={allOk}/>
      ))}
      {overflow > 0 && (
        <text x={shown * 14 + 4} y="14" fontFamily={D3FONT_MONO} fontSize="9" fill={T.inkDim}>+{overflow}</text>
      )}
    </svg>
  );
}

// Theme toggle — segmented control
function D3ThemeToggle({ mode, setMode, style }) {
  const T = useD3T();
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `1px solid ${T.inkFade}`,
      background: T.panel,
      fontFamily: D3FONT_MONO, fontSize: 10, letterSpacing: 1.4,
      userSelect: 'none', ...style,
    }}>
      {['light', 'dark'].map((m, i) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              appearance: 'none', border: 'none',
              padding: '6px 12px', cursor: 'pointer',
              background: active ? T.cyanSoft : 'transparent',
              color: active ? T.cyan : T.inkDim,
              fontWeight: active ? 700 : 500,
              fontFamily: D3FONT_MONO, fontSize: 10, letterSpacing: 1.4,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              borderRight: i === 0 ? `1px solid ${T.inkFade}` : 'none',
            }}
          >
            {m === 'light' ? (
              <svg width="11" height="11" viewBox="0 0 11 11">
                <circle cx="5.5" cy="5.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1"/>
                {[0,45,90,135,180,225,270,315].map(a=>{
                  const r = a*Math.PI/180;
                  return <line key={a}
                    x1={5.5+Math.cos(r)*3.8} y1={5.5+Math.sin(r)*3.8}
                    x2={5.5+Math.cos(r)*5.1} y2={5.5+Math.sin(r)*5.1}
                    stroke="currentColor" strokeWidth="1"/>;
                })}
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 11 11">
                <path d="M8 6.4 A3.6 3.6 0 1 1 4.6 3 a2.8 2.8 0 0 0 3.4 3.4 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            )}
            {m.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

// Page background — grid pattern + corner registration marks
function D3PageBackground({ children, marks = true }) {
  const T = useD3T();
  return (
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
      fontFamily: D3FONT_SANS,
      position: 'relative',
      transition: 'background-color 200ms ease, color 200ms ease',
    }}>
      {marks && [{top: 14, left: 14}, {top: 14, right: 14}, {bottom: 14, left: 14}, {bottom: 14, right: 14}].map((s, i) => (
        <div key={i} style={{ position: 'fixed', width: 14, height: 14, ...s, pointerEvents: 'none', zIndex: 50 }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="4" fill="none" stroke={T.cyanDim} strokeWidth="0.7"/>
            <line x1="0" y1="7" x2="14" y2="7" stroke={T.cyanDim} strokeWidth="0.7"/>
            <line x1="7" y1="0" x2="7" y2="14" stroke={T.cyanDim} strokeWidth="0.7"/>
          </svg>
        </div>
      ))}
      {children}
    </div>
  );
}

Object.assign(window, {
  D3FONT_MONO, D3FONT_SANS,
  D3_THEMES, D3ThemeContext, useD3T,
  D3CornerTicks, D3SectionLabel,
  D3OllyAvatar, D3PersonAvatar,
  D3IsoCube, D3IsoStack,
  D3ThemeToggle, D3PageBackground,
});
