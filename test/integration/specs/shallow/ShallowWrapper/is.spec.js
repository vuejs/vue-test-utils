import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('is', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'is() is not currently supported in shallow render'
    expect(() => wrapper.is()).to.throw(Error, message)
  })
})
