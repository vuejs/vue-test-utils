// @flow

import pretty from 'pretty'
import getSelector from './get-selector'
import {
  REF_SELECTOR,
  FUNCTIONAL_OPTIONS,
  VUE_VERSION,
  DOM_SELECTOR
} from 'shared/consts'
import WrapperArray from './wrapper-array'
import ErrorWrapper from './error-wrapper'
import {
  throwError,
  getCheckedEvent,
  isPhantomJS,
  nextTick,
  warn,
  warnDeprecated
} from 'shared/util'
import { isElementVisible } from 'shared/is-visible'
import find from './find'
import createWrapper from './create-wrapper'
import { recursivelySetData } from './recursively-set-data'
import { matches } from './matches'
import createDOMEvent from './create-dom-event'
import { throwIfInstancesThrew } from './error'

export default class Wrapper implements BaseWrapper {
  +vnode: VNode | null
  +vm: Component | void
  _emitted: { [name: string]: Array<Array<any>> }
  _emittedByOrder: Array<{ name: string, args: Array<any> }>
  +element: Element
  +options: WrapperOptions
  isFunctionalComponent: boolean
  rootNode: VNode | Element
  selector: Selector | void

  constructor(
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

  /**
   * Prints warning if component is destroyed
   */
  __warnIfDestroyed() {
    if (!this.exists()) {
      warn('Operations on destroyed component are discouraged')
    }
  }

  at(): void {
    this.__warnIfDestroyed()

    throwError('at() must be called on a WrapperArray')
  }

  /**
   * Returns an Object containing all the attribute/value pairs on the element.
   */
  attributes(key?: string): { [name: string]: string } | string {
    this.__warnIfDestroyed()

    const attributes = this.element.attributes
    const attributeMap = {}
    for (let i = 0; i < attributes.length; i++) {
      const att = attributes.item(i)
      attributeMap[att.localName] = att.value
    }

    return key ? attributeMap[key] : attributeMap
  }

  /**
   * Returns an Array containing all the classes on the element
   */
  classes(className?: string): Array<string> | boolean {
    this.__warnIfDestroyed()

    const classAttribute = this.element.getAttribute('class')
    let classes = classAttribute ? classAttribute.split(' ') : []
    // Handle converting cssmodules identifiers back to the original class name
    if (this.vm && this.vm.$style) {
      const cssModuleIdentifiers = Object.keys(this.vm.$style).reduce(
        (acc, key) => {
          // $FlowIgnore
          const moduleIdent = this.vm.$style[key]
          if (moduleIdent) {
            acc[moduleIdent.split(' ')[0]] = key
          }
          return acc
        },
        {}
      )
      classes = classes.map(name => cssModuleIdentifiers[name] || name)
    }

    return className ? !!(classes.indexOf(className) > -1) : classes
  }

  /**
   * Checks if wrapper contains provided selector.
   * @deprecated
   */
  contains(rawSelector: Selector): boolean {
    warnDeprecated(
      'contains',
      'Use `wrapper.find`, `wrapper.findComponent` or `wrapper.get` instead'
    )

    this.__warnIfDestroyed()

    const selector = getSelector(rawSelector, 'contains')
    const nodes = find(this.rootNode, this.vm, selector)
    return nodes.length > 0
  }

  /**
   * Calls destroy on vm
   */
  destroy(): void {
    if (!this.vm && !this.isFunctionalComponent) {
      throwError(
        `wrapper.destroy() can only be called on a Vue instance or ` +
          `functional component.`
      )
    }

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }

    if (this.vm) {
      // $FlowIgnore
      this.vm.$destroy()
      throwIfInstancesThrew(this.vm)
    }
  }

