import ComponentWithTransition from '~resources/components/component-with-transition.vue'
import TransitionStub from '~src/components/TransitionStub'
import { mount } from '~vue-test-utils'

describe('TransitionStub', () => {
  it('update synchronously when used as stubs for Transition', () => {
    const wrapper = mount(ComponentWithTransition, {
      stubs: {
        'transition': TransitionStub
      }
    })
    expect(wrapper.text()).contains('a')
    wrapper.setData({ a: 'b' })
    expect(wrapper.text()).contains('b')
  })

  it('logs error when has multiple children', () => {
    const TestComponent = {
      template: `
        <transition><div /><div /></transition>
      `
    }
    const msg = '[vue-test-utils]: <transition> can only be used on a single element. Use <transition-group> for lists.'
    const error = sinon.stub(console, 'error')
    mount(TestComponent, {
      stubs: {
        'transition': TransitionStub
      }
    })
    expect(error.args[0][0]).to.equal(msg)
    error.restore()
  })
})
