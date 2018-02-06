// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from './util'
import { componentNeedsCompiling } from './validators'
import { compileTemplate } from './compile-template'

function isVueComponent (comp) {
  return comp && (comp.render || comp.template || comp.options)
}

function isValidStub (stub: any) {
  return !!stub &&
      typeof stub === 'string' ||
      (stub === true) ||
      (isVueComponent(stub))
}

function isRequiredComponent (name) {
  return name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
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
function createStubFromString (templateString: string, originalComponent: Component): Object {
  if (!compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
  }
  return {
    ...getCoreProperties(originalComponent),
    ...compileToFunctions(templateString)
  }
}

function createBlankStub (originalComponent: Component) {
  return {
    ...getCoreProperties(originalComponent),
    render: h => h('')
  }
}

export function createComponentStubs (originalComponents: Object = {}, stubs: Object): Object {
  const components = {}
  if (!stubs) {
    return components
  }
  if (Array.isArray(stubs)) {
    stubs.forEach(stub => {
      if (stub === false) {
        return
      }

      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string')
      }
      components[stub] = createBlankStub({})
    })
  } else {
    Object.keys(stubs).forEach(stub => {
      if (stubs[stub] === false) {
        return
      }
      if (!isValidStub(stubs[stub])) {
        throwError('options.stub values must be passed a string or component')
      }
      if (stubs[stub] === true) {
        components[stub] = createBlankStub({})
        return
      }

      if (componentNeedsCompiling(stubs[stub])) {
        compileTemplate(stubs[stub])
      }

      if (originalComponents[stub]) {
        // Remove cached constructor
        delete originalComponents[stub]._Ctor
        if (typeof stubs[stub] === 'string') {
          components[stub] = createStubFromString(stubs[stub], originalComponents[stub])
        } else {
          components[stub] = {
            ...stubs[stub],
            name: originalComponents[stub].name
          }
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!compileToFunctions) {
            throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
          }
          components[stub] = {
            ...compileToFunctions(stubs[stub])
          }
        } else {
          components[stub] = {
            ...stubs[stub]
          }
        }
      }
      // ignoreElements does not exist in Vue 2.0.x
      if (Vue.config.ignoredElements) {
        Vue.config.ignoredElements.push(stub)
      }
    })
  }
  return components
}

function stubComponents (components: Object, stubbedComponents: Object) {
  Object.keys(components).forEach(component => {
    // Remove cached constructor
    delete components[component]._Ctor
    if (!components[component].name) {
      components[component].name = component
    }
    stubbedComponents[component] = createBlankStub(components[component])

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue.config.ignoredElements) {
      Vue.config.ignoredElements.push(component)
    }
  })
}

export function createComponentStubsForAll (component: Component): Object {
  const stubbedComponents = {}

  if (component.components) {
    stubComponents(component.components, stubbedComponents)
  }

  let extended = component.extends

  // Loop through extended component chains to stub all child components
  while (extended) {
    if (extended.components) {
      stubComponents(extended.components, stubbedComponents)
    }
    extended = extended.extends
  }

  if (component.extendOptions && component.extendOptions.components) {
    stubComponents(component.extendOptions.components, stubbedComponents)
  }

  return stubbedComponents
}

export function createComponentStubsForGlobals (instance: Component): Object {
  const components = {}
  Object.keys(instance.options.components).forEach((c) => {
    if (isRequiredComponent(c)) {
      return
    }

    components[c] = createBlankStub(instance.options.components[c])
    delete instance.options.components[c]._Ctor // eslint-disable-line no-param-reassign
    delete components[c]._Ctor // eslint-disable-line no-param-reassign
  })
  return components
}
