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
import { OuiButtonIcon } from '../../../../src/components';

/**
 * FloatingAskAiButton — A floating button that appears when the Chat_Pane is minimized.
 * Clicking it expands the Chat_Pane to side-by-side mode.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Whether the button is visible (true only when chatPaneState === 'minimized')
 * @param {() => void} props.onClick - Handler to expand chat pane to side-by-side
 */
export const FloatingAskAiButton = ({ visible, onClick }) => {
  if (!visible) return null;

  return (
    <div className="floatingAskAiButton">
      <OuiButtonIcon
        iconType="generate"
        aria-label="Open AI chat"
        onClick={onClick}
        color="text"
        display="empty"
        size="m"
        className="floatingAskAiButton__icon"
      />
    </div>
  );
};
