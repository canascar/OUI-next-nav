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
 * Shared edge-vignette overlay for the intro backdrops (V1–V4). Renders a
 * pointer-transparent layer that fades the backdrop out to the ACTUAL page
 * background color toward the container edges — so a full-bleed animation
 * dissolves softly at the frame instead of hard-clipping (same idea as V1's
 * vignette). Drop it in as the LAST child of a version's root element.
 *
 * It resolves the real page bg by walking up the DOM from itself (rather than a
 * hardcoded guess), so the fade always matches whatever surface sits behind the
 * intro on this route/theme.
 */

import React, { useEffect, useRef } from 'react';

const IntroVignette = ({ isDark }) => {
  const ref = useRef(null);

  useEffect(() => {
    const vig = ref.current;
    if (!vig) return;
    let el = vig.parentElement ? vig.parentElement.parentElement : null;
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
    const rgb = m
      ? `${m[1]}, ${m[2]}, ${m[3]}`
      : isDark
      ? '11, 9, 18'
      : '230, 224, 245';
    // Fade the backdrop to the page bg toward the edges. A single centred
    // radial can't fully cover all four edges of a wide box (the edge midpoints
    // sit inside its radius), so layer directional LINEAR fades (top/bottom/
    // left/right) that reach solid bg at each edge ON TOP of a tighter radial.
    // This makes every edge — including V4's waves — dissolve into the bg
    // rather than showing hard at the frame.
    const c0 = `rgba(${rgb}, 0)`;
    const c1 = `rgba(${rgb}, 1)`;
    vig.style.background = [
      // Top / bottom edges.
      `linear-gradient(to top, ${c1} 0%, ${c0} 22%)`,
      `linear-gradient(to bottom, ${c1} 0%, ${c0} 22%)`,
      // Left / right edges.
      `linear-gradient(to left, ${c1} 0%, ${c0} 18%)`,
      `linear-gradient(to right, ${c1} 0%, ${c0} 18%)`,
      // Central radial to darken the corners + soften the overall frame.
      `radial-gradient(78% 82% at 50% 48%, ${c0} 30%, rgba(${rgb}, 0.5) 60%, rgba(${rgb}, 0.9) 84%, ${c1} 100%)`,
    ].join(', ');
  }, [isDark]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  );
};

export default IntroVignette;
