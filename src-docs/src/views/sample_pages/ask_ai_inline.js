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
  OuiCompressedTextArea,
  OuiIcon,
  OuiText,
} from '../../../../src/components';

// Mock AI responses cycled through on each prompt
const MOCK_AI_RESPONSES = [
  'I looked into this and found a few things worth noting. The service metrics show a gradual increase in P99 latency over the past 6 hours. Error rates remain within acceptable thresholds but are trending upward. I recommend checking the downstream dependency health and reviewing recent config changes.',
  'Based on the available data, the connection pool utilization is at 87%, approaching the configured limit. Garbage collection pauses have increased by 40% compared to last week. Consider scaling horizontally or increasing the connection pool ceiling.',
  'The spike aligns with a traffic surge from the EU region starting at 14:32 UTC. Cache hit ratio dropped from 94% to 61% during the same window. The system should stabilize once the cache warms back up.',
  'Here is a quick health check: cart is healthy at 4ms latency, checkout is degraded with 12.3% error rate, and payment-service is unhealthy with 67% connection timeouts. The payment-service is the bottleneck.',
];

export const AskAiInline = ({
  isOpen,
  onClose,
  onContinueAsThread,
  initialPrompt,
}) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const responseIdx = useRef(0);
  const streamTimers = useRef([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  // Clean up stream timers on unmount
  useEffect(() => {
    return () => streamTimers.current.forEach(clearTimeout);
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((e) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
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
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setConversation(null);
      setIsStreaming(false);
      setHasBeenDragged(false);
      setPosition({ x: 0, y: 0 });
      streamTimers.current.forEach(clearTimeout);
      streamTimers.current = [];
    }
  }, [isOpen]);

  // Auto-send initial prompt
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

  // Click outside to dismiss
  const handleClickOutside = useCallback(
    (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Delay adding listener so the opening click doesn't immediately close
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  const handleSend = () => {
    const text = message.trim();
    if (!text || isStreaming) return;

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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const containerStyle = hasBeenDragged
    ? { position: 'fixed', left: position.x, top: position.y, zIndex: 10000 }
    : {};

  return (
    <div
      className={`askAiInline${hasBeenDragged ? ' askAiInline--dragged' : ''}`}
      ref={containerRef}
      style={containerStyle}>
      {/* Conversation area above the input */}
      {conversation && (
        <div className="askAiInline__conversation">
          {/* Drag handle */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="askAiInline__dragHandle"
            onMouseDown={handleDragStart}>
            <OuiIcon type="grab" size="s" color="subdued" />
          </div>
          <div className="askAiInline__msg askAiInline__msg--user">
            <OuiText size="s">
              <p>{conversation.prompt}</p>
            </OuiText>
          </div>
          <div className="askAiInline__msg askAiInline__msg--assistant">
            <OuiText size="s">
              <p>{conversation.response}</p>
            </OuiText>
            {!isStreaming && conversation.response && (
              <div className="askAiInline__feedback">
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
                {onContinueAsThread && (
                  <OuiButtonEmpty
                    size="xs"
                    onClick={() => {
                      onContinueAsThread(
                        conversation.prompt,
                        conversation.response
                      );
                      onClose();
                    }}>
                    Continue as thread
                  </OuiButtonEmpty>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input field */}
      <div className="askAiInline__input">
        <div className="askAiInline__inputWrapper">
          <OuiCompressedTextArea
            inputRef={inputRef}
            placeholder="Ask anything. Type / for actions."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            resize="none"
            fullWidth
            className="askAiInline__textarea"
          />
          <div className="askAiInline__inputActions">
            <OuiButtonIcon
              iconType="plus"
              aria-label="Add attachment"
              size="s"
              color="text"
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
    </div>
  );
};
