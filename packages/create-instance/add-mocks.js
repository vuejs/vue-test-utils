// @flow
import $$Vue from 'vue'
import { warn } from 'shared/util'

export default function addMocks (
  mockedProperties: Object | false = {},
  Vue: Component
): void {
  if (mockedProperties === false) {
    return
  }
  Object.keys(mockedProperties).forEach(key => {
    try {
      // $FlowIgnore
      Vue.prototype[key] = mockedProperties[key]
    } catch (e) {
      warn(
        `could not overwrite property ${key}, this is ` +
        `usually caused by a plugin that has added ` +
        `the property as a read-only value`
      )
    }
    // $FlowIgnore
    $$Vue.util.defineReactive(Vue, key, mockedProperties[key])
  })
}
