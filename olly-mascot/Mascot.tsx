/**
 * Mascot — comma-eye character for OpenSearch.
 *
 * Drop-in React component. Self-contained: no external deps beyond React.
 * Eye geometry is in a single shared 80×80 SVG viewBox.
 *
 * Quick start:
 *   <Mascot size={120} expression="happy" />
 *
 * Idle behavior: when `idle` is true (default) and no `expression` override is
 * provided, the mascot cycles through a weighted rotation of micro-expressions,
 * returning to the resting `comma` between pulses. Blinks dominate (~40%).
 *
 * Eye scaling: as the body shrinks below 200px, eyes grow proportionally so
 * the current expression remains legible. At ≤32px, eyes are 1.65× scale.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export type MascotExpression =
  | "comma"   // resting state — comma eyes (matches OpenSearch S silhouette)
  | "blink"   // _ _
  | "happy"   // ^ ^
  | "dot"     // . . — alert
  | "squint"  // > <
  | "wow"     // 0 0 — tall pill
  | "wink"    // , _
  | "heart"   // <3 <3 — pixel-art love
  | "xx";     // x x — sleep / unreachable

export interface MascotProps {
  /** Rendered pixel size. The mascot is square. Default 240. */
  size?: number;
  /** Force a specific expression. Omit (or pass undefined) for idle cycling. */
  expression?: MascotExpression;
  /**
   * Body gradient as a [top, bottom] hex pair, OR a single color string.
   * Default: ["#14558E", "#153A5A"] (OpenSearch navy).
   */
  color?: [string, string] | string;
  /** Eye fill color. Default "#fff". Use a dark value for light bodies. */
  eyeColor?: string;
  /** Eyes track the cursor with a small offset. Default true. */
  follow?: boolean;
  /** Auto-cycle through micro-expressions when no explicit `expression`. Default true. */
  idle?: boolean;
  /** Gentle vertical bob animation. Default false. */
  bob?: boolean;
  /** Optional click handler. Cursor becomes pointer when set. */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Optional extra className on the wrapper. */
  className?: string;
  /** Optional inline style on the wrapper (merged with size). */
  style?: React.CSSProperties;
}

// ── Eye geometry ────────────────────────────────────────────────────────────
// All paths live in an 80×80 viewBox. Left-eye head ≈ (39, 31); right-eye head ≈ (57, 31).

