/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, FunctionComponent, ReactNode } from 'react';
import classNames from 'classnames';
import { CommonProps } from '../../common';

export type OuiInsightCardVariant = 'default' | 'glass' | 'add';

export interface OuiInsightCardProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Card title displayed at the top.
   */
  title?: ReactNode;
  /**
   * Visual variant.
   * `default` — solid surface with hairline border and feather shadow.
   * `glass` — frosted glass (for floating/featured moments).
   * `add` — dashed border "add new" tile.
   */
  variant?: OuiInsightCardVariant;
  /**
   * Whether the card is interactive (clickable).
   * Adds hover lift and cursor pointer.
   */
  isClickable?: boolean;
  /**
   * Optional icon or badge rendered to the right of the title.
   */
  titleExtra?: ReactNode;
}

export const OuiInsightCard: FunctionComponent<OuiInsightCardProps> = ({
  title,
  variant = 'default',
  isClickable = false,
  titleExtra,
  className,
  children,
  onClick,
  ...rest
}) => {
  const classes = classNames(
    'ouiInsightCard',
    `ouiInsightCard--${variant}`,
    {
      'ouiInsightCard--clickable': isClickable || !!onClick,
    },
    className
  );

  const Tag = onClick ? 'button' : 'div';
  const buttonProps = onClick
    ? { type: 'button' as const, onClick }
    : {};

  return (
    <Tag className={classes} {...buttonProps} {...(rest as any)}>
      {title && (
        <div className="ouiInsightCard__header">
          <span className="ouiInsightCard__title">{title}</span>
          {titleExtra && (
            <span className="ouiInsightCard__titleExtra">{titleExtra}</span>
          )}
        </div>
      )}
      {children && <div className="ouiInsightCard__body">{children}</div>}
    </Tag>
  );
};

OuiInsightCard.displayName = 'OuiInsightCard';
