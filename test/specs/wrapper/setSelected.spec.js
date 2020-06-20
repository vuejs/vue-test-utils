import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setSelected', mountingMethod => {
  it('sets element selected true', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const options = wrapper.find('select').findAll('option')

    await options.at(1).setSelected()

    expect(options.at(1).element.selected).toEqual(true)
  })

  it('updates dom with select v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const options = wrapper.find('select').findAll('option')

    await options.at(1).setSelected()
    expect(wrapper.text()).to.contain('selectB')

    await options.at(0).setSelected()
    expect(wrapper.text()).to.contain('selectA')
  })

  it('updates dom with select v-model for select with optgroups', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const options = wrapper.find('select.with-optgroups').findAll('option')

    await options.at(1).setSelected()
    expect(wrapper.text()).to.contain('selectB')

    await options.at(0).setSelected()
    expect(wrapper.text()).to.contain('selectA')
  })

  it('triggers a change event on the parent select', () => {
    const change = sinon.spy()

    mountingMethod({
      template: `
        <select @change="change">
          <option />
          <option value="foo" />
        </select>
      `,
      methods: { change }
    })
      .findAll('option')
      .at(1)
      .setSelected()

    expect(change).to.have.been.called
  })

  it('does not trigger an event if called on already selected option', () => {
    const change = sinon.spy()

    mountingMethod({
      template: `
        <select @change="change">
          <option />
          <option selected value="foo" />
        </select>
      `,
      methods: { change }
    })
      .findAll('option')
      .at(1)
      .setSelected()

    expect(change).not.to.have.been.called
  })

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setSelected() cannot be called on this element'

    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('#label-el')

    const fn = () => input.setSelected('value')
    expect(fn)
      .toThrow()
      .with.property('message', '[vue-test-utils]: ' + message)
  })
})
