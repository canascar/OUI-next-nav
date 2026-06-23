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

import { OuiThreadListItem, OuiThreadListItemProps } from './thread_list_item';
import { CommonProps } from '../common';

export type OuiThreadListProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    /**
     * Array of thread items to display
     */
    items?: OuiThreadListItemProps[];

    /**
     * Remove container padding
     */
    flush?: boolean;

    /**
     * Add a border to the list container
     */
    bordered?: boolean;

    /**
     * Spacing between list items: 'none', 's', 'm'
     */
    gutterSize?: 'none' | 's' | 'm';
  };

export const OuiThreadList: FunctionComponent<OuiThreadListProps> = ({
  children,
  className,
  items,
  flush = false,
  bordered = false,
  gutterSize = 's',
  ...rest
}) => {
  const classes = classNames(
    'ouiThreadList',
    {
      'ouiThreadList--flush': flush,
      'ouiThreadList--bordered': bordered,
      [`ouiThreadList--gutterSize${gutterSize.toUpperCase()}`]:
        gutterSize !== 'none',
    },
    className
  );

  let content;
  if (items) {
    content = items.map((item, index) => (
      <OuiThreadListItem key={index} {...item} />
    ));
  } else {
    content = children;
  }

  return (
    <div className={classes} {...rest}>
      {content}
    </div>
  );
};
