/*
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

const ANIMS = ['wave', 'radial', 'scan', 'progress', 'twinkle', 'orbit', 'hero', 'surround'];

function buildField(cv) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return null;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sp = +(cv.dataset.sp || 15);
  const cols = Math.max(1, Math.round((w - sp) / sp));
  const rows = Math.max(1, Math.round((h - sp) / sp));
  const ox = (w - (cols - 1) * sp) / 2, oy = (h - (rows - 1) * sp) / 2;
  const dots = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      dots.push({ x: ox + i * sp, y: oy + j * sp, gx: i, gy: j, r: Math.random() });
  const field = { ctx, w, h, sp, dots, cx: w / 2, cy: h / 2, anim: cv.dataset.anim };
  if (cv.dataset.anim === 'surround') {
    const box = cv.parentElement && cv.parentElement.querySelector('[data-surround-box]');
    if (box) {
      const cr = cv.getBoundingClientRect(), br = box.getBoundingClientRect();
      field.hole = {
        x0: br.left - cr.left, y0: br.top - cr.top,
        x1: br.right - cr.left, y1: br.bottom - cr.top
      };
    }
  }
  return field;
}

function dotColor(b, anim) {
  b = Math.max(0, Math.min(1, b));
  const a = anim === 'hero' ? (0.14 + 0.86 * b) : (0.02 + 0.30 * b);
  const r = Math.round(96 + 44 * b), g = Math.round(60 + 62 * b), bl = Math.round(196 + 40 * b);
  return `rgba(${r},${g},${bl},${a.toFixed(3)})`;
}

function drawField(f, t) {
  const { ctx, w, h, sp, dots, cx, cy, anim } = f;
  ctx.clearRect(0, 0, w, h);
  const minwh = Math.min(w, h);
  for (const d of dots) {
    let b = 0;
    if (anim === 'wave') b = 0.5 + 0.5 * Math.sin(t * 2.6 - (d.gx + d.gy) * 0.5);
    else if (anim === 'radial') { const dist = Math.hypot(d.x - cx, d.y - cy) / sp; b = 0.5 + 0.5 * Math.sin(t * 3.0 - dist * 0.6); }
    else if (anim === 'scan') { const p = (t * 0.5) % 1; const lx = p * w; const dx = (d.x - lx) / (sp * 1.7); b = 0.05 + 0.95 * Math.exp(-dx * dx); }
    else if (anim === 'progress') { const pp = (t * 0.4) % 1.3; const lead = Math.min(pp, 1); const fx = d.x / w; b = fx <= lead ? 0.78 : 0.06; const e = (fx - lead) * 7; b = Math.min(1, b + 0.7 * Math.exp(-e * e)); }
    else if (anim === 'twinkle') b = 0.42 + 0.58 * Math.sin(t * 2.1 + d.r * 6.2832);
    else if (anim === 'orbit') { const ang = t * 1.5; const r0 = minwh * 0.32; let bb = 0; for (let k = 0; k < 3; k++) { const aa = ang - k * 0.45; const px = cx + Math.cos(aa) * r0, py = cy + Math.sin(aa) * r0; const dd0 = Math.hypot(d.x - px, d.y - py) / sp; bb += Math.exp(-dd0 * dd0 / 5) * (1 - k * 0.3); } b = 0.05 + Math.min(1, bb); }
    else if (anim === 'hero') { const dh = Math.hypot(d.x - cx, d.y - cy) / sp; const R = minwh / (2 * sp); const ring = 0.5 + 0.5 * Math.sin(t * 2.6 - dh * 0.55); const env = Math.max(0, 1 - dh / (R * 1.02)); b = 0.04 + 0.96 * ring * env; }
    else if (anim === 'surround') {
      const hl = f.hole;
      if (!hl) { b = -1; }
      else if (d.x > hl.x0 && d.x < hl.x1 && d.y > hl.y0 && d.y < hl.y1) { b = -1; }
      else { const sdx = Math.max(hl.x0 - d.x, d.x - hl.x1, 0), sdy = Math.max(hl.y0 - d.y, d.y - hl.y1, 0); const sdist = Math.hypot(sdx, sdy); const bcx = (hl.x0 + hl.x1) / 2, bcy = (hl.y0 + hl.y1) / 2; const sa = (Math.atan2(d.y - bcy, d.x - bcx) / 6.2832) + 0.5; const sph = (t * 0.13) % 1; const sd = Math.abs(sa - sph); const sdm = Math.min(sd, 1 - sd); const sph2 = (sph + 0.5) % 1; const sd2m = Math.min(Math.abs(sa - sph2), 1 - Math.abs(sa - sph2)); const near = Math.exp(-Math.pow(sdist / (sp * 2.6), 2)); const sg = Math.exp(-Math.pow(sdm * 6, 2)) + 0.4 * Math.exp(-Math.pow(sd2m * 6, 2)); b = 0.05 * Math.exp(-Math.pow(sdist / (sp * 4.5), 2)) + 0.5 * sg * near; }
    }
    if (b < 0) continue;
    const isP = anim === 'surround';
    const rad = isP ? (0.6 + b * 1.7) : (anim === 'hero' ? (0.9 + b * 2.7) : (0.7 + b * 2.5));
    ctx.beginPath();
    ctx.arc(d.x, d.y, rad, 0, 6.2832);
    ctx.fillStyle = dotColor(b, anim);
    ctx.fill();
  }
}

const ShimmerCard = ({ anim, height = 180 }) => {
  const canvasRef = useRef(null);
  const fieldRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    fieldRef.current = buildField(cv);
    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      if (fieldRef.current) drawField(fieldRef.current, t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (anim === 'surround') {
    return (
      <div style={{ position: 'relative', padding: '40px 50px', background: '#FBFBFE', borderRadius: 10 }}>
        <canvas ref={canvasRef} data-anim="surround" data-sp="13" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div data-surround-box="1" style={{ position: 'relative', zIndex: 1, background: '#fff', border: '1px solid #E4E1EC', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 13, color: '#9A93A6', marginBottom: 24 }}>Ask AI anything, or type to search a page</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 18, color: '#3C3648' }}>+</span>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #DAD6E6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#B7B0BF' }}>↑</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, background: '#FBFBFE', borderRadius: 10 }}>
      <canvas ref={canvasRef} data-anim={anim} data-sp="14" style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};

const ShimmerCanvas = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {ANIMS.filter(a => a !== 'surround').map((anim) => (
        <div key={anim} style={{ border: '1px solid #E4E8F1', borderRadius: 10, overflow: 'hidden' }}>
          <ShimmerCard anim={anim} />
          <div style={{ padding: '10px 14px', borderTop: '1px solid #EEF0F6', fontSize: 12 }}>
            <strong style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6A42C7', display: 'block', marginBottom: 3 }}>{anim}</strong>
            <span style={{ color: '#6E6678' }}>
              {anim === 'wave' && 'Diagonal sweep across the matrix.'}
              {anim === 'radial' && 'Concentric rings pulse from center.'}
              {anim === 'scan' && 'A column scans left to right.'}
              {anim === 'progress' && 'Fill with a glowing leading edge.'}
              {anim === 'twinkle' && 'Ambient breathing field.'}
              {anim === 'orbit' && 'A bright node + trail circles.'}
              {anim === 'hero' && 'Full-bleed agent-working state.'}
            </span>
          </div>
        </div>
      ))}
      <div style={{ gridColumn: '1 / -1', border: '1px solid #E4E8F1', borderRadius: 10, overflow: 'hidden' }}>
        <ShimmerCard anim="surround" />
        <div style={{ padding: '10px 14px', borderTop: '1px solid #EEF0F6', fontSize: 12 }}>
          <strong style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#6A42C7', display: 'block', marginBottom: 3 }}>surround</strong>
          <span style={{ color: '#6E6678' }}>Soft cloud orbiting the outside of an element.</span>
        </div>
      </div>
    </div>
  );
};

export default ShimmerCanvas;
