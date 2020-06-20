module.exports = {
  plugins: ['transform-flow-strip-types'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
}
