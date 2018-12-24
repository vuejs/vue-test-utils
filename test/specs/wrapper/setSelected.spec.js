import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount.only('setSelected', mountingMethod => {
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

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setSelected() cannot be called on this element'

    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('#label-el')

    const fn = () => input.setSelected('value')
    expect(fn)
      .to.throw()
      .with.property('message', '[vue-test-utils]: ' + message)
  })
})
