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

import React, { forwardRef } from 'react';

import { OuiButtonIcon, OuiIcon, OuiToolTip } from '../../../../src/components';
import { ThreadPage } from './thread_page';

/**
 * ThreadPanel — Chat panel with its own header bar containing
 * sparkle icon, "New chat" title, and size toggle buttons.
 */
export const ThreadPanel = forwardRef(
  (
    {
      sizeState,
      onSizeChange,
      threadKey,
      pendingThread,
      onViewAction,
      width,
      title,
      isAnimating,
    },
    ref
  ) => {
    const handleNavigate = (pageKey, navTitle) => {
      if (onViewAction) {
        onViewAction(pageKey, navTitle || pageKey);
      }
    };

    const displayTitle = title || 'New chat';

    return (
      <div
        ref={ref}
        className={`threadPanel${isAnimating ? ' threadPanel--animating' : ''}`}
        style={{ width }}>
        {/* Header */}
        <div className="threadPanel__header">
          <div className="threadPanel__headerLeft">
            <OuiIcon type="generate" size="m" />
            <span className="threadPanel__title">{displayTitle}</span>
          </div>
          <div className="threadPanel__headerRight">
            <OuiToolTip content="Share" position="bottom">
              <OuiButtonIcon
                iconType="share"
                aria-label="Share"
                size="s"
                color="text"
                display="empty"
              />
            </OuiToolTip>
            <OuiToolTip content="Minimize" position="bottom">
              <OuiButtonIcon
                iconType="editorPositionBottomLeft"
                aria-label="Minimize"
                size="s"
                color="text"
                display="empty"
                onClick={() => onSizeChange('minimized')}
              />
            </OuiToolTip>
            <OuiToolTip
              content={
                sizeState === 'full-screen' ? 'Exit full screen' : 'Full screen'
              }
              position="bottom">
              <OuiButtonIcon
                iconType={
                  sizeState === 'full-screen' ? 'dockedLeft' : 'dockedTakeover'
                }
                aria-label={
                  sizeState === 'full-screen'
                    ? 'Exit full screen'
                    : 'Full screen'
                }
                size="s"
                color="text"
                display="empty"
                onClick={() =>
                  onSizeChange(
                    sizeState === 'full-screen' ? 'side-by-side' : 'full-screen'
                  )
                }
                style={
                  sizeState === 'full-screen'
                    ? undefined
                    : { transform: 'rotate(90deg)' }
                }
              />
            </OuiToolTip>
          </div>
        </div>

        {/* Content */}
        <div className="threadPanel__content">
          <ThreadPage
            selectedItem={
              threadKey || (pendingThread ? pendingThread.key : null)
            }
            pendingMessages={pendingThread ? pendingThread.messages : undefined}
            sourcePageTitle={
              pendingThread ? pendingThread.sourcePageTitle : undefined
            }
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    );
  }
);
