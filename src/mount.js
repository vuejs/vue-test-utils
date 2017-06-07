// @flow

import Vue from 'vue'
import VueWrapper from './VueWrapper'
import addSlots from './lib/addSlots'
import addGlobals from './lib/addGlobals'
import addProvide from './lib/addProvide'

Vue.config.productionTip = false

function createElem (): HTMLElement | void {
  if (document) {
    const elem = document.createElement('div')

    if (document.body) {
      document.body.appendChild(elem)
    }
    return elem
  }
}

type MountOptions = {
    attachToDocument?: boolean,
    intercept?: Object,
    slots?: Object
}

export default function mount (component: Component, options: MountOptions = {}): VueWrapper {
  let elem

  const attachToDocument = options.attachToDocument

  if (attachToDocument) {
    elem = createElem()
    delete options.attachToDocument // eslint-disable-line no-param-reassign
  }

  // Remove cached constructor
  delete component._Ctor // eslint-disable-line no-param-reassign

  if (options.provide) {
    addProvide(component, options)
  }

  const Constructor = Vue.extend(component)

  if (options.intercept) {
    const globals = addGlobals(options.intercept)
    Constructor.use(globals)
  }

  const vm = new Constructor(options)

  if (options.slots) {
    addSlots(vm, options.slots)
  }

  vm.$mount(elem)

  return new VueWrapper(vm, { attachedToDocument: !!attachToDocument })
}
