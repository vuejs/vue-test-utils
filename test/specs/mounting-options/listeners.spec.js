import { listenersSupported } from '~resources/utils'
import {
  describeWithShallowAndMount,
  isRunningPhantomJS,
  vueVersion
} from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('options.listeners', mountingMethod => {
  itDoNotRunIf(
    isRunningPhantomJS || !listenersSupported,
    'handles inherit listeners',
    () => {
      const aListener = () => {}
      const wrapper = mountingMethod(
        {
          template: '<p :id="$listeners.aListener" />'
        },
        {
          listeners: {
            aListener
          }
        }
      )

      expect(wrapper.vm.$listeners.aListener.fns).to.equal(aListener)
    }
  )

  itDoNotRunIf(
    isRunningPhantomJS || !listenersSupported,
    'passes listeners to functional components',
    () => {
      const TestComponent = {
        render(h, ctx) {
          ctx.listeners.aListener()
          ctx.listeners.bListener()
          return h('div')
        },
        functional: true
      }

      mountingMethod(TestComponent, {
        context: {
          on: {
            bListener() {}
          }
        },
        listeners: {
          aListener() {}
        }
      })
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5,
    'defines listeners as empty object even when not passed',
    () => {
      const wrapper = mountingMethod({ template: '<p />' })
      expect(wrapper.vm.$listeners).to.deep.equal({})
    }
  )
})
