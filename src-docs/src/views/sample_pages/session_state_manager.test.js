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

// Mock the mock_canvas_pages module to avoid importing @elastic/charts (ESM)
jest.mock('./mock_canvas_pages', () => ({
  AlertPageMock: 'AlertPageMock',
  LogsPageMock: 'LogsPageMock',
  DashboardPageMock: 'DashboardPageMock',
  InventoryAnalysisPageMock: 'InventoryAnalysisPageMock',
  ConnectionPoolPageMock: 'ConnectionPoolPageMock',
  TraceAnalysisPageMock: 'TraceAnalysisPageMock',
}));

import {
  createSession,
  openCanvasPage,
  saveSessionState,
  loadSessionState,
  SESSION_STORAGE_KEY,
} from './session_state_manager';
import { SESSION_STATE_VERSION, createDefaultSession } from './session_models';

// --- localStorage mock ---
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

/** Helper: create a minimal valid state with one session */
function createBaseState() {
  const session = createDefaultSession('test-session-1');
  return {
    sessions: [session],
    activeSessionId: session.id,
    version: SESSION_STATE_VERSION,
  };
}

// ============================================================================
// Tests for createSession — generates unique IDs
// Validates: Requirements 10.1
// ============================================================================
describe('createSession generates unique IDs', () => {
  test('calling createSession multiple times produces sessions with different IDs', () => {
    let state = createBaseState();

    state = createSession(state);
    const firstNewId = state.activeSessionId;

    state = createSession(state);
    const secondNewId = state.activeSessionId;

    state = createSession(state);
    const thirdNewId = state.activeSessionId;

    // All IDs should be unique
    const ids = new Set([firstNewId, secondNewId, thirdNewId]);
    expect(ids.size).toBe(3);
  });

  test('createSession adds a new session and sets it as active', () => {
    const state = createBaseState();
    const result = createSession(state);

    expect(result.sessions).toHaveLength(2);
    expect(result.activeSessionId).toBe(result.sessions[1].id);
    expect(result.activeSessionId).not.toBe(state.activeSessionId);
  });

  test('new session has expected default properties', () => {
    const state = createBaseState();
    const result = createSession(state);
    const newSession = result.sessions.find(
      (s) => s.id === result.activeSessionId
    );

    expect(newSession.threadKey).toBeNull();
    expect(newSession.pendingThread).toBeNull();
    expect(newSession.tabs).toEqual([]);
    expect(newSession.activeTabId).toBeNull();
    expect(newSession.threadPanelState).toBe('minimized');
    expect(newSession.title).toBe('New Session');
  });
});

// ============================================================================
// Tests for openCanvasPage — deduplicates existing tabs
// Validates: Requirements 10.2
// ============================================================================
describe('openCanvasPage deduplicates existing tabs', () => {
  test('opening a page that is not yet open creates a new tab', () => {
    const state = createBaseState();
    const result = openCanvasPage(state, 'test-session-1', 'logs', 'Logs');

    const session = result.sessions[0];
    expect(session.tabs).toHaveLength(1);
    expect(session.tabs[0].pageKey).toBe('logs');
    expect(session.tabs[0].title).toBe('Logs');
    expect(session.activeTabId).toBe(session.tabs[0].id);
  });

  test('opening the same pageKey twice does not create a duplicate tab', () => {
    let state = createBaseState();
    state = openCanvasPage(state, 'test-session-1', 'logs', 'Logs');
    const firstTabId = state.sessions[0].activeTabId;

    state = openCanvasPage(state, 'test-session-1', 'logs', 'Logs');
    const session = state.sessions[0];

    // Still only one tab
    expect(session.tabs).toHaveLength(1);
    // Active tab is the existing one
    expect(session.activeTabId).toBe(firstTabId);
  });

  test('opening different pages creates separate tabs', () => {
    let state = createBaseState();
    state = openCanvasPage(state, 'test-session-1', 'logs', 'Logs');
    state = openCanvasPage(state, 'test-session-1', 'alerts', 'Alerts');

    const session = state.sessions[0];
    expect(session.tabs).toHaveLength(2);
    expect(session.tabs[0].pageKey).toBe('logs');
    expect(session.tabs[1].pageKey).toBe('alerts');
  });

  test('opening an already-open page activates its tab without creating a new one', () => {
    let state = createBaseState();
    state = openCanvasPage(state, 'test-session-1', 'logs', 'Logs');
    state = openCanvasPage(state, 'test-session-1', 'alerts', 'Alerts');

    // Active tab is alerts
    expect(state.sessions[0].activeTabId).toBe(state.sessions[0].tabs[1].id);

    // Re-open logs
    state = openCanvasPage(state, 'test-session-1', 'logs', 'Logs');

    const session = state.sessions[0];
    // Still two tabs
    expect(session.tabs).toHaveLength(2);
    // Active tab switched back to logs
    expect(session.activeTabId).toBe(session.tabs[0].id);
  });
});

