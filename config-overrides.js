// eslint-disable-next-line @typescript-eslint/no-var-requires
// const webpack = require('webpack')

module.exports = function override(config, env) {
  console.log('override')
  let loaders = config.resolve
  loaders.fallback = {
    crypto: require.resolve('crypto-browserify'),
    buffer: require.resolve('buffer'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
  }

  // config.plugins = [
  //   ...config.plugins,
  //   new webpack.ProvidePlugin({
  //     Buffer: ['buffer', 'Buffer'],
  //   }),
  // ]

  return config
}
