import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import { describeWithShallowAndMount } from '~resources/test-utils'

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

  it('sets component props, and updates DOM when propsData was not initially passed', () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop s'
    const wrapper = mountingMethod(ComponentWithProps)
    wrapper.setProps({ prop1, prop2 })
    expect(wrapper.find('.prop-1').element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2').element.textContent).to.equal(prop2)
  })

  it('does not add properties not defined in component', () => {
    const undefinedProp = 'some value'
    const wrapper = mountingMethod(ComponentWithProps)
    wrapper.setProps({ undefinedProp })
    expect(wrapper.props().undefinedProp).to.be.undefined
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
