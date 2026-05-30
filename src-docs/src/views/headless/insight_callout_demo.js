/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

import {
  OuiInsightCallout,
  OuiSpacer,
} from '../../../../src/components';

export default () => (
  <div style={{ maxWidth: 480 }}>
    <OuiInsightCallout
      title="Latency Spike Investigation"
      subtitle="Created by AI · 15 min ago"
      severity="warning"
      onClick={() => {}}
    />

    <OuiSpacer size="s" />

    <OuiInsightCallout
      title="Error Rate Spike — Checkout Service"
      subtitle="Shared by team · 2 hours ago"
      onClick={() => {}}
    />

    <OuiSpacer size="s" />

    <OuiInsightCallout
      title="DNS Resolution Timeout"
      subtitle="Resolved · 3 hours ago"
      severity="success"
      onClick={() => {}}
    />

    <OuiSpacer size="s" />

    <OuiInsightCallout
      title="Security vulnerability detected"
      subtitle="Critical · Requires immediate action"
      severity="danger"
      onClick={() => {}}
    />

    <OuiSpacer size="s" />

    <OuiInsightCallout
      title="New deployment available"
      subtitle="v2.4.1 ready for staging"
      severity="info"
      onClick={() => {}}
    />
  </div>
);
