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

import React, { useContext, useState } from 'react';

import { SamplePagesLeftNav } from './sample_pages_left_nav';
import { ServicePage } from './service_page';
import { DiscoverPage } from './discover_page';
import { ThreadPage } from './thread_page';
import { ThreadsPage } from './threads_page';
import { RecentsPage } from './recents_page';
import { LoginPage } from './login_page';
import { OverviewPage } from './overview_page';
import { OuiErrorBoundary } from '../../../../src/components';
import { ThemeContext } from '../../components/with_theme';

const renderPage = (activePage, selectedItem, handlePageChange) => {
  switch (activePage) {
    case 'login':
      return (
        <OuiErrorBoundary>
          <LoginPage onLogin={() => handlePageChange('service')} />
        </OuiErrorBoundary>
      );
    case 'overview':
      return (
        <OuiErrorBoundary>
          <OverviewPage />
        </OuiErrorBoundary>
      );
    case 'threads':
      return (
        <OuiErrorBoundary>
          <ThreadsPage onPageChange={handlePageChange} />
        </OuiErrorBoundary>
      );
    case 'recents':
      return (
        <OuiErrorBoundary>
          <RecentsPage onPageChange={handlePageChange} />
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
    case 'dashboards':
    case 'logs':
    case 'metrics':
    case 'topology':
    case 'agent-traces':
    case 'spans':
    case 'app-traces':
    default:
      return (
        <OuiErrorBoundary>
          <ServicePage />
        </OuiErrorBoundary>
      );
  }
};

export const SamplePagesView = () => {
  const [activePage, setActivePage] = useState('threads');
  const [selectedItem, setSelectedItem] = useState(null);
  const [padding, setPadding] = useState(8);
  const [gap, setGap] = useState(8);
  const [cardPadding, setCardPadding] = useState(8);
  const [gutter, setGutter] = useState(8);
  const [showLabels, setShowLabels] = useState(true);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';

  // Agentic OSD Utility: Graph paper grid background
  // Grid colors: Deep Blue for light mode, Sky for dark mode
  const gridColor = isDark
    ? 'rgba(122, 159, 212, 0.06)'  // Sky blue for dark
    : 'rgba(46, 74, 143, 0.04)';   // Deep blue for light (scaled back)
  const gridColorSmall = isDark
    ? 'rgba(122, 159, 212, 0.025)'
    : 'rgba(46, 74, 143, 0.015)';
  const bgColor = isDark
    ? '#060D1A'  // Obsidian
    : '#F4F6FB'; // Opal

  const gridBackground = `
    linear-gradient(to right, ${gridColor} 1px, transparent 1px),
    linear-gradient(to bottom, ${gridColor} 1px, transparent 1px),
    linear-gradient(to right, ${gridColorSmall} 1px, transparent 1px),
    linear-gradient(to bottom, ${gridColorSmall} 1px, transparent 1px)
  `;

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
        backgroundColor: bgColor,
        backgroundImage: gridBackground,
        backgroundSize: '24px 24px, 24px 24px, 6px 6px, 6px 6px',
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
        key={activePage}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding,
          paddingLeft: padding + 8,
          animation: 'pageFadeIn 300ms ease-out forwards',
        }}>
        <style>{`
          @keyframes pageFadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {renderPage(activePage, selectedItem, handlePageChange)}
      </div>
    </div>
  );
};
