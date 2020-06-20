import { describeWithShallowAndMount, isRunningJSDOM } from '~resources/utils'
import { renderToString } from '@vue/server-test-utils'

describeWithShallowAndMount('options.attachToDocument', mountingMethod => {
  it('attaches root node to document', () => {
    const TestComponent = {
      template: '<div class="attached"><input /></div>'
    }
    const wrapper = mountingMethod(TestComponent, {
      attachToDocument: true
    })
    expect(document.querySelector('.attached')).not.toEqual(null)
    expect(wrapper.options.attachedToDocument).toEqual(true)
  })
})

describe('options.attachToDocument with renderToString', () => {
  it('throws error that renderToString does not accept attachToDocument', () => {
    // renderToString can only be run in node
    if (!isRunningJSDOM) {
      return
    }
    const TestComponent = {
      template: '<div class="attached"><input /></div>'
    }
    const fn = () => renderToString(TestComponent, { attachToDocument: true })
    const message =
      '[vue-test-utils]: you cannot use attachToDocument with renderToString'
    expect(fn).toThrow({ message })
  })
})
