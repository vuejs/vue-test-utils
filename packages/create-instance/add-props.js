// @flow

// SetProps on object prop child changes trigger computed or watcher
// https://github.com/vuejs/vue-test-utils/issues/761
export function createProps (propsData: Object): Object {
  return Object.keys(propsData).reduce((props, key) => {
    const data = propsData[key]
    if (
      typeof data === 'object' &&
      data !== null &&
      !Array.isArray(data)
    ) {
      props[key] = Object.assign(
        Object.create(Object.getPrototypeOf(data)),
        data
      )
    } else {
      props[key] = data
    }
    return props
  }, {})
}
