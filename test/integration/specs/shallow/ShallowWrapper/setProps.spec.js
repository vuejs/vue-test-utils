import { compileToFunctions } from 'vue-template-compiler'
import shallow from '~src/shallow'

describe('setProps', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const message = 'setProps() is not currently supported in shallow render'
    expect(() => wrapper.setProps()).to.throw(Error, message)
  })
})
