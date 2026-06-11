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

import { createDefaultSession, SESSION_STATE_VERSION } from './session_models';

/** localStorage key for persisted session state */
export const SESSION_STORAGE_KEY = 'oui-session-state';

/**
 * Create a new session and add it to the state, setting it as active.
 *
 * @param {import('./session_models').PersistedSessionState} state
 * @returns {import('./session_models').PersistedSessionState}
 */
export function createSession(state) {
  const newSession = createDefaultSession();
  return {
    ...state,
    sessions: [newSession, ...state.sessions],
    activeSessionId: newSession.id,
  };
}

/**
 * Partially update a session by ID.
 *
 * @param {import('./session_models').PersistedSessionState} state
 * @param {string} id - Session ID to update
 * @param {Partial<import('./session_models').Session>} updates - Fields to merge
 * @returns {import('./session_models').PersistedSessionState}
 */
export function updateSession(state, id, updates) {
  return {
    ...state,
    sessions: state.sessions.map((session) =>
      session.id === id ? { ...session, ...updates } : session
    ),
  };
}

/**
 * Delete a session by ID. If the deleted session was active,
 * activate the first remaining session or create a new default one.
 *
 * @param {import('./session_models').PersistedSessionState} state
 * @param {string} id - Session ID to remove
 * @returns {import('./session_models').PersistedSessionState}
 */
export function deleteSession(state, id) {
  const remaining = state.sessions.filter((session) => session.id !== id);

  // If no sessions remain, create a fresh default session
  if (remaining.length === 0) {
    const fallback = createDefaultSession();
    return {
      ...state,
      sessions: [fallback],
      activeSessionId: fallback.id,
    };
  }

  // If the deleted session was active, switch to the first remaining
  const activeSessionId =
    state.activeSessionId === id ? remaining[0].id : state.activeSessionId;

  return {
    ...state,
    sessions: remaining,
    activeSessionId,
  };
}

/**
 * Set the active session by ID.
 *
 * @param {import('./session_models').PersistedSessionState} state
 * @param {string} id - Session ID to activate
 * @returns {import('./session_models').PersistedSessionState}
 */
export function setActiveSession(state, id) {
  return {
    ...state,
    activeSessionId: id,
  };
}

/**
 * Open a canvas page as a tab in the specified session.
 * If a tab with the same pageKey already exists, activate it instead of creating a duplicate.
 *
 * @param {import('./session_models').PersistedSessionState} state
 * @param {string} sessionId - Session to add the tab to
 * @param {string} pageKey - Key mapping to a canvas page component
 * @param {string} title - Display title for the tab
 * @returns {import('./session_models').PersistedSessionState}
 */
export function openCanvasPage(state, sessionId, pageKey, title) {
  return {
    ...state,
    sessions: state.sessions.map((session) => {
      if (session.id !== sessionId) return session;

      // Deduplicate: if a tab with the same pageKey and title exists, just activate it
      const existingTab = session.tabs.find(
        (tab) => tab.pageKey === pageKey && tab.title === title
      );
      if (existingTab) {
        return {
          ...session,
          activeTabId: existingTab.id,
          threadPanelState: session.threadKey ? 'side-by-side' : session.threadPanelState,
        };
      }

      // Create a new tab
      const newTab = {
        id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        pageKey,
        title,
      };

      return {
        ...session,
        tabs: [...session.tabs, newTab],
        activeTabId: newTab.id,
        threadPanelState: session.threadKey ? 'side-by-side' : session.threadPanelState,
      };
    }),
  };
}

/**
 * Close a tab in the specified session. If the closed tab was active,
 * activate the next available tab (or null if none remain).
 *
 * @param {import('./session_models').PersistedSessionState} state
 * @param {string} sessionId - Session containing the tab
 * @param {string} tabId - Tab ID to close
 * @returns {import('./session_models').PersistedSessionState}
 */
export function closeTab(state, sessionId, tabId) {
  return {
    ...state,
    sessions: state.sessions.map((session) => {
      if (session.id !== sessionId) return session;

      const tabIndex = session.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return session;

      const newTabs = session.tabs.filter((tab) => tab.id !== tabId);

      // Determine new active tab if the closed one was active
      let activeTabId = session.activeTabId;
      if (session.activeTabId === tabId) {
        if (newTabs.length === 0) {
          activeTabId = null;
        } else {
          // Activate the tab at the same index, or the last one if we closed the last tab
          const newIndex = Math.min(tabIndex, newTabs.length - 1);
          activeTabId = newTabs[newIndex].id;
        }
      }

      return {
        ...session,
        tabs: newTabs,
        activeTabId,
      };
    }),
  };
}

/**
 * Persist session state to localStorage with version.
 * Silently fails on errors (e.g., quota exceeded, private browsing).
 *
 * @param {import('./session_models').PersistedSessionState} state
 */
export function saveSessionState(state) {
  try {
    const payload = {
      sessions: state.sessions,
      activeSessionId: state.activeSessionId,
      version: SESSION_STATE_VERSION,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Silently fail — localStorage may be unavailable or full
  }
}

/**
 * Load session state from localStorage.
 * Returns the persisted state if valid, or a default state with one empty session on any error.
 *
 * @returns {import('./session_models').PersistedSessionState}
 */
export function loadSessionState() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw == null) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw);

    // Validate version and basic structure
    if (
      !parsed ||
      parsed.version !== SESSION_STATE_VERSION ||
      !Array.isArray(parsed.sessions) ||
      typeof parsed.activeSessionId !== 'string'
    ) {
      return createDefaultState();
    }

    return {
      sessions: parsed.sessions,
      activeSessionId: parsed.activeSessionId,
      version: parsed.version,
    };
  } catch (e) {
    // Silently fail — return default state
    return createDefaultState();
  }
}

/**
 * Create a default state with one empty session.
 *
 * @returns {import('./session_models').PersistedSessionState}
 */
function createDefaultState() {
  const defaultSession = createDefaultSession();
  return {
    sessions: [defaultSession],
    activeSessionId: defaultSession.id,
    version: SESSION_STATE_VERSION,
  };
}
