import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('isEmpty', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'isEmpty() is not currently supported in shallow render'
    expect(() => wrapper.isEmpty()).to.throw(Error, message)
  })
})
