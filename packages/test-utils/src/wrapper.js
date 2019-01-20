// @flow

import Vue from 'vue'
import getSelector from './get-selector'
import {
  REF_SELECTOR,
  FUNCTIONAL_OPTIONS,
  VUE_VERSION
} from 'shared/consts'
import config from './config'
import WrapperArray from './wrapper-array'
import ErrorWrapper from './error-wrapper'
import {
  throwError,
  warn,
  getCheckedEvent,
  isPhantomJS
} from 'shared/util'
import find from './find'
import createWrapper from './create-wrapper'
import { orderWatchers } from './order-watchers'
import { recursivelySetData } from './recursively-set-data'
import { matches } from './matches'
import createDOMEvent from './create-dom-event'
import { throwIfInstancesThrew } from './error'

export default class Wrapper implements BaseWrapper {
  +vnode: VNode | null;
  +vm: Component | void;
  _emitted: { [name: string]: Array<Array<any>> };
  _emittedByOrder: Array<{ name: string, args: Array<any> }>;
  +element: Element;
  update: Function;
  +options: WrapperOptions;
  isFunctionalComponent: boolean;
  rootNode: VNode | Element

  constructor (
    node: VNode | Element,
    options: WrapperOptions,
    isVueWrapper?: boolean
  ) {
    const vnode = node instanceof Element ? null : node
    const element = node instanceof Element ? node : node.elm
    // Prevent redefine by VueWrapper
    if (!isVueWrapper) {
      // $FlowIgnore : issue with defineProperty
      Object.defineProperty(this, 'rootNode', {
        get: () => vnode || element,
        set: () => throwError('wrapper.rootNode is read-only')
      })
      // $FlowIgnore
      Object.defineProperty(this, 'vnode', {
        get: () => vnode,
        set: () => throwError('wrapper.vnode is read-only')
      })
      // $FlowIgnore
      Object.defineProperty(this, 'element', {
        get: () => element,
        set: () => throwError('wrapper.element is read-only')
      })
      // $FlowIgnore
      Object.defineProperty(this, 'vm', {
        get: () => undefined,
        set: () => throwError('wrapper.vm is read-only')
      })
    }
    const frozenOptions = Object.freeze(options)
    // $FlowIgnore
    Object.defineProperty(this, 'options', {
      get: () => frozenOptions,
      set: () => throwError('wrapper.options is read-only')
    })
    if (
      this.vnode &&
      (this.vnode[FUNCTIONAL_OPTIONS] || this.vnode.functionalContext)
    ) {
      this.isFunctionalComponent = true
    }
  }

  at (): void {
    throwError('at() must be called on a WrapperArray')
  }

  /**
   * Returns an Object containing all the attribute/value pairs on the element.
   */
  attributes (key?: string): { [name: string]: string } | string {
    const attributes = this.element.attributes
    const attributeMap = {}
    for (let i = 0; i < attributes.length; i++) {
      const att = attributes.item(i)
      attributeMap[att.localName] = att.value
    }
    if (key) {
      return attributeMap[key]
    }
    return attributeMap
  }

  /**
   * Returns an Array containing all the classes on the element
   */
  classes (className?: string): Array<string> | boolean {
    const classAttribute = this.element.getAttribute('class')
    let classes = classAttribute ? classAttribute.split(' ') : []
    // Handle converting cssmodules identifiers back to the original class name
    if (this.vm && this.vm.$style) {
      const cssModuleIdentifiers = Object.keys(this.vm.$style)
        .reduce((acc, key) => {
        // $FlowIgnore
          const moduleIdent = this.vm.$style[key]
          if (moduleIdent) {
            acc[moduleIdent.split(' ')[0]] = key
          }
          return acc
        }, {})
      classes = classes.map(
        name => cssModuleIdentifiers[name] || name
      )
    }

    if (className) {
      if (classes.indexOf(className) > -1) {
        return true
      } else {
        return false
      }
    }
    return classes
  }

  /**
   * Checks if wrapper contains provided selector.
   */
  contains (rawSelector: Selector): boolean {
    const selector = getSelector(rawSelector, 'contains')
    const nodes = find(this.rootNode, this.vm, selector)
    return nodes.length > 0
  }

  /**
   * Calls destroy on vm
   */
  destroy (): void {
    if (!this.isVueInstance()) {
      throwError(`wrapper.destroy() can only be called on a Vue instance`)
    }

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    // $FlowIgnore
    this.vm.$destroy()
    throwIfInstancesThrew(this.vm)
  }

