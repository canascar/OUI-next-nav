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

import { GuideSectionTypes } from '../../components';

import { OuiCode, OuiText, OuiCallOut } from '../../../../src/components';

import VisualizationCard from './visualization_card';
const visualizationCardSource = require('!!raw-loader!./visualization_card');

import VisualizationCardTypes from './visualization_card_types';
const visualizationCardTypesSource = require('!!raw-loader!./visualization_card_types');

import VisualizationCardInteractive from './visualization_card_interactive';
const visualizationCardInteractiveSource = require('!!raw-loader!./visualization_card_interactive');

export const VisualizationCardExample = {
  title: 'Visualization card',
  intro: (
    <>
      <OuiText>
        <p>
          <strong>TempVisualizationCard</strong> is a frosted glass card
          component designed for displaying mini chart visualizations. It
          features a backdrop blur effect, theme-aware styling, and smooth scale
          animations on interaction.
        </p>
      </OuiText>
      <OuiCallOut
        title="Experimental component"
        color="warning"
        iconType="beaker">
        <p>
          This component is currently experimental and may change. It is
          designed for use in AI/assistant interfaces where visualization
          previews are needed.
        </p>
      </OuiCallOut>
    </>
  ),
  sections: [
    {
      title: 'Basic usage',
      source: [
        {
          type: GuideSectionTypes.JS,
          code: visualizationCardSource,
        },
      ],
      text: (
        <div>
          <p>
            The <strong>TempVisualizationCard</strong> component displays a mini
            chart with a title and description. It uses a frosted glass effect
            with <OuiCode>backdrop-filter: blur(20px)</OuiCode> and a
            semi-transparent background.
          </p>
          <p>
            Pass an <OuiCode>onClick</OuiCode> handler to make the card
            interactive. Interactive cards show a scale-up animation on hover
            and a bouncy scale-down on click.
          </p>
        </div>
      ),
      demo: <VisualizationCard />,
      snippet: `<TempVisualizationCard
  title="Error Rate Over Time"
  description="Error rate across all services"
  type="line"
  color="#ED6F73"
  onClick={() => handleClick()}
/>`,
    },
    {
      title: 'Chart types',
      source: [
        {
          type: GuideSectionTypes.JS,
          code: visualizationCardTypesSource,
        },
      ],
      text: (
        <p>
          The <OuiCode>type</OuiCode> prop accepts: <OuiCode>line</OuiCode>,
          <OuiCode>bar</OuiCode>, <OuiCode>area</OuiCode>,{' '}
          <OuiCode>gauge</OuiCode>,<OuiCode>pie</OuiCode>,{' '}
          <OuiCode>table</OuiCode>, <OuiCode>heatmap</OuiCode>, and{' '}
          <OuiCode>histogram</OuiCode>. Each renders a simple SVG placeholder
          visualization in the specified color.
        </p>
      ),
      demo: <VisualizationCardTypes />,
    },
    {
      title: 'Interactive behavior',
      source: [
        {
          type: GuideSectionTypes.JS,
          code: visualizationCardInteractiveSource,
        },
      ],
      text: (
        <div>
          <p>
            When an <OuiCode>onClick</OuiCode> handler is provided, the card
            becomes interactive with the following animations:
          </p>
          <ul>
            <li>
              <strong>Hover:</strong> Scale up to 1.03 with a smooth 150ms ease
              transition
            </li>
            <li>
              <strong>Active (click):</strong> Scale down to 0.97 with a bouncy
              spring-back effect
            </li>
          </ul>
          <p>
            The bouncy effect uses a custom cubic-bezier timing function
            <OuiCode>(0.34, 1.56, 0.64, 1)</OuiCode> for a satisfying tactile
            feel.
          </p>
        </div>
      ),
      demo: <VisualizationCardInteractive />,
    },
  ],
};
