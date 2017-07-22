// @flow

import Vue from 'vue'
import { cloneDeep } from 'lodash'

function createLocalVue (): Component {
  const instance = Vue.extend()
  instance.version = Vue.version
  instance._installedPlugins = []
  instance.config = cloneDeep(Vue.config)
  instance.util = cloneDeep(Vue.util)
  return instance
}

export default createLocalVue
