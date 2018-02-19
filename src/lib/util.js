// @flow

export function throwError (msg: string): void {
  throw new Error(`[vue-test-utils]: ${msg}`)
}

export function warn (msg: string): void {
  console.error(`[vue-test-utils]: ${msg}`)
}

const camelizeRE = /-(\w)/g
export const camelize = (str: string): string => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')

/**
 * Capitalize a string.
 */
export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str: string): string => str.replace(hyphenateRE, '-$1').toLowerCase()

export const runningInNode =
  Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]' ||
  !process.browser
