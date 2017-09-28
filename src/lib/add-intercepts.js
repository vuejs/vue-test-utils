// @flow

export default function addIntercepts (interceptedProperties: Object, Vue: Component) {
  Object.keys(interceptedProperties).forEach((key) => {
    Vue.prototype[key] = interceptedProperties[key]
  })
}
