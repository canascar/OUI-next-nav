/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

export const DestinationsPage = ({ onContinueAsThread }) => (
  <PlaceholderPage
    title="Destinations"
    bodyText="Alerting destinations content will appear here."
    headerClassName="destinationsPage__header"
    onContinueAsThread={onContinueAsThread}
  />
);