const EYE_GEOMETRY: Record<MascotExpression, { left: string; right: string }> = {
  // Curvy comma — bulb at top, tail curling down-left. Matches OpenSearch S shape.
  comma: {
    left:  "M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z",
    right: "M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z",
  },
  blink:  { left: "M36.9 30.5H41.1V33.0H36.9V30.5Z", right: "M54.9 30.5H59.1V33.0H54.9V30.5Z" },
  happy:  { left: "M36.4 33L39.0 28.5L41.6 33L40.4 33L39.0 30.6L37.6 33Z", right: "M54.4 33L57.0 28.5L59.6 33L58.4 33L57.0 30.6L55.6 33Z" },
  dot:    { left: "M37.7 30.3H40.3V32.9H37.7V30.3Z", right: "M55.7 30.3H58.3V32.9H55.7V30.3Z" },
  squint: { left: "M36.6 28L41.4 31L36.6 34L36.6 32.5L39.3 31L36.6 29.5Z", right: "M59.4 28L54.6 31L59.4 34L59.4 32.5L56.7 31L59.4 29.5Z" },
  // Tall pill "0 0" — matches comma height, straight sides.
  wow: {
    left:  "M 38 26 A 1 1 0 0 1 40 26 L 40 36 A 1 1 0 0 1 38 36 Z",
    right: "M 56 26 A 1 1 0 0 1 58 26 L 58 36 A 1 1 0 0 1 56 36 Z",
  },
  // Wink — curvy comma on the left, slash on the right.
  wink: {
    left:  "M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z",
    right: "M54.9 30.5H59.1V33.0H54.9V30.5Z",
  },
  // Pixel-art heart — 7×6 grid of 1-unit squares per eye.
  heart: {
    left:  "M36.5 28h1v1h-1zM37.5 28h1v1h-1zM39.5 28h1v1h-1zM40.5 28h1v1h-1zM35.5 29h1v1h-1zM36.5 29h1v1h-1zM37.5 29h1v1h-1zM38.5 29h1v1h-1zM39.5 29h1v1h-1zM40.5 29h1v1h-1zM41.5 29h1v1h-1zM35.5 30h1v1h-1zM36.5 30h1v1h-1zM37.5 30h1v1h-1zM38.5 30h1v1h-1zM39.5 30h1v1h-1zM40.5 30h1v1h-1zM41.5 30h1v1h-1zM36.5 31h1v1h-1zM37.5 31h1v1h-1zM38.5 31h1v1h-1zM39.5 31h1v1h-1zM40.5 31h1v1h-1zM37.5 32h1v1h-1zM38.5 32h1v1h-1zM39.5 32h1v1h-1zM38.5 33h1v1h-1z",
    right: "M54.5 28h1v1h-1zM55.5 28h1v1h-1zM57.5 28h1v1h-1zM58.5 28h1v1h-1zM53.5 29h1v1h-1zM54.5 29h1v1h-1zM55.5 29h1v1h-1zM56.5 29h1v1h-1zM57.5 29h1v1h-1zM58.5 29h1v1h-1zM59.5 29h1v1h-1zM53.5 30h1v1h-1zM54.5 30h1v1h-1zM55.5 30h1v1h-1zM56.5 30h1v1h-1zM57.5 30h1v1h-1zM58.5 30h1v1h-1zM59.5 30h1v1h-1zM54.5 31h1v1h-1zM55.5 31h1v1h-1zM56.5 31h1v1h-1zM57.5 31h1v1h-1zM58.5 31h1v1h-1zM55.5 32h1v1h-1zM56.5 32h1v1h-1zM57.5 32h1v1h-1zM56.5 33h1v1h-1z",
  },
  // x x — sleep / dead / unreachable. Two crossed bars per eye.
  xx: {
    left:  "M36.7 28.5L37.7 27.5L41.3 33.5L40.3 34.5ZM40.3 27.5L41.3 28.5L37.7 34.5L36.7 33.5Z",
    right: "M54.7 28.5L55.7 27.5L59.3 33.5L58.3 34.5ZM58.3 27.5L59.3 28.5L55.7 34.5L54.7 33.5Z",
  },
};

// Idle-cycle pool: which expressions the mascot drifts through and how long it
// holds each. Weights are relative — blink dominates.
const IDLE_POOL: { id: MascotExpression; weight: number; hold: number }[] = [
  { id: "blink",  weight: 4, hold: 130 },
  { id: "dot",    weight: 2, hold: 320 },
  { id: "squint", weight: 1, hold: 380 },
  { id: "happy",  weight: 1, hold: 420 },
  { id: "wow",    weight: 1, hold: 360 },
  { id: "wink",   weight: 1, hold: 380 },
];
const IDLE_TOTAL_WEIGHT = IDLE_POOL.reduce((s, p) => s + p.weight, 0);

