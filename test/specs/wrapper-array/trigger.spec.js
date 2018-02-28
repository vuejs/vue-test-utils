import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'
import ComponentWithEvents from '~resources/components/component-with-events.vue'

describe('trigger', () => {
  it('causes click handler to fire when wrapper.trigger("click") is called on a Component', () => {
    const clickHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const buttonArr = wrapper.findAll('.click')
    buttonArr.trigger('click')

    expect(clickHandler.calledOnce).to.equal(true)
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown") is fired on a Component', () => {
    const keydownHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.findAll('.keydown').trigger('keydown')

    expect(keydownHandler.calledOnce).to.equal(true)
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown.enter") is fired on a Component', () => {
    const keydownHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.findAll('.keydown-enter').trigger('keydown.enter')

    expect(keydownHandler.calledOnce).to.equal(true)
  })

  it('causes DOM to update after clickHandler method that changes components data is called', () => {
    const wrapper = mount(ComponentWithEvents)
    const toggleArr = wrapper.findAll('.toggle')
    expect(toggleArr.hasClass('active')).to.equal(false)
    toggleArr.trigger('click')
    expect(toggleArr.hasClass('active')).to.equal(true)
  })

  it('throws an error if type is not a string', () => {
    const wrapper = mount(ComponentWithEvents)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.trigger() must be passed a string'
      const fn = () => wrapper.trigger(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: trigger cannot be called on 0 items'
    const fn = () => mount(compiled).findAll('p').trigger('p')
    expect(fn).to.throw().with.property('message', message)
  })
})
