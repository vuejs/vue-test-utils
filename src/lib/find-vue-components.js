// @flow

function findAllVueComponentsFromVm (vm: Component, components: Array<Component> = []): Array<Component> {
  components.push(vm)
  vm.$children.forEach((child) => {
    findAllVueComponentsFromVm(child, components)
  })

  return components
}

function findAllVueComponentsFromVnode (vnode: Component, components: Array<Component> = []): Array<Component> {
  debugger
  if (vnode.child) {
    components.push(vnode.child)
  }
  if (vnode.children) {
    vnode.children.forEach((child) => {
      findAllVueComponentsFromVnode(child, components)
    })
  }

  return components
}

export function vmCtorMatchesName (vm: Component, name: string): boolean {
  return (vm.$vnode && vm.$vnode.componentOptions && vm.$vnode.componentOptions.Ctor.options.name === name) ||
        (vm._vnode && vm._vnode.functionalOptions && vm._vnode.functionalOptions.name === name) ||
        vm.$options && vm.$options.name === name
}

export default function findVueComponents (root: Component, componentName: string): Array<Component> {
  debugger
  const components = root._isVue ? findAllVueComponentsFromVm(root) : findAllVueComponentsFromVnode(root)
  return components.filter((component) => {
    if (!component.$vnode) {
      return false
    }
    return vmCtorMatchesName(component, componentName)
  })
}
