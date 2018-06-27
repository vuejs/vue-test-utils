// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import {
  throwError,
  camelize,
  capitalize,
  hyphenate
} from './util'
import {
  componentNeedsCompiling,
  templateContainsComponent
} from './validators'
import { compileTemplate } from './compile-template'

function isVueComponent (comp) {
  return comp && (comp.render || comp.template || comp.options)
}

function isValidStub (stub: any) {
  return (
    (!!stub && typeof stub === 'string') ||
    stub === true ||
    isVueComponent(stub)
  )
}

function resolveComponent (obj, component) {
  return obj[component] ||
    obj[hyphenate(component)] ||
    obj[camelize(component)] ||
    obj[capitalize(camelize(component))] ||
    obj[capitalize(component)] ||
    {}
}

function isRequiredComponent (name) {
  return (
    name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
  )
}

function getCoreProperties (componentOptions: Component): Object {
  return {
    attrs: componentOptions.attrs,
    name: componentOptions.name,
    on: componentOptions.on,
    key: componentOptions.key,
    ref: componentOptions.ref,
    props: componentOptions.props,
    domProps: componentOptions.domProps,
    class: componentOptions.class,
    staticClass: componentOptions.staticClass,
    staticStyle: componentOptions.staticStyle,
    style: componentOptions.style,
    normalizedStyle: componentOptions.normalizedStyle,
    nativeOn: componentOptions.nativeOn,
    functional: componentOptions.functional
  }
}
function createStubFromString (
  templateString: string,
  originalComponent: Component,
  name: string
): Object {
  if (!compileToFunctions) {
    throwError(
      `vueTemplateCompiler is undefined, you must pass ` +
        `precompiled components if vue-template-compiler is ` +
        `undefined`
    )
  }

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference')
  }

  const componentOptions = typeof originalComponent === 'function'
    ? originalComponent.extendOptions
    : originalComponent

  return {
    ...getCoreProperties(componentOptions),
    ...compileToFunctions(templateString)
  }
}

function createBlankStub (originalComponent: Component, name: string) {
  const componentOptions = typeof originalComponent === 'function'
    ? originalComponent.extendOptions
    : originalComponent
  const tagName = `${name}-stub`

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(tagName)
  }

  return {
    ...getCoreProperties(componentOptions),
    render (h) {
      return h(tagName)
    }
  }
}

export function createComponentStubs (
  originalComponents: Object = {},
  stubs: Object
): Object {
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
        throwError(`each item in an options.stubs array must be a ` + `string`)
      }
      const component = resolveComponent(originalComponents, stub)

      components[stub] = createBlankStub(component, stub)
    })
  } else {
    Object.keys(stubs).forEach(stub => {
      if (stubs[stub] === false) {
        return
      }
      if (!isValidStub(stubs[stub])) {
        throwError(
          `options.stub values must be passed a string or ` + `component`
        )
      }
      if (stubs[stub] === true) {
        const component = resolveComponent(originalComponents, stub)
        components[stub] = createBlankStub(component, stub)
        return
      }

      if (componentNeedsCompiling(stubs[stub])) {
        compileTemplate(stubs[stub])
      }

      if (originalComponents[stub]) {
        // Remove cached constructor
        delete originalComponents[stub]._Ctor
        if (typeof stubs[stub] === 'string') {
          components[stub] = createStubFromString(
            stubs[stub],
            originalComponents[stub],
            stub
          )
        } else {
          components[stub] = {
            ...stubs[stub],
            name: originalComponents[stub].name
          }
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!compileToFunctions) {
            throwError(
              `vueTemplateCompiler is undefined, you must pass ` +
                `precompiled components if vue-template-compiler is ` +
                `undefined`
            )
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
    })
  }
  return components
}

function stubComponents (components: Object, stubbedComponents: Object) {
  Object.keys(components).forEach(component => {
    const cmp = components[component]
    const componentOptions = typeof cmp === 'function'
      ? cmp.extendOptions
      : cmp
    // Remove cached constructor
    delete componentOptions._Ctor
    if (!componentOptions.name) {
      componentOptions.name = component
    }
    stubbedComponents[component] = createBlankStub(componentOptions, component)
  })
}

export function createComponentStubsForAll (component: Component): Object {
  const stubbedComponents = {}

  if (component.components) {
    stubComponents(component.components, stubbedComponents)
  }

  stubbedComponents[component.name] = createBlankStub(component, component.name)

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
  Object.keys(instance.options.components).forEach(c => {
    if (isRequiredComponent(c)) {
      return
    }

    components[c] = createBlankStub(instance.options.components[c], c)
    delete instance.options.components[c]._Ctor
    delete components[c]._Ctor
  })
  return components
}
