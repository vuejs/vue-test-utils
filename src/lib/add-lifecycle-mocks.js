import Vue from 'vue'

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated'
]

export default function addLifecycleMocks (mockedProperties, component) {
  const originalVueConfig = Vue.config
  Vue.config.silent = true

  Object.keys(mockedProperties)
    .filter(key => LIFECYCLE_HOOKS.indexOf(key) !== -1)
    .forEach(key => {
      component[key] = mockedProperties[key]
    })

  Vue.config.silent = originalVueConfig.silent
}
