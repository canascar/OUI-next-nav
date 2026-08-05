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

import { OuiIcon, OuiToolTip } from '../../../../src/components';
import { ThreadPage } from './thread_page';

/**
 * ThreadPanel — the chat pane.
 *
 * Has its own header bar with the session title (shimmer when generating),
 * share button, session actions menu, and the panel open/close toggle.
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
      // Header props
      title,
      titleGenerating,
      showHeader,
      isHome,
      isPanelOpen,
      onTogglePanel,
      onMinimize,
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
        {/* Header: title + actions */}
        {showHeader && (
          <div className="threadPanel__header">
            {!isHome && title && (
              <span
                className={`threadPanel__headerTitle${
                  titleGenerating ? ' threadPanel__headerTitle--generating' : ''
                }`}>
                {title}
              </span>
            )}
            <div className="threadPanel__headerSpacer" />
            {!isHome && title && (
              <>
                <button
                  type="button"
                  className="threadPanel__headerBtn"
                  title="Share session"
                  aria-label="Share session">
                  <OuiIcon type="share" size="s" />
                </button>
                <button
                  type="button"
                  className="threadPanel__headerBtn"
                  title="Session actions"
                  aria-label="Session actions">
                  <OuiIcon type="boxesVertical" size="s" />
                </button>
              </>
            )}
            {/* Minimize chat: collapses chat, canvas takes full width */}
            {!isHome && isPanelOpen && onMinimize && (
              <OuiToolTip content="Hide chat" position="bottom">
                <button
                  type="button"
                  className="threadPanel__headerBtn"
                  aria-label="Hide chat"
                  onClick={onMinimize}>
                  <OuiIcon type="minimize" size="s" />
                </button>
              </OuiToolTip>
            )}
            {/* Toggle: only when canvas is closed */}
            {!isPanelOpen && (
              <OuiToolTip content="Open page" position="bottom">
                <button
                  type="button"
                  className="threadPanel__headerBtn"
                  title="Open canvas"
                  aria-label="Open canvas"
                  onClick={onTogglePanel}>
                  <OuiIcon type="dockedRight" size="s" />
                </button>
              </OuiToolTip>
            )}
          </div>
        )}
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
