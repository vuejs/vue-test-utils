module.exports = {
  plugins: ['transform-flow-strip-types', 'transform-vue-jsx'],
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
