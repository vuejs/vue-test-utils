import { createLocalVue, mount } from '~vue/test-utils'
import VeeValidate from 'vee-validate'
import Vue from 'vue'

const localVue = createLocalVue()

describe('external libraries', () => {
  it('works with vee validate', () => {
    const TestComponent = {
      template: '<div />'
    }
    const localVue = createLocalVue()
    localVue.use(VeeValidate)
    const wrapper = mount(TestComponent, {
      localVue
    })
    wrapper.vm.errors.collect('text')
  })
})