  /**
   * Returns an object containing custom events emitted by the Wrapper vm
   */
  emitted(
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
   * @deprecated
   */
  emittedByOrder(): Array<{ name: string, args: Array<any> }> {
    warnDeprecated('emittedByOrder', 'Use `wrapper.emitted` instead')
    if (!this._emittedByOrder && !this.vm) {
      throwError(
        `wrapper.emittedByOrder() can only be called on a Vue instance`
      )
    }
    return this._emittedByOrder
  }

  /**
   * Utility to check wrapper exists.
   */
  exists(): boolean {
    if (this.vm) {
      return !!this.vm && !this.vm._isDestroyed
    }
    return true
  }

  filter() {
    throwError('filter() must be called on a WrapperArray')
  }

  /**
   * Gets first node in tree of the current wrapper that
   * matches the provided selector.
   */
  get(rawSelector: Selector): Wrapper {
    this.__warnIfDestroyed()

    const found = this.find(rawSelector)
    if (found instanceof ErrorWrapper) {
      throw new Error(`Unable to find ${rawSelector} within: ${this.html()}`)
    }
    return found
  }

  /**
   * Gets first node in tree of the current wrapper that
   * matches the provided selector.
   */
  getComponent(rawSelector: Selector): Wrapper {
    this.__warnIfDestroyed()

    const found = this.findComponent(rawSelector)
    if (found instanceof ErrorWrapper) {
      throw new Error(`Unable to get ${rawSelector} within: ${this.html()}`)
    }
    return found
  }

  /**
   * Finds first DOM node in tree of the current wrapper that
   * matches the provided selector.
   */
  find(rawSelector: Selector): Wrapper | ErrorWrapper {
    this.__warnIfDestroyed()

    const selector = getSelector(rawSelector, 'find')
    if (selector.type !== DOM_SELECTOR) {
      warnDeprecated(
        'finding components with `find` or `get`',
        'Use `findComponent` and `getComponent` instead'
      )
    }

    return this.__find(rawSelector, selector)
  }

  /**
   * Finds first component in tree of the current wrapper that
   * matches the provided selector.
   */
  findComponent(rawSelector: Selector): Wrapper | ErrorWrapper {
    this.__warnIfDestroyed()

    const selector = getSelector(rawSelector, 'findComponent')
    if (!this.vm && !this.isFunctionalComponent) {
      throwError(
        'You cannot chain findComponent off a DOM element. It can only be used on Vue Components.'
      )
    }

    if (selector.type === DOM_SELECTOR) {
      throwError(
        'findComponent requires a Vue constructor or valid find object. If you are searching for DOM nodes, use `find` instead'
      )
    }

    return this.__find(rawSelector, selector)
  }

  __find(rawSelector: Selector, selector: Object): Wrapper | ErrorWrapper {
    const node = find(this.rootNode, this.vm, selector)[0]

    if (!node) {
      return new ErrorWrapper(rawSelector)
    }

    const wrapper = createWrapper(node, this.options)
    wrapper.selector = rawSelector
    return wrapper
  }

  /**
   * Finds DOM elements in tree of the current wrapper that matches
   * the provided selector.
   */
  findAll(rawSelector: Selector): WrapperArray {
    this.__warnIfDestroyed()

    const selector = getSelector(rawSelector, 'findAll')
    if (selector.type !== DOM_SELECTOR) {
      warnDeprecated(
        'finding components with `findAll`',
        'Use `findAllComponents` instead'
      )
    }
    return this.__findAll(rawSelector, selector)
  }

  /**
   * Finds components in tree of the current wrapper that matches
   * the provided selector.
   */
  findAllComponents(rawSelector: Selector): WrapperArray {
    this.__warnIfDestroyed()

    const selector = getSelector(rawSelector, 'findAll')
    if (!this.vm) {
      throwError(
        'You cannot chain findAllComponents off a DOM element. It can only be used on Vue Components.'
      )
    }
    if (selector.type === DOM_SELECTOR) {
      throwError(
        'findAllComponents requires a Vue constructor or valid find object. If you are searching for DOM nodes, use `find` instead'
      )
    }
    return this.__findAll(rawSelector, selector)
  }

  __findAll(rawSelector: Selector, selector: Object): WrapperArray {
    const nodes = find(this.rootNode, this.vm, selector)
    const wrappers = nodes.map(node => {
      // Using CSS Selector, returns a VueWrapper instance if the root element
      // binds a Vue instance.
      const wrapper = createWrapper(node, this.options)
      wrapper.selector = rawSelector
      return wrapper
    })

    const wrapperArray = new WrapperArray(wrappers)
    wrapperArray.selector = rawSelector
    return wrapperArray
  }

  /**
   * Returns HTML of element as a string
   */
  html(): string {
    this.__warnIfDestroyed()

    return pretty(this.element.outerHTML)
  }

  /**
   * Checks if node matches selector or component definition
   */
  is(rawSelector: Selector): boolean {
    this.__warnIfDestroyed()

    const selector = getSelector(rawSelector, 'is')

    if (selector.type === DOM_SELECTOR) {
      warnDeprecated(
        'checking tag name with `is`',
        'Use `element.tagName` instead'
      )
    }

    if (selector.type === REF_SELECTOR) {
      throwError('$ref selectors can not be used with wrapper.is()')
    }

    return matches(this.rootNode, selector)
  }

  /**
   * Checks if node is empty
   * @deprecated
   */
  isEmpty(): boolean {
    warnDeprecated(
      'isEmpty',
      'Consider a custom matcher such as those provided in jest-dom: https://github.com/testing-library/jest-dom#tobeempty. ' +
        'When using with findComponent, access the DOM element with findComponent(Comp).element'
    )
    this.__warnIfDestroyed()

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
      node.children &&
        node.children.forEach(n => {
          nodes.push(n)
        })
      node = nodes[i++]
    }
    return nodes.every(n => n.isComment || n.child)
  }

