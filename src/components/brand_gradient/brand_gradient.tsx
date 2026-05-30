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
    dark: `radial-gradient(ellipse 40% 35% at 0% 0%, hsla(245, 80%, 28%, 0.30), transparent 60%),
           radial-gradient(ellipse 35% 30% at 100% 8%, hsla(215, 90%, 22%, 0.25), transparent 60%),
           radial-gradient(ellipse 35% 30% at 100% 100%, hsla(260, 80%, 22%, 0.25), transparent 60%),
           radial-gradient(ellipse 35% 30% at 5% 100%, hsla(230, 80%, 22%, 0.25), transparent 60%),
           #0c0d12`,
    light: `radial-gradient(ellipse 40% 35% at 0% 0%, hsla(245, 80%, 90%, 0.40), transparent 60%),
            radial-gradient(ellipse 35% 30% at 100% 8%, hsla(215, 90%, 92%, 0.30), transparent 60%),
            radial-gradient(ellipse 35% 30% at 100% 100%, hsla(260, 80%, 92%, 0.30), transparent 60%),
            radial-gradient(ellipse 35% 30% at 5% 100%, hsla(230, 80%, 92%, 0.28), transparent 60%),
            #f8f7fc`,
  },
  vivid: {
    dark: `radial-gradient(ellipse 40% 35% at 0% 0%, hsla(245, 80%, 28%, 0.40), transparent 60%),
           radial-gradient(ellipse 35% 30% at 100% 8%, hsla(215, 90%, 22%, 0.35), transparent 60%),
           radial-gradient(ellipse 35% 30% at 100% 100%, hsla(260, 80%, 22%, 0.40), transparent 60%),
           radial-gradient(ellipse 35% 30% at 5% 100%, hsla(230, 80%, 22%, 0.40), transparent 60%),
           #0c0d12`,
    light: `radial-gradient(ellipse 40% 35% at 0% 0%, hsla(245, 80%, 90%, 0.55), transparent 60%),
            radial-gradient(ellipse 35% 30% at 100% 8%, hsla(215, 90%, 92%, 0.45), transparent 60%),
            radial-gradient(ellipse 35% 30% at 100% 100%, hsla(260, 80%, 92%, 0.45), transparent 60%),
            radial-gradient(ellipse 35% 30% at 5% 100%, hsla(230, 80%, 92%, 0.40), transparent 60%),
            #f8f7fc`,
  },
  radial: {
    dark: `radial-gradient(ellipse 50% 50% at 50% 40%, hsla(245, 80%, 28%, 0.35), transparent 60%),
           radial-gradient(ellipse 40% 40% at 50% 60%, hsla(260, 80%, 22%, 0.30), transparent 60%),
           #0c0d12`,
    light: `radial-gradient(ellipse 50% 50% at 50% 40%, hsla(245, 80%, 90%, 0.50), transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 60%, hsla(260, 80%, 92%, 0.40), transparent 60%),
            #f8f7fc`,
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
