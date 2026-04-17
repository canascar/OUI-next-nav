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

export const DiscoverPage = () => {
  return (
    <OuiEmptyPrompt
      iconType="discoverApp"
      title={<h2>Discover</h2>}
      body={<p>Coming soon</p>}
    />
  );
};
