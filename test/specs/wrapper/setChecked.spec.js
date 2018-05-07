import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setChecked', (mountingMethod) => {
  it('sets element checked true with no option passed', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')
    input.setChecked()

    expect(input.element.checked).to.equal(true)
  })

  it('sets element checked equal to param passed', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    input.setChecked(true)
    expect(input.element.checked).to.equal(true)

    input.setChecked(false)
    expect(input.element.checked).to.equal(false)
  })

  it('calls trigger with change event on checkbox', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')
    sinon.spy(input, 'trigger')

    input.setChecked()

    expect(input.trigger.called).to.equal(true)
    expect(input.trigger.args[0][0]).to.equal('click')
    expect(input.trigger.args[1][0]).to.equal('change')
  })

  it('calls trigger with change event on radio', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('#radioBar')
    sinon.spy(input, 'trigger')

    input.setChecked()

    expect(input.trigger.called).to.equal(true)
    expect(input.trigger.args[0][0]).to.equal('click')
    expect(input.trigger.args[1][0]).to.equal('change')
  })

  it('updates dom with checkbox v-model', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    input.setChecked()
    expect(wrapper.text()).to.contain('checkbox checked')

    input.setChecked(false)
    expect(wrapper.text()).to.not.contain('checkbox checked')
  })

  it('changes state the right amount of times with checkbox v-model', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    input.setChecked()
    input.setChecked(false)
    input.setChecked(false)
    input.setChecked(true)
    input.setChecked(false)
    input.setChecked(false)

    expect(wrapper.find('.counter').text()).to.equal('4')
  })

  it('updates dom with radio v-model', () => {
    const wrapper = mountingMethod(ComponentWithInput)

    wrapper.find('#radioBar').setChecked()
    expect(wrapper.text()).to.contain('radioBarResult')

    wrapper.find('#radioFoo').setChecked()
    expect(wrapper.text()).to.contain('radioFooResult')
  })

  it('changes state the right amount of times with checkbox v-model', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const radioBar = wrapper.find('#radioBar')
    const radioFoo = wrapper.find('#radioFoo')

    radioBar.setChecked()
    radioBar.setChecked()
    radioFoo.setChecked()
    radioBar.setChecked()
    radioBar.setChecked()
    radioFoo.setChecked()
    radioFoo.setChecked()

    expect(wrapper.find('.counter').text()).to.equal('4')
  })

  it('throws error if checked param is not boolean', () => {
    const message = 'wrapper.setChecked() must be passed a boolean'
    shouldThrowErrorOnElement('input[type="checkbox"]', message, 'asd')
  })

  it('throws error if checked param is false on radio element', () => {
    const message = 'wrapper.setChecked() cannot be called with parameter false on radio'
    shouldThrowErrorOnElement('#radioFoo', message, false)
  })

  it('throws error if wrapper does not contain element', () => {
    const wrapper = mountingMethod({ render: (h) => h('div') })
    const div = wrapper.find('div')
    div.element = null

    const fn = () => div.setChecked()
    const message = '[vue-test-utils]: cannot call wrapper.setChecked() on a wrapper without an element'
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if element is select', () => {
    const message = 'wrapper.setChecked() cannot be called on select'
    shouldThrowErrorOnElement('select', message)
  })

  it('throws error if element is text like', () => {
    const message = 'wrapper.setChecked() cannot be called on "text" inputs. Use wrapper.setValue() instead'
    shouldThrowErrorOnElement('input[type="text"]', message)
  })

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setChecked() cannot be called on this element'
    shouldThrowErrorOnElement('#label-el', message)
  })

  function shouldThrowErrorOnElement (selector, message, value) {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find(selector)

    const fn = () => input.setChecked(value)
    expect(fn).to.throw().with.property('message', '[vue-test-utils]: ' + message)
  }
})
