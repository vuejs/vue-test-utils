import { describeWithShallowAndMount } from '~resources/utils'
import { config, createLocalVue } from 'packages/test-utils/src'
import ComponentWithTransitions from '~resources/components/component-with-transitions.vue'

describeWithShallowAndMount('config', mountingMethod => {
  let configStubsSave
  let consoleErrorSave

  beforeEach(() => {
    configStubsSave = config.stubs
    consoleErrorSave = console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    config.stubs = configStubsSave
    config.methods = {}
    config.deprecationWarningHandler = null
    console.error = consoleErrorSave
  })

  it('mocks a global variable', () => {
    const localVue = createLocalVue()
    const t = 'real value'
    localVue.prototype.$t = t

    const testComponent = {
      template: `
        <div>{{ $t }}</div>
      `
    }

    config.mocks['$t'] = 'mock value'

    const wrapper = mountingMethod(testComponent, {
      localVue,
      t
    })

    expect(wrapper.vm.$t).toEqual('mock value')
    expect(wrapper.text()).toEqual('mock value')

    localVue.prototype.$t = undefined
  })

  it('overrides a method', () => {
    const testComponent = {
      template: `
        <div>{{ val() }}</div>
      `
    }

    config.methods['val'] = () => 'method'

    const wrapper = mountingMethod(testComponent)

    expect(wrapper.vm.val()).toEqual('method')
    expect(wrapper.text()).toEqual('method')
  })

  it('stubs out transitions by default', async () => {
    const wrapper = mountingMethod(ComponentWithTransitions)
    expect(wrapper.find('[data-testid="expanded"]').exists()).toEqual(true)
    wrapper.setData({ expanded: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="expanded"]').exists()).toEqual(false)
  })

  it('invokes custom deprecation warning handler if specified in config', () => {
    config.showDeprecationWarnings = true
    config.deprecationWarningHandler = jest.fn()

    const TestComponent = { template: `<div>Test</div>` }
    mountingMethod(TestComponent, { attachToDocument: true })

    expect(config.deprecationWarningHandler).toHaveBeenCalledTimes(1)
    expect(console.error).not.toHaveBeenCalled()
  })

  it('allows control deprecation warnings visibility for name method', () => {
    config.showDeprecationWarnings = true
    const Component = {
      name: 'Foo',
      template: '<div>Foo</div>'
    }
    const wrapper = mountingMethod(Component)
    wrapper.name()
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/name is deprecated/)
    )
    config.showDeprecationWarnings = false
    wrapper.name()
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  describe('attachToDocument deprecation warning', () => {
    const Component = {
      name: 'Foo',
      template: '<div>Foo</div>'
    }

    it('should show warning if config is enabled', () => {
      config.showDeprecationWarnings = true

      mountingMethod(Component, {
        attachToDocument: true
      })

      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/attachToDocument is deprecated/)
      )
    })

    it('should not show warning if config is disabled', () => {
      config.showDeprecationWarnings = false

      mountingMethod(Component, {
        attachToDocument: true
      })

      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringMatching(/attachToDocument is deprecated/)
      )
    })
  })

  describe('methods overriding deprecation warning', () => {
    const expectedErrorMessage = `There is no clear migration path`
    const Component = {
      template: '<div></div>',
      methods: {
        foo() {}
      }
    }

    it('should show warning for options.methods if config is enabled', () => {
      config.showDeprecationWarnings = true

      mountingMethod(Component, {
        methods: { foo: () => {} }
      })

      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(expectedErrorMessage)
      )
    })

    it('should not show warning for options.methods if config is disabled', () => {
      config.showDeprecationWarnings = false

      mountingMethod(Component, {
        methods: { foo: () => {} }
      })

      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringMatching(expectedErrorMessage)
      )
    })

    it('should show warning for setMethods if config is enabled', () => {
      config.showDeprecationWarnings = true

      mountingMethod(Component).setMethods({ foo: () => {} })

      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(expectedErrorMessage)
      )
    })

    it('should not show warning for setMethods if config is disabled', () => {
      config.showDeprecationWarnings = false

      mountingMethod(Component).setMethods({ foo: () => {} })

      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringMatching(expectedErrorMessage)
      )
    })
  })
})
