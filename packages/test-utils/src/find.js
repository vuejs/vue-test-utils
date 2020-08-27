// @flow

import findDOMNodes from './find-dom-nodes'
import {
  DOM_SELECTOR,
  REF_SELECTOR,
  COMPONENT_SELECTOR,
  VUE_VERSION
} from 'shared/consts'
import { throwError } from 'shared/util'
import { matches } from './matches'

/**
 * Traverses a vue instance for its parents and returns them in an array format
 * @param {Component} vm
 * @returns {Component[]} The component and its corresponding parents, in order from left to right
 */
export function findAllParentInstances(childVm: any) {
  const instances = [childVm]

  function getParent(_vm) {
    if (_vm.$parent) {
      instances.push(_vm.$parent)
      return getParent(_vm.$parent)
    }
    return _vm
  }

  getParent(childVm)
  return instances
}

export function findAllInstances(rootVm: any) {
  const instances = [rootVm]
  let i = 0
  while (i < instances.length) {
    const vm = instances[i]
    ;(vm.$children || []).forEach(child => {
      instances.push(child)
    })
    i++
  }
  return instances
}

function findAllVNodes(vnode: VNode, selector: any): Array<VNode> {
  const matchingNodes = []
  const nodes = [vnode]
  while (nodes.length) {
    const node = nodes.shift()
    if (node.children) {
      const children = [...node.children].reverse()
      children.forEach(n => {
        nodes.unshift(n)
      })
    }
    if (node.child) {
      nodes.unshift(node.child._vnode)
    }
    if (matches(node, selector)) {
      matchingNodes.push(node)
    }
  }

  return matchingNodes
}

function removeDuplicateNodes(vNodes: Array<VNode>): Array<VNode> {
  const vNodeElms = vNodes.map(vNode => vNode.elm)
  return vNodes.filter((vNode, index) => index === vNodeElms.indexOf(vNode.elm))
}

export default function find(
  root: VNode | Element,
  vm?: Component,
  selector: Selector
): Array<VNode | Component> {
  if (root instanceof Element && selector.type !== DOM_SELECTOR) {
    throwError(
      `cannot find a Vue instance on a DOM node. The node ` +
        `you are calling find on does not exist in the ` +
        `VDom. Are you adding the node as innerHTML?`
    )
  }

  if (
    selector.type === COMPONENT_SELECTOR &&
    (selector.value.functional ||
      (selector.value.options && selector.value.options.functional)) &&
    VUE_VERSION < 2.3
  ) {
    throwError(
      `find for functional components is not supported ` + `in Vue < 2.3`
    )
  }

  if (root instanceof Element) {
    return findDOMNodes(root, selector.value)
  }

  if (!root && selector.type !== DOM_SELECTOR) {
    throwError(
      `cannot find a Vue instance on a DOM node. The node ` +
        `you are calling find on does not exist in the ` +
        `VDom. Are you adding the node as innerHTML?`
    )
  }

  if (!vm && selector.type === REF_SELECTOR) {
    throwError(`$ref selectors can only be used on Vue component ` + `wrappers`)
  }

  if (vm && vm.$refs && selector.value.ref in vm.$refs) {
    const refs = vm.$refs[selector.value.ref]
    return Array.isArray(refs) ? refs : [refs]
  }

  const nodes = findAllVNodes(root, selector)
  const dedupedNodes = removeDuplicateNodes(nodes)

  if (nodes.length > 0 || selector.type !== DOM_SELECTOR) {
    return dedupedNodes
  }

  // Fallback in case element exists in HTML, but not in vnode tree
  // (e.g. if innerHTML is set as a domProp)
  return findDOMNodes(root.elm, selector.value)
}
