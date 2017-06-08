import { compileToFunctions } from 'vue-template-compiler'
import shallow from '../../../../../src/shallow'

describe('find', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'find() is not currently supported in shallow render'
    expect(() => wrapper.find()).to.throw(Error, message)
  })
})
