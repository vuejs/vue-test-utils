// @flow

import Vue from 'vue'
import { cloneDeep } from 'lodash'

function createLocalVue (): Component {
  const instance = Vue.extend()
  instance.version = Vue.version
  instance._installedPlugins = []
  instance.config = cloneDeep(Vue.config)
  instance.util = cloneDeep(Vue.util)
  instance._use = instance.use
  instance.use = (plugin) => {
    plugin.installed = false
    plugin.install.installed = false
    instance._use(plugin)
  }
  return instance
}

export default createLocalVue
