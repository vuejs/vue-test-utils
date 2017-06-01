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

  find (selector) {
    if (this.wrappers.length === 0) {
      throw new Error('find cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('find cannot be called on more than 1 item, use at(i) to access the item')
    }

    return this.wrappers[0].find(selector)
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
