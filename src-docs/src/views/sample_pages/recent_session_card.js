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
import { OuiIcon } from '../../../../src/components';

/**
 * RecentSessionCard — Displays a session summary card with title, time, AI summary, and tab count.
 * Used in the empty session page under the "Recent" filter chip.
 *
 * @param {Object} props
 * @param {string} props.title - Session title
 * @param {string} props.time - Relative time string (e.g., "2h ago")
 * @param {string} [props.summary] - AI-generated summary text
 * @param {number} [props.tabCount=0] - Number of open tabs in the session
 * @param {() => void} props.onClick - Callback when the card is clicked
 */
export const RecentSessionCard = ({ title, time, summary, tabCount = 0, onClick }) => {
  return (
    <div className="emptySessionPage__listItem">
      <button
        type="button"
        className="emptySessionPage__listItemClickable"
        onClick={onClick}>
        <span className="emptySessionPage__activityCard">
          <span className="emptySessionPage__listItemTitle">{title}</span>
          <span className="emptySessionPage__listItemTime">{time}</span>
          {summary && (
            <span className="emptySessionPage__activityCardPills">
              <span className="emptySessionPage__activityPill">
                <OuiIcon type="generate" size="m" />
                <span className="emptySessionPage__activityPillText">{summary}</span>
                <span className="emptySessionPage__activityPillMeta">
                  {tabCount > 0 ? `${tabCount} ${tabCount === 1 ? 'tab' : 'tabs'}` : 'No tabs'}
                </span>
              </span>
            </span>
          )}
        </span>
      </button>
    </div>
  );
};
