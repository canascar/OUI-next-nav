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
} from '../../../../src/components';

export const HomePage = () => {
  const [query, setQuery] = useState('');

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -120,
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};
