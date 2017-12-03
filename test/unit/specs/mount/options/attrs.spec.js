import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import { attrsSupported } from '~resources/test-utils'

describe('mount.attrs', () => {
  it('handles inherit attrs', () => {
    if (!attrsSupported()) return
    const wrapper = mount(compileToFunctions('<p :id="anAttr" />'), {
      attrs: {
        anAttr: 'an attribute'
      }
    })
    expect(wrapper.vm.$attrs.anAttr).to.equal('an attribute')
    wrapper.update()
    expect(wrapper.vm.$attrs.anAttr).to.equal('an attribute')
  })

  it('defines attrs as empty object even when not passed', () => {
    const wrapper = mount(compileToFunctions('<p />'))
    expect(wrapper.vm.$attrs).to.deep.equal({})
  })
})
