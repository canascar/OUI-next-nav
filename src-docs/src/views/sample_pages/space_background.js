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
    container.appendChild(renderer.domElement);

    const glowTex = makeGlowTexture();
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

    // ── Central aura (soft glowing sprite behind the logo) ───────
    // Always additive so it reads as a luminous bloom (a normal-blended sprite
    // would look like a flat smudge).
    const auraMat = new THREE.SpriteMaterial({
      map: glowTex,
      color: palette.core.getHex(),
      transparent: true,
      // Crisp light mode has no glow, so the central bloom is off.
      opacity: crisp ? 0 : 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const aura = new THREE.Sprite(auraMat);
    // Sized to bloom around the corona ring — the diffuse glare behind it.
    aura.scale.set(18, 18, 1);
    aura.position.set(0, 0.2, -4);
    aura.visible = !crisp;
    scene.add(aura);

    // ── Nebula haze clouds ───────────────────────────────────────
    // A few large, soft, colored additive sprites drifting behind the corona
    // give the scene a celestial, nebula-like depth rather than a plain ring.
    const nebulaCloudMats = [];
    const nebulaCloudSprites = [];
    // Skip the additive haze clouds in crisp light mode (they only muddy a
    // light backdrop).
    (crisp ? [] : palette.nebulaClouds || []).forEach((hex, i) => {
      const m = new THREE.SpriteMaterial({
        map: glowTex,
        color: new THREE.Color(hex),
        transparent: true,
        // Much fainter in light mode — additive haze piles up to white on a
        // pale backdrop and washes out the depth.
        opacity: palette.additive ? 0.22 : 0.05,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const s = new THREE.Sprite(m);
      const ang = (i / (palette.nebulaClouds.length || 1)) * Math.PI * 2 + 0.6;
      const rad = 4.6 * (0.7 + (i % 2) * 0.5); // ~corona radius, spread around
      s.scale.set(16 + i * 3, 16 + i * 3, 1);
      s.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.7, -6 - i);
      s.userData.baseAng = ang;
      s.userData.rad = rad;
      scene.add(s);
      nebulaCloudMats.push(m);
      nebulaCloudSprites.push(s);
    });

    // ── Eclipse occluding disc (the "moon") ──────────────────────
    // A dark circle in front of the corona so the centre stays calm and the
    // input content reads against shadow. Uses a soft-edged radial texture so
    // it feathers into the surrounding glare instead of a hard cutout.
    const discTex = (() => {
      const size = 128;
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
      // Solid dark core that holds most of the disc, then a tight feather at
      // the rim — a crisper eclipse shadow that clearly occludes the centre.
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.74, 'rgba(255,255,255,1)');
      g.addColorStop(0.9, 'rgba(255,255,255,0.85)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    })();
    const discMat = new THREE.SpriteMaterial({
      map: discTex,
      color: new THREE.Color(palette.disc),
      transparent: true,
      opacity: palette.discOpacity,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const disc = new THREE.Sprite(discMat);
    // A touch larger than the corona's inner edge so it clearly occludes the
    // inner particles — the shadow eats into the ring rather than sitting inside
    // an empty hole. Its solid core (~0.74 of radius) lands right at the rim.
    disc.scale.set(RING_RADIUS * 2.5, RING_RADIUS * 2.5, 1);
    disc.position.set(0, 0.2, 1.5); // in front of the corona
    scene.add(disc);

    // ── Eclipse corona ───────────────────────────────────────────
    // The particles form a glaring ring (corona) centred on the input. A dark
    // occluding disc (the "moon") sits in the middle so the input content reads
    // against calm darkness while light blazes around it.
    const constellation = new THREE.Group();
    constellation.position.set(0, 0.2, 0);
    scene.add(constellation);

    // Radius of the corona ring in world units. Sized so the dark centre
    // comfortably frames the greeting + input block.
    const RING_RADIUS = 4.6;

    // Lay `count` motes into a camera-facing annulus: dense at RING_RADIUS with
    // a soft inner/outer falloff, plus radial "streamers" flaring outward like
    // a real corona. Returns a flat xyz Float32Array.
    const buildCoronaPositions = (count) => {
      const out = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        // Bias radius toward the ring: base radius + a two-sided exponential
        // spread so density peaks at RING_RADIUS and streams outward.
        const u = Math.random();
        const spread =
          (Math.random() < 0.5 ? -1 : 1) * Math.pow(Math.random(), 1.7);
        // Tight inward feathering (particles hug the shadow's rim and get
        // occluded), long outward flares for the corona streamers.
        const radial = spread < 0 ? spread * 0.6 : spread * 3.6;
        const r = RING_RADIUS + radial;
        // Occasional long streamers for drama.
        const streamer = u > 0.86 ? Math.pow(Math.random(), 2) * 4.5 : 0;
        const rr = Math.max(0.2, r + streamer);
        out[i * 3] = Math.cos(ang) * rr;
        out[i * 3 + 1] = Math.sin(ang) * rr;
        // Thin in depth so it reads as a flat corona disc, with a little
        // volume for parallax shimmer.
        out[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
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
      // rather than one flat hue.
      const colors = new Float32Array(n * 3);
      const c = new THREE.Color();
      for (let i = 0; i < n; i++) {
        sizes[i] = 0.05 + Math.random() * 0.14;
        c.copy(pickNebulaColor());
        // Slight per-mote brightness jitter for depth/twinkle at rest.
        const b = 0.75 + Math.random() * 0.25;
        colors[i * 3] = c.r * b;
        colors[i * 3 + 1] = c.g * b;
        colors[i * 3 + 2] = c.b * b;
      }
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      return geo;
    };

    // Core particle material — the crisp mote. On light mode this is normal-
    // blended so the purple reads darker than the pale backdrop.
    const pointsMat = new THREE.PointsMaterial({
      vertexColors: true, // per-mote nebula hues
      // Crisp mode: solid dots with a soft glow halo baked into the texture.
      size: crisp ? 0.18 : 0.26,
      map: moteTex,
      transparent: true,
      opacity: crisp ? 1 : 0.9,
      depthWrite: false,
      blending: blendMode,
      sizeAttenuation: true,
    });

    // Additive glow material — a larger, softer, lower-opacity halo rendered on
    // top of the core so both themes get the heavy glare/bloom. Additive on a
    // light backdrop adds a gentle luminous bloom without washing the motes out.
    const glowMat = new THREE.PointsMaterial({
      vertexColors: true, // per-mote nebula hues in the halo too
      // In dark mode the core is already additive and glows on its own, so the
      // extra halo is kept light to avoid a blown-out wash; in light mode the
      // core is normal-blended, so this additive halo IS the glare and carries
      // more weight.
      size: palette.additive ? 0.42 : 0.5,
      map: glowTex,
      transparent: true,
      // Dark: full glow. Crisp light: a restrained additive halo for a touch of
      // glare/bloom over the solid dots, kept low so it doesn't wash out.
      opacity: palette.additive ? 0.18 : 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    // Build a group holding the core points plus their additive glow, sharing
    // one geometry. Used for both the placeholder cloud and the logo field.
    const buildConstellationLayer = (positions) => {
      const geo = buildGeoFromPositions(positions);
      const group = new THREE.Group();
      // Additive glow halo behind the core — full bloom in dark mode, a
      // restrained glare in crisp light mode (low opacity, see glowMat).
      group.add(new THREE.Points(geo, glowMat));
      group.add(new THREE.Points(geo, pointsMat));
      group.userData.geo = geo;
      return group;
    };

    // Initial corona ring
    let points = buildConstellationLayer(buildCoronaPositions(CLOUD_COUNT));
    constellation.add(points);

    // ── Far corona layer (depth) ─────────────────────────────────
    // A second, sparser ring pushed back and scaled a little wider, counter-
    // rotating very slowly. The parallax between the two layers gives the
    // corona real volume — more astral than a single flat disc.
    const farLayer = buildConstellationLayer(
      buildCoronaPositions(Math.round(CLOUD_COUNT * 0.7))
    );
    farLayer.scale.setScalar(1.25);
    farLayer.position.z = -3.5;
    constellation.add(farLayer);

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
        const coronaCount = Math.max(CLOUD_COUNT, sampled);
        const corona = buildCoronaPositions(coronaCount);

        // Swap the placeholder ring for the denser, GLB-seeded corona.
        constellation.remove(points);
        if (points.userData.geo) points.userData.geo.dispose();
        points = buildConstellationLayer(corona);
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
    const onMouseMove = (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduceMotion) window.addEventListener('mousemove', onMouseMove);

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
    hasIntroPlayed = true;
    const introStart = performance.now();
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

      // Smooth the parallax.
      mouse.x += (mouseTarget.x - mouse.x) * 0.04;
      mouse.y += (mouseTarget.y - mouse.y) * 0.04;

      // Intro progress (0→1) — a decelerating spin + swell that forms the ring.
      const introP = playIntro
        ? easeOut(Math.min(1, (performance.now() - introStart) / INTRO_MS))
        : 1;
      // Extra spin that unwinds as it settles — fewer turns than before so the
      // intro glides open like a tunnel rather than winding down like a drain.
      const introSpin = (1 - introP) * Math.PI * 2;
      // Swells from a tighter core out to full size — a deeper draw-in reads
      // more like rushing out of a wormhole than a flat swirl expanding.
      const introScale = 0.25 + 0.75 * introP;

      // Wormhole drift: the ring barely turns in its own plane — a very slow
      // astral rotation, not a whirlpool swirl. The motion is dominated by the
      // continuous zoom into depth (below), so it reads as flying into a tunnel
      // rather than water spinning down a drain. Intro spin adds on top.
      constellation.rotation.set(0, 0, t * 0.025 + introSpin);
      // Gentle, slow swell — smoothed (small amplitude, long period) so the
      // tunnel breathes calmly instead of pulsing.
      const breathe = 1 + Math.sin(t * 0.5) * 0.015;
      constellation.scale.setScalar(breathe * introScale);
      // Zoom-into: the near ring drifts slowly toward the camera and back on a
      // long, smooth cycle — a deep, calm swell in depth that reads as flying
      // into the tunnel. Sinusoidal (not a hard wrap) so it never pops; the two
      // layers share materials, so a fade-and-wrap would flicker. Large travel
      // + slow rate makes the zoom the dominant motion.
      const nearTravel = Math.sin(t * 0.22) * 1.8;
      constellation.position.z = nearTravel;

      // A little parallax drift of the whole eclipse toward the pointer.
      constellation.position.x = mouse.x * 0.25;
      constellation.position.y = 0.2 - mouse.y * 0.18;
      disc.position.x = mouse.x * 0.25;
      disc.position.y = 0.2 - mouse.y * 0.18;
      aura.position.x = mouse.x * 0.25;
      aura.position.y = 0.2 - mouse.y * 0.18;

      // Corona glare pulses. Strong additive bloom in dark mode; kept low in
      // light mode so the centre keeps its gradient depth instead of blowing
      // Far corona layer turns the SAME slow direction as the near ring (no
      // counter-spin — that clash is what read as a churning whirlpool), even
      // slower. It swells in depth on the OPPOSITE phase to the near ring, so
      // as the near ring zooms toward you the far ring recedes — the parallax
      // between them deepens the tunnel and strengthens the zoom-into feel.
      farLayer.rotation.z = t * 0.018 + introSpin * 1.15;
      const farTravel = -3.5 - Math.sin(t * 0.22) * 1.8;
      farLayer.position.z = farTravel;
      farLayer.scale.setScalar(
        1.25 * (1 + Math.sin(t * 0.5 + 1.5) * 0.015) * (0.3 + 0.7 * introP)
      );

      if (crisp) {
        // Crisp light mode: solid motes + a faint additive glare that gently
        // shimmers. Fade in during the intro.
        const tw = 0.9 + Math.sin(t * 1.4) * 0.1;
        pointsMat.opacity = tw * introP;
        glowMat.opacity = 0.1 * (0.7 + Math.sin(t * 1.1) * 0.3) * introP;
      } else {
        aura.material.opacity = (0.65 + Math.sin(t * 1.6) * 0.18) * introP;
        // Astral twinkle: two out-of-phase shimmer waves so the corona
        // sparkles unevenly, like real starlight rather than one global pulse.
        const twinkle =
          0.84 + Math.sin(t * 1.6) * 0.1 + Math.sin(t * 0.7) * 0.06;
        pointsMat.opacity = 0.9 * twinkle * introP;
        glowMat.opacity = 0.18 * (twinkle + 0.1) * introP;
      }

      // Nebula clouds drift slowly on their own orbits + breathe in opacity,
      // giving the backdrop a living, celestial depth.
      nebulaCloudSprites.forEach((s, i) => {
        const a = s.userData.baseAng + t * (0.03 + i * 0.01);
        const rad = s.userData.rad;
        s.position.x = Math.cos(a) * rad + mouse.x * 0.15;
        s.position.y = Math.sin(a) * rad * 0.7 - mouse.y * 0.1 + 0.2;
        s.material.opacity =
          (palette.additive ? 0.22 : 0.05) *
          (0.7 + Math.sin(t * 0.6 + i * 1.3) * 0.3);
      });

      // Starfield parallax — drifts opposite the pointer for depth.
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
      if (farLayer && farLayer.userData.geo) farLayer.userData.geo.dispose();
      pointsMat.dispose();
      glowMat.dispose();
      auraMat.dispose();
      discMat.dispose();
      discTex.dispose();
      nebulaCloudMats.forEach((m) => m.dispose());
      glowTex.dispose();
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
      {/* Vignette in the background color — fades the particles out toward the
          container edges so the corona dissolves softly instead of hard-
          clipping. The gradient (theme bg at the rim → transparent centre) is
          set in the effect where the palette is known. Sits above the canvas,
          below the greeting content. */}
      <div
        ref={vignetteRef}
        className="mcpHome__spaceVignette"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
