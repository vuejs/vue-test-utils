import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount, isPromise } from '~resources/utils'

describeWithShallowAndMount('setChecked', mountingMethod => {
  it('returns a promise, when resolved the component is updated', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    const response = input.setChecked()
    expect(isPromise(response)).toEqual(true)
    expect(wrapper.text()).not.toContain('checkbox checked')
    await response
    expect(wrapper.text()).toContain('checkbox checked')
  })
  it('sets element checked true with no option passed', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')
    input.setChecked()

    expect(input.element.checked).toEqual(true)
  })

  it('sets element checked equal to param passed', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    input.setChecked(true)
    expect(input.element.checked).toEqual(true)

    input.setChecked(false)
    expect(input.element.checked).toEqual(false)
  })

  it('updates dom with checkbox v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    await input.setChecked()
    expect(wrapper.text()).toContain('checkbox checked')

    await input.setChecked(false)
    expect(wrapper.text()).not.toContain('checkbox checked')
  })

  it('changes state the right amount of times with checkbox v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')

    await input.setChecked()
    await input.setChecked(false)
    await input.setChecked(false)
    await input.setChecked(true)
    await input.setChecked(false)
    await input.setChecked(false)

    expect(wrapper.find('.counter').text()).toEqual('4')
  })

  it('triggers a change event when called on a checkbox', () => {
    const listener = jest.fn()

    mountingMethod({
      // For compatibility with earlier versions of Vue that use the `click`
      // event for updating `v-model`.
      template: `
        <input
          type="checkbox"
          @change="listener"
          @click="listener"
        >
      `,
      methods: { listener }
    }).setChecked()

    expect(listener).toHaveBeenCalled()
  })

  it('does not trigger a change event if the checkbox is already checked', () => {
    const listener = jest.fn()

    mountingMethod({
      template: `
        <input
          type="checkbox"
          checked
          @change="listener"
          @click="listener"
        >
      `,
      methods: { listener }
    }).setChecked()

    expect(listener).not.toHaveBeenCalled()
  })

  it('updates dom with radio v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)

    await wrapper.find('#radioBar').setChecked()
    expect(wrapper.text()).toContain('radioBarResult')

    await wrapper.find('#radioFoo').setChecked()
    expect(wrapper.text()).toContain('radioFooResult')
  })

  it('changes state the right amount of times with radio v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const radioBar = wrapper.find('#radioBar')
    const radioFoo = wrapper.find('#radioFoo')

    await radioBar.setChecked()
    await radioBar.setChecked()
    await radioFoo.setChecked()
    await radioBar.setChecked()
    await radioBar.setChecked()
    await radioFoo.setChecked()
    await radioFoo.setChecked()
    expect(wrapper.find('.counter').text()).toEqual('4')
  })

  it('triggers a change event when called on a radio button', () => {
    const listener = jest.fn()

    mountingMethod({
      template: `
        <input
          type="radio"
          @change="listener"
          @click="listener"
        >
      `,
      methods: { listener }
    }).setChecked()

    expect(listener).toHaveBeenCalled()
  })

  it('does not trigger a change event if the radio button is already checked', () => {
    const listener = jest.fn()

    mountingMethod({
      template: `
        <input
          type="radio"
          checked
          @change="listener"
          @click="listener"
        >
      `,
      methods: { listener }
    }).setChecked()

    expect(listener).not.toHaveBeenCalled()
  })

  it('throws error if checked param is not boolean', () => {
    const message = 'wrapper.setChecked() must be passed a boolean'
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="checkbox"]')
    const fn = () => input.setChecked('asd')
    expect(fn).toThrow('[vue-test-utils]: ' + message)
  })

  it('throws error if checked param is false on radio element', () => {
    const message =
      'wrapper.setChecked() cannot be called with parameter false on a <input type="radio" /> element.'
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('#radioFoo')
    const fn = () => input.setChecked(false)
    expect(fn).toThrow('[vue-test-utils]: ' + message)
  })
})
