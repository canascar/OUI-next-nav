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

import { OuiIcon } from '../../../../src/components';
import { ThreadPage } from './thread_page';

/**
 * ThreadPanel — the chat pane.
 *
 * Option F quiet pass: controls are bare glyphs, no bordered chips.
 * Header renders state-conditionally:
 *   Split:     session ▾ · share
 *   Chat Full: session ▾ · share · "N tabs | ⌄" (or "+ Page" at 0 tabs)
 *   Home:      no header
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
      tabCount = 0,
      activeTabTitle,
      linkedAttachments,
    },
    ref
  ) => {
    const handleNavigate = (pageKey, navTitle, meta) => {
      if (onViewAction) {
        onViewAction(pageKey, navTitle || pageKey, meta);
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

    // State derivation
    const isChatFull = !isPanelOpen; // canvas collapsed = chat owns full width
    const hasSession = !isHome && !!title;

    return (
      <div
        ref={ref}
        className={`threadPanel${isAnimating ? ' threadPanel--animating' : ''}`}
        style={{ width }}>
        {/* Option F: Header only when a session exists (not home) */}
        {showHeader && hasSession && (
          <div className="threadPanel__header">
            {/* Session title — bare text, acts as dropdown trigger */}
            <span
              className={`threadPanel__headerTitle${
                titleGenerating ? ' threadPanel__headerTitle--generating' : ''
              }`}
              role="button"
              tabIndex={0}
              aria-label="Session options">
              {title}
            </span>

            {/* Share — bare glyph */}
            <button
              type="button"
              className="threadPanel__headerBtn"
              aria-label="Share session">
              <OuiIcon type="share" size="s" />
            </button>

            <div className="threadPanel__headerSpacer" />

            {/* Chat Full state: "N tabs | ⌄" two-zone control, or "+ Page" at zero */}
            {isChatFull && (
              <button
                type="button"
                className="threadPanel__headerBtn threadPanel__headerBtn--tabControl"
                aria-label={tabCount > 0 ? `${tabCount} tabs` : 'Open page'}
                onClick={onTogglePanel}>
                {tabCount > 0 ? (
                  <>
                    <span className="threadPanel__tabControlLabel">
                      {tabCount} {tabCount === 1 ? 'tab' : 'tabs'}
                    </span>
                  </>
                ) : (
                  <>
                    <OuiIcon type="plus" size="s" />
                    <span className="threadPanel__tabControlLabel">Open tab</span>
                  </>
                )}
              </button>
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
            linkedAttachments={linkedAttachments}
          />
        </div>
      </div>
    );
  }
);

ThreadPanel.displayName = 'ThreadPanel';
