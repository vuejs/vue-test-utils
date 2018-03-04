import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import {
  describeWithShallowAndMount,
  vueVersion
} from '~resources/utils'

describeWithShallowAndMount('setProps', (mountingMethod) => {
  let info

  beforeEach(() => {
    info = sinon.stub(console, 'info')
  })

  afterEach(() => {
    info.restore()
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

  it('throws error if component does not include props key', () => {
    const TestComponent = {
      template: '<div></div>'
    }
    const message = '[vue-test-utils]: wrapper.setProps() called with prop1 property which is not defined on component'
    const fn = () => mountingMethod(TestComponent).setProps({ prop1: 'prop' })
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error when called on functional vnode', () => {
    const AFunctionalComponent = {
      render: (h, context) => h('div', context.prop1),
      functional: true
    }
    const message = '[vue-test-utils]: wrapper.setProps() canot be called on a functional component'
    const fn = () => mountingMethod(AFunctionalComponent).setProps({ prop1: 'prop' })
    expect(fn).to.throw().with.property('message', message)
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
    const fn2 = () => mountingMethod(TestComponent).find(AFunctionalComponent).setProps({ prop1: 'prop' })
    expect(fn2).to.throw().with.property('message', message)
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
    expect(info.args[0][0]).to.equal(prop1)
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
        reversedMessage: function () {
          return this.message.split('').reverse().join('')
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

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setProps() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setProps({ ready: true })).throw(Error, message)
  })
})
