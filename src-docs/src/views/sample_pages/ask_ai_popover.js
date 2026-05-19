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

import React, { useState, useRef, useCallback, useEffect } from 'react';

import {
  OuiButtonEmpty,
  OuiButtonIcon,
  OuiCompressedFieldText,
  OuiIcon,
  OuiText,
  OuiToolTip,
} from '../../../../src/components';

// Mock AI responses cycled through on each prompt
const MOCK_AI_RESPONSES = [
  'I looked into this and found a few things worth noting. The service metrics show a gradual increase in P99 latency over the past 6 hours. Error rates remain within acceptable thresholds but are trending upward. I recommend checking the downstream dependency health and reviewing recent config changes.',
  'Based on the available data, the connection pool utilization is at 87%, approaching the configured limit. Garbage collection pauses have increased by 40% compared to last week. Consider scaling horizontally or increasing the connection pool ceiling.',
  'The spike aligns with a traffic surge from the EU region starting at 14:32 UTC. Cache hit ratio dropped from 94% to 61% during the same window. The system should stabilize once the cache warms back up.',
  'Here is a quick health check: cart is healthy at 4ms latency, checkout is degraded with 12.3% error rate, and payment-service is unhealthy with 67% connection timeouts. The payment-service is the bottleneck.',
];

export const AskAiPopover = ({
  isOpen,
  onClose,
  onMinimize,
  onContinueAsThread,
  onDetach,
  initialPrompt,
  anchorPosition,
  mode = 'popover', // 'panel' or 'popover'
}) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null); // { prompt, response }
  const [isStreaming, setIsStreaming] = useState(false);
  const responseIdx = useRef(0);
  const streamTimers = useRef([]);
  const popoverRef = useRef(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  const isPanel = mode === 'panel';

  // Clean up stream timers on unmount or close
  useEffect(() => {
    return () => streamTimers.current.forEach(clearTimeout);
  }, []);

  // Reset drag position when popover hides
  useEffect(() => {
    if (!isOpen) {
      setHasBeenDragged(false);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Pre-fill message from initialPrompt and auto-send
  useEffect(() => {
    if (isOpen && initialPrompt) {
      const text = initialPrompt.trim();
      if (!text) return;

      const idx = responseIdx.current % MOCK_AI_RESPONSES.length;
      responseIdx.current += 1;
      const fullResponse = MOCK_AI_RESPONSES[idx];

      setConversation({ prompt: text, response: '' });
      setMessage('');
      setIsStreaming(true);

      const words = fullResponse.split(/(\s+)/);
      let built = '';
      words.forEach((word, i) => {
        const timer = setTimeout(() => {
          built += word;
          setConversation({ prompt: text, response: built });
          if (i === words.length - 1) {
            setIsStreaming(false);
          }
        }, i * 25);
        streamTimers.current.push(timer);
      });
    }
  }, [isOpen, initialPrompt]);

  // Drag handlers — only for popover mode
  const handleDragStart = useCallback(
    (e) => {
      if (isPanel) return;
      if (!popoverRef.current) return;
      e.preventDefault();
      const rect = popoverRef.current.getBoundingClientRect();
      dragState.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: rect.left,
        origY: rect.top,
      };
      document.body.style.userSelect = 'none';
    },
    [isPanel]
  );

  useEffect(() => {
    if (isPanel) return;
    const handleDragMove = (e) => {
      if (!dragState.current.isDragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setPosition({
        x: dragState.current.origX + dx,
        y: dragState.current.origY + dy,
      });
      setHasBeenDragged(true);
    };
    const handleDragEnd = () => {
      dragState.current.isDragging = false;
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isPanel]);

  const handleSend = () => {
    const text = message.trim();
    if (!text || isStreaming) return;

    const idx = responseIdx.current % MOCK_AI_RESPONSES.length;
    responseIdx.current += 1;
    const fullResponse = MOCK_AI_RESPONSES[idx];

    setConversation({ prompt: text, response: '' });
    setMessage('');
    setIsStreaming(true);

    // Stream the response word by word
    const words = fullResponse.split(/(\s+)/);
    let built = '';
    words.forEach((word, i) => {
      const timer = setTimeout(() => {
        built += word;
        setConversation({ prompt: text, response: built });
        if (i === words.length - 1) {
          setIsStreaming(false);
        }
      }, i * 25);
      streamTimers.current.push(timer);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  // Panel mode: no inline positioning, rendered as a flex child
  const popoverStyle = isPanel
    ? {}
    : hasBeenDragged
    ? { position: 'fixed', left: position.x, top: position.y, zIndex: 10000 }
    : anchorPosition
    ? {
        position: 'fixed',
        top: anchorPosition.top,
        left: anchorPosition.left,
        transform: 'translateX(-50%)',
        zIndex: 10000,
      }
    : {};

  const className = isPanel
    ? 'askAiPopover askAiPopover--panel'
    : `askAiPopover${hasBeenDragged ? ' askAiPopover--dragged' : ''}${
        !hasBeenDragged && anchorPosition ? ' askAiPopover--anchored' : ''
      }`;

  return (
    <div ref={popoverRef} className={className} style={popoverStyle}>
      {/* Header */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={`askAiPopover__header${
          isPanel ? ' askAiPopover__header--panel' : ''
        }`}
        onMouseDown={!isPanel ? handleDragStart : undefined}
        role="banner">
        <div className="askAiPopover__headerLeft">
          <span className="askAiPopover__title">Ask AI</span>
        </div>
        {!isPanel && (
          <OuiIcon
            className="askAiPopover__grabIcon"
            type="grab"
            size="m"
            color="subdued"
          />
        )}
        <div className="askAiPopover__headerRight">
          {isPanel && onDetach && (
            <OuiToolTip content="Detach to popover" position="bottom">
              <OuiButtonIcon
                iconType="dockedDetached"
                aria-label="Detach to popover"
                size="xs"
                color="text"
                onClick={onDetach}
              />
            </OuiToolTip>
          )}
          <OuiButtonIcon
            iconType="minus"
            aria-label="Minimize"
            size="xs"
            color="text"
            onClick={onMinimize}
          />
          <OuiButtonIcon
            iconType="cross"
            aria-label="Close"
            size="xs"
            color="text"
            onClick={() => {
              // Full dismiss — clear conversation
              setMessage('');
              setConversation(null);
              setIsStreaming(false);
              streamTimers.current.forEach(clearTimeout);
              streamTimers.current = [];
              onClose();
            }}
          />
        </div>
      </div>

      {/* Chat body */}
      <div className="askAiPopover__body">
        {conversation ? (
          <div className="askAiPopover__messages">
            {/* User prompt */}
            <div className="askAiPopover__msg askAiPopover__msg--user">
              <OuiText size="s">
                <p>{conversation.prompt}</p>
              </OuiText>
            </div>
            {/* AI response */}
            <div className="askAiPopover__msg askAiPopover__msg--assistant">
              <OuiText size="s">
                <p>{conversation.response}</p>
              </OuiText>
              {!isStreaming && conversation.response && (
                <div className="askAiPopover__feedback">
                  <OuiButtonIcon
                    iconType="thumbsUp"
                    aria-label="Helpful"
                    size="xs"
                    color="text"
                  />
                  <OuiButtonIcon
                    iconType="thumbsDown"
                    aria-label="Not helpful"
                    size="xs"
                    color="text"
                  />
                  <OuiButtonEmpty
                    size="xs"
                    onClick={() => {
                      if (onContinueAsThread && popoverRef.current) {
                        const rect = popoverRef.current.getBoundingClientRect();
                        onContinueAsThread(
                          conversation.prompt,
                          conversation.response,
                          rect
                        );
                      }
                      onClose();
                    }}>
                    Continue as thread
                  </OuiButtonEmpty>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="askAiPopover__empty">
            <OuiText size="s" color="subdued">
              <p>Ask a question about this page</p>
            </OuiText>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="askAiPopover__input">
        <div className="askAiPopover__inputWrapper">
          <OuiCompressedFieldText
            placeholder="Ask anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
          />
          <OuiButtonIcon
            iconType="sortUp"
            aria-label="Send message"
            display="fill"
            size="s"
            isDisabled={!message.trim() || isStreaming}
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
};
