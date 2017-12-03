import Vue from 'vue'

export const vueVersion = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)

export function injectSupported () {
  return vueVersion > 2.2
}

export function attrsSupported () {
  return vueVersion > 2.2
}

export function listenersSupported () {
  return vueVersion > 2.3
}
