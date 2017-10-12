/* eslint-disable */
import { warn } from '../lib/util'

function getRealChild (vnode: ?VNode): ?VNode {
  const compOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
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

function isAsyncPlaceholder (node: VNode): boolean {
  return node.isComment && node.asyncFactory
}
const camelizeRE = /-(\w)/g
export const camelize = (str: string): string => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
}

function extractTransitionData (comp: Component): Object {
  const data = {}
  const options: ComponentOptions = comp.$options
  // props
  for (const key in options.propsData) {
    data[key] = comp[key]
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  const listeners: ?Object = options._parentListeners
  for (const key in listeners) {
    data[camelize(key)] = listeners[key]
  }
  return data
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
         '<transition-group> for lists.',
         this.$parent
       )
    }

    const mode: string = this.mode

     // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in'
     ) {
      warn(
         'invalid <transition> mode: ' + mode,
         this.$parent
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

    (child.data || (child.data = {})).transition = extractTransitionData(this)

     // mark v-show
     // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(d => d.name === 'show')) {
      child.data.show = true
    }

    return rawChild
  }
}
