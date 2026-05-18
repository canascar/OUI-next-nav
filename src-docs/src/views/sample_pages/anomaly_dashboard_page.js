/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

export const AnomalyDashboardPage = ({ onContinueAsThread }) => (
  <PlaceholderPage
    title="Anomaly Detection Dashboard"
    bodyText="Anomaly detection dashboard content will appear here."
    headerClassName="anomalyDashboardPage__header"
    onContinueAsThread={onContinueAsThread}
  />
);
