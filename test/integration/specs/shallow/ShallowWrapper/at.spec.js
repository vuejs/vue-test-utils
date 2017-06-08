import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('at', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'at() is not currently supported in shallow render'
    expect(() => wrapper.at()).to.throw(Error, message)
  })
})
