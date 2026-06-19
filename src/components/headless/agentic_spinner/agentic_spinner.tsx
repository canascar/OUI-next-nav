/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, FunctionComponent } from 'react';
import classNames from 'classnames';

export type OuiAgenticSpinnerSize = 's' | 'm' | 'l';

export interface OuiAgenticSpinnerProps
  extends HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner blob: 's' (8px), 'm' (12px), 'l' (18px) */
  size?: OuiAgenticSpinnerSize;
}

/**
 * **OuiAgenticSpinner** — An organic morphing blob spinner for agentic
 * "thinking" states. Use in place of a traditional spinner when indicating
 * AI processing, streaming, or pre-message loading.
 */
export const OuiAgenticSpinner: FunctionComponent<OuiAgenticSpinnerProps> = ({
  size = 'm',
  className,
  ...rest
}) => {
  const classes = classNames(
    'ouiAgenticSpinner',
    `ouiAgenticSpinner--${size}`,
    className
  );

  return (
    <span className={classes} aria-label="Loading" role="status" {...rest} />
  );
};
