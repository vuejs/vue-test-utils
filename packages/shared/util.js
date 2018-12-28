// @flow
import Vue from 'vue'
import semver from 'semver'

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

const UA = typeof window !== 'undefined' &&
  'navigator' in window &&
  navigator.userAgent.toLowerCase()

export const isPhantomJS = UA && UA.includes &&
  UA.match(/phantomjs/i)

export const isEdge = UA && UA.indexOf('edge/') > 0
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge

// get the event used to trigger v-model handler that updates bound data
export function getCheckedEvent () {
  const version = Vue.version

  if (semver.satisfies(version, '2.1.9 - 2.1.10')) {
    return 'click'
  }

  if (semver.satisfies(version, '2.2 - 2.4')) {
    return isChrome ? 'click' : 'change'
  }

  // change is handler for version 2.0 - 2.1.8, and 2.5+
  return 'change'
}
