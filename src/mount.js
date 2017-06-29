// @flow

import Vue from 'vue'
import VueWrapper from './wrappers/vue-wrapper'
import addSlots from './lib/add-slots'
import addGlobals from './lib/add-globals'
import addProvide from './lib/add-provide'
import { stubComponents } from './lib/stub-components'

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
    slots?: Object,
    instance?: Component,
    stub?: Object
}

export default function mount (component: Component, options: MountOptions = {}): VueWrapper {
  let elem

  const attachToDocument = options.attachToDocument

  if (attachToDocument) {
    elem = createElem()
    delete options.attachToDocument // eslint-disable-line no-param-reassign
  }

  if (options.stub) {
    stubComponents(component, options.stub)
  }

  // Remove cached constructor
  delete component._Ctor // eslint-disable-line no-param-reassign

  if (options.provide) {
    addProvide(component, options)
  }

  let Constructor

  if (options.instance) {
    Constructor = options.instance.extend(component)
  } else {
    Constructor = Vue.extend(component)
  }

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
