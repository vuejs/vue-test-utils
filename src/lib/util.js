// @flow

export function throwError (msg: string): void {
  throw new Error(`[vue-test-utils]: ${msg}`)
}
