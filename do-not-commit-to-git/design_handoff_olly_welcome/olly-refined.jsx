// Olly refined — Outfit + harmonised modular type scale
// Reuses widget components from olly-widgets.jsx.
// Scale: text track 11/13/14/16/18 (1.125 ratio)
//        display track 22/28/36/48 (1.5 ratio gaps)

const ORFONT = "'Outfit', system-ui, sans-serif";
const ORMONO = "'IBM Plex Mono', ui-monospace, monospace";

// Modular scale — everything pulls from here so changes stay coherent.
const T = {
  // Text track (body-ish)
  micro:    9,   // tiny mono captions, status text
  xs:       10,  // mono labels, secondary meta
  sm:       11,  // tab labels, small body
  base:     12,  // chat input placeholder, base body
  md:       13,  // finding text, emphasised body
  // Display track
  lg:       16,  // Olly name when emphasised
  xl:       20,  // subheading
  display:  26,  // mid display
  hero:     34,  // greeting (responsive: clamp below)
};

const ORC = {
  bg: '#F4F7FB',
  ink: '#0E2A4A',
  sub: 'rgba(14, 42, 74, 0.55)',
  dim: 'rgba(14, 42, 74, 0.40)',
  hairline: 'rgba(14, 42, 74, 0.12)',
  accent: '#1F6CB5',
  deep: '#003B5C',
  eyebrow: 'rgb(40, 63, 107)',
  green: '#2E8B6F',
  alert: '#C53961',
  alertSoft: 'rgba(197, 57, 97, 0.08)',
  alertBorder: 'rgba(197, 57, 97, 0.30)',
  grid: 'rgba(14, 42, 74, 0.04)',
};

// Make sure the widget components pick up our refined palette
window.OllyColors = ORC;

const REFINED_FINDINGS = [
  {
    id: 1, source: 'ai',
    finding: 'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
    severity: 'alert', priority: 'P1',
    service: 'payment-svc', scope: '3 of 4 pods',
    confidence: 92, age: '15 min ago',
    trend: 'still climbing',
    tabs: 3,
  },
  {
    id: 2, source: 'team', sharedBy: 'Sichen',
    finding: 'Checkout error rate jumped to 12.4%. Auth-service deployment regression — OIDC token validation timing out.',
    severity: 'normal', priority: 'P2',
    service: 'checkout-svc', scope: 'auth-svc deploy',
    age: '2 hours ago',
    detail: 'linked to auth-svc rollout',
    tabs: 3,
  },
];

// ─── Primitives ─────────────────────────────────────────────────

function ORPulse({ color = ORC.green, size = 8 }) {
  return (
    <span style={{ position: 'relative', width: size, height: size, display: 'inline-block', flexShrink: 0 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'orPulse 2.4s ease-out infinite' }}/>
      <span style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: color }}/>
    </span>
  );
}

function ORAvatar({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${ORC.accent}, ${ORC.deep})`,
      display: 'grid', placeItems: 'center', color: '#fff',
      fontSize: size * 0.46, fontWeight: 700, letterSpacing: -0.5,
      fontFamily: ORFONT, flexShrink: 0,
    }}>O</div>
  );
}

function ORSource({ source, sharedBy, size = 22 }) {
  if (source === 'ai') return <ORAvatar size={size}/>;
  const initial = (sharedBy || 'T')[0];
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: '#DC3545', color: '#fff',
      display: 'grid', placeItems: 'center', flexShrink: 0,
      fontSize: size * 0.46, fontWeight: 600, fontFamily: ORFONT,
    }}>{initial}</span>
  );
}

// ─── Identity + greeting ────────────────────────────────────────

function RefinedHeader({ summary, showFindings }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <ORAvatar size={32}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{
            fontFamily: ORFONT, fontSize: T.lg, fontWeight: 700, color: ORC.ink,
            display: 'flex', alignItems: 'center', gap: 7, lineHeight: 1,
          }}>
            Olly
            <ORPulse size={7}/>
          </span>
          <span style={{
            fontFamily: ORMONO, fontSize: T.xs, fontWeight: 500,
            color: ORC.eyebrow, letterSpacing: 1.2, textTransform: 'uppercase',
          }}>
            OpenSearch Observability Agent
          </span>
        </div>
      </div>

      <h1 style={{
        fontFamily: ORFONT,
        fontSize: `clamp(${T.display}px, 3vw, ${T.hero}px)`,
        fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15,
        color: ORC.ink, margin: 0, maxWidth: 860,
      }}>
        Good morning, John — <span style={{ color: ORC.sub, fontWeight: 500 }}>{summary}</span>
      </h1>
    </div>
  );
}

// ─── Chat input ─────────────────────────────────────────────────

function RefinedChat() {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${ORC.hairline}`,
      borderRadius: 10, padding: '16px 18px',
      boxShadow: '0 1px 0 rgba(14,42,74,0.02), 0 16px 48px -32px rgba(14,42,74,0.18)',
      marginBottom: 36,
    }}>
      <div style={{
        fontFamily: ORFONT, fontSize: T.base, color: ORC.dim, lineHeight: 1.5,
        marginBottom: 22,
      }}>
        Ask Olly anything. Type <span style={{ fontFamily: ORMONO, color: ORC.accent }}>/</span> for actions, <span style={{ fontFamily: ORMONO, color: ORC.accent }}>@</span> to reference a service.
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: ORC.dim, fontSize: 15, lineHeight: 1 }}>+</span>
        <span style={{
          width: 26, height: 26, borderRadius: '50%', background: ORC.accent, color: '#fff',
          display: 'grid', placeItems: 'center', fontSize: T.sm, fontWeight: 600,
        }}>↑</span>
      </div>
    </div>
  );
}

