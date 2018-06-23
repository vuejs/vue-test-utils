import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('Wrapper', mountingMethod => {
  ['vnode', 'element', 'vm', 'options'].forEach(property => {
    it(`has the ${property} property which is read-only`, () => {
      const wrapper = mountingMethod({ template: '<div><p></p></div>' })
        .find('p')
      expect(wrapper.constructor.name).to.equal('Wrapper')
      const message = `[vue-test-utils]: Wrapper.${property} is read-only`
      expect(() => { wrapper[property] = 'foo' })
        .to.throw()
        .with.property('message', message)
    })
  })
})
