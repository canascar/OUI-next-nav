/**
 * OpenSearchMascot — a React component for the comma-eye mascot in navy.
 *
 * Drop this file into your project and import:
 *
 *   import OpenSearchMascot from "./OpenSearchMascot.jsx";
 *
 *   <OpenSearchMascot size={120} />
 *   <OpenSearchMascot expression="happy" />
 *   <OpenSearchMascot follow idle bob onClick={() => alert("hi")} />
 *
 * Props
 * ─────
 *   size        number   — px width/height of the rendered SVG. Default 240.
 *   expression  string   — force a specific expression. One of:
 *                          "comma" (default), "blink", "happy", "dot", "squint",
 *                          "wow", "wink", "heart", "xx". If omitted and `idle`
 *                          is true, the component drifts through expressions.
 *   follow      bool     — eyes track the cursor (small offset). Default true.
 *   idle        bool     — auto-cycle micro-expressions when no explicit
 *                          `expression` is set. Default true.
 *   bob         bool     — gentle vertical breathing animation. Default true.
 *   onClick     fn       — click handler. The cursor switches to pointer when set.
 *   className   string   — extra class on the outer wrapper.
 *   style       object   — extra style on the outer wrapper.
 *
 * Self-contained: pure React + inline <style>. No external CSS, fonts, or assets.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';

// ── Eye geometry ────────────────────────────────────────────────────────────
// All paths are drawn against an 80×80 viewbox.
// Left-eye head ≈ (39, 31), right-eye head ≈ (57, 31). Keep these centers
// stable across expressions so transitions look anchored.
const EYE_GEOMETRY = {
  // Default — the OpenSearch comma, traced from the wordmark's S silhouette.
  // Source: a 23×44 path, scaled ×0.2727 and translated into each eye slot.
  comma: {
    left:
      'M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z',
    right:
      'M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z',
  },
  // Horizontal slash — blink.
  blink: {
    left: 'M36.9 30.5H41.1V33.0H36.9V30.5Z',
    right: 'M54.9 30.5H59.1V33.0H54.9V30.5Z',
  },
  // ^ ^ — happy chevrons.
  happy: {
    left: 'M36.4 33L39.0 28.5L41.6 33L40.4 33L39.0 30.6L37.6 33Z',
    right: 'M54.4 33L57.0 28.5L59.6 33L58.4 33L57.0 30.6L55.6 33Z',
  },
  // . . — alert dots.
  dot: {
    left: 'M37.7 30.3H40.3V32.9H37.7V30.3Z',
    right: 'M55.7 30.3H58.3V32.9H55.7V30.3Z',
  },
  // > <  — squint.
  squint: {
    left: 'M36.6 28L41.4 31L36.6 34L36.6 32.5L39.3 31L36.6 29.5Z',
    right: 'M59.4 28L54.6 31L59.4 34L59.4 32.5L56.7 31L59.4 29.5Z',
  },
  // O O — wow.
  wow: {
    left:
      'M37.4 29.4Q39 27.8 40.6 29.4Q42.2 31 40.6 32.6Q39 34.2 37.4 32.6Q35.8 31 37.4 29.4Z',
    right:
      'M55.4 29.4Q57 27.8 58.6 29.4Q60.2 31 58.6 32.6Q57 34.2 55.4 32.6Q53.8 31 55.4 29.4Z',
  },
  // , _ — wink: left comma, right slash.
  wink: {
    left:
      'M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z',
    right: 'M54.9 30.5H59.1V33.0H54.9V30.5Z',
  },
  // <3 <3 — pixel-art hearts (7×6 grid).
  heart: {
    left:
      'M37.200 28.840h0.720v0.720h-0.720zM37.920 28.840h0.720v0.720h-0.720zM39.360 28.840h0.720v0.720h-0.720zM40.080 28.840h0.720v0.720h-0.720zM36.480 29.560h0.720v0.720h-0.720zM37.200 29.560h0.720v0.720h-0.720zM37.920 29.560h0.720v0.720h-0.720zM38.640 29.560h0.720v0.720h-0.720zM39.360 29.560h0.720v0.720h-0.720zM40.080 29.560h0.720v0.720h-0.720zM40.800 29.560h0.720v0.720h-0.720zM36.480 30.280h0.720v0.720h-0.720zM37.200 30.280h0.720v0.720h-0.720zM37.920 30.280h0.720v0.720h-0.720zM38.640 30.280h0.720v0.720h-0.720zM39.360 30.280h0.720v0.720h-0.720zM40.080 30.280h0.720v0.720h-0.720zM40.800 30.280h0.720v0.720h-0.720zM37.200 31.000h0.720v0.720h-0.720zM37.920 31.000h0.720v0.720h-0.720zM38.640 31.000h0.720v0.720h-0.720zM39.360 31.000h0.720v0.720h-0.720zM40.080 31.000h0.720v0.720h-0.720zM37.920 31.720h0.720v0.720h-0.720zM38.640 31.720h0.720v0.720h-0.720zM39.360 31.720h0.720v0.720h-0.720zM38.640 32.440h0.720v0.720h-0.720z',
    right:
      'M55.200 28.840h0.720v0.720h-0.720zM55.920 28.840h0.720v0.720h-0.720zM57.360 28.840h0.720v0.720h-0.720zM58.080 28.840h0.720v0.720h-0.720zM54.480 29.560h0.720v0.720h-0.720zM55.200 29.560h0.720v0.720h-0.720zM55.920 29.560h0.720v0.720h-0.720zM56.640 29.560h0.720v0.720h-0.720zM57.360 29.560h0.720v0.720h-0.720zM58.080 29.560h0.720v0.720h-0.720zM58.800 29.560h0.720v0.720h-0.720zM54.480 30.280h0.720v0.720h-0.720zM55.200 30.280h0.720v0.720h-0.720zM55.920 30.280h0.720v0.720h-0.720zM56.640 30.280h0.720v0.720h-0.720zM57.360 30.280h0.720v0.720h-0.720zM58.080 30.280h0.720v0.720h-0.720zM58.800 30.280h0.720v0.720h-0.720zM55.200 31.000h0.720v0.720h-0.720zM55.920 31.000h0.720v0.720h-0.720zM56.640 31.000h0.720v0.720h-0.720zM57.360 31.000h0.720v0.720h-0.720zM58.080 31.000h0.720v0.720h-0.720zM55.920 31.720h0.720v0.720h-0.720zM56.640 31.720h0.720v0.720h-0.720zM57.360 31.720h0.720v0.720h-0.720zM56.640 32.440h0.720v0.720h-0.720z',
  },
  // x x — sleep / dead.
  xx: {
    left:
      'M36.7 28.5L37.7 27.5L41.3 33.5L40.3 34.5ZM40.3 27.5L41.3 28.5L37.7 34.5L36.7 33.5Z',
    right:
      'M54.7 28.5L55.7 27.5L59.3 33.5L58.3 34.5ZM58.3 27.5L59.3 28.5L55.7 34.5L54.7 33.5Z',
  },
};

// Valid expression keys for the public API.
export const EXPRESSIONS = Object.keys(EYE_GEOMETRY);

// Navy palette — matches the OpenSearch wordmark gradient.
const NAVY_FROM = '#14558E'; // top of gradient
const NAVY_TO = '#153A5A'; // bottom of gradient

// One-shot inline stylesheet — kept tiny and namespaced under .osmascot-*.
// Injected once on first mount.
let STYLES_INJECTED = false;
function ensureStyles() {
  if (STYLES_INJECTED || typeof document === 'undefined') return;
  STYLES_INJECTED = true;
  const css = `
    .osmascot-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    .osmascot-svg {
      display: block;
      filter: drop-shadow(0 18px 28px rgba(20, 58, 90, 0.16));
    }
    .osmascot-bob { animation: osmascot-bob 4.2s ease-in-out infinite; }
    @keyframes osmascot-bob {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    .osmascot-eye {
      animation: osmascot-eye-pop 160ms ease-out;
      transform-origin: center;
    }
    @keyframes osmascot-eye-pop {
      0%   { transform: scaleY(0.2); opacity: 0.4; }
      100% { transform: scaleY(1);   opacity: 1; }
    }
  `;
  const tag = document.createElement('style');
  tag.setAttribute('data-osmascot', '');
  tag.textContent = css;
  document.head.appendChild(tag);
}

export default function OpenSearchMascot({
  size = 240,
  expression,
  follow = true,
  idle = true,
  bob = true,
  onClick,
  className = '',
  style,
}) {
  ensureStyles();

  const wrapRef = useRef(null);
  const [autoState, setAutoState] = useState(null); // current auto-driven expression
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  // Unique gradient id per instance so multiple mascots on a page don't collide.
  const gradId = useMemo(
    () => `osm_g_${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  // ── Idle loop ─────────────────────────────────────────────────────────────
  // Only runs when caller hasn't pinned an expression and `idle` is on.
  // Weighted rotation of micro-expressions, returning to `comma` between pulses.
  useEffect(() => {
    if (!idle || expression) {
      setAutoState(null);
      return;
    }
    let alive = true;
    const POOL = [
      { id: 'blink', weight: 4, hold: 130 },
      { id: 'dot', weight: 2, hold: 320 },
      { id: 'squint', weight: 1, hold: 380 },
      { id: 'happy', weight: 1, hold: 420 },
      { id: 'wow', weight: 1, hold: 360 },
      { id: 'wink', weight: 1, hold: 380 },
    ];
    const total = POOL.reduce((s, p) => s + p.weight, 0);
    const pick = () => {
      let r = Math.random() * total;
      for (const p of POOL) if ((r -= p.weight) <= 0) return p;
      return POOL[0];
    };
    let timer;
    const tick = () => {
      if (!alive) return;
      const p = pick();
      const double = p.id === 'blink' && Math.random() < 0.18;
      setAutoState(p.id);
      setTimeout(() => {
        if (!alive) return;
        setAutoState(null);
        if (double) {
          setTimeout(() => {
            if (!alive) return;
            setAutoState('blink');
            setTimeout(() => alive && setAutoState(null), 120);
          }, 150);
        }
      }, p.hold);
      const rest = (p.id === 'blink' ? 2400 : 3200) + Math.random() * 2600;
      timer = setTimeout(tick, rest);
    };
    timer = setTimeout(tick, 1600);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [idle, expression]);

  // ── Eye-tracking ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!follow) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }
    const onMove = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const maxOff = 1.2; // in viewbox units
      const k = Math.min(len / 220, 1);
      setPupilOffset({
        x: (dx / len) * maxOff * k,
        y: (dy / len) * maxOff * k,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [follow]);

  const active = expression || autoState || 'comma';
  const geom = EYE_GEOMETRY[active] || EYE_GEOMETRY.comma;

  return (
    <div
      ref={wrapRef}
      className={`osmascot-wrap${bob ? ' osmascot-bob' : ''}${
        className ? ` ${className}` : ''
      }`}
      style={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}>
      <svg
        viewBox="0 0 80 80"
        width={size}
        height={size}
        className="osmascot-svg"
        aria-hidden="true">
        <defs>
          <linearGradient
            id={gradId}
            x1="40"
            y1="80"
            x2="40"
            y2="0"
            gradientUnits="userSpaceOnUse">
            <stop stopColor={NAVY_TO} />
            <stop offset="1" stopColor={NAVY_FROM} />
          </linearGradient>
          <radialGradient id={`${gradId}_hl`} cx="0.3" cy="0.25" r="0.6">
            <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Body */}
        <circle cx="40" cy="40" r="39.5" fill={`url(#${gradId})`} />
        {/* Top-left highlight for dimensionality */}
        <ellipse cx="28" cy="22" rx="22" ry="14" fill={`url(#${gradId}_hl)`} />

        {/* Eyes (translated by cursor offset; re-mounted on shape change to retrigger pop animation) */}
        <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
          <path
            key={`l-${active}`}
            className="osmascot-eye"
            d={geom.left}
            fill="#fff"
          />
          <path
            key={`r-${active}`}
            className="osmascot-eye"
            d={geom.right}
            fill="#fff"
          />
        </g>
      </svg>
    </div>
  );
}
