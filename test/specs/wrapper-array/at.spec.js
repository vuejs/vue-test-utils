import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import '~vue/test-utils'

describeWithShallowAndMount('at', mountingMethod => {
  it('returns Wrapper at index', () => {
    const compiled = compileToFunctions('<div><p /><p class="index-1"/></div>')
    const p = mountingMethod(compiled)
      .findAll('p')
      .at(1)
    expect(p.vnode).to.be.an('object')
    expect(p.classes()).to.contain('index-1')
  })

  it('throws error if no item exists at index', () => {
    const index = 2
    const compiled = compileToFunctions('<div><p /><p class="index-1"/></div>')
    const message = `[vue-test-utils]: no item exists at ${index}`
    expect(() =>
      mountingMethod(compiled)
        .findAll('p')
        .at(index)
    )
      .to.throw()
      .with.property('message', message)
  })
})
