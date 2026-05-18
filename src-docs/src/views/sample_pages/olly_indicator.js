/*
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../components/with_theme';

const LABELS = ['Thinking...', 'Processing...', 'Gathering...', 'Sifting through...', 'Mining...', 'Uncovering...', 'Searching...'];

const getRandomLabel = () => LABELS[Math.floor(Math.random() * LABELS.length)];

/**
 * OllyIndicator - Animated logo that transitions through states:
 * - process-label: outline draw → fill → breathe + shimmer text (shown if loading > 2s)
 * - process-empty: outline draw → fill → breathe (no text)
 * - process-breath: just the breathe animation (no outline draw)
 * - idle: static logo with hover glare + tooltip
 *
 * Props:
 * - state: 'idle' | 'processing' | 'process-label' | 'process-empty' | 'process-breath'
 */
export const OllyIndicator = ({ state = 'idle' }) => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const [showLabel, setShowLabel] = useState(false);
  const [label] = useState(getRandomLabel);
  const [animKey, setAnimKey] = useState(0);

  // Show label only if processing lasts > 2s
  useEffect(() => {
    if (state === 'processing' || state === 'process-label' || state === 'process-empty') {
      setShowLabel(false);
      setAnimKey((k) => k + 1);
      if (state === 'process-label') {
        setShowLabel(true);
      }
      return;
    } else {
      setShowLabel(false);
    }
  }, [state]);

  // Colors - Agentic OSD Utility palette
  const primary = isDark ? '#7A9FD4' : '#2E4A8F';      // Amethyst (dark) / Minsk (light)
  const secondary = isDark ? '#B8D4F0' : '#4168B8';   // Rose Quartz (dark) / Violet Topaz (light)
  const textColor = isDark ? '#aaa' : '#888';
  const shimmerLight = isDark ? '#fff' : '#ccc';
  const glareColor = isDark ? '#7A9FD4' : '#4168B8';  // Amethyst (dark) / Violet Topaz (light)

  if (state === 'idle') {
    return (
      <div
        className="olly-idle"
        style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={(e) => {
          const el = e.currentTarget;
          el.classList.remove('olly-bounce');
          void el.offsetWidth;
          el.classList.add('olly-bounce');
        }}>
        <style>{`
          .olly-idle svg {
            width: 28px; height: 28px;
            transition: filter 0.3s ease;
          }
          .olly-idle:hover svg {
            filter: drop-shadow(0 0 6px ${glareColor}80);
          }
          .olly-idle svg path {
            transition: stroke 0.3s ease;
            stroke: transparent; stroke-width: 0;
          }
          .olly-idle:hover svg path {
            stroke: ${glareColor};
            stroke-width: 1.5;
            stroke-dasharray: 60 140;
            animation: ollyGlareR 2s linear infinite;
          }
          .olly-idle:hover svg path:nth-child(2) { animation-delay: -0.7s; }
          .olly-idle:hover svg path:nth-child(3) { animation-delay: -1.4s; }
          @keyframes ollyGlareR { to { stroke-dashoffset: -200; } }
          .olly-bounce svg {
            animation: ollyBounceAnim 0.6s ease;
          }
          @keyframes ollyBounceAnim {
            0% { transform: scale(1); }
            20% { transform: scale(0.85); }
            50% { transform: scale(1.2); }
            70% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          .olly-idle .olly-tooltip {
            position: absolute;
            left: calc(100% + 8px);
            top: 50%;
            transform: translateY(-50%) translateX(-4px);
            background: ${isDark ? '#333' : '#222'};
            color: ${isDark ? '#eee' : '#fff'};
            font-size: 12px;
            padding: 6px 10px;
            border-radius: 6px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          .olly-idle:hover .olly-tooltip {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        `}</style>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
            <path d="M61.7374 23.5C60.4878 23.5 59.4748 24.513 59.4748 25.7626C59.4748 44.3813 44.3813 59.4748 25.7626 59.4748C24.513 59.4748 23.5 60.4878 23.5 61.7374C23.5 62.987 24.513 64 25.7626 64C46.8805 64 64 46.8805 64 25.7626C64 24.513 62.987 23.5 61.7374 23.5Z" fill={primary}/>
            <path d="M48.0814 38C50.2572 34.4505 52.3615 29.7178 51.9475 23.0921C51.0899 9.36725 38.6589 -1.04463 26.9206 0.0837327C22.3253 0.525465 17.6068 4.2712 18.026 10.9805C18.2082 13.8961 19.6352 15.6169 21.9544 16.9399C24.1618 18.1992 26.9978 18.9969 30.2128 19.9011C34.0962 20.9934 38.6009 22.2203 42.063 24.7717C46.2125 27.8295 49.0491 31.3743 48.0814 38Z" fill={secondary}/>
            <path d="M3.91861 14C1.74276 17.5495 -0.361506 22.2822 0.0524931 28.9079C0.910072 42.6327 13.3411 53.0446 25.0794 51.9163C29.6747 51.4745 34.3932 47.7288 33.974 41.0195C33.7918 38.1039 32.3647 36.3831 30.0456 35.0601C27.8382 33.8008 25.0022 33.0031 21.7872 32.0989C17.9038 31.0066 13.3991 29.7797 9.93694 27.2283C5.78746 24.1704 2.95092 20.6257 3.91861 14Z" fill={primary}/>
          </svg>
          <div className="olly-tooltip">Olly is here to help you</div>
        </div>
      </div>
    );
  }

  // Process-breath state: just the breathe animation, no outline draw
  if (state === 'process-breath') {
    return (
      <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <style>{`
          .olly-breath svg {
            width: 28px; height: 28px;
          }
          .olly-breath .olly-breath-wrap {
            position: relative;
            width: 28px; height: 28px;
            flex-shrink: 0;
            animation: ollyBreathe 3s ease-in-out infinite;
          }
          .olly-breath .olly-breath-wrap path:nth-child(1) { fill: ${primary}; }
          .olly-breath .olly-breath-wrap path:nth-child(2) { fill: ${secondary}; }
          .olly-breath .olly-breath-wrap path:nth-child(3) { fill: ${primary}; }
          @keyframes ollyBreathe {
            0%, 100% { transform: scale(0.92); opacity: 0.6; }
            50% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <div className="olly-breath">
          <div className="olly-breath-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
              <path d="M61.7374 23.5C60.4878 23.5 59.4748 24.513 59.4748 25.7626C59.4748 44.3813 44.3813 59.4748 25.7626 59.4748C24.513 59.4748 23.5 60.4878 23.5 61.7374C23.5 62.987 24.513 64 25.7626 64C46.8805 64 64 46.8805 64 25.7626C64 24.513 62.987 23.5 61.7374 23.5Z"/>
              <path d="M48.0814 38C50.2572 34.4505 52.3615 29.7178 51.9475 23.0921C51.0899 9.36725 38.6589 -1.04463 26.9206 0.0837327C22.3253 0.525465 17.6068 4.2712 18.026 10.9805C18.2082 13.8961 19.6352 15.6169 21.9544 16.9399C24.1618 18.1992 26.9978 18.9969 30.2128 19.9011C34.0962 20.9934 38.6009 22.2203 42.063 24.7717C46.2125 27.8295 49.0491 31.3743 48.0814 38Z"/>
              <path d="M3.91861 14C1.74276 17.5495 -0.361506 22.2822 0.0524931 28.9079C0.910072 42.6327 13.3411 53.0446 25.0794 51.9163C29.6747 51.4745 34.3932 47.7288 33.974 41.0195C33.7918 38.1039 32.3647 36.3831 30.0456 35.0601C27.8382 33.8008 25.0022 33.0031 21.7872 32.0989C17.9038 31.0066 13.3991 29.7797 9.93694 27.2283C5.78746 24.1704 2.95092 20.6257 3.91861 14Z"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  return (
    <div key={animKey} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <style>{`
        .olly-process svg {
          width: 28px; height: 28px;
        }
        .olly-process .olly-outline path {
          fill: none;
          stroke: ${primary};
          stroke-width: 2;
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: ollyDraw 1.8s ease forwards;
        }
        .olly-process .olly-outline path:nth-child(2) {
          animation-delay: 0.3s;
          stroke: ${secondary};
        }
        .olly-process .olly-outline path:nth-child(3) {
          animation-delay: 0.6s;
        }
        .olly-process .olly-fill {
          opacity: 0;
          animation: ollyFillIn 0.6s ease forwards;
          animation-delay: 1.8s;
        }
        .olly-process .olly-fill path:nth-child(1) { fill: ${primary}; }
        .olly-process .olly-fill path:nth-child(2) { fill: ${secondary}; }
        .olly-process .olly-fill path:nth-child(3) { fill: ${primary}; }
        .olly-process .olly-wrap {
          position: relative;
          width: 28px; height: 28px;
          flex-shrink: 0;
          animation: ollyBreathe 3s ease-in-out infinite;
          animation-delay: 2.4s;
        }
        .olly-label {
          opacity: 0;
          font-size: 13px;
          font-style: italic;
          background: linear-gradient(90deg, ${textColor} 0%, ${shimmerLight} 50%, ${textColor} 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ollyTextIn 0.4s ease forwards, ollyShimmer 2.5s ease-in-out infinite;
          animation-delay: 2.6s, 3s;
        }
        @keyframes ollyDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ollyFillIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes ollyBreathe {
          0%, 100% { transform: scale(0.92); opacity: 0.6; }
          50% { transform: scale(1); opacity: 1; }
        }
        @keyframes ollyTextIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes ollyShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="olly-process">
        <div className="olly-wrap">
          <svg className="olly-outline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
            <path d="M61.7374 23.5C60.4878 23.5 59.4748 24.513 59.4748 25.7626C59.4748 44.3813 44.3813 59.4748 25.7626 59.4748C24.513 59.4748 23.5 60.4878 23.5 61.7374C23.5 62.987 24.513 64 25.7626 64C46.8805 64 64 46.8805 64 25.7626C64 24.513 62.987 23.5 61.7374 23.5Z"/>
            <path d="M48.0814 38C50.2572 34.4505 52.3615 29.7178 51.9475 23.0921C51.0899 9.36725 38.6589 -1.04463 26.9206 0.0837327C22.3253 0.525465 17.6068 4.2712 18.026 10.9805C18.2082 13.8961 19.6352 15.6169 21.9544 16.9399C24.1618 18.1992 26.9978 18.9969 30.2128 19.9011C34.0962 20.9934 38.6009 22.2203 42.063 24.7717C46.2125 27.8295 49.0491 31.3743 48.0814 38Z"/>
            <path d="M3.91861 14C1.74276 17.5495 -0.361506 22.2822 0.0524931 28.9079C0.910072 42.6327 13.3411 53.0446 25.0794 51.9163C29.6747 51.4745 34.3932 47.7288 33.974 41.0195C33.7918 38.1039 32.3647 36.3831 30.0456 35.0601C27.8382 33.8008 25.0022 33.0031 21.7872 32.0989C17.9038 31.0066 13.3991 29.7797 9.93694 27.2283C5.78746 24.1704 2.95092 20.6257 3.91861 14Z"/>
          </svg>
          <svg className="olly-fill" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" style={{ position: 'relative' }}>
            <path d="M61.7374 23.5C60.4878 23.5 59.4748 24.513 59.4748 25.7626C59.4748 44.3813 44.3813 59.4748 25.7626 59.4748C24.513 59.4748 23.5 60.4878 23.5 61.7374C23.5 62.987 24.513 64 25.7626 64C46.8805 64 64 46.8805 64 25.7626C64 24.513 62.987 23.5 61.7374 23.5Z"/>
            <path d="M48.0814 38C50.2572 34.4505 52.3615 29.7178 51.9475 23.0921C51.0899 9.36725 38.6589 -1.04463 26.9206 0.0837327C22.3253 0.525465 17.6068 4.2712 18.026 10.9805C18.2082 13.8961 19.6352 15.6169 21.9544 16.9399C24.1618 18.1992 26.9978 18.9969 30.2128 19.9011C34.0962 20.9934 38.6009 22.2203 42.063 24.7717C46.2125 27.8295 49.0491 31.3743 48.0814 38Z"/>
            <path d="M3.91861 14C1.74276 17.5495 -0.361506 22.2822 0.0524931 28.9079C0.910072 42.6327 13.3411 53.0446 25.0794 51.9163C29.6747 51.4745 34.3932 47.7288 33.974 41.0195C33.7918 38.1039 32.3647 36.3831 30.0456 35.0601C27.8382 33.8008 25.0022 33.0031 21.7872 32.0989C17.9038 31.0066 13.3991 29.7797 9.93694 27.2283C5.78746 24.1704 2.95092 20.6257 3.91861 14Z"/>
          </svg>
        </div>
      </div>
      {showLabel && <span className="olly-label">{label}</span>}
    </div>
  );
};
