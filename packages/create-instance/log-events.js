// @flow

export function logEvents (vm: Component, emitted: Object, emittedByOrder: Array<any>) {
  const emit = vm.$emit
  vm.$emit = (name, ...args) => {
    (emitted[name] || (emitted[name] = [])).push(args)
    emittedByOrder.push({ name, args })
    return emit.call(vm, name, ...args)
  }
}

export function addEventLogger (vue: Component) {
  vue.mixin({
    beforeCreate: function () {
      this.__emitted = Object.create(null)
      this.__emittedByOrder = []
      logEvents(this, this.__emitted, this.__emittedByOrder)
    }
  })
}
