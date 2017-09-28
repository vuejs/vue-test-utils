export function logEvents (vm, emitted, emittedByOrder) {
  const emit = vm.$emit
  vm.$emit = (name, ...args) => {
    (emitted[name] || (emitted[name] = [])).push(args)
    emittedByOrder.push({ name, args })
    return emit.call(vm, name, ...args)
  }
}
