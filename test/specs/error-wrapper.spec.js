import { mount } from '~vue/test-utils'
import { compileToFunctions } from 'vue-template-compiler'

describe('ErrorWrapper', () => {
  const methods = ['at', 'attributes', 'classes', 'contains', 'emitted', 'emittedByOrder', 'hasAttribute',
    'hasClass', 'hasProp', 'hasStyle', 'find', 'findAll', 'filter', 'html', 'text', 'is', 'isEmpty', 'isVueInstance',
    'name', 'props', 'setComputed', 'setMethods', 'setData', 'setProps', 'trigger', 'update', 'destroy']
  methods.forEach((method) => {
    it(`${method} throws error when called`, () => {
      const compiled = compileToFunctions('<p />')
      const selector = 'div'
      const message = `[vue-test-utils]: find did not return ${selector}, cannot call ${method}() on empty Wrapper`
      const wrapper = mount(compiled)
      const error = wrapper.find(selector)
      expect(error.constructor.name).to.equal('ErrorWrapper')
      expect(() => error[method]()).to.throw().with.property('message', message)
    })
  })
})
