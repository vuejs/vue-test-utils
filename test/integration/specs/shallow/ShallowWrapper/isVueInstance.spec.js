import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('isVueInstance', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'isVueInstance() is not currently supported in shallow render'
    expect(() => wrapper.isVueInstance()).to.throw(Error, message)
  })
})
