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
  KeyboardEventHandler,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import classNames from 'classnames';
import { CommonProps } from '../common';

export interface OuiThreadInputProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Current value of the textarea */
  value?: string;
  /** Callback when the value changes */
  onChange?: (value: string) => void;
  /** Callback when the user submits (Enter without Shift, or clicking send) */
  onSubmit?: (value: string) => void;
  /** Number of visible rows for the textarea */
  rows?: number;
  /** Whether the input is disabled */
  isDisabled?: boolean;
  /** Whether the send button should show a loading state */
  isLoading?: boolean;
  /** Actions to render on the left side of the action bar (e.g. attachment button) */
  actionsLeft?: ReactNode;
  /** Actions to render on the right side of the action bar (e.g. send button) */
  actionsRight?: ReactNode;
  /** Whether to use full width */
  fullWidth?: boolean;
}

export const OuiThreadInput: FunctionComponent<OuiThreadInputProps> = ({
  placeholder = 'Ask anything. Type / for actions.',
  value: controlledValue,
  onChange,
  onSubmit,
  rows = 3,
  isDisabled = false,
  isLoading = false,
  actionsLeft,
  actionsRight,
  fullWidth = true,
  className,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState('');
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

  const handleSubmit = useCallback(() => {
    if (currentValue.trim() && !isDisabled && !isLoading) {
      onSubmit?.(currentValue);
      if (!isControlled) {
        setInternalValue('');
      }
    }
  }, [currentValue, isDisabled, isLoading, onSubmit, isControlled]);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const classes = classNames(
    'ouiThreadInput',
    {
      'ouiThreadInput--fullWidth': fullWidth,
      'ouiThreadInput--disabled': isDisabled,
    },
    className
  );

  return (
    <div className={classes} {...rest}>
      <div className="ouiThreadInput__wrapper">
        <textarea
          className="ouiThreadInput__textarea"
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={rows}
          disabled={isDisabled}
          aria-label={placeholder}
        />
        <div className="ouiThreadInput__actions">
          {actionsLeft && (
            <div className="ouiThreadInput__actionsLeft">{actionsLeft}</div>
          )}
          {actionsRight && (
            <div className="ouiThreadInput__actionsRight">{actionsRight}</div>
          )}
        </div>
      </div>
    </div>
  );
};

OuiThreadInput.displayName = 'OuiThreadInput';
