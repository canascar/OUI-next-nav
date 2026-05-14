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

import React from 'react';
import {
  OuiButtonIcon,
  OuiIcon,
  OuiToolTip,
} from '../../../../src/components';
import { AskAiInline } from './ask_ai_inline';

export const DetailPageHeader = ({
  title,
  onContinueAsThread,
  children,
  isPanelOpen,
  onTogglePanel,
  firstActionIcon = 'controlsHorizontal',
  firstActionLabel = 'Settings',
  firstActionActive,
  onFirstAction,
  hideAskAi = false,
  extraActions = [],
  headerControls,
  isAskAiPanelOpen,
  onAskAiToggle,
}) => {
  // Detached popover state (only used when user clicks "detach" from the panel)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isPopoverClosing, setIsPopoverClosing] = React.useState(false);
  const [highlightPrompt, setHighlightPrompt] = React.useState(null);
  const [highlightPosition, setHighlightPosition] = React.useState(null);

  const isAskAiActive = isAskAiPanelOpen || isPopoverOpen;

  const handleAskAiToggle = () => {
    if (isPopoverOpen) {
      setIsPopoverClosing(true);
      setTimeout(() => {
        setIsPopoverOpen(false);
        setIsPopoverClosing(false);
      }, 250);
    } else {
      setIsPopoverOpen(true);
    }
  };

  const handlePopoverClose = () => {
    setIsPopoverClosing(true);
    setTimeout(() => {
      setIsPopoverOpen(false);
      setIsPopoverClosing(false);
      setHighlightPrompt(null);
      setHighlightPosition(null);
    }, 250);
  };

  const handlePopoverMinimize = () => {
    setIsPopoverOpen(false);
  };



  return (
    <div className="detailPageHeader">
      {onTogglePanel && (
        <div className="detailPageHeader__panelToggle">
          <OuiToolTip content="Add" position="bottom">
            <OuiButtonIcon
              iconType="plus"
              aria-label="Add"
              size="xs"
              color="primary"
              display="fill"
            />
          </OuiToolTip>
        </div>
      )}
      <div className="detailPageHeader__title">
        {onTogglePanel && (
          <OuiToolTip content={isPanelOpen ? 'Close panel' : 'Open panel'} position="bottom">
            <OuiButtonIcon
              iconType={isPanelOpen ? 'folderOpen' : 'folderClosed'}
              aria-label={isPanelOpen ? 'Close panel' : 'Open panel'}
              size="s"
              color="text"
              display="empty"
              onClick={onTogglePanel}
            />
          </OuiToolTip>
        )}
        {children}
        {!children && title}
      </div>
      <div className="detailPageHeader__actions">
        {headerControls}
        <OuiToolTip content={firstActionLabel} position="bottom">
          <OuiButtonIcon
            iconType={firstActionIcon}
            aria-label={firstActionLabel}
            size="s"
            color={firstActionActive ? 'primary' : 'text'}
            display={firstActionActive ? 'fill' : 'empty'}
            onClick={onFirstAction}
          />
        </OuiToolTip>
        {extraActions.map((action, index) =>
          action.render ? (
            <React.Fragment key={`extra-${index}`}>
              {action.render()}
            </React.Fragment>
          ) : (
            <OuiToolTip key={`extra-${index}`} content={action.label} position="bottom">
              <OuiButtonIcon
                iconType={action.iconType}
                aria-label={action.label}
                size="s"
                color="text"
                display="empty"
                onClick={action.onClick}
              />
            </OuiToolTip>
          )
        )}
        <OuiToolTip content="Share" position="bottom">
          <OuiButtonIcon
            iconType="share"
            aria-label="Share"
            size="s"
            color="text"
            display="empty"
          />
        </OuiToolTip>
      </div>
      {!hideAskAi && (
        <div className="askAiFloating">
          {!isPopoverOpen && (
            <div className="askAiFloating__buttonWrap">
              <button
                className="askAiFloating__button"
                onClick={handleAskAiToggle}
                aria-label="Ask AI"
              >
                Ask anything...
              </button>
            </div>
          )}
          {isPopoverOpen && (
            <AskAiInline
              isOpen={isPopoverOpen}
              isClosing={isPopoverClosing}
              onClose={handlePopoverClose}
              onContinueAsThread={onContinueAsThread ? (prompt, response) => onContinueAsThread(prompt, response, null, title) : undefined}
              initialPrompt={highlightPrompt}
            />
          )}
        </div>
      )}
    </div>
  );
};