// ─── Dashed divider ─────────────────────────────────────────────

function ORDivider() {
  return (
    <div style={{
      borderTop: `1px dashed ${ORC.hairline}`,
      margin: '8px 0 36px',
    }}/>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────

function RefinedTabs({ findingsCount }) {
  const tabs = [
    { label: 'Activity', icon: 'sparkles', active: true, badge: findingsCount || null },
    { label: 'Recent', icon: 'clock' },
    { label: 'Favorite', icon: 'star' },
    { label: 'Discover', icon: 'compass' },
    { label: 'Monitor', icon: 'monitor' },
    { label: 'More', icon: 'dots' },
  ];
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
      {tabs.map((t) => (
        <div key={t.label} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 999,
          background: t.active ? '#fff' : 'transparent',
          border: `1px solid ${t.active ? ORC.accent : ORC.hairline}`,
          color: t.active ? ORC.accent : ORC.sub,
          fontSize: T.sm, fontWeight: t.active ? 600 : 500,
          fontFamily: ORFONT, cursor: 'pointer',
          boxShadow: t.active ? '0 2px 8px -4px rgba(31,108,181,0.30)' : 'none',
          transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
        }}>
          <ORTabIcon name={t.icon} size={12}/>
          <span>{t.label}</span>
          {t.badge != null && (
            <span style={{
              fontFamily: ORMONO, fontSize: T.micro, fontWeight: 600,
              background: t.active ? ORC.accent : 'rgba(14,42,74,0.08)',
              color: t.active ? '#fff' : ORC.sub,
              padding: '2px 7px', borderRadius: 999, lineHeight: 1.2,
            }}>{t.badge}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ORTabIcon({ name, size = 14 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'sparkles': return <svg {...c}><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5L12 4z"/></svg>;
    case 'clock':    return <svg {...c}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>;
    case 'star':     return <svg {...c}><path d="M12 4l2.5 5.5 6 .8-4.4 4.2 1.1 6L12 17.6 6.8 20.5l1.1-6L3.5 10.3l6-.8L12 4z"/></svg>;
    case 'compass':  return <svg {...c}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/></svg>;
    case 'monitor':  return <svg {...c}><path d="M18 8a6 6 0 0 0-12 0v5l-2 2v1h16v-1l-2-2V8z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
    case 'dots':     return <svg {...c}><circle cx="5" cy="6" r="1"/><circle cx="12" cy="6" r="1"/><circle cx="19" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
    default: return null;
  }
}

// ─── Findings ───────────────────────────────────────────────────

function RefinedChip({ tone, children }) {
  const tones = {
    alert:   { bg: ORC.alertSoft, fg: ORC.alert,  bd: ORC.alertBorder },
    warn:    { bg: 'rgba(194,139,46,0.10)', fg: '#A8761F', bd: 'rgba(194,139,46,0.30)' },
    service: { bg: 'rgba(31,108,181,0.08)', fg: ORC.accent, bd: 'rgba(31,108,181,0.25)' },
  };
  const c = tones[tone] || tones.service;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: 4,
      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
      fontFamily: ORMONO, fontSize: T.micro, fontWeight: 700,
      letterSpacing: 1, textTransform: 'uppercase', lineHeight: 1.3,
    }}>{children}</span>
  );
}

function RefinedFindingCard({ f }) {
  const isAlert = f.severity === 'alert';
  const isOlly = f.source === 'ai';
  // Plain-English summary (D) — voice changes by source.
  const summary = isOlly
    ? <>Started <b style={{ color: ORC.ink, fontWeight: 600 }}>{f.age}</b>, <b style={{ color: isAlert ? ORC.alert : '#A8761F', fontWeight: 600 }}>{f.trend}</b> on {f.scope} · <b style={{ color: ORC.ink, fontWeight: 600 }}>{f.confidence}% confidence</b></>
    : <>Shared <b style={{ color: ORC.ink, fontWeight: 600 }}>{f.age}</b> by <b style={{ color: ORC.ink, fontWeight: 600 }}>{f.sharedBy}</b> · {f.detail}</>;

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${isAlert ? ORC.alertBorder : ORC.hairline}`,
      borderLeft: `3px solid ${isAlert ? ORC.alert : ORC.accent}`,
      borderRadius: 10, padding: '22px 28px', cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}>
      <div style={{
        fontFamily: ORFONT, fontSize: T.md, fontWeight: 600,
        color: ORC.ink, lineHeight: 1.55, marginBottom: 18, letterSpacing: -0.1,
      }}>
        {f.finding}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <ORSource source={f.source} sharedBy={f.sharedBy} size={22}/>
        <RefinedChip tone={isAlert ? 'alert' : 'warn'}>{f.priority}</RefinedChip>
        <RefinedChip tone="service">{f.service}</RefinedChip>
        <span style={{
          fontFamily: ORFONT, fontSize: T.sm, color: ORC.sub,
          fontWeight: 400, lineHeight: 1.5,
        }}>
          {summary}
        </span>
        <span style={{ flex: 1 }}/>
        <span style={{
          fontFamily: ORMONO, fontSize: T.micro,
          color: ORC.accent, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700,
          cursor: 'pointer',
        }}>Open →</span>
      </div>
    </div>
  );
}

function RefinedFindings({ findings = REFINED_FINDINGS }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 16, padding: '0 2px',
      }}>
        <span style={{
          fontFamily: ORMONO, fontSize: T.xs, letterSpacing: 1.6,
          color: ORC.accent, fontWeight: 600,
        }}>
          // FROM YOUR AGENT — {String(findings.length).padStart(2, '0')} FINDING{findings.length === 1 ? '' : 'S'}
        </span>
        <span style={{
          fontFamily: ORFONT, fontSize: T.sm, color: ORC.sub,
          cursor: 'pointer', fontWeight: 500,
        }}>Mark all read</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {findings.map((f) => <RefinedFindingCard key={f.id} f={f}/>)}
      </div>
    </div>
  );
}

function RefinedEmpty() {
  return (
    <div style={{
      border: `1px dashed ${ORC.hairline}`, borderRadius: 12,
      padding: '40px 28px', textAlign: 'center', color: ORC.sub,
      fontFamily: ORFONT, fontSize: T.sm,
    }}>
      <div style={{
        fontSize: T.md, fontWeight: 600, color: ORC.ink, marginBottom: 6,
      }}>All clear.</div>
      Olly will surface anything worth your attention here.
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

function OllyRefined({ tweaks = {}, children }) {
  const showFindings = tweaks.findings !== false;
  const summary = showFindings
    ? 'all 247 services steady overnight. 2 findings to review.'
    : 'all 247 services steady overnight. All clear.';

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: ORC.bg, color: ORC.ink, fontFamily: ORFONT,
      padding: 'clamp(48px, 5vw, 80px) clamp(32px, 6vw, 96px) 96px',
      backgroundImage: `linear-gradient(to right, ${ORC.grid} 1px, transparent 1px), linear-gradient(to bottom, ${ORC.grid} 1px, transparent 1px)`,
      backgroundSize: '32px 32px',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <RefinedHeader summary={summary} showFindings={showFindings}/>
        <RefinedChat/>
        <ORDivider/>
        <RefinedTabs findingsCount={showFindings ? 2 : null}/>
        {showFindings ? <RefinedFindings/> : <RefinedEmpty/>}
        {children}
      </div>
      <style>{`@keyframes orPulse { 0%{transform:scale(1);opacity:.45} 100%{transform:scale(2.8);opacity:0} }`}</style>
    </div>
  );
}

window.OllyRefined = OllyRefined;
