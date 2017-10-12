import Vue from 'vue'

export default function addListeners (vm, listeners) {
  const originalVueConfig = Vue.config
  Vue.config.silent = true
  if (listeners) {
    vm.$listeners = listeners
  } else {
    vm.$listeners = {}
  }
  Vue.config.silent = originalVueConfig.silent
}
