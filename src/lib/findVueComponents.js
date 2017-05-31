function findAllVueComponents (vm, components = []) {
  components.push(vm)

  vm.$children.forEach((child) => {
    findAllVueComponents(child, components)
  })

  return components
}

function vmCtorMatchesName (vm, name) {
  return vm.$vnode.componentOptions.Ctor.options.name === name
}

export default function findVueComponents (vm, componentName) {
  const components = findAllVueComponents(vm)
  return components.filter((component) => {
    if (!component.$vnode) {
      return false
    }
    return vmCtorMatchesName(component, componentName)
  })
}
