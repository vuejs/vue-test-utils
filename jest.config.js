module.exports = {
  moduleNameMapper: {
    '^~(.*)$': '<rootDir>/test/$1'
  },
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest'
  }
}
