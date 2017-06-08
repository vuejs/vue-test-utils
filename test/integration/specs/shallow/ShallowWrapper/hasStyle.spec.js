import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('hasStyle', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'hasStyle() is not currently supported in shallow render'
    expect(() => wrapper.hasStyle()).to.throw(Error, message)
  })
})
