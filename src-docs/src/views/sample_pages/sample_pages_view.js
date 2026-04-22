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

import React, { useState, useRef, useCallback, useEffect } from 'react';

import { SamplePagesLeftNav } from './sample_pages_left_nav';
import { ServicePage } from './service_page';
import { DiscoverPage } from './discover_page';
import { ThreadPage } from './thread_page';
import { AlertsPage } from './alerts_page';
import { DashboardsPage } from './dashboards_page';
import { SkillsPage } from './skills_page';
import { AssetsPage } from './assets_page';
import { ApplicationMapPage } from './application_map_page';
import { HomePage } from './home_page';
import { WorkspacePage } from './workspace_page';
import { OuiErrorBoundary } from '../../../../src/components';

const renderPage = (
  activePage,
  selectedItem,
  onContinueAsThread,
  pendingThread
) => {
  switch (activePage) {
    case 'home':
      return (
        <OuiErrorBoundary>
          <HomePage />
        </OuiErrorBoundary>
      );
    case 'discover':
      return (
        <OuiErrorBoundary>
          <DiscoverPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
          />
        </OuiErrorBoundary>
      );
    case 'thread':
      return (
        <OuiErrorBoundary>
          <ThreadPage
            selectedItem={selectedItem}
            pendingMessages={
              pendingThread && pendingThread.key === selectedItem
                ? pendingThread.messages
                : null
            }
          />
        </OuiErrorBoundary>
      );
    case 'alerts':
      return (
        <OuiErrorBoundary>
          <AlertsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
          />
        </OuiErrorBoundary>
      );
    case 'dashboards':
      return (
        <OuiErrorBoundary>
          <DashboardsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
          />
        </OuiErrorBoundary>
      );
    case 'skills':
      return (
        <OuiErrorBoundary>
          <SkillsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
          />
        </OuiErrorBoundary>
      );
    case 'assets':
      return (
        <OuiErrorBoundary>
          <AssetsPage
            selectedItem={selectedItem}
            onContinueAsThread={onContinueAsThread}
          />
        </OuiErrorBoundary>
      );
    case 'application-map':
      return (
        <OuiErrorBoundary>
          <ApplicationMapPage onContinueAsThread={onContinueAsThread} />
        </OuiErrorBoundary>
      );
    case 'manage-workspace':
      return (
        <OuiErrorBoundary>
          <WorkspacePage onContinueAsThread={onContinueAsThread} />
        </OuiErrorBoundary>
      );
    case 'service':
    default:
      return (
        <OuiErrorBoundary>
          <ServicePage onContinueAsThread={onContinueAsThread} />
        </OuiErrorBoundary>
      );
  }
};

export const SamplePagesView = () => {
  const [activePage, setActivePage] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingThread, setPendingThread] = useState(null); // { key, messages }
  const [expandAnim, setExpandAnim] = useState(null); // { fromRect, prompt, response }
  const createThreadRef = useRef(null);
  const contentRef = useRef(null);
  const animTimerRef = useRef(null);

  const DEFAULT_ITEMS = {
    service: 'services',
    discover: 'error-rate',
    thread: 'latency-spike',
    alerts: 'cpu-threshold',
    dashboards: 'system-overview',
    skills: 'anomaly-detector',
    assets: 'web-server-fleet',
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    setSelectedItem(DEFAULT_ITEMS[page] || null);
  };

  // Clean up animation timer on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const handleContinueAsThread = useCallback(
    (prompt, response, popoverRect) => {
      const messages = [
        { role: 'user', author: 'You', content: prompt },
        { role: 'assistant', content: response, streaming: false },
      ];

      if (popoverRect && contentRef.current) {
        // Start expand animation
        setExpandAnim({ fromRect: popoverRect, prompt, response });

        // After animation completes, navigate
        animTimerRef.current = setTimeout(() => {
          setExpandAnim(null);
          setActivePage('thread');
          if (createThreadRef.current) {
            const newKey = createThreadRef.current();
            setPendingThread({ key: newKey, messages });
          }
        }, 350);
      } else {
        // Fallback: no animation
        setActivePage('thread');
        if (createThreadRef.current) {
          const newKey = createThreadRef.current();
          setPendingThread({ key: newKey, messages });
        }
      }
    },
    []
  );

  // Compute the animation overlay style
  const renderExpandOverlay = () => {
    if (!expandAnim || !contentRef.current) return null;

    const targetRect = contentRef.current.getBoundingClientRect();
    const { fromRect, prompt, response } = expandAnim;

    return (
      <div
        className="askAiExpandOverlay"
        style={{
          '--from-left': `${fromRect.left}px`,
          '--from-top': `${fromRect.top}px`,
          '--from-width': `${fromRect.width}px`,
          '--from-height': `${fromRect.height}px`,
          '--to-left': `${targetRect.left}px`,
          '--to-top': `${targetRect.top}px`,
          '--to-width': `${targetRect.width}px`,
          '--to-height': `${targetRect.height}px`,
        }}>
        <div className="askAiExpandOverlay__content">
          <div className="askAiExpandOverlay__messages">
            <div className="askAiPopover__msg askAiPopover__msg--user">
              <p style={{ margin: 0, fontSize: 14 }}>{prompt}</p>
            </div>
            <div className="askAiPopover__msg askAiPopover__msg--assistant">
              <p style={{ margin: 0, fontSize: 14 }}>{response}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePendingConsumed = useCallback(() => {
    setPendingThread(null);
  }, []);

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
      <SamplePagesLeftNav
        activePage={activePage}
        onPageChange={handlePageChange}
        onItemSelect={setSelectedItem}
        selectedItem={selectedItem}
        onLogoClick={() => handlePageChange('home')}
        createThreadRef={createThreadRef}
        onContinueAsThread={handleContinueAsThread}
      />
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflow: 'hidden',
        }}>
        {renderPage(
          activePage,
          selectedItem,
          handleContinueAsThread,
          pendingThread
        )}
      </div>
      {renderExpandOverlay()}
    </div>
  );
};
