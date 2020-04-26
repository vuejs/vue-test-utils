import { describeWithShallowAndMount } from '~resources/utils'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import { config, createLocalVue } from '@vue/test-utils'
import ComponentWithTransitions from '~resources/components/component-with-transitions.vue'

describeWithShallowAndMount('config', mountingMethod => {
  const sandbox = sinon.createSandbox()
  let configStubsSave
  let configSilentSave

  beforeEach(() => {
    configStubsSave = config.stubs
    configSilentSave = config.silent
    sandbox.stub(console, 'error').callThrough()
  })

  afterEach(() => {
    config.stubs = configStubsSave
    config.silent = configSilentSave
    config.methods = {}
    sandbox.reset()
    sandbox.restore()
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

    expect(wrapper.vm.$t).to.equal('mock value')
    expect(wrapper.text()).to.equal('mock value')

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

    expect(wrapper.vm.val()).to.equal('method')
    expect(wrapper.text()).to.equal('method')
  })

  it("doesn't throw Vue warning when silent is set to true", () => {
    config.silent = true
    const localVue = createLocalVue()
    const wrapper = mountingMethod(ComponentWithProps, {
      propsData: {
        prop1: 'example'
      },
      localVue
    })
    expect(wrapper.vm.prop1).to.equal('example')
    wrapper.setProps({
      prop1: 'new value'
    })
    expect(console.error).not.calledWith(sandbox.match('[Vue warn]'))
  })

  it('does throw Vue warning when silent is set to false', () => {
    config.silent = false
    const localVue = createLocalVue()
    const wrapper = mountingMethod(ComponentWithProps, {
      propsData: {
        prop1: 'example'
      },
      localVue
    })
    expect(wrapper.vm.prop1).to.equal('example')
    wrapper.setProps({
      prop1: 'new value'
    })
    expect(console.error).calledWith(sandbox.match('[Vue warn]'))
  })

  it('stubs out transitions by default', async () => {
    const wrapper = mountingMethod(ComponentWithTransitions)
    expect(wrapper.find('[data-testid="expanded"]').exists()).to.equal(true)
    wrapper.setData({ expanded: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="expanded"]').exists()).to.equal(false)
  })

  it('allows control deprecation warnings visibility', () => {
    config.showDeprecationWarnings = true
    const Component = {
      name: 'Foo',
      template: '<div>Foo</div>'
    }
    const wrapper = mountingMethod(Component)
    wrapper.name()
    expect(console.error).to.be.calledWith(sandbox.match('name is deprecated'))
    config.showDeprecationWarnings = false
    wrapper.name()
    expect(console.error).to.have.callCount(1)
  })
})
