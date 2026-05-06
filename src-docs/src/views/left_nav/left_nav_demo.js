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

import {
  OuiLeftNav,
  OuiIcon,
  OuiButtonIcon,
  OuiAvatar,
} from '../../../../src/components';

export default () => {
  return (
    <div style={{ height: 500, border: '1px solid #ccc', borderRadius: 8 }}>
      <OuiLeftNav
        logo={<OuiIcon type="logoOpenSearch" size="l" />}
        footer={
          <>
            <OuiButtonIcon
              iconType="spacesApp"
              aria-label="Workspace"
              color="text"
              display="empty"
              size="xs"
            />
            <OuiButtonIcon
              iconType="console"
              aria-label="Developer tools"
              color="text"
              display="empty"
              size="xs"
            />
            <OuiButtonIcon
              iconType="gear"
              aria-label="Settings"
              color="text"
              display="empty"
              size="xs"
            />
            <OuiAvatar name="OS" size="s" />
          </>
        }
      />
    </div>
  );
};
