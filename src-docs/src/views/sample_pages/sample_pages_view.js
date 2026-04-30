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
import { LoginPage } from './login_page';
import { OuiErrorBoundary, OuiPanel } from '../../../../src/components';

const renderPage = (activePage, selectedItem, handlePageChange) => {
  switch (activePage) {
    case 'login':
      return (
        <OuiErrorBoundary>
          <LoginPage onLogin={() => handlePageChange('service')} />
        </OuiErrorBoundary>
      );
    case 'discover':
      return (
        <OuiErrorBoundary>
          <DiscoverPage selectedItem={selectedItem} />
        </OuiErrorBoundary>
      );
    case 'thread':
      return (
        <OuiErrorBoundary>
          <ThreadPage selectedItem={selectedItem} />
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [padding, setPadding] = useState(8);
  const [gap, setGap] = useState(8);
  const [cardPadding, setCardPadding] = useState(8);
  const [gutter, setGutter] = useState(8);
  const [showLabels, setShowLabels] = useState(true);

  const DEFAULT_ITEMS = {
    service: 'services',
    discover: 'error-rate',
    thread: 'latency-spike',
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setSelectedItem(DEFAULT_ITEMS[page] || null);
  };

  if (activePage === 'login') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          animation: 'fadeInLogin 400ms ease-out forwards',
        }}>
        <style>{`
          @keyframes fadeInLogin {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
        <LoginPage onLogin={() => handlePageChange('service')} />
      </div>
    );
  }

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
      <style>{`
        .samplePagesContent .ouiPanel {
          padding: ${cardPadding}px !important;
        }
        .samplePagesContent .ouiFlexGroup--gutterSmall > .ouiFlexItem {
          margin: ${Math.round(gutter * 0.25)}px !important;
        }
        .samplePagesContent .ouiFlexGroup--gutterMedium > .ouiFlexItem {
          margin: ${Math.round(gutter * 0.5)}px !important;
        }
        .samplePagesContent .ouiFlexGroup--gutterLarge > .ouiFlexItem {
          margin: ${Math.round(gutter * 0.5)}px !important;
        }
        .samplePagesContent .ouiFlexGroup--gutterSmall {
          margin: -${Math.round(gutter * 0.25)}px !important;
        }
        .samplePagesContent .ouiFlexGroup--gutterMedium {
          margin: -${Math.round(gutter * 0.5)}px !important;
        }
        .samplePagesContent .ouiFlexGroup--gutterLarge {
          margin: -${Math.round(gutter * 0.5)}px !important;
        }
        .samplePagesContent .ouiSpacer--l {
          height: ${gap}px !important;
        }
        .samplePagesContent .ouiSpacer--m {
          height: ${Math.round(gap * 0.66)}px !important;
        }
        .samplePagesContent .ouiSpacer--s {
          height: ${Math.round(gap * 0.33)}px !important;
        }
      `}</style>
      <SamplePagesLeftNav
        activePage={activePage}
        onPageChange={handlePageChange}
        onItemSelect={setSelectedItem}
        selectedItem={selectedItem}
        padding={padding}
        onPaddingChange={setPadding}
        gap={gap}
        onGapChange={setGap}
        cardPadding={cardPadding}
        onCardPaddingChange={setCardPadding}
        gutter={gutter}
        onGutterChange={setGutter}
        showLabels={showLabels}
        onShowLabelsChange={setShowLabels}
      />
      <div
        className="samplePagesContent"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding,
          paddingLeft: 0,
        }}>
        <OuiPanel
          paddingSize="none"
          className="samplePagesMainPanel"
          style={{ minHeight: '100%' }}>
          {renderPage(activePage, selectedItem, handlePageChange)}
        </OuiPanel>
      </div>
    </div>
  );
};