  /**
   * Returns an object containing custom events emitted by the Wrapper vm
   */
  emitted (
    event?: string
  ): Array<Array<any>> | { [name: string]: Array<Array<any>> } {
    if (!this._emitted && !this.vm) {
      throwError(`wrapper.emitted() can only be called on a Vue instance`)
    }
    if (event) {
      return this._emitted[event]
    }
    return this._emitted
  }

  /**
   * Returns an Array containing custom events emitted by the Wrapper vm
   */
  emittedByOrder (): Array<{ name: string, args: Array<any> }> {
    if (!this._emittedByOrder && !this.vm) {
      throwError(
        `wrapper.emittedByOrder() can only be called on a Vue instance`
      )
    }
    return this._emittedByOrder
  }

  /**
   * Utility to check wrapper exists. Returns true as Wrapper always exists
   */
  exists (): boolean {
    if (this.vm) {
      return !!this.vm && !this.vm._isDestroyed
    }
    return true
  }

  filter () {
    throwError('filter() must be called on a WrapperArray')
  }

  /**
   * Finds first node in tree of the current wrapper that
   * matches the provided selector.
   */
  find (rawSelector: Selector): Wrapper | ErrorWrapper {
    const selector = getSelector(rawSelector, 'find')
    const node = find(this.rootNode, this.vm, selector)[0]

    if (!node) {
      if (selector.type === REF_SELECTOR) {
        return new ErrorWrapper(`ref="${selector.value.ref}"`)
      }
      return new ErrorWrapper(
        typeof selector.value === 'string'
          ? selector.value
          : 'Component'
      )
    }

    return createWrapper(node, this.options)
  }

  /**
   * Finds node in tree of the current wrapper that matches
   * the provided selector.
   */
  findAll (rawSelector: Selector): WrapperArray {
    const selector = getSelector(rawSelector, 'findAll')
    const nodes = find(this.rootNode, this.vm, selector)
    const wrappers = nodes.map(node => {
      // Using CSS Selector, returns a VueWrapper instance if the root element
      // binds a Vue instance.
      return createWrapper(node, this.options)
    })
    return new WrapperArray(wrappers)
  }

  /**
   * Checks if wrapper has an attribute with matching value
   */
  hasAttribute (attribute: string, value: string): boolean {
    warn(
      `hasAttribute() has been deprecated and will be ` +
      `removed in version 1.0.0. Use attributes() ` +
      `instead—https://vue-test-utils.vuejs.org/api/wrapper/attributes.html`
    )

    if (typeof attribute !== 'string') {
      throwError(
        `wrapper.hasAttribute() must be passed attribute as a string`
      )
    }

    if (typeof value !== 'string') {
      throwError(
        `wrapper.hasAttribute() must be passed value as a string`
      )
    }

    return !!(this.element.getAttribute(attribute) === value)
  }

  /**
   * Asserts wrapper has a class name
   */
  hasClass (className: string): boolean {
    warn(
      `hasClass() has been deprecated and will be removed ` +
      `in version 1.0.0. Use classes() ` +
      `instead—https://vue-test-utils.vuejs.org/api/wrapper/classes.html`
    )
    let targetClass = className

    if (typeof targetClass !== 'string') {
      throwError('wrapper.hasClass() must be passed a string')
    }

    // if $style is available and has a matching target, use that instead.
    if (this.vm && this.vm.$style && this.vm.$style[targetClass]) {
      targetClass = this.vm.$style[targetClass]
    }

    const containsAllClasses = targetClass
      .split(' ')
      .every(target => this.element.classList.contains(target))

    return !!(this.element && containsAllClasses)
  }

  /**
   * Asserts wrapper has a prop name
   */
  hasProp (prop: string, value: string): boolean {
    warn(
      `hasProp() has been deprecated and will be removed ` +
      `in version 1.0.0. Use props() ` +
      `instead—https://vue-test-utils.vuejs.org/api/wrapper/props.html`
    )

    if (!this.isVueInstance()) {
      throwError('wrapper.hasProp() must be called on a Vue instance')
    }
    if (typeof prop !== 'string') {
      throwError('wrapper.hasProp() must be passed prop as a string')
    }

    // $props object does not exist in Vue 2.1.x, so use
    // $options.propsData instead
    if (
      this.vm &&
      this.vm.$options &&
      this.vm.$options.propsData &&
      this.vm.$options.propsData[prop] === value
    ) {
      return true
    }

    return !!this.vm && !!this.vm.$props && this.vm.$props[prop] === value
  }

