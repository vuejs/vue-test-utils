import {
  describeWithShallowAndMount,
  itDoNotRunIf,
  itSkipIf,
  vueVersion
} from '~resources/utils'
import { config, TransitionStub, TransitionGroupStub, createLocalVue } from '~vue/test-utils'
import Vue from 'vue'

describeWithShallowAndMount('config', (mountingMethod) => {
  let configStubsSave
  let consoleError
  let configLogSave

  beforeEach(() => {
    TransitionGroupStub.name = 'another-temp-name'
    TransitionStub.name = 'a-temp-name'
    configStubsSave = config.stubs
    configLogSave = config.logModifiedComponents
    consoleError = sinon.stub(console, 'error')
  })

  afterEach(() => {
    TransitionGroupStub.name = 'transition-group'
    TransitionStub.name = 'transition'
    config.stubs = configStubsSave
    config.logModifiedComponents = configLogSave
    consoleError.restore()
  })

  itDoNotRunIf(mountingMethod.name === 'shallowMount',
    'stubs transition and transition-group by default', () => {
      const testComponent = {
        template: `
        <div>
          <transition><p /></transition>
          <transition-group><p /><p /></transition-group>
        </div>
      `
      }
      const wrapper = mountingMethod(testComponent)
      expect(wrapper.contains(TransitionStub)).to.equal(true)
      expect(wrapper.contains(TransitionGroupStub)).to.equal(true)
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
      localVue, t
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

  it('doesn\'t stub transition when config.stubs.transition is set to false', () => {
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

  it('doesn\'t stub transition when config.stubs.transition is set to false', () => {
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

  it('doesn\'t stub transition when config.stubs is set to false', () => {
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

  it('doesn\'t stub transition when config.stubs is set to a string', () => {
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

  itSkipIf(
    vueVersion < 2.3,
    'does not log when component is extended if logModifiedComponents is false', () => {
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
    })
})
