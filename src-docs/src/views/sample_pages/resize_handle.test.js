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
import { render, fireEvent } from '@testing-library/react';

import { ResizeHandle } from './resize_handle';

describe('ResizeHandle', () => {
  // ============================================================================
  // Visibility based on isActive prop
  // Validates: Requirements 5.1
  // ============================================================================
  describe('visibility', () => {
    test('renders nothing when isActive is false', () => {
      const { container } = render(
        <ResizeHandle onResize={jest.fn()} isActive={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    test('renders the handle when isActive is true', () => {
      const { container } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      expect(container.firstChild).not.toBeNull();
      expect(container.firstChild).toHaveClass('resizeHandle');
    });
  });

  // ============================================================================
  // Keyboard accessibility
  // Validates: Requirements 11.3, 11.4
  // ============================================================================
  describe('keyboard accessibility', () => {
    test('has role="separator"', () => {
      const { getByRole } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      expect(getByRole('separator')).toBeInTheDocument();
    });

    test('has tabIndex=0 for keyboard focus', () => {
      const { getByRole } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      expect(getByRole('separator')).toHaveAttribute('tabindex', '0');
    });

    test('has aria-label="Resize panels"', () => {
      const { getByRole } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      expect(getByRole('separator')).toHaveAttribute(
        'aria-label',
        'Resize panels'
      );
    });

    test('has aria-valuemin, aria-valuemax, and aria-valuenow', () => {
      const { getByRole } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      const handle = getByRole('separator');
      expect(handle).toHaveAttribute('aria-valuemin', '20');
      expect(handle).toHaveAttribute('aria-valuemax', '80');
      expect(handle).toHaveAttribute('aria-valuenow', '50');
    });

    test('ArrowRight increases width by 2%', () => {
      const onResize = jest.fn();
      const { getByRole } = render(
        <ResizeHandle onResize={onResize} isActive={true} />
      );
      const handle = getByRole('separator');

      fireEvent.keyDown(handle, { key: 'ArrowRight' });

      expect(onResize).toHaveBeenCalledWith(52);
    });

    test('ArrowLeft decreases width by 2%', () => {
      const onResize = jest.fn();
      const { getByRole } = render(
        <ResizeHandle onResize={onResize} isActive={true} />
      );
      const handle = getByRole('separator');

      fireEvent.keyDown(handle, { key: 'ArrowLeft' });

      expect(onResize).toHaveBeenCalledWith(48);
    });

    test('width is clamped at minimum 20%', () => {
      const onResize = jest.fn();
      const { getByRole } = render(
        <ResizeHandle onResize={onResize} isActive={true} />
      );
      const handle = getByRole('separator');

      // Press ArrowLeft many times to go below minimum
      for (let i = 0; i < 20; i++) {
        fireEvent.keyDown(handle, { key: 'ArrowLeft' });
      }

      // Last call should be clamped at 20
      const lastCall = onResize.mock.calls[onResize.mock.calls.length - 1];
      expect(lastCall[0]).toBe(20);
    });

    test('width is clamped at maximum 80%', () => {
      const onResize = jest.fn();
      const { getByRole } = render(
        <ResizeHandle onResize={onResize} isActive={true} />
      );
      const handle = getByRole('separator');

      // Press ArrowRight many times to go above maximum
      for (let i = 0; i < 20; i++) {
        fireEvent.keyDown(handle, { key: 'ArrowRight' });
      }

      // Last call should be clamped at 80
      const lastCall = onResize.mock.calls[onResize.mock.calls.length - 1];
      expect(lastCall[0]).toBe(80);
    });
  });

  // ============================================================================
  // Mouse drag interaction
  // Validates: Requirements 5.2, 5.3, 5.4
  // ============================================================================
  describe('mouse drag', () => {
    test('mouseDown adds dragging class to body', () => {
      const { getByRole } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      const handle = getByRole('separator');

      fireEvent.mouseDown(handle);

      expect(document.body.classList.contains('resizeHandle--dragging')).toBe(
        true
      );
    });

    test('mouseDown adds active class to handle', () => {
      const { getByRole } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      const handle = getByRole('separator');

      fireEvent.mouseDown(handle);

      expect(handle).toHaveClass('resizeHandle--active');
    });

    test('mouseUp removes dragging class from body', () => {
      const { getByRole } = render(
        <ResizeHandle onResize={jest.fn()} isActive={true} />
      );
      const handle = getByRole('separator');

      fireEvent.mouseDown(handle);
      fireEvent.mouseUp(document);

      expect(document.body.classList.contains('resizeHandle--dragging')).toBe(
        false
      );
    });
  });
});
