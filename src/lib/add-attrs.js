import Vue from 'vue'

export default function addAttrs (vm, attrs) {
  const originalSilent = Vue.config.silent
  Vue.config.silent = true
  if (attrs) {
    vm.$attrs = attrs
  } else {
    vm.$attrs = {}
  }
  Vue.config.silent = originalSilent
}
