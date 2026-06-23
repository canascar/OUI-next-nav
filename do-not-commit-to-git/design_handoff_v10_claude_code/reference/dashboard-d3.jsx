// Dashboard D3 — Latency Spike Investigation
// Left rail + chat panel + canvas (tabs) panel, all in blueprint visual language.

const {
  D3FONT_MONO: DMONO, D3FONT_SANS: DSANS,
  D3_THEMES, D3ThemeContext, useD3T,
  D3CornerTicks, D3OllyAvatar, D3PersonAvatar, D3ThemeToggle, D3PageBackground,
} = window;

// ─── left rail ──────────────────────────────────────────────────

function RailIcon({ children, active, color }) {
  const T = useD3T();
  return (
    <div style={{
      width: 36, height: 36,
      display: 'grid', placeItems: 'center',
      border: `1px solid ${active ? T.cyanDim : 'transparent'}`,
      background: active ? T.cyanSoft : 'transparent',
      color: color || (active ? T.cyan : T.inkDim),
      cursor: 'pointer',
    }}>{children}</div>
  );
}

function LeftRail() {
  const T = useD3T();
  return (
    <div style={{
      width: 56, flexShrink: 0,
      borderRight: `1px solid ${T.inkGhost}`,
      background: T.panel,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 0',
      position: 'relative',
    }}>
      {/* OpenSearch logo */}
      <div style={{ marginBottom: 14, width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 64 64" fill="none">
          <path d="M61.7374 23.5C60.4878 23.5 59.4748 24.513 59.4748 25.7626C59.4748 44.3813 44.3813 59.4748 25.7626 59.4748C24.513 59.4748 23.5 60.4878 23.5 61.7374C23.5 62.987 24.513 64 25.7626 64C46.8805 64 64 46.8805 64 25.7626C64 24.513 62.987 23.5 61.7374 23.5Z" fill="#005EB8"/>
          <path d="M48.0814 38C50.2572 34.4505 52.3615 29.7178 51.9475 23.0921C51.0899 9.36725 38.6589 -1.04463 26.9206 0.0837327C22.3253 0.525465 17.6068 4.2712 18.026 10.9805C18.2082 13.8961 19.6352 15.6169 21.9544 16.9399C24.1618 18.1992 26.9978 18.9969 30.2128 19.9011C34.0962 20.9934 38.6009 22.2203 42.063 24.7717C46.2125 27.8295 49.0491 31.3743 48.0814 38Z" fill="#003B5C"/>
          <path d="M3.91861 14C1.74276 17.5495 -0.361506 22.2822 0.0524931 28.9079C0.910072 42.6327 13.3411 53.0446 25.0794 51.9163C29.6747 51.4745 34.3932 47.7288 33.974 41.0195C33.7918 38.1039 32.3647 36.3831 30.0456 35.0601C27.8382 33.8008 25.0022 33.0031 21.7872 32.0989C17.9038 31.0066 13.3991 29.7797 9.93694 27.2283C5.78746 24.1704 2.95092 20.6257 3.91861 14Z" fill="#005EB8"/>
        </svg>
      </div>

      {/* main icons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <RailIcon>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
            <line x1="9" y1="3" x2="9" y2="15"/>
            <line x1="3" y1="9" x2="15" y2="9"/>
          </svg>
        </RailIcon>
        <RailIcon active>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3 4 H15 V12 H8 L4 15 V12 H3 Z"/>
          </svg>
        </RailIcon>
        <RailIcon>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M2 5 L7 5 L9 7 L16 7 L16 14 L2 14 Z"/>
          </svg>
        </RailIcon>
      </div>

      {/* spacer */}
      <div style={{ flex: 1 }}/>

      {/* bottom icons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <RailIcon>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="2" y="2" width="6" height="6"/>
            <rect x="10" y="2" width="6" height="6"/>
            <rect x="2" y="10" width="6" height="6"/>
            <rect x="10" y="10" width="6" height="6"/>
          </svg>
        </RailIcon>
        <RailIcon>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
            <polyline points="3,5 6,9 3,13"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
          </svg>
        </RailIcon>
        <RailIcon>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="9" cy="9" r="2.4"/>
            <path d="M9 1 L9 3 M9 15 L9 17 M1 9 L3 9 M15 9 L17 9 M3.3 3.3 L4.7 4.7 M13.3 13.3 L14.7 14.7 M3.3 14.7 L4.7 13.3 M13.3 4.7 L14.7 3.3"/>
          </svg>
        </RailIcon>
      </div>

      {/* user avatar at bottom */}
      <div style={{ marginTop: 10 }}>
        <D3PersonAvatar initial="J" color={T.red} size={28}/>
      </div>
    </div>
  );
}

// ─── chat header ────────────────────────────────────────────────

function ChatHeader() {
  const T = useD3T();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 18px',
      borderBottom: `1px solid ${T.inkGhost}`,
      flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={T.cyan} strokeWidth="1.4">
        <path d="M3 3 H15 V12 H8 L4 15 V12 H3 Z"/>
      </svg>
      <div style={{
        flex: 1,
        fontFamily: DSANS, fontSize: 14.5, fontWeight: 600,
        color: T.inkBright, letterSpacing: -0.1,
      }}>Latency Spike Investigation</div>
      {/* action icons */}
      {[
        <svg key="s" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <polyline points="9,4 12,2 12,5"/>
          <line x1="12" y1="2" x2="7" y2="7"/>
          <path d="M11 8 V11 H3 V4 H6"/>
        </svg>,
        <svg key="w" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="2" y="2" width="10" height="10"/>
          <line x1="2" y1="5" x2="12" y2="5"/>
        </svg>,
        <svg key="f" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="2" y="2" width="10" height="10"/>
        </svg>,
      ].map((icon, i) => (
        <span key={i} style={{
          width: 28, height: 28,
          display: 'grid', placeItems: 'center',
          border: `1px solid ${T.inkFade}`,
          color: T.inkDim, cursor: 'pointer',
        }}>{icon}</span>
      ))}
    </div>
  );
}

// ─── chat content blocks ────────────────────────────────────────

function ChatPara({ children }) {
  const T = useD3T();
  return (
    <p style={{
      margin: 0,
      fontFamily: DSANS, fontSize: 14.5, color: T.ink,
      lineHeight: 1.55, letterSpacing: -0.05,
    }}>{children}</p>
  );
}

function ChatHeading({ children }) {
  const T = useD3T();
  return (
    <div style={{
      fontFamily: DSANS, fontSize: 14.5, fontWeight: 700,
      color: T.inkBright, lineHeight: 1.4, letterSpacing: -0.1,
    }}>{children}</div>
  );
}

function ArtifactCard({ title, body, accent, footer }) {
  const T = useD3T();
  const c = accent || T.cyan;
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      borderLeft: `2px solid ${c}`,
      padding: '12px 14px',
      position: 'relative',
    }}>
      <D3CornerTicks accent={c}/>
      <div style={{
        fontFamily: DSANS, fontSize: 13.5, fontWeight: 700,
        color: T.inkBright, letterSpacing: -0.1, marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontFamily: DSANS, fontSize: 12.5, color: T.inkDim,
        lineHeight: 1.5, letterSpacing: -0.05,
      }}>{body}</div>
      {footer && <div style={{ marginTop: 10 }}>{footer}</div>}
    </div>
  );
}

