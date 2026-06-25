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

import React, { useEffect, useRef } from 'react';
import { GuideSectionTypes } from '../../components';
import { OuiText, OuiSpacer, OuiTitle } from '../../../../src/components';

import shimmerSource from '!!raw-loader!./shimmer_canvas';
import ShimmerCanvas from './shimmer_canvas';

const shimmerDemo = () => <ShimmerCanvas />;

export const ShimmerExample = {
  title: 'Shimmer',
  intro: (
    <OuiText>
      <p>
        A dependency-free canvas dot-matrix shimmer for loading and agentic
        states. Drop a <code>&lt;canvas data-anim="..."&gt;</code> element and
        the shimmer script handles animation automatically.
      </p>
    </OuiText>
  ),
  sections: [
    {
      title: 'Shimmer effects',
      text: (
        <OuiText>
          <p>
            Each animation is a named effect applied via the{' '}
            <code>data-anim</code> attribute. Available: <strong>wave</strong>,{' '}
            <strong>radial</strong>, <strong>scan</strong>,{' '}
            <strong>progress</strong>, <strong>twinkle</strong>,{' '}
            <strong>orbit</strong>, <strong>hero</strong>,{' '}
            <strong>surround</strong>.
          </p>
        </OuiText>
      ),
      demo: shimmerDemo(),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: shimmerSource,
        },
      ],
    },
  ],
};
