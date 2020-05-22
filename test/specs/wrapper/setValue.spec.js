import ComponentWithInput from '~resources/components/component-with-input.vue'
import { describeWithShallowAndMount, isPromise } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'
import { vueVersion } from '~resources/utils'

describeWithShallowAndMount('setValue', mountingMethod => {
  it('returns a promise', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="text"]')
    const response = input.setValue('foo')
    expect(isPromise(response)).to.eql(true)
    expect(wrapper.text()).not.to.contain('foo')
    await response
    expect(wrapper.text()).to.contain('foo')
  })
  it('sets element of input value', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="text"]')
    input.setValue('foo')

    expect(input.element.value).to.equal('foo')
  })

  it('sets element of textarea value', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const textarea = wrapper.find('textarea')
    textarea.setValue('foo')

    expect(textarea.element.value).to.equal('foo')
  })

  it('updates dom with input v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find('input[type="text"]')
    await input.setValue('input text awesome binding')

    expect(wrapper.text()).to.contain('input text awesome binding')
  })

  itDoNotRunIf(
    vueVersion < 2.1,
    'updates dom with input v-model.lazy',
    async () => {
      const wrapper = mountingMethod(ComponentWithInput)
      const input = wrapper.find('input#lazy')
      await input.setValue('lazy')

      expect(wrapper.text()).to.contain('lazy')
    }
  )

  it('sets element of select value', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const select = wrapper.find('select')
    select.setValue('selectB')

    expect(select.element.value).to.equal('selectB')
  })

  it('updates dom with select v-model', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const select = wrapper.find('select')
    await select.setValue('selectB')

    expect(wrapper.text()).to.contain('selectB')
  })

  it('sets element of multiselect value', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const select = wrapper.find('select.multiselect')
    select.setValue(['selectA', 'selectC'])

    const selectedOptions = Array.from(select.element.selectedOptions).map(
      o => o.value
    )
    expect(selectedOptions).to.deep.equal(['selectA', 'selectC'])
  })

  it('overrides elements of multiselect', () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const select = wrapper.find('select.multiselect')
    select.setValue(['selectA', 'selectC'])
    select.setValue(['selectB'])

    const selectedOptions = Array.from(select.element.selectedOptions).map(
      o => o.value
    )
    expect(selectedOptions).to.deep.equal(['selectB'])
  })

  it('updates dom with multiselect v-model when array', async () => {
    const wrapper = mountingMethod(ComponentWithInput)
    const select = wrapper.find('select.multiselect')
    await select.setValue(['selectA', 'selectC'])

    expect(wrapper.text()).to.contain('["selectA","selectC"]')
  })

  it('throws error if element is option', () => {
    const message =
      'wrapper.setValue() cannot be called on an <option> element. Use wrapper.setSelected() instead'
    shouldThrowErrorOnElement('option', message)
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

  function shouldThrowErrorOnElement(selector, message) {
    const wrapper = mountingMethod(ComponentWithInput)
    const input = wrapper.find(selector)

    const fn = () => input.setValue('')
    expect(fn)
      .to.throw()
      .with.property('message', '[vue-test-utils]: ' + message)
  }
})
