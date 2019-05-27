import { describeWithShallowAndMount } from '~resources/utils'
import { Wrapper, enableAutoDestroy } from '~vue/test-utils'

describeWithShallowAndMount('Wrapper', mountingMethod => {
  ;['vnode', 'element', 'vm', 'options'].forEach(property => {
    it(`has the ${property} property which is read-only`, () => {
      const wrapper = mountingMethod({ template: '<div><p></p></div>' }).find(
        'p'
      )
      expect(wrapper.constructor.name).to.equal('Wrapper')
      const message = `[vue-test-utils]: wrapper.${property} is read-only`
      expect(() => {
        wrapper[property] = 'foo'
      })
        .to.throw()
        .with.property('message', message)
    })
  })

  describe('enableAutoDestroy', () => {
    const sandbox = sinon.createSandbox()

    beforeEach(() => {
      Wrapper._instances = undefined
    })

    it('calls the hook function', () => {
      const hookSpy = sandbox.spy()

      enableAutoDestroy(hookSpy)

      expect(hookSpy).calledOnce
    })

    it('uses the hook function to destroy wrappers', () => {
      let hookCallback
      enableAutoDestroy(callback => {
        hookCallback = callback
      })
      const wrapper = mountingMethod({ template: '<p>con tent</p>' })
      sandbox.spy(wrapper, 'destroy')

      hookCallback()

      expect(wrapper.destroy).calledOnce
    })

    it('cannot be called twice', () => {
      const noop = () => {}

      enableAutoDestroy(noop)

      expect(() => enableAutoDestroy(noop)).to.throw()
    })
  })
})
