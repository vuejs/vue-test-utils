import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setSelected', (mountingMethod) => {
  it('sets element selected true', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const options = wrapper.find('select').findAll('option')

    options.at(1).setSelected()

    expect(options.at(1).element.selected).to.equal(true)
  })

  it('updates dom with select v-model', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const options = wrapper.find('select').findAll('option')

    options.at(1).setSelected()
    expect(wrapper.text()).to.contain('selectB')

    options.at(0).setSelected()
    expect(wrapper.text()).to.contain('selectA')
  })

  it('updates dom with select v-model for select with optgroups', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const options = wrapper.find('select.with-optgroups').findAll('option')

    options.at(1).setSelected()
    expect(wrapper.text()).to.contain('selectB')

    options.at(0).setSelected()
    expect(wrapper.text()).to.contain('selectA')
  })

  it('throws error if wrapper does not contain element', () => {
    const wrapper = mountingMethod({ render: (h) => h('div') })
    const div = wrapper.find('div')
    div.element = null

    const fn = () => div.setSelected()
    const message = '[vue-test-utils]: cannot call wrapper.setSelected() on a wrapper without an element'
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if element is radio', () => {
    const message = 'wrapper.setSelected() cannot be called on a <input type="radio" /> element. Use wrapper.setChecked() instead'
    shouldThrowErrorOnElement('input[type="radio"]', message)
  })

  it('throws error if element is radio', () => {
    const message = 'wrapper.setSelected() cannot be called on a <input type="checkbox" /> element. Use wrapper.setChecked() instead'
    shouldThrowErrorOnElement('input[type="checkbox"]', message)
  })

  it('throws error if element is text like', () => {
    const message = 'wrapper.setSelected() cannot be called on "text" inputs. Use wrapper.setValue() instead'
    shouldThrowErrorOnElement('input[type="text"]', message)
  })

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setSelected() cannot be called on this element'
    shouldThrowErrorOnElement('#label-el', message)
  })

  function shouldThrowErrorOnElement (selector, message, value) {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find(selector)

    const fn = () => input.setSelected(value)
    expect(fn).to.throw().with.property('message', '[vue-test-utils]: ' + message)
  }
})
