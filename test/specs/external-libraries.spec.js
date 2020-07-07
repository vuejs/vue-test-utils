import { createLocalVue, mount } from 'packages/test-utils/src'
import VeeValidate from 'vee-validate'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('external libraries', () => {
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
