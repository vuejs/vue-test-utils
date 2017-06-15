import { compileToFunctions } from 'vue-template-compiler'
import shallow from '~src/shallow'
import VueWrapper from '~src/VueWrapper'

describe('shallow', () => {
  it('returns new VueWrapper of Vue instance if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = shallow(compiled)
    expect(wrapper).to.be.instanceOf(VueWrapper)
    expect(wrapper.vm).to.be.an('object')
  })
})
