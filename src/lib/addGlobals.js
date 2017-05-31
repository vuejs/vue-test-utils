export default function addGlobals (globals) {
  return {
    install: function (Vue) {
      Object.keys(globals).forEach(function (key) {
        Vue.prototype[key] = globals[key]
      })
    }
  }
}
