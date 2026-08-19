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

import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import {
  OuiIcon,
  OuiButtonIcon,
  OuiToolTip,
} from '../../../../src/components';
import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { OllyIdle } from './olly_idle';
import { ThemeContext } from '../../components/with_theme';
import { pocTelemetry } from './poc_entry_handler';

// ─── Shared components ────────────────────────────────────────────────────────

const FeedbackButtons = () => {
  const [selected, setSelected] = useState(null);
  return (
    <div className="pocChat__feedback">
      <button
        type="button"
        className={`pocChat__feedbackBtn${selected === 'up' ? ' pocChat__feedbackBtn--active' : ''}`}
        aria-label="Good response"
        onClick={() => setSelected(selected === 'up' ? null : 'up')}
      >
        <OuiIcon type="thumbsUp" size="s" />
      </button>
      <button
        type="button"
        className={`pocChat__feedbackBtn${selected === 'down' ? ' pocChat__feedbackBtn--active' : ''}`}
        aria-label="Bad response"
        onClick={() => setSelected(selected === 'down' ? null : 'down')}
      >
        <OuiIcon type="thumbsDown" size="s" />
      </button>
    </div>
  );
};

const CollapsibleLine = ({ label, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pocChat__collapsible">
      <button
        type="button"
        className="pocChat__collapsibleTrigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <OuiIcon type={open ? 'arrowDown' : 'arrowRight'} size="s" color="subdued" />
      </button>
      {open && <div className="pocChat__collapsibleBody">{children}</div>}
    </div>
  );
};

// ─── Action tags ──────────────────────────────────────────────────────────────

const ACTION_TAGS = {
  'rec-pool-increase': { tag: 'Suggested diff', desc: 'your team applies it in your deployment · not run by the agent' },
  'rec-monitor': { tag: 'Creates a monitor', desc: 'new alerting resource · you approve before it exists' },
  'rec-dashboard': { tag: 'New panel', desc: 'added to a copy — your current dashboard is not changed' },
};

const POST_CONTINUE_MEMORY = [
  'orders-pool on pay-prod-a: 20 → 40 proposed (suggested diff, not applied)',
  'monitor created: pool utilization > 85% for 5m on orders-pool',
  'checkout p99 investigation resolved — pool exhaustion from 14:02 deploy',
];

// ─── Composer ─────────────────────────────────────────────────────────────────

const Composer = ({ inputRef, onSend }) => {
  const [value, setValue] = useState('');
  const handleSend = () => {
    if (!value.trim()) return;
    if (onSend) onSend(value);
    setValue('');
    if (inputRef.current) inputRef.current.focus();
  };
  return (
    <div className="pocChat__composer">
      <div className="threadPage__inputWrapper">
        <textarea
          ref={inputRef}
          className="threadPage__textarea"
          placeholder="Ask anything. Type / for actions."
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          aria-label="Chat input"
        />
        <div className="threadPage__inputActions">
          <OuiToolTip content="Attach" position="top">
            <OuiButtonIcon iconType="plus" aria-label="Add attachment" size="s" color="text" />
          </OuiToolTip>
          <OuiToolTip content="Dictate" position="top">
            <OuiButtonIcon
              aria-label="Dictate" size="s" color="text" display="empty"
              iconType={() => (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><rect x="9" y="2" width="6" height="13" rx="3" />
                </svg>
              )}
            />
          </OuiToolTip>
          <OuiToolTip content="Send message" position="top">
            <OuiButtonIcon iconType="sortUp" aria-label="Send message" display="fill" size="s" isDisabled={!value.trim()} onClick={handleSend} />
          </OuiToolTip>
        </div>
      </div>
    </div>
  );
};

// ─── Main Report ──────────────────────────────────────────────────────────────

