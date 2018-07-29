import Vue from 'vue'
import { createWrapper, Wrapper, WrapperArray } from '~vue/test-utils'
import Component from '~resources/components/component.vue'
import { describeRunIf } from 'conditional-specs'

describeRunIf(process.env.TEST_ENV !== 'node', 'mount', () => {
  it.only('exports createWrapper', () => {
    const Constructor = Vue.extend(Component)
    const vm = new Constructor().$mount()
    const wrapper = createWrapper(vm)
    expect(wrapper.is(Component)).to.equal(true)
    expect(wrapper).instanceof(Wrapper)
    expect(wrapper.findAll('div')).instanceof(WrapperArray)
  })
})
