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
  templateContainsComponent,
  isVueComponent,
  isRequiredComponent
} from './validators'
import { compileTemplate } from './compile-template'

function compileFromString (str) {
  if (!compileToFunctions) {
    throwError(
      `vueTemplateCompiler is undefined, you must pass ` +
        `precompiled components if vue-template-compiler is ` +
        `undefined`
    )
  }
  return compileToFunctions(str)
}

function isVueComponentStub (comp): boolean {
  return comp && comp.template || isVueComponent(comp)
}

function isValidStub (stub: any): boolean {
  return (
    (!!stub && typeof stub === 'string') ||
    stub === true ||
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

function createStubFromString (
  templateString: string,
  originalComponent: Component,
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

function createClassString (staticClass, dynamicClass) {
  if (staticClass && dynamicClass) {
    return staticClass + ' ' + dynamicClass
  }
  return staticClass || dynamicClass
}

export function createBlankStub (
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
      let innerContent = null
      if (context) {
        innerContent = context.children
      } else {
        innerContent = Object.keys(this.$slots).map(slotName => {
          const slot = this.$slots[slotName]
          if (slotName !== 'default') {
            return slot
          } else {
            const element = h('div', { class: `${slotName}-slot` }, slot)
            return element
          }
        })
      }
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
        innerContent
      )
    }
  }
}

export function createComponentStubs (
  originalComponents: Object = {},
  stubs: Object
): Components {
  const components = {}
  if (!stubs) {
    return components
  }
  Object.keys(stubs).forEach(stubName => {
    const stub = stubs[stubName]
    if (stub === false) {
      return
    }

    if (!isValidStub(stub)) {
      throwError(
        `options.stub values must be passed a string or ` + `component`
      )
    }

    if (stub === true) {
      const component = resolveComponent(originalComponents, stubName)
      components[stubName] = createBlankStub(component, stubName)
      return
    }

    if (typeof stub !== 'string' && componentNeedsCompiling(stub)) {
      compileTemplate(stub)
    }

    if (originalComponents[stubName]) {
      // Remove cached constructor
      delete originalComponents[stubName]._Ctor
      if (typeof stub === 'string') {
        components[stubName] = createStubFromString(
          stub,
          originalComponents[stubName],
          stubName
        )
      } else {
        const stubObject = (stub: Object)
        components[stubName] = {
          ...stubObject,
          name: originalComponents[stubName].name
        }
      }
    } else {
      if (typeof stub === 'string') {
        components[stubName] = {
          ...compileFromString(stub)
        }
      } else {
        const stubObject = (stub: Object)
        components[stubName] = {
          ...stubObject
        }
      }
    }
  })
  return components
}

function stubComponents (
  components: Components,
  stubbedComponents: Components
): void {
  Object.keys(components).forEach(component => {
    const cmp = components[component]
    const componentOptions = typeof cmp === 'function'
      ? cmp.extendOptions
      : cmp

    if (!componentOptions) {
      stubbedComponents[component] = createBlankStub({}, component)
      return
    }
    // Remove cached constructor
    delete componentOptions._Ctor
    if (!componentOptions.name) {
      componentOptions.name = component
    }
    stubbedComponents[component] = createBlankStub(componentOptions, component)
  })
}

export function createComponentStubsForAll (component: Component): Components {
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

  let extendOptions = component.extendOptions
  while (extendOptions) {
    if (extendOptions && extendOptions.components) {
      stubComponents(extendOptions.components, stubbedComponents)
    }
    extendOptions = extendOptions.extendOptions
  }

  return stubbedComponents
}

export function createComponentStubsForGlobals (
  instance: Component
): Components {
  const components = {}
  for (const c in instance.options.components) {
    if (isRequiredComponent(c)) {
      continue
    }
    components[c] = createBlankStub(instance.options.components[c], c)
    delete instance.options.components[c]._Ctor
    delete components[c]._Ctor
  }
  return components
}
