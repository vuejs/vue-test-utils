// @flow

import { throwError } from 'shared/util'

export default function warnIfNoWindow (): void {
  if (typeof window === 'undefined') {
    throwError(
      `window is undefined, vue-test-utils needs to be ` +
      `run in a browser environment. \n` +
      `You can run the tests in node using jsdom \n` +
      `See https://vue-test-utils.vuejs.org/guides/common-tips.html ` +
      `for more details.`
    )
  }
}
