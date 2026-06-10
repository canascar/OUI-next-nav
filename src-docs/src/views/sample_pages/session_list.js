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

import React, { useState, useCallback, useRef } from 'react';

import {
  OuiCompressedFieldSearch,
  OuiFieldSearch,
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
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef(null);

  const filteredSessions = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  const handleItemHover = useCallback((hoveredIndex) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.sessionList__card');
    items.forEach((el, i) => {
      const distance = Math.abs(i - hoveredIndex);
      let scale = 1;
      if (distance === 0) scale = 1.03;
      else if (distance === 1) scale = 1.015;
      else if (distance === 2) scale = 1.005;
      el.style.transform = `scale(${scale})`;
    });
  }, []);

  const handleItemMouseDown = useCallback((pressedIndex) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.sessionList__card');
    items.forEach((el, i) => {
      const distance = Math.abs(i - pressedIndex);
      let scale = 1;
      if (distance === 0) scale = 0.97;
      else if (distance === 1) scale = 0.985;
      else if (distance === 2) scale = 0.995;
      el.style.transform = `scale(${scale})`;
    });
  }, []);

  const handleItemMouseUp = useCallback((hoveredIndex) => {
    handleItemHover(hoveredIndex);
  }, [handleItemHover]);

  const handleListMouseLeave = useCallback(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.sessionList__card');
    items.forEach((el) => { el.style.transform = ''; });
  }, []);

  return (
    <div className="sessionList">
      <div className="sessionList__content">
        {/* Header */}
        <div className="sessionList__header">
          <OuiTitle size="s">
            <h2>All sessions</h2>
          </OuiTitle>
        </div>

        {/* Search */}
        <div className="sessionList__search">
          <OuiFieldSearch
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            aria-label="Search sessions"
          />
        </div>

        {/* Session cards */}
        <div className="sessionList__cards" ref={listRef} onMouseLeave={handleListMouseLeave}>
          {filteredSessions.length === 0 ? (
            <div className="sessionList__empty">
              <OuiText size="s" color="subdued">
                <p>{searchQuery.trim() ? 'No sessions match your search.' : 'No sessions yet. Create one to get started.'}</p>
              </OuiText>
            </div>
          ) : (
            filteredSessions.map((session, index) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  className={`sessionList__card${
                    isActive ? ' sessionList__card--active' : ''
                  }`}
                  onClick={() => onSelectSession(session.id)}
                  onMouseEnter={() => handleItemHover(index)}
                  onMouseDown={() => handleItemMouseDown(index)}
                  onMouseUp={() => handleItemMouseUp(index)}
                  aria-label={`${isActive ? 'Active session: ' : ''}${
                    session.title
                  }`}
                  aria-current={isActive ? 'true' : undefined}>
                  <div className="sessionList__cardContent">
                    <span className="sessionList__cardTitle">
                      {session.title}
                    </span>
                    <span className="sessionList__cardMeta">
                      {formatSessionTime(session.createdAt)}
                    </span>
                    {session.summary && (
                      <div className="sessionList__cardPills">
                        <span className="sessionList__cardPill">
                          <OuiIcon type="generate" size="m" />
                          <span className="sessionList__cardPillText">{session.summary}</span>
                          {session.tabs.length > 0 && (
                            <span className="sessionList__cardPillMeta">
                              {session.tabs.length}{' '}
                              {session.tabs.length === 1 ? 'tab' : 'tabs'}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
