import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('ErrorWrapper', (mountingMethod) => {
  const methods = ['at', 'attributes', 'classes', 'contains', 'emitted', 'emittedByOrder', 'hasAttribute',
    'hasClass', 'hasProp', 'hasStyle', 'find', 'findAll', 'filter', 'html', 'text', 'is', 'isEmpty', 'isVisible', 'isVueInstance',
    'name', 'props', 'setComputed', 'setMethods', 'setData', 'setProps', 'trigger', 'destroy']
  methods.forEach((method) => {
    it(`${method} throws error when called`, () => {
      const compiled = compileToFunctions('<p />')
      const selector = 'div'
      const message = `[vue-test-utils]: find did not return ${selector}, cannot call ${method}() on empty Wrapper`
      const wrapper = mountingMethod(compiled)
      const error = wrapper.find(selector)
      expect(error.constructor.name).to.equal('ErrorWrapper')
      expect(() => error[method]()).to.throw().with.property('message', message)
    })
  })
})
