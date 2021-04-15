import ComponentWithEvents from '~resources/components/component-with-events.vue'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'
import {
  describeWithShallowAndMount,
  scopedSlotsSupported,
  isRunningChrome,
  isPromise,
  vueVersion
} from '~resources/utils'
import Vue from 'vue'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('trigger', mountingMethod => {
  it('returns a promise that when resolved, the component is updated', async () => {
    const wrapper = mountingMethod(ComponentWithEvents)
    const toggle = wrapper.find('.toggle')
    expect(toggle.classes()).not.toContain('active')
    const response = toggle.trigger('click')
    expect(toggle.classes()).not.toContain('active')
    expect(isPromise(response)).toEqual(true)
    await response
    expect(toggle.classes()).toContain('active')
  })

  it('causes click handler to fire when wrapper.trigger("click") is called on a Component', async () => {
    const clickHandler = jest.fn()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const button = wrapper.find('.click')
    await button.trigger('click')

    expect(clickHandler).toHaveBeenCalled()
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown") is fired on a Component', async () => {
    const keydownHandler = jest.fn()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    await wrapper.find('.keydown').trigger('keydown')

    expect(keydownHandler).toHaveBeenCalled()
  })

  describe('causes keydown handler to fire with the appropriate keyCode when wrapper.trigger("keydown", { keyCode: 46 }) is fired on a Component', async () => {
    const keydownHandler = jest.fn()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })

    await wrapper.find('.keydown').trigger('keydown', { keyCode: 46 })

    const keyboardEvent = keydownHandler.mock.calls[0][0]

    // Unfortunately, JSDom will give different types than PhantomJS for keyCodes (string vs number), so we have to use parseInt to normalize the types.
    it('contains the keyCode', () => {
      expect(parseInt(keyboardEvent.keyCode, 10)).toEqual(46)
    })

    it('contains the key', () => {
      expect(keyboardEvent.key).toEqual('Delete')
    })

    itDoNotRunIf(isRunningChrome, 'contains the code', () => {
      expect(parseInt(keyboardEvent.code, 10)).toEqual(46)
    })
  })

  describe('causes keydown handler to fire with the appropriate key when wrapper.trigger("keydown", { key: "k" }) is fired on a Component', async () => {
    const keydownHandler = jest.fn()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })

    await wrapper.find('.keydown').trigger('keydown', { key: 'k' })

    const keyboardEvent = keydownHandler.mock.calls[0][0]

    it('contains the key', () => {
      expect(keyboardEvent.key).toEqual('k')
    })
  })

  it('causes keydown handler to fire when wrapper.trigger("keydown.enter") is fired on a Component', async () => {
    const keydownHandler = jest.fn()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keydownHandler }
    })
    await wrapper.find('.keydown-enter').trigger('keydown.enter')

    expect(keydownHandler).toHaveBeenCalled()
  })

  it('convert a registered key name to a key code and key', async () => {
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

    // get from https://github.com/ashubham/w3c-keys/blob/master/index.ts
    const w3cKeys = {
      enter: 'Enter',
      tab: 'Tab',
      delete: 'Delete',
      esc: 'Esc',
      escape: 'Escape',
      space: ' ',
      up: 'Up',
      left: 'Left',
      right: 'Right',
      down: 'Down',
      end: 'End',
      home: 'Home',
      backspace: 'Backspace',
      insert: 'Insert',
      pageup: 'PageUp',
      pagedown: 'PageDown'
    }

    const codeToKeyNameMap = Object.entries(modifiers).reduce(
      (acc, [key, value]) => Object.assign(acc, { [value]: w3cKeys[key] }),
      {}
    )

    const modifiersArray = Object.entries(modifiers)

    const keyupHandler = jest.fn()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { keyupHandler }
    })

    for (let index = 0; index < modifiersArray.length; index++) {
      const [keyName, keyCode] = modifiersArray[index]
      await wrapper.find('.keydown').trigger(`keyup.${keyName}`)

      expect(keyupHandler.mock.calls[index][0].keyCode).toEqual(keyCode)
      expect(keyupHandler.mock.calls[index][0].key).toEqual(
        codeToKeyNameMap[keyCode]
      )
    }
  })

  itDoNotRunIf(
    vueVersion < 2.2,
    'causes DOM to update after clickHandler method that changes components data is called',
    async () => {
      const wrapper = mountingMethod(ComponentWithEvents)
      const toggle = wrapper.find('.toggle')
      expect(toggle.classes()).not.toContain('active')
      await toggle.trigger('click')
      expect(toggle.classes()).toContain('active')
    }
  )

  it('adds options to event', async () => {
    const clickHandler = jest.fn()
    const wrapper = mountingMethod(ComponentWithEvents, {
      propsData: { clickHandler }
    })
    const button = wrapper.find('.left-click')
    await button.trigger('mousedown', {
      button: 1
    })
    await button.trigger('mousedown', {
      button: 0
    })
    expect(clickHandler).toHaveBeenCalled()
  })

  it('adds custom data to events', async () => {
    const stub = jest.fn()
    const TestComponent = {
      template: '<div @update="callStub" />',
      methods: {
        callStub(event) {
          stub(event.customData)
        }
      }
    }

    const wrapper = mountingMethod(TestComponent)

    await wrapper.trigger('update', {
      customData: 123
    })

    expect(stub).toHaveBeenCalledWith(123)
  })

  it('does not fire on valid disabled elements', async () => {
    const clickHandler = jest.fn()
    const ButtonComponent = {
      template: '<button disabled @click="clickHandler">Button</button>',
      props: ['clickHandler']
    }
    const buttonWrapper = mountingMethod(ButtonComponent, {
      propsData: {
        clickHandler
      }
    })
    await buttonWrapper.trigger('click')
    expect(clickHandler).not.toHaveBeenCalled()

    const changeHandler = jest.fn()
    const InputComponent = {
      template: '<input disabled @change="changeHandler"/>',
      props: ['changeHandler']
    }
    const inputWrapper = mountingMethod(InputComponent, {
      propsData: {
        changeHandler
      }
    })
    await inputWrapper.trigger('change')
    expect(changeHandler).not.toHaveBeenCalled()
  })

  it('fires on invalid disabled elements', async () => {
    const clickHandler = jest.fn()
    const LinkComponent = {
      template: '<a disabled href="#" @click="clickHandler">Link</a>',
      props: ['clickHandler']
    }
    const linkWrapper = mountingMethod(LinkComponent, {
      propsData: {
        clickHandler
      }
    })
    await linkWrapper.trigger('click')
    expect(clickHandler).toHaveBeenCalled()
  })

  it('handles .prevent', async () => {
    const TestComponent = {
      template: '<input @keydown.enter.prevent="enter">'
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.trigger('keydown')
  })

  itDoNotRunIf(
    !scopedSlotsSupported || mountingMethod.name === 'shallowMount',
    'handles instances without update watchers',
    async () => {
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
      await wrapper.findAll('button').trigger('click')
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
    expect(fn).toThrow(message)
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

  itDoNotRunIf(
    isRunningChrome,
    'trigger should create events with correct interface',
    async () => {
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

      await wrapper.trigger('click')
      expect(lastEvent).toBeInstanceOf(window.MouseEvent)
    }
  )

  it('falls back to supported event if not supported by browser', async () => {
    const TestComponent = {
      template: '<div />'
    }

    const wrapper = mountingMethod(TestComponent)

    await wrapper.trigger('gamepadconnected')
  })
})
