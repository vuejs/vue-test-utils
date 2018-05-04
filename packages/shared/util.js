// @flow

export function throwError (msg: string) {
  throw new Error(`[vue-test-utils]: ${msg}`)
}

export function warn (msg: string) {
  console.error(`[vue-test-utils]: ${msg}`)
}

const camelizeRE = /-(\w)/g
export const camelize = (str: string) => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')

/**
 * Capitalize a string.
 */
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str: string) => str.replace(hyphenateRE, '-$1').toLowerCase()
