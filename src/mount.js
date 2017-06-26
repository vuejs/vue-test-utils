// @flow

import Vue from 'vue'
import VueWrapper from './VueWrapper'
import addSlots from './lib/addSlots'
import addGlobals from './lib/addGlobals'
import addProvide from './lib/addProvide'
import { compileToFunctions } from 'vue-template-compiler'

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

function stubLifeCycleEvents (component: Component): void {
  LIFECYCLE_HOOKS.forEach((hook) => {
    component[hook] = () => {} // eslint-disable-line no-param-reassign
  })
}

function replaceComponents (component: Component, stubs): void {
  Object.keys(stubs).forEach(stub => {
        // Remove cached constructor
    delete component.components[stub]._Ctor
    component.components[stub] = {
      ...component.components[stub],
      ...compileToFunctions(stubs[stub])
    }
    Vue.config.ignoredElements.push(stub)
    stubLifeCycleEvents(component.components[stub])
  })
}

export default function mount (component: Component, options: MountOptions = {}): VueWrapper {
  let elem

  const attachToDocument = options.attachToDocument

  if (attachToDocument) {
    elem = createElem()
    delete options.attachToDocument // eslint-disable-line no-param-reassign
  }

  if (options.stub) {
    replaceComponents(component, options.stub)
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
