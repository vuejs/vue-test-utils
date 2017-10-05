import Vue from 'vue'

export default function addListeners (vm, listeners) {
  Vue.config.silent = true
  if (listeners) {
    vm.$listeners = listeners
  } else {
    vm.$listeners = {}
  }
  Vue.config.silent = false
}
