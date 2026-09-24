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
 * Intro screen — V4.
 *
 * Independent version of the MCP home intro backdrop (see intro_v2.js for the
 * contract). Editing this file changes ONLY V4. Lazy-loaded; hard-remounted on
 * refresh / version switch to replay.
 *
 * STARTER animation: soft aurora bands that rise from the bottom and sway,
 * easing into a gentle steady shimmer. A clean slot to build V4 on. Replace
 * freely.
 */

import React, { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../../components/with_theme';
import IntroVignette from './intro_vignette';

const DURATION_MS = 2400;

const IntroV4 = ({ skipIntro = false } = {}) => {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  // Fade the center radial glow in on mount (a touch slower than the canvas so
  // the lit core swells in gently behind the bands). Replays on refresh since
  // the component hard-remounts.
  useEffect(() => {
    const el = glowRef.current;
    if (!el) return undefined;
    const reduce =
      skipIntro ||
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduce) {
      el.style.opacity = '1';
      return undefined;
    }
    // Start hidden + slightly small, then bloom in: fade + scale up so the
    // central glow clearly SWELLS into view (a plain opacity ramp on a soft
    // gradient was too subtle to read). Set the start state, force a reflow so
    // the browser commits it, THEN apply the end state — guarantees the
    // transition plays rather than getting batched away.
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.7)';
    // Force reflow so the above is committed as the transition's start.
    // eslint-disable-next-line no-unused-expressions
    el.offsetHeight;
    el.style.transition = 'opacity 1600ms ease, transform 2000ms ease';
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
    return undefined;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduce =
      skipIntro ||
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const bands = isDark
      ? ['79, 70, 229', '124, 92, 255', '157, 139, 255']
      : ['110, 86, 207', '124, 92, 255', '150, 120, 240'];

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

    const easeOut = (x) => 1 - Math.pow(1 - x, 3);

    const draw = (now) => {
      if (!start) start = now;
      const t = now - start;
      const p = reduce ? 1 : easeOut(Math.min(1, t / DURATION_MS));
      const time = t / 1000;

      ctx.clearRect(0, 0, width, height);

      bands.forEach((hue, i) => {
        const restY = height * (0.35 + i * 0.16);
        const riseY = restY + (1 - p) * height * 0.5;
        const amp = 24 + i * 10;
        const speed = 0.5 + i * 0.25;
        const phase = time * speed + i;

        const grad = ctx.createLinearGradient(0, riseY - 120, 0, riseY + 120);
        grad.addColorStop(0, `rgba(${hue}, 0)`);
        grad.addColorStop(0.5, `rgba(${hue}, ${(isDark ? 0.28 : 0.18) * p})`);
        grad.addColorStop(1, `rgba(${hue}, 0)`);
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 12) {
          const y =
            riseY +
            Math.sin(x * 0.006 + phase) * amp +
            Math.sin(x * 0.013 - phase) * (amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
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
      className="mcpHome__spaceBg mcpHome__introV4"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundColor: isDark ? '#0b0912' : '#e6e0f5',
      }}>
      {/* Soft center radial glow behind the bands — a warm iris/violet bloom
          that's brightest in the middle and fades out, giving the field a lit
          core. Sits under the (transparent) canvas so the bands layer over it. */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          transformOrigin: '50% 46%',
          willChange: 'opacity, transform',
          background: isDark
            ? 'radial-gradient(58% 48% at 50% 46%, rgba(124,92,255,0.34) 0%, rgba(79,70,229,0.16) 42%, rgba(11,9,18,0) 72%)'
            : 'radial-gradient(58% 48% at 50% 46%, rgba(124,92,255,0.20) 0%, rgba(110,86,207,0.10) 44%, rgba(230,224,245,0) 74%)',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <IntroVignette isDark={isDark} />
    </div>
  );
};

export default IntroV4;
