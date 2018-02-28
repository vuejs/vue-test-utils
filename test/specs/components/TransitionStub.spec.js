import ComponentWithTransition from '~resources/components/component-with-transition.vue'
import { describeWithShallowAndMount } from '~resources/utils'
import { TransitionStub } from '~vue/test-utils'

describeWithShallowAndMount('TransitionStub', (mountingMethod) => {
  it('update synchronously when used as stubs for Transition', () => {
    console.log(TransitionStub)
    const wrapper = mountingMethod(ComponentWithTransition, {
      stubs: {
        'transition': TransitionStub
      }
    })
    expect(wrapper.text()).contains('a')
    wrapper.setData({ a: 'b' })
    expect(wrapper.text()).contains('b')
  })

  it('does not add v-leave class to children', () => {
    const TestComponent = {
      template: `
    <div>
      <transition name="expand">
        <nav v-show="isShown" />
      </transition>
      <button @click="isShown = !isShown" />
    </div>
    `,
      data: () => ({
        isShown: false
      })
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'transition': TransitionStub
      }
    })
    expect(wrapper.find('nav').visible()).to.equal(false)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('nav').visible()).to.equal(true)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('nav').visible()).to.equal(false)
  })

  it('logs error when has multiple children', () => {
    const TestComponent = {
      template: `
        <transition><div /><div /></transition>
      `
    }
    const msg = '[vue-test-utils]: <transition> can only be used on a single element. Use <transition-group> for lists.'
    const error = sinon.stub(console, 'error')
    mountingMethod(TestComponent, {
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
    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'transition': TransitionStub
      }
    })
    expect(wrapper.text()).to.equal('a')
    wrapper.setData({ bool: false })
    expect(wrapper.text()).to.equal('b')
  })
})
