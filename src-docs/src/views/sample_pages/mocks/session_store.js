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

/**
 * First-run / session source of truth.
 *
 * This module owns the canonical `Session` shape described in the feature
 * spec and persists a list of sessions to localStorage under a versioned key.
 * The existing session UI (SessionContainer / ThreadPanel) uses slightly
 * different field names (threadPanelState / threadPanelWidth and a richer
 * pendingThread); the first-run view adapts between the two at the render
 * boundary. Keeping this store spec-shaped means engineering can later swap in
 * a real agent session API without reshaping callers.
 *
 * @typedef {'minimized'|'side-by-side'|'full-screen'} ChatPaneState
 *
 * @typedef {Object} PageTab
 * @property {string} id
 * @property {string} pageKey
 * @property {string} title
 *
 * @typedef {Object} Session
 * @property {string} id
 * @property {string|null} threadKey
 * @property {{ prompt: string }|null} pendingThread
 * @property {PageTab[]} tabs
 * @property {string|null} activeTabId
 * @property {ChatPaneState} chatPaneState
 * @property {number} chatPaneWidth  Percent, clamped 20–80.
 * @property {number} createdAt
 * @property {string} title
 */

/** Versioned storage key — bump the suffix on breaking shape changes. */
export const SESSIONS_STORAGE_KEY = 'osd.sessions.v1';

const MIN_PANE_WIDTH = 20;
const MAX_PANE_WIDTH = 80;

/** @returns {number} */
function now() {
  return Date.now();
}

/** @returns {string} */
function uid(prefix) {
  return `${prefix}-${now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Clamp a chat-pane width into the allowed 20–80 range.
 * @param {number} width
 * @returns {number}
 */
export function clampPaneWidth(width) {
  if (typeof width !== 'number' || Number.isNaN(width)) return 50;
  return Math.min(MAX_PANE_WIDTH, Math.max(MIN_PANE_WIDTH, width));
}

/**
 * Create a blank session in the canonical shape.
 * @param {Partial<Session>} [overrides]
 * @returns {Session}
 */
export function createSession(overrides = {}) {
  return {
    id: uid('session'),
    threadKey: null,
    pendingThread: null,
    tabs: [],
    activeTabId: null,
    chatPaneState: 'minimized',
    chatPaneWidth: 50,
    createdAt: now(),
    title: 'New session',
    ...overrides,
  };
}

/**
 * Validate one persisted session object, returning a normalized copy or null
 * if it is unusable.
 * @param {any} raw
 * @returns {Session|null}
 */
function normalizeSession(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.id !== 'string') return null;
  const validStates = ['minimized', 'side-by-side', 'full-screen'];
  return {
    id: raw.id,
    threadKey: typeof raw.threadKey === 'string' ? raw.threadKey : null,
    pendingThread:
      raw.pendingThread && typeof raw.pendingThread.prompt === 'string'
        ? { prompt: raw.pendingThread.prompt }
        : null,
    tabs: Array.isArray(raw.tabs)
      ? raw.tabs.filter(
          (t) =>
            t &&
            typeof t.id === 'string' &&
            typeof t.pageKey === 'string' &&
            typeof t.title === 'string'
        )
      : [],
    activeTabId: typeof raw.activeTabId === 'string' ? raw.activeTabId : null,
    chatPaneState: validStates.includes(raw.chatPaneState)
      ? raw.chatPaneState
      : 'minimized',
    chatPaneWidth: clampPaneWidth(raw.chatPaneWidth),
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now(),
    title: typeof raw.title === 'string' ? raw.title : 'New session',
  };
}

/**
 * Load persisted sessions. On corrupt/missing data, returns an empty list
 * (the first-run state) without throwing.
 *
 * @returns {Session[]}
 */
export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.sessions)) return [];
    return parsed.sessions.map(normalizeSession).filter(Boolean);
  } catch (e) {
    // Corrupt data — fall back to first-run (empty) state.
    return [];
  }
}

/**
 * Persist the session list under the versioned key. Silently no-ops on error.
 * @param {Session[]} sessions
 */
export function saveSessions(sessions) {
  try {
    localStorage.setItem(
      SESSIONS_STORAGE_KEY,
      JSON.stringify({ version: 1, sessions })
    );
  } catch (e) {
    // Silently fail — storage may be unavailable or full
  }
}

/** Test/dev helper: wipe persisted sessions (returns to first-run). */
export function clearSessions() {
  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
  } catch (e) {
    // Silently fail
  }
}
