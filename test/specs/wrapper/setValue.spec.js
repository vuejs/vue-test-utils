import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setValue', mountingMethod => {
  it('sets element value', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="text"]')
    input.setValue('foo')

    expect(input.element.value).to.equal('foo')
  })

  it('updates dom with v-model', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="text"]')

    input.setValue('input text awesome binding')

    expect(wrapper.text()).to.contain('input text awesome binding')
  })

  it('throws error if wrapper does not contain element', () => {
    const wrapper = mountingMethod({ render: h => h('div') })
    const div = wrapper.find('div')
    div.element = null
    const fn = () => div.setValue('')
    const message =
      '[vue-test-utils]: cannot call wrapper.setValue() on a wrapper without an element'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if element is select', () => {
    const message =
      'wrapper.setValue() cannot be called on a <select> element. Use wrapper.setSelected() instead'
    shouldThrowErrorOnElement('select', message)
  })

  it('throws error if element is radio', () => {
    const message =
      'wrapper.setValue() cannot be called on a <input type="radio" /> element. Use wrapper.setChecked() instead'
    shouldThrowErrorOnElement('input[type="radio"]', message)
  })

  it('throws error if element is checkbox', () => {
    const message =
      'wrapper.setValue() cannot be called on a <input type="checkbox" /> element. Use wrapper.setChecked() instead'
    shouldThrowErrorOnElement('input[type="checkbox"]', message)
  })

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setValue() cannot be called on this element'
    shouldThrowErrorOnElement('#label-el', message)
  })

  function shouldThrowErrorOnElement (selector, message) {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find(selector)

    const fn = () => input.setValue('')
    expect(fn)
      .to.throw()
      .with.property('message', '[vue-test-utils]: ' + message)
  }
})
