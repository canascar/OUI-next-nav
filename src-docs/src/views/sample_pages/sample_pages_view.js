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

import { SamplePagesLeftNav } from './sample_pages_left_nav';
import { ServicePage } from './service_page';
import { DiscoverPage } from './discover_page';
import { ThreadPage } from './thread_page';
import { OuiErrorBoundary } from '../../../../src/components';

const renderPage = (activePage) => {
  switch (activePage) {
    case 'discover':
      return (
        <OuiErrorBoundary>
          <DiscoverPage />
        </OuiErrorBoundary>
      );
    case 'thread':
      return (
        <OuiErrorBoundary>
          <ThreadPage />
        </OuiErrorBoundary>
      );
    case 'service':
    default:
      return (
        <OuiErrorBoundary>
          <ServicePage />
        </OuiErrorBoundary>
      );
  }
};

export const SamplePagesView = () => {
  const [activePage, setActivePage] = useState('service');

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      <SamplePagesLeftNav
        activePage={activePage}
        onPageChange={setActivePage}
      />
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}>
        {renderPage(activePage)}
      </div>
    </div>
  );
};
