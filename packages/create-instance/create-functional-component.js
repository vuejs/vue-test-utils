// @flow

import { throwError } from 'shared/util'
import { validateSlots } from './validate-slots'
import { createSlotVNodes } from './create-slot-vnodes'

export default function createFunctionalComponent (
  component: Component,
  mountingOptions: Options,
): Component {
  if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
    throwError('mount.context must be an object')
  }
  if (mountingOptions.slots) {
    validateSlots(mountingOptions.slots)
  }

  return {
    render (h: Function) {
      return h(
        component,
        mountingOptions.context || component.FunctionalRenderContext,
        (mountingOptions.context &&
          mountingOptions.context.children &&
          mountingOptions.context.children.map(
            x => (typeof x === 'function' ? x(h) : x)
          )) ||
          createSlotVNodes(h, mountingOptions.slots || {}, this)
      )
    },
    name: component.name,
    _isFunctionalContainer: true
  }
}
