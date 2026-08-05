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

import React, { forwardRef, useEffect } from 'react';

import { ThreadPage } from './thread_page';

/**
 * ThreadPanel — the chat pane.
 *
 * It has no header of its own: the shell topbar carries the breadcrumb, Share,
 * and the single Views trigger, so nothing here duplicates those controls.
 */
export const ThreadPanel = forwardRef(
  (
    {
      sizeState,
      threadKey,
      pendingThread,
      pendingInputValue,
      onViewAction,
      width,
      isAnimating,
    },
    ref
  ) => {
    const handleNavigate = (pageKey, navTitle) => {
      if (onViewAction) {
        onViewAction(pageKey, navTitle || pageKey);
      }
    };

    // Auto-focus the thread input textarea when panel becomes visible
    useEffect(() => {
      if (ref && ref.current) {
        const textarea = ref.current.querySelector('.ouiThreadInput__textarea');
        if (textarea) {
          setTimeout(() => textarea.focus(), 100);
        }
      }
    }, [ref, sizeState]);

    return (
      <div
        ref={ref}
        className={`threadPanel${isAnimating ? ' threadPanel--animating' : ''}`}
        style={{ width }}>
        <div className="threadPanel__content">
          <ThreadPage
            selectedItem={
              threadKey || (pendingThread ? pendingThread.key : null)
            }
            pendingMessages={pendingThread ? pendingThread.messages : undefined}
            pendingInputValue={pendingInputValue}
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

ThreadPanel.displayName = 'ThreadPanel';
