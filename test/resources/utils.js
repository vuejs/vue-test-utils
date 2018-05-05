/* global describe, it*/

import Vue from 'vue'
import { shallow, mount } from '~vue/test-utils'
import { renderToString } from '~vue/server-test-utils'

export const vueVersion = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)

export const isRunningJSDOM =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.includes &&
  navigator.userAgent.includes('jsdom')

export const isRunningPhantomJS =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.includes &&
  navigator.userAgent.match(/PhantomJS/i)

export function injectSupported () {
  return vueVersion > 2.2
}

export function attrsSupported () {
  return vueVersion > 2.2
}

export function listenersSupported () {
  return vueVersion > 2.3
}

export function functionalSFCsSupported () {
  return vueVersion >= 2.5
}

export function scopedSlotsSupported () {
  return vueVersion >= 2.1
}

const shallowAndMount = process.env.TEST_ENV === 'node'
  ? []
  : [mount, shallow]
console.log(shallowAndMount)
const shallowMountAndRender = process.env.TEST_ENV === 'node'
  ? [renderToString]
  : [mount, shallow]

export function describeWithShallowAndMount (spec, cb) {
  if (shallowAndMount.length > 0) {
    shallowAndMount.forEach(method => {
      describe(`${spec} with ${method.name}`, () => cb(method))
    })
  }
}

describeWithShallowAndMount.skip = function (spec, cb) {
  shallowAndMount.forEach(method => {
    describe.skip(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithShallowAndMount.only = function (spec, cb) {
  shallowAndMount.forEach(method => {
    describe.only(`${spec} with ${method.name}`, () => cb(method))
  })
}

export function describeWithMountingMethods (spec, cb) {
  shallowMountAndRender.forEach(method => {
    describe(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithMountingMethods.skip = function (spec, cb) {
  shallowMountAndRender.forEach(method => {
    describe.skip(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithMountingMethods.only = function (spec, cb) {
  shallowMountAndRender.forEach(method => {
    describe.only(`${spec} with ${method.name}`, () => cb(method))
  })
}

export function itSkipIf (predicate, spec, cb) {
  if (predicate) {
    it.skip(spec, cb)
  } else {
    it(spec, cb)
  }
}

export function itDoNotRunIf (predicate, spec, cb) {
  if (predicate) {
    () => {}
  } else {
    it(spec, cb)
  }
}

export function describeIf (predicate, spec, cb) {
  if (predicate) {
    describe(spec, cb)
  }
}
