import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setValue', (mountingMethod) => {
  it('sets element value', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input')
    input.setValue('foo')

    expect(input.element.value).to.equal('foo')
  })

  it('calls trigger with input', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input')
    sinon.spy(input, 'trigger')

    input.setValue('foo')

    expect(input.trigger.called).to.equal(true)
    expect(input.trigger.calledWith('input')).to.equal(true)
  })
})
