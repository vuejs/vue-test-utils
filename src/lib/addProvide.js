function addProvide (component, options) {
  const provideOption = Object.assign({}, options.provide)
  delete options.provide

  const originalBeforeCreate = component.beforeCreate
  component.beforeCreate = function beforeCreate () {
    this._provided = provideOption

    if (originalBeforeCreate) {
      originalBeforeCreate.call(this)
    }
  }
}

export default addProvide
