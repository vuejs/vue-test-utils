export default function addAttrs (vm, attrs) {
  const consoleWarnSave = console.error
  console.error = () => {}
  if (attrs) {
    vm.$attrs = attrs
  } else {
    vm.$attrs = {}
  }
  console.error = consoleWarnSave
}
