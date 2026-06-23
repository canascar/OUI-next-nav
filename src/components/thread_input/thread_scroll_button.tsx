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

import React, { FunctionComponent, HTMLAttributes } from 'react';
import classNames from 'classnames';
import { CommonProps } from '../common';
import { OuiIcon } from '../icon';

export interface OuiThreadScrollButtonProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Whether the button is visible */
  isVisible?: boolean;
  /** Callback when the button is clicked */
  onClick?: () => void;
}

export const OuiThreadScrollButton: FunctionComponent<OuiThreadScrollButtonProps> = ({
  isVisible = false,
  onClick,
  className,
  ...rest
}) => {
  const classes = classNames(
    'ouiThreadScrollButton',
    {
      'ouiThreadScrollButton--visible': isVisible,
    },
    className
  );

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label="Scroll to bottom"
      {...rest}>
      <OuiIcon type="arrowDown" size="m" />
    </button>
  );
};

OuiThreadScrollButton.displayName = 'OuiThreadScrollButton';