  /**
   * Checks if wrapper has a style with value
   */
  hasStyle (style: string, value: string): boolean {
    warn(
      `hasStyle() has been deprecated and will be removed ` +
      `in version 1.0.0. Use wrapper.element.style ` +
      `instead`
    )

    if (typeof style !== 'string') {
      throwError(`wrapper.hasStyle() must be passed style as a string`)
    }

    if (typeof value !== 'string') {
      throwError('wrapper.hasClass() must be passed value as string')
    }

    /* istanbul ignore next */
    if (
      navigator.userAgent.includes &&
      (navigator.userAgent.includes('node.js') ||
        navigator.userAgent.includes('jsdom'))
    ) {
      warn(
        `wrapper.hasStyle is not fully supported when ` +
        `running jsdom - only inline styles are supported`
      )
    }
    const body = document.querySelector('body')
    const mockElement = document.createElement('div')

    if (!(body instanceof Element)) {
      return false
    }
    const mockNode = body.insertBefore(mockElement, null)
    // $FlowIgnore : Flow thinks style[style] returns a number
    mockElement.style[style] = value

    if (!this.options.attachedToDocument && (this.vm || this.vnode)) {
      // $FlowIgnore : Possible null value, will be removed in 1.0.0
      const vm = this.vm || this.vnode.context.$root
      body.insertBefore(vm.$root._vnode.elm, null)
    }

    const elStyle = window.getComputedStyle(this.element)[style]
    const mockNodeStyle = window.getComputedStyle(mockNode)[style]
    return !!(elStyle && mockNodeStyle && elStyle === mockNodeStyle)
  }

  /**
   * Returns HTML of element as a string
   */
  html (): string {
    return this.element.outerHTML
  }

  /**
   * Checks if node matches selector
   */
  is (rawSelector: Selector): boolean {
    const selector = getSelector(rawSelector, 'is')

    if (selector.type === REF_SELECTOR) {
      throwError('$ref selectors can not be used with wrapper.is()')
    }

    return matches(this.rootNode, selector)
  }

  /**
   * Checks if node is empty
   */
  isEmpty (): boolean {
    if (!this.vnode) {
      return this.element.innerHTML === ''
    }
    const nodes = []
    let node = this.vnode
    let i = 0

    while (node) {
      if (node.child) {
        nodes.push(node.child._vnode)
      }
      node.children && node.children.forEach(n => {
        nodes.push(n)
      })
      node = nodes[i++]
    }
    return nodes.every(n => n.isComment || n.child)
  }

  /**
   * Checks if node is visible
   */
  isVisible (): boolean {
    let element = this.element
    while (element) {
      if (
        element.style &&
        (element.style.visibility === 'hidden' ||
          element.style.display === 'none')
      ) {
        return false
      }
      element = element.parentElement
    }

    return true
  }

  /**
   * Checks if wrapper is a vue instance
   */
  isVueInstance (): boolean {
    return !!this.vm
  }

  /**
   * Returns name of component, or tag name if node is not a Vue component
   */
  name (): string {
    if (this.vm) {
      return this.vm.$options.name ||
      // compat for Vue < 2.3
      (this.vm.$options.extendOptions && this.vm.$options.extendOptions.name)
    }

    if (!this.vnode) {
      return this.element.tagName
    }

    return this.vnode.tag
  }

  /**
   * Returns an Object containing the prop name/value pairs on the element
   */
  props (key?: string): { [name: string]: any } | any {
    if (this.isFunctionalComponent) {
      throwError(
        `wrapper.props() cannot be called on a mounted ` +
          `functional component.`
      )
    }
    if (!this.vm) {
      throwError('wrapper.props() must be called on a Vue instance')
    }

    const props = {}
    const keys = this.vm && this.vm.$options._propKeys

    if (keys) {
      (keys || {}).forEach(key => {
        if (this.vm) {
          props[key] = this.vm[key]
        }
      })
    }

    if (key) {
      return props[key]
    }

    return props
  }

