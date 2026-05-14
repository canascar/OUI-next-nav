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

import React, { useState, useRef, useEffect } from 'react';

import {
  OuiThreadInput,
  OuiThreadScrollButton,
  OuiButtonIcon,
  OuiText,
} from '../../../../src/components';

export default () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [messages] = useState([
    'Hello! How can I help you today?',
    'I can assist with data analysis, troubleshooting, and more.',
    'Feel free to ask me anything about your OpenSearch cluster.',
    'I can help you write queries, analyze logs, and debug issues.',
    'What would you like to explore?',
    'Here are some suggestions to get started...',
    'You can also upload files or paste code snippets.',
    'I\'ll do my best to provide helpful responses.',
  ]);
  const feedRef = useRef(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = feed;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(distanceFromBottom > 50);
    };

    feed.addEventListener('scroll', handleScroll);
    return () => feed.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ 
      height: 300, 
      display: 'flex', 
      flexDirection: 'column',
      border: '1px solid #D3DAE6',
      borderRadius: 6,
      overflow: 'hidden'
    }}>
      <div 
        ref={feedRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i}
            style={{
              padding: '8px 12px',
              background: '#F5F7FA',
              borderRadius: 8,
              maxWidth: '80%'
            }}
          >
            <OuiText size="s">{msg}</OuiText>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', padding: '0 8px 8px' }}>
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          top: -40
        }}>
          <OuiThreadScrollButton 
            isVisible={showScrollButton}
            onClick={scrollToBottom}
          />
        </div>
        <OuiThreadInput
          placeholder="Type a message..."
          rows={2}
          actionsLeft={
            <OuiButtonIcon iconType="plus" aria-label="Add attachment" size="s" color="text" />
          }
          actionsRight={
            <OuiButtonIcon iconType="sortUp" aria-label="Send" display="fill" size="s" color="primary" />
          }
        />
      </div>
    </div>
  );
};
