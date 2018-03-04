import { compileToFunctions } from 'vue-template-compiler'
import { listenersSupported } from '~resources/utils'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('options.listeners', (mountingMethod) => {
  it('handles inherit listeners', () => {
    if (!listenersSupported()) return
    const aListener = () => {}
    const wrapper = mountingMethod(compileToFunctions('<p :id="aListener" />'), {
      listeners: {
        aListener
      }
    })

    expect(wrapper.vm.$listeners.aListener).to.equal(aListener)
    wrapper.update()
    expect(wrapper.vm.$listeners.aListener).to.equal(aListener)
  })

  it('defines listeners as empty object even when not passed', () => {
    const wrapper = mountingMethod(compileToFunctions('<p />'))
    expect(wrapper.vm.$listeners).to.deep.equal({})
  })
})
