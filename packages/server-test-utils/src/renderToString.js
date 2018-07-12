// @flow

import Vue from 'vue'
import { createInstance, createRenderSlot } from 'create-instance'
import { throwError } from 'shared/util'
import { createRenderer } from 'vue-server-renderer'
import testUtils from '@vue/test-utils'
import { mergeOptions } from 'shared/merge-options'
import config from './config'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function renderToString (
  component: Component,
  options: Options = {}
): string {
  const renderer = createRenderer()

  if (!renderer) {
    throwError(
      `renderToString must be run in node. It cannot be ` + `run in a browser`
    )
  }
  // Remove cached constructor
  delete component._Ctor

  if (options.attachToDocument) {
    throwError(`you cannot use attachToDocument with ` + `renderToString`)
  }
  const vueConstructor = testUtils.createLocalVue(options.localVue)
  vueConstructor.prototype._t = createRenderSlot(options)

  const vm = createInstance(
    component,
    mergeOptions(options, config),
    vueConstructor
  )
  let renderedString = ''

  // $FlowIgnore
  renderer.renderToString(vm, (err, res) => {
    if (err) {
      console.log(err)
    }
    renderedString = res
  })
  return renderedString
}
