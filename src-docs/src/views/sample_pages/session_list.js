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
  OuiButton,
  OuiIcon,
  OuiText,
  OuiTitle,
} from '../../../../src/components';

/**
 * Formats a timestamp into a human-readable relative time string.
 * @param {number} timestamp
 * @returns {string}
 */
function formatSessionTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * SessionList — Displays all existing sessions and allows the user to select one or create a new session.
 *
 * Props:
 * @param {import('./session_models').Session[]} sessions - All sessions
 * @param {string} activeSessionId - Currently active session ID
 * @param {(sessionId: string) => void} onSelectSession - Callback when a session is selected
 * @param {() => void} onCreateSession - Callback to create a new session
 */
export const SessionList = ({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateSession,
}) => {
  return (
    <div className="sessionList">
      {/* Header */}
      <div className="sessionList__header">
        <OuiTitle size="s">
          <h2>Sessions</h2>
        </OuiTitle>
        <OuiButton
          size="s"
          iconType="plusInCircle"
          onClick={onCreateSession}
          aria-label="Create new session">
          New session
        </OuiButton>
      </div>

      {/* Session cards */}
      <div className="sessionList__cards">
        {sessions.length === 0 ? (
          <div className="sessionList__empty">
            <OuiText size="s" color="subdued">
              <p>No sessions yet. Create one to get started.</p>
            </OuiText>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <button
                key={session.id}
                className={`sessionList__card${
                  isActive ? ' sessionList__card--active' : ''
                }`}
                onClick={() => onSelectSession(session.id)}
                aria-label={`${isActive ? 'Active session: ' : ''}${
                  session.title
                }`}
                aria-current={isActive ? 'true' : undefined}>
                <div className="sessionList__cardIcon">
                  <OuiIcon
                    type={session.threadKey ? 'discuss' : 'document'}
                    size="m"
                    color={isActive ? 'primary' : 'subdued'}
                  />
                </div>
                <div className="sessionList__cardContent">
                  <span className="sessionList__cardTitle">
                    {session.title}
                  </span>
                  <span className="sessionList__cardMeta">
                    {formatSessionTime(session.createdAt)}
                    {session.tabs.length > 0 && (
                      <span className="sessionList__cardTabs">
                        {' · '}
                        {session.tabs.length}{' '}
                        {session.tabs.length === 1 ? 'tab' : 'tabs'}
                      </span>
                    )}
                  </span>
                </div>
                {isActive && (
                  <span
                    className="sessionList__activeIndicator"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
