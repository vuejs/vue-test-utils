import mount from '../../../../src/mount'
import ComponentWithEvents from '../../../resources/components/component-with-events.vue'

describe('trigger', () => {
  it('causes click handler to fire when wrapper.trigger("click") is called on a Component', () => {
    const clickHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const button = wrapper.find('.click')
    button.trigger('click')

    expect(clickHandler.calledOnce).to.equal(true)
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown") is fired on a Component', () => {
    const keydownHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.find('.keydown').trigger('keydown')

    expect(keydownHandler.calledOnce).to.equal(true)
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown.enter") is fired on a Component', () => {
    const keydownHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.find('.keydown-enter').trigger('keydown.enter')

    expect(keydownHandler.calledOnce).to.equal(true)
  })

  it.skip('causes DOM to update after clickHandler method that changes components data is called', () => {
  })

  it('throws an error if type is not a string', () => {
    const wrapper = mount(ComponentWithEvents)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.trigger() must be passed a string'
      expect(() => wrapper.trigger(invalidSelector)).to.throw(Error, message)
    })
  })
})
