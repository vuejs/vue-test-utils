import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('update', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'update() is not currently supported in shallow render'
    expect(() => wrapper.update()).to.throw(Error, message)
  })
})
