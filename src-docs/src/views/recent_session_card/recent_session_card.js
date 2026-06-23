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
import { RecentSessionCard } from '../sample_pages/recent_session_card';

export default () => {
  return (
    <div
      style={{
        maxWidth: 600,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
      <RecentSessionCard
        title="Latency Spike Investigation"
        time="15 min ago"
        summary="Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified."
        tabCount={3}
        onClick={() => window.alert('Session selected')}
      />
      <RecentSessionCard
        title="Error Rate Spike — Checkout Service"
        time="2 hours ago"
        summary="Checkout error rate jumped to 12.4%. Auth-service deployment regression identified."
        tabCount={2}
        onClick={() => window.alert('Session selected')}
      />
      <RecentSessionCard
        title="New chat"
        time="Just now"
        onClick={() => window.alert('Session selected')}
      />
    </div>
  );
};
