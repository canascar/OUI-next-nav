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

import React, { useContext } from 'react';
import { ThemeContext } from '../../components/with_theme';

const EYE_L =
  'M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z';
const EYE_R =
  'M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z';

const LEFT_CX = 39;
const RIGHT_CX = 57;
const EYE_CY = 31;
const PAIR_CX = 48;

/**
 * OllyAvatar — The OpenSearch mascot rendered as an SVG per the v10 Blueprint spec.
 * Flat cyan-bordered disc, outer ring with cardinal registration ticks, comma eyes.
 *
 * @param {Object} props
 * @param {number} [props.size=52] - Pixel size (canonical: 18, 20, 22, 32, 52, 80)
 * @param {boolean} [props.lookingDown=false] - When true, eyes animate downward
 * @param {boolean} [props.highlight=false] - When true, shows a rotating highlight on the border
 */
export const OllyAvatar = ({
  size = 52,
  lookingDown = false,
  highlight = false,
}) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  const cyan = isDark ? '#5dd9ff' : '#1f6cb5';
  const cyanDim = isDark ? 'rgba(93,217,255,0.45)' : 'rgba(31,108,181,0.40)';
  const bodyFill = isDark ? '#0a2545' : '#dde9f5';
  const ringFill = isDark ? 'rgba(93,217,255,0.08)' : 'rgba(31,108,181,0.08)';

  // Stroke widths
  const sw = size < 30 ? 1.6 : size < 60 ? 1.2 : 1.0;

  // Eye scale for small-size legibility
  const esVal = (() => {
    if (size >= 80) return 1.0;
    if (size <= 20) return 2.0;
    const t = (80 - size) / (80 - 20);
    return 1.0 + Math.pow(t, 1.3) * 1.0;
  })();

  // Eye spread
  const spread = (() => {
    let pref;
    if (size >= 80) pref = 1.0;
    else if (size <= 20) pref = 0.85;
    else {
      const t = (80 - size) / (80 - 20);
      pref = 1.0 - Math.pow(t, 1.3) * 0.15;
    }
    const minSpread = (4 + 6 * esVal) / 18;
    return Math.max(pref, minSpread);
  })();

  const leftDx = (PAIR_CX - LEFT_CX) * (1 - spread);
  const rightDx = -(RIGHT_CX - PAIR_CX) * (1 - spread);

  // Eye vertical offset when "looking down"
  const eyeDy = lookingDown ? 3 : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      style={{ display: 'block', flexShrink: 0 }}
      role="img"
      aria-label="Olly">
      {/* Outer ring */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill={ringFill}
        stroke={cyanDim}
        strokeWidth={sw * 0.4}
      />
      {/* Body disc */}
      <circle
        cx="40"
        cy="40"
        r="34"
        fill={bodyFill}
        stroke={cyan}
        strokeWidth={sw}
      />
      {/* Rotating highlight arc on the body border */}
      {highlight && (
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke={isDark ? 'rgba(93,217,255,0.6)' : 'rgba(31,108,181,0.5)'}
          strokeWidth={sw * 2.5}
          strokeDasharray={`${Math.PI * 34 * 0.35} ${Math.PI * 34 * 1.65}`}
          strokeLinecap="round"
          className="ollyAvatar__highlight"
        />
      )}
      {/* Cardinal registration ticks */}
      {[0, 90, 180, 270].map((a) => {
        const r = (a * Math.PI) / 180;
        const x1 = 40 + Math.cos(r) * 34;
        const y1 = 40 + Math.sin(r) * 34;
        const x2 = 40 + Math.cos(r) * 38;
        const y2 = 40 + Math.sin(r) * 38;
        return (
          <line
            key={a}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={cyan}
            strokeWidth={sw * 0.6}
          />
        );
      })}
      {/* Left eye */}
      <g
        transform={`translate(${leftDx} ${eyeDy}) translate(${LEFT_CX} ${EYE_CY}) scale(${esVal}) translate(${-LEFT_CX} ${-EYE_CY})`}
        style={{ transition: 'transform 300ms ease' }}>
        <path d={EYE_L} fill={cyan} />
      </g>
      {/* Right eye */}
      <g
        transform={`translate(${rightDx} ${eyeDy}) translate(${RIGHT_CX} ${EYE_CY}) scale(${esVal}) translate(${-RIGHT_CX} ${-EYE_CY})`}
        style={{ transition: 'transform 300ms ease' }}>
        <path d={EYE_R} fill={cyan} />
      </g>
    </svg>
  );
};
