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
  useEffect,
  forwardRef,
  PropsWithChildren,
  HTMLAttributes,
  Ref,
} from 'react';
import classnames from 'classnames';

import { keys } from '../../services';
import { CommonProps } from '../common';
import { OuiFocusTrap } from '../focus_trap';
import { OuiOverlayMask, OuiOverlayMaskProps } from '../overlay_mask';
import { OuiButtonIcon } from '../button';
import { OuiI18n } from '../i18n';
import { OuiOutsideClickDetector } from '../outside_click_detector';
import { OuiPortal } from '../portal';

export interface OuiSheetProps
  extends CommonProps,
    HTMLAttributes<HTMLDivElement> {
  /**
   * Called when the sheet is closed.
   */
  onClose: () => void;
  /**
   * Height as a percentage of the viewport (default 96).
   */
  heightPercent?: number;
  /**
   * Hide the default close button.
   */
  hideCloseButton?: boolean;
  /**
   * Adjustments to the OuiOverlayMask when `ownFocus = true`.
   */
  maskProps?: OuiOverlayMaskProps;
  /**
   * Wraps sheet in a focus trap. Defaults to true.
   */
  ownFocus?: boolean;
  /**
   * Close when clicking outside the sheet. Defaults to false.
   */
  outsideClickCloses?: boolean;
  /**
   * Accessible role for the sheet. Defaults to `dialog`.
   */
  role?: string;
  /**
   * Aria label for the close button.
   */
  closeButtonAriaLabel?: string;
}

export const OuiSheet = forwardRef<
  HTMLDivElement,
  PropsWithChildren<OuiSheetProps>
>(
  (
    {
      className,
      children,
      onClose,
      heightPercent = 96,
      hideCloseButton = false,
      maskProps,
      ownFocus = true,
      outsideClickCloses = false,
      role = 'dialog',
      closeButtonAriaLabel,
      style,
      ...rest
    },
    ref: Ref<HTMLDivElement>
  ) => {
    // Close on ESC
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === keys.ESCAPE) {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const classes = classnames('ouiSheet', className);

    const sheetStyle: React.CSSProperties = {
      height: `${heightPercent}vh`,
      ...style,
    };

    const closeButton = !hideCloseButton && (
      <OuiI18n token="ouiSheet.closeAriaLabel" default="Close this dialog">
        {(closeAriaLabel: string) => (
          <OuiButtonIcon
            display="empty"
            iconType="cross"
            color="text"
            aria-label={closeButtonAriaLabel || closeAriaLabel}
            onClick={() => onClose()}
            className="ouiSheet__closeButton"
          />
        )}
      </OuiI18n>
    );

    let sheetContent = (
      <div
        role={role === null ? undefined : role}
        className={classes}
        style={sheetStyle}
        ref={ref}
        {...rest}>
        {closeButton}
        {children}
      </div>
    );

    if (outsideClickCloses) {
      sheetContent = (
        <OuiOutsideClickDetector onOutsideClick={() => onClose()}>
          {sheetContent}
        </OuiOutsideClickDetector>
      );
    }

    if (ownFocus) {
      sheetContent = (
        <OuiFocusTrap clickOutsideDisables={!outsideClickCloses}>
          {sheetContent}
        </OuiFocusTrap>
      );
    }

    return (
      <OuiPortal>
        <OuiOverlayMask headerZindexLocation="below" {...maskProps}>
          {sheetContent}
        </OuiOverlayMask>
      </OuiPortal>
    );
  }
);

OuiSheet.displayName = 'OuiSheet';
