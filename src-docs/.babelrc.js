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

const path = require('path');
const baseConfig = require('../.babelrc.js');

// Resolve relative plugin paths to absolute so they work regardless of CWD
// (e.g. when Jest transforms files under src-docs/)
const rootDir = path.resolve(__dirname, '..');
baseConfig.plugins = baseConfig.plugins.map((plugin) => {
  if (typeof plugin === 'string' && plugin.startsWith('./scripts/babel/')) {
    return path.resolve(rootDir, plugin);
  }
  return plugin;
});

const index = baseConfig.plugins.findIndex(
  (p) => typeof p === 'string' && p.endsWith('proptypes-from-ts-props')
);
baseConfig.plugins.splice(
  index + 1,
  0,
  path.resolve(rootDir, './scripts/babel/react-docgen-typescript')
);
module.exports = baseConfig;
