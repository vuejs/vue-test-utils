import ComponentWithEvents from '~resources/components/component-with-events.vue'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'
import {
  describeWithShallowAndMount,
  scopedSlotsSupported,
  isRunningPhantomJS,
  isPromise,
  vueVersion
} from '~resources/utils'
import Vue from 'vue'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('trigger', mountingMethod => {
  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.reset()
    sandbox.restore()
  })

  it('returns a promise that when resolved, the component is updated', async () => {
    const wrapper = mountingMethod(ComponentWithEvents)
    const toggle = wrapper.find('.toggle')
    expect(toggle.classes()).not.to.contain('active')
    const response = toggle.trigger('click')
    expect(toggle.classes()).not.to.contain('active')
    expect(isPromise(response)).to.eql(true)
    await response
    expect(toggle.classes()).to.contain('active')
  })

  it('causes click handler to fire when wrapper.trigger("click") is called on a Component', () => {
    const clickHandler = sandbox.stub()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const button = wrapper.find('.click')
    button.trigger('click')

    expect(clickHandler.calledOnce).toEqual(true)
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown") is fired on a Component', () => {
    const keydownHandler = sandbox.stub()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.find('.keydown').trigger('keydown')

    expect(keydownHandler.calledOnce).toEqual(true)
  })

  describe('causes keydown handler to fire with the appropriate keyCode when wrapper.trigger("keydown", { keyCode: 65 }) is fired on a Component', () => {
    const keydownHandler = sandbox.stub()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })

    wrapper.find('.keydown').trigger('keydown', { keyCode: 65 })

    const keyboardEvent = keydownHandler.getCall(0).args[0]

    // Unfortunately, JSDom will give different types than PhantomJS for keyCodes (string vs number), so we have to use parseInt to normalize the types.
    it('contains the keyCode', () => {
      expect(parseInt(keyboardEvent.keyCode, 10)).toEqual(65)
    })

    itDoNotRunIf(isRunningPhantomJS, 'contains the code', () => {
      expect(parseInt(keyboardEvent.code, 10)).toEqual(65)
    })
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown.enter") is fired on a Component', () => {
    const keydownHandler = sandbox.stub()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    wrapper.find('.keydown-enter').trigger('keydown.enter')

    expect(keydownHandler.calledOnce).toEqual(true)
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
    const keyupHandler = sandbox.stub()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keyupHandler }
    })
    for (const keyName in modifiers) {
      const keyCode = modifiers[keyName]
      wrapper.find('.keydown').trigger(`keyup.${keyName}`)
      expect(keyupHandler.lastCall.args[0].keyCode).toEqual(keyCode)
    }
  })

  itDoNotRunIf(
    vueVersion < 2.2,
    'causes DOM to update after clickHandler method that changes components data is called',
    async () => {
      const wrapper = mountingMethod(ComponentWithEvents)
      const toggle = wrapper.find('.toggle')
      expect(toggle.classes()).not.to.contain('active')
      toggle.trigger('click')
      await Vue.nextTick()
      expect(toggle.classes()).to.contain('active')
    }
  )

  it('adds options to event', () => {
    const clickHandler = sandbox.stub()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const button = wrapper.find('.left-click')
    button.trigger('mousedown', {
      button: 1
    })
    button.trigger('mousedown', {
      button: 0
    })
    expect(clickHandler.calledOnce).toEqual(true)
  })

  it('adds custom data to events', () => {
    const stub = sandbox.stub()
    const TestComponent = {
      template: '<div @update="callStub" />',
      methods: {
        callStub(event) {
          stub(event.customData)
        }
      }
    }

    const wrapper = mountingMethod(TestComponent)

    wrapper.trigger('update', {
      customData: 123
    })

    expect(stub).calledWith(123)
  })

  it('does not fire on valid disabled elements', () => {
    const clickHandler = sandbox.stub()
    const ButtonComponent = {
      template: '<button disabled @click="clickHandler">Button</button>',
      props: ['clickHandler']
    }
    const buttonWrapper = mountingMethod(ButtonComponent, {
      propsData: {
        clickHandler
      }
    })
    buttonWrapper.trigger('click')
    expect(clickHandler.called).toEqual(false)

    const changeHandler = sandbox.stub()
    const InputComponent = {
      template: '<input disabled @change="changeHandler"/>',
      props: ['changeHandler']
    }
    const inputWrapper = mountingMethod(InputComponent, {
      propsData: {
        changeHandler
      }
    })
    inputWrapper.trigger('change')
    expect(changeHandler.called).toEqual(false)
  })

  it('fires on invalid disabled elements', () => {
    const clickHandler = sandbox.stub()
    const LinkComponent = {
      template: '<a disabled href="#" @click="clickHandler">Link</a>',
      props: ['clickHandler']
    }
    const linkWrapper = mountingMethod(LinkComponent, {
      propsData: {
        clickHandler
      }
    })
    linkWrapper.trigger('click')
    expect(clickHandler.called).toEqual(true)
  })

  it('handles .prevent', () => {
    const TestComponent = {
      template: '<input @keydown.enter.prevent="enter">'
    }
    const wrapper = mountingMethod(TestComponent)
    wrapper.trigger('keydown')
  })

  itDoNotRunIf(
    !scopedSlotsSupported || mountingMethod.name === 'shallowMount',
    'handles instances without update watchers',
    () => {
      const vm = new Vue()
      const item = () => vm.$createElement('button')
      const TestComponent = {
        render(h) {
          return h(ComponentWithScopedSlots, {
            scopedSlots: {
              noProps: item
            }
          })
        }
      }
      const wrapper = mountingMethod(TestComponent)
      wrapper.findAll('button').trigger('click')
    }
  )

  it('throws error if options contains a target value', () => {
    const wrapper = mountingMethod({ render: h => h('div') })
    const div = wrapper.find('div')
    const fn = () =>
      div.trigger('click', {
        target: {}
      })
    const message =
      '[vue-test-utils]: you cannot set the target value of an event. See the notes section of the docs for more details—https://vue-test-utils.vuejs.org/api/wrapper/trigger.html'
    expect(fn)
      .toThrow()
      .with.property('message', message)
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
      expect(fn)
        .toThrow()
        .with.property('message', message)
    })
  })

  itDoNotRunIf(
    isRunningPhantomJS,
    'trigger should create events with correct interface',
    () => {
      let lastEvent
      const TestComponent = {
        template: `
          <div @click="updateLastEvent" />
        `,
        methods: {
          updateLastEvent(event) {
            lastEvent = event
          }
        }
      }

      const wrapper = mountingMethod(TestComponent)

      wrapper.trigger('click')
      expect(lastEvent).to.be.an.instanceof(window.MouseEvent)
    }
  )

  it('falls back to supported event if not supported by browser', () => {
    const TestComponent = {
      template: '<div />'
    }

    const wrapper = mountingMethod(TestComponent)

    wrapper.trigger('gamepadconnected')
  })
})
