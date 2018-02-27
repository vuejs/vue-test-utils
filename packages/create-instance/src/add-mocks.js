// @flow
import $$Vue from 'vue'
import { warn } from 'shared/util'

export default function addMocks (mockedProperties: Object, Vue: Component) {
  Object.keys(mockedProperties).forEach((key) => {
    try {
      Vue.prototype[key] = mockedProperties[key]
    } catch (e) {
      warn(`could not overwrite property ${key}, this usually caused by a plugin that has added the property as a read-only value`)
    }
    $$Vue.util.defineReactive(Vue, key, mockedProperties[key])
  })
}
