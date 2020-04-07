import { config } from '@vue/test-utils'
import { createLocalVue } from '@vue/test-utils'
import ComponentWithInject from '~resources/components/component-with-inject.vue'
import CompositionComponentWithInject from '~resources/components/component-with-inject-composition.vue'
import { injectSupported } from '~resources/utils'
import { describeWithShallowAndMount } from '~resources/utils'
import { itDoNotRunIf, itSkipIf } from 'conditional-specs'
import VueCompositionApi from '@vue/composition-api'

describeWithShallowAndMount('options.provide', mountingMethod => {
  let configProvideSave

  beforeEach(() => {
    configProvideSave = config.provide
    config.provide = {}
  })

  afterEach(() => {
    config.provide = configProvideSave
  })

  itDoNotRunIf(
    !injectSupported,
    'provides objects which is injected by mounted component',
    () => {
      if (!injectSupported) return

      const wrapper = mountingMethod(ComponentWithInject, {
        provide: { fromMount: 'objectValue' }
      })
      expect(wrapper.html()).to.contain('objectValue')
    }
  )

  itDoNotRunIf(
    !injectSupported,
    'respects provide fooues from parentComponent',
    () => {
      const parentComponent = {
        provide: {
          foo: 'from parent'
        }
      }

      const child = {
        inject: ['foo', 'foo2'],
        template: '<div></div>'
      }

      const wrapper = mountingMethod(child, {
        parentComponent,
        provide: {
          foo2: 'from config'
        }
      })

      expect(wrapper.vm.foo).to.equal('from parent')
      expect(wrapper.vm.foo2).to.equal('from config')
    }
  )

  itDoNotRunIf(
    !injectSupported,
    'respects provide function from parentComponent',
    () => {
      const parentComponent = {
        provide() {
          return { foo: 'from parent' }
        }
      }

      const child = {
        inject: ['foo', 'foo2'],
        template: '<div></div>'
      }

      const wrapper = mountingMethod(child, {
        parentComponent,
        provide: {
          foo2: 'from config'
        }
      })

      expect(wrapper.vm.foo).to.equal('from parent')
      expect(wrapper.vm.foo2).to.equal('from config')
    }
  )

  itDoNotRunIf(
    !injectSupported,
    'prioritize mounting options over parentComponent provide',
    () => {
      const parentComponent = {
        provide() {
          return { foo: 'from parent' }
        }
      }

      const child = {
        inject: ['foo'],
        template: '<div></div>'
      }

      const wrapper = mountingMethod(child, {
        parentComponent,
        provide: {
          foo: 'from config'
        }
      })

      expect(wrapper.vm.foo).to.equal('from config')
    }
  )

  itDoNotRunIf(
    !injectSupported,
    'provides function which is injected by mounted component',
    () => {
      const wrapper = mountingMethod(ComponentWithInject, {
        provide() {
          return {
            fromMount: 'functionValue'
          }
        }
      })
      expect(wrapper.html()).to.contain('functionValue')
    }
  )

  itDoNotRunIf(
    !injectSupported || mountingMethod.name === 'renderToString',
    'supports beforeCreate in component',
    () => {
      if (!injectSupported) return

      const wrapper = mountingMethod(ComponentWithInject, {
        provide: { fromMount: '_' }
      })

      expect(wrapper.vm.setInBeforeCreate).to.equal('created')
    }
  )

  itDoNotRunIf(
    !injectSupported || mountingMethod.name === 'renderToString',
    'supports setup in composition api component',
    () => {
      if (!injectSupported) return

      const localVue = createLocalVue()
      localVue.use(VueCompositionApi)
      const wrapper = mountingMethod(CompositionComponentWithInject, {
        provide: { fromMount: '_' },
        localVue
      })

      expect(wrapper.vm.setInSetup).to.equal('created')
    }
  )

  itSkipIf(
    mountingMethod.name === 'renderToString',
    'injects the provide from the config',
    () => {
      if (!injectSupported) {
        return
      }
      config.provide['fromMount'] = 'globalConfig'

      const wrapper = mountingMethod(ComponentWithInject)
      expect(wrapper.html()).to.contain('globalConfig')
    }
  )

  itDoNotRunIf(
    !injectSupported,
    'prioritize mounting options over config',
    () => {
      config.provide['fromMount'] = 'globalConfig'

      const wrapper = mountingMethod(ComponentWithInject, {
        provide: { fromMount: '_' }
      })

      expect(wrapper.html()).to.contain('_')
    }
  )

  itDoNotRunIf(
    !injectSupported,
    'injects in a composition api component',
    () => {
      const localVue = createLocalVue()
      localVue.use(VueCompositionApi)
      const wrapper = mountingMethod(CompositionComponentWithInject, {
        provide: { fromMount: '_' },
        localVue
      })

      expect(wrapper.html()).to.contain('_')
    }
  )

  it('config with function throws', () => {
    config.provide = () => {}

    expect(() => {
      mountingMethod(ComponentWithInject, {
        provide: { fromMount: '_' }
      })
    }).to.throw()
  })
})
