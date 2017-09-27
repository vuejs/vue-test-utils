// @flow

import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'

function createLocalVue (): Component {
  const instance = Vue.extend()

  // clone global APIs
  Object.keys(Vue).forEach(key => {
    if (!instance.hasOwnProperty(key)) {
      instance[key] = cloneDeep(Vue[key])
    }
  })

  // config is not enumerable
  instance.config = cloneDeep(Vue.config)

  // option merge strategies need to be exposed by reference
  // so that merge strats registered by plguins can work properly
  instance.config.optionMergeStrategies = Vue.config.optionMergeStrategies

  const use = instance.use
  instance.use = (plugin) => {
    // compat for vue-router < 2.7.1
    plugin.installed = false
    plugin.install.installed = false
    use.call(instance, plugin)
  }
  return instance
}

export default createLocalVue
