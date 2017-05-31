import { compileToFunctions } from 'vue-template-compiler'
import { isVueComponent } from '../../../../src/lib/validators'
import Component from '../../../resources/components/component.vue'
import ComponentWithoutName from '../../../resources/components/component-without-name.vue'

describe('isVueComponent', () => {
  it('returns true using a named .vue file', () => {
    expect(isVueComponent(Component)).to.equal(true)
  })

  it('returns true using an unnamed .vue file', () => {
    expect(isVueComponent(ComponentWithoutName)).to.equal(true)
  })

  it('returns true using a compiled vue template', () => {
    const Compiled = compileToFunctions('<div><p></p><p></p></div>')
    expect(isVueComponent(Compiled)).to.equal(true)
  })
})
