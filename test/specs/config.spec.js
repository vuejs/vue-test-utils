import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import { itDoNotRunIf, itSkipIf } from 'conditional-specs'
import {
  config,
  TransitionStub,
  TransitionGroupStub,
  createLocalVue
} from '~vue/test-utils'
import Vue from 'vue'

describeWithShallowAndMount('config', mountingMethod => {
  let configStubsSave, consoleError, configLogSave, configSilentSave

  beforeEach(() => {
    configStubsSave = config.stubs
    configLogSave = config.logModifiedComponents
    configSilentSave = config.silent
    consoleError = sinon.stub(console, 'error')
  })

  afterEach(() => {
    config.stubs = configStubsSave
    config.logModifiedComponents = configLogSave
    config.silent = configSilentSave
    consoleError.restore()
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

  it("doesn't stub transition when config.stubs.transition is set to false", () => {
    const testComponent = {
      template: `
        <div>
          <transition><p /></transition>
        </div>
      `
    }
    config.stubs.transition = false
    const wrapper = mountingMethod(testComponent)
    expect(wrapper.contains(TransitionStub)).to.equal(false)
  })

  it("doesn't stub transition when config.stubs.transition is set to false", () => {
    const testComponent = {
      template: `
        <div>
          <transition-group><p /><p /></transition-group>
        </div>
      `
    }
    config.stubs['transition-group'] = false
    const wrapper = mountingMethod(testComponent)
    expect(wrapper.contains(TransitionGroupStub)).to.equal(false)
  })

  it("doesn't stub transition when config.stubs is set to false", () => {
    config.stubs = false
    const testComponent = {
      template: `
        <div>
          <transition-group><p /><p /></transition-group>
        </div>
      `
    }
    const wrapper = mountingMethod(testComponent)
    expect(wrapper.contains(TransitionGroupStub)).to.equal(false)
    expect(wrapper.contains(TransitionStub)).to.equal(false)
  })

  it("doesn't stub transition when config.stubs is set to a string", () => {
    config.stubs = 'a string'
    const testComponent = {
      template: `
        <div>
          <transition-group><p /><p /></transition-group>
        </div>
      `
    }
    const wrapper = mountingMethod(testComponent)
    expect(wrapper.contains(TransitionGroupStub)).to.equal(false)
    expect(wrapper.contains(TransitionStub)).to.equal(false)
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
    expect(consoleError.called).to.equal(false)
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
    expect(consoleError.called).to.equal(true)
  })

  itSkipIf(
    vueVersion < 2.3,
    'does not log when component is extended if logModifiedComponents is false',
    () => {
      const ChildComponent = Vue.extend({
        template: '<span />'
      })
      const TestComponent = {
        template: '<child-component />',
        components: {
          ChildComponent
        }
      }
      config.logModifiedComponents = false
      mountingMethod(TestComponent)
      expect(consoleError.called).to.equal(false)
    }
  )
})
