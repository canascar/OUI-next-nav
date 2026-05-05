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

import React, { useState } from 'react';

import {
  OuiTitle,
  OuiCompressedTextArea,
  OuiButtonIcon,
  OuiListGroup,
  OuiListGroupItem,
  OuiText,
  OuiSpacer,
} from '../../../../src/components';

import { DEFAULT_THREADS } from './sample_pages_left_nav';

export const HomePage = ({ onNavigate, onContinueAsThread }) => {
  const [query, setQuery] = useState('');
  const [attentionOpen, setAttentionOpen] = useState(true);
  const [activeOpen, setActiveOpen] = useState(true);

  const MOCK_RESPONSE =
    'I looked into this and found a few things worth noting.\n\n**Summary**\n\n- The service metrics show a gradual increase in P99 latency over the past 6 hours.\n- Error rates remain within acceptable thresholds but are trending upward.\n- No recent deployments correlate with the change.\n\nI recommend checking the downstream dependency health and reviewing recent config changes in the environment.';

  const handleSend = () => {
    if (!query.trim()) return;
    if (onContinueAsThread) {
      onContinueAsThread(query.trim(), MOCK_RESPONSE);
    }
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 120,
      }}>
      <OuiTitle size="l">
        <h1 style={{ margin: 0 }}>Welcome to OpenSearch</h1>
      </OuiTitle>

      <div style={{ width: '100%', maxWidth: 600, marginTop: 24 }}>
        <div className="threadPage__inputWrapper">
          <OuiCompressedTextArea
            placeholder="Ask a question..."
            fullWidth
            resize="none"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="threadPage__textarea"
          />
          <div className="threadPage__inputActions">
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
              isDisabled={!query.trim()}
              onClick={handleSend}
            />
          </div>
        </div>

        <OuiSpacer size="m" />

        <div className="homePage__threadList">
          <div className="samplePagesLeftNav__navGroup">
            <div className="samplePagesLeftNav__navGroupHeader">
              <span className="samplePagesLeftNav__navGroupLabel">
                Needs attention
              </span>
              <OuiButtonIcon
                iconType={attentionOpen ? 'minus' : 'plus'}
                aria-label={
                  attentionOpen
                    ? 'Collapse Needs attention'
                    : 'Expand Needs attention'
                }
                size="xs"
                color="text"
                display="empty"
                onClick={() => setAttentionOpen((o) => !o)}
              />
            </div>
            {attentionOpen && (
              <OuiListGroup gutterSize="none" maxWidth={false}>
                {DEFAULT_THREADS.slice(0, 2).map((thread) => (
                  <OuiListGroupItem
                    key={thread.key}
                    label={
                      <div>
                        <OuiText size="s">
                          <strong>{thread.title}</strong>
                        </OuiText>
                        <OuiText size="xs" color="subdued">
                          {thread.subtitle}
                        </OuiText>
                      </div>
                    }
                    onClick={() =>
                      onNavigate && onNavigate('thread', thread.key)
                    }
                    extraAction={{
                      iconType: 'boxesHorizontal',
                      'aria-label': 'More actions',
                      onClick: (e) => e.stopPropagation(),
                    }}
                  />
                ))}
              </OuiListGroup>
            )}
          </div>

          <OuiSpacer size="s" />

          <div className="samplePagesLeftNav__navGroup">
            <div className="samplePagesLeftNav__navGroupHeader">
              <span className="samplePagesLeftNav__navGroupLabel">
                Active
              </span>
              <OuiButtonIcon
                iconType={activeOpen ? 'minus' : 'plus'}
                aria-label={
                  activeOpen ? 'Collapse Active' : 'Expand Active'
                }
                size="xs"
                color="text"
                display="empty"
                onClick={() => setActiveOpen((o) => !o)}
              />
            </div>
            {activeOpen && (
              <OuiListGroup gutterSize="none" maxWidth={false}>
                {DEFAULT_THREADS.slice(2).map((thread) => (
                  <OuiListGroupItem
                    key={thread.key}
                    label={
                      <div>
                        <OuiText size="s">
                          <strong>{thread.title}</strong>
                        </OuiText>
                        <OuiText size="xs" color="subdued">
                          {thread.subtitle}
                        </OuiText>
                      </div>
                    }
                    onClick={() =>
                      onNavigate && onNavigate('thread', thread.key)
                    }
                    extraAction={{
                      iconType: 'boxesHorizontal',
                      'aria-label': 'More actions',
                      onClick: (e) => e.stopPropagation(),
                    }}
                  />
                ))}
              </OuiListGroup>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
