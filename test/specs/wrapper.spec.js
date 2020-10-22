import { describeWithShallowAndMount } from '~resources/utils'
import {
  enableAutoDestroy,
  resetAutoDestroyState,
  createWrapper
} from 'packages/test-utils/src'

describeWithShallowAndMount('Wrapper', mountingMethod => {
  ;['vnode', 'element', 'vm', 'options'].forEach(property => {
    it(`has the ${property} property which is read-only`, () => {
      const wrapper = mountingMethod({ template: '<div><p></p></div>' }).find(
        'p'
      )
      expect(wrapper.constructor.name).toEqual('Wrapper')
      const message = `[vue-test-utils]: wrapper.${property} is read-only`
      expect(() => {
        wrapper[property] = 'foo'
      }).toThrow(message)
    })
  })

  describe('enableAutoDestroy', () => {
    beforeEach(() => {
      resetAutoDestroyState()
    })

    it('calls the hook function', () => {
      const hookSpy = jest.fn()

      enableAutoDestroy(hookSpy)

      expect(hookSpy).toHaveBeenCalled()
    })

    it('uses the hook function to destroy wrappers', () => {
      let hookCallback
      enableAutoDestroy(callback => {
        hookCallback = callback
      })
      const wrapper = mountingMethod({ template: '<p>con tent</p>' })
      jest.spyOn(wrapper, 'destroy')

      hookCallback()

      expect(wrapper.destroy).toHaveBeenCalled()
    })

    it('cannot be called twice', () => {
      const noop = () => {}

      enableAutoDestroy(noop)

      expect(() => enableAutoDestroy(noop)).toThrow()
    })

    it('does not fail when non-Vue wrappers exist', async () => {
      let hookCallback
      enableAutoDestroy(callback => {
        hookCallback = callback
      })

      createWrapper(document.createElement('div'))

      expect(hookCallback).not.toThrow()
    })
  })
})