// ── Keyframes injection (one-time) ──────────────────────────────────────────
const STYLE_ID = "__mascot_keyframes__";
function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
@keyframes __mascot_eye_pop__ {
  0%   { transform: scaleY(0.2); opacity: 0.4; }
  100% { transform: scaleY(1);   opacity: 1; }
}
@keyframes __mascot_bob__ {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
`;
  document.head.appendChild(el);
}

// ── Component ───────────────────────────────────────────────────────────────

export const Mascot: React.FC<MascotProps> = ({
  size = 240,
  expression,
  color = ["#14558E", "#153A5A"],
  eyeColor = "#fff",
  follow = true,
  idle = true,
  bob = false,
  onClick,
  className,
  style,
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [autoState, setAutoState] = useState<MascotExpression | null>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  // Inject keyframes once.
  useEffect(() => { ensureKeyframes(); }, []);

  // Idle loop — only runs if `idle` and no explicit `expression` override.
  useEffect(() => {
    if (!idle || expression) { setAutoState(null); return; }
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const pick = () => {
      let r = Math.random() * IDLE_TOTAL_WEIGHT;
      for (const p of IDLE_POOL) if ((r -= p.weight) <= 0) return p;
      return IDLE_POOL[0];
    };
    const tick = () => {
      if (!alive) return;
      const p = pick();
      setAutoState(p.id);
      const double = p.id === "blink" && Math.random() < 0.18;
      setTimeout(() => {
        if (!alive) return;
        setAutoState(null);
        if (double) {
          setTimeout(() => {
            if (!alive) return;
            setAutoState("blink");
            setTimeout(() => { if (alive) setAutoState(null); }, 120);
          }, 150);
        }
      }, p.hold);
      const rest = (p.id === "blink" ? 2400 : 3200) + Math.random() * 2600;
      timer = setTimeout(tick, rest);
    };
    timer = setTimeout(tick, 1600);
    return () => { alive = false; clearTimeout(timer); };
  }, [idle, expression]);

  // Cursor tracking.
  useEffect(() => {
    if (!follow) { setPupilOffset({ x: 0, y: 0 }); return; }
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const maxOff = 1.2;
      const k = Math.min(len / 220, 1);
      setPupilOffset({ x: (dx / len) * maxOff * k, y: (dy / len) * maxOff * k });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [follow]);

  const active: MascotExpression = expression ?? autoState ?? "comma";
  const geom = EYE_GEOMETRY[active] || EYE_GEOMETRY.comma;

  // Eye scaling so the expression stays readable at small sizes.
  const eyeScale = (() => {
    if (size >= 200) return 1.0;
    if (size <= 32)  return 1.65;
    const t = (200 - size) / (200 - 32);
    return 1.0 + t * 0.65;
  })();
  const EYE_CX = 48, EYE_CY = 31;

  // Resolve color → [from, to] gradient.
  const palette: [string, string] = Array.isArray(color)
    ? [color[0], color[1] ?? color[0]]
    : [color, color];

  // Unique gradient id (per instance) so multiple mascots on a page don't collide.
  const gid = useMemo(() => `__mascot_g_${Math.random().toString(36).slice(2, 9)}`, []);

  const wrapStyle: React.CSSProperties = {
    position: "relative",
    width: size,
    height: size,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: onClick ? "pointer" : undefined,
    animation: bob ? "__mascot_bob__ 4.2s ease-in-out infinite" : undefined,
    ...style,
  };

  return (
    <div
      ref={wrapRef}
      className={className}
      style={wrapStyle}
      onClick={onClick}
      aria-label={`mascot · ${active}`}
      role="img"
    >
      <svg viewBox="0 0 80 80" width={size} height={size} style={{ display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="40" y1="80" x2="40" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor={palette[1]} />
            <stop offset="1" stopColor={palette[0]} />
          </linearGradient>
          <radialGradient id={`${gid}_hl`} cx="0.3" cy="0.25" r="0.6">
            <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="39.5" fill={`url(#${gid})`} />
        <ellipse cx="28" cy="22" rx="22" ry="14" fill={`url(#${gid}_hl)`} />
        <g
          transform={`translate(${EYE_CX}, ${EYE_CY}) scale(${eyeScale}) translate(${-EYE_CX + pupilOffset.x / eyeScale}, ${-EYE_CY + pupilOffset.y / eyeScale})`}
        >
          <path key={`l-${active}`} d={geom.left}  fill={eyeColor} style={{ animation: "__mascot_eye_pop__ 160ms ease-out", transformOrigin: "center" }} />
          <path key={`r-${active}`} d={geom.right} fill={eyeColor} style={{ animation: "__mascot_eye_pop__ 160ms ease-out", transformOrigin: "center" }} />
        </g>
      </svg>
    </div>
  );
};

export default Mascot;

// ── Optional preset palettes ────────────────────────────────────────────────
export const MASCOT_PALETTES: Record<string, { body: [string, string]; eye: string }> = {
  navy:   { body: ["#14558E", "#153A5A"], eye: "#FFFFFF" },
  purple: { body: ["#6C4BD9", "#341E73"], eye: "#FFFFFF" },
  green:  { body: ["#2F8A5F", "#15402C"], eye: "#FFFFFF" },
  white:  { body: ["#FFFFFF", "#D9DEE5"], eye: "#15171C" },
  black:  { body: ["#1A1D24", "#000000"], eye: "#FFFFFF" },
};
