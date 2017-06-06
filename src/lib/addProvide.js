function addProvide (component, options) {
  const provide = typeof options.provide === 'function'
    ? options.provide
    : Object.assign({}, options.provide)

  delete options.provide

  const originalBeforeCreate = component.beforeCreate
  component.beforeCreate = function beforeCreate () {
    this._provided = typeof provide === 'function'
      ? provide.call(this)
      : provide

    if (originalBeforeCreate) {
      originalBeforeCreate.call(this)
    }

    component.beforeCreate = originalBeforeCreate
  }
}

export default addProvide
