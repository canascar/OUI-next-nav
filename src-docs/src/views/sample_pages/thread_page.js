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

import { OuiEmptyPrompt } from '../../../../src/components';

export const ThreadPage = () => {
  return (
    <OuiEmptyPrompt
      iconType="editorComment"
      title={<h2>Threads</h2>}
      body={<p>Coming soon</p>}
    />
  );
};
