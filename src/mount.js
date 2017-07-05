// @flow

import Vue from 'vue'
import VueWrapper from './wrappers/vue-wrapper'
import addSlots from './lib/add-slots'
import addGlobals from './lib/add-globals'
import addProvide from './lib/add-provide'
import { stubComponents } from './lib/stub-components'
import { cloneDeep } from 'lodash'
import './lib/matches-polyfill'

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
    stub?: Object,
    context?: Object
}

export default function mount (component: Component, options: MountOptions = {}): VueWrapper {
  if (!window) {
    throw new Error('window is undefined, vue-test-utils needs to be run in a browser environment.\n You can run the tests in node using JSDOM')
  }

  let elem

  const attachToDocument = options.attachToDocument

  if (attachToDocument) {
    elem = createElem()
    delete options.attachToDocument
  }

  // Remove cached constructor
  delete component._Ctor

  if (options.context) {
    if (!component.functional) {
      throw new Error('mount.context can only be used when mounting a functional component')
    }

    if (typeof options.context !== 'object') {
      throw new Error('mount.context must be an object')
    }
    const clonedComponent = cloneDeep(component)
    component = {
      render (h) {
        return h(clonedComponent, options.context)
      }
    }
  }

  if (options.provide) {
    addProvide(component, options)
  }

  let Constructor

  if (options.instance) {
    Constructor = options.instance.extend(component)
  } else {
    if (options.stub) {
      stubComponents(component, options.stub)
    }
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
