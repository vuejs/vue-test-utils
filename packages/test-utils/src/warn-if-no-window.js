import { throwError } from 'shared/util'

if (typeof window === 'undefined') {
  throwError(
    'window is undefined, vue-test-utils needs to be run in a browser environment.\n' +
    'You can run the tests in node using jsdom + jsdom-global.\n' +
    'See https://vue-test-utils.vuejs.org/en/guides/common-tips.html for more details.'
  )
}
