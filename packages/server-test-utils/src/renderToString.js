// @flow

import Vue from 'vue'
import createInstance from 'create-instance'
import { throwError } from 'shared/util'
import { createRenderer } from 'vue-server-renderer'
import { mergeOptions } from 'shared/merge-options'
import config from './config'
import _createLocalVue from 'shared/create-local-vue'
import { validateOptions } from 'shared/validate-options'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function renderToString(
  component: Component,
  options: Options = {}
): Promise<string> {
  const renderer = createRenderer()

  if (!renderer) {
    throwError(
      `renderToString must be run in node. It cannot be run in a browser`
    )
  }

  if (options.attachToDocument) {
    throwError(`you cannot use attachToDocument with renderToString`)
  }

  const mergedOptions = mergeOptions(options, config)
  validateOptions(mergedOptions, component)

  const vm = createInstance(
    component,
    mergedOptions,
    _createLocalVue(options.localVue)
  )

  return renderer.renderToString(vm)
}
