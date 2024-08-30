// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    http: require.resolve('stream-http'), // Correct polyfill for http
    https: require.resolve('https-browserify'), // Polyfill for https
    url: require.resolve('url/'), // Polyfill for url
    buffer: require.resolve('buffer/'), // Polyfill for buffer
    stream: require.resolve('stream-browserify'), // Polyfill for stream
    process: require.resolve('process/browser'), // Polyfill for process
    timers: require.resolve('timers-browserify'), // Polyfill for timers
  };

  // Add necessary plugins
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ]);

  return config;
};