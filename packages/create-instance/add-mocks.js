// @flow
import $$Vue from 'vue'
import { warn, keys } from 'shared/util'

export default function addMocks(
  _Vue: Component,
  mockedProperties: Object | false = {}
): void {
  if (mockedProperties === false) {
    return
  }
  keys(mockedProperties).forEach(key => {
    try {
      // $FlowIgnore
      _Vue.prototype[key] = mockedProperties[key]
    } catch (e) {
      warn(
        `could not overwrite property ${key}, this is ` +
          `usually caused by a plugin that has added ` +
          `the property as a read-only value`
      )
    }
    // $FlowIgnore
    $$Vue.util.defineReactive(_Vue, key, mockedProperties[key])
  })
}
