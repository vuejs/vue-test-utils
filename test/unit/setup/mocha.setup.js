const chai = require('chai')
const sinon = require('sinon')
require('jsdom-global')()

global.expect = chai.expect
global.sinon = sinon
