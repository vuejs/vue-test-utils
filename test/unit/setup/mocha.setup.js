require('jsdom-global')()

const chai = require('chai')
const sinon = require('sinon')

global.expect = chai.expect
global.sinon = sinon
