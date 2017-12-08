// @flow

import Vue from 'vue'
import getSelectorTypeOrThrow, { selectorTypes } from '../lib/get-selector-type'
import findVueComponents, { vmCtorMatchesName } from '../lib/find-vue-components'
import findVNodesBySelector from '../lib/find-vnodes-by-selector'
import findVNodesByRef from '../lib/find-vnodes-by-ref'
import VueWrapper from './vue-wrapper'
import WrapperArray from './wrapper-array'
import ErrorWrapper from './error-wrapper'
import { throwError } from '../lib/util'

export default class Wrapper implements BaseWrapper {
  vnode: VNode;
  vm: Component | null;
  _emitted: { [name: string]: Array<Array<any>> };
  _emittedByOrder: Array<{ name: string; args: Array<any> }>;
  isVueComponent: boolean;
  element: HTMLElement;
  update: Function;
  options: WrapperOptions;
  version: number

  constructor (vnode: VNode, update: Function, options: WrapperOptions) {
    this.vnode = vnode
    this.element = vnode.elm
    this.update = update
    this.options = options
    this.version = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)
  }

  at () {
    throwError('at() must be called on a WrapperArray')
  }

  /**
   * Returns an Object containing all the attribute/value pairs on the element.
   */
  attributes (): { [name: string]: string } {
    const attributes = [...this.element.attributes] // NameNodeMap is not iterable
    const attributeMap = {}
    attributes.forEach((att) => {
      attributeMap[att.localName] = att.value
    })
    return attributeMap
  }

  /**
   * Returns an Array containing all the classes on the element
   */
  classes (): Array<string> {
    let classes = [...this.element.classList]
    // Handle converting cssmodules identifiers back to the original class name
    if (this.vm && this.vm.$style) {
      const cssModuleIdentifiers = {}
      let moduleIdent
      Object.keys(this.vm.$style).forEach((key) => {
        // $FlowIgnore : Flow thinks vm is a property
        moduleIdent = this.vm.$style[key]
        // CSS Modules may be multi-class if they extend others. Extended classes should be already present in $style.
        moduleIdent = moduleIdent.split(' ')[0]
        cssModuleIdentifiers[moduleIdent] = key
      })
      classes = classes.map(className => cssModuleIdentifiers[className] || className)
    }
    return classes
  }

  /**
   * Checks if wrapper contains provided selector.
   */
  contains (selector: Selector) {
    const selectorType = getSelectorTypeOrThrow(selector, 'contains')

    if (selectorType === selectorTypes.VUE_COMPONENT) {
      const vm = this.vm || this.vnode.context.$root
      return findVueComponents(vm, selector.name).length > 0
    }

    if (selectorType === selectorTypes.OPTIONS_OBJECT) {
      if (!this.isVueComponent) {
        throwError('$ref selectors can only be used on Vue component wrappers')
      }
      const nodes = findVNodesByRef(this.vnode, selector.ref)
      return nodes.length > 0
    }

    if (selectorType === selectorTypes.DOM_SELECTOR && this.element instanceof HTMLElement) {
      return this.element.querySelectorAll(selector).length > 0
    }

    return false
  }

  /**
   * Returns an object containing custom events emitted by the Wrapper vm
   */
  emitted (event: ?string) {
    if (!this._emitted && !this.vm) {
      throwError('wrapper.emitted() can only be called on a Vue instance')
    }
    if (event) {
      return this._emitted[event]
    }
    return this._emitted
  }

  /**
   * Returns an Array containing custom events emitted by the Wrapper vm
   */
  emittedByOrder () {
    if (!this._emittedByOrder && !this.vm) {
      throwError('wrapper.emittedByOrder() can only be called on a Vue instance')
    }
    return this._emittedByOrder
  }

  /**
   * Utility to check wrapper exists. Returns true as Wrapper always exists
   */
  exists (): boolean {
    if (this.isVueComponent) {
      return !!this.vm && !this.vm._isDestroyed
    }
    return true
  }

  /**
   * Checks if wrapper has an attribute with matching value
   */
  hasAttribute (attribute: string, value: string) {
    if (typeof attribute !== 'string') {
      throwError('wrapper.hasAttribute() must be passed attribute as a string')
    }

    if (typeof value !== 'string') {
      throwError('wrapper.hasAttribute() must be passed value as a string')
    }

    return !!(this.element && this.element.getAttribute(attribute) === value)
  }

  /**
   * Asserts wrapper has a class name
   */
  hasClass (className: string) {
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
  hasProp (prop: string, value: string) {
    if (!this.isVueComponent) {
      throwError('wrapper.hasProp() must be called on a Vue instance')
    }
    if (typeof prop !== 'string') {
      throwError('wrapper.hasProp() must be passed prop as a string')
    }

    // $props object does not exist in Vue 2.1.x, so use $options.propsData instead
    if (this.vm && this.vm.$options && this.vm.$options.propsData && this.vm.$options.propsData[prop] === value) {
      return true
    }

    return !!this.vm && !!this.vm.$props && this.vm.$props[prop] === value
  }

  /**
   * Checks if wrapper has a style with value
   */
  hasStyle (style: string, value: string) {
    if (typeof style !== 'string') {
      throwError('wrapper.hasStyle() must be passed style as a string')
    }

    if (typeof value !== 'string') {
      throwError('wrapper.hasClass() must be passed value as string')
    }

    /* istanbul ignore next */
    if (navigator.userAgent.includes && (navigator.userAgent.includes('node.js') || navigator.userAgent.includes('jsdom'))) {
      console.warn('wrapper.hasStyle is not fully supported when running jsdom - only inline styles are supported') // eslint-disable-line no-console
    }
    const body = document.querySelector('body')
    const mockElement = document.createElement('div')

    if (!(body instanceof HTMLElement)) {
      return false
    }
    const mockNode = body.insertBefore(mockElement, null)
    // $FlowIgnore : Flow thinks style[style] returns a number
    mockElement.style[style] = value

    if (!this.options.attachedToDocument) {
      const vm = this.vm || this.vnode.context.$root
      body.insertBefore(vm.$root._vnode.elm, null)
    }

    const elStyle = window.getComputedStyle(this.element)[style]
    const mockNodeStyle = window.getComputedStyle(mockNode)[style]
    return !!(elStyle && mockNodeStyle && elStyle === mockNodeStyle)
  }

  /**
   * Finds first node in tree of the current wrapper that matches the provided selector.
   */
  find (selector: Selector): Wrapper | ErrorWrapper | VueWrapper {
    const selectorType = getSelectorTypeOrThrow(selector, 'find')
    if (selectorType === selectorTypes.VUE_COMPONENT) {
      if (!selector.name) {
        throwError('.find() requires component to have a name property')
      }
      const root = this.vm || this.vnode
      const components = findVueComponents(root, selector.name)
      if (components.length === 0) {
        return new ErrorWrapper('Component')
      }
      return new VueWrapper(components[0], this.options)
    }

    if (selectorType === selectorTypes.OPTIONS_OBJECT) {
      if (!this.isVueComponent) {
        throwError('$ref selectors can only be used on Vue component wrappers')
      }
      const nodes = findVNodesByRef(this.vnode, selector.ref)
      if (nodes.length === 0) {
        return new ErrorWrapper(`ref="${selector.ref}"`)
      }
      return new Wrapper(nodes[0], this.update, this.options)
    }

    const nodes = findVNodesBySelector(this.vnode, selector)

    if (nodes.length === 0) {
      return new ErrorWrapper(selector)
    }
    return new Wrapper(nodes[0], this.update, this.options)
  }

  /**
   * Finds node in tree of the current wrapper that matches the provided selector.
   */
  findAll (selector: Selector): WrapperArray {
    const selectorType = getSelectorTypeOrThrow(selector, 'findAll')

    if (selectorType === selectorTypes.VUE_COMPONENT) {
      if (!selector.name) {
        throwError('.findAll() requires component to have a name property')
      }
      const root = this.vm || this.vnode
      const components = findVueComponents(root, selector.name)
      return new WrapperArray(components.map(component => new VueWrapper(component, this.options)))
    }

    if (selectorType === selectorTypes.OPTIONS_OBJECT) {
      if (!this.isVueComponent) {
        throwError('$ref selectors can only be used on Vue component wrappers')
      }
      const nodes = findVNodesByRef(this.vnode, selector.ref)
      return new WrapperArray(nodes.map(node => new Wrapper(node, this.update, this.options)))
    }

    function nodeMatchesSelector (node, selector) {
      return node.elm && node.elm.getAttribute && node.elm.matches(selector)
    }

    const nodes = findVNodesBySelector(this.vnode, selector)
    const matchingNodes = nodes.filter(node => nodeMatchesSelector(node, selector))

    return new WrapperArray(matchingNodes.map(node => new Wrapper(node, this.update, this.options)))
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
  is (selector: Selector): boolean {
    const selectorType = getSelectorTypeOrThrow(selector, 'is')

    if (selectorType === selectorTypes.VUE_COMPONENT && this.isVueComponent) {
      if (typeof selector.name !== 'string') {
        throwError('a Component used as a selector must have a name property')
      }
      return vmCtorMatchesName(this.vm, selector.name)
    }

    if (selectorType === selectorTypes.OPTIONS_OBJECT) {
      throwError('$ref selectors can not be used with wrapper.is()')
    }

    if (typeof selector === 'object') {
      return false
    }

    return !!(this.element &&
    this.element.getAttribute &&
    this.element.matches(selector))
  }

  /**
   * Checks if node is empty
   */
  isEmpty (): boolean {
    return this.vnode.children === undefined || this.vnode.children.length === 0
  }

  /**
   * Checks if wrapper is a vue instance
   */
  isVueInstance (): boolean {
    return !!this.isVueComponent
  }

  /**
   * Returns name of component, or tag name if node is not a Vue component
   */
  name (): string {
    if (this.isVueComponent && this.vm) {
      return this.vm.$options.name
    }

    return this.vnode.tag
  }

  /**
   * Returns an Object containing the prop name/value pairs on the element
   */
  props (): { [name: string]: any } {
    if (!this.isVueComponent) {
      throwError('wrapper.props() must be called on a Vue instance')
    }
    // $props object does not exist in Vue 2.1.x, so use $options.propsData instead
    let _props
    if (this.vm && this.vm.$options && this.vm.$options.propsData) {
      _props = this.vm.$options.propsData
    } else {
      // $FlowIgnore
      _props = this.vm.$props
    }
    return _props || {} // Return an empty object if no props exist
  }

  /**
   * Sets vm data
   */
  setData (data: Object) {
    if (!this.isVueComponent) {
      throwError('wrapper.setData() can only be called on a Vue instance')
    }

    Object.keys(data).forEach((key) => {
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm.$set(this.vm, [key], data[key])
    })

    Object.keys(data).forEach((key) => {
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm._watchers.forEach((watcher) => {
        if (watcher.expression === key) { watcher.run() }
      })
    })

    this.update()
  }

  /**
   * Sets vm computed
   */
  setComputed (computed: Object) {
    if (!this.isVueComponent) {
      throwError('wrapper.setComputed() can only be called on a Vue instance')
    }

    Object.keys(computed).forEach((key) => {
      if (this.version > 2.1) {
        // $FlowIgnore : Problem with possibly null this.vm
        if (!this.vm._computedWatchers[key]) {
          throwError(`wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property ${key} does not exist on the Vue instance`)
        }
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm._computedWatchers[key].value = computed[key]
      } else {
        // $FlowIgnore : Problem with possibly null this.vm
        if (!this.vm._watchers.some(w => w.getter.name === key)) {
          throwError(`wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property ${key} does not exist on the Vue instance`)
        }
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm._watchers.forEach((watcher) => {
          if (watcher.getter.name === key) {
            watcher.value = computed[key]
          }
        })
      }
      // $FlowIgnore
      this.vm._watchers.forEach((watcher) => {
        if (watcher.expression === key) { watcher.run() }
      })
    })
    this.update()
  }

  /**
   * Sets vm methods
   */
  setMethods (methods: Object) {
    if (!this.isVueComponent) {
      throwError('wrapper.setMethods() can only be called on a Vue instance')
    }
    Object.keys(methods).forEach((key) => {
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm[key] = methods[key]
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm.$options.methods[key] = methods[key]
    })
    this.update()
  }

  /**
   * Sets vm props
   */
  setProps (data: Object) {
    if (!this.isVueComponent || !this.vm) {
      throwError('wrapper.setProps() can only be called on a Vue instance')
    }

    Object.keys(data).forEach((key) => {
      // $FlowIgnore : Problem with possibly null this.vm
      if (this.vm._props) {
        this.vm._props[key] = data[key]
      } else {
        // $FlowIgnore : Problem with possibly null this.vm
        this.vm[key] = data[key]
      }
    })

    Object.keys(data).forEach((key) => {
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm._watchers.forEach((watcher) => {
        if (watcher.expression === key) { watcher.run() }
      })
    })
    this.update()
    // $FlowIgnore : Problem with possibly null this.vm
    this.vnode = this.vm._vnode
  }

  /**
   * Return text of wrapper element
   */
  text (): string {
    if (!this.element) {
      throwError('cannot call wrapper.text() on a wrapper without an element')
    }

    return this.element.textContent.trim()
  }

  /**
   * Calls destroy on vm
   */
  destroy () {
    if (!this.isVueComponent) {
      throwError('wrapper.destroy() can only be called on a Vue instance')
    }

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    // $FlowIgnore
    this.vm.$destroy()
  }

  /**
   * Dispatches a DOM event on wrapper
   */
  trigger (type: string, options: Object = {}) {
    if (typeof type !== 'string') {
      throwError('wrapper.trigger() must be passed a string')
    }

    if (!this.element) {
      throwError('cannot call wrapper.trigger() on a wrapper without an element')
    }

    const modifiers = {
      enter: 13,
      tab: 9,
      delete: 46,
      esc: 27,
      space: 32,
      up: 38,
      down: 40,
      left: 37,
      right: 39,
      end: 35,
      home: 36,
      backspace: 8,
      insert: 45,
      pageup: 33,
      pagedown: 34
    }

    const event = type.split('.')

    let eventObject

    // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
    if (typeof (window.Event) === 'function') {
      eventObject = new window.Event(event[0], {
        bubbles: true,
        cancelable: true
      })
    } else {
      eventObject = document.createEvent('Event')
      eventObject.initEvent(event[0], true, true)
    }

    if (options && options.preventDefault) {
      eventObject.preventDefault()
    }

    if (options) {
      Object.keys(options).forEach(key => {
        // $FlowIgnore
        eventObject[key] = options[key]
      })
    }

    if (event.length === 2) {
      // $FlowIgnore
      eventObject.keyCode = modifiers[event[1]]
    }

    this.element.dispatchEvent(eventObject)
    this.update()
  }
}
