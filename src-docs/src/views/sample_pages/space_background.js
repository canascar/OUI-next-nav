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

import React, { useContext, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ThemeContext } from '../../components/with_theme';

// GLB path — loaded via webpack file-loader. The mesh isn't rendered directly;
// its surface is sampled to seed a drifting constellation of glowing points, so
// the logo's silhouette becomes the "shape" of the space scene.
const MODEL_PATH = require('../../../../src/animations/3D/OpenSearch3D.glb');

// Palettes tuned per theme. [core, accent, spark] — core drives the central
// aura, accent the constellation, spark the far starfield. `bg` is painted
// behind the transparent canvas as the scene backdrop.
//
// Colors are the iris/violet accents from the token library
// (oui-next $ouiColorPrimary/Secondary, v9 --g-accent-bright #4f46e5).
const PALETTES = {
  // Dark theme: violet points on a deep near-black violet field, additively
  // blended for heavy glare/bloom.
  dark: {
    // Bluer iris for the central aura: additive bloom saturates R+B first, so a
    // red-heavy violet piles up to magenta/pink in the hot core. A blue-biased
    // iris keeps the centre glow blue-violet → white instead of pink.
    core: new THREE.Color('#5a63f0'),
    accent: new THREE.Color('#9D8BFF'), // oui-next dark primary (violet)
    spark: new THREE.Color('#c4b8ff'), // lighter violet for far stars
    fog: new THREE.Color('#0b0916'),
    bg: '#0b0912', // deep violet-black backdrop
    // Radial gradient: a faint violet lift at the eclipse centre fading to
    // near-black at the edges, for depth behind the corona.
    bgGradient:
      'radial-gradient(120% 90% at 50% 42%, #171029 0%, #0d0a1a 45%, #070510 100%)',
    disc: '#0b0912', // eclipse shadow — matches the backdrop (near-black)
    discOpacity: 0.96,
    additive: true,
    // Astral nebula hues sampled across the corona — deep indigo through iris
    // to a magenta/rose edge, with rare cyan sparks. Rooted in the iris/violet
    // tokens but spread into a celestial gradient.
    // On-brand iris/violet spread — indigo through iris to pale lilac, with a
    // subtle blue-iris spark. No pinks/cyans, to stay true to the theme.
    nebula: [
      new THREE.Color('#4f46e5'), // indigo (v9 --g-accent-bright)
      new THREE.Color('#6E56CF'), // iris (oui-next light primary)
      new THREE.Color('#7C5CFF'), // iris-violet (oui-next secondary)
      new THREE.Color('#9D8BFF'), // violet (oui-next dark primary)
      new THREE.Color('#c4b8ff'), // pale lilac
      new THREE.Color('#5b8bff'), // subtle blue-iris spark
    ],
    nebulaWeights: [0.2, 0.24, 0.24, 0.16, 0.1, 0.06],
    nebulaClouds: ['#4f46e5', '#7C5CFF', '#9D8BFF', '#5b8bff'],
  },
  // Light theme: a CRISP CONSTELLATION eclipse, not a glow. Additive bloom
  // can't work on a light background (nothing to glow into → flat blobs), so
  // light mode drops the glow halo/aura and renders solid, sharp iris/violet
  // motes as a clean starry ring on a light lavender stage. Reads intentional
  // and on-brand instead of muddy.
  light: {
    core: new THREE.Color('#6E56CF'), // iris (oui-next light primary)
    accent: new THREE.Color('#5f47c4'), // solid iris motes
    spark: new THREE.Color('#8168d4'), // violet far stars
    fog: new THREE.Color('#d8d0ee'), // light haze so distant motes fade softly
    bg: '#ece8f7', // light lavender backdrop — clearly a light theme
    // Radial gradient: a soft lifted centre deepening a little toward the edges.
    bgGradient:
      'radial-gradient(120% 90% at 50% 42%, #f3f0fa 0%, #e8e3f4 48%, #d7cfec 100%)',
    disc: '#f3f0fa', // calm centre — matches the lighter gradient core
    discOpacity: 0.82,
    additive: false, // crisp alpha motes, no additive bloom
    crisp: true, // skip glow halo + central aura bloom on light
    // On-brand iris/violet spread, saturated for the light stage. Indigo
    // through iris to lilac with a blue-iris spark — no pinks/cyans.
    nebula: [
      new THREE.Color('#4338ca'), // deep indigo
      new THREE.Color('#5f47c4'), // iris
      new THREE.Color('#6E56CF'), // iris (oui-next light primary)
      new THREE.Color('#7a5ad0'), // violet
      new THREE.Color('#9b83e0'), // lilac
      new THREE.Color('#4f6fd6'), // blue-iris spark
    ],
    nebulaWeights: [0.2, 0.24, 0.24, 0.16, 0.1, 0.06],
    nebulaClouds: ['#5f47c4', '#7a5ad0', '#9b83e0', '#4f6fd6'],
  },
};

/** Uniformly sample `count` points from a mesh's triangles (area-weighted). */
function sampleSurfacePoints(mesh, count) {
  const pos = mesh.geometry.attributes.position;
  const index = mesh.geometry.index;
  const triCount = index ? index.count / 3 : pos.count / 3;

  // Area-weighted cumulative distribution so large triangles get more samples.
  const areas = new Float32Array(triCount);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  let total = 0;
  const triVert = (t, corner) => {
    const i = index ? index.getX(t * 3 + corner) : t * 3 + corner;
    return i;
  };
  for (let t = 0; t < triCount; t++) {
    a.fromBufferAttribute(pos, triVert(t, 0));
    b.fromBufferAttribute(pos, triVert(t, 1));
    c.fromBufferAttribute(pos, triVert(t, 2));
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    const area = ab.cross(ac).length() * 0.5;
    areas[t] = area;
    total += area;
  }
  const cdf = new Float32Array(triCount);
  let acc = 0;
  for (let t = 0; t < triCount; t++) {
    acc += areas[t] / total;
    cdf[t] = acc;
  }

  const out = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  for (let s = 0; s < count; s++) {
    // Pick a triangle by inverse-CDF, then a random barycentric point in it.
    const r = Math.random();
    let lo = 0;
    let hi = triCount - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    a.fromBufferAttribute(pos, triVert(lo, 0));
    b.fromBufferAttribute(pos, triVert(lo, 1));
    c.fromBufferAttribute(pos, triVert(lo, 2));
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    p.copy(a)
      .addScaledVector(ab.subVectors(b, a), u)
      .addScaledVector(ac.subVectors(c, a), v);
    out[s * 3] = p.x;
    out[s * 3 + 1] = p.y;
    out[s * 3 + 2] = p.z;
  }
  return out;
}

