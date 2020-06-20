import { attrsSupported } from '~resources/utils'
import {
  describeWithShallowAndMount,
  isRunningPhantomJS,
  vueVersion
} from '~resources/utils'
import { itSkipIf, itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('options.attrs', mountingMethod => {
  itDoNotRunIf(
    vueVersion < 2.4 || isRunningPhantomJS,
    'handles inherit attrs',
    () => {
      if (!attrsSupported) return
      const TestComponent = {
        template: '<p :id="$attrs.anAttr" />'
      }
      const wrapper = mountingMethod(TestComponent, {
        attrs: {
          anAttr: 'an attribute'
        }
      })
      expect(wrapper.vm.$attrs.anAttr).toEqual('an attribute')
      expect(wrapper.vm.$attrs.anAttr).toEqual('an attribute')
    }
  )

  itSkipIf(
    vueVersion < 2.5,
    'defines attrs as empty object even when not passed',
    () => {
      const wrapper = mountingMethod({ template: '<p />' })
      expect(wrapper.vm.$attrs).to.deep.equal({})
    }
  )
})
