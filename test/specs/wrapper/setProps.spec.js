import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'
import Vue from 'vue'

describeWithShallowAndMount('setProps', mountingMethod => {
  const sandbox = sinon.createSandbox()
  beforeEach(() => {
    sandbox.stub(console, 'info').callThrough()
  })

  afterEach(() => {
    sandbox.reset()
    sandbox.restore()
  })

  it('returns a promise, when resolved component is updated', async () => {
    const wrapper = mountingMethod(ComponentWithProps)
    const response = wrapper.setProps({ prop1: 'foo' })
    expect(response instanceof Promise).to.eql(true)
    expect(wrapper.find('.prop-1').text()).to.equal('')
    await response
    expect(wrapper.find('.prop-1').text()).to.equal('foo')
  })

  it('sets component props and updates DOM when called on Vue instance', async () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop 2'
    const propsData = { prop1: 'a prop', prop2 }
    const wrapper = mountingMethod(ComponentWithProps, { propsData })
    await wrapper.setProps({ prop1 })
    expect(wrapper.find('.prop-1').element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2').element.textContent).to.equal(prop2)
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
    expect(wrapper.is('div')).to.equal(true)
  })

  it('setProps and props getter are in sync', () => {
    const TestComponent = {
      template: `<div />`,
      props: { prop1: { default: 'initial value' } }
    }
    const wrapper = mountingMethod(TestComponent)
    const updatedValue = 'updated value'
    wrapper.setProps({ prop1: updatedValue })
    expect(wrapper.props().prop1).to.equal(updatedValue)
  })

  it('sets component props, and updates DOM when propsData was not initially passed', async () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop s'
    const wrapper = mountingMethod(ComponentWithProps)
    await wrapper.setProps({ prop1, prop2 })
    expect(wrapper.find('.prop-1').element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2').element.textContent).to.equal(prop2)
  })

  describe('attrs', () => {
    itDoNotRunIf(
      vueVersion < 2.4,
      'attributes not recognized as props are available via the $attrs instance property',
      () => {
        const TestComponent = {
          template: '<div></div>'
        }
        const prop1 = 'prop1'
        const wrapper = mountingMethod(TestComponent)
        wrapper.setProps({ prop1 })
        expect(wrapper.vm.$attrs.prop1).to.equal(prop1)
      }
    )
  })

  describe('watchers', () => {
    it('updates watched prop', () => {
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

      wrapper.setProps({ propA: 'value' })
      expect(wrapper.props().propA).to.equal('value')
      expect(wrapper.vm.propA).to.equal('value')
    })

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
      expect(wrapper.vm.stringified).to.equal('')
      expect(wrapper.vm.data).to.equal('')

      await wrapper.setProps({ collection: [1, 2, 3] })
      expect(wrapper.vm.stringified).to.equal('1,2,3')
      expect(wrapper.vm.data).to.equal('1,2,3')

      wrapper.vm.collection.push(4, 5)
      await Vue.nextTick()
      expect(wrapper.vm.stringified).to.equal('1,2,3,4,5')
      expect(wrapper.vm.data).to.equal('1,2,3,4,5')
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
      expect(wrapper.text()).to.equal('There is no message yet')
    })

    it('runs watch function when prop is updated', async () => {
      const wrapper = mountingMethod(ComponentWithWatch)
      const prop1 = 'testest'
      await wrapper.setProps({ prop1 })
      expect(wrapper.vm.prop2).to.equal(prop1)
    })
  })

  it('props and setProps should return the same reference when called with same object', () => {
    const TestComponent = {
      template: `<div></div>`,
      props: ['obj']
    }
    const wrapper = mountingMethod(TestComponent)
    const obj = {}
    wrapper.setProps({ obj })
    expect(wrapper.props().obj).to.equal(obj)
  })

  describe('invalid arguments', () => {
    const errors = {
      FUNCTIONAL_COMPONENT_ERROR: `[vue-test-utils]: wrapper.setProps() cannot be called on a functional component`,
      SAME_REFERENCE_ERROR: `[vue-test-utils]: wrapper.setProps() called with the same object of the existing obj property. You must call wrapper.setProps() with a new object to trigger reactivity`,
      INVALID_NODE_ERROR: `wrapper.setProps() can only be called on a Vue instance`,
      WRONG_PROP_ERROR: `[vue-test-utils]: wrapper.setProps() called with prop1 property which is not defined on the component`
    }

    describe('functional components', () => {
      const AFunctionalComponent = {
        render: (h, context) => h('div', context.prop1),
        functional: true
      }

      it('throws error when called on functional vnode', () => {
        const fn = () =>
          mountingMethod(AFunctionalComponent).setProps({ prop1: 'prop' })
        expect(fn).throw(Error, errors.FUNCTIONAL_COMPONENT_ERROR)
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
          expect(fn2)
            .to.throw()
            .with.property('message', errors.FUNCTIONAL_COMPONENT_ERROR)
        }
      )

      itDoNotRunIf(
        vueVersion > 2.3,
        'throws error if component does not include props key',
        () => {
          const fn = () =>
            mountingMethod({ template: '<div/>' }).setProps({ prop1: 'prop' })

          expect(fn).throw(Error, errors.WRONG_PROP_ERROR)
        }
      )
    })

    it('throws an error if property is same reference', () => {
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
      expect(fn).throw(Error, errors.SAME_REFERENCE_ERROR)
    })

    it('throws an error if node is not a Vue instance', () => {
      const compiled = compileToFunctions('<div><p></p></div>')
      const wrapper = mountingMethod(compiled)
      const p = wrapper.find('p')
      expect(() => p.setProps({ ready: true })).throw(
        Error,
        errors.INVALID_NODE_ERROR
      )
    })
  })
})
