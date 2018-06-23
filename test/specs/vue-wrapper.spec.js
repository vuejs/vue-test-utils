import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('VueWrapper', mountingMethod => {
  ['vnode', 'element', 'vm', 'options'].forEach(property => {
    it(`has the ${property} property which is read-only`, () => {
      const wrapper = mountingMethod({ template: '<div><p></p></div>' })
      expect(wrapper.constructor.name).to.equal('VueWrapper')
      const message = `[vue-test-utils]: wrapper.${property} is read-only`
      expect(() => { wrapper[property] = 'foo' })
        .to.throw()
        .with.property('message', message)
    })
  })
})
