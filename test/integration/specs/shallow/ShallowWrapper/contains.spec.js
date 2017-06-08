import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('contains', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'contains() is not currently supported in shallow render'
    expect(() => wrapper.contains()).to.throw(Error, message)
  })
})