  /**
   * Checks radio button or checkbox element
   */
  setChecked (checked: boolean = true): void {
    if (typeof checked !== 'boolean') {
      throwError('wrapper.setChecked() must be passed a boolean')
    }
    const tagName = this.element.tagName
    // $FlowIgnore
    const type = this.attributes().type
    const event = getCheckedEvent()

    if (tagName === 'INPUT' && type === 'checkbox') {
      if (this.element.checked === checked) {
        return
      }
      if (event !== 'click' || isPhantomJS) {
        // $FlowIgnore
        this.element.checked = checked
      }
      this.trigger(event)
      return
    }

    if (tagName === 'INPUT' && type === 'radio') {
      if (!checked) {
        throwError(
          `wrapper.setChecked() cannot be called with ` +
          `parameter false on a <input type="radio" /> ` +
          `element.`
        )
      }

      if (event !== 'click' || isPhantomJS) {
        // $FlowIgnore
        this.element.selected = true
      }
      this.trigger(event)
      return
    }

    throwError(`wrapper.setChecked() cannot be called on this element`)
  }

  /**
   * Selects <option></option> element
   */
  setSelected (): void {
    const tagName = this.element.tagName

    if (tagName === 'SELECT') {
      throwError(
        `wrapper.setSelected() cannot be called on select. ` +
        `Call it on one of its options`
      )
    }

    if (tagName === 'OPTION') {
      // $FlowIgnore
      this.element.selected = true
      // $FlowIgnore
      let parentElement = this.element.parentElement

      // $FlowIgnore
      if (parentElement.tagName === 'OPTGROUP') {
        // $FlowIgnore
        parentElement = parentElement.parentElement
      }

      // $FlowIgnore
      createWrapper(parentElement, this.options).trigger('change')
      return
    }

    throwError(`wrapper.setSelected() cannot be called on this element`)
  }

  /**
   * Sets vm computed
   */
  setComputed (computed: Object): void {
    if (!this.isVueInstance()) {
      throwError(
        `wrapper.setComputed() can only be called on a Vue ` +
        `instance`
      )
    }

    warn(
      `setComputed() has been deprecated and will be ` +
        `removed in version 1.0.0. You can overwrite ` +
        `computed properties by passing a computed object ` +
        `in the mounting options`
    )

    Object.keys(computed).forEach(key => {
      if (VUE_VERSION > 2.1) {
        // $FlowIgnore : Problem with possibly null this.vm
        if (!this.vm._computedWatchers[key]) {
          throwError(
            `wrapper.setComputed() was passed a value that ` +
            `does not exist as a computed property on the ` +
            `Vue instance. Property ${key} does not exist ` +
            `on the Vue instance`
          )
        }
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm._computedWatchers[key].value = computed[key]
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm._computedWatchers[key].getter = () => computed[key]
      } else {
        let isStore = false
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm._watchers.forEach(watcher => {
          if (watcher.getter.vuex && key in watcher.vm.$options.store.getters) {
            watcher.vm.$options.store.getters = {
              ...watcher.vm.$options.store.getters
            }
            Object.defineProperty(watcher.vm.$options.store.getters, key, {
              get: function () {
                return computed[key]
              }
            })
            isStore = true
          }
        })

        // $FlowIgnore : Problem with possibly null this.vm
        if (!isStore && !this.vm._watchers.some(w => w.getter.name === key)) {
          throwError(
            `wrapper.setComputed() was passed a value that does ` +
            `not exist as a computed property on the Vue instance. ` +
            `Property ${key} does not exist on the Vue instance`
          )
        }
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm._watchers.forEach(watcher => {
          if (watcher.getter.name === key) {
            watcher.value = computed[key]
            watcher.getter = () => computed[key]
          }
        })
      }
    })
    // $FlowIgnore : Problem with possibly null this.vm
    this.vm._watchers.forEach(watcher => {
      watcher.run()
    })
  }

  /**
   * Sets vm data
   */
  setData (data: Object): void {
    if (this.isFunctionalComponent) {
      throwError(
        `wrapper.setData() cannot be called on a functional ` +
        `component`
      )
    }

    if (!this.vm) {
      throwError(
        `wrapper.setData() can only be called on a Vue ` +
        `instance`
      )
    }

    recursivelySetData(this.vm, this.vm, data)
  }

  /**
   * Sets vm methods
   */
  setMethods (methods: Object): void {
    if (!this.isVueInstance()) {
      throwError(
        `wrapper.setMethods() can only be called on a Vue ` +
        `instance`
      )
    }
    Object.keys(methods).forEach(key => {
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm[key] = methods[key]
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm.$options.methods[key] = methods[key]
    })

    if (this.vnode) {
      const context = this.vnode.context
      if (context.$options.render) context._update(context._render())
    }
  }

