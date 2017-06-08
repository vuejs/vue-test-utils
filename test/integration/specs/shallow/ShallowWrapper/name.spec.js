import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('name', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'name() is not currently supported in shallow render'
    expect(() => wrapper.name()).to.throw(Error, message)
  })
})
