import Vue from 'vue'

export const NAME_SELECTOR = 'NAME_SELECTOR'
export const COMPONENT_SELECTOR = 'COMPONENT_SELECTOR'
export const REF_SELECTOR = 'REF_SELECTOR'
export const DOM_SELECTOR = 'DOM_SELECTOR'
export const VUE_VERSION = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)
export const FUNCTIONAL_OPTIONS = VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions'
