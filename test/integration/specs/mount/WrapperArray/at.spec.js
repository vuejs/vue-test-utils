import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import Wrapper from '~src/wrappers/wrapper'

describe('at', () => {
  it('returns Wrapper at index', () => {
    const compiled = compileToFunctions('<div><p /><p class="index-1"/></div>')
    const p = mount(compiled).findAll('p').at(1)
    expect(p).to.be.instanceOf(Wrapper)
    expect(p.hasClass('index-1')).to.equal(true)
  })

  it('throws error if no item exists at index', () => {
    const index = 2
    const compiled = compileToFunctions('<div><p /><p class="index-1"/></div>')
    const message = `no item exists at ${index}`
    expect(() => mount(compiled).findAll('p').at(index)).to.throw(Error, message)
  })
})
