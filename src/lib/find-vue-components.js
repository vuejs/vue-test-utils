// @flow
import {
  COMPONENT_SELECTOR
} from './consts'

function findAllVueComponentsFromVm (
  vm: Component,
  components: Array<Component> = []
): Array<Component> {
  components.push(vm)
  vm.$children.forEach((child) => {
    findAllVueComponentsFromVm(child, components)
  })

  return components
}

function findAllVueComponentsFromVnode (
  vnode: Component,
  components: Array<Component> = []
): Array<Component> {
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

function findAllFunctionalComponentsFromVnode (
  vnode: Component,
  components: Array<Component> = []
): Array<Component> {
  if (vnode.fnOptions) {
    components.push(vnode)
  }
  if (vnode.children) {
    vnode.children.forEach((child) => {
      findAllFunctionalComponentsFromVnode(child, components)
    })
  }
  return components
}

export function vmCtorMatchesName (vm: Component, name: string): boolean {
  return (vm.$vnode && vm.$vnode.componentOptions &&
    vm.$vnode.componentOptions.Ctor.options.name === name) ||
    (vm._vnode && vm._vnode.functionalOptions &&
      vm._vnode.functionalOptions.name === name) ||
        vm.$options && vm.$options.name === name
}

export function vmCtorMatchesSelector (component: Component, Ctor: Object) {
  const Ctors = Object.keys(Ctor)
  return Ctors.some(c => Ctor[c] === component.__proto__.constructor)
}

export function vmFunctionalCtorMatchesSelector (component: VNode, Ctor: Object) {
  const Ctors = Object.keys(component.fnOptions._Ctor)
  return Ctors.some(c => Ctor[c] === component.fnOptions._Ctor[c])
}

export default function findVueComponents (
  root: Component,
  selectorType: ?string,
  selector: Object
): Array<Component> {
  if (selector.functional) {
    const components = root._vnode
    ? findAllFunctionalComponentsFromVnode(root._vnode)
    : findAllFunctionalComponentsFromVnode(root)
    return components.filter(component => vmFunctionalCtorMatchesSelector(component, selector._Ctor))
  }
  const components = root._isVue
    ? findAllVueComponentsFromVm(root)
    : findAllVueComponentsFromVnode(root)
  return components.filter((component) => {
    if (!component.$vnode && !component.$options.extends) {
      return false
    }
    return selectorType === COMPONENT_SELECTOR
      ? vmCtorMatchesSelector(component, selector._Ctor)
      : vmCtorMatchesName(component, selector.name)
  })
}
