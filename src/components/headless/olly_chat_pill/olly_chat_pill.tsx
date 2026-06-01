/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  HTMLAttributes,
  FunctionComponent,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import classNames from 'classnames';
import { CommonProps } from '../../common';

export interface OuiOllyChatPillProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /**
   * Placeholder text for the input field.
   */
  placeholder?: string;
  /**
   * Avatar/icon element rendered to the left of the input.
   */
  avatar?: ReactNode;
  /**
   * Optional message displayed above the input (e.g. proactive AI insight).
   */
  message?: ReactNode;
  /**
   * Callback when the user dismisses the message.
   */
  onDismiss?: () => void;
  /**
   * Callback when the user submits text (presses Enter).
   */
  onSubmit?: (value: string) => void;
  /**
   * Callback when the avatar/pill is clicked (e.g. to expand chat).
   */
  onActivate?: (value?: string) => void;
  /**
   * Whether the avatar should show a highlight state.
   */
  isHighlighted?: boolean;
}

export const OuiOllyChatPill: FunctionComponent<OuiOllyChatPillProps> = ({
  placeholder = 'Ask Olly anything',
  avatar,
  message,
  onDismiss,
  onSubmit,
  onActivate,
  isHighlighted = false,
  className,
  ...rest
}) => {
  const [value, setValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && value.trim()) {
        e.preventDefault();
        if (onSubmit) onSubmit(value.trim());
        if (onActivate) onActivate(value.trim());
        setValue('');
        setIsExpanded(false);
      }
    },
    [value, onSubmit, onActivate]
  );

  const classes = classNames(
    'ouiOllyChatPill',
    {
      'ouiOllyChatPill--expanded': isExpanded || !!message,
      'ouiOllyChatPill--highlighted': isHighlighted,
    },
    className
  );

  return (
    <div className={classes} {...rest}>
      {message && (
        <div className="ouiOllyChatPill__message" onClick={() => onActivate && onActivate()}>
          <p className="ouiOllyChatPill__messageText">{message}</p>
          {onDismiss && (
            <button
              type="button"
              className="ouiOllyChatPill__dismiss"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}>
              ×
            </button>
          )}
        </div>
      )}
      <div className="ouiOllyChatPill__inputRow">
        {avatar && (
          <button
            type="button"
            className={`ouiOllyChatPill__avatar${isHighlighted ? ' ouiOllyChatPill__avatar--highlight' : ''}`}
            aria-label="Open chat"
            onClick={() => onActivate && onActivate()}>
            {avatar}
          </button>
        )}
        <input
          type="text"
          className="ouiOllyChatPill__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => {
            if (!value.trim()) setIsExpanded(false);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

OuiOllyChatPill.displayName = 'OuiOllyChatPill';
