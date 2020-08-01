require('@babel/polyfill')

if (process.env.TEST_ENV !== 'node') {
  require('jsdom-global')()
}

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)

global.expect = chai.expect
global.sinon = sinon
