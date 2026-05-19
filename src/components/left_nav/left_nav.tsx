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

import React, { FunctionComponent, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { CommonProps } from '../common';

export interface OuiLeftNavProps
  extends CommonProps,
    HTMLAttributes<HTMLElement> {
  /** Content rendered at the top of the nav (typically a logo) */
  logo?: ReactNode;
  /** Navigation items rendered in the main body */
  children?: ReactNode;
  /** Content rendered at the bottom of the nav (footer actions) */
  footer?: ReactNode;
  /** Width of the nav in pixels */
  width?: number;
}

export const OuiLeftNav: FunctionComponent<OuiLeftNavProps> = ({
  logo,
  children,
  footer,
  width = 48,
  className,
  style,
  ...rest
}) => {
  const classes = classNames('ouiLeftNav', className);

  return (
    <nav
      className={classes}
      style={{
        width,
        minWidth: width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        ...style,
      }}
      {...rest}>
      {/* Logo */}
      {logo && <div className="ouiLeftNav__logo">{logo}</div>}

      {/* Nav items */}
      <div className="ouiLeftNav__body">{children}</div>

      {/* Footer */}
      {footer && <div className="ouiLeftNav__footer">{footer}</div>}
    </nav>
  );
};

OuiLeftNav.displayName = 'OuiLeftNav';
