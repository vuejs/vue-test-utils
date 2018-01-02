import { mount } from '~vue-test-utils'
import ComponentWithEvents from '~resources/components/component-with-events.vue'

describe('trigger', () => {
  let info

  beforeEach(() => {
    info = sinon.stub(console, 'info')
  })

  afterEach(() => {
    info.restore()
  })

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

  it('convert a registered key name to a key code', () => {
    const modifiers = {
      enter: 13,
      esc: 27,
      tab: 9,
      space: 32,
      delete: 46,
      backspace: 8,
      insert: 45,
      up: 38,
      down: 40,
      left: 37,
      right: 39,
      end: 35,
      home: 36,
      pageup: 33,
      pagedown: 34
    }
    const keyupHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { keyupHandler }
    })
    for (const keyName in modifiers) {
      const keyCode = modifiers[keyName]
      wrapper.find('.keydown').trigger(`keyup.${keyName}`)
      expect(keyupHandler.lastCall.args[0].keyCode).to.equal(keyCode)
    }
  })

  it('causes DOM to update after clickHandler method that changes components data is called', () => {
    const wrapper = mount(ComponentWithEvents)
    const toggle = wrapper.find('.toggle')
    expect(toggle.hasClass('active')).to.equal(false)
    toggle.trigger('click')
    expect(toggle.hasClass('active')).to.equal(true)
  })

  it('adds options to event', () => {
    const clickHandler = sinon.stub()
    const wrapper = mount(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const button = wrapper.find('.left-click')
    button.trigger('mousedown')
    button.trigger('mousedown', {
      button: 0
    })
    expect(clickHandler.calledOnce).to.equal(true)
  })

  it('handles .prevent', () => {
    const TestComponent = {
      template: '<input @keydown.enter.prevent="enter">'
    }
    const wrapper = mount(TestComponent)
    wrapper.trigger('keydown')
  })

  it('throws error if options contains a target value', () => {
    const wrapper = mount({ render: (h) => h('div') })
    const div = wrapper.find('div')
    const fn = () => div.trigger('click', {
      target: {}
    })
    const message = '[vue-test-utils]: you cannot set the target value of an event. See the notes section of the docs for more details—https://vue-test-utils.vuejs.org/en/api/wrapper/trigger.html'
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if wrapper does not contain element', () => {
    const wrapper = mount({ render: (h) => h('div') })
    const div = wrapper.find('div')
    div.element = null
    const fn = () => div.trigger('click')
    const message = '[vue-test-utils]: cannot call wrapper.trigger() on a wrapper without an element'
    expect(fn).to.throw().with.property('message', message)
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
})