  /**
   * Sets vm props
   */
  setProps (data: Object): void {
    const originalConfig = Vue.config.silent
    Vue.config.silent = config.silent
    if (this.isFunctionalComponent) {
      throwError(
        `wrapper.setProps() cannot be called on a ` +
        `functional component`
      )
    }
    if (!this.vm) {
      throwError(
        `wrapper.setProps() can only be called on a Vue ` +
        `instance`
      )
    }

    Object.keys(data).forEach(key => {
      if (
        typeof data[key] === 'object' &&
        data[key] !== null &&
        // $FlowIgnore : Problem with possibly null this.vm
        data[key] === this.vm[key]
      ) {
        throwError(
          `wrapper.setProps() called with the same object ` +
          `of the existing ${key} property. ` +
          `You must call wrapper.setProps() with a new object ` +
          `to trigger reactivity`
        )
      }
      if (
        !this.vm ||
        !this.vm.$options._propKeys ||
        !this.vm.$options._propKeys.some(prop => prop === key)
      ) {
        if (VUE_VERSION > 2.3) {
          // $FlowIgnore : Problem with possibly null this.vm
          this.vm.$attrs[key] = data[key]
          return
        }
        throwError(
          `wrapper.setProps() called with ${key} property which ` +
          `is not defined on the component`
        )
      }

      if (this.vm && this.vm._props) {
        // Set actual props value
        this.vm._props[key] = data[key]
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm[key] = data[key]
      } else {
        // $FlowIgnore : Problem with possibly null this.vm.$options
        this.vm.$options.propsData[key] = data[key]
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm[key] = data[key]
        // $FlowIgnore : Need to call this twice to fix watcher bug in 2.0.x
        this.vm[key] = data[key]
      }
    })
    // $FlowIgnore : Problem with possibly null this.vm
    this.vm.$forceUpdate()
    // $FlowIgnore : Problem with possibly null this.vm
    orderWatchers(this.vm || this.vnode.context.$root)
    Vue.config.silent = originalConfig
  }

  /**
   * Sets element value and triggers input event
   */
  setValue (value: any): void {
    const tagName = this.element.tagName
    // $FlowIgnore
    const type = this.attributes().type

    if (tagName === 'OPTION') {
      throwError(
        `wrapper.setValue() cannot be called on an <option> ` +
          `element. Use wrapper.setSelected() instead`
      )
    } else if (tagName === 'INPUT' && type === 'checkbox') {
      throwError(
        `wrapper.setValue() cannot be called on a <input ` +
          `type="checkbox" /> element. Use ` +
          `wrapper.setChecked() instead`
      )
    } else if (tagName === 'INPUT' && type === 'radio') {
      throwError(
        `wrapper.setValue() cannot be called on a <input ` +
          `type="radio" /> element. Use wrapper.setChecked() ` +
          `instead`
      )
    } else if (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT'
    ) {
      const event = tagName === 'SELECT' ? 'change' : 'input'
      // $FlowIgnore
      this.element.value = value
      this.trigger(event)
    } else {
      throwError(`wrapper.setValue() cannot be called on this element`)
    }
  }

  /**
   * Return text of wrapper element
   */
  text (): string {
    return this.element.textContent.trim()
  }

  /**
   * Dispatches a DOM event on wrapper
   */
  trigger (type: string, options: Object = {}) {
    if (typeof type !== 'string') {
      throwError('wrapper.trigger() must be passed a string')
    }

    if (options.target) {
      throwError(
        `you cannot set the target value of an event. See ` +
          `the notes section of the docs for more ` +
          `details—https://vue-test-utils.vuejs.org/api/wrapper/trigger.html`
      )
    }

    // Don't fire event on a disabled element
    if (this.attributes().disabled) {
      return
    }

    const event = createDOMEvent(type, options)
    this.element.dispatchEvent(event)

    if (this.vnode) {
      orderWatchers(this.vm || this.vnode.context.$root)
    }
  }

  update (): void {
    warn(
      `update has been removed from vue-test-utils. All ` +
      `updates are now synchronous by default`
    )
  }

  /**
   * Utility to check wrapper is visible. Returns false if a parent
   * element has display: none or visibility: hidden style.
   */
  visible (): boolean {
    warn(
      `visible has been deprecated and will be removed in ` +
      `version 1, use isVisible instead`
    )
    let element = this.element
    while (element) {
      if (
        element.style &&
        (element.style.visibility === 'hidden' ||
          element.style.display === 'none')
      ) {
        return false
      }
      element = element.parentElement
    }

    return true
  }
}
