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

/* eslint-disable import/no-named-as-default-member */
import fc from 'fast-check';
import { reorderItems } from '../../src-docs/src/views/sample_pages/nav_layout_utils';

/**
 * Feature: draggable-nav-customization, Property 2: Reorder preserves elements
 * Validates: Requirements 3.1, 3.3, 4.1, 4.3
 */
describe('Feature: draggable-nav-customization, Property 2: Reorder preserves elements', () => {
  it('reorderItems preserves all elements and places the moved element at toIndex', () => {
    fc.assert(
      fc.property(
        fc
          .uniqueArray(fc.string({ minLength: 1, maxLength: 10 }), {
            minLength: 2,
            maxLength: 10,
          })
          .chain((arr) =>
            fc.tuple(
              fc.constant(arr),
              fc.nat({ max: arr.length - 1 }),
              fc.nat({ max: arr.length - 1 })
            )
          ),
        ([items, fromIndex, toIndex]) => {
          const result = reorderItems(items, fromIndex, toIndex);

          // Result contains the same elements (same length, same set)
          expect(result).toHaveLength(items.length);
          expect([...result].sort()).toEqual([...items].sort());

          // The element originally at fromIndex is now at toIndex
          expect(result[toIndex]).toBe(items[fromIndex]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
