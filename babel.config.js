module.exports = {
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
