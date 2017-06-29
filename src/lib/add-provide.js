function addProvide (component, options) {
  const provide = typeof options.provide === 'function'
    ? options.provide
    : Object.assign({}, options.provide)

  delete options.provide

  options.beforeCreate = function vueTestUtilBeforeCreate () {
    this._provided = typeof provide === 'function'
      ? provide.call(this)
      : provide
  }
}

export default addProvide
