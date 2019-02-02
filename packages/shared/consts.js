import Vue from 'vue'
import semver from 'semver'

export const NAME_SELECTOR = 'NAME_SELECTOR'
export const COMPONENT_SELECTOR = 'COMPONENT_SELECTOR'
export const REF_SELECTOR = 'REF_SELECTOR'
export const DOM_SELECTOR = 'DOM_SELECTOR'
export const INVALID_SELECTOR = 'INVALID_SELECTOR'
export const COMPAT_SYNC_MODE = 'COMPAT_SYNC_MODE'

export const VUE_VERSION = Number(
  `${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`
)

export const FUNCTIONAL_OPTIONS =
  VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions'

export const BEFORE_RENDER_LIFECYCLE_HOOK = semver.gt(Vue.version, '2.1.8')
  ? 'beforeCreate'
  : 'beforeMount'

export const CREATE_ELEMENT_ALIAS = semver.gt(Vue.version, '2.1.5')
  ? '_c'
  : '_h'
