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
 * Mock results of the account scan that runs before onboarding starts.
 *
 * AWS vended telemetry is already flowing by the time a user reaches this
 * flow — these are the things we found, not things they have to configure.
 * Shaped so real Describe* results can replace `getAccountScan()` without
 * touching the views: every number the Welcome view renders comes from here.
 */

/** @typedef {{ key: string, icon: string, stat: string, sub: string }} ScanTile */

const ACCOUNT_SCAN = {
  accountId: '481042394201',
  primaryRegion: 'us-east-1',
  scannedAt: '14:02 UTC',
  // Counts from the scan. The view formats these into tiles.
  services: { count: 6, regions: 2 },
  logGroups: { count: 12 },
  traces: { count: 48200 },
  applications: { count: 4 },
  agents: { count: 2 },
  alarms: { count: 3 },
};

/** Compact display form for large counts — 48200 → "48.2k". */
const formatCount = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

/** Pluralize a noun against a count. */
const plural = (n, singular, pluralForm) =>
  `${n} ${n === 1 ? singular : pluralForm || `${singular}s`}`;

/**
 * The scan, plus the 3x2 tile grid derived from it.
 *
 * @returns {{ tiles: ScanTile[] } & typeof ACCOUNT_SCAN}
 */
export const getAccountScan = () => {
  const s = ACCOUNT_SCAN;
  return {
    ...s,
    tiles: [
      {
        key: 'services',
        icon: 'node',
        stat: plural(s.services.count, 'service'),
        sub: `across ${plural(s.services.regions, 'region')}`,
      },
      {
        key: 'logGroups',
        icon: 'document',
        stat: plural(s.logGroups.count, 'log group'),
        sub: 'streaming',
      },
      {
        key: 'traces',
        icon: 'app_apm',
        stat: `${formatCount(s.traces.count)} traces`,
        sub: 'flowing',
      },
      {
        key: 'applications',
        icon: 'globe',
        stat: plural(s.applications.count, 'application'),
        sub: 'instrumented',
      },
      {
        key: 'agents',
        icon: 'users',
        stat: plural(s.agents.count, 'agent'),
        sub: 'connected',
      },
      {
        key: 'alarms',
        icon: 'bell',
        stat: plural(s.alarms.count, 'alarm'),
        sub: 'configured',
      },
    ],
  };
};

/**
 * The two optional connection steps. Both are one-click and read-only —
 * onboarding deepens coverage, it never gates the product.
 */
export const CONNECT_STEPS = [
  {
    key: 'eks',
    eyebrow: 'AMAZON EKS',
    title: 'prod-web clusters',
    tileLabel: 'EKS',
    tileIcon: 'logo_kubernetes',
    oneClick: 'One-click — CloudFormation, configured for your account',
    selectLabel: 'Cluster',
    options: [
      { value: 'prod-web-eks', text: 'prod-web-eks · us-east-1' },
      { value: 'prod-api-eks', text: 'prod-api-eks · us-east-1' },
      { value: 'staging-eks', text: 'staging-eks · us-west-2' },
    ],
    // What the one-click install grants. Read-only by design.
    installs: [
      'A read-only IAM role scoped to this cluster',
      'Container insights metrics for nodes, pods, and workloads',
      'Control-plane and application log group subscriptions',
    ],
    nextLabel: 'Next: AWS Lambda',
  },
  {
    key: 'lambda',
    eyebrow: 'AWS LAMBDA',
    title: '2 functions · logs, metrics, traces',
    tileLabel: 'Lambda',
    tileIcon: 'compute',
    oneClick: 'One-click — no code changes to your functions',
    selectLabel: 'Functions',
    options: [
      { value: 'all', text: 'All 2 functions · us-east-1' },
      { value: 'checkout-api', text: 'checkout-api · us-east-1' },
      { value: 'orders-worker', text: 'orders-worker · us-east-1' },
    ],
    installs: [
      'A read-only IAM role scoped to these functions',
      'Invocation, duration, error, and throttle metrics',
      'Existing CloudWatch log group subscriptions',
    ],
    nextLabel: 'Finish set up',
  },
];

/** Third tile in the estate preview — already flowing, nothing to connect. */
export const AMBIENT_TILE = {
  key: 'ec2',
  tileLabel: 'EC2',
  tileIcon: 'node',
};

/** Beats shown inline on the "Try with sample data" link. */
export const SAMPLE_DATA_BEATS = [
  'Standing up sample storefront…',
  '✓ collection',
  '✓ app deployed',
  '✓ traffic flowing',
];
