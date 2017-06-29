// @flow

export default function addGlobals (globals: Object) {
  return {
    install: function (Vue: Object) {
      Object.keys(globals).forEach(function (key) {
        Vue.prototype[key] = globals[key]
      })
    }
  }
}