// P99 latency bar chart card (the small one in chat)
function P99BarsArtifact() {
  const T = useD3T();
  const bars = [
    { t: '12:30', v: 180 },
    { t: '13:00', v: 195 },
    { t: '13:30', v: 220 },
    { t: '14:00', v: 380 },
    { t: '14:15', v: 1200 },
    { t: '14:30', v: 1800 },
    { t: '14:45', v: 2140 },
  ];
  const max = 2200;
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      borderLeft: `2px solid ${T.cyan}`,
      padding: '12px 14px 10px',
      position: 'relative',
    }}>
      <D3CornerTicks accent={T.cyan}/>
      <div style={{
        fontFamily: DSANS, fontSize: 13.5, fontWeight: 700,
        color: T.inkBright, letterSpacing: -0.1, marginBottom: 10,
      }}>P99 Latency (last 2h)</div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingBottom: 4 }}>
        {bars.map((b, i) => {
          const isWarn = b.v >= 1000;
          const c = isWarn ? T.amber : T.cyan;
          const fillc = isWarn ? T.amberSoft : T.cyanSoft;
          const h = Math.max(4, (b.v / max) * 110);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', height: h,
                background: fillc,
                borderTop: `1.5px solid ${c}`,
                borderLeft: `1px solid ${c}`,
                borderRight: `1px solid ${c}`,
                position: 'relative',
              }}>
                {/* small iso-cube top */}
                <div style={{
                  position: 'absolute', top: -5, left: -3, right: -3,
                  height: 5,
                  background: c,
                  opacity: 0.3,
                  clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)',
                }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{
        display: 'flex', gap: 8, marginTop: 4,
        fontFamily: DMONO, fontSize: 9, color: T.inkDim, letterSpacing: 1,
      }}>
        {bars.map((b,i)=>(
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>{b.t}</div>
        ))}
      </div>
    </div>
  );
}

