// @flow

import { throwError } from 'shared/util'
import { validateSlots } from './validate-slots'
import { createSlotVNodes } from './create-slot-vnodes'
import createScopedSlots from './create-scoped-slots'

export default function createFunctionalComponent (
  component: Component,
  mountingOptions: Options
): Component {
  if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
    throwError('mount.context must be an object')
  }
  if (mountingOptions.slots) {
    validateSlots(mountingOptions.slots)
  }

  const data = mountingOptions.context ||
    component.FunctionalRenderContext || {}
  data.scopedSlots = createScopedSlots(mountingOptions.scopedSlots)

  return {
    doNotStubRender: true,
    render (h: Function) {
      return h(
        component,
        data,
        (mountingOptions.context &&
          mountingOptions.context.children &&
          mountingOptions.context.children.map(
            x => (typeof x === 'function' ? x(h) : x)
          )) ||
          createSlotVNodes(this, mountingOptions.slots || {})
      )
    },
    name: component.name,
    _isFunctionalContainer: true
  }
}
