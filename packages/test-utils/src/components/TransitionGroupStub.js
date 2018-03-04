// @flow

export default {
  render (h: Function) {
    const tag: string = this.tag || this.$vnode.data.tag || 'span'
    const children: Array<VNode> = this.$slots.default || []

    return h(tag, null, children)
  }
}
