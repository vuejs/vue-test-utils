// @flow

import { warn } from 'shared/util'

function getRealChild (vnode: ?VNode): ?VNode {
  const compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function isSameChild (child: VNode, oldChild: VNode): boolean {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

function getFirstComponentChild (children: ?Array<VNode>): ?VNode {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (c && (c.componentOptions || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

function isPrimitive (value: any): boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $FlowIgnore
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

function isAsyncPlaceholder (node: VNode): boolean {
  return node.isComment && node.asyncFactory
}
const camelizeRE = /-(\w)/g
export const camelize = (str: string): string => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
}

function hasParentTransition (vnode: VNode): ?boolean {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

export default {
  render (h: Function) {
    let children: ?Array<VNode> = this.$options._renderChildren
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter((c: VNode) => c.tag || isAsyncPlaceholder(c))
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
         '<transition-group> for lists.'
      )
    }

    const mode: string = this.mode

    // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode
      )
    }

    const rawChild: VNode = children[0]

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    const child: ?VNode = getRealChild(rawChild)

    if (!child) {
      return rawChild
    }

    const id: string = `__transition-${this._uid}-`
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key

    const data: Object = (child.data || (child.data = {}))
    const oldRawChild: ?VNode = this._vnode
    const oldChild: ?VNode = getRealChild(oldRawChild)
    if (child.data.directives && child.data.directives.some(d => d.name === 'show')) {
      child.data.show = true
    }

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(d => d.name === 'show')) {
      child.data.show = true
    }
    if (
      oldChild &&
         oldChild.data &&
         !isSameChild(child, oldChild) &&
         !isAsyncPlaceholder(oldChild) &&
         // #6687 component root is a comment node
         !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      oldChild.data = { ...data }
    }
    return rawChild
  }
}
