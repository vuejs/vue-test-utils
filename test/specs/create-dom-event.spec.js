import createDOMEvent from '../../packages/test-utils/src/create-dom-event'
import { isRunningChrome } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describe('createDOMEvent', () => {
  itDoNotRunIf(isRunningChrome, 'returns cancelable event', () => {
    const event = createDOMEvent('click', {})
    expect(event.bubbles).toEqual(true)
    expect(event.cancelable).toEqual(true)
  })
})
