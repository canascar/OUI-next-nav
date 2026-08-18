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

/**
 * POC alert definitions for the "View in OpenSearch" entry point.
 *
 * Each alert represents a signal surfaced by an IDE skill that the user
 * chose to investigate inside the OSD shell.
 *
 * @typedef {Object} PocAlert
 * @property {string} id - Unique alert identifier (used in the URL)
 * @property {string} title - Human-readable alert title
 * @property {string} p99 - Current p99 latency value
 * @property {string} p99Baseline - Normal baseline p99
 * @property {string} errorRate - Current error rate
 * @property {string} errorRateBaseline - Normal baseline error rate
 * @property {string} window - Time window the alert covers
 * @property {string} cluster - Cluster/environment name
 * @property {string[]} linked - Related signal summaries
 * @property {string} sourcePageId - The pageKey of the canvas page to show on investigate
 * @property {Object} provenance - Origin context
 * @property {string} provenance.host - Where the alert came from
 * @property {string} provenance.skill - Which skill surfaced it
 * @property {string} provenance.session - Session key for deduplication
 */

/** @type {Record<string, PocAlert>} */
export const POC_ALERTS = {
  'checkout-p99': {
    id: 'checkout-p99',
    title: 'checkout p99 latency',
    p99: '1.42s',
    p99Baseline: '0.61s',
    errorRate: '2.8%',
    errorRateBaseline: '0.4%',
    window: 'last 15 min',
    cluster: 'pay-prod-a',
    linked: [
      'cart 200 OK',
      'payments-auth p99 0.7s',
      'ledger normal',
    ],
    sourcePageId: 'alerts',
    provenance: {
      host: 'IDE',
      skill: 'opensearch-observability',
      session: 'POC',
    },
  },
};

/**
 * Look up an alert by id. Returns null for unknown ids.
 * @param {string} alertId
 * @returns {PocAlert|null}
 */
export function getPocAlert(alertId) {
  if (!alertId || typeof alertId !== 'string') return null;
  return POC_ALERTS[alertId] || null;
}