/** Round soft-glow sprite for additive points (drawn once to a canvas). */
function makeGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Four-point sparkle "star" glyph — a bright core with four tapered rays (a
 * subtle secondary diagonal cross), drawn white on transparent so it can be
 * tinted per-mote. This is what turns the corona motes into little stars
 * instead of round dots (Krea-style twinkle).
 */
function makeStarTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Soft round core glow so the centre still reads as a luminous point.
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.14);
  core.addColorStop(0, 'rgba(255,255,255,1)');
  core.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  // Draw a tapered ray from the centre out to `len`, `half` wide at the base,
  // fading to transparent at the tip — the classic sparkle spike.
  const ray = (angle, len, half) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(len, 0);
    ctx.lineTo(0, half);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const maxLen = size * 0.48;
  // Primary vertical + horizontal spikes (long, thin).
  ray(0, maxLen, size * 0.05);
  ray(Math.PI, maxLen, size * 0.05);
  ray(Math.PI / 2, maxLen, size * 0.05);
  ray(-Math.PI / 2, maxLen, size * 0.05);
  // Shorter, fainter diagonal spikes for a fuller four-point sparkle.
  const diag = maxLen * 0.55;
  ctx.globalAlpha = 0.5;
  ray(Math.PI / 4, diag, size * 0.03);
  ray((3 * Math.PI) / 4, diag, size * 0.03);
  ray((5 * Math.PI) / 4, diag, size * 0.03);
  ray((7 * Math.PI) / 4, diag, size * 0.03);
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Crisp round dot with a soft antialiased edge — for solid (non-glow) motes. */
function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  // A solid core with a soft colored halo feathering out — a crisp dot that
  // still carries a slight glow. Normal-blended with the mote's own color, so
  // the halo is a gentle tint (no additive washout on a light background).
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,1)');
  g.addColorStop(0.58, 'rgba(255,255,255,0.72)');
  g.addColorStop(0.78, 'rgba(255,255,255,0.32)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * SpaceBackground — a full-bleed animated WebGL scene meant to sit behind the
 * home greeting. A constellation of glowing points, shaped from the OpenSearch
 * logo geometry, drifts and breathes over a deep starfield with a soft central
 * aura. Colors follow the active theme; the whole thing is decorative and never
 * captures pointer events. Honors prefers-reduced-motion (renders one frame).
 */
// The spin-in / form-the-ring intro plays once per page load. Module-level so
// it survives remounts (tab open, theme toggle, resize) within the same load.
let hasIntroPlayed = false;

export const SpaceBackground = () => {
  const containerRef = useRef(null);
  const vignetteRef = useRef(null);
  const blurRef = useRef(null);
  const frameRef = useRef(null);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const palette = isDark ? PALETTES.dark : PALETTES.light;

    // Resolve the app's ACTUAL page background behind the eclipse (walk up from
    // the container to the first ancestor with a non-transparent background).
    // The vignette fades to THIS so the particles dissolve seamlessly into the
    // real page — not into the eclipse's own slightly-different backdrop tint.
    const resolvePageBg = () => {
      let el = container.parentElement;
      while (el) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
        el = el.parentElement;
      }
      return palette.bg;
    };
    const pageBgStr = resolvePageBg();
    // Parse "rgb(r, g, b)" → "r, g, b" for building rgba() stops.
    const pageRgb = (() => {
      const m = pageBgStr.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) return `${m[1]}, ${m[2]}, ${m[3]}`;
      const c = new THREE.Color(pageBgStr);
      return `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(
        c.b * 255
      )}`;
    })();

    // Backdrop behind the transparent canvas = the real page background, so the
    // faded edges match it exactly.
    container.style.backgroundColor = pageBgStr;

    // Vignette overlay — transparent through the middle (particles fully
    // visible around the eclipse) ramping to the solid PAGE background at the
    // edges, so the corona dissolves into the page instead of hard-clipping.
    if (vignetteRef.current) {
      vignetteRef.current.style.background = `radial-gradient(72% 72% at 50% 48%, rgba(${pageRgb}, 0) 26%, rgba(${pageRgb}, 0.55) 56%, rgba(${pageRgb}, 0.9) 80%, rgba(${pageRgb}, 1) 100%)`;
    }
    // Additive glow on dark; normal alpha blend on light so dark motes darken
    // the pale canvas instead of washing out.
    const blendMode = palette.additive
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // ── Scene / camera / renderer ────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(palette.fog.getHex(), 0.045);

    // Wide FOV + close camera so we sit inside the particle field and it
    // sprawls past every edge of the frame.
    const camera = new THREE.PerspectiveCamera(78, width / height, 0.1, 140);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Start the canvas transparent and fade it in via the animate loop. This
    // guarantees a smooth fade-into-scene with NO first-frame flash, regardless
    // of when the GLB swaps the placeholder field for the denser one (the
    // per-mote color fade alone could pop if the swap lands mid-reveal).
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.willChange = 'opacity';
    container.appendChild(renderer.domElement);

    const glowTex = makeGlowTexture();
    // Star sparkle glyph — the corona motes render as little four-point stars.
    const starTex = makeStarTexture();
    // Crisp light mode uses a solid dot; glowing dark mode uses the soft glow.
    const crisp = !!palette.crisp;
    const dotTex = crisp ? makeDotTexture() : null;
    const moteTex = crisp ? dotTex : glowTex;

    // ── Deep starfield (far, parallax layer for depth) ───────────
    // Denser and spread far wider than the viewport so stars run edge to edge
    // and keep going into the depths — nothing feels boxed in.
    const STAR_COUNT = 1800;
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 120;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPos[i * 3 + 2] = -6 - Math.random() * 60;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: palette.spark.getHex(),
      size: crisp ? 0.07 : 0.12,
      map: moteTex,
      transparent: true,
      opacity: crisp ? 0.8 : 0.95,
      depthWrite: false,
      blending: blendMode,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── Starfield constellation ──────────────────────────────────
    // The particles form an even field of stars across the whole background
    // (no eclipse ring, no occluding disc, no central aura). Density tapers
    // gently toward the centre so the greeting/input still read clearly.
    const constellation = new THREE.Group();
    constellation.position.set(0, 0.2, 0);
    scene.add(constellation);

    // Half-extents of the star field in world units. Wider than the frame so
    // stars run edge to edge with room for parallax drift.
    const FIELD_X = 11;
    const FIELD_Y = 8;
    const FIELD_Z = 4;

    // Lay `count` motes into an even full-field starfield (no ring). A gentle
    // radial thinning toward the centre keeps a calmer pocket behind the
    // greeting/input without carving a hard hole. Returns a flat xyz array.
    const buildStarfieldPositions = (count) => {
      const out = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        let x;
        let y;
        // Rejection-sample so density tapers softly near the centre (where the
        // text/input sit) instead of a uniform block or a hard ring.
        for (let tries = 0; tries < 4; tries++) {
          x = (Math.random() * 2 - 1) * FIELD_X;
          y = (Math.random() * 2 - 1) * FIELD_Y;
          const d = Math.hypot(x / FIELD_X, y / FIELD_Y); // 0 centre → ~1 edge
          // Keep with probability rising from ~0.3 at centre to 1 at the edge.
          if (Math.random() < 0.3 + 0.7 * d) break;
        }
        out[i * 3] = x;
        out[i * 3 + 1] = y;
        out[i * 3 + 2] = (Math.random() * 2 - 1) * FIELD_Z;
      }
      return out;
    };

    // Placeholder while the GLB streams in — a corona ring so the eclipse is
    // present immediately even on slow loads.
    const CLOUD_COUNT = 2600;

    // Weighted pick from the palette's nebula hues so most motes sit in the
    // iris/violet band with rarer orchid/rose/cyan sparks — an astral gradient.
    const nebula = palette.nebula;
    const nebulaWeights = palette.nebulaWeights;
    const pickNebulaColor = () => {
      let r = Math.random();
      for (let i = 0; i < nebula.length; i++) {
        r -= nebulaWeights[i];
        if (r <= 0) return nebula[i];
      }
      return nebula[nebula.length - 1];
    };

    const buildGeoFromPositions = (positions) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const n = positions.length / 3;
      // Per-point size variance for a more organic, twinkling field.
      const sizes = new Float32Array(n);
      // Per-point nebula color so the corona reads as a celestial gradient
      // rather than one flat hue. `colors` is the LIVE attribute the material
      // reads; `baseColors` is the untouched target we scale by each mote's
      // fade factor during the Krea-style staggered fade-in.
      const colors = new Float32Array(n * 3);
      const baseColors = new Float32Array(n * 3);
      // Companion glow attributes: a SECOND set of colors for the glow halo,
      // scaled per-mote by a random glow factor so some stars glow far brighter
      // than others (rare "beacons"), while most keep a subtle halo — a more
      // organic, varied field. Kept on the same geometry so the glow layer can
      // share positions + fade timing but read its own `aGlowColor`.
      const glowColors = new Float32Array(n * 3);
      const glowBaseColors = new Float32Array(n * 3);
      // Per-mote fade-in timing: a random birth delay (0→1 of the fade window)
      // so stars pop in scattered over time, plus a per-mote fade span. This
      // is what gives the "stars quietly appearing one by one" look.
      const fadeDelay = new Float32Array(n);
      const fadeSpan = new Float32Array(n);
      const c = new THREE.Color();
      for (let i = 0; i < n; i++) {
        sizes[i] = 0.05 + Math.random() * 0.14;
        c.copy(pickNebulaColor());
        // Slight per-mote brightness jitter for depth/twinkle at rest.
        const b = 0.75 + Math.random() * 0.25;
        baseColors[i * 3] = c.r * b;
        baseColors[i * 3 + 1] = c.g * b;
        baseColors[i * 3 + 2] = c.b * b;
        // Randomized glow strength: most motes glow faintly (~0.35–0.8×), but
        // ~12% are bright "beacons" (1.4–2.4×) that bloom noticeably. This is
        // what makes some stars glow more than others.
        const glowFactor =
          Math.random() < 0.12
            ? 1.4 + Math.random() * 1.0
            : 0.35 + Math.random() * 0.45;
        glowBaseColors[i * 3] = c.r * b * glowFactor;
        glowBaseColors[i * 3 + 1] = c.g * b * glowFactor;
        glowBaseColors[i * 3 + 2] = c.b * b * glowFactor;
        // Start fully dark; the fade-in ramp fills these in over the intro.
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0;
        glowColors[i * 3] = 0;
        glowColors[i * 3 + 1] = 0;
        glowColors[i * 3 + 2] = 0;
        // Spread births across most of the window and give each a slower
        // ramp, so the fade-in is clearly visible (stars trickle in) rather
        // than snapping to full almost immediately.
        fadeDelay[i] = Math.random() * 0.7; // birth anywhere in first 70%
        fadeSpan[i] = 0.28 + Math.random() * 0.4; // each star fades over 28–68%
      }
      // Dedicated pointer-glow color buffer — all zero (black/invisible) at
      // rest; writeLayerColors fills it with the additive proximity bloom each
      // frame so a soft lit pool follows the cursor in both themes.
      const pointerColors = new Float32Array(n * 3);
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('aGlowColor', new THREE.BufferAttribute(glowColors, 3));
      geo.setAttribute(
        'aPointerColor',
        new THREE.BufferAttribute(pointerColors, 3)
      );
      // Stash the fade bookkeeping on the geometry so the animate loop can
      // drive the per-mote reveal (both core `color` and glow `aGlowColor`).
      geo.userData.baseColors = baseColors;
      geo.userData.glowBaseColors = glowBaseColors;
      geo.userData.fadeDelay = fadeDelay;
      geo.userData.fadeSpan = fadeSpan;
      geo.userData.faded = false; // set true once fully revealed (stop writing)
      return geo;
    };

    // Core particle material — the crisp mote. On light mode this is normal-
    // blended so the purple reads darker than the pale backdrop.
    const pointsMat = new THREE.PointsMaterial({
      vertexColors: true, // per-mote nebula hues
      // Four-point sparkle stars — kept small for a fine, distant starfield.
      size: crisp ? 0.14 : 0.2,
      map: starTex,
      transparent: true,
      opacity: crisp ? 1 : 0.9,
      depthWrite: false,
      blending: blendMode,
      sizeAttenuation: true,
    });

    // Glow halo behind the core mote.
    //
    // Dark mode: ADDITIVE bloom — a soft luminous glare that adds light,
    // carrying per-mote nebula hues.
    //
    // Crisp light mode: additive would only LIGHTEN the pale backdrop and make
    // the stars blend in. Instead use NORMAL blending with a single deep-violet
    // tint so the halo reads as a soft DARK aura around each star — that darker
    // pool makes the light-mode stars stand out against the lavender bg.
    const glowMat = new THREE.PointsMaterial({
      vertexColors: !crisp, // dark: per-mote hues; light: one dark tint below
      // A soft LIGHT-PURPLE halo in light mode — a gentle lavender bloom that
      // haloes each star without the smoky dark pool. Kept close to the core.
      color: crisp ? new THREE.Color('#b9a8f5') : 0xffffff, // light lavender
      // Bigger halo so each star carries a fuller bloom/glow.
      size: crisp ? 0.34 : 0.4,
      map: glowTex,
      transparent: true,
      opacity: crisp ? 0.22 : 0.12,
      depthWrite: false,
      blending: crisp ? THREE.NormalBlending : THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    // Pointer-glow halo material — a dedicated ADDITIVE bloom layer that is
    // normally fully dark (its per-mote color sits at black) and only lights up
    // around the cursor. Additive works in BOTH themes for the torch: on the
    // pale light bg a local additive bloom is the only way to actually brighten
    // motes near the pointer (the normal-blended core/halo can't add light), and
    // on dark it stacks a little extra glare. Its `aPointerColor` attribute is
    // written each frame by writeLayerColors from the proximity boost.
    // The pointer glow is a soft pool that follows the cursor. It reads its
    // per-mote intensity from the `aPointerColor` buffer (black at rest → lit
    // near the cursor), written each frame by writeLayerColors.
    //
    // MUST be ADDITIVE in both themes: additive of a black (zero) color is a
    // no-op, so motes away from the cursor stay invisible. (A normal-blended
    // sprite with a near-black color would instead paint translucent DARK
    // pixels everywhere the texture has alpha — greying out the whole field.)
    // Dark: per-mote nebula hue → a luminous torch. Light: a restrained soft
    // bloom — low opacity + tight radius keep it a gentle local lift, not the
    // full-field whiteout that a broad additive pool caused.
    const pointerGlowMat = new THREE.PointsMaterial({
      vertexColors: true,
      // Soft halo so the lit pool reads as a smooth glow, not dots. Kept
      // restrained so the pool is a gentle accent, not a wall of blobs.
      size: crisp ? 0.4 : 0.5,
      map: glowTex,
      transparent: true,
      opacity: crisp ? 0.28 : 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    // Build a group holding the core points plus their glow halo. The core and
    // glow share positions + fade timing, but the glow uses its OWN geometry
    // whose vertex `color` is the per-mote randomized glow color (`aGlowColor`
    // on the core geo) — so some stars bloom far brighter than others while the
    // core motes stay uniform.
    const buildConstellationLayer = (positions) => {
      const geo = buildGeoFromPositions(positions);

      // Glow geometry: reuse the SAME position buffer (no duplication) but give
      // it a `color` attribute backed by the core geo's glow colors, so the
      // glow material's vertexColors picks up the randomized per-star strength.
      const glowGeo = new THREE.BufferGeometry();
      glowGeo.setAttribute('position', geo.getAttribute('position'));
      glowGeo.setAttribute('color', geo.getAttribute('aGlowColor'));

      // Pointer-glow geometry: shares positions, but its `color` is the
      // dedicated `aPointerColor` buffer that writeLayerColors fills with the
      // proximity bloom (black at rest → bright near the cursor).
      const pointerGeo = new THREE.BufferGeometry();
      pointerGeo.setAttribute('position', geo.getAttribute('position'));
      pointerGeo.setAttribute('color', geo.getAttribute('aPointerColor'));

      const group = new THREE.Group();
      // Pointer-glow pool sits behind everything (drawn first): additive bloom
      // on dark, a soft dark-iris pool on light.
      group.add(new THREE.Points(pointerGeo, pointerGlowMat));
      // Randomized-strength glow halo behind the core.
      group.add(new THREE.Points(glowGeo, glowMat));
      group.add(new THREE.Points(geo, pointsMat));
      group.userData.geo = geo;
      group.userData.glowGeo = glowGeo;
      group.userData.pointerGeo = pointerGeo;
      return group;
    };

    // Krea-style staggered fade-in: the corona stars don't all appear at once.
    // Each mote reveals at its own random time over STAR_FADE_MS, ramping its
    // color from black up to its base color (works for both additive and alpha
    // blending — a darker color simply reads as fainter). Once every mote is
    // fully in, we stop rewriting the attribute (geo.userData.faded = true).
    const STAR_FADE_MS = 3400;
    const smoothstep = (x) => {
      const c = Math.max(0, Math.min(1, x));
      return c * c * (3 - 2 * c);
    };
    const advanceStarFade = (geo, elapsedMs) => {
      if (!geo || geo.userData.faded) return;
      const base = geo.userData.baseColors;
      const glowBase = geo.userData.glowBaseColors;
      const delay = geo.userData.fadeDelay;
      const span = geo.userData.fadeSpan;
      if (!base || !delay || !span) return;
      const attr = geo.getAttribute('color');
      const arr = attr.array;
      const glowAttr = geo.getAttribute('aGlowColor');
      const glowArr = glowAttr ? glowAttr.array : null;
      const p = Math.min(1, elapsedMs / STAR_FADE_MS);
      let allIn = true;
      const n = delay.length;
      for (let i = 0; i < n; i++) {
        // Local progress for this mote: (globalP - its delay) / its span.
        const f = smoothstep((p - delay[i]) / span[i]);
        if (f < 1) allIn = false;
        arr[i * 3] = base[i * 3] * f;
        arr[i * 3 + 1] = base[i * 3 + 1] * f;
        arr[i * 3 + 2] = base[i * 3 + 2] * f;
        // Ramp the randomized glow color in lockstep with the core.
        if (glowArr && glowBase) {
          glowArr[i * 3] = glowBase[i * 3] * f;
          glowArr[i * 3 + 1] = glowBase[i * 3 + 1] * f;
          glowArr[i * 3 + 2] = glowBase[i * 3 + 2] * f;
        }
      }
      attr.needsUpdate = true;
      if (glowAttr) glowAttr.needsUpdate = true;
      if (allIn && p >= 1) geo.userData.faded = true;
    };
    // When reduced motion is on, we skip the staggered reveal and show the
    // stars fully formed immediately.
    const revealInstantly = (geo) => {
      if (!geo || !geo.userData.baseColors) return;
      const attr = geo.getAttribute('color');
      attr.array.set(geo.userData.baseColors);
      attr.needsUpdate = true;
      const glowAttr = geo.getAttribute('aGlowColor');
      if (glowAttr && geo.userData.glowBaseColors) {
        glowAttr.array.set(geo.userData.glowBaseColors);
        glowAttr.needsUpdate = true;
      }
      geo.userData.faded = true;
    };

    // Initial starfield
    let points = buildConstellationLayer(buildStarfieldPositions(CLOUD_COUNT));
    constellation.add(points);

    // ── Far corona layer (depth) ─────────────────────────────────
    // A second, sparser ring pushed back and scaled a little wider, counter-
    // rotating very slowly. The parallax between the two layers gives the
    // corona real volume — more astral than a single flat disc.
    const farLayer = buildConstellationLayer(
      buildStarfieldPositions(Math.round(CLOUD_COUNT * 0.7))
    );
    farLayer.scale.setScalar(1.25);
    farLayer.position.z = -3.5;
    constellation.add(farLayer);

    // On remounts (fade already played) or reduced motion, show the stars fully
    // formed right away — otherwise they'd start black and never get rewritten.
    if (!playStarFade) {
      revealInstantly(points.userData.geo);
      revealInstantly(farLayer.userData.geo);
    }

    // Load the GLB and reshape the constellation to the logo's surface.
    const loader = new GLTFLoader();
    const modelPath =
      typeof MODEL_PATH === 'string'
        ? MODEL_PATH
        : MODEL_PATH.default || MODEL_PATH;
    let disposed = false;

    loader.load(
      modelPath,
      (gltf) => {
        if (disposed) return;
        // Merge all mesh samples, normalized to a consistent size and centered.
        const meshes = [];
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((child) => {
          if (child.isMesh) meshes.push(child);
        });
        if (!meshes.length) return;

        // Sample the logo surface only to derive an organic mote COUNT (the
        // GLB seeds the field's density); the motes are then arranged into the
        // eclipse corona ring rather than the logo silhouette.
        const PER = Math.floor(4200 / meshes.length);
        let sampled = 0;
        meshes.forEach((mesh) => {
          const world = mesh.clone();
          world.geometry = mesh.geometry.clone();
          world.geometry.applyMatrix4(mesh.matrixWorld);
          sampled += sampleSurfacePoints(world, PER).length / 3;
          world.geometry.dispose();
        });
        const fieldCount = Math.max(CLOUD_COUNT, sampled);
        const field = buildStarfieldPositions(fieldCount);

        // Swap the placeholder field for the denser, GLB-seeded starfield.
        constellation.remove(points);
        if (points.userData.geo) points.userData.geo.dispose();
        if (points.userData.glowGeo) points.userData.glowGeo.dispose();
        if (points.userData.pointerGeo) points.userData.pointerGeo.dispose();
        points = buildConstellationLayer(field);
        // Keep the fade coherent across the swap so it never flashes or pops:
        // - not fading (remount) or fade already done → show fully formed.
        // - mid-fade → seed the new geo to the CURRENT fade progress so it
        //   picks up exactly where the placeholder was instead of restarting
        //   dark (which would flicker). The loop then continues it smoothly.
        const fadeDoneMs = performance.now() - starFadeStart;
        if (!playStarFade || fadeDoneMs >= STAR_FADE_MS) {
          revealInstantly(points.userData.geo);
        } else {
          advanceStarFade(points.userData.geo, fadeDoneMs);
        }
        constellation.add(points);
      },
      undefined,
      () => {
        // On load error, keep the placeholder cloud — the scene still works.
      }
    );

    // ── Parallax from pointer (subtle) ───────────────────────────
    const mouse = { x: 0, y: 0 };
    const mouseTarget = { x: 0, y: 0 };
    // Pointer position in normalized device coords (-1..1), relative to THIS
    // container (not the whole window) so the proximity glow tracks the cursor
    // accurately even when the panel is a side column. `pointerInside` gates
    // the glow off when the cursor leaves the background.
    const pointerNdc = new THREE.Vector2(0, 0);
    let pointerInside = false;
    const onMouseMove = (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      pointerNdc.x = nx * 2 - 1;
      pointerNdc.y = -(ny * 2 - 1);
      pointerInside = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;
    };
    if (!reduceMotion) window.addEventListener('mousemove', onMouseMove);

    // ── Pointer-proximity glow ───────────────────────────────────
    // Motes within a radius of the cursor bloom brighter — a soft "torch" that
    // lights the starfield around the pointer. Each frame we raycast the
    // pointer onto each layer's local z-plane, then rewrite every mote's color
    // as base * fade * (1 + boost·falloff): a single pass that OWNS the color
    // write (it folds in the staggered fade-in factor so we don't fight
    // advanceStarFade — see the animate loop). The boost is largest at the
    // cursor and smoothly decays to 0 at GLOW_RADIUS.
    const raycaster = new THREE.Raycaster();
    // Reusable scratch objects (no per-frame allocation).
    const glowPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitWorld = new THREE.Vector3();
    const hitLocal = new THREE.Vector3();
    const layerWorld = new THREE.Vector3();
    // Radius (world units) of the lit pool around the cursor. Kept fairly
    // tight so the glow is a localized pool under the cursor, not the whole
    // field lighting up.
    const GLOW_RADIUS = 2.2;
    // Boost multiplier at the cursor centre. Kept modest for a subtle glow
    // (dialed back per "slightly less glow"). Slightly gentler on light.
    const GLOW_BOOST = crisp ? 1.2 : 1.6;
    // Light-mode pool tint — a soft iris that, added over the pale bg near the
    // cursor, lifts into a gentle lavender bloom (not white). Kept mid-toned so
    // a little additive goes a long way without blowing out.
    const lightPoolColor = new THREE.Color('#8a78e8');
    // Smoothed 0→1 strength so the pool fades in/out as the cursor enters and
    // leaves the background instead of snapping. `glowWasActive` gives us one
    // extra write frame after the pool fully fades so the last boosted colors
    // get reset back to their resting base values.
    let glowStrength = 0;
    let glowWasActive = false;

    // Resolve the pointer's position in a layer's LOCAL space (the layer is
    // scaled + z-offset). Writes into `hitLocal`; returns false if the ray
    // misses the plane. Call once per layer per frame.
    const resolvePointerLocal = (layer) => {
      raycaster.setFromCamera(pointerNdc, camera);
      layer.getWorldPosition(layerWorld);
      glowPlane.constant = -layerWorld.z; // plane at the layer's world depth
      if (!raycaster.ray.intersectPlane(glowPlane, hitWorld)) return false;
      layer.worldToLocal(hitLocal.copy(hitWorld));
      return true;
    };

    // Single color-write pass for one layer: color = base·fade·(1 + boost).
    // `fadeElapsedMs` drives the staggered reveal (null → fully revealed).
    // `strength` (0..1) scales the whole proximity boost.
    const writeLayerColors = (layer, fadeElapsedMs, strength, applyPointer) => {
      const geo = layer.userData.geo;
      if (!geo || !geo.userData.baseColors) return;
      const base = geo.userData.baseColors;
      const glowBase = geo.userData.glowBaseColors;
      const delay = geo.userData.fadeDelay;
      const span = geo.userData.fadeSpan;
      const parr = geo.getAttribute('position').array;
      const colorAttr = geo.getAttribute('color');
      const glowAttr = geo.getAttribute('aGlowColor');
      const pointerAttr = geo.getAttribute('aPointerColor');
      const arr = colorAttr.array;
      const glowArr = glowAttr ? glowAttr.array : null;
      const pointerArr = pointerAttr ? pointerAttr.array : null;

      const hasPointer =
        applyPointer && strength > 0.001 && resolvePointerLocal(layer);
      const r2 = GLOW_RADIUS * GLOW_RADIUS;
      const fadeP =
        fadeElapsedMs == null ? 1 : Math.min(1, fadeElapsedMs / STAR_FADE_MS);
      const n = base.length / 3;
      for (let i = 0; i < n; i++) {
        // Per-mote staggered fade factor (0 dark → 1 full).
        const fade =
          fadeElapsedMs == null
            ? 1
            : smoothstep((fadeP - delay[i]) / span[i]);
        // Radial proximity boost around the cursor.
        let boost = 0;
        if (hasPointer) {
          const dx = parr[i * 3] - hitLocal.x;
          const dy = parr[i * 3 + 1] - hitLocal.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const f = 1 - d2 / r2; // 1 at cursor → 0 at radius
            boost = f * f * GLOW_BOOST * strength;
          }
        }
        if (crisp) {
          // LIGHT MODE — leave the crisp motes and their lavender halo at their
          // resting look (brightening a normal-blended mote just pushes it pale
          // and washes it out)…
          arr[i * 3] = base[i * 3] * fade;
          arr[i * 3 + 1] = base[i * 3 + 1] * fade;
          arr[i * 3 + 2] = base[i * 3 + 2] * fade;
          if (glowArr && glowBase) {
            glowArr[i * 3] = glowBase[i * 3] * fade;
            glowArr[i * 3 + 1] = glowBase[i * 3 + 1] * fade;
            glowArr[i * 3 + 2] = glowBase[i * 3 + 2] * fade;
          }
          // …and carry the glow via the additive pointer pool: a soft iris tint
          // scaled by the radial boost (0 at rest → full near the cursor), so a
          // gentle lavender bloom lifts the field only under the cursor.
          if (pointerArr) {
            const p = fade * Math.min(1, boost);
            pointerArr[i * 3] = lightPoolColor.r * p;
            pointerArr[i * 3 + 1] = lightPoolColor.g * p;
            pointerArr[i * 3 + 2] = lightPoolColor.b * p;
          }
        } else {
          // DARK MODE — additive bloom. Brighten the core a touch and drive the
          // dedicated additive pointer layer for a luminous torch of light.
          const core = fade * (1 + boost);
          arr[i * 3] = base[i * 3] * core;
          arr[i * 3 + 1] = base[i * 3 + 1] * core;
          arr[i * 3 + 2] = base[i * 3 + 2] * core;
          if (glowArr && glowBase) {
            const halo = fade * (1 + boost * 1.5);
            glowArr[i * 3] = glowBase[i * 3] * halo;
            glowArr[i * 3 + 1] = glowBase[i * 3 + 1] * halo;
            glowArr[i * 3 + 2] = glowBase[i * 3 + 2] * halo;
          }
          if (pointerArr) {
            const p = fade * boost;
            pointerArr[i * 3] = base[i * 3] * p;
            pointerArr[i * 3 + 1] = base[i * 3 + 1] * p;
            pointerArr[i * 3 + 2] = base[i * 3 + 2] * p;
          }
        }
      }
      colorAttr.needsUpdate = true;
      if (glowAttr) glowAttr.needsUpdate = true;
      if (pointerAttr) pointerAttr.needsUpdate = true;
    };

    // ── Resize ───────────────────────────────────────────────────
    // Don't resize the renderer directly in the observer/event callback — that
    // reallocates and clears the framebuffer outside the RAF loop, which shows
    // as a blank flicker while the panel animates. Instead just flag the new
    // size; the animate loop applies it right before the next paint so the
    // particles slide/re-centre smoothly without ever disappearing.
    let needsResize = false;
    const onResize = () => {
      needsResize = true;
    };
    const applyResizeIfNeeded = () => {
      if (!needsResize) return;
      needsResize = false;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === width && h === height) return;
      width = w;
      height = h;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    let resizeObserver;
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', onResize);
    }

    // ── Animate ──────────────────────────────────────────────────
    let t = 0;
    // Intro: the corona spins in and coalesces into the ring, then settles.
    // Plays ONCE per page load (guarded by hasIntroPlayed) and is skipped for
    // reduced-motion. On remounts (tab open, theme change) it's already played,
    // so the scene appears fully formed with no re-animation.
    const INTRO_MS = 2000;
    const playIntro = !hasIntroPlayed && !reduceMotion;
    // The staggered star fade-in rides along with the intro: it plays on the
    // first mount of a page load and is skipped on remounts (already faded).
    const playStarFade = playIntro;
    hasIntroPlayed = true;
    const introStart = performance.now();
    const starFadeStart = introStart;
    // easeOutQuint for a smoother, longer-settling glide (less abrupt than the
    // cubic wind-down) — suits the calmer wormhole intro.
    const easeOut = (x) => 1 - Math.pow(1 - x, 5);
    const render = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      // Apply any pending container resize just before painting, so the canvas
      // follows the panel without a blank frame.
      applyResizeIfNeeded();
      t += 0.0038;

      // Ease the proximity-glow strength toward its target so the pool clearly
      // TRANSITIONS IN on hover and fades back out when the cursor leaves — a
      // gentle ramp, not a snap. Fade-out is a touch slower than fade-in for a
      // soft trailing glow.
      const glowTargetNow = pointerInside ? 1 : 0;
      const ease = pointerInside ? 0.06 : 0.04;
      glowStrength += (glowTargetNow - glowStrength) * ease;

      // Star colors: a single pass per layer folds the staggered fade-in AND
      // the pointer-proximity glow into one write. We keep writing while the
      // fade is still running or the glow pool is active (or lingering just
      // after the cursor leaves), then leave the buffers at their resting base
      // colors once nothing is animating them — no per-frame work at idle.
      const fadeElapsed = playStarFade
        ? performance.now() - starFadeStart
        : null;
      const fading = playStarFade && fadeElapsed < STAR_FADE_MS;
      const glowActive = glowStrength > 0.002 || glowWasActive;
      glowWasActive = glowStrength > 0.002;
      if (fading || glowActive) {
        const fadeArg = fading ? fadeElapsed : null;
        // Only the NEAR layer gets the pointer pool — the far layer is scaled +
        // pushed back, so a second pool there just smears the effect. It still
        // gets the fade write.
        writeLayerColors(points, fadeArg, glowStrength, true);
        writeLayerColors(farLayer, fadeArg, glowStrength, false);
      }

      // Smooth the parallax.
      mouse.x += (mouseTarget.x - mouse.x) * 0.04;
      mouse.y += (mouseTarget.y - mouse.y) * 0.04;

      // Intro progress (0→1) — a decelerating spin + swell that forms the ring.
      const introP = playIntro
        ? easeOut(Math.min(1, (performance.now() - introStart) / INTRO_MS))
        : 1;
      // Start near full size and settle — a gentle swell, NOT a deep zoom. A
      // big draw-in would shrink the field enough to reveal its rectangular
      // container edges; keeping the scale high means the starfield always
      // overfills the frame so the box is never visible. The per-star fade-in
      // carries the reveal instead.
      const introScale = 0.94 + 0.06 * introP;
      // A shallow forward glide only — small enough that the field stays
      // full-frame throughout (no deep pull-in that would expose the edges).
      const introZ = (1 - introP) * -1.2;

      // Fade the whole canvas into the scene — a global opacity ramp on top of
      // the per-mote color fade. This is what removes the first-load flash: the
      // scene eases up from fully transparent no matter what the particles are
      // doing underneath (placeholder → GLB swap). Reaches full a bit early so
      // the field is present while individual stars keep twinkling in.
      renderer.domElement.style.opacity = String(Math.min(1, introP * 1.3));

      // Fade the DOM overlays (blur + vignette) in with the stars so the
      // soft-focus haze and edge fade ramp up rather than snapping on. No
      // scale/zoom — just opacity.
      if (blurRef.current) {
        blurRef.current.style.opacity = String(introP);
      }
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = String(introP);
      }

      // No rotation — the starfield stays still in-plane; only the gentle
      // depth swell + pointer parallax move it.
      constellation.rotation.set(0, 0, 0);
      // Gentle, slow swell — smoothed (small amplitude, long period) so the
      // tunnel breathes calmly instead of pulsing.
      const breathe = 1 + Math.sin(t * 0.5) * 0.015;
      constellation.scale.setScalar(breathe * introScale);
      // Zoom-into: the near ring drifts slowly toward the camera and back on a
      // long, smooth cycle — a deep, calm swell in depth that reads as flying
      // into the tunnel. Sinusoidal (not a hard wrap) so it never pops; the two
      // layers share materials, so a fade-and-wrap would flicker. Large travel
      // + slow rate makes the zoom the dominant motion.
      const nearTravel = Math.sin(t * 0.2) * 0.8;
      constellation.position.z = nearTravel + introZ;

      // A little parallax drift of the whole field toward the pointer.
      constellation.position.x = mouse.x * 0.25;
      constellation.position.y = 0.2 - mouse.y * 0.18;

      // Far layer also stays still in-plane; it swells in depth on the OPPOSITE
      // phase to the near field so the parallax between them keeps a little
      // depth without any rotation.
      farLayer.rotation.z = 0;
      const farTravel = -3.5 - Math.sin(t * 0.2) * 0.8;
      farLayer.position.z = farTravel + introZ * 1.3;
      farLayer.scale.setScalar(
        // Keep the far layer near full size too (0.94→1) so it never shrinks
        // enough to expose its container edges during the intro.
        1.25 * (1 + Math.sin(t * 0.5 + 1.5) * 0.015) * (0.94 + 0.06 * introP)
      );

      // The per-mote color fade (advanceStarFade) drives the staggered star
      // reveal, so the star MATERIAL opacity is NOT gated by introP anymore —
      // otherwise the whole field would also cross-fade as a block and wash out
      // the "stars appearing one by one" look. The aura/bloom still ride introP.
      // Star twinkle — two out-of-phase shimmer waves so the field sparkles
      // unevenly, like real starlight rather than one global pulse.
      if (crisp) {
        const tw = 0.9 + Math.sin(t * 1.4) * 0.1;
        pointsMat.opacity = tw;
        // Crisp light halo is a fixed light-lavender tint (no vertex colors),
        // so it can't ride the per-mote color fade — gate its opacity with
        // introP instead so the soft purple bloom fades in with the stars.
        glowMat.opacity = 0.3 * (0.85 + Math.sin(t * 1.1) * 0.15) * introP;
      } else {
        const twinkle =
          0.84 + Math.sin(t * 1.6) * 0.1 + Math.sin(t * 0.7) * 0.06;
        pointsMat.opacity = 0.9 * twinkle;
        // Enhanced glow — a stronger additive bloom so each star carries more
        // glare (was 0.12).
        glowMat.opacity = 0.2 * (twinkle + 0.1);
      }

      // Deep starfield parallax — drifts opposite the pointer for depth.
      stars.rotation.z = t * 0.02;
      stars.position.x = -mouse.x * 0.6;
      stars.position.y = mouse.y * 0.4;

      // Camera easing toward pointer for a touch of parallax depth.
      camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      render();
    };

    if (reduceMotion) {
      // Static, composed single frame. No RAF loop, so re-apply size + repaint
      // directly when the container resizes.
      constellation.rotation.set(0, 0, 0);
      // No animate loop to fade them in, so show the canvas + overlays fully.
      renderer.domElement.style.opacity = '1';
      if (blurRef.current) blurRef.current.style.opacity = '1';
      if (vignetteRef.current) vignetteRef.current.style.opacity = '1';
      render();
      const staticResize = () => {
        onResize();
        applyResizeIfNeeded();
        render();
      };
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = new ResizeObserver(staticResize);
        resizeObserver.observe(container);
      } else {
        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', staticResize);
      }
    } else {
      animate();
    }

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      disposed = true;
      if (!reduceMotion) window.removeEventListener('mousemove', onMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameRef.current);
      starGeo.dispose();
      starMat.dispose();
      if (points && points.userData.geo) points.userData.geo.dispose();
      if (points && points.userData.glowGeo) points.userData.glowGeo.dispose();
      if (points && points.userData.pointerGeo)
        points.userData.pointerGeo.dispose();
      if (farLayer && farLayer.userData.geo) farLayer.userData.geo.dispose();
      if (farLayer && farLayer.userData.glowGeo)
        farLayer.userData.glowGeo.dispose();
      if (farLayer && farLayer.userData.pointerGeo)
        farLayer.userData.pointerGeo.dispose();
      pointsMat.dispose();
      glowMat.dispose();
      pointerGlowMat.dispose();
      glowTex.dispose();
      starTex.dispose();
      if (dotTex) dotTex.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="mcpHome__spaceBg"
      aria-hidden="true"
      style={{
        // Fill the home container (.mcpHome) rather than the whole viewport, so
        // the eclipse stays centred on the greeting/input block even when a tab
        // opens and this panel shrinks to a side column.
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
      {/* Blur layer — sits above the star canvas and softens it into a
          dreamy, out-of-focus glow. backdrop-filter blurs everything painted
          behind it (the stars); it's fully transparent otherwise so it adds no
          tint of its own. Below the vignette and the greeting content. */}
      <div
        ref={blurRef}
        className="mcpHome__spaceBlur"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          WebkitBackdropFilter: 'blur(0.8px)',
          backdropFilter: 'blur(0.8px)',
          // Fade in with the stars (driven from the animate loop). No scale.
          opacity: 0,
          willChange: 'opacity',
        }}
      />
      {/* Vignette in the background color — fades the particles out toward the
          container edges so the field dissolves softly instead of hard-
          clipping. The gradient (theme bg at the rim → transparent centre) is
          set in the effect where the palette is known. Sits above the blur,
          below the greeting content. */}
      <div
        ref={vignetteRef}
        className="mcpHome__spaceVignette"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          // Fade in with the stars (driven from the animate loop). No scale.
          opacity: 0,
          willChange: 'opacity',
        }}
      />
    </div>
  );
};
