import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('setData', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'setData() is not currently supported in shallow render'
    expect(() => wrapper.setData()).to.throw(Error, message)
  })
})
