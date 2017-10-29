// @flow
import $$Vue from 'vue'

export default function addMocks (mockedProperties: Object, Vue: Component) {
  Object.keys(mockedProperties).forEach((key) => {
    Vue.prototype[key] = mockedProperties[key]
    $$Vue.util.defineReactive(Vue, key, mockedProperties[key])
  })
}
