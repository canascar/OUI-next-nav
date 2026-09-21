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
    core: new THREE.Color('#7C5CFF'), // oui-next secondary (iris)
    accent: new THREE.Color('#9D8BFF'), // oui-next dark primary (violet)
    spark: new THREE.Color('#c4b8ff'), // lighter violet for far stars
    fog: new THREE.Color('#0b0916'),
    bg: '#0b0912', // deep violet-black backdrop
    additive: true,
  },
  // Light theme: same heavy-glare additive treatment. White particles/stars
  // over a violet background glow (aura) so the white motes read against the
  // tinted bloom on the darker violet-tinted canvas.
  // Normal (alpha) blend here — additive can only lighten, so to read as
  // darker purple motes they must paint over a lighter backdrop.
  light: {
    core: new THREE.Color('#8f7be0'), // soft iris glow for the aura
    accent: new THREE.Color('#8163d6'), // deeper purple particles
    spark: new THREE.Color('#9a83e4'), // slightly lighter far stars
    fog: new THREE.Color('#f3f1fb'),
    bg: '#efecf9', // lighter, faintly violet backdrop
    additive: false,
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
 * SpaceBackground — a full-bleed animated WebGL scene meant to sit behind the
 * home greeting. A constellation of glowing points, shaped from the OpenSearch
 * logo geometry, drifts and breathes over a deep starfield with a soft central
 * aura. Colors follow the active theme; the whole thing is decorative and never
 * captures pointer events. Honors prefers-reduced-motion (renders one frame).
 */
export const SpaceBackground = () => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const palette = isDark ? PALETTES.dark : PALETTES.light;
    // Paint a darker, violet-tinted backdrop behind the transparent canvas so
    // the additive glow has something to bloom against.
    container.style.backgroundColor = palette.bg;
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
      size: 0.12,
      map: glowTex,
      transparent: true,
      opacity: 0.95,
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
      opacity: palette.additive ? 0.7 : 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const aura = new THREE.Sprite(auraMat);
    // Large enough to bleed past the frame edges for an enveloping glow.
    aura.scale.set(26, 26, 1);
    aura.position.set(0, 0.4, -4);
    scene.add(aura);

    // ── Constellation shaped from the logo geometry ──────────────
    // Group is rotated for the slow drift; points live inside it. Pushed
    // upward and deeper so the dense logo band reads as an aura behind the
    // greeting rather than a stripe across the input box.
    const constellation = new THREE.Group();
    constellation.position.set(0, 0.2, 0);
    scene.add(constellation);

    // Placeholder while the GLB streams in — a gentle spherical cloud so the
    // scene never looks empty on slow loads.
    const CLOUD_COUNT = 2600;
    const buildGeoFromPositions = (positions) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      // Per-point size variance for a more organic, twinkling field.
      const n = positions.length / 3;
      const sizes = new Float32Array(n);
      for (let i = 0; i < n; i++) sizes[i] = 0.05 + Math.random() * 0.14;
      geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      return geo;
    };

    // Core particle material — the crisp mote. On light mode this is normal-
    // blended so the purple reads darker than the pale backdrop.
    const pointsMat = new THREE.PointsMaterial({
      color: palette.accent.getHex(),
      size: 0.26,
      map: glowTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: blendMode,
      sizeAttenuation: true,
    });

    // Additive glow material — a larger, softer, lower-opacity halo rendered on
    // top of the core so both themes get the heavy glare/bloom. Additive on a
    // light backdrop adds a gentle luminous bloom without washing the motes out.
    const glowMat = new THREE.PointsMaterial({
      color: palette.accent.getHex(),
      // In dark mode the core is already additive and glows on its own, so the
      // extra halo is kept light to avoid a blown-out wash; in light mode the
      // core is normal-blended, so this additive halo IS the glare and carries
      // more weight.
      size: palette.additive ? 0.42 : 0.52,
      map: glowTex,
      transparent: true,
      opacity: palette.additive ? 0.18 : 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    // Build a group holding the core points plus their additive glow, sharing
    // one geometry. Used for both the placeholder cloud and the logo field.
    const buildConstellationLayer = (positions) => {
      const geo = buildGeoFromPositions(positions);
      const group = new THREE.Group();
      const core = new THREE.Points(geo, pointsMat);
      const glow = new THREE.Points(geo, glowMat);
      group.add(glow); // glow behind the crisp core
      group.add(core);
      group.userData.geo = geo;
      return group;
    };

    // Initial cloud
    const cloudPos = new Float32Array(CLOUD_COUNT * 3);
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const r = 6.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      cloudPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      cloudPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      cloudPos[i * 3 + 2] = r * Math.cos(phi);
    }
    let points = buildConstellationLayer(cloudPos);
    constellation.add(points);

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

        // A large constellation of motes so the field stays dense even when
        // spread across the whole frame.
        const PER = Math.floor(4200 / meshes.length);
        const collected = [];
        meshes.forEach((mesh) => {
          const world = mesh.clone();
          world.geometry = mesh.geometry.clone();
          world.geometry.applyMatrix4(mesh.matrixWorld);
          collected.push(sampleSurfacePoints(world, PER));
          world.geometry.dispose();
        });
        const totalPts = collected.reduce((s, arr) => s + arr.length / 3, 0);
        const merged = new Float32Array(totalPts * 3);
        let off = 0;
        collected.forEach((arr) => {
          merged.set(arr, off);
          off += arr.length;
        });

        // Center + normalize scale.
        const box = new THREE.Box3();
        const v = new THREE.Vector3();
        for (let i = 0; i < merged.length; i += 3) {
          v.set(merged[i], merged[i + 1], merged[i + 2]);
          box.expandByPoint(v);
        }
        const center = box.getCenter(new THREE.Vector3());
        const sizeVec = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
        // Large enough that the logo cloud fills the frame and spills well
        // past every edge.
        const scale = 14 / maxDim;
        for (let i = 0; i < merged.length; i += 3) {
          merged[i] = (merged[i] - center.x) * scale;
          merged[i + 1] = (merged[i + 1] - center.y) * scale;
          merged[i + 2] = (merged[i + 2] - center.z) * scale;
          // Heavy off-surface scatter — especially in depth — so motes pass
          // near (large) and far (tiny), giving the field real volume and
          // parallax rather than reading as a flat shell.
          merged[i] += (Math.random() - 0.5) * 1.6;
          merged[i + 1] += (Math.random() - 0.5) * 1.6;
          merged[i + 2] += (Math.random() - 0.5) * 6.0;
        }

        // Swap the placeholder cloud for the logo-shaped field.
        constellation.remove(points);
        if (points.userData.geo) points.userData.geo.dispose();
        points = buildConstellationLayer(merged);
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
    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
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
    const render = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.0038;

      // Smooth the parallax.
      mouse.x += (mouseTarget.x - mouse.x) * 0.04;
      mouse.y += (mouseTarget.y - mouse.y) * 0.04;

      // Slow orbital drift + gentle breathing scale. A steady tilt keeps the
      // logo presenting its broad face at a 3/4 angle for volume.
      constellation.rotation.y = 0.6 + Math.sin(t * 0.35) * 0.4 + mouse.x * 0.2;
      constellation.rotation.x =
        -0.15 + Math.sin(t * 0.5) * 0.08 - mouse.y * 0.14;
      const breathe = 1 + Math.sin(t * 1.3) * 0.03;
      constellation.scale.setScalar(breathe);

      // Aura pulses softly — strong additive bloom in both themes.
      aura.material.opacity = 0.65 + Math.sin(t * 1.6) * 0.18;

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
      // Static, composed single frame.
      constellation.rotation.set(0.1, 0.5, 0);
      render();
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
      pointsMat.dispose();
      glowMat.dispose();
      auraMat.dispose();
      glowTex.dispose();
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
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
      {/* Frosted layer over the particles — softens the field so it reads as a
          hazy, out-of-focus backdrop. Sits above the canvas (appended by three)
          via z-index, below the greeting content. Never interactive. */}
      <div
        className="mcpHome__spaceBlur"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.6,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />
    </div>
  );
};
