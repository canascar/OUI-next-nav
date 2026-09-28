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
 * Intro screen — V5.
 *
 * Independent version of the MCP home intro backdrop (see intro_v2.js for the
 * contract). Editing this file changes ONLY V5. Lazy-loaded; hard-remounted on
 * refresh / version switch to replay.
 *
 * V5 animation: a single clean SPIROGRAPH — one hypotrochoid (a gear rolling
 * inside a ring, tracing an offset pen) drawn for many revolutions so its
 * crossing lines weave one coherent symmetrical rosette with a central hole.
 * It draws out to fill the frame, then SLOWS to a calm idle so it recedes
 * behind the UI, with a soft centralized aura. The MOUSE steers it: horizontal
 * pointer movement drives the spin and the direction the pulse/pen sweep. Every
 * parameter is randomized per mount, so each refresh / re-select draws a fresh
 * figure. All lines 1px. Blue design palette; edges dissolve via the shared
 * vignette.
 */

import React, { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../../components/with_theme';
import IntroVignette from './intro_vignette';

// Build phase (ms): the spirograph traces out, then holds and idles calmly.
const BUILD_MS = 4200;
// After build, motion eases from "lively" down to "calm" over this window so
// it stops competing with the UI that appears on top.
const CALM_MS = 2800;
// Max extra rotation (radians) the mouse position can add — a slight turn.
const MAX_MOUSE_ROT = 0.3;
// Number of line segments in the fading trail behind the pen head. Higher =
// smoother curve + longer visible tail, at a little more per-frame cost.
const TRAIL_SEGMENTS = 900;
// How much of the closed figure stays visible as a trail, in multiples of a
// full closed pattern. >1 means the pen draws well past a full figure before
// the tail erases it, so the rosette accumulates into a fuller woven shape
// instead of only ever showing a thin arc.
const TRAIL_TURNS_MULT = 1.8;
// Base pen speed in figure-revolutions-per-second-ish units (before build/calm
// scaling). Lower = slower, more contemplative drawing.
const BASE_PEN_SPEED = 0.55;
// Speed multiplier at the very start of the load-in. The pen rushes out this
// many times faster, then decelerates to 1× over BUILD_MS before the calm idle
// takes over — fast draw first, easing slower as the UI reveals.
const RUSH_PEAK = 3;

const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// Build a single dense hypotrochoid, randomized within a range that reliably
// produces the "rosette with a central hole" look from classic Spirograph art.
//
// Hypotrochoid: fixed ring R, rolling gear r, pen offset d.
//   x = (R-r)cos t + d cos((R-r)/r · t)
//   y = (R-r)sin t − d sin((R-r)/r · t)
// The figure closes after r/gcd(R,r) revolutions and shows R/gcd(R,r) petals.
// R and r are coprime → maximally dense single-stroke figure.
const makeSpiro = () => {
  const petals = randInt(7, 14); // outer lobes
  const R = petals;
  // Keep r a small-ish fraction of R so (R−r) — the base radius of the traced
  // ring — stays large. That gives the figure a wide, open CENTRAL HOLE
  // (radius ≈ (R−r) − d) through which the central aura gradient shows.
  let r = randInt(Math.max(2, Math.round(R * 0.25)), Math.round(R * 0.55));
  let guard = 0;
  while (gcd(R, r) !== 1 && guard < R) {
    r -= 1;
    if (r < 2) r = Math.round(R * 0.55);
    guard += 1;
  }
  // Pen offset controls the hole. The inner radius of the curve is (R−r) − d;
  // keep d strictly below (R−r) so the centre never fills in. We cap d at a
  // fraction of (R−r) so a clean hole (~30–55% of the ring radius) always
  // remains open for the aura.
  const base = R - r;
  const d = rand(0.45, 0.7) * base; // < base → hole radius = base − d > 0
  // Fraction of the drawn radius occupied by the open central hole. Max extent
  // is (base + d); inner hole radius is (base − d).
  const holeFrac = (base - d) / (base + d);
  return {
    holeFrac,
    R,
    r,
    d,
    petals,
    turns: r / gcd(R, r),
    rot0: rand(0, Math.PI * 2),
    fill: rand(0.74, 0.88),
    pulseOffset: rand(0, 1),
  };
};

const IntroV5 = ({ skipIntro = false } = {}) => {
  const canvasRef = useRef(null);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const prefersReduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reduce = prefersReduce || skipIntro;

    const baseRgb = isDark ? '59, 130, 246' : '90, 66, 190'; // blue-500 / iris
    const hiRgb = isDark ? '147, 197, 253' : '124, 92, 255'; // light blue / violet
    const auraRgb = isDark ? '147, 180, 252' : '124, 92, 255';

    const spiro = makeSpiro();

    let raf = 0;
    let start = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let headT = 0; // accumulated pen travel (radians) — monotonic, never reverses
    let lastNow = 0; // previous frame timestamp for delta-time accumulation

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

    // Mouse-driven rotation: the pointer's X position gives the figure a slight
    // in-plane rotation. Pointer at the left edge rotates one way, right edge
    // the other; the rendered angle eases toward the target so it turns
    // smoothly and settles when the mouse stops.
    let targetRot = 0;
    let mouseRot = 0;
    const onPointerMove = (e) => {
      const nx = (e.clientX / (window.innerWidth || 1)) * 2 - 1; // −1..1
      const ny = (e.clientY / (window.innerHeight || 1)) * 2 - 1; // −1..1
      // Both axes nudge the rotation; average so the combined range stays a
      // slight turn rather than doubling up.
      targetRot = ((nx + ny) / 2) * MAX_MOUSE_ROT;
    };
    if (!reduce) window.addEventListener('pointermove', onPointerMove);

    const easeInOut = (x) =>
      x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    // Decelerating ease (fast start, gentle tail) — used for the load-in rush
    // so speed drops off quickly then eases into the idle.
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);

    const TWO_PI = Math.PI * 2;

    // Hypotrochoid point at parameter t, centred at (cx,cy), rotated by `rot`.
    const spiroPoint = (t, radius, cx, cy, rot) => {
      const { R, r, d } = spiro;
      const k = (R - r) / r;
      const x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
      const y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const rx = x * cosR - y * sinR;
      const ry = x * sinR + y * cosR;
      const norm = radius / (R - r + d);
      return [cx + rx * norm, cy + ry * norm];
    };

    const draw = (now) => {
      if (!start) start = now;
      const t = now - start;
      const time = t / 1000;

      const buildP = reduce ? 1 : easeInOut(Math.min(1, t / BUILD_MS));

      // Calm factor: 1 while building, easing to a low idle value afterward so
      // motion recedes behind the UI.
      let calm;
      if (!reduce) {
        const afterBuild = Math.max(0, t - BUILD_MS);
        const cp = Math.min(1, afterBuild / CALM_MS);
        calm = 1 - easeInOut(cp) * 0.8; // 1 → ~0.2
      } else {
        calm = 0.2;
      }

      // Ease the rotation toward the pointer-X target (lerp) so it turns
      // smoothly and settles.
      mouseRot += (targetRot - mouseRot) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const radius = Math.min(width, height) * 0.5 * spiro.fill;
      const cx = width / 2;
      const cy = height * 0.48;

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 1; // ALL lines 1px

      // Slow idle spin + slight mouse rotation.
      const rot = spiro.rot0 + time * 0.1 * calm + mouseRot;
      const breathe = 0.85 + 0.15 * Math.sin(time * 0.9 * calm);

      // CONTINUOUS TRAIL: the pen never stops — it advances forever along the
      // hypotrochoid. We draw a trailing WINDOW of recent segments behind the
      // head, fading each from bright (at the head) to transparent (at the
      // tail). Older line vanishes as new line appears, so the figure is
      // perpetually being drawn and erased around the pattern.
      //
      // headT is ACCUMULATED by adding (dt × speed) each frame, so it is
      // strictly monotonic — it NEVER goes backward even as the speed eases
      // down after the build (recomputing from `time × speed` could dip).
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
      lastNow = now;
      // Pen speed (rad/sec). It RUSHES on load, then decelerates and eases into
      // the calm idle as the UI reveals — fast draw first, gentle settle after.
      //   rush:  starts at RUSH_PEAK and eases down to 1 over BUILD_MS, so the
      //          figure races out at the start and slows as it fills in.
      //   calm:  continues easing the idle speed down after the build (already
      //          computed above), so the tail end is slow and unobtrusive.
      // Always positive → the pen only ever moves forward.
      const rushP = reduce ? 1 : easeOut(Math.min(1, t / BUILD_MS));
      const rush = 1 + (RUSH_PEAK - 1) * (1 - rushP);
      const penSpeed =
        BASE_PEN_SPEED * TWO_PI * rush * (0.55 + 0.45 * calm);
      headT += dt * penSpeed;

      // Length of the visible trail, in radians. More than one full closed
      // figure so the rosette fills in and overlaps into a woven shape before
      // the tail erases it — keeps the screen from looking bare.
      const trailLen = TWO_PI * spiro.turns * TRAIL_TURNS_MULT;
      const segStep = trailLen / TRAIL_SEGMENTS;
      const baseA = (isDark ? 0.34 : 0.3) * breathe;
      const headA = (isDark ? 0.9 : 0.8) * breathe;

      // Draw tail → head so brighter head segments paint over dimmer ones.
      let prev = null;
      for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
        const a = headT - trailLen + i * segStep; // segment param
        if (a < 0) {
          prev = null; // nothing drawn before the pen has moved this far
          continue;
        }
        const [px, py] = spiroPoint(a, radius, cx, cy, rot);
        const frac = i / TRAIL_SEGMENTS; // 0 at tail, 1 at head
        if (prev) {
          // Most of the trail stays clearly visible; only the last ~30% near
          // the tail fades to transparent, so the drawn rosette lingers and
          // fills the frame before it erases.
          const TAIL = 0.3;
          const fade = frac < TAIL ? frac / TAIL : 1;
          // Slightly brighten toward the head; blend to the hi colour at the
          // very tip so the pen glows as it draws.
          const alpha = baseA + (headA - baseA) * Math.max(0, (frac - 0.6) / 0.4);
          const rgb = frac > 0.9 ? hiRgb : baseRgb;
          ctx.strokeStyle = `rgba(${rgb}, ${alpha * fade})`;
          ctx.beginPath();
          ctx.moveTo(prev[0], prev[1]);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
        prev = [px, py];
      }

      // Centralized aura — blooms in as the figure forms, then settles. Sized
      // to fill the figure's open central hole so the gradient reads cleanly
      // through the middle (a touch beyond the hole edge for a soft feather).
      const auraP = easeInOut(Math.min(1, t / (BUILD_MS * 0.9)));
      const auraPulse = 0.9 + 0.1 * Math.sin(time * 0.6 * calm);
      const holeR = radius * spiro.holeFrac;
      const auraRadius = holeR * 1.25 * (0.6 + 0.4 * auraP);
      const aura = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.max(1, auraRadius)
      );
      const auraA = (isDark ? 0.24 : 0.18) * auraP * auraPulse;
      aura.addColorStop(0, `rgba(${auraRgb}, ${auraA})`);
      aura.addColorStop(0.45, `rgba(${auraRgb}, ${auraA * 0.4})`);
      aura.addColorStop(1, `rgba(${auraRgb}, 0)`);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, auraRadius), 0, TWO_PI);
      ctx.fill();

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const instant = reduce;
    canvas.style.opacity = instant ? '1' : '0';
    canvas.style.transition = instant ? 'none' : 'opacity 600ms ease';
    const fadeRaf = requestAnimationFrame(() => {
      canvas.style.opacity = '1';
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fadeRaf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [isDark]);

  return (
    <div
      className="mcpHome__spaceBg mcpHome__introV5"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundColor: isDark ? '#080b12' : '#e6e0f5',
      }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <IntroVignette isDark={isDark} />
    </div>
  );
};

export default IntroV5;
