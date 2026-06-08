/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, FunctionComponent, ReactNode } from 'react';
import classNames from 'classnames';
import { CommonProps } from '../../common';

export type OuiInsightCalloutSeverity =
  | 'default'
  | 'warning'
  | 'danger'
  | 'success'
  | 'info';

export interface OuiInsightCalloutProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLButtonElement>, 'title'> {
  /**
   * Primary title text.
   */
  title: ReactNode;
  /**
   * Secondary subtitle/meta text.
   */
  subtitle?: ReactNode;
  /**
   * Severity determines the left rail color.
   * `default` — accent (indigo)
   * `warning` — amber
   * `danger` — red
   * `success` — green
   * `info` — blue
   */
  severity?: OuiInsightCalloutSeverity;
  /**
   * Whether the callout is in a dismissing/exiting state.
   */
  isDismissing?: boolean;
  /**
   * Click handler — makes the callout interactive.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const OuiInsightCallout: FunctionComponent<OuiInsightCalloutProps> = ({
  title,
  subtitle,
  severity = 'default',
  isDismissing = false,
  className,
  onClick,
  ...rest
}) => {
  const classes = classNames(
    'ouiInsightCallout',
    `ouiInsightCallout--${severity}`,
    {
      'ouiInsightCallout--dismissing': isDismissing,
    },
    className
  );

  return (
    <button type="button" className={classes} onClick={onClick} {...rest}>
      <span className="ouiInsightCallout__title">{title}</span>
      {subtitle && (
        <span className="ouiInsightCallout__subtitle">{subtitle}</span>
      )}
    </button>
  );
};

OuiInsightCallout.displayName = 'OuiInsightCallout';
