import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('setProps', mountingMethod => {
  const sandbox = sinon.createSandbox()
  beforeEach(() => {
    sandbox.stub(console, 'info').callThrough()
  })

  afterEach(() => {
    sandbox.reset()
    sandbox.restore()
  })

  it('sets component props and updates DOM when called on Vue instance', () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop 2'
    const propsData = { prop1: 'a prop', prop2 }
    const wrapper = mountingMethod(ComponentWithProps, { propsData })
    wrapper.setProps({ prop1 })
    expect(wrapper.find('.prop-1').element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2').element.textContent).to.equal(prop2)
  })

  it('sets props and updates when called with same object', () => {
    const TestComponent = {
      template: '<div v-if="obj && obj.shouldRender()" />',
      props: ['obj']
    }
    const obj = {
      shouldRender: () => false
    }
    const wrapper = mountingMethod(TestComponent)
    obj.shouldRender = () => true
    wrapper.setProps({ obj })
    expect(wrapper.is('div')).to.equal(true)
  })

  itDoNotRunIf(
    vueVersion > 2.3,
    'throws error if component does not include props key',
    () => {
      const TestComponent = {
        template: '<div></div>'
      }
      const message =
        `[vue-test-utils]: wrapper.setProps() called ` +
        `with prop1 property which is not defined on the component`
      const fn = () => mountingMethod(TestComponent).setProps({ prop1: 'prop' })
      expect(fn)
        .to.throw()
        .with.property('message', message)
    }
  )

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

  it('throws error when called on functional vnode', () => {
    const AFunctionalComponent = {
      render: (h, context) => h('div', context.prop1),
      functional: true
    }
    const message =
      '[vue-test-utils]: wrapper.setProps() cannot be called on a functional component'
    const fn = () =>
      mountingMethod(AFunctionalComponent).setProps({ prop1: 'prop' })
    expect(fn)
      .to.throw()
      .with.property('message', message)
    // find on functional components isn't supported in Vue < 2.3
    if (vueVersion < 2.3) {
      return
    }
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
      .with.property('message', message)
  })

  it('sets component props, and updates DOM when propsData was not initially passed', () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop s'
    const wrapper = mountingMethod(ComponentWithProps)
    wrapper.setProps({ prop1, prop2 })
    expect(wrapper.find('.prop-1').element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2').element.textContent).to.equal(prop2)
  })

  it('runs watch function when prop is updated', () => {
    const wrapper = mountingMethod(ComponentWithWatch)
    const prop1 = 'testest'
    wrapper.setProps({ prop1 })
    expect(wrapper.vm.prop2).to.equal(prop1)
  })

  it('runs watch function after all props are updated', () => {
    const wrapper = mountingMethod(ComponentWithWatch)
    const prop1 = 'testest'
    wrapper.setProps({ prop2: 'newProp', prop1 })
    expect(console.info.args[1][0]).to.equal(prop1)
  })

  it('should not run watchers if prop updated is null', () => {
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
    wrapper.setProps({ message: null })
    expect(wrapper.text()).to.equal('There is no message yet')
  })

  it('runs watchers correctly', () => {
    const TestComponent = {
      template: `<div id="app">
        {{ stringified }}
      </div>`,
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

    wrapper.setProps({ collection: [1, 2, 3] })
    expect(wrapper.vm.stringified).to.equal('1,2,3')
    expect(wrapper.vm.data).to.equal('1,2,3')

    wrapper.vm.collection.push(4, 5)
    expect(wrapper.vm.stringified).to.equal('1,2,3,4,5')
    expect(wrapper.vm.data).to.equal('1,2,3,4,5')
  })

  it('should same reference when called with same object', () => {
    const TestComponent = {
      template: `<div></div>`,
      props: ['obj']
    }
    const wrapper = mountingMethod(TestComponent)
    const obj = {}
    wrapper.setProps({ obj })
    expect(wrapper.props().obj).to.equal(obj)
  })

  it('throws an error if property is same reference', () => {
    const TestComponent = {
      template: `<div></div>`,
      props: ['obj']
    }
    const obj = {}
    const wrapper = mountingMethod(TestComponent, {
      propsData: {
        obj
      }
    })

    const message =
      '[vue-test-utils]: wrapper.setProps() called with the same object of the existing obj property. You must call wrapper.setProps() with a new object to trigger reactivity'
    const fn = () => wrapper.setProps({ obj })
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

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

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setProps() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setProps({ ready: true })).throw(Error, message)
  })
})
