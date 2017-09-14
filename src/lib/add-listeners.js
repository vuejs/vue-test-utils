export default function addListeners (vm, listeners) {
  const consoleWarnSave = console.error
  console.error = () => {}
  if (listeners) {
    vm.$listeners = listeners
  } else {
    vm.$listeners = {}
  }
  console.error = consoleWarnSave
}
