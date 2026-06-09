/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';
import { OuiToolTip } from '../../../../src/components';

const IDLE_TOOLTIPS = [
  'Ready for your next request.',
  'Olly olly oxen free!',
  "What's next for us?",
  'What can I help you with?',
  'Anything else I can do? Let me know!',
];

/**
 * OllyIdle — Reusable idle mascot with mouseDown/mouseUp interaction.
 *
 * - On mount: briefly shows 'wink' expression (600ms), then goes idle
 * - Default: idle cycling through micro-expressions
 * - onMouseDown: switches to 'heart' expression and squishes
 * - onMouseUp/onMouseLeave: reverts to idle
 * - Hover: shows a random tooltip
 *
 * Props:
 *   size: number (default 24)
 *   expression: override expression (disables idle + interaction)
 *   winkOnMount: whether to wink before going idle (default true)
 *   className: optional wrapper class
 */
export const OllyIdle = ({ size = 24, expression, winkOnMount = true, showTooltip = false, className, style }) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [interactionExpr, setInteractionExpr] = useState(undefined);
  const [mountExpr, setMountExpr] = useState(winkOnMount ? 'wink' : undefined);
  const [squished, setSquished] = useState(false);
  const [hovered, setHovered] = useState(false);
  const tooltipText = useRef(
    IDLE_TOOLTIPS[Math.floor(Math.random() * IDLE_TOOLTIPS.length)]
  ).current;

  // Wink on mount, then go idle
  useEffect(() => {
    if (!winkOnMount) return;
    const timer = setTimeout(() => setMountExpr(undefined), 600);
    return () => clearTimeout(timer);
  }, [winkOnMount]);

  const isOverridden = expression !== undefined;

  const handleMouseDown = () => {
    if (isOverridden) return;
    setInteractionExpr('heart');
    setSquished(true);
  };

  const handleMouseUp = () => {
    if (isOverridden) return;
    setInteractionExpr(undefined);
    setSquished(false);
  };

  const handleMouseLeave = () => {
    if (isOverridden) return;
    setInteractionExpr(undefined);
    setSquished(false);
    setHovered(false);
  };

  const handleMouseEnter = () => {
    if (isOverridden) return;
    setHovered(true);
  };

  const activeExpr = isOverridden ? expression : (interactionExpr || mountExpr || (hovered ? 'happy' : undefined));

  const mascotElement = (
    <div
      className={className}
      style={{
        cursor: isOverridden ? 'default' : 'pointer',
        transform: squished ? 'scale(0.8)' : 'scale(1)',
        transition: squished
          ? 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)'
          : 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformOrigin: 'center center',
        display: 'inline-flex',
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}>
      <Mascot
        size={size}
        expression={activeExpr}
        idle={!activeExpr}
        bob={false}
        follow={false}
        color={mascotColor}
        eyeColor={mascotEyeColor}
      />
    </div>
  );

  if (showTooltip) {
    return (
      <OuiToolTip content={tooltipText} position="right" delay="long">
        {mascotElement}
      </OuiToolTip>
    );
  }

  return mascotElement;
};
