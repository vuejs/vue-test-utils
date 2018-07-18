import { describeWithShallowAndMount } from '~resources/utils'
import { itSkipIf } from 'conditional-specs'

describeWithShallowAndMount('Wrapper', mountingMethod => {
  ['vnode', 'element', 'vm', 'options'].forEach(property => {
    it(`has the ${property} property which is read-only`, () => {
      const wrapper = mountingMethod({ template: '<div><p></p></div>' })
        .find('p')
      expect(wrapper.constructor.name).to.equal('Wrapper')
      const message = `[vue-test-utils]: wrapper.${property} is read-only`
      expect(() => { wrapper[property] = 'foo' })
        .to.throw()
        .with.property('message', message)
    })
  })

  itSkipIf(
    mountingMethod.name === 'renderToString',
    'throws error if passed string in default slot array when vue-template-compiler is undefined',
    () => {
      const compilerSave =
        require.cache[require.resolve('vue-template-compiler')].exports
          .compileToFunctions
      require.cache[require.resolve('vue-template-compiler')].exports = {
        compileToFunctions: undefined
      }
      delete require.cache[require.resolve('../../packages/test-utils')]
      const mountingMethodFresh = require('../../packages/test-utils')[
        mountingMethod.name
      ]
      const message =
        '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined'
      const fn = () => {
        mountingMethodFresh({
          template: '<div />'
        })
      }
      try {
        expect(fn)
          .to.throw()
          .with.property('message', message)
      } catch (err) {
        require.cache[
          require.resolve('vue-template-compiler')
        ].exports.compileToFunctions = compilerSave
        throw err
      }
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = compilerSave
    }
  )
})
