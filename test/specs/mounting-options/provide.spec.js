import ComponentWithInject from '~resources/components/component-with-inject.vue'
import { injectSupported } from '~resources/utils'
import {
  describeWithMountingMethods,
  itDoNotRunIf
} from '~resources/utils'

describeWithMountingMethods('options.provide', (mountingMethod) => {
  itDoNotRunIf(!injectSupported(),
    'provides objects which is injected by mounted component', () => {
      if (!injectSupported()) return

      const wrapper = mountingMethod(ComponentWithInject, {
        provide: { fromMount: 'objectValue' }
      })
      const HTML = mountingMethod.name === 'renderToString'
        ? wrapper
        : wrapper.html()
      expect(HTML).to.contain('objectValue')
    })

  itDoNotRunIf(!injectSupported(),
    'provides function which is injected by mounted component', () => {
      const wrapper = mountingMethod(ComponentWithInject, {
        provide () {
          return {
            fromMount: 'functionValue'
          }
        }
      })
      const HTML = mountingMethod.name === 'renderToString'
        ? wrapper
        : wrapper.html()
      expect(HTML).to.contain('functionValue')
    })

  itDoNotRunIf(!injectSupported() || mountingMethod.name === 'renderToString',
    'supports beforeCreate in component', () => {
      if (!injectSupported()) return

      const wrapper = mountingMethod(ComponentWithInject, {
        provide: { fromMount: '_' }
      })

      expect(wrapper.vm.setInBeforeCreate).to.equal('created')
    })
})
