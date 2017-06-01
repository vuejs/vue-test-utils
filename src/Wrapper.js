import { isValidSelector } from './lib/validators'
import findVueComponents from './lib/findVueComponents'
import findMatchingVNodes from './lib/findMatchingVNodes'
import VueWrapper from './VueWrapper'
import WrapperArray from './WrapperArray'

export default class Wrapper {
  constructor (vNode, update, mountedToDom) {
    this.vNode = vNode
    this.element = vNode.elm
    this.update = update
    this.mountedToDom = mountedToDom
  }

  /**
   * Checks if wrapper contains provided selector.
   *
   * @param {String} selector
   * @returns {Boolean}
   */
  contains (selector) {
    if (!isValidSelector(selector)) {
      throw new Error('wrapper.contains() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      const vm = this.vm || this.vNode.context.$root
      return findVueComponents(vm, selector.name).length > 0
    }

    return this.element.querySelectorAll(selector).length > 0
  }

  /**
   * Checks if wrapper has an attribute with matching value
   *
   * @param {String} attribute - attribute to assert
   * @param {String} value - value attribute should contain
   * @returns {Boolean}
   */
  hasAttribute (attribute, value) {
    if (typeof attribute !== 'string') {
      throw new Error('wrapper.hasAttribute() must be passed attribute as a string')
    }

    if (typeof value !== 'string') {
      throw new Error('wrapper.hasAttribute() must be passed value as a string')
    }

    return this.element.getAttribute(attribute) === value
  }

  /**
   * Asserts wrapper has a class name
   *
   * @param {String} className - class name to assert
   * @returns {Boolean}
   */
  hasClass (className) {
    if (typeof className !== 'string') {
      throw new Error('wrapper.hasClass() must be passed a string')
    }

    return this.element.className.split(' ').indexOf(className) !== -1
  }

  /**
   * Finds every node in the mount tree of the current wrapper that matches the provided selector.
   *
   * @param {String|Object} selector
   * @returns {VueWrapper||VueWrapper[]}
   */
  find (selector) {
    if (!isValidSelector(selector)) {
      throw new Error('wrapper.find() must be passed a valid CSS selector or a Vue constructor')
    }

    if (typeof selector === 'object') {
      if (!selector.name) {
        throw new Error('.find() requires component to have a name property')
      }
      const vm = this.vm || this.vNode.context.$root
      const components = findVueComponents(vm, selector.name)
      return new WrapperArray(components.map(component => new VueWrapper(component, undefined, this.mounted)))
    }

    const nodes = findMatchingVNodes(this.vNode, selector)

    return new WrapperArray(nodes.map(node => new Wrapper(node, this.update, this.mountedToDom)))
  }

  /**
   * Sets vm data
   *
   * @param {Object} data - data to set
   */
  setData (data) {
    if (!this.isVueComponent) {
      throw new Error('wrapper.setData() can only be called on a Vue instance')
    }

    Object.keys(data).forEach((key) => {
      this.vm.$set(this.vm, [key], data[key])
    })
    this.update()
    this.vNode = this.vm._vnode
  }

  /**
   * Sets vm props
   *
   * @param {Object} data - data to set
   */
  setProps (data) {
    if (!this.isVueComponent) {
      throw new Error('wrapper.setProps() can only be called on a Vue instance')
    }

    Object.keys(data).forEach((key) => {
      this.vm._props[key] = data[key]
    })
    this.update()
    this.vNode = this.vm._vnode
  }

  /**
   * Dispatches a DOM event on wrapper
   *
   * @param {String} type - type of event
   * @returns {Boolean}
   */
  trigger (type) {
    if (typeof type !== 'string') {
      throw new Error('wrapper.trigger() must be passed a string')
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

    const eventObject = new window.Event(event[0])

    if (event.length === 2) {
      eventObject.keyCode = modifiers[event[1]]
    }

    this.element.dispatchEvent(eventObject)
    this.update()
  }
}
