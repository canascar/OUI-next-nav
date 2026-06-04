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
import { OuiToolTip } from '../../tool_tip';
import { OuiButtonIcon } from '../../button';

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
   * Avatar element rendered when the pill is hovered (e.g. different expression).
   */
  avatarHover?: ReactNode;
  /**
   * Optional message displayed above the input (e.g. proactive AI insight).
   */
  message?: ReactNode;
  /**
   * Quick reply options shown below the message. Array of { label, primary? }.
   */
  quickReplies?: Array<{ label: string; primary?: boolean }>;
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
  avatarHover,
  message,
  quickReplies,
  onDismiss,
  onSubmit,
  onActivate,
  isHighlighted = false,
  className,
  ...rest
}) => {
  const [value, setValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus input when expanded
  React.useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

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
      'ouiOllyChatPill--expanded': isExpanded || !!message || isDismissing,
      'ouiOllyChatPill--highlighted': isHighlighted,
      'ouiOllyChatPill--dismissing': isDismissing,
    },
    className
  );

  return (
    <div
      className={classes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}>
      {message && !isDismissing && (
        <div className="ouiOllyChatPill__message" onClick={() => onActivate && onActivate()}>
          <p className="ouiOllyChatPill__messageText">{message}</p>
          {onDismiss && (
            <OuiButtonIcon
              iconType="cross"
              aria-label="Dismiss"
              size="xs"
              color="text"
              className="ouiOllyChatPill__dismiss"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissing(true);
                setTimeout(() => {
                  setIsDismissing(false);
                  onDismiss();
                }, 400);
              }}
            />
          )}
        </div>
      )}
      {message && !isDismissing && quickReplies && quickReplies.length > 0 && (
        <div className="ouiOllyChatPill__quickReplies">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              className={`ouiOllyChatPill__quickReply${reply.primary ? ' ouiOllyChatPill__quickReply--primary' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onActivate) onActivate(reply.label);
              }}>
              {reply.label}
            </button>
          ))}
        </div>
      )}
      <div className="ouiOllyChatPill__inputRow">
        {avatar && (
          <OuiToolTip content="Open chat" position="top" delay="long">
            <button
              type="button"
              className={`ouiOllyChatPill__avatar${isHighlighted ? ' ouiOllyChatPill__avatar--highlight' : ''}${!isExpanded ? ' ouiOllyChatPill__avatar--static' : ''}`}
              aria-label="Open chat"
              onMouseDown={(e) => {
                // Prevent input blur so the click registers
                if (isExpanded) e.preventDefault();
              }}
              onClick={() => {
                if (onActivate) onActivate();
              }}>
              {isHovered && avatarHover ? avatarHover : avatar}
            </button>
          </OuiToolTip>
        )}
        <input
          ref={inputRef}
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
