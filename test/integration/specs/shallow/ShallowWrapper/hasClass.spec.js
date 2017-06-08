import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('hasClass', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'hasClass() is not currently supported in shallow render'
    expect(() => wrapper.hasClass()).to.throw(Error, message)
  })
})
