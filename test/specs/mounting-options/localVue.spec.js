import Vue from 'vue'
import Component from '~resources/components/component.vue'
import { describeWithShallowAndMount } from '~resources/test-utils'

describeWithShallowAndMount('options.localVue', (mountingMethod) => {
  it('mounts component using passed localVue as base Vue', () => {
    const localVue = Vue.extend()
    localVue.version = '2.3'
    const wrapper = mountingMethod(Component, { localVue: localVue, mocks: { test: true }})
    expect(wrapper.vm.test).to.equal(true)
    const freshWrapper = mountingMethod(Component)
    expect(typeof freshWrapper.vm.test).to.equal('undefined')
  })
})