  /**
   * Checks if node is visible
   */
  isVisible(): boolean {
    this.__warnIfDestroyed()

    return isElementVisible(this.element)
  }

  /**
   * Checks if wrapper is a vue instance
   * @deprecated
   */
  isVueInstance(): boolean {
    warnDeprecated(`isVueInstance`)
    this.__warnIfDestroyed()

    return !!this.vm
  }

  /**
   * Returns name of component, or tag name if node is not a Vue component
   * @deprecated
   */
  name(): string {
    warnDeprecated(`name`)
    this.__warnIfDestroyed()

    if (this.vm) {
      return (
        this.vm.$options.name ||
        // compat for Vue < 2.3
        (this.vm.$options.extendOptions && this.vm.$options.extendOptions.name)
      )
    }

    if (!this.vnode) {
      return this.element.tagName
    }

    return this.vnode.tag
  }

  /**
   * Prints a simple overview of the wrapper current state
   * with useful information for debugging
   * @deprecated
   */
  overview(): void {
    warnDeprecated(`overview`)
    this.__warnIfDestroyed()

    if (!this.vm) {
      throwError(`wrapper.overview() can only be called on a Vue instance`)
    }

    const identation = 4
    const formatJSON = (json: any, replacer: Function | null = null) =>
      JSON.stringify(json, replacer, identation).replace(/"/g, '')

    const visibility = this.isVisible() ? 'Visible' : 'Not visible'

    const html = this.html()
      ? this.html().replace(/^(?!\s*$)/gm, ' '.repeat(identation)) + '\n'
      : ''

    // $FlowIgnore
    const data = formatJSON(this.vm.$data)

    /* eslint-disable operator-linebreak */
    // $FlowIgnore
    const computed = this.vm._computedWatchers
      ? formatJSON(
          // $FlowIgnore
          ...Object.keys(this.vm._computedWatchers).map(computedKey => ({
            // $FlowIgnore
            [computedKey]: this.vm[computedKey]
          }))
        )
      : // $FlowIgnore
      this.vm.$options.computed
      ? formatJSON(
          // $FlowIgnore
          ...Object.entries(this.vm.$options.computed).map(([key, value]) => ({
            // $FlowIgnore
            [key]: value()
          }))
        )
      : '{}'
    /* eslint-enable operator-linebreak */

    const emittedJSONReplacer = (key, value) =>
      value instanceof Array
        ? value.map((calledWith, index) => {
            const callParams = calledWith.map(param =>
              typeof param === 'object'
                ? JSON.stringify(param)
                    .replace(/"/g, '')
                    .replace(/,/g, ', ')
                : param
            )

            return `${index}: [ ${callParams.join(', ')} ]`
          })
        : value

    const emitted = formatJSON(this.emitted(), emittedJSONReplacer)

    console.log(
      '\n' +
        `Wrapper (${visibility}):\n\n` +
        `Html:\n${html}\n` +
        `Data: ${data}\n\n` +
        `Computed: ${computed}\n\n` +
        `Emitted: ${emitted}\n`
    )
  }

  /**
   * Returns an Object containing the prop name/value pairs on the element
   */
  props(key?: string): { [name: string]: any } | any {
    if (this.isFunctionalComponent) {
      throwError(
        `wrapper.props() cannot be called on a mounted functional component.`
      )
    }
    if (!this.vm) {
      throwError('wrapper.props() must be called on a Vue instance')
    }
    this.__warnIfDestroyed()

    const props = {}
    const keys = this.vm && this.vm.$options._propKeys

    if (keys) {
      ;(keys || {}).forEach(key => {
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
   * @deprecated
   */
  setChecked(checked: boolean = true): Promise<*> {
    this.__warnIfDestroyed()

    if (typeof checked !== 'boolean') {
      throwError('wrapper.setChecked() must be passed a boolean')
    }
    const tagName = this.element.tagName
    // $FlowIgnore
    const type = this.attributes().type
    const event = getCheckedEvent()

    if (tagName === 'INPUT' && type === 'checkbox') {
      // $FlowIgnore
      if (this.element.checked === checked) {
        return nextTick()
      }
      if (event !== 'click' || isPhantomJS) {
        // $FlowIgnore
        this.element.checked = checked
      }
      return this.trigger(event)
    }

    if (tagName === 'INPUT' && type === 'radio') {
      if (!checked) {
        throwError(
          `wrapper.setChecked() cannot be called with parameter false on a ` +
            `<input type="radio" /> element.`
        )
      }

      // $FlowIgnore
      if (this.element.checked === checked) {
        return nextTick()
      }

      if (event !== 'click' || isPhantomJS) {
        // $FlowIgnore
        this.element.selected = true
      }
      return this.trigger(event)
    }

    throwError(`wrapper.setChecked() cannot be called on this element`)
    return nextTick()
  }

  /**
   * Selects <option></option> element
   * @deprecated
   */
  setSelected(): Promise<void> {
    this.__warnIfDestroyed()

    const tagName = this.element.tagName

    if (tagName === 'SELECT') {
      throwError(
        `wrapper.setSelected() cannot be called on select. Call it on one of ` +
          `its options`
      )
    }

    if (tagName !== 'OPTION') {
      throwError(`wrapper.setSelected() cannot be called on this element`)
    }

    // $FlowIgnore
    if (this.element.selected) {
      return nextTick()
    }

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
    return createWrapper(parentElement, this.options).trigger('change')
  }

  /**
   * Sets vm data
   */
  setData(data: Object): Promise<void> {
    if (this.isFunctionalComponent) {
      throwError(`wrapper.setData() cannot be called on a functional component`)
    }

    if (!this.vm) {
      throwError(`wrapper.setData() can only be called on a Vue instance`)
    }

    this.__warnIfDestroyed()

    recursivelySetData(this.vm, this.vm, data)
    return nextTick()
  }

  /**
   * Sets vm methods
   * @deprecated
   */
  setMethods(methods: Object): void {
    warnDeprecated(
      `setMethods`,
      `There is no clear migration path for setMethods - Vue does not support arbitrarily replacement of methods, nor should VTU. To stub a complex method extract it from the component and test it in isolation. Otherwise, the suggestion is to rethink those tests`
    )

    if (!this.vm) {
      throwError(`wrapper.setMethods() can only be called on a Vue instance`)
    }
    this.__warnIfDestroyed()

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
  setProps(data: Object): Promise<void> {
    // Validate the setProps method call
    if (this.isFunctionalComponent) {
      throwError(
        `wrapper.setProps() cannot be called on a functional component`
      )
    }

    if (!this.vm) {
      throwError(`wrapper.setProps() can only be called on a Vue instance`)
    }

    // $FlowIgnore : Problem with possibly null this.vm
    if (!this.vm.$parent.$options.$_isWrapperParent) {
      throwError(
        `wrapper.setProps() can only be called for top-level component`
      )
    }

    this.__warnIfDestroyed()

    Object.keys(data).forEach(key => {
      // Don't let people set entire objects, because reactivity won't work
      if (
        typeof data[key] === 'object' &&
        data[key] !== null &&
        // $FlowIgnore : Problem with possibly null this.vm
        data[key] === this.vm[key]
      ) {
        throwError(
          `wrapper.setProps() called with the same object of the existing ` +
            `${key} property. You must call wrapper.setProps() with a new ` +
            `object to trigger reactivity`
        )
      }

      if (
        VUE_VERSION <= 2.3 &&
        (!this.vm ||
          !this.vm.$options._propKeys ||
          !this.vm.$options._propKeys.some(prop => prop === key))
      ) {
        throwError(
          `wrapper.setProps() called with ${key} property which ` +
            `is not defined on the component`
        )
      }

      // $FlowIgnore : Problem with possibly null this.vm
      const parent = this.vm.$parent
      parent.$set(parent.vueTestUtils_childProps, key, data[key])
    })

    return nextTick()
  }

  /**
   * Sets element value and triggers input event
   */
  setValue(value: any): Promise<void> {
    const tagName = this.element.tagName
    // $FlowIgnore
    const type = this.attributes().type
    this.__warnIfDestroyed()

    if (tagName === 'OPTION') {
      throwError(
        `wrapper.setValue() cannot be called on an <option> element. Use ` +
          `wrapper.setSelected() instead`
      )
    } else if (tagName === 'INPUT' && type === 'checkbox') {
      throwError(
        `wrapper.setValue() cannot be called on a <input type="checkbox" /> ` +
          `element. Use wrapper.setChecked() instead`
      )
    } else if (tagName === 'INPUT' && type === 'radio') {
      throwError(
        `wrapper.setValue() cannot be called on a <input type="radio" /> ` +
          `element. Use wrapper.setChecked() instead`
      )
    } else if (tagName === 'SELECT') {
      if (Array.isArray(value)) {
        // $FlowIgnore
        const options = this.element.options
        for (let i = 0; i < options.length; i++) {
          const option = options[i]
          option.selected = value.indexOf(option.value) >= 0
        }
      } else {
        // $FlowIgnore
        this.element.value = value
      }

      this.trigger('change')
      return nextTick()
    } else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      // $FlowIgnore
      this.element.value = value

      this.trigger('input')

      // for v-model.lazy, we need to trigger a change event, too.
      // $FlowIgnore
      if (this.element._vModifiers && this.element._vModifiers.lazy) {
        this.trigger('change')
      }
      return nextTick()
    }
    throwError(`wrapper.setValue() cannot be called on this element`)
    return nextTick()
  }

  /**
   * Return text of wrapper element
   */
  text(): string {
    this.__warnIfDestroyed()

    return this.element.textContent.trim()
  }

  /**
   * Simulates event triggering
   */
  __simulateTrigger(type: string, options?: Object): void {
    const regularEventTrigger = (type, options) => {
      const event = createDOMEvent(type, options)
      return this.element.dispatchEvent(event)
    }

    const focusEventTrigger = (type, options) => {
      if (this.element instanceof HTMLElement) {
        return this.element.focus()
      }

      regularEventTrigger(type, options)
    }

    const triggerProcedureMap = {
      focus: focusEventTrigger,
      __default: regularEventTrigger
    }

    const triggerFn = triggerProcedureMap[type] || triggerProcedureMap.__default

    return triggerFn(type, options)
  }

  /**
   * Dispatches a DOM event on wrapper
   */
  trigger(type: string, options: Object = {}): Promise<void> {
    this.__warnIfDestroyed()

    if (typeof type !== 'string') {
      throwError('wrapper.trigger() must be passed a string')
    }

    if (options.target) {
      throwError(
        `you cannot set the target value of an event. See the notes section ` +
          `of the docs for more details—` +
          `https://vue-test-utils.vuejs.org/api/wrapper/trigger.html`
      )
    }

    /**
     * Avoids firing events on specific disabled elements
     * See more: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
     */

    const supportedTags = [
      'BUTTON',
      'COMMAND',
      'FIELDSET',
      'KEYGEN',
      'OPTGROUP',
      'OPTION',
      'SELECT',
      'TEXTAREA',
      'INPUT'
    ]
    const tagName = this.element.tagName

    if (this.attributes().disabled && supportedTags.indexOf(tagName) > -1) {
      return nextTick()
    }

    this.__simulateTrigger(type, options)
    return nextTick()
  }
}
