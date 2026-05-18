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

import { renderToHtml } from '../../services';

import { GuideSectionTypes } from '../../components';

import {
  OuiThreadList,
  OuiThreadListItem,
  OuiCode,
} from '../../../../src/components';

import ThreadList from './thread_list';
const threadListSource = require('!!raw-loader!./thread_list');
const threadListHtml = renderToHtml(ThreadList);

import ThreadListStatus from './thread_list_status';
const threadListStatusSource = require('!!raw-loader!./thread_list_status');
const threadListStatusHtml = renderToHtml(ThreadListStatus);

export const ThreadListExample = {
  title: 'Thread list',
  isNew: true,
  sections: [
    {
      source: [
        {
          type: GuideSectionTypes.JS,
          code: threadListSource,
        },
        {
          type: GuideSectionTypes.HTML,
          code: threadListHtml,
        },
      ],
      text: (
        <>
          <p>
            <strong>OuiThreadList</strong> displays a list of thread items,
            commonly used for showing recent conversations, investigations,
            or activity feeds. Each item can have an icon, title, description,
            status, and metadata.
          </p>
          <p>
            Use the <OuiCode>bordered</OuiCode> prop to add a border around
            the list, and <OuiCode>flush</OuiCode> to remove padding.
          </p>
        </>
      ),
      props: { OuiThreadList, OuiThreadListItem },
      demo: <ThreadList />,
      snippet: `<OuiThreadList
  items={[
    {
      title: 'Error Rate Spike',
      description: 'Thread · 2 hours ago',
      iconType: 'alert',
      status: 'Report is ready',
      statusTextColor: 'primary',
      onClick: () => {},
    },
  ]}
  bordered
/>`,
    },
    {
      title: 'With status indicators',
      source: [
        {
          type: GuideSectionTypes.JS,
          code: threadListStatusSource,
        },
        {
          type: GuideSectionTypes.HTML,
          code: threadListStatusHtml,
        },
      ],
      text: (
        <>
          <p>
            Use <OuiCode>statusColor</OuiCode> instead of <OuiCode>iconType</OuiCode>{' '}
            to display a colored health indicator dot. This is useful for showing
            severity or status at a glance.
          </p>
          <p>
            The <OuiCode>meta</OuiCode> and <OuiCode>metaSecondary</OuiCode> props
            display additional information on the right side of each item.
          </p>
        </>
      ),
      demo: <ThreadListStatus />,
      snippet: `<OuiThreadList
  items={[
    {
      title: 'Auto-scaling triggered for Catalog service',
      description: 'test-domain | os688a',
      statusColor: '#7dd3fc',
      meta: '2h 24m ago',
      metaSecondary: 'May 8, 2026 @ 08:03:04',
      onClick: () => {},
    },
  ]}
  flush
/>`,
    },
  ],
};
