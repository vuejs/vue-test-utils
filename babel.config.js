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
            // currently, there are dependency resolution issues with older versions of vuepress. Once vuepress is upgraded, core-js can be moved to version 3
            corejs: 2,
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
