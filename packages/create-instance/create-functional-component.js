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

  const context =
    mountingOptions.context ||
    component.FunctionalRenderContext ||
    {}

  const listeners = mountingOptions.listeners

  if (listeners) {
    Object.keys(listeners).forEach(key => {
      context.on[key] = listeners[key]
    })
  }

  context.scopedSlots = createScopedSlots(mountingOptions.scopedSlots)

  return {
    render (h: Function) {
      return h(
        component,
        context,
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
