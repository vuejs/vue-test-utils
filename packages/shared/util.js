// @flow

export function throwError (msg) {
  throw new Error(`[vue-test-utils]: ${msg}`)
}

export function warn (msg) {
  console.error(`[vue-test-utils]: ${msg}`)
}

const camelizeRE = /-(\w)/g
export const camelize = (str) => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')

/**
 * Capitalize a string.
 */
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase()
