import Vue from 'vue'

export const vueVersion = parseFloat(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}${Vue.version.split('.')[2]}`)

export function injectSupported () {
  return vueVersion > 2.2
}

export function attrsSupported () {
  return vueVersion > 2.2
}

export function listenersSupported () {
  return vueVersion > 2.3
}
