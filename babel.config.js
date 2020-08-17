const defaultOptions = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    '@vue/babel-preset-jsx'
  ],
  plugins: [
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-syntax-flow',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ],
  comments: false
}

module.exports = api => {
  if (api.env('browser')) {
    // If running in the browser, use core-js to polyfill potentially missing functionality
    return {
      ...defaultOptions,
      presets: [
        [
          '@babel/preset-env',
          {
            corejs: 3,
            useBuiltIns: 'entry'
          }
        ],
        '@vue/babel-preset-jsx'
      ]
    }
  } else {
    return defaultOptions
  }
}
