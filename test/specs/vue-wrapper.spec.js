import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('VueWrapper', mountingMethod => {
  ;['vnode', 'element', 'vm', 'options'].forEach(property => {
    it(`has the ${property} property which is read-only`, () => {
      const wrapper = mountingMethod({ template: '<div><p></p></div>' })
      expect(wrapper.constructor.name).to.equal('VueWrapper')
      const message = `[vue-test-utils]: wrapper.${property} is read-only`
      expect(() => {
        wrapper[property] = 'foo'
      })
        .to.throw()
        .with.property('message', message)
    })
  })

  describe('debug function', () => {
    const sandbox = sinon.createSandbox()

    beforeEach(() => {
      sandbox.spy(console, 'log')
    })

    it('writes to the console formated html content of the vue-wrapper', () => {
      const basicComponent = { template: '<div><p>Debug me please</p></div>' }
      const wrapper = mountingMethod(basicComponent)

      wrapper.debug()

      expect(console.log).to.have.been.calledWith('Wrapper:')
      expect(console.log).to.have.been.calledWith(
        '<div>\n' + '  <p>Debug me please</p>\n' + '</div>\n'
      )
    })

    afterEach(() => {
      sandbox.restore()
    })
  })
})
