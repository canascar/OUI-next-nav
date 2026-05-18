/*
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { PlaceholderPage } from './placeholder_page';

export const ForecastersPage = ({ onContinueAsThread }) => (
  <PlaceholderPage
    title="Forecasting"
    bodyText="Forecasting content will appear here."
    headerClassName="forecastersPage__header"
    onContinueAsThread={onContinueAsThread}
  />
);
