import Vue from 'vue'

export default function addAttrs (vm, attrs) {
  const originalVueConfig = Vue.config
  Vue.config.silent = true
  if (attrs) {
    vm.$attrs = attrs
  } else {
    vm.$attrs = {}
  }
  Vue.config.silent = originalVueConfig.silent
}
