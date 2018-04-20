import ComponentWithTransitionGroup from '~resources/components/component-with-transition-group.vue'
import { TransitionGroupStub } from '~vue/test-utils'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('TransitionGroupStub', (mountingMethod) => {
  it('update synchronously when used as stubs for Transition', () => {
    const wrapper = mountingMethod(ComponentWithTransitionGroup, {
      stubs: {
        'transition-group': TransitionGroupStub
      }
    })
    expect(wrapper.text()).contains('a')
    wrapper.setData({ a: 'b' })
    expect(wrapper.text()).contains('b')
  })

  it('updates watchers', () => {
    const TestComponent = {
      data: () => ({
        someWatchedData: null,
        someData: null
      }),
      watch: {
        someWatchedData (newData) {
          this.someData = newData
        }
      },
      template: `
    <transition-group
         mode="out-in"
         class="body"
         tag="div"
     >
     {{someData}}
     </transition-group>
    `
    }
    const wrapper = mountingMethod(TestComponent, {
      stubs: {
        'transition-group': TransitionGroupStub
      }
    })
    wrapper.setData({
      someWatchedData: 'some data'
    })
    expect(wrapper.html()).contains('some data')
  })
})
