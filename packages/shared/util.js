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
  const camelizedStr = str.replace(camelizeRE, (_, c) =>
    c ? c.toUpperCase() : ''
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

function hasOwnProperty (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export function resolveComponent (id: string, components: Object) {
  if (typeof id !== 'string') {
    return
  }
  // check local registration variations first
  if (hasOwnProperty(components, id)) {
    return components[id]
  }
  var camelizedId = camelize(id)
  if (hasOwnProperty(components, camelizedId)) {
    return components[camelizedId]
  }
  var PascalCaseId = capitalize(camelizedId)
  if (hasOwnProperty(components, PascalCaseId)) {
    return components[PascalCaseId]
  }
  // fallback to prototype chain
  return components[id] || components[camelizedId] || components[PascalCaseId]
}
