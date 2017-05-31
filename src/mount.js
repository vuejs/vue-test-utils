import Vue from 'vue'
import VueWrapper from './VueWrapper'

Vue.config.productionTip = false

function createElem () {
  const elem = document.createElement('div')

  document.body.appendChild(elem)

  return elem
}

export default function mount (component, options = {}) {
  let elem

  const attachToDocument = options.attachToDocument

  if (attachToDocument) {
    elem = createElem()
    delete options.attachToDocument // eslint-disable-line no-param-reassign
  }

   // Remove cached constructor
  delete component._Ctor // eslint-disable-line no-param-reassign

  const Constructor = Vue.extend(component)
  const vm = new Constructor(options)

  vm.$mount(elem)

  return new VueWrapper(vm, attachToDocument)
}