export const PocChatReport = ({ alert }) => {
  const inputRef = useRef(null);
  const threadRef = useRef(null);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [followUpMessages, setFollowUpMessages] = useState([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Post-continue state
  const [continued, setContinued] = useState(false);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const handleContinue = useCallback((selectedIds) => {
    setContinued(true);
    const results = selectedIds.map((id) => alert.toolResults[id]).filter(Boolean);
    let delay = 600;
    results.forEach((result) => {
      timersRef.current.push(setTimeout(() => {
        setExecutionSteps((prev) => [...prev, { text: result, status: 'running' }]);
      }, delay));
      delay += 1400;
      timersRef.current.push(setTimeout(() => {
        setExecutionSteps((prev) => prev.map((s) => s.text === result ? { ...s, status: 'done' } : s));
      }, delay));
      delay += 400;
    });
    timersRef.current.push(setTimeout(() => setShowSummary(true), delay + 300));
    timersRef.current.push(setTimeout(() => setShowMemory(true), delay + 800));
    // Scroll to bottom
    timersRef.current.push(setTimeout(() => {
      if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }, delay + 900));
  }, [alert]);

  const handleSendMessage = useCallback((text) => {
    if (!text.trim()) return;
    setFollowUpMessages((prev) => [...prev, { role: 'user', content: text.trim() }]);
    setTimeout(() => {
      if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }, 50);
  }, []);

  const handleScroll = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 40);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (threadRef.current) threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);
  if (!alert) return null;

  // Recommendation state (lifted here so it persists across re-renders)
  const [checked, setChecked] = useState(() => {
    const initial = {};
    alert.recommendations.forEach((r) => { initial[r.id] = r.defaultChecked; });
    return initial;
  });
  const selectedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="pocChat">
      <div className="pocChat__thread" ref={threadRef} onScroll={handleScroll}>

        {/* ─── User message ─── */}
        <div className="pocChat__userMsg">
          Why did checkout p99 spike after the 14:02 deploy? It&apos;s alerting on pay-prod-a.
        </div>

        {/* ─── Assistant message 1: Investigation report ─── */}
        <div className="pocChat__assistantMsg">
          <div className="pocChat__msgBody">
            <CollapsibleLine label="Memory updated · 3 items">
              <div className="pocChat__memoryItems">
                {alert.memoryItems.map((item, i) => (
                  <div key={i} className="pocChat__memoryItem">{item}</div>
                ))}
              </div>
            </CollapsibleLine>

            <div className="pocChat__rootCause">
              <p>The 14:02 deploy doubled how long each checkout request holds a database connection — 0.6s → 1.3s — so the 20-connection orders-pool no longer covers peak concurrency.</p>
              <p>Requests queue for a free connection instead of failing, which is why p99 crossed 1.2s while the error rate stayed at 2.8%. Isolated to checkout on pay-prod-a.</p>
            </div>

            <CollapsibleLine label={`Ran investigation · ${alert.steps.length} steps · ${alert.totalDuration}`}>
              <div className="pocChat__stepChips">
                {alert.evidenceChips.map((chip, i) => (
                  <button
                    key={chip.stepId}
                    type="button"
                    className="pocChat__stepChip"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('poc-expand-step', { detail: { stepId: chip.stepId } }));
                      pocTelemetry('step_expanded', { step: chip.stepId });
                    }}
                  >
                    <span className="pocChat__stepNum">{i + 1}</span>
                    <span>{chip.label.replace(/^Step \d+ · /, '')}</span>
                  </button>
                ))}
              </div>
            </CollapsibleLine>

            {/* Recommended actions (disappears after continue) */}
            {!continued && (
              <div className="pocChat__actions">
                <div className="pocChat__actionsHeader">
                  <span className="pocChat__actionsTitle">Recommended actions</span>
                  <span className="pocChat__actionsSubtitle">choose what to do next</span>
                </div>
                <div className="pocChat__actionsList">
                  {alert.recommendations.map((rec) => {
                    const meta = ACTION_TAGS[rec.id] || {};
                    return (
                      <label key={rec.id} className="pocChat__actionItem">
                        <input
                          type="checkbox"
                          checked={checked[rec.id] || false}
                          onChange={() => setChecked((prev) => ({ ...prev, [rec.id]: !prev[rec.id] }))}
                          className="pocChat__actionCheck"
                        />
                        <div className="pocChat__actionContent">
                          <span className="pocChat__actionLabel">{rec.label}</span>
                          <span className="pocChat__actionMeta">
                            <span className="pocChat__actionTag">{meta.tag}</span>
                            {meta.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="pocChat__actionsFooter">
                  <span className="pocChat__actionsCount">{selectedCount} selected · nothing runs until you continue</span>
                  <button type="button" className="pocChat__skipBtn">Skip</button>
                  <button type="button" className="pocChat__continueBtn" onClick={() => {
                    const selectedIds = Object.keys(checked).filter((k) => checked[k]);
                    pocTelemetry('gate_action', { action: 'continue', selected: selectedIds });
                    handleContinue(selectedIds);
                  }}>Continue</button>
                </div>
              </div>
            )}

            <FeedbackButtons />
          </div>
        </div>

        {/* ─── After Continue: user bubble + second assistant message ─── */}
        {continued && (
          <>
            <div className="pocChat__userMsg">Continue</div>

            <div className="pocChat__assistantMsg">
              <div className="pocChat__msgBody">
                {executionSteps.length > 0 && (
                  <div className="pocChat__results">
                    {executionSteps.map((step, i) => (
                      <div key={i} className="pocChat__resultLine">
                        {step.status === 'running' ? (
                          <>
                            <OuiAgenticSpinner size="s" />
                            <span>Running...</span>
                          </>
                        ) : (
                          <>
                            <OuiIcon type="checkInCircleEmpty" size="s" color="success" />
                            <span>{step.text}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showSummary && (
                  <p className="pocChat__summary">
                    Done. The pool change is a suggested diff for your team to apply. The utilization monitor is live and will alert if orders-pool climbs above 85% again.
                  </p>
                )}

                {showMemory && (
                  <CollapsibleLine label="Memory updated · 3 items">
                    <div className="pocChat__memoryItems">
                      {POST_CONTINUE_MEMORY.map((item, i) => (
                        <div key={i} className="pocChat__memoryItem">{item}</div>
                      ))}
                    </div>
                  </CollapsibleLine>
                )}

                {showMemory && <FeedbackButtons />}
              </div>
            </div>
          </>
        )}

        {/* ─── Follow-up user messages ─── */}
        {followUpMessages.map((msg, i) => (
          <div key={i} className="pocChat__userMsg">{msg.content}</div>
        ))}

        {/* Olly idle — below the last message */}
        <div className="pocChat__ollyIdle" style={{ alignSelf: 'flex-start' }}>
          <OllyIdle size={20} />
        </div>
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button type="button" className="pocChat__scrollBtn" onClick={scrollToBottom} aria-label="Scroll to bottom">
          <OuiIcon type="arrowDown" size="s" />
        </button>
      )}

      <Composer inputRef={inputRef} onSend={handleSendMessage} />
    </div>
  );
};
