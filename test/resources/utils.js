/* global describe */

import Vue from 'vue'
import { shallowMount, mount } from 'packages/test-utils/src'
import { renderToString } from 'packages/server-test-utils/src'

export const vueVersion = Number(
  `${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`
)

export const isRunningJSDOM =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.includes &&
  navigator.userAgent.includes('jsdom')

export const isRunningPhantomJS =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.includes &&
  navigator.userAgent.match(/PhantomJS/i)

export const injectSupported = vueVersion > 2.2

export const attrsSupported = vueVersion > 2.2

export const listenersSupported = vueVersion > 2.3

export const functionalSFCsSupported = vueVersion > 2.4

export const scopedSlotsSupported = vueVersion > 2

export const isPromise = value =>
  typeof value === 'object' && typeof value.then === 'function'

const shallowAndMount =
  process.env.TEST_ENV === 'node' ? [] : [mount, shallowMount]
const shallowMountAndRender =
  process.env.TEST_ENV === 'node' ? [renderToString] : [mount, shallowMount]

export function describeWithShallowAndMount(spec, cb) {
  if (shallowAndMount.length > 0) {
    shallowAndMount.forEach(method => {
      describe(`${spec} with ${method.name}`, () => cb(method))
    })
  }
}

describeWithShallowAndMount.skip = function(spec, cb) {
  shallowAndMount.forEach(method => {
    describe.skip(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithShallowAndMount.only = function(spec, cb) {
  shallowAndMount.forEach(method => {
    describe.only(`${spec} with ${method.name}`, () => cb(method))
  })
}

export function describeWithMountingMethods(spec, cb) {
  shallowMountAndRender.forEach(method => {
    describe(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithMountingMethods.skip = function(spec, cb) {
  shallowMountAndRender.forEach(method => {
    describe.skip(`${spec} with ${method.name}`, () => cb(method))
  })
}

describeWithMountingMethods.only = function(spec, cb) {
  shallowMountAndRender.forEach(method => {
    describe.only(`${spec} with ${method.name}`, () => cb(method))
  })
}
