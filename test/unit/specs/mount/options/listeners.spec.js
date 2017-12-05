import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import { listenersSupported } from '~resources/test-utils'

describe('mount.listeners', () => {
  it('handles inherit listeners', () => {
    if (!listenersSupported()) return
    const aListener = () => {}
    const wrapper = mount(compileToFunctions('<p :id="aListener" />'), {
      listeners: {
        aListener
      }
    })

    expect(wrapper.vm.$listeners.aListener).to.equal(aListener)
    wrapper.update()
    expect(wrapper.vm.$listeners.aListener).to.equal(aListener)
  })

  it('defines listeners as empty object even when not passed', () => {
    const wrapper = mount(compileToFunctions('<p />'))
    expect(wrapper.vm.$listeners).to.deep.equal({})
  })
})
