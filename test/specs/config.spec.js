import { describeWithShallowAndMount } from '~resources/utils'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import { config, createLocalVue } from '@vue/test-utils'

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
    afterEach(() => {
      delete config.methods['val']
    })

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
})
