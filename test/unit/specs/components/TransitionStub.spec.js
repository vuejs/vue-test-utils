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

  it('handles keyed transitions', () => {
    const TestComponent = {
      template: `
      <div>
        <transition>
          <div v-if="bool" key="a">a</div>
          <div v-else key="b">b</div>
        </transition>
      </div>
      `,
      data () {
        return {
          bool: true
        }
      }
    }
    const wrapper = mount(TestComponent, {
      stubs: {
        'transition': TransitionStub
      }
    })
    expect(wrapper.text()).to.equal('a')
    wrapper.setData({ bool: false })
    expect(wrapper.text()).to.equal('b')
  })
})
