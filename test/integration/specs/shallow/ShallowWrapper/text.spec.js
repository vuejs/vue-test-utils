import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('text', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'text() is not currently supported in shallow render'
    expect(() => wrapper.text()).to.throw(Error, message)
  })
})
