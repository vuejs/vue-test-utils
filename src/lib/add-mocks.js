// @flow

export default function addMocks (mockedProperties: Object, Vue: Component) {
  Object.keys(mockedProperties).forEach((key) => {
    Vue.prototype[key] = mockedProperties[key]
  })
}
