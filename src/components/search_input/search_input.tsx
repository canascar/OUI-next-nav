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

import React, {
  FunctionComponent,
  HTMLAttributes,
  ReactNode,
  useState,
  useCallback,
  useRef,
  KeyboardEventHandler,
} from 'react';
import classNames from 'classnames';
import { CommonProps } from '../common';

export interface OuiSearchInputProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onChange'> {
  /** Placeholder text shown with the blinking caret animation */
  placeholder?: string;
  /** Highlighted text within the placeholder (e.g. "/" for actions) */
  placeholderHighlight?: string;
  /** Current value of the input */
  value?: string;
  /** Callback when the value changes */
  onChange?: (value: string) => void;
  /** Callback when the user submits (Enter key) */
  onSubmit?: (value: string) => void;
  /** Whether the input should auto-focus on mount */
  autoFocus?: boolean;
  /** Whether the input is disabled */
  isDisabled?: boolean;
  /** Actions to render on the left side (e.g. attachment button) */
  actionsLeft?: ReactNode;
  /** Actions to render on the right side (e.g. send button) */
  actionsRight?: ReactNode;
  /** Whether to use full width */
  fullWidth?: boolean;
}

export const OuiSearchInput: FunctionComponent<OuiSearchInputProps> = ({
  placeholder = 'Ask anything. Type / for actions.',
  placeholderHighlight = '/',
  value: controlledValue,
  onChange,
  onSubmit,
  autoFocus = false,
  isDisabled = false,
  actionsLeft,
  actionsRight,
  fullWidth = true,
  className,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (currentValue.trim() && !isDisabled) {
          onSubmit?.(currentValue);
          if (!isControlled) {
            setInternalValue('');
          }
        }
      }
    },
    [currentValue, isDisabled, onSubmit, isControlled]
  );

  // Build placeholder with highlighted segment
  const renderPlaceholder = () => {
    if (currentValue) return null;

    if (!placeholderHighlight || !placeholder.includes(placeholderHighlight)) {
      return (
        <div className="ouiSearchInput__placeholder">
          <span className="ouiSearchInput__caret" />
          {placeholder}
        </div>
      );
    }

    const idx = placeholder.indexOf(placeholderHighlight);
    const before = placeholder.slice(0, idx);
    const after = placeholder.slice(idx + placeholderHighlight.length);

    return (
      <div className="ouiSearchInput__placeholder">
        <span className="ouiSearchInput__caret" />
        {before}
        <span className="ouiSearchInput__highlight">
          {placeholderHighlight}
        </span>
        {after}
      </div>
    );
  };

  const classes = classNames(
    'ouiSearchInput',
    {
      'ouiSearchInput--fullWidth': fullWidth,
      'ouiSearchInput--disabled': isDisabled,
    },
    className
  );

  return (
    <div className={classes} {...rest}>
      <div className="ouiSearchInput__card">
        {renderPlaceholder()}
        <textarea
          ref={textareaRef}
          className={classNames('ouiSearchInput__textarea', {
            'ouiSearchInput__textarea--empty': !currentValue,
          })}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isDisabled}
          autoFocus={autoFocus}
          aria-label={placeholder}
        />
        <div className="ouiSearchInput__actions">
          {actionsLeft && (
            <div className="ouiSearchInput__actionsLeft">{actionsLeft}</div>
          )}
          {actionsRight && (
            <div className="ouiSearchInput__actionsRight">{actionsRight}</div>
          )}
        </div>
      </div>
    </div>
  );
};

OuiSearchInput.displayName = 'OuiSearchInput';
