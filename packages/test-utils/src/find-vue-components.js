// @flow
import {
  FUNCTIONAL_OPTIONS,
  VUE_VERSION
} from './consts'
import {
  throwError
} from 'shared/util'

export function findAllVueComponentsFromVm (
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
  if (vnode[FUNCTIONAL_OPTIONS] || vnode.functionalContext) {
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
  return !!((vm.$vnode && vm.$vnode.componentOptions &&
    vm.$vnode.componentOptions.Ctor.options.name === name) ||
    (vm._vnode &&
    vm._vnode.functionalOptions &&
    vm._vnode.functionalOptions.name === name) ||
    vm.$options && vm.$options.name === name ||
    vm.options && vm.options.name === name)
}

export function vmCtorMatchesSelector (component: Component, selector: Object) {
  const Ctor = selector._Ctor || (selector.options && selector.options._Ctor)
  if (!Ctor) {
    return false
  }
  const Ctors = Object.keys(Ctor)
  return Ctors.some(c => Ctor[c] === component.__proto__.constructor)
}

export function vmFunctionalCtorMatchesSelector (component: VNode, Ctor: Object) {
  if (VUE_VERSION < 2.3) {
    throwError('find for functional components is not support in Vue < 2.3')
  }

  if (!Ctor) {
    return false
  }

  if (!component[FUNCTIONAL_OPTIONS]) {
    return false
  }
  const Ctors = Object.keys(component[FUNCTIONAL_OPTIONS]._Ctor)
  return Ctors.some(c => Ctor[c] === component[FUNCTIONAL_OPTIONS]._Ctor[c])
}

export default function findVueComponents (
  root: Component,
  selectorType: ?string,
  selector: Object
): Array<Component> {
  if (selector.functional) {
    const nodes = root._vnode
      ? findAllFunctionalComponentsFromVnode(root._vnode)
      : findAllFunctionalComponentsFromVnode(root)
    return nodes.filter(node =>
      vmFunctionalCtorMatchesSelector(node, selector._Ctor) ||
      node[FUNCTIONAL_OPTIONS].name === selector.name
    )
  }
  const nameSelector = typeof selector === 'function' ? selector.options.name : selector.name
  const components = root._isVue
    ? findAllVueComponentsFromVm(root)
    : findAllVueComponentsFromVnode(root)
  return components.filter((component) => {
    if (!component.$vnode && !component.$options.extends) {
      return false
    }
    return vmCtorMatchesSelector(component, selector) || vmCtorMatchesName(component, nameSelector)
  })
}
