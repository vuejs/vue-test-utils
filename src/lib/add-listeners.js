import Vue from 'vue'

export default function addListeners (vm, listeners) {
  const originalSilent = Vue.config.silent
  Vue.config.silent = true
  if (listeners) {
    vm.$listeners = listeners
  } else {
    vm.$listeners = {}
  }
  Vue.config.silent = originalSilent
}