// ============================================================================
// Tests for loadSessionState — falls back on corrupted data
// Validates: Requirements 10.3
// ============================================================================
describe('loadSessionState falls back on corrupted data', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test('returns default state when localStorage is empty', () => {
    const state = loadSessionState();

    expect(state.sessions).toHaveLength(1);
    expect(state.activeSessionId).toBe(state.sessions[0].id);
    expect(state.version).toBe(SESSION_STATE_VERSION);
  });

  test('returns default state when localStorage has invalid JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('{not valid json!!!');

    const state = loadSessionState();

    expect(state.sessions).toHaveLength(1);
    expect(state.activeSessionId).toBe(state.sessions[0].id);
    expect(state.version).toBe(SESSION_STATE_VERSION);
  });

  test('returns default state when version is missing', () => {
    const invalid = JSON.stringify({
      sessions: [],
      activeSessionId: 'abc',
    });
    localStorageMock.getItem.mockReturnValueOnce(invalid);

    const state = loadSessionState();

    expect(state.sessions).toHaveLength(1);
    expect(state.version).toBe(SESSION_STATE_VERSION);
  });

  test('returns default state when version does not match', () => {
    const invalid = JSON.stringify({
      sessions: [{ id: 'x' }],
      activeSessionId: 'x',
      version: 999,
    });
    localStorageMock.getItem.mockReturnValueOnce(invalid);

    const state = loadSessionState();

    expect(state.sessions).toHaveLength(1);
    expect(state.version).toBe(SESSION_STATE_VERSION);
  });

  test('returns default state when sessions is not an array', () => {
    const invalid = JSON.stringify({
      sessions: 'not-an-array',
      activeSessionId: 'x',
      version: SESSION_STATE_VERSION,
    });
    localStorageMock.getItem.mockReturnValueOnce(invalid);

    const state = loadSessionState();

    expect(state.sessions).toHaveLength(1);
    expect(state.version).toBe(SESSION_STATE_VERSION);
  });

  test('returns default state when activeSessionId is not a string', () => {
    const invalid = JSON.stringify({
      sessions: [{ id: 'x' }],
      activeSessionId: 123,
      version: SESSION_STATE_VERSION,
    });
    localStorageMock.getItem.mockReturnValueOnce(invalid);

    const state = loadSessionState();

    expect(state.sessions).toHaveLength(1);
    expect(state.version).toBe(SESSION_STATE_VERSION);
  });
});

// ============================================================================
// Tests for saveSessionState/loadSessionState round-trip
// Validates: Requirements 10.1, 10.2, 10.3
// ============================================================================
describe('saveSessionState/loadSessionState round-trip', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test('saving and loading returns the same state', () => {
    const session = createDefaultSession('round-trip-session');
    const originalState = {
      sessions: [session],
      activeSessionId: session.id,
      version: SESSION_STATE_VERSION,
    };

    saveSessionState(originalState);

    // Mock getItem to return what was saved
    const savedValue = localStorageMock.setItem.mock.calls[0][1];
    localStorageMock.getItem.mockReturnValueOnce(savedValue);

    const loadedState = loadSessionState();

    expect(loadedState.sessions).toEqual(originalState.sessions);
    expect(loadedState.activeSessionId).toBe(originalState.activeSessionId);
    expect(loadedState.version).toBe(originalState.version);
  });

  test('round-trip preserves multiple sessions with tabs', () => {
    let state = createBaseState();
    state = createSession(state);
    state = openCanvasPage(state, state.sessions[0].id, 'logs', 'Logs');
    state = openCanvasPage(state, state.sessions[0].id, 'alerts', 'Alerts');

    saveSessionState(state);

    const savedValue = localStorageMock.setItem.mock.calls[0][1];
    localStorageMock.getItem.mockReturnValueOnce(savedValue);

    const loadedState = loadSessionState();

    expect(loadedState.sessions).toHaveLength(state.sessions.length);
    expect(loadedState.sessions[0].tabs).toHaveLength(2);
    expect(loadedState.sessions[0].tabs[0].pageKey).toBe('logs');
    expect(loadedState.sessions[0].tabs[1].pageKey).toBe('alerts');
    expect(loadedState.activeSessionId).toBe(state.activeSessionId);
  });

  test('saveSessionState stores data under the correct key', () => {
    const state = createBaseState();
    saveSessionState(state);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
      expect.any(String)
    );
  });
});
