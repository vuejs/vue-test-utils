import { BEFORE_RENDER_LIFECYCLE_HOOK } from 'shared/consts'

export function addStubs (_Vue, stubComponents) {
  function addStubComponentsMixin () {
    Object.assign(this.$options.components, stubComponents)
  }

  _Vue.mixin({
    [BEFORE_RENDER_LIFECYCLE_HOOK]: addStubComponentsMixin
  })
}
