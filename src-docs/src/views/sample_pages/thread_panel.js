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

import React, { forwardRef, useState } from 'react';

import {
  OuiButtonIcon,
  OuiIcon,
  OuiToolTip,
  OuiModal,
  OuiModalHeader,
  OuiModalHeaderTitle,
  OuiModalBody,
  OuiModalFooter,
  OuiButton,
  OuiButtonEmpty,
  OuiCompressedFieldText,
  OuiText,
  OuiSpacer,
  OuiFlexGroup,
  OuiFlexItem,
  OuiBadge,
} from '../../../../src/components';
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
      sessionSummary,
      sessionTabs,
    },
    ref
  ) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareInput, setShareInput] = useState('');
    const [sharedWith, setSharedWith] = useState([]);

    const handleNavigate = (pageKey, navTitle) => {
      if (onViewAction) {
        onViewAction(pageKey, navTitle || pageKey);
      }
    };

    const handleAddMember = () => {
      if (shareInput.trim() && !sharedWith.includes(shareInput.trim())) {
        setSharedWith([...sharedWith, shareInput.trim()]);
        setShareInput('');
      }
    };

    const handleRemoveMember = (member) => {
      setSharedWith(sharedWith.filter((m) => m !== member));
    };

    const displayTitle = title || 'New chat';
    const tabCount = sessionTabs ? sessionTabs.length : 0;

    return (
      <div
        ref={ref}
        className={`threadPanel${isAnimating ? ' threadPanel--animating' : ''}`}
        style={{ width }}>
        {/* Header */}
        <div className="threadPanel__header">
          <div className="threadPanel__headerLeft">
            <OuiIcon type="chatLeft" size="m" />
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
                onClick={() => setIsShareModalOpen(true)}
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

        {/* Share Modal */}
        {isShareModalOpen && (
          <OuiModal onClose={() => setIsShareModalOpen(false)} style={{ maxWidth: 520 }}>
            <OuiModalHeader>
              <OuiModalHeaderTitle>Share session</OuiModalHeaderTitle>
            </OuiModalHeader>
            <OuiModalBody>
              {/* Session summary */}
              <div className="threadPanel__shareSummary">
                <OuiText size="s"><strong>{displayTitle}</strong></OuiText>
                {sessionSummary && (
                  <>
                    <OuiSpacer size="xs" />
                    <OuiFlexGroup gutterSize="s" alignItems="flexStart" responsive={false}>
                      <OuiFlexItem grow={false}>
                        <OuiIcon type="generate" size="m" />
                      </OuiFlexItem>
                      <OuiFlexItem>
                        <OuiText size="xs" color="subdued">{sessionSummary}</OuiText>
                      </OuiFlexItem>
                      {tabCount > 0 && (
                        <OuiFlexItem grow={false}>
                          <OuiText size="xs" color="subdued">{tabCount} {tabCount === 1 ? 'tab' : 'tabs'}</OuiText>
                        </OuiFlexItem>
                      )}
                    </OuiFlexGroup>
                  </>
                )}
              </div>
              <OuiSpacer size="m" />

              {/* Add members */}
              <OuiText size="xs"><strong>Add team members</strong></OuiText>
              <OuiSpacer size="xs" />
              <OuiFlexGroup gutterSize="s" responsive={false}>
                <OuiFlexItem>
                  <OuiCompressedFieldText
                    placeholder="Enter name or email"
                    value={shareInput}
                    onChange={(e) => setShareInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddMember(); }}
                    fullWidth
                  />
                </OuiFlexItem>
                <OuiFlexItem grow={false}>
                  <OuiButtonIcon
                    iconType="plusInCircle"
                    aria-label="Add member"
                    size="m"
                    color="primary"
                    display="empty"
                    onClick={handleAddMember}
                    isDisabled={!shareInput.trim()}
                  />
                </OuiFlexItem>
              </OuiFlexGroup>

              {/* Shared members list */}
              {sharedWith.length > 0 && (
                <>
                  <OuiSpacer size="s" />
                  <OuiFlexGroup gutterSize="xs" wrap responsive={false}>
                    {sharedWith.map((member) => (
                      <OuiFlexItem grow={false} key={member}>
                        <OuiBadge
                          color="hollow"
                          iconType="cross"
                          iconSide="right"
                          iconOnClick={() => handleRemoveMember(member)}
                          iconOnClickAriaLabel={`Remove ${member}`}>
                          {member}
                        </OuiBadge>
                      </OuiFlexItem>
                    ))}
                  </OuiFlexGroup>
                </>
              )}
            </OuiModalBody>
            <OuiModalFooter>
              <OuiButtonEmpty onClick={() => setIsShareModalOpen(false)}>Cancel</OuiButtonEmpty>
              <OuiButton fill onClick={() => setIsShareModalOpen(false)} isDisabled={sharedWith.length === 0}>
                Share
              </OuiButton>
            </OuiModalFooter>
          </OuiModal>
        )}
      </div>
    );
  }
);
