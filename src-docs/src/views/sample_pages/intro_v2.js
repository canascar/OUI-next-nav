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

/*
 * Intro screen — V2.
 *
 * Independent version of the MCP home intro backdrop. Renders the SAME
 * full-bleed slot as V1 (behind the greeting) but owns its OWN animation, so
 * editing this file changes ONLY V2. Lazy-loaded; hard-remounted on refresh /
 * version switch to replay.
 *
 * V2 animation: an ABSTRACT graph field — several full-bleed line-chart series
 * that draw in left→right with soft area fills, then hold. Their ongoing motion
 * FOLLOWS THE MOUSE X: moving the cursor left/right rolls a travelling wave
 * through the lines (no cursor motion → the lines rest still). Edges fade to
 * the page background (like V1). Replace freely.
 */

import React, { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../../components/with_theme';

// Two-phase intro: first the lines DRAW in, then their area-fill gradients
// FADE in beneath them.
const DRAW_MS = 2400; // lines draw across
const FILL_MS = 1100; // gradients fade in after the lines land

// A continuous, deterministic time-series value (0..1, higher = toward the top)
// as a function of position along an INFINITE timeline `u`, using a per-line
// config `cfg`. Sampling at u = screenPosition + scroll (and advancing scroll)
// makes the chart PAN — new data enters one edge, old leaves the other.
//
// Each line gets its OWN frequencies, amplitudes, phase and baseline (not just
// a shared shape shifted sideways), so every series has DISTINCT apexes — peaks
// at different positions and heights — reading as genuinely different data.
const valueAt = (u, cfg) => {
  const v =
    cfg.base +
    Math.sin(u * cfg.f1 + cfg.p) * cfg.a1 +
    Math.sin(u * cfg.f2 + cfg.p * 1.7) * cfg.a2 +
    Math.sin(u * cfg.f3 - cfg.p) * cfg.a3;
  // SOFT clamp (tanh) instead of a hard min/max — a value that overshoots the
  // bounds rounds off smoothly toward the edge rather than clipping to a FLAT
  // line, so peaks/valleys always read as rounded apexes, never flattened.
  const lo = 0.05;
  const hi = 0.95;
  const mid = (lo + hi) / 2;
  const halfRange = (hi - lo) / 2;
  return mid + halfRange * Math.tanh((v - mid) / halfRange);
};

// Generate a fresh, randomized per-line curve config. Called once per line at
// mount, so EVERY refresh (which hard-remounts this component) produces new
// line variations — different apexes, frequencies and baselines each time.
// Amplitudes are kept so base ± (a1+a2+a3) stays comfortably within [0,1], so
// the curve rarely even reaches the soft clamp — no flattened apexes.
const rand = (min, max) => min + Math.random() * (max - min);
const makeLineCfg = () => {
  const base = rand(0.42, 0.58); // vertical resting level, kept near centre
  // Total headroom on the tighter side of centre, so peaks/valleys stay inside
  // the bounds and never flatten. Split it across the three components.
  const headroom = Math.min(base, 1 - base) - 0.08; // margin from the edges
  const a1 = headroom * rand(0.5, 0.62);
  const a2 = headroom * rand(0.18, 0.26);
  const a3 = headroom * rand(0.14, 0.22);
  return {
    base,
    f1: rand(2.8, 6.4), // primary frequency (big peaks)
    a1,
    f2: rand(7.0, 12.8), // secondary detail
    a2,
    f3: rand(1.2, 3.4), // slow undulation
    a3,
    p: rand(0, Math.PI * 2), // phase — shifts where the apexes land
  };
};

const IntroV2 = ({ skipIntro = false } = {}) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const vignetteRef = useRef(null);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  // Fade to the ACTUAL page background (walk up the DOM to the first ancestor
  // with a real background color), so the edge vignette dissolves seamlessly.
  useEffect(() => {
    const root = rootRef.current;
    const vig = vignetteRef.current;
    if (!root || !vig) return;
    let el = root.parentElement;
    let pageBg = null;
    while (el) {
      const c = getComputedStyle(el).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
        pageBg = c;
        break;
      }
      el = el.parentElement;
    }
    if (!pageBg) pageBg = isDark ? 'rgb(11, 9, 18)' : 'rgb(230, 224, 245)';
    const m = pageBg.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    const rgb = m ? `${m[1]}, ${m[2]}, ${m[3]}` : isDark ? '11, 9, 18' : '230, 224, 245';
    root.style.backgroundColor = pageBg;
    // Directional edge fades (top/bottom/left/right) reaching solid page bg at
    // each edge, over a tighter central radial — so all four edges dissolve
    // into the bg instead of showing the lines hard at the frame.
    const c0 = `rgba(${rgb}, 0)`;
    const c1 = `rgba(${rgb}, 1)`;
    vig.style.background = [
      `linear-gradient(to top, ${c1} 0%, ${c0} 22%)`,
      `linear-gradient(to bottom, ${c1} 0%, ${c0} 22%)`,
      `linear-gradient(to left, ${c1} 0%, ${c0} 18%)`,
      `linear-gradient(to right, ${c1} 0%, ${c0} 18%)`,
      `radial-gradient(78% 82% at 50% 48%, ${c0} 30%, rgba(${rgb}, 0.5) 60%, rgba(${rgb}, 0.9) 84%, ${c1} 100%)`,
    ].join(', ');
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // `reduce` = prefers-reduced-motion ONLY (fully frozen single frame).
    // `skipIntro` (a RETURN) is different: we skip the DRAW-IN intro but keep
    // the loop + mouse interaction live so the timeline still pans. It's
    // handled by starting the clock past the intro (see `start` below), not by
    // disabling the loop.
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lines = isDark
      ? [
          // Blue-dominant (low red) so it reads blue, not purple. One indigo
          // anchor (#4f46e5), then blue-500/400 up to light sky blue.
          '79, 70, 229', // indigo anchor #4f46e5
          '59, 130, 246', // blue-500 #3b82f6
          '79, 124, 240', // blue
          '96, 165, 250', // blue-400 #60a5fa
          '147, 197, 253', // light sky blue #93c5fd
        ]
      : [
          '110, 86, 207',
          '79, 111, 214',
          '124, 92, 255',
          '150, 120, 240',
          '96, 120, 220',
        ];

    const series = lines.map((rgb, i) => ({
      rgb,
      // Fresh random curve each mount → new line variations on every refresh.
      cfg: makeLineCfg(),
      // Per-line pan rate → parallax between layers as the timeline scrolls.
      // Wider spread so the layers separate more noticeably (front lines pan
      // well ahead of the back ones).
      parallax: 0.55 + i * 0.34,
    }));

    let raf = 0;
    let start = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Mouse X pans along the TIMELINE ──────────────────────────
    // Cursor X (offset from screen centre) is a signed PAN VELOCITY: right of
    // centre travels FORWARD along the timeline (data slides left), left of
    // centre rewinds, further from centre = faster. `scroll` accumulates that
    // velocity, and each line samples valueAt(screenU + scroll·parallax) — so
    // the actual chart shape translates through the frame like scrubbing a long
    // time-series. Centred cursor → the timeline holds still.
    let targetVel = 0; // -1..1 (left..right of centre)
    let vel = 0; // smoothed
    let scroll = 0; // accumulated timeline offset (in "screens")
    const onMouseMove = (e) => {
      const nx = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      targetVel = (nx - 0.5) * 2; // -1 (far left) .. +1 (far right)
    };
    if (!reduce) window.addEventListener('mousemove', onMouseMove);

    const easeInOut = (x) =>
      x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    // FULL-BLEED: lines run the entire width and use the whole height.
    const yFor = (v) => {
      const top = height * 0.06;
      const bottom = height * 0.94;
      return bottom - v * (bottom - top);
    };

    let prev = 0;
    const draw = (now) => {
      // On a RETURN, start the clock PAST the intro so the lines are already
      // fully drawn (drawP/fillP/motion at 1) from the first frame — no draw-in
      // replay — while the RAF loop + mouse pan run normally.
      if (!start) start = skipIntro ? now - (DRAW_MS + FILL_MS + 1000) : now;
      if (!prev) prev = now;
      const dt = Math.min(0.05, (now - prev) / 1000); // seconds, clamped
      prev = now;
      const t = now - start;
      const drawP = reduce ? 1 : easeInOut(Math.min(1, t / DRAW_MS));
      const fillP = reduce
        ? 1
        : easeInOut(Math.max(0, Math.min(1, (t - DRAW_MS) / FILL_MS)));
      // Wave amount eases in as the draw finishes, so the clean draw-in isn't
      // disturbed; afterwards the mouse fully drives it.
      const motion = reduce
        ? 0
        : easeInOut(Math.max(0, Math.min(1, (t - DRAW_MS * 0.7) / 900)));

      // Pan the timeline: cursor offset from centre = signed speed. Ease the
      // velocity so direction changes glide, then integrate into `scroll` so
      // the sampled chart data TRANSLATES through the frame continuously.
      vel += (targetVel - vel) * 0.06;
      const PAN_SPEED = 0.28; // "screens" per second at full deflection (slow)
      scroll += vel * PAN_SPEED * dt;

      ctx.clearRect(0, 0, width, height);

      // Columns sampled across the width. SPAN = 1 maps one screen to u∈[0,1],
      // so the valueAt frequencies show the SAME cycle counts (same line look)
      // as the original; `scroll` then pans that shape through the frame.
      const COLS = 96;
      const SPAN = 1;

      // Timeline y for a series at screen column c (0..COLS): sample the
      // continuous value function at the panned world position. `motion` eases
      // the pan in after the draw so the clean draw-in isn't disturbed.
      const tlY = (s, c) => {
        const u = (c / COLS) * SPAN + scroll * s.parallax * motion;
        return yFor(valueAt(u, s.cfg));
      };

      series.forEach((s, si) => {
        const stagger = si * 0.08;
        const local = Math.max(0, Math.min(1, (drawP - stagger) / (1 - stagger)));
        // Draw-in reveals columns left→right.
        const drawnCols = Math.max(1, Math.floor(local * COLS));
        const cx = (c) => (c / COLS) * width;

        if (fillP > 0) {
          ctx.beginPath();
          ctx.moveTo(cx(0), height);
          for (let c = 0; c <= drawnCols; c++) {
            ctx.lineTo(cx(c), tlY(s, c));
          }
          ctx.lineTo(cx(drawnCols), height);
          ctx.closePath();
          const fill = ctx.createLinearGradient(0, 0, 0, height);
          fill.addColorStop(0, `rgba(${s.rgb}, ${0.14 * fillP})`);
          fill.addColorStop(1, `rgba(${s.rgb}, 0)`);
          ctx.fillStyle = fill;
          ctx.fill();
        }

        ctx.beginPath();
        for (let c = 0; c <= drawnCols; c++) {
          const x = cx(c);
          const y = tlY(s, c);
          if (c === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${s.rgb}, ${0.28 + 0.12 * local})`;
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      });

      // Keep the RAF running so the mouse-driven wave stays live.
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // Fade the canvas in on first load; on a RETURN (skipIntro) or reduced
    // motion it's shown instantly (no fade), so the return has no animation.
    const instant = reduce || skipIntro;
    canvas.style.opacity = instant ? '1' : '0';
    canvas.style.transition = instant ? 'none' : 'opacity 700ms ease';
    const fadeRaf = requestAnimationFrame(() => {
      canvas.style.opacity = '1';
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fadeRaf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isDark]);

  return (
    <div
      ref={rootRef}
      className="mcpHome__spaceBg mcpHome__introV2"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundColor: isDark ? '#0b0912' : '#e6e0f5',
      }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {/* Edge fade to the real page background (set in the effect above). */}
      <div
        ref={vignetteRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default IntroV2;
