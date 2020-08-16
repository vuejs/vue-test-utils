/**
 * Since running in the browser, polyfill missing functionality with core-js,
 * as well as include the regenerator runtime.
 * Please see https://babeljs.io/docs/en/babel-polyfill and https://github.com/zloirock/core-js for more details
 */
import 'core-js'
import 'regenerator-runtime/runtime'

import jest from 'jest-mock'
import expect from 'expect'

// Add Jest API to the global scope / browser window
// Jasmine will be used as the test runner while leveraging Jest's expect/assertion and mock/stubbing libraries
window.test = window.it
window.test.each = inputs => (testName, test) =>
  inputs.forEach(args => window.it(testName, () => test(...args)))
window.test.todo = window.test.skip = () => {
  return undefined
}

window.jest = jest
window.expect = expect
