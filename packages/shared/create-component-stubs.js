// @flow

import Vue from 'vue'
import {
  throwError,
  camelize,
  capitalize,
  hyphenate
} from './util'
import {
  componentNeedsCompiling,
  templateContainsComponent,
  isVueComponent
} from './validators'
import {
  compileTemplate,
  compileFromString
} from './compile-template'

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
        context ? context.children : this.$slots.default
      )
    }
  }
}

function createStubFromString (
  templateString: string,
  originalComponent: Component = {},
  name: string
): Component {
  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference')
  }

  const componentOptions = typeof originalComponent === 'function'
    ? originalComponent.extendOptions
    : originalComponent

  return {
    ...getCoreProperties(componentOptions),
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

    if (originalComponents[stubName]) {
      // Remove cached constructor
      delete originalComponents[stubName]._Ctor
    }

    if (typeof stub === 'string') {
      acc[stubName] = createStubFromString(
        stub,
        originalComponents[stubName],
        stubName
      )
      return acc
    }

    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub)
    }
    const name = originalComponents[stubName] &&
    originalComponents[stubName].name

    acc[stubName] = {
      name,
      ...stub
    }

    return acc
  }, {})
}

function stubComponents (
  components: Components,
  stubbedComponents: Components
): void {
  for (const component in components) {
    const cmp = components[component]
    const componentOptions = typeof cmp === 'function'
      ? cmp.extendOptions
      : cmp

    if (!componentOptions) {
      stubbedComponents[component] = createStubFromComponent(
        {},
        component
      )
      return
    }
    // Remove cached constructor
    delete componentOptions._Ctor
    if (!componentOptions.name) {
      componentOptions.name = component
    }
    stubbedComponents[component] = createStubFromComponent(
      componentOptions,
      component
    )
  }
}

export function createStubsForComponent (
  component: Component
): Components {
  const stubbedComponents = {}

  if (component.options) {
    stubComponents(component.options.components, stubbedComponents)
  }

  if (component.components) {
    stubComponents(component.components, stubbedComponents)
  }

  let extended = component.extends
  while (extended) {
    if (extended.components) {
      stubComponents(extended.components, stubbedComponents)
    }
    extended = extended.extends
  }

  let extendOptions = component.extendOptions
  while (extendOptions) {
    if (extendOptions && extendOptions.components) {
      stubComponents(extendOptions.components, stubbedComponents)
    }
    extendOptions = extendOptions.extendOptions
  }

  return stubbedComponents
}
