// @flow

import Vue from 'vue'
import { isValidSelector } from '../lib/validators'
import findVueComponents, { vmCtorMatchesName } from '../lib/find-vue-components'
import findMatchingVNodes from '../lib/find-matching-vnodes'
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
   * Checks if wrapper contains provided selector.
   */
  contains (selector: Selector) {
    if (!isValidSelector(selector)) {
      throwError('wrapper.contains() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      const vm = this.vm || this.vnode.context.$root
      return findVueComponents(vm, selector.name).length > 0
    }

    if (typeof selector === 'string' && this.element instanceof HTMLElement) {
      return this.element.querySelectorAll(selector).length > 0
    }

    return false
  }

  /**
   * Returns an object containing custom events emitted by the Wrapper vm
   */
  emitted () {
    if (!this._emitted && !this.vm) {
      throwError('wrapper.emitted() can only be called on a Vue instance')
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

    return !!(this.element && this.element.classList.contains(targetClass))
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
  find (selector: string): Wrapper | ErrorWrapper | VueWrapper {
    if (!isValidSelector(selector)) {
      throwError('wrapper.find() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      if (!selector.name) {
        throwError('.find() requires component to have a name property')
      }
      const vm = this.vm || this.vnode.context.$root
      const components = findVueComponents(vm, selector.name)
      if (components.length === 0) {
        return new ErrorWrapper('Component')
      }
      return new VueWrapper(components[0], this.options)
    }

    const nodes = findMatchingVNodes(this.vnode, selector)

    if (nodes.length === 0) {
      return new ErrorWrapper(selector)
    }
    return new Wrapper(nodes[0], this.update, this.options)
  }

  /**
   * Finds node in tree of the current wrapper that matches the provided selector.
   */
  findAll (selector: Selector): WrapperArray {
    if (!isValidSelector(selector)) {
      throwError('wrapper.findAll() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      if (!selector.name) {
        throwError('.findAll() requires component to have a name property')
      }
      const vm = this.vm || this.vnode.context.$root
      const components = findVueComponents(vm, selector.name)
      return new WrapperArray(components.map(component => new VueWrapper(component, this.options)))
    }

    function nodeMatchesSelector (node, selector) {
      return node.elm && node.elm.getAttribute && node.elm.matches(selector)
    }

    const nodes = findMatchingVNodes(this.vnode, selector)
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
    if (!isValidSelector(selector)) {
      throwError('wrapper.is() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      if (!this.isVueComponent) {
        return false
      }
      if (typeof selector.name !== 'string') {
        throwError('a Component used as a selector must have a name property')
      }
      return vmCtorMatchesName(this.vm, selector.name)
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

    return this.element.textContent
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
      right: 39
    }

    const event = type.split('.')

    const eventObject = new window.Event(event[0], {
      bubbles: true,
      cancelable: true
    })

    if (options && options.preventDefault) {
      eventObject.preventDefault()
    }

    if (options) {
      Object.keys(options).forEach(key => {
        eventObject[key] = options[key]
      })
    }

    if (event.length === 2) {
      eventObject.keyCode = modifiers[event[1]]
    }

    this.element.dispatchEvent(eventObject)
    this.update()
  }
}
