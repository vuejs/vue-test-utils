import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

function attrsNotSupported () {
  const version = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[0]}`)
  return version <= 2.3
}

it('handles inherit attrs', () => {
  if (attrsNotSupported) return
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
