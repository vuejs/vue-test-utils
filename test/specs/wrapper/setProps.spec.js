import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import ComponentWithWatchImmediate from '~resources/components/component-with-watch-immediate.vue'
import {
  describeWithShallowAndMount,
  isPromise,
  vueVersion
} from '~resources/utils'
import { itDoNotRunIf, itSkipIf } from 'conditional-specs'
import Vue from 'vue'

describeWithShallowAndMount('setProps', mountingMethod => {
  it('returns a promise, when resolved component is updated', async () => {
    const wrapper = mountingMethod(ComponentWithProps)
    const response = wrapper.setProps({ prop1: 'foo' })
    expect(isPromise(response)).toEqual(true)
    expect(wrapper.find('.prop-1').text()).toEqual('')
    await response
    expect(wrapper.find('.prop-1').text()).toEqual('foo')
  })

  it('sets component props and updates DOM when called on Vue instance', async () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop 2'
    const propsData = { prop1: 'a prop', prop2 }
    const wrapper = mountingMethod(ComponentWithProps, { propsData })
    await wrapper.setProps({ prop1 })
    expect(wrapper.find('.prop-1').element.textContent).toEqual(prop1)
    expect(wrapper.find('.prop-2').element.textContent).toEqual(prop2)
  })

  it('sets props and updates when called with same object', async () => {
    const TestComponent = {
      template: '<div v-if="obj && obj.shouldRender()" />',
      props: ['obj']
    }
    const obj = {
      shouldRender: () => false
    }
    const wrapper = mountingMethod(TestComponent)
    obj.shouldRender = () => true
    await wrapper.setProps({ obj })
    expect(wrapper.is('div')).toEqual(true)
  })

  it('setProps and props getter are in sync', async () => {
    const TestComponent = {
      template: `<div />`,
      props: { prop1: { default: 'initial value' } }
    }
    const wrapper = mountingMethod(TestComponent)
    const updatedValue = 'updated value'
    await wrapper.setProps({ prop1: updatedValue })
    expect(wrapper.props().prop1).toEqual(updatedValue)
  })

  it('sets component props, and updates DOM when propsData was not initially passed', async () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop s'
    const wrapper = mountingMethod(ComponentWithProps)
    await wrapper.setProps({ prop1, prop2 })
    expect(wrapper.find('.prop-1').element.textContent).toEqual(prop1)
    expect(wrapper.find('.prop-2').element.textContent).toEqual(prop2)
  })

  describe('attrs', () => {
    itDoNotRunIf(
      vueVersion < 2.4,
      'attributes not recognized as props are available via the $attrs instance property',
      async () => {
        const TestComponent = {
          template: '<div></div>'
        }
        const prop1 = 'prop1'
        const wrapper = mountingMethod(TestComponent)
        await wrapper.setProps({ prop1 })
        expect(wrapper.vm.$attrs.prop1).toEqual(prop1)
      }
    )
  })

  describe('watchers', () => {
    itSkipIf(
      vueVersion < 2.3 && process.env.TEST_ENV === 'browser',
      'updates watched prop',
      async () => {
        const TestComponent = {
          template: '<div />',
          props: ['propA'],
          mounted() {
            this.$watch(
              'propA',
              function() {
                this.propA
              },
              { immediate: true }
            )
          }
        }
        const wrapper = mountingMethod(TestComponent, {
          propsData: { propA: 'none' }
        })

        await wrapper.setProps({ propA: 'value' })
        expect(wrapper.props().propA).toEqual('value')
        expect(wrapper.vm.propA).toEqual('value')
      }
    )

    it('runs watchers correctly', async () => {
      const TestComponent = {
        template: `
          <div id="app">
            {{ stringified }}
          </div>
        `,
        props: ['collection'],
        data: () => ({
          data: ''
        }),
        computed: {
          stringified() {
            return this.collection.join(',')
          }
        },
        watch: {
          collection: 'execute'
        },
        methods: {
          execute() {
            this.data = this.stringified
          }
        }
      }
      const wrapper = mountingMethod(TestComponent, {
        propsData: { collection: [] }
      })
      expect(wrapper.vm.stringified).toEqual('')
      expect(wrapper.vm.data).toEqual('')

      await wrapper.setProps({ collection: [1, 2, 3] })
      expect(wrapper.vm.stringified).toEqual('1,2,3')
      expect(wrapper.vm.data).toEqual('1,2,3')

      wrapper.vm.collection.push(4, 5)
      await Vue.nextTick()
      expect(wrapper.vm.stringified).toEqual('1,2,3,4,5')
      expect(wrapper.vm.data).toEqual('1,2,3,4,5')
    })

    it('should not run watchers if prop updated is null', async () => {
      const TestComponent = {
        template: `
          <div>
            <div v-if="!message">There is no message yet</div>
            <div v-else>{{ reversedMessage }}</div>
          </div>
        `,
        computed: {
          reversedMessage: function() {
            return this.message
              .split('')
              .reverse()
              .join('')
          }
        },
        props: ['message']
      }
      const wrapper = mountingMethod(TestComponent, {
        propsData: {
          message: 'message'
        }
      })
      await wrapper.setProps({ message: null })
      expect(wrapper.text()).toEqual('There is no message yet')
    })

    it('runs watch function when prop is updated', async () => {
      const wrapper = mountingMethod(ComponentWithWatch)
      const prop1 = 'testest'
      await wrapper.setProps({ prop1 })
      expect(wrapper.vm.prop2).toEqual(prop1)
    })
    itSkipIf(
      vueVersion < 2.3 && process.env.TEST_ENV === 'browser',
      'invokes watchers with immediate set to "true"',
      async () => {
        const callback = jest.fn()
        const TestComponent = {
          template: '<div />',
          props: ['propA'],
          mounted() {
            this.$watch(
              'propA',
              function() {
                callback()
              },
              { immediate: true }
            )
          }
        }
        const wrapper = mountingMethod(TestComponent, {
          propsData: { propA: 'none' }
        })

        expect(callback).toHaveBeenCalledTimes(1)

        await wrapper.setProps({ propA: 'value' })
        expect(wrapper.props().propA).toEqual('value')
        expect(callback).toHaveBeenCalledTimes(2)
      }
    )
    itSkipIf(
      vueVersion < 2.3 && process.env.TEST_ENV === 'browser',
      'invokes watchers with immediate set to "true" with deep objects',
      async () => {
        const callback = jest.fn()
        const TestComponent = {
          template: '<div />',
          props: ['propA'],
          mounted() {
            this.$watch(
              'propA',
              function() {
                callback()
              },
              { immediate: true }
            )
          }
        }
        const wrapper = mountingMethod(TestComponent, {
          propsData: {
            propA: {
              key: {
                nestedKey: 'value'
              },
              key2: 'value2'
            }
          }
        })

        expect(callback).toHaveBeenCalledTimes(1)

        await wrapper.setProps({
          propA: {
            key: {
              nestedKey: 'newValue',
              anotherNestedKey: 'value'
            },
            key2: 'value2'
          }
        })
        expect(wrapper.props().propA).toEqual({
          key: {
            nestedKey: 'newValue',
            anotherNestedKey: 'value'
          },
          key2: 'value2'
        })
        expect(callback).toHaveBeenCalledTimes(2)
      }
    )

    it('correctly handles consecutive setProps calls when immediate watcher is attached', async () => {
      const wrapper = mountingMethod(ComponentWithWatchImmediate, {
        propsData: { prop1: 'zero' }
      })

      await wrapper.setProps({ prop1: 'one' })
      await wrapper.setProps({ prop1: 'two' })

      expect(wrapper.vm.prop1).toBe('two')
    })

    it('correctly handles multiple setProps calls in one tick when immediate watcher is attached', async () => {
      const wrapper = mountingMethod(ComponentWithWatchImmediate, {
        propsData: { prop1: 'zero' }
      })

      wrapper.setProps({ prop1: 'one' })
      wrapper.setProps({ prop1: 'two' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.prop1).toBe('two')
    })
  })

  it('props and setProps should return the same reference when called with same object', async () => {
    const TestComponent = {
      template: `<div></div>`,
      props: ['obj']
    }
    const wrapper = mountingMethod(TestComponent)
    const obj = {}
    await wrapper.setProps({ obj })
    expect(wrapper.props().obj).toEqual(obj)
  })

  describe('invalid arguments', () => {
    const errors = {
      FUNCTIONAL_COMPONENT_ERROR: `[vue-test-utils]: wrapper.setProps() cannot be called on a functional component`,
      SAME_REFERENCE_ERROR: `[vue-test-utils]: wrapper.setProps() called with the same object of the existing obj property. You must call wrapper.setProps() with a new object to trigger reactivity`,
      INVALID_NODE_ERROR: `wrapper.setProps() can only be called on a Vue instance`,
      WRONG_PROP_ERROR: `[vue-test-utils]: wrapper.setProps() called with prop1 property which is not defined on the component`,
      ONLY_TOP_LEVEL_ERROR: `[vue-test-utils]: wrapper.setProps() can only be called for top-level component`
    }

    describe('functional components', () => {
      const AFunctionalComponent = {
        render: (h, context) => h('div', context.prop1),
        functional: true
      }

      it('throws error when called on functional vnode', () => {
        const fn = () =>
          mountingMethod(AFunctionalComponent).setProps({ prop1: 'prop' })
        expect(fn).toThrow(errors.FUNCTIONAL_COMPONENT_ERROR)
      })

      // find on functional components isn't supported in Vue < 2.3
      itDoNotRunIf(
        vueVersion < 2.3,
        'throws error after finding a functional component',
        () => {
          const TestComponent = {
            template: '<div><a-functional-component /></div>',
            components: {
              AFunctionalComponent
            }
          }
          const fn2 = () =>
            mountingMethod(TestComponent)
              .find(AFunctionalComponent)
              .setProps({ prop1: 'prop' })
          expect(fn2).toThrow(errors.FUNCTIONAL_COMPONENT_ERROR)
        }
      )

      itDoNotRunIf(
        vueVersion > 2.3,
        'throws error if component does not include props key',
        () => {
          const fn = () =>
            mountingMethod({ template: '<div/>' }).setProps({ prop1: 'prop' })

          expect(fn).toThrow(errors.WRONG_PROP_ERROR)
        }
      )
    })

    it('throws an error if property is same reference', async () => {
      const obj = {}
      const wrapper = mountingMethod(
        {
          template: `
            <div />`,
          props: ['obj']
        },
        { propsData: { obj } }
      )

      const fn = () => wrapper.setProps({ obj })
      expect(fn).toThrow(errors.SAME_REFERENCE_ERROR)
    })

    it('throws an error if node is not a Vue instance', () => {
      const compiled = compileToFunctions('<div><p></p></div>')
      const wrapper = mountingMethod(compiled)
      const p = wrapper.find('p')
      expect(() => p.setProps({ ready: true })).toThrow(
        errors.INVALID_NODE_ERROR
      )
    })

    it('throws an error if called on child component', () => {
      const wrapper = mountingMethod(ComponentWithChild)
      const child = wrapper.find({ ref: 'child' })
      expect(() => child.setProps({})).toThrow(errors.ONLY_TOP_LEVEL_ERROR)
    })
  })
})
