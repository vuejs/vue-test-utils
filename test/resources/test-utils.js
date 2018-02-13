/* global describe, it*/

import Vue from 'vue'
import { shallow, mount } from '~vue-test-utils'

export const vueVersion = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)

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

export function describeWithShallowAndMount (spec, cb) {
  ;[mount, shallow].forEach(method => {
    describe(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithShallowAndMount.skip = function (spec, cb) {
  ;[mount, shallow].forEach(method => {
    describe.skip(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithShallowAndMount.only = function (spec, cb) {
  ;[mount, shallow].forEach(method => {
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
