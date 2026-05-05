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

import React, { HTMLAttributes, FunctionComponent } from 'react';
import classNames from 'classnames';
import { CommonProps } from '../common';

export type OuiBrandGradientVariant = 'subtle' | 'vivid' | 'radial';

export interface OuiBrandGradientProps
  extends CommonProps,
    HTMLAttributes<HTMLDivElement> {
  /**
   * Gradient intensity variant.
   * `subtle` — soft ambient glow, ideal for page backgrounds.
   * `vivid` — stronger color presence, good for hero sections.
   * `radial` — centered radial burst, good for focused layouts.
   */
  variant?: OuiBrandGradientVariant;
  /**
   * Whether to use the dark mode palette.
   * When not provided, defaults based on the current page background luminance.
   */
  isDark?: boolean;
  /**
   * Whether the gradient should fill the entire viewport.
   */
  fullScreen?: boolean;
}

const GRADIENTS = {
  subtle: {
    dark: `radial-gradient(ellipse at 20% 30%, rgba(217, 216, 220, 0.06) 0%, transparent 55%),
           radial-gradient(ellipse at 80% 70%, rgba(217, 216, 220, 0.04) 0%, transparent 55%),
           #111`,
    light: `radial-gradient(ellipse at 20% 30%, rgba(0, 146, 184, 0.10) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 70%, rgba(0, 85, 140, 0.06) 0%, transparent 55%),
            #D9D8DC`,
  },
  vivid: {
    dark: `radial-gradient(ellipse at 15% 25%, rgba(217, 216, 220, 0.10) 0%, transparent 50%),
           radial-gradient(ellipse at 75% 65%, rgba(217, 216, 220, 0.07) 0%, transparent 50%),
           radial-gradient(ellipse at 50% 50%, rgba(217, 216, 220, 0.03) 0%, transparent 70%),
           #111`,
    light: `radial-gradient(ellipse at 15% 25%, rgba(0, 146, 184, 0.20) 0%, transparent 50%),
            radial-gradient(ellipse at 75% 65%, rgba(0, 85, 140, 0.14) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 120, 160, 0.06) 0%, transparent 70%),
            #D9D8DC`,
  },
  radial: {
    dark: `radial-gradient(ellipse at 50% 40%, rgba(217, 216, 220, 0.08) 0%, transparent 45%),
           radial-gradient(ellipse at 50% 60%, rgba(217, 216, 220, 0.05) 0%, transparent 55%),
           #111`,
    light: `radial-gradient(ellipse at 50% 40%, rgba(0, 146, 184, 0.16) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 60%, rgba(0, 85, 140, 0.10) 0%, transparent 55%),
            #D9D8DC`,
  },
};

export const OuiBrandGradient: FunctionComponent<OuiBrandGradientProps> = ({
  variant = 'subtle',
  isDark = false,
  fullScreen = false,
  className,
  children,
  style,
  ...rest
}) => {
  const classes = classNames('ouiBrandGradient', className);
  const mode = isDark ? 'dark' : 'light';
  const background = GRADIENTS[variant][mode];

  const fullScreenStyles: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }
    : {};

  return (
    <div
      className={classes}
      style={{
        background,
        minHeight: fullScreen ? '100vh' : undefined,
        ...fullScreenStyles,
        ...style,
      }}
      {...rest}>
      {children}
    </div>
  );
};

OuiBrandGradient.displayName = 'OuiBrandGradient';
