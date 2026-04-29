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

  return (
    <div className="detailPageHeader">
      {onTogglePanel && (
        <div className="detailPageHeader__panelToggle">
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
          <OuiToolTip content="Add" position="bottom">
            <OuiButtonIcon
              iconType="plusInCircle"
              aria-label="Add"
              size="s"
              color="text"
              display="empty"
            />
          </OuiToolTip>
        </div>
      )}
      <div className="detailPageHeader__title">
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
        {!hideAskAi && (
          <>
            <div className="askAiPopover__anchor">
              <OuiToolTip content="Ask AI" position="bottom">
                <OuiButtonIcon
                  iconType="generate"
                  aria-label="Ask AI"
                  size="s"
                  color={isAskAiOpen ? 'primary' : 'text'}
                  display="empty"
                  onClick={() => setIsAskAiOpen(!isAskAiOpen)}
                />
              </OuiToolTip>
              {onContinueAsThread && (
                <AskAiPopover
                  isOpen={isAskAiOpen}
                  onClose={() => setIsAskAiOpen(false)}
                  onContinueAsThread={onContinueAsThread}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
