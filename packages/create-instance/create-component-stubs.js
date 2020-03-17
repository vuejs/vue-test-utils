// @flow

import Vue from 'vue'
import {
  throwError,
  camelize,
  capitalize,
  hyphenate,
  keys,
  warn
} from '../shared/util'
import {
  componentNeedsCompiling,
  templateContainsComponent,
  isVueComponent,
  isDynamicComponent,
  isConstructor
} from '../shared/validators'
import { compileTemplate } from '../shared/compile-template'

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
  if (staticClass && dynamicClass) {
    return staticClass + ' ' + dynamicClass
  }
  return staticClass || dynamicClass
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

// DEPRECATED: converts string stub to template stub.
function createStubFromString(templateString: string, name: string): Component {
  warn('String stubs are deprecated and will be removed in future versions')

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference')
  }

  return {
    template: templateString,
    $_doNotStubChildren: true
  }
}

function setStubComponentName(
  stub: Object,
  originalComponent: Component = {},
  _Vue: Component
) {
  if (stub.name) return

  const componentOptions = resolveOptions(originalComponent, _Vue)
  stub.name = getCoreProperties(componentOptions).name
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
    let stub = stubs[stubName]

    validateStub(stub)

    if (stub === false) {
      return acc
    }

    const component = resolveComponent(originalComponents, stubName)

    if (stub === true) {
      acc[stubName] = createStubFromComponent(component, stubName, _Vue)
      return acc
    }

    if (typeof stub === 'string') {
      stub = createStubFromString(stub, stubName)
      stubs[stubName]
    }

    setStubComponentName(stub, component, _Vue)
    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub)
    }

    acc[stubName] = stub
    stub._Ctor = {}

    return acc
  }, {})
}
