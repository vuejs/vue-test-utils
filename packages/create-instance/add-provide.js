function addProvide (component, optionProvide, options) {
  const provide = typeof optionProvide === 'function'
    ? optionProvide
    : Object.assign({}, optionProvide)

  options.beforeCreate = function vueTestUtilBeforeCreate () {
    this._provided = typeof provide === 'function'
      ? provide.call(this)
      : provide
  }
}

export default addProvide
