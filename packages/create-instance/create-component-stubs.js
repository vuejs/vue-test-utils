// @flow

import Vue from 'vue'
import {
  throwError,
  camelize,
  capitalize,
  hyphenate
} from '../shared/util'
import {
  componentNeedsCompiling,
  templateContainsComponent,
  isVueComponent
} from '../shared/validators'
import {
  compileTemplate,
  compileFromString
} from '../shared/compile-template'

function isVueComponentStub (comp): boolean {
  return comp && comp.template || isVueComponent(comp)
}

function isValidStub (stub: any): boolean {
  return (
    typeof stub === 'boolean' ||
    (!!stub && typeof stub === 'string') ||
    isVueComponentStub(stub)
  )
}

function resolveComponent (obj: Object, component: string): Object {
  return obj[component] ||
    obj[hyphenate(component)] ||
    obj[camelize(component)] ||
    obj[capitalize(camelize(component))] ||
    obj[capitalize(component)] ||
    {}
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

function createClassString (staticClass, dynamicClass) {
  if (staticClass && dynamicClass) {
    return staticClass + ' ' + dynamicClass
  }
  return staticClass || dynamicClass
}

export function createStubFromComponent (
  originalComponent: Component,
  name: string
): Component {
  const componentOptions =
    typeof originalComponent === 'function' && originalComponent.cid
      ? originalComponent.extendOptions
      : originalComponent

  const tagName = `${name || 'anonymous'}-stub`

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(tagName)
  }

  return {
    ...getCoreProperties(componentOptions),
    $_vueTestUtils_original: originalComponent,
    $_doNotStubChildren: true,
    render (h, context) {
      return h(
        tagName,
        {
          attrs: componentOptions.functional ? {
            ...context.props,
            ...context.data.attrs,
            class: createClassString(
              context.data.staticClass,
              context.data.class
            )
          } : {
            ...this.$props
          }
        },
        context ? context.children : this.$options._renderChildren
      )
    }
  }
}

export function createStubFromString (
  templateString: string,
  originalComponent: Component = {},
  name: string
): Component {
  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference')
  }

  const componentOptions =
    typeof originalComponent === 'function' && originalComponent.cid
      ? originalComponent.extendOptions
      : originalComponent

  return {
    ...getCoreProperties(componentOptions),
    $_doNotStubChildren: true,
    ...compileFromString(templateString)
  }
}

function validateStub (stub) {
  if (!isValidStub(stub)) {
    throwError(
      `options.stub values must be passed a string or ` +
      `component`
    )
  }
}

export function createStubsFromStubsObject (
  originalComponents: Object = {},
  stubs: Object
): Components {
  return Object.keys(stubs || {}).reduce((acc, stubName) => {
    const stub = stubs[stubName]

    validateStub(stub)

    if (stub === false) {
      return acc
    }

    if (stub === true) {
      const component = resolveComponent(originalComponents, stubName)
      acc[stubName] = createStubFromComponent(component, stubName)
      return acc
    }

    if (typeof stub === 'string') {
      const component = resolveComponent(originalComponents, stubName)
      acc[stubName] = createStubFromString(
        stub,
        component,
        stubName
      )
      return acc
    }

    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub)
    }

    acc[stubName] = stub

    return acc
  }, {})
}
