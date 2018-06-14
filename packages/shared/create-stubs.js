// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from './util'
import {
  componentNeedsCompiling,
  templateContainsComponent
} from './validators'
import { compileTemplate } from './compile-template'

function isVueComponent (comp) {
  return comp && (comp.render || comp.template || comp.options)
}

function isValidStub (stub: any) {
  return !!stub && typeof stub === 'string' ||
      stub === true ||
      stub === false ||
      isVueComponent(stub)
}

function isRequiredComponent (name) {
  return name === 'KeepAlive' ||
  name === 'Transition' ||
  name === 'TransitionGroup'
}

function getCoreProperties (component: Component): Object {
  return {
    attrs: component.attrs,
    name: component.name,
    on: component.on,
    key: component.key,
    ref: component.ref,
    props: component.props,
    domProps: component.domProps,
    class: component.class,
    staticClass: component.staticClass,
    staticStyle: component.staticStyle,
    style: component.style,
    normalizedStyle: component.normalizedStyle,
    nativeOn: component.nativeOn,
    functional: component.functional
  }
}
function createStubFromString (
  templateString: string,
  originalComponent: Component,
  name: string
): Object {
  if (!compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined')
  }

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference')
  }

  if (!originalComponent) {
    return { ...compileToFunctions(templateString) }
  }

  return {
    ...getCoreProperties(originalComponent),
    ...compileToFunctions(templateString)
  }
}

function createStubFromOptions (originalComponent: Component) {
  const name = `${originalComponent.name}-stub`

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(name)
  }

  return {
    ...getCoreProperties(originalComponent),
    render (h) {
      return h(name)
    }
  }
}

export function createStubsForStubsOption (
  originalComponents: Object = {},
  stubsOption: Object
): Object {
  const stubs = {}
  if (!stubsOption) {
    return stubs
  }
  if (Array.isArray(stubsOption)) {
    stubsOption.forEach(stub => {
      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string')
      }
      stubs[stub] = createStubFromOptions({ name: stub })
    })
    return stubs
  }

  Object.keys(stubsOption).forEach(stub => {
    if (!isValidStub(stubsOption[stub])) {
      throwError('options.stub values must be passed a string or component')
    }
    if (stubsOption[stub] === false) {
      return
    }

    if (stubsOption[stub] === true) {
      stubs[stub] = createStubFromOptions({ name: stub })
      return
    }

    if (typeof stubsOption[stub] === 'string') {
      stubs[stub] = createStubFromString(
        stubsOption[stub],
        originalComponents[stub],
        stub
      )
      return
    }

    if (componentNeedsCompiling(stubsOption[stub])) {
      compileTemplate(stubsOption[stub])
    }

    if (originalComponents[stub]) {
      // Remove cached constructor
      delete originalComponents[stub]._Ctor

      stubs[stub] = {
        ...stubsOption[stub],
        name: originalComponents[stub].name
      }
      return
    }
    stubs[stub] = {
      ...stubsOption[stub]
    }
  })
  return stubs
}

function stubComponents (components: Object, stubs: Object) {
  Object.keys(components).forEach(component => {
    if (isRequiredComponent(component)) {
      return
    }
    // Remove cached constructor
    delete components[component]._Ctor
    if (!components[component].name) {
      components[component].name = component
    }
    stubs[component] = createStubFromOptions(components[component])
  })
}

export function createStubsForComponent (component: Component): Object {
  const stubs = {}

  if (component.components) {
    stubComponents(component.components, stubs)
  }

  stubs[component.name] = createStubFromOptions(component)

  let extended = component.extends

  // Loop through extended component chains to stub all child components
  while (extended) {
    if (extended.components) {
      stubComponents(extended.components, stubs)
    }
    extended = extended.extends
  }

  if (component.extendOptions && component.extendOptions.components) {
    stubComponents(component.extendOptions.components, stubs)
  }

  if (component.options && component.options.components) {
    stubComponents(component.options.components, stubs)
  }

  return stubs
}
