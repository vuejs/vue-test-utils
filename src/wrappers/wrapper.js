// @flow

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
  isVueComponent: boolean;
  element: HTMLElement;
  update: Function;
  options: WrapperOptions;

  constructor (vnode: VNode, update: Function, options: WrapperOptions) {
    this.vnode = vnode
    this.element = vnode.elm
    this.update = update
    this.options = options
  }

  at () {
    throwError('at() must be called on a WrapperArray')
  }

  /**
   * Checks if wrapper contains provided selector.
   */
  contains (selector: string | Component) {
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

    return this.element && this.element.getAttribute(attribute) === value
  }

  /**
   * Asserts wrapper has a class name
   */
  hasClass (className: string) {
    if (typeof className !== 'string') {
      throwError('wrapper.hasClass() must be passed a string')
    }

    return this.element.className.split(' ').indexOf(className) !== -1
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
    return elStyle === mockNodeStyle
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
  findAll (selector: string | Component): WrapperArray {
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
    const tmp = document.createElement('div')
    tmp.appendChild(this.element)
    return tmp.innerHTML
  }

  /**
   * Checks if node matches selector
   */
  is (selector: string | Component): boolean {
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
    return this.element.getAttribute && this.element.matches(selector)
  }

  /**
   * Checks if node is empty
   */
  isEmpty (): boolean {
    return this.vnode.children === undefined
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
   * Sets vm props
   */
  setProps (data: Object) {
    if (!this.isVueComponent || !this.vm) {
      throwError('wrapper.setProps() can only be called on a Vue instance')
    }

    Object.keys(data).forEach((key) => {
      // $FlowIgnore : Problem with possibly null this.vm
      this.vm._props[key] = data[key]
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
    return this.element.textContent
  }

  /**
   * Dispatches a DOM event on wrapper
   */
  trigger (type: string, options: Object = {}) {
    if (typeof type !== 'string') {
      throwError('wrapper.trigger() must be passed a string')
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
