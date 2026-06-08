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

export interface OuiSectionLabelProps
  extends CommonProps,
    HTMLAttributes<HTMLSpanElement> {
  /** The label text to display */
  children: ReactNode;
  /** Optional count to display after the label (formatted as zero-padded 2 digits) */
  count?: number;
  /** Prefix character(s) before the label. Defaults to '//' */
  prefix?: string;
  /** Separator between label and count. Defaults to '—' */
  separator?: string;
}

export const OuiSectionLabel: FunctionComponent<OuiSectionLabelProps> = ({
  children,
  count,
  prefix = '//',
  separator = '\u2014',
  className,
  ...rest
}) => {
  const classes = classNames('ouiSectionLabel', className);

  const formattedCount =
    count !== undefined ? String(count).padStart(2, '0') : null;

  return (
    <span className={classes} {...rest}>
      {prefix && <span className="ouiSectionLabel__prefix">{prefix}</span>}
      <span className="ouiSectionLabel__text">{children}</span>
      {formattedCount && (
        <>
          <span className="ouiSectionLabel__separator">{separator}</span>
          <span className="ouiSectionLabel__count">{formattedCount}</span>
        </>
      )}
    </span>
  );
};

OuiSectionLabel.displayName = 'OuiSectionLabel';
