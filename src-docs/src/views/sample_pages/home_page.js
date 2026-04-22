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

import React from 'react';

import { OuiText, OuiTitle } from '../../../../src/components';

export const HomePage = () => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
    <OuiTitle size="l">
      <h1 style={{ margin: 0 }}>Welcome to OpenSearch</h1>
    </OuiTitle>
    <OuiText color="subdued" style={{ marginTop: 8 }}>
      <p>Homepage work in progress</p>
    </OuiText>
  </div>
);
