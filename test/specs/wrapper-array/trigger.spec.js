import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithEvents from '~resources/components/component-with-events.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('trigger', mountingMethod => {
  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.reset()
    sandbox.restore()
  })

  it('causes click handler to fire when wrapper.trigger("click") is called on a Component', () => {
    const clickHandler = jest.fn()()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const buttonArr = wrapper.findAll('.click')
    buttonArr.trigger('click')

    expect(clickHandler.calledOnce).toEqual(true)
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown") is fired on a Component', () => {
    const keydownHandler = jest.fn()()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.findAll('.keydown').trigger('keydown')

    expect(keydownHandler.calledOnce).toEqual(true)
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown.enter") is fired on a Component', () => {
    const keydownHandler = jest.fn()()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.findAll('.keydown-enter').trigger('keydown.enter')

    expect(keydownHandler.calledOnce).toEqual(true)
  })

  it('throws an error if type is not a string', () => {
    const wrapper = mountingMethod(ComponentWithEvents)
    const invalidSelectors = [
      undefined,
      null,
      NaN,
      0,
      2,
      true,
      false,
      () => {},
      {},
      []
    ]
    invalidSelectors.forEach(invalidSelector => {
      const message =
        '[vue-test-utils]: wrapper.trigger() must be passed a string'
      const fn = () => wrapper.trigger(invalidSelector)
      expect(fn).toThrow(message)
    })
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: trigger cannot be called on 0 items'
    const fn = () =>
      mountingMethod(compiled)
        .findAll('p')
        .trigger('p')
    expect(fn).toThrow(message)
  })
})
