import { compileToFunctions } from 'vue-template-compiler'
import { listenersSupported } from '~resources/utils'
import {
  describeWithShallowAndMount,
  isRunningPhantomJS
} from '~resources/utils'
import {
  itDoNotRunIf
} from 'conditional-specs'

describeWithShallowAndMount('options.listeners', (mountingMethod) => {
  itDoNotRunIf(
    isRunningPhantomJS,
    'handles inherit listeners', () => {
      if (!listenersSupported) return
      const aListener = () => {}
      const wrapper = mountingMethod(compileToFunctions('<p :id="aListener" />'), {
        listeners: {
          aListener
        }
      })

      expect(wrapper.vm.$listeners.aListener.fns).to.equal(aListener)
      expect(wrapper.vm.$listeners.aListener.fns).to.equal(aListener)
    })

  it('defines listeners as empty object even when not passed', () => {
    const wrapper = mountingMethod(compileToFunctions('<p />'))
    expect(wrapper.vm.$listeners).to.deep.equal({})
  })
})
