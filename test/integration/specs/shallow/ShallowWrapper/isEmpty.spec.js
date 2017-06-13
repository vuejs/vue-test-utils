import { compileToFunctions } from 'vue-template-compiler'
import shallow from '~src/shallow'

describe('isEmpty', () => {
  it('returns true if node is empty', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = shallow(compiled)

    expect(wrapper.isEmpty()).to.equal(true)
  })

  it('returns false if node contains other nodes', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = shallow(compiled)

    expect(wrapper.isEmpty()).to.equal(false)
  })
})
