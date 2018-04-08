import { isFunction } from 'shared/util'

function addProvide (component, optionProvide, options) {
  const provide = isFunction(optionProvide) ? optionProvide : Object.assign({}, optionProvide)

  options.beforeCreate = function vueTestUtilBeforeCreate () {
    this._provided = isFunction(provide) ? provide.call(this) : provide
  }
}

export default addProvide
