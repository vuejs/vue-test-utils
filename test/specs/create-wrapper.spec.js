import Vue from 'vue'
import { createWrapper, Wrapper, WrapperArray } from '~vue/test-utils'
import Component from '~resources/components/component.vue'
import { describeRunIf } from 'conditional-specs'

describeRunIf(process.env.TEST_ENV !== 'node', 'mount', () => {
  it('exports createWrapper', () => {
    const Constructor = Vue.extend(Component)
    const vm = new Constructor().$mount()
    const wrapper = createWrapper(vm)
    expect(wrapper.is(Component)).to.equal(true)
    expect(wrapper).instanceof(Wrapper)
    expect(wrapper.findAll('div')).instanceof(WrapperArray)
  })

  it('handles HTMLElement', () => {
    const wrapper = createWrapper(document.createElement('div'))
    expect(wrapper.is('div')).to.equal(true)
  })

  it('handles options', () => {
    const Constructor = Vue.extend(Component)
    const vm = new Constructor().$mount()
    const wrapper = createWrapper(vm, {
      sync: true,
      attachToDocument: true
    })
    expect(wrapper.attachToDocument).to.equal(true)
    expect(wrapper.sync).to.equal(true)
  })
})
