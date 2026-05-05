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
  OuiToolTip,
} from '../../../../src/components';
import { AskAiPopover } from './ask_ai_popover';

export const DetailPageHeader = ({
  title,
  onContinueAsThread,
  children,
  isPanelOpen,
  onTogglePanel,
  firstActionIcon = 'controlsHorizontal',
  firstActionLabel = 'Settings',
  onFirstAction,
  hideAskAi = false,
  extraActions = [],
  headerControls,
}) => {
  const [isAskAiOpen, setIsAskAiOpen] = React.useState(false);
  const [isAskAiActive, setIsAskAiActive] = React.useState(false);
  const [isHighlightMode, setIsHighlightMode] = React.useState(false);
  const [highlightPrompt, setHighlightPrompt] = React.useState(null);
  const [highlightPosition, setHighlightPosition] = React.useState(null);

  const handleAskAiToggle = () => {
    if (isAskAiOpen) {
      setIsAskAiOpen(false);
    } else {
      setHighlightPrompt(null);
      setHighlightPosition(null);
      setIsAskAiOpen(true);
      setIsAskAiActive(true);
    }
  };

  const handleAskAiClose = () => {
    setIsAskAiOpen(false);
    setIsAskAiActive(false);
    setHighlightPrompt(null);
    setHighlightPosition(null);
  };

  const handleAskAiMinimize = () => {
    setIsAskAiOpen(false);
  };

  const handleHighlightToggle = () => {
    setIsHighlightMode((prev) => !prev);
  };

  // Listen for text selection when highlight mode is active
  React.useEffect(() => {
    if (!isHighlightMode) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';
      if (text && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        selection.removeAllRanges();

        // Position popover near the highlight
        setHighlightPosition({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
        setHighlightPrompt(text);
        setIsAskAiOpen(true);
        setIsAskAiActive(true);
        setIsHighlightMode(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isHighlightMode]);

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
            color="text"
            display="empty"
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
          <OuiToolTip content="Highlight to Ask AI" position="top">
            <OuiButtonIcon
              className={`askAiFloating__button${isHighlightMode ? ' askAiFloating__button--active' : ''}`}
              iconType="visText"
              aria-label="Highlight to Ask AI"
              size="m"
              color={isHighlightMode ? 'ghost' : 'text'}
              display="fill"
              onClick={handleHighlightToggle}
            />
          </OuiToolTip>
          <OuiToolTip content="Ask AI" position="top">
            <OuiButtonIcon
              className={`askAiFloating__button${isAskAiActive ? ' askAiFloating__button--active' : ''}`}
              iconType="generate"
              aria-label="Ask AI"
              size="m"
              color={isAskAiActive ? 'ghost' : 'text'}
              display="fill"
              onClick={handleAskAiToggle}
            />
          </OuiToolTip>
          {onContinueAsThread && (
            <AskAiPopover
              isOpen={isAskAiOpen}
              onClose={handleAskAiClose}
              onMinimize={handleAskAiMinimize}
              onContinueAsThread={onContinueAsThread}
              initialPrompt={highlightPrompt}
              anchorPosition={highlightPosition}
            />
          )}
        </div>
      )}
    </div>
  );
};
