import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount } from '~resources/utils'
import Vue from 'vue'

describeWithShallowAndMount('setChecked', mountingMethod => {
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

  it('updates dom with checkbox v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    input.setChecked()
    await Vue.nextTick()
    expect(wrapper.text()).to.contain('checkbox checked')

    input.setChecked(false)
    await Vue.nextTick()
    expect(wrapper.text()).to.not.contain('checkbox checked')
  })

  it('changes state the right amount of times with checkbox v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    input.setChecked()
    await Vue.nextTick()
    input.setChecked(false)
    await Vue.nextTick()
    input.setChecked(false)
    await Vue.nextTick()
    input.setChecked(true)
    await Vue.nextTick()
    input.setChecked(false)
    await Vue.nextTick()
    input.setChecked(false)
    await Vue.nextTick()

    expect(wrapper.find('.counter').text()).to.equal('4')
  })

  it('should trigger a change event when called on a checkbox', () => {
    const listeners = { change: sinon.spy() }
    const input = mountingMethod({
      template: `<input type="checkbox" v-on="$listeners">`,
    }, { listeners })

    input.setChecked()

    expect(listeners.change).to.have.been.called
  });

  it('should not trigger a change event if the checkbox is already checked', () => {
    const listeners = { change: sinon.spy() }
    const input = mountingMethod({
      template: `<input type="checkbox" checked v-on="$listeners">`,
    }, { listeners })

    input.setChecked()

    expect(listeners.change).not.to.have.been.called
  });

  it('updates dom with radio v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)

    wrapper.find('#radioBar').setChecked()
    await Vue.nextTick()
    expect(wrapper.text()).to.contain('radioBarResult')

    wrapper.find('#radioFoo').setChecked()
    await Vue.nextTick()
    expect(wrapper.text()).to.contain('radioFooResult')
  })

  it('changes state the right amount of times with radio v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const radioBar = wrapper.find('#radioBar')
    const radioFoo = wrapper.find('#radioFoo')

    radioBar.setChecked()
    await Vue.nextTick()
    radioBar.setChecked()
    await Vue.nextTick()
    radioFoo.setChecked()
    await Vue.nextTick()
    radioBar.setChecked()
    await Vue.nextTick()
    radioBar.setChecked()
    await Vue.nextTick()
    radioFoo.setChecked()
    await Vue.nextTick()
    radioFoo.setChecked()
    await Vue.nextTick()
    expect(wrapper.find('.counter').text()).to.equal('4')
  })

  it('throws error if checked param is not boolean', () => {
    const message = 'wrapper.setChecked() must be passed a boolean'
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')
    const fn = () => input.setChecked('asd')
    expect(fn)
      .to.throw()
      .with.property('message', '[vue-test-utils]: ' + message)
  })

  it('throws error if checked param is false on radio element', () => {
    const message =
      'wrapper.setChecked() cannot be called with parameter false on a <input type="radio" /> element.'
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('#radioFoo')
    const fn = () => input.setChecked(false)
    expect(fn)
      .to.throw()
      .with.property('message', '[vue-test-utils]: ' + message)
  })
})
