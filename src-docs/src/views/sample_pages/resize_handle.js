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

import React, { useState, useRef, useEffect } from 'react';

/**
 * ResizeHandle — A draggable divider between ThreadPanel and PagePanel.
 *
 * Only visible when ThreadPanel is in side-by-side state. Supports both
 * mouse drag and keyboard (Arrow Left/Right) resizing. Constrains width
 * between 20% and 80%.
 *
 * Props:
 * @param {(leftWidthPercent: number) => void} onResize - Callback on every drag frame (for DOM updates)
 * @param {(leftWidthPercent: number) => void} onResizeEnd - Callback when drag ends (for state commit)
 * @param {boolean} isActive - Whether the handle is visible (true in side-by-side state)
 */
export const ResizeHandle = ({ onResize, onResizeEnd, isActive }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(50);
  const handleRef = useRef(null);
  const isDraggingRef = useRef(false);
  const onResizeRef = useRef(onResize);
  const onResizeEndRef = useRef(onResizeEnd);
  const lastWidthRef = useRef(50);

  const MIN_WIDTH = 20;
  const MAX_WIDTH = 80;
  const KEYBOARD_INCREMENT = 2;

  // Keep refs current without re-registering listeners
  useEffect(() => {
    onResizeRef.current = onResize;
    onResizeEndRef.current = onResizeEnd;
  }, [onResize, onResizeEnd]);

  /** Clamp a value between min and max */
  const clamp = (value) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value));

  /** Mouse move/up handlers — stable, never re-registered */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const container = handleRef.current?.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const percentage = (relativeX / containerRect.width) * 100;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, percentage));

      lastWidthRef.current = newWidth;
      // Call onResize for direct DOM manipulation — no React state update
      if (onResizeRef.current) {
        onResizeRef.current(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      setCurrentWidth(lastWidthRef.current);
      document.body.classList.remove('resizeHandle--dragging');
      // Commit final width to state
      if (onResizeEndRef.current) {
        onResizeEndRef.current(lastWidthRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []); // Stable — never re-registers

  /** Mouse down handler to start drag */
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.classList.add('resizeHandle--dragging');
  };

  /** Keyboard handler for Arrow Left/Right resizing */
  const handleKeyDown = (e) => {
    let newWidth = currentWidth;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newWidth = clamp(currentWidth - KEYBOARD_INCREMENT);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      newWidth = clamp(currentWidth + KEYBOARD_INCREMENT);
    } else {
      return;
    }

    setCurrentWidth(newWidth);
    if (onResize) onResize(newWidth);
    if (onResizeEnd) onResizeEnd(newWidth);
  };

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={handleRef}
      className={`resizeHandle${isDragging ? ' resizeHandle--active' : ''}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      role="separator"
      aria-label="Resize panels"
      aria-valuenow={Math.round(currentWidth)}
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      tabIndex={0}
    />
  );
};
