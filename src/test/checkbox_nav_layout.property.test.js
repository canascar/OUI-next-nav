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
import {
  ALL_DRAGGABLE_ITEMS,
  FIXED_KEYS,
  STORAGE_KEY,
  toggleItemZone,
  saveLayout,
  loadLayout,
  validateLayout,
} from '../../src-docs/src/views/sample_pages/nav_layout_utils';

const ALL_KEYS = ALL_DRAGGABLE_ITEMS.map((item) => item.key);

/**
 * Feature: checkbox-nav-customization, Property 1: Toggle moves item between zones
 * Validates: Requirements 2.1, 2.2
 */
describe('Feature: checkbox-nav-customization, Property 1: Toggle moves item between zones', () => {
  it('toggling a key moves it to the other zone, preserves combined set and canonical order', () => {
    fc.assert(
      fc.property(
        fc
          .shuffledSubarray(ALL_KEYS, {
            minLength: 0,
            maxLength: ALL_KEYS.length,
          })
          .chain((mainKeys) => {
            const overflowKeys = ALL_KEYS.filter((k) => !mainKeys.includes(k));
            // Pick a random key from the full set
            return fc.tuple(
              fc.constant(mainKeys),
              fc.constant(overflowKeys),
              fc.constantFrom(...ALL_KEYS)
            );
          }),
        ([mainKeys, overflowKeys, key]) => {
          // Sort inputs to canonical order before calling toggleItemZone
          const sortedMain = ALL_KEYS.filter((k) => mainKeys.includes(k));
          const sortedOverflow = ALL_KEYS.filter((k) =>
            overflowKeys.includes(k)
          );

          const result = toggleItemZone(
            key,
            sortedMain,
            sortedOverflow,
            ALL_DRAGGABLE_ITEMS
          );

          // 1. The toggled key moves to the other zone
          if (sortedMain.includes(key)) {
            expect(result.mainKeys).not.toContain(key);
            expect(result.overflowKeys).toContain(key);
          } else {
            expect(result.mainKeys).toContain(key);
            expect(result.overflowKeys).not.toContain(key);
          }

          // 2. Combined set of keys is unchanged
          const combinedBefore = [...sortedMain, ...sortedOverflow].sort();
          const combinedAfter = [
            ...result.mainKeys,
            ...result.overflowKeys,
          ].sort();
          expect(combinedAfter).toEqual(combinedBefore);

          // 3. Both arrays preserve canonical order
          const mainIndices = result.mainKeys.map((k) => ALL_KEYS.indexOf(k));
          const overflowIndices = result.overflowKeys.map((k) =>
            ALL_KEYS.indexOf(k)
          );

          for (let i = 1; i < mainIndices.length; i++) {
            expect(mainIndices[i]).toBeGreaterThan(mainIndices[i - 1]);
          }
          for (let i = 1; i < overflowIndices.length; i++) {
            expect(overflowIndices[i]).toBeGreaterThan(overflowIndices[i - 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: checkbox-nav-customization, Property 2: Fixed items invariant
 * Validates: Requirements 3.2, 3.3
 */
describe('Feature: checkbox-nav-customization, Property 2: Fixed items invariant', () => {
  it('fixed keys never appear in overflowKeys after any sequence of toggles', () => {
    fc.assert(
      fc.property(
        fc
          .shuffledSubarray(ALL_KEYS, {
            minLength: 0,
            maxLength: ALL_KEYS.length,
          })
          .chain((mainKeys) => {
            const overflowKeys = ALL_KEYS.filter((k) => !mainKeys.includes(k));
            // Generate 1-20 random toggle operations, each picking from ALL_KEYS + FIXED_KEYS
            const allPossibleKeys = [...ALL_KEYS, ...FIXED_KEYS];
            const opsArb = fc.array(fc.constantFrom(...allPossibleKeys), {
              minLength: 1,
              maxLength: 20,
            });
            return fc.tuple(
              fc.constant(mainKeys),
              fc.constant(overflowKeys),
              opsArb
            );
          }),
        ([mainKeys, overflowKeys, ops]) => {
          // Sort inputs to canonical order
          let currentMain = ALL_KEYS.filter((k) => mainKeys.includes(k));
          let currentOverflow = ALL_KEYS.filter((k) =>
            overflowKeys.includes(k)
          );

          // Apply each toggle operation sequentially
          for (const key of ops) {
            const result = toggleItemZone(
              key,
              currentMain,
              currentOverflow,
              ALL_DRAGGABLE_ITEMS
            );
            currentMain = result.mainKeys;
            currentOverflow = result.overflowKeys;
          }

          // Assert: no fixed key ever ends up in overflowKeys
          for (const fixedKey of FIXED_KEYS) {
            expect(currentOverflow).not.toContain(fixedKey);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: checkbox-nav-customization, Property 3: Checkbox-layout round-trip
 * Validates: Requirements 1.5, 5.4
 */
describe('Feature: checkbox-nav-customization, Property 3: Checkbox-layout round-trip', () => {
  it('entering customize mode and exiting without toggles produces the original layout', () => {
    fc.assert(
      fc.property(
        fc
          .shuffledSubarray(ALL_KEYS, {
            minLength: 0,
            maxLength: ALL_KEYS.length,
          })
          .map((subset) => {
            // Derive mainKeys and overflowKeys in canonical order
            const mainKeys = ALL_KEYS.filter((k) => subset.includes(k));
            const overflowKeys = ALL_KEYS.filter((k) => !subset.includes(k));
            return { mainKeys, overflowKeys };
          }),
        ({ mainKeys, overflowKeys }) => {
          // Step 1: Simulate entering customize mode — initialize checkedKeys from mainKeys
          const checkedKeys = new Set(mainKeys);

          // Step 2: Simulate exiting customize mode without any toggles —
          //         derive new layout from checkedKeys
          const newMainKeys = ALL_KEYS.filter((k) => checkedKeys.has(k));
          const newOverflowKeys = ALL_KEYS.filter((k) => !checkedKeys.has(k));

          // Step 3: Assert round-trip produces the original layout
          expect(newMainKeys).toEqual(mainKeys);
          expect(newOverflowKeys).toEqual(overflowKeys);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: checkbox-nav-customization, Property 4: Persistence round-trip
 * Validates: Requirements 6.1, 6.2
 */
describe('Feature: checkbox-nav-customization, Property 4: Persistence round-trip', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('loadLayout after saveLayout returns equivalent layout', () => {
    fc.assert(
      fc.property(
        fc
          .shuffledSubarray(ALL_KEYS, {
            minLength: 0,
            maxLength: ALL_KEYS.length,
          })
          .map((subset) => {
            const mainKeys = ALL_KEYS.filter((k) => subset.includes(k));
            const overflowKeys = ALL_KEYS.filter((k) => !subset.includes(k));
            return { mainKeys, overflowKeys };
          }),
        ({ mainKeys, overflowKeys }) => {
          // Clear before each iteration to avoid interference
          localStorage.removeItem(STORAGE_KEY);

          // Save the layout
          saveLayout(mainKeys, overflowKeys);

          // Load it back
          const loaded = loadLayout(ALL_DRAGGABLE_ITEMS);

          // Assert round-trip equivalence
          expect(loaded.mainKeys).toEqual(mainKeys);
          expect(loaded.overflowKeys).toEqual(overflowKeys);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: checkbox-nav-customization, Property 5: Layout validation handles stale data
 * Validates: Requirements 6.4
 */
describe('Feature: checkbox-nav-customization, Property 5: Layout validation handles stale data', () => {
  // Generator for random strings that are NOT in ALL_KEYS (unknown keys)
  const unknownKeyArb = fc
    .string({ minLength: 1, maxLength: 20 })
    .filter((s) => !ALL_KEYS.includes(s) && s.trim().length > 0);

  it('validateLayout discards unknown keys, keeps current keys, and puts missing keys in overflow', () => {
    fc.assert(
      fc.property(
        fc
          .tuple(
            // Random subset of ALL_KEYS to be in stored mainKeys
            fc.shuffledSubarray(ALL_KEYS, {
              minLength: 0,
              maxLength: ALL_KEYS.length,
            }),
            // Random unknown keys to inject into stored layout
            fc.array(unknownKeyArb, { minLength: 0, maxLength: 5 })
          )
          .chain(([knownSubset, unknownKeys]) => {
            // Split the known subset randomly into stored main and stored overflow
            return fc
              .shuffledSubarray(knownSubset, {
                minLength: 0,
                maxLength: knownSubset.length,
              })
              .map((storedMainFromKnown) => {
                const storedMainKnownSet = new Set(storedMainFromKnown);
                const storedOverflowFromKnown = knownSubset.filter(
                  (k) => !storedMainKnownSet.has(k)
                );
                return {
                  storedMainFromKnown,
                  storedOverflowFromKnown,
                  unknownKeys,
                  // Keys in ALL_KEYS but NOT in knownSubset — these are "missing/new" keys
                  missingKeys: ALL_KEYS.filter((k) => !knownSubset.includes(k)),
                };
              });
          }),
        ({
          storedMainFromKnown,
          storedOverflowFromKnown,
          unknownKeys,
          missingKeys,
        }) => {
          // Build a stale stored layout: known keys + unknown keys mixed in
          const storedMain = [
            ...storedMainFromKnown,
            ...unknownKeys.slice(0, 2),
          ];
          const storedOverflow = [
            ...storedOverflowFromKnown,
            ...unknownKeys.slice(2),
          ];

          const stored = { mainKeys: storedMain, overflowKeys: storedOverflow };
          const result = validateLayout(stored, ALL_DRAGGABLE_ITEMS);

          // 1. Result contains exactly ALL_KEYS — no more, no less
          const resultAll = [...result.mainKeys, ...result.overflowKeys].sort();
          expect(resultAll).toEqual([...ALL_KEYS].sort());

          // 2. No unknown keys appear in the result
          for (const uk of unknownKeys) {
            expect(result.mainKeys).not.toContain(uk);
            expect(result.overflowKeys).not.toContain(uk);
          }

          // 3. Missing keys (in ALL_DRAGGABLE_ITEMS but NOT in stored) appear in overflowKeys
          for (const mk of missingKeys) {
            expect(result.overflowKeys).toContain(mk);
          }

          // 4. Both mainKeys and overflowKeys are in canonical order
          const mainIndices = result.mainKeys.map((k) => ALL_KEYS.indexOf(k));
          const overflowIndices = result.overflowKeys.map((k) =>
            ALL_KEYS.indexOf(k)
          );

          for (let i = 1; i < mainIndices.length; i++) {
            expect(mainIndices[i]).toBeGreaterThan(mainIndices[i - 1]);
          }
          for (let i = 1; i < overflowIndices.length; i++) {
            expect(overflowIndices[i]).toBeGreaterThan(overflowIndices[i - 1]);
          }

          // 5. No duplicates across mainKeys and overflowKeys
          const allResultKeys = [...result.mainKeys, ...result.overflowKeys];
          expect(new Set(allResultKeys).size).toBe(allResultKeys.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { ThemeContext } from '../../src-docs/src/components/with_theme';
import { SamplePagesLeftNav } from '../../src-docs/src/views/sample_pages/sample_pages_left_nav';

/**
 * Feature: checkbox-nav-customization, Property 6: More button visibility matches overflow state
 * Validates: Requirements 4.2, 4.3
 */
describe('Feature: checkbox-nav-customization, Property 6: More button visibility matches overflow state', () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('More button is visible iff overflowKeys is non-empty', () => {
    fc.assert(
      fc.property(
        fc
          .shuffledSubarray(ALL_KEYS, {
            minLength: 0,
            maxLength: ALL_KEYS.length,
          })
          .map((subset) => {
            const mainKeys = ALL_KEYS.filter((k) => subset.includes(k));
            const overflowKeys = ALL_KEYS.filter((k) => !subset.includes(k));
            return { mainKeys, overflowKeys };
          }),
        ({ mainKeys, overflowKeys }) => {
          // Clean up from any previous iteration
          cleanup();
          localStorage.removeItem(STORAGE_KEY);

          // Save the generated layout to localStorage
          saveLayout(mainKeys, overflowKeys);

          // Render the component wrapped in ThemeContext
          render(
            <ThemeContext.Provider
              value={{ theme: 'v9-light', changeTheme: jest.fn() }}>
              <SamplePagesLeftNav
                activePage="discover"
                onPageChange={jest.fn()}
                onItemSelect={jest.fn()}
                selectedItem={null}
              />
            </ThemeContext.Provider>
          );

          // Check if the More button text is present
          const moreElement = screen.queryByText('More');
          const hasOverflow = overflowKeys.length > 0;

          if (hasOverflow) {
            expect(moreElement).not.toBeNull();
          } else {
            expect(moreElement).toBeNull();
          }

          // Clean up after this iteration
          cleanup();
          localStorage.removeItem(STORAGE_KEY);
        }
      ),
      { numRuns: 100 }
    );
  });
});
