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
 * Intro screen — V3.
 *
 * Independent version of the MCP home intro backdrop (see intro_v2.js for the
 * contract). Editing this file changes ONLY V3. Lazy-loaded; hard-remounted on
 * refresh / version switch to replay.
 *
 * V3 animation: a DATA STREAM that resolves into the agent. Columns of data
 * glyphs (digits / hex / binary / symbols) rain down across the whole field —
 * a flowing data stream — then get PULLED IN toward Olly (the mascot, upper
 * centre) and absorbed, as if the agent is ingesting the data. What's left is a
 * sparse scatter of FRAGMENTED data elements drifting/twinkling across the
 * background. Three phases: STREAM → CONVERGE → FRAGMENTS.
 */

import React, { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../../components/with_theme';
import IntroVignette from './intro_vignette';

// Phase timing (ms).
const STREAM_MS = 2200; // data rains down
const CONVERGE_MS = 1000; // glyphs RUSH into the agent (snappier than before)
const GLOW_MS = 1100; // glow blooms AFTER the data is absorbed
const GLYPHS = '01</>{}[]#$%&x0123456789ABCDEF+=*·:;•|◇◆▲△';

const IntroV3 = ({ skipIntro = false } = {}) => {
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
    // On a RETURN (skipIntro) OR reduced motion, jump to the settled end state
    // — no data stream, no convergence; just the residual fragments + glow.
    const reduce = prefersReduce || skipIntro;

    // Blue-dominant data stream (dark): blue-500 body with a light sky-blue
    // "head" for leading glyphs — reads blue, not purple. Light mode keeps a
    // deeper iris for contrast on the pale bg.
    const body = isDark ? '59, 130, 246' : '90, 66, 190'; // blue-500
    const head = isDark ? '147, 197, 253' : '108, 78, 220'; // light sky-blue head
    // Light-mode glyphs need more opacity to be visible on the light bg (dark
    // mode's additive-ish brightness carries on its own). This multiplies every
    // glyph's alpha.
    const alphaBoost = isDark ? 1 : 1.7;

    let raf = 0;
    let start = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Convergence target — where the data is "absorbed" (Olly's mascot sits at
    // the top of the centered content column, ~upper centre of the field).
    const target = () => ({ x: width * 0.5, y: height * 0.42 });

    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (str) => str[Math.floor(Math.random() * str.length)];

    // Particles: each is a data glyph. During STREAM it falls down its column;
    // during CONVERGE it flies toward the target and fades; a subset are
    // FRAGMENTS that survive and linger scattered across the field.
    let particles = [];
    const build = () => {
      particles = [];
      const cols = Math.max(18, Math.floor(width / 26));
      const colW = width / cols;
      for (let c = 0; c < cols; c++) {
        const perCol = 5 + Math.floor(Math.random() * 4);
        for (let k = 0; k < perCol; k++) {
          const x = c * colW + colW * 0.5 + rand(-4, 4);
          particles.push({
            x,
            homeX: x,
            // Staggered start above the top so columns stream in over time.
            y: rand(-height, height),
            speed: rand(70, 170), // px/sec fall speed
            glyph: pick(GLYPHS),
            size: rand(11, 16),
            // Flicker cadence for glyph swaps + brightness.
            flick: rand(0, Math.PI * 2),
            flickRate: rand(4, 10),
            head: Math.random() < 0.16, // brighter leading glyphs
            // Fragments survive the convergence and settle as residual data.
            fragment: Math.random() < 0.14,
            // Per-particle convergence delay so absorption is a wave, not a snap.
            pull: rand(0, 0.35),
            // Resting scatter position for fragments (kept near home, drifting).
            fragDrift: rand(0.2, 0.7),
          });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    resize();
    window.addEventListener('resize', resize);

    const easeInOut = (x) =>
      x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);

    let prev = 0;
    const draw = (now) => {
      if (!start) start = now;
      if (!prev) prev = now;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const t = now - start;
      const time = t / 1000;

      // Phase progress.
      const streamP = reduce ? 1 : Math.min(1, t / STREAM_MS); // stream ramp
      // Convergence RUSHES in — ease-IN (cubic) so glyphs accelerate hard
      // toward the agent and get yanked in at the end rather than gliding.
      const convRaw = Math.max(0, Math.min(1, (t - STREAM_MS) / CONVERGE_MS));
      const convP = reduce ? 1 : convRaw * convRaw * convRaw;
      // Glow blooms AFTER the data has been absorbed (convergence done), so the
      // light appears once the particles have vanished into the agent.
      const glowP = reduce
        ? 1
        : easeOut(Math.max(0, Math.min(1, (t - STREAM_MS - CONVERGE_MS) / GLOW_MS)));

      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const tp = target();

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // STREAM: fall down the column, wrapping around the top.
        if (convP < 1 || pt.fragment) {
          pt.y += pt.speed * dt * (reduce ? 0 : 1);
          if (pt.y > height + 20) pt.y = -20;
        }
        // Occasionally swap the glyph for a live "data" flicker.
        pt.flick += pt.flickRate * dt;
        if (Math.sin(pt.flick) > 0.985) pt.glyph = pick(GLYPHS);

        // Position: blend the streaming column position toward the target as
        // the convergence phase advances (per-particle delayed).
        let x = pt.x;
        let y = pt.y;
        let alpha;
        let size = pt.size;

        if (pt.fragment) {
          // Fragments never fully absorb — they thin out but linger, drifting
          // gently and twinkling as residual data across the field.
          const settle = easeOut(Math.max(0, Math.min(1, (convP - 0.2) / 0.8)));
          x = pt.homeX + Math.sin(time * pt.fragDrift + i) * 8;
          const tw = 0.5 + 0.5 * Math.sin(time * (1.2 + pt.fragDrift) + i);
          // Fade from the streaming brightness down to a faint residual glint.
          alpha = (0.5 * (1 - settle) + 0.16 * tw) * Math.min(1, streamP * 1.5);
        } else {
          // Absorbed glyphs: fly toward the target and fade out.
          const local = Math.max(0, Math.min(1, (convP - pt.pull) / (1 - pt.pull)));
          const e = easeInOut(local);
          x = pt.x + (tp.x - pt.x) * e;
          y = pt.y + (tp.y - pt.y) * e;
          // Shrink as they get absorbed.
          size = pt.size * (1 - 0.5 * e);
          // Bright while streaming, fading to 0 as they reach the agent.
          const streamAlpha = Math.min(1, streamP * 1.5) * (pt.head ? 0.95 : 0.6);
          alpha = streamAlpha * (1 - e);
        }

        if (alpha <= 0.01) continue;
        const color = pt.head ? head : body;
        ctx.font = `${size}px var(--g-font-mono, monospace)`;
        ctx.fillStyle = `rgba(${color}, ${Math.min(1, alpha * alphaBoost)})`;
        ctx.fillText(pt.glyph, x, y);
      }

      // Glow blooms AT the target AFTER the data has been pulled in and
      // vanished — the agent lighting up once it's absorbed the stream. Bigger
      // and softer than before.
      if (glowP > 0) {
        const R = 260; // larger radius
        const gl = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, R);
        const ga = 0.4 * glowP * (isDark ? 1 : 0.72);
        gl.addColorStop(0, `rgba(${head}, ${ga})`);
        gl.addColorStop(0.5, `rgba(${head}, ${ga * 0.35})`);
        gl.addColorStop(1, `rgba(${head}, 0)`);
        ctx.fillStyle = gl;
        ctx.fillRect(tp.x - R, tp.y - R, R * 2, R * 2);
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    canvas.style.opacity = reduce ? '1' : '0';
    canvas.style.transition = 'opacity 700ms ease';
    const fadeRaf = requestAnimationFrame(() => {
      canvas.style.opacity = '1';
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fadeRaf);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return (
    <div
      className="mcpHome__spaceBg mcpHome__introV3"
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
      <IntroVignette isDark={isDark} />
    </div>
  );
};

export default IntroV3;
