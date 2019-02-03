import { attrsSupported } from '~resources/utils'
import {
  describeWithMountingMethods,
  isRunningPhantomJS,
  vueVersion
} from '~resources/utils'
import { itSkipIf, itDoNotRunIf } from 'conditional-specs'

describeWithMountingMethods('options.attrs', mountingMethod => {
  itDoNotRunIf(
    vueVersion < 2.4 ||
      mountingMethod.name === 'renderToString' ||
      isRunningPhantomJS,
    'handles inherit attrs',
    () => {
      if (!attrsSupported) return
      const TestComponent = {
        template: '<p :id="anAttr" />'
      }
      const wrapper = mountingMethod(TestComponent, {
        attrs: {
          anAttr: 'an attribute'
        }
      })
      expect(wrapper.vm.$attrs.anAttr).to.equal('an attribute')
      expect(wrapper.vm.$attrs.anAttr).to.equal('an attribute')
    }
  )

  itSkipIf(
    mountingMethod.name === 'renderToString' || vueVersion < 2.5,
    'defines attrs as empty object even when not passed',
    () => {
      const wrapper = mountingMethod({ template: '<p />' })
      expect(wrapper.vm.$attrs).to.deep.equal({})
    }
  )
})