function FeedbackRow() {
  const T = useD3T();
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[
        <svg key="up" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M4 12 L4 6 L7 2 L8 2 L8 6 L11 6 L11 11 L8 12 Z"/>
        </svg>,
        <svg key="dn" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M4 2 L4 8 L7 12 L8 12 L8 8 L11 8 L11 3 L8 2 Z"/>
        </svg>,
      ].map((icon, i) => (
        <span key={i} style={{
          width: 26, height: 26,
          display: 'grid', placeItems: 'center',
          border: `1px solid ${T.inkFade}`,
          color: T.inkDim, cursor: 'pointer',
        }}>{icon}</span>
      ))}
    </div>
  );
}

function CodeBlock({ filename, lines }) {
  const T = useD3T();
  // tone keys: 'cmd' = cyan, 'flag' = ink, 'str' = amber, 'num' = green, 'cmt' = inkFade italic, 'op' = inkDim, 'plain' = ink
  const toneColor = {
    cmd:  T.cyan,
    flag: T.ink,
    str:  T.amber,
    num:  T.green,
    cmt:  T.inkFade,
    op:   T.inkDim,
    plain: T.ink,
  };
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      borderLeft: `2px solid ${T.cyan}`,
      position: 'relative',
    }}>
      <D3CornerTicks accent={T.cyan}/>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: `1px solid ${T.inkGhost}`,
      }}>
        <span style={{
          fontFamily: DMONO, fontSize: 12.5, fontWeight: 700,
          color: T.inkBright, letterSpacing: 0.3,
        }}>{filename}</span>
        <span style={{
          width: 24, height: 24, display: 'grid', placeItems: 'center',
          border: `1px solid ${T.inkFade}`,
          color: T.inkDim, cursor: 'pointer',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="3" y="3" width="6" height="7"/>
            <path d="M3 3 V2 H8 V8"/>
          </svg>
        </span>
      </div>
      <div style={{
        background: T.codeBg,
        padding: '10px 14px',
        fontFamily: DMONO, fontSize: 11.5,
        lineHeight: 1.55,
        overflowX: 'auto',
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre', fontStyle: line[0] && line[0].t === 'cmt' && line.length === 1 ? 'italic' : 'normal' }}>
            {line.length === 0 ? '\u00a0' : line.map((tok, j) => (
              <span key={j} style={{
                color: toneColor[tok.t] || T.ink,
                fontStyle: tok.t === 'cmt' ? 'italic' : 'normal',
              }}>{tok.v}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const APPLY_FIX_LINES = [
  [{t:'cmt', v:'#!/bin/bash'}],
  [{t:'cmt', v:'# Patch payment-service connection pool and restart'}],
  [],
  [{t:'cmd',v:'kubectl'},{t:'plain',v:' patch configmap payment-service-config '},{t:'op',v:'\\'}],
  [{t:'flag',v:'  -n'},{t:'plain',v:' production '},{t:'op',v:'\\'}],
  [{t:'flag',v:'  --type'},{t:'plain',v:' merge '},{t:'op',v:'\\'}],
  [{t:'flag',v:'  -p'},{t:'plain',v:' '},{t:'str',v:'\'{"data":{"POOL_MAX_CONNECTIONS":"150","POOL_ACQUIRE":'},{t:'op',v:'...'}],
  [],
  [{t:'cmd',v:'kubectl'},{t:'plain',v:' rollout restart deployment/payment-service '},{t:'flag',v:'-n'},{t:'plain',v:' production'}],
  [{t:'cmd',v:'kubectl'},{t:'plain',v:' rollout status deployment/payment-service '},{t:'flag',v:'-n'},{t:'plain',v:' production '},{t:'flag',v:'--timeout'},{t:'plain',v:'='},{t:'num',v:'120s'}],
  [],
  [{t:'cmd',v:'echo'},{t:'plain',v:' '},{t:'str',v:'"Done. Monitoring P99 latency for recovery..."'}],
];

function SuggestedAction({ children }) {
  const T = useD3T();
  return (
    <div style={{
      padding: '10px 14px',
      border: `1px solid ${T.inkFade}`,
      background: T.panel,
      color: T.ink,
      fontFamily: DSANS, fontSize: 13, fontWeight: 500,
      letterSpacing: -0.05,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer',
    }}>
      <span>{children}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.cyan} strokeWidth="1.4">
        <polyline points="3,7 7,3 7,11 11,7"/>
        <line x1="3" y1="7" x2="11" y2="7"/>
      </svg>
    </div>
  );
}

function BulletList({ items }) {
  const T = useD3T();
  return (
    <ul style={{
      margin: 0, padding: 0, listStyle: 'none',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {items.map((item, i) => (
        <li key={i} style={{
          display: 'flex', gap: 10,
          fontFamily: DSANS, fontSize: 14, color: T.ink,
          lineHeight: 1.5, letterSpacing: -0.05,
        }}>
          <span style={{
            color: T.cyan, fontFamily: DMONO, fontSize: 12,
            fontWeight: 700, flexShrink: 0, marginTop: 2,
            letterSpacing: 0,
          }}>{String(i + 1).padStart(2, '0')}</span>
          <span style={{ flex: 1 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── chat panel ─────────────────────────────────────────────────

function ChatPanel() {
  const T = useD3T();
  return (
    <div style={{
      width: 500, flexShrink: 0,
      borderRight: `1px solid ${T.inkGhost}`,
      background: T.bg,
      display: 'flex', flexDirection: 'column',
      height: '100vh',
    }}>
      <ChatHeader/>

      {/* scroll area */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <ChatPara>
          An alert has been triggered: P99 latency on the payment service exceeded
          2,000ms for the past 15 minutes. I am starting an investigation.
        </ChatPara>

        <ChatPara>
          I pulled the service metrics and correlated them with recent deployment
          events. Here is what I am seeing:
        </ChatPara>

        <ArtifactCard
          title="Payment service alert — P99 latency breach"
          body="Triggered at 14:32 UTC. P99 latency crossed the 2,000ms threshold on 3 of 4 pods. No recent deploys in the last 6 hours."
          accent={T.amber}
        />

        <P99BarsArtifact/>
        <FeedbackRow/>

        <ChatPara>Based on the timing and pattern, I have two hypotheses:</ChatPara>

        <ChatHeading>Hypothesis 1: Downstream dependency bottleneck</ChatHeading>
        <ChatPara>
          The latency spike correlates with elevated connection wait times to the
          inventory service, which started returning slower responses around 14:20 UTC.
        </ChatPara>
        <ArtifactCard
          title="Inventory service dependency analysis"
          body="Connection pool saturation, response time degradation, and queue depth trends for the inventory service over the last 4 hours."
        />
        <FeedbackRow/>

        <ChatHeading>Hypothesis 2: Connection pool exhaustion</ChatHeading>
        <ChatPara>
          The payment service's outbound connection pool is at 98% utilization.
          Requests are queuing rather than failing fast, which inflates P99 without
          raising error rates. This would explain why error rates look normal while
          latency is spiking.
        </ChatPara>
        <ArtifactCard
          title="Payment service connection pool metrics"
          body="Pool utilization, acquire wait time, and active connection count for the payment service over the last 4 hours."
        />
        <FeedbackRow/>

        <ChatPara>Here are the recommended next steps to confirm and mitigate:</ChatPara>
        <BulletList items={[
          'Check the inventory service connection pool configuration.',
          'Increase the pool max from 50 to 150 to relieve backpressure.',
          'Enable circuit breaker on the payment→inventory call path.',
        ]}/>

        <ChatPara>I have prepared a script to apply the connection pool fix:</ChatPara>
        <CodeBlock filename="apply-fix.sh" lines={APPLY_FIX_LINES}/>
        <FeedbackRow/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <SuggestedAction>Show me the recent logs for the payment service</SuggestedAction>
          <SuggestedAction>Analyze the trace spans for the payment service</SuggestedAction>
        </div>
      </div>

      {/* input bar */}
      <div style={{
        padding: '12px 18px 14px',
        borderTop: `1px solid ${T.inkGhost}`,
        flexShrink: 0,
      }}>
        <div style={{
          position: 'relative',
          background: T.inputBg,
          border: `1px solid ${T.inkGhost}`,
          padding: '12px 14px',
        }}>
          <D3CornerTicks accent={T.cyanDim}/>
          <div style={{
            fontFamily: DSANS, fontSize: 14, color: T.inkDim,
          }}>
            Ask anything. Type <span style={{ fontFamily: DMONO, color: T.cyan, padding: '0 4px', border: `1px solid ${T.cyanDim}` }}>/</span> for actions.
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 8,
          }}>
            <span style={{
              width: 24, height: 24,
              border: `1px solid ${T.inkFade}`,
              display: 'grid', placeItems: 'center',
              color: T.inkDim, fontSize: 16, lineHeight: 1, cursor: 'pointer',
            }}>+</span>
            <span style={{
              width: 28, height: 28,
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
      </div>
    </div>
  );
}

// ─── canvas (right side) ────────────────────────────────────────

function Tab({ icon, label, active, onClose }) {
  const T = useD3T();
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 14px',
      border: `1px solid ${active ? T.cyanDim : T.inkGhost}`,
      background: active ? T.cyanSoft : T.panel,
      color: active ? T.cyan : T.ink,
      fontFamily: DSANS, fontSize: 13, fontWeight: 500,
      cursor: 'pointer',
      maxWidth: 240,
    }}>
      <span style={{ color: active ? T.cyan : T.inkDim, flexShrink: 0, display: 'grid', placeItems: 'center' }}>{icon}</span>
      <span style={{
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{label}</span>
      {onClose && (
        <span style={{
          color: T.inkDim, cursor: 'pointer', flexShrink: 0,
          display: 'grid', placeItems: 'center', width: 14, height: 14,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </span>
      )}
    </div>
  );
}

function TabBar({ mode, setMode }) {
  const T = useD3T();
  const alertIcon = (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="6.5" cy="6.5" r="5"/>
      <line x1="6.5" y1="4" x2="6.5" y2="7"/>
      <circle cx="6.5" cy="9" r="0.4" fill="currentColor"/>
    </svg>
  );
  const docIcon = (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M3 1.5 H8 L10 3.5 V11.5 H3 Z"/>
      <line x1="4.5" y1="5" x2="8.5" y2="5"/>
      <line x1="4.5" y1="7" x2="8.5" y2="7"/>
      <line x1="4.5" y1="9" x2="7" y2="9"/>
    </svg>
  );
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '12px 20px',
      borderBottom: `1px solid ${T.inkGhost}`,
      flexShrink: 0,
    }}>
      <Tab icon={alertIcon} label="Alert: P95 Latency > 2s" active onClose/>
      <Tab icon={docIcon} label="Inventory service depen..."/>
      <Tab icon={docIcon} label="Payment service connec..."/>
      <span style={{
        width: 32, height: 32, display: 'grid', placeItems: 'center',
        border: `1px solid ${T.inkFade}`,
        color: T.inkDim, cursor: 'pointer', fontSize: 14, lineHeight: 1,
      }}>+</span>

      <span style={{ flex: 1 }}/>

      <D3ThemeToggle mode={mode} setMode={setMode}/>

      <span style={{
        width: 32, height: 32, display: 'grid', placeItems: 'center',
        border: `1px solid ${T.inkFade}`,
        color: T.inkDim, cursor: 'pointer',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <line x1="2" y1="4" x2="12" y2="4"/>
          <line x1="2" y1="7" x2="12" y2="7"/>
          <line x1="2" y1="10" x2="12" y2="10"/>
        </svg>
      </span>
    </div>
  );
}

// Line chart for metric: payment-service P99 latency
function P99LineChart() {
  const T = useD3T();
  const pts = [
    { x: 0,   v: 220 },
    { x: 0.5, v: 215 },
    { x: 1,   v: 230 },
    { x: 1.5, v: 240 },
    { x: 2,   v: 280 },
    { x: 2.5, v: 360 },
    { x: 3,   v: 520 },
    { x: 3.5, v: 760 },
    { x: 4,   v: 1100 },
    { x: 4.5, v: 1500 },
    { x: 5,   v: 1900 },
    { x: 5.5, v: 2050 },
    { x: 6,   v: 2200 },
  ];
  const W = 760, H = 240;
  const PADL = 50, PADR = 18, PADT = 8, PADB = 30;
  const innerW = W - PADL - PADR;
  const innerH = H - PADT - PADB;
  const maxV = 2400, minV = 0;
  const sx = (x) => PADL + (x / 6) * innerW;
  const sy = (v) => PADT + (1 - (v - minV) / (maxV - minV)) * innerH;
  const linePts = pts.map(p => `${sx(p.x)},${sy(p.v)}`).join(' ');
  const fillPts = `${sx(0)},${PADT + innerH} ${linePts} ${sx(6)},${PADT + innerH}`;
  const yLabels = [200, 600, 1000, 1400, 1800, 2200];
  const xLabels = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
  const thresholdY = sy(2000);

  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      padding: '16px 20px',
      position: 'relative',
      marginBottom: 14,
    }}>
      <D3CornerTicks/>
      <div style={{
        fontFamily: DSANS, fontSize: 14, fontWeight: 600,
        color: T.inkBright, marginBottom: 8, letterSpacing: -0.1,
      }}>Metric: payment-service P99 latency</div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {/* y grid lines */}
        {yLabels.map(v => {
          const y = sy(v);
          return (
            <g key={v}>
              <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke={T.inkGhost} strokeWidth="0.6" strokeDasharray="2 3"/>
              <text x={PADL - 6} y={y + 3} fontFamily={DMONO} fontSize="10" fill={T.inkDim} textAnchor="end" letterSpacing="0.3">{v}ms</text>
            </g>
          );
        })}
        {/* x tick labels */}
        {xLabels.map(x => (
          <text key={x} x={sx(x)} y={H - 10} fontFamily={DMONO} fontSize="10" fill={T.inkDim} textAnchor="middle">{x}</text>
        ))}
        {/* baseline x axis */}
        <line x1={PADL} y1={PADT + innerH} x2={W - PADR} y2={PADT + innerH} stroke={T.inkFade} strokeWidth="0.8"/>

        {/* threshold line */}
        <line x1={PADL} y1={thresholdY} x2={W - PADR} y2={thresholdY} stroke={T.red} strokeWidth="1.2" strokeDasharray="6 4"/>

        {/* filled area */}
        <polygon points={fillPts} fill={T.cyanSoft}/>
        {/* line */}
        <polyline points={linePts} fill="none" stroke={T.cyan} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
        {/* points */}
        {pts.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.v)} r="3"
            fill={T.bg} stroke={T.cyan} strokeWidth="1.4"/>
        ))}
      </svg>
    </div>
  );
}

function AlarmBanner() {
  const T = useD3T();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: T.amberSoft,
      border: `1px solid ${T.amberDim}`,
      borderLeft: `2px solid ${T.amber}`,
      padding: '12px 16px',
      marginBottom: 18,
      position: 'relative',
    }}>
      <D3CornerTicks accent={T.amber}/>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={T.amber} strokeWidth="1.4">
        <path d="M9 2 L16 14 H2 Z"/>
        <line x1="9" y1="7" x2="9" y2="11"/>
        <circle cx="9" cy="13" r="0.6" fill={T.amber}/>
      </svg>
      <span style={{
        fontFamily: DSANS, fontSize: 13.5, color: T.ink, lineHeight: 1.4, letterSpacing: -0.05,
      }}>
        <span style={{ fontWeight: 600, color: T.inkBright }}>Alarm triggered</span> at May 13, 02:32 PM UTC — payment-service P99 crossed 2,000ms threshold
      </span>
    </div>
  );
}

function CanvasContent() {
  const T = useD3T();
  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      padding: '22px 32px',
    }}>
      {/* title row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
      }}>
        <h1 style={{
          margin: 0, flex: 1,
          fontFamily: DSANS, fontSize: 22, fontWeight: 600,
          color: T.inkBright, letterSpacing: -0.4,
        }}>Alert: P95 Latency &gt; 2s</h1>
        <span style={{
          width: 32, height: 32,
          border: `1px solid ${T.inkFade}`,
          display: 'grid', placeItems: 'center',
          color: T.inkDim, cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
            <line x1="2" y1="4" x2="9" y2="4"/>
            <line x1="11" y1="4" x2="12" y2="4"/>
            <circle cx="10" cy="4" r="1.2"/>
            <line x1="2" y1="10" x2="5" y2="10"/>
            <line x1="7" y1="10" x2="12" y2="10"/>
            <circle cx="6" cy="10" r="1.2"/>
          </svg>
        </span>
      </div>

      <P99LineChart/>
      <AlarmBanner/>

      {/* Summary */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: DMONO, fontSize: 10.5, letterSpacing: 1.8,
          color: T.cyan, fontWeight: 700, marginBottom: 8,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>// SUMMARY</span>
          <span style={{ flex: 1, borderTop: `1px dashed ${T.inkGhost}` }}/>
        </div>
        <div style={{
          fontFamily: DSANS, fontSize: 14, color: T.ink, lineHeight: 1.55, letterSpacing: -0.05,
        }}>
          payment-service P99 latency on production cluster
        </div>
      </div>

      {/* Recommendation */}
      <div>
        <div style={{
          fontFamily: DMONO, fontSize: 10.5, letterSpacing: 1.8,
          color: T.cyan, fontWeight: 700, marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>// RECOMMENDATION</span>
          <span style={{ flex: 1, borderTop: `1px dashed ${T.inkGhost}` }}/>
        </div>
        <BulletList items={[
          'Check recent deployments to the affected service for regressions.',
          'Review upstream dependency health and connection pool metrics.',
          'Inspect application logs for error patterns correlated with the latency increase.',
          'Consider scaling the service if the issue is load-related.',
          'If this is a known issue, acknowledge the alert and update the runbook.',
        ]}/>
      </div>
    </div>
  );
}

function CanvasPanel({ mode, setMode }) {
  const T = useD3T();
  return (
    <div style={{
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      background: T.bg,
    }}>
      <TabBar mode={mode} setMode={setMode}/>
      <CanvasContent/>
    </div>
  );
}

// ─── dashboard page ─────────────────────────────────────────────

function Dashboard() {
  const [mode, setMode] = React.useState('dark');
  const T = D3_THEMES[mode];
  React.useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);
  return (
    <D3ThemeContext.Provider value={T}>
      <D3PageBackground marks={false}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <LeftRail/>
          <ChatPanel/>
          <CanvasPanel mode={mode} setMode={setMode}/>
        </div>
      </D3PageBackground>
    </D3ThemeContext.Provider>
  );
}

Object.assign(window, { DashboardD3: Dashboard });
