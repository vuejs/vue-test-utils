import { compileToFunctions } from 'vue-template-compiler'
import { attrsSupported } from '~resources/utils'
import {
  describeWithMountingMethods,
  itSkipIf
} from '~resources/utils'

describeWithMountingMethods('options.attrs', (mountingMethod) => {
  itSkipIf(mountingMethod.name === 'renderToString',
    'handles inherit attrs', () => {
      if (!attrsSupported()) return
      const wrapper = mountingMethod(compileToFunctions('<p :id="anAttr" />'), {
        attrs: {
          anAttr: 'an attribute'
        }
      })
      expect(wrapper.vm.$attrs.anAttr).to.equal('an attribute')
      wrapper.update()
      expect(wrapper.vm.$attrs.anAttr).to.equal('an attribute')
    })

  itSkipIf(mountingMethod.name === 'renderToString',
    'defines attrs as empty object even when not passed', () => {
      const wrapper = mountingMethod(compileToFunctions('<p />'))
      expect(wrapper.vm.$attrs).to.deep.equal({})
    })
})
