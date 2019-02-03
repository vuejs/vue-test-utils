// @flow

import Vue from 'vue'
import VueWrapper from './vue-wrapper'
import createInstance from 'create-instance'
import createElement from './create-element'
import { throwIfInstancesThrew, addGlobalErrorHandler } from './error'
import { mergeOptions } from 'shared/merge-options'
import config from './config'
import warnIfNoWindow from './warn-if-no-window'
import createWrapper from './create-wrapper'
import createLocalVue from './create-local-vue'
import { warn } from 'shared/util'
import semver from 'semver'
import { COMPAT_SYNC_MODE } from 'shared/consts'
import { validateOptions } from 'shared/validate-options'
import TransitionGroupStub from './components/TransitionGroupStub'
import TransitionStub from './components/TransitionStub'

Vue.config.productionTip = false
Vue.config.devtools = false

function getSyncOption(syncOption) {
  if (syncOption === false) {
    Vue.config.async = true
    return false
  }
  if (semver.lt(Vue.version, '2.5.18')) {
    warn(
      `Vue Test Utils runs in sync mode by default. Due to bugs, sync mode ` +
        `requires Vue > 2.5.18. In Vue Test Utils 1.0 sync mode will only be ` +
        `supported with Vue 2.5.18+ running in development mode. If you are ` +
        `unable to upgrade, you should rewrite your tests to run asynchronously` +
        `you can do this by setting the sync mounting option to false.`
    )
    return COMPAT_SYNC_MODE
  }

  if (typeof Vue.config.async === 'undefined') {
    warn(
      `Sync mode only works when Vue runs in dev mode. ` +
        `Please set Vue to run in dev mode, or set sync to false`
    )
  }

  Vue.config.async = false
  return true
}

export default function mount(
  component: Component,
  options: Options = {}
): VueWrapper | Wrapper {
  warnIfNoWindow()

  addGlobalErrorHandler(Vue)

  const _Vue = createLocalVue(options.localVue)

  const mergedOptions = mergeOptions(options, config)
  const sync = getSyncOption(mergedOptions.sync)

  validateOptions(mergedOptions, component)

  // Stub transition and transition-group if in compat sync mode to keep old
  // behavior
  // TODO: Remove when compat sync mode is removed
  if (sync === COMPAT_SYNC_MODE) {
    if (
      mergeOptions.stubs &&
      mergedOptions.stubs.transition !== false &&
      !mergedOptions.stubs.transition
    ) {
      mergedOptions.stubs.transition = TransitionStub
    }
    if (
      mergeOptions.stubs &&
      mergedOptions.stubs['transition-group'] !== false &&
      !mergedOptions.stubs['transition-group']
    ) {
      mergedOptions.stubs['transition-group'] = TransitionGroupStub
    }
  }

  const parentVm = createInstance(component, mergedOptions, _Vue)

  const el = options.attachToDocument ? createElement() : undefined
  const vm = parentVm.$mount(el)

  component._Ctor = {}

  throwIfInstancesThrew(vm)

  const wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument,
    sync
  }

  const root = parentVm.$options._isFunctionalContainer
    ? vm._vnode
    : vm.$children[0]

  return createWrapper(root, wrapperOptions)
}
