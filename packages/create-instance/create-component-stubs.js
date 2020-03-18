// @flow

import Vue from 'vue'
import {
  throwError,
  camelize,
  capitalize,
  hyphenate,
  keys
} from '../shared/util'
import {
  componentNeedsCompiling,
  templateContainsComponent,
  isVueComponent,
  isDynamicComponent,
  isConstructor
} from '../shared/validators'
import { compileTemplate, compileFromString } from '../shared/compile-template'

function isVueComponentStub(comp): boolean {
  return (comp && comp.template) || isVueComponent(comp)
}

function isValidStub(stub: any): boolean {
  return (
    typeof stub === 'boolean' ||
    (!!stub && typeof stub === 'string') ||
    isVueComponentStub(stub)
  )
}

function resolveComponent(obj: Object, component: string): Object {
  return (
    obj[component] ||
    obj[hyphenate(component)] ||
    obj[camelize(component)] ||
    obj[capitalize(camelize(component))] ||
    obj[capitalize(component)] ||
    {}
  )
}

function getCoreProperties(componentOptions: Component): Object {
  return {
    attrs: componentOptions.attrs,
    name: componentOptions.name,
    model: componentOptions.model,
    props: componentOptions.props,
    on: componentOptions.on,
    key: componentOptions.key,
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

function createClassString(staticClass, dynamicClass) {
  // :class="someComputedObject" can return a string, object or undefined
  // if it is a string, we don't need to do anything special.
  let evalutedDynamicClass = dynamicClass

  // if it is an object, eg { 'foo': true }, we need to evaluate it.
  // see https://github.com/vuejs/vue-test-utils/issues/1474 for more context.
  if (typeof dynamicClass === 'object') {
    evalutedDynamicClass = Object.keys(dynamicClass).reduce((acc, key) => {
      if (dynamicClass[key] === true) {
        return acc + ' ' + key
      }
      return acc
    }, '')
  }

  if (staticClass && evalutedDynamicClass) {
    return staticClass + ' ' + evalutedDynamicClass
  }
  return staticClass || evalutedDynamicClass
}

function resolveOptions(component, _Vue) {
  if (isDynamicComponent(component)) {
    return {}
  }

  if (isConstructor(component)) {
    return component.options
  }
  const options = _Vue.extend(component).options
  component._Ctor = {}

  return options
}

function getScopedSlotRenderFunctions(ctx: any): Array<string> {
  // In Vue 2.6+ a new v-slot syntax was introduced
  // scopedSlots are now saved in parent._vnode.data.scopedSlots
  // We filter out the _normalized and $stable key
  if (
    ctx &&
    ctx.$options &&
    ctx.$options.parent &&
    ctx.$options.parent._vnode &&
    ctx.$options.parent._vnode.data &&
    ctx.$options.parent._vnode.data.scopedSlots
  ) {
    const slotKeys: Array<string> = ctx.$options.parent._vnode.data.scopedSlots
    return keys(slotKeys).filter(x => x !== '_normalized' && x !== '$stable')
  }

  return []
}

export function createStubFromComponent(
  originalComponent: Component,
  name: string,
  _Vue: Component
): Component {
  const componentOptions = resolveOptions(originalComponent, _Vue)
  const tagName = `${name || 'anonymous'}-stub`

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(tagName)
  }

  return {
    ...getCoreProperties(componentOptions),
    $_vueTestUtils_original: originalComponent,
    $_doNotStubChildren: true,
    render(h, context) {
      return h(
        tagName,
        {
          ref: componentOptions.functional ? context.data.ref : undefined,
          attrs: componentOptions.functional
            ? {
                ...context.props,
                ...context.data.attrs,
                class: createClassString(
                  context.data.staticClass,
                  context.data.class
                )
              }
            : {
                ...this.$props
              }
        },
        context
          ? context.children
          : this.$options._renderChildren ||
              getScopedSlotRenderFunctions(this).map(x =>
                this.$options.parent._vnode.data.scopedSlots[x]()
              )
      )
    }
  }
}

function createStubFromString(
  templateString: string,
  originalComponent: Component = {},
  name: string,
  _Vue: Component
): Component {
  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference')
  }
  const componentOptions = resolveOptions(originalComponent, _Vue)

  return {
    ...getCoreProperties(componentOptions),
    $_doNotStubChildren: true,
    ...compileFromString(templateString)
  }
}

function validateStub(stub) {
  if (!isValidStub(stub)) {
    throwError(`options.stub values must be passed a string or ` + `component`)
  }
}

export function createStubsFromStubsObject(
  originalComponents: Object = {},
  stubs: Object,
  _Vue: Component
): Components {
  return Object.keys(stubs || {}).reduce((acc, stubName) => {
    const stub = stubs[stubName]

    validateStub(stub)

    if (stub === false) {
      return acc
    }

    if (stub === true) {
      const component = resolveComponent(originalComponents, stubName)
      acc[stubName] = createStubFromComponent(component, stubName, _Vue)
      return acc
    }

    if (typeof stub === 'string') {
      const component = resolveComponent(originalComponents, stubName)
      acc[stubName] = createStubFromString(stub, component, stubName, _Vue)
      return acc
    }

    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub)
    }

    acc[stubName] = stub
    stub._Ctor = {}

    return acc
  }, {})
}
