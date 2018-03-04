// @flow
const toTypes: Array<Function> = [String, Object]
const eventTypes: Array<Function> = [String, Array]

export default {
  name: 'RouterLinkStub',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render (h: Function) {
    return h(this.tag, undefined, this.$slots.default)
  }
}
