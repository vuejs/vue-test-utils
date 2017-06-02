export default class WrapperArray {
  constructor (wrappers) {
    this.wrappers = wrappers || []
    this.length = this.wrappers.length
  }

  at (index) {
    return this.wrappers[index]
  }

  contains (selector) {
    return this.wrappers.every(wrapper => wrapper.contains(selector))
  }

  hasAttribute (attribute, value) {
    return this.wrappers.every(wrapper => wrapper.hasAttribute(attribute, value))
  }

  hasClass (className) {
    return this.wrappers.every(wrapper => wrapper.hasClass(className))
  }

  hasProp (prop, value) {
    return this.wrappers.every(wrapper => wrapper.hasProp(prop, value))
  }

  hasStyle (style, value) {
    return this.wrappers.every(wrapper => wrapper.hasStyle(style, value))
  }

  find (selector) {
    if (this.wrappers.length === 0) {
      throw new Error('find cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('find must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].find(selector)
  }

  html () {
    if (this.wrappers.length === 0) {
      throw new Error('html cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('html must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].html()
  }

  is (selector) {
    return this.wrappers.every(wrapper => wrapper.is(selector))
  }

  isEmpty () {
    return this.wrappers.every(wrapper => wrapper.isEmpty())
  }

  isVueInstance () {
    return this.wrappers.every(wrapper => wrapper.isVueInstance())
  }

  name () {
    if (this.wrappers.length === 0) {
      throw new Error('name cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('name must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].name()
  }

  text () {
    if (this.wrappers.length === 0) {
      throw new Error('text cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('text must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].text()
  }

  setData (data) {
    this.wrappers.forEach(wrapper => wrapper.setData(data))
  }

  setProps (props) {
    this.wrappers.forEach(wrapper => wrapper.setProps(props))
  }

  trigger (event) {
    this.wrappers.forEach(wrapper => wrapper.trigger(event))
  }
}
