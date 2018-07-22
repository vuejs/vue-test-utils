// @flow
import Vue from 'vue'

export function throwError (msg: string): void {
  throw new Error(`[vue-test-utils]: ${msg}`)
}

export function warn (msg: string): void {
  console.error(`[vue-test-utils]: ${msg}`)
}

const camelizeRE = /-(\w)/g
export const camelize = (str: string): string => {
  const camelizedStr = str.replace(
    camelizeRE,
    (_, c) => (c ? c.toUpperCase() : '')
  )
  return camelizedStr.charAt(0).toLowerCase() + camelizedStr.slice(1)
}

/**
 * Capitalize a string.
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1)

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = (str: string): string =>
  str.replace(hyphenateRE, '-$1').toLowerCase()

export const vueVersion = Number(
  `${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`
)

export function isPlainObject (obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
