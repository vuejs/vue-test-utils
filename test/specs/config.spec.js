import { describeWithShallowAndMount } from '~resources/utils'
import Component from '~resources/components/component.vue'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import { itDoNotRunIf } from 'conditional-specs'
import { config, createLocalVue } from '~vue/test-utils'

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

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'stubs transition and transition-group by default',
    () => {
      const testComponent = {
        template: `
        <div>
          <transition><p /></transition>
          <transition-group><span /><p /></transition-group>
        </div>
      `
      }
      const wrapper = mountingMethod(testComponent)
      expect(wrapper.contains('p')).to.equal(true)
      expect(wrapper.contains('span')).to.equal(true)
    }
  )

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

  describe('autoDestroy', () => {
    it('does not destroy wrapper when autoDestroy is set to false', () => {
      config.autoDestroy = false
      const localVue = createLocalVue()
      const wrapper = mountingMethod(Component, { localVue })
      sandbox.spy(wrapper, 'destroy')

      mountingMethod(Component, { localVue })

      expect(wrapper.destroy).not.called
    })

    it('destroys wrapper when autoDestroy is set to true', () => {
      config.autoDestroy = true
      const localVue = createLocalVue()
      const wrapper = mountingMethod(Component, { localVue })
      sandbox.spy(wrapper, 'destroy')

      mountingMethod(Component, { localVue })

      expect(wrapper.destroy).called
    })

    it('destroys wrapper when autoDestroy hook is called', () => {
      let destroyCallback
      config.autoDestroy = callback => {
        destroyCallback = callback
      }
      const localVue = createLocalVue()
      const wrapper = mountingMethod(Component, { localVue })
      sandbox.spy(wrapper, 'destroy')

      mountingMethod(Component, { localVue })

      expect(wrapper.destroy).not.called
      destroyCallback()
      expect(wrapper.destroy).called
    })
  })
})
