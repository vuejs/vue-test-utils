import { addHook } from './add-hook'

// This is used to extend component constructors
// used directly in a render function
// see github.com/vuejs/vue-test-utils/issues/995
export function patchRender (_Vue) {
  addHook(_Vue.options, 'beforeCreate', function () {
    const createElementSave = this.$createElement
    this.$createElement = function (el, ...args) {
      if (
        typeof el === 'function' &&
          el.super !== _Vue &&
          !el.options.$_vueTestUtils_original
      ) {
        el = _Vue.extend(el.options)
      }
      return createElementSave(el, ...args)
    }
  })
}
