import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('hasAttribute', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'hasAttribute() is not currently supported in shallow render'
    expect(() => wrapper.hasAttribute()).to.throw(Error, message)
  })
})
