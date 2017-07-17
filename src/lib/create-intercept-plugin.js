// @flow

export default function createInterceptPlugin (interceptedProperties: Object) {
  return {
    install: function (Vue: Object) {
      Object.keys(interceptedProperties).forEach((key) => {
        Vue.prototype[key] = interceptedProperties[key]
      })
    }
  }
}
