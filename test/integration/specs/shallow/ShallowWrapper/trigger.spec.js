import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('trigger', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'trigger() is not currently supported in shallow render'
    expect(() => wrapper.trigger()).to.throw(Error, message)
  })
})
