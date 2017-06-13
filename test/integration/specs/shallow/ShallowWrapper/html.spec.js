import { compileToFunctions } from 'vue-template-compiler'
import shallow from '~src/shallow'

describe('html', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'html() is not currently supported in shallow render'
    expect(() => wrapper.html()).to.throw(Error, message)
  })
})
