import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('hasProp', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'hasProp() is not currently supported in shallow render'
    expect(() => wrapper.hasProp()).to.throw(Error, message)
  })
})
