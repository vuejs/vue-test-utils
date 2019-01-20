// @flow

import Vue from 'vue'
import createInstance from 'create-instance'
import { throwError } from 'shared/util'
import { createRenderer } from 'vue-server-renderer'
import { mergeOptions } from 'shared/merge-options'
import config from './config'
import testUtils from '@vue/test-utils'

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

  if (options.attachToDocument) {
    throwError(`you cannot use attachToDocument with ` + `renderToString`)
  }

  const vm = createInstance(
    component,
    mergeOptions(options, config),
    testUtils.createLocalVue(options.localVue)
  )
  let renderedString = ''

  // $FlowIgnore
  renderer.renderToString(vm, (err, res) => {
    if (err) {
      throw err
    }
    renderedString = res
  })
  return renderedString
}
