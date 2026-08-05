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
const { ProvidePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const babelConfig = require('./.babelrc.js');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const { NODE_ENV, CI, WEBPACK_DEV_SERVER } = process.env;

const isDevelopment = WEBPACK_DEV_SERVER === 'true' && CI == null;
const isProduction = NODE_ENV === 'production';
const isPuppeteer = NODE_ENV === 'puppeteer';

function employCache(loaders) {
  // Webpack 5's persistent filesystem cache (configured below) supersedes
  // cache-loader, so we no longer wrap loaders with it.
  return loaders;
}

// Must return an object/non-async function due to eslint-import-resolver-webpack
const webpackConfig = {
  mode: isProduction ? 'production' : 'development',

  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',

  // Webpack 5 persistent filesystem cache — dramatically speeds up cold
  // starts and rebuilds in development by reusing previously compiled modules.
  cache:
    isDevelopment && !isPuppeteer
      ? {
          type: 'filesystem',
          cacheDirectory: path.join(__dirname, '..', '.webpack-cache'),
          buildDependencies: {
            config: [__filename],
          },
        }
      : false,

  entry: {
    bundle: './index.js',
  },

  context: path.resolve(__dirname, 'src'),

  output: {
    path: path.resolve(__dirname, '../docs'),
    filename: `[name]${isProduction ? '.min' : ''}.js`,
    publicPath: isProduction ? './' : '/',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.mjs'],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      assert: require.resolve('assert/'),
      os: require.resolve('os-browserify/browser'),
      process: require.resolve('process/browser'),
    },
  },

  resolveLoader: {
    alias: {
      'prop-loader': path.resolve(
        __dirname,
        '../scripts/loaders/prop-loader.js'
      ),
    },
  },

  module: {
    rules: [
      {
        test: /\.(js|tsx?)$/,
        use: employCache([
          {
            loader: 'babel-loader',
            options: { babelrc: false, ...babelConfig },
          },
        ]),
        exclude: [
          /node_modules/,
          /packages(\/|\\)react-datepicker/,
          // opensearch-datemath is a plain CommonJS module. Running it through
          // babel-loader injects a core-js `import` (useBuiltIns: 'usage'),
          // which makes webpack treat the file as a strict ES module and throw
          // on its `module.exports =` assignment — blanking the whole bundle.
          // Exclude it so it stays CommonJS (matches the react-datepicker case).
          /packages(\/|\\)opensearch-datemath/,
        ],
      },
      {
        test: /\.scss$/,
        use: employCache([
          {
            loader: 'style-loader',
            options: { injectType: 'lazySingletonStyleTag' },
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ]),
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: employCache(['style-loader', 'css-loader']),
        exclude: /node_modules/,
      },
      {
        test: /\.(woff|woff2|ttf|eot|ico)(\?|$)/,
        loader: 'file-loader',
        options: {
          esModule: false,
        },
      },
      {
        test: /\.glb$/,
        loader: 'file-loader',
        options: {
          esModule: false,
        },
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8000, // Convert images < 8kb to base64 strings
          name: 'images/[hash]-[name].[ext]',
          esModule: false,
        },
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body',
      cache: true,
      showErrors: true,
    }),

    new CircularDependencyPlugin({
      exclude: /node_modules/,
      // Walking the full module graph on every rebuild is expensive in dev.
      // Keep enforcement in production/CI; only warn during local dev.
      failOnError: !isDevelopment,
    }),

    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),

    new ProvidePlugin({
      process: 'process/browser',
    }),
  ],

  devServer: isDevelopment
    ? {
        static: {
          directory: path.join(__dirname, 'build'),
        },
        host: '0.0.0.0',
        allowedHosts: 'all',
        port: 8030,
        historyApiFallback: true,
        // prevent file watching while running on CI
        // /app/ represents the entire docker environment
        watchFiles: isPuppeteer
          ? {
              options: {
                ignored: '**/*',
              },
            }
          : undefined,
        client: {
          // Disable overlay for runtime errors as they cause ResizeObservable to throw loop errors.
          // Also hide the warnings overlay (e.g. the pre-existing @opensearch/datemath
          // default-export warnings) so only build errors surface.
          overlay: { runtimeErrors: false, warnings: false },
        },
      }
    : undefined,
};

module.exports = webpackConfig;
