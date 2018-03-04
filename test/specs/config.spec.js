import {
  mount,
  config,
  TransitionStub,
  TransitionGroupStub
} from '~vue/test-utils'

describe('config', () => {
  beforeEach(() => {
    TransitionGroupStub.name = 'another-temp-name'
    TransitionStub.name = 'a-temp-name'
  })

  afterEach(() => {
    TransitionGroupStub.name = 'transition-group'
    TransitionStub.name = 'transition'
  })

  it('stubs transition and transition-group by default', () => {
    const testComponent = {
      template: `
        <div>
          <transition><p /></transition>
          <transition-group><p /><p /></transition-group>
        </div>
      `
    }
    const wrapper = mount(testComponent)
    expect(wrapper.contains(TransitionStub)).to.equal(true)
    expect(wrapper.contains(TransitionGroupStub)).to.equal(true)
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
    const wrapper = mount(testComponent)
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
    const wrapper = mount(testComponent)
    expect(wrapper.contains(TransitionGroupStub)).to.equal(false)
  })

  it('doesn\'t stub transition when config.stubs is set to false', () => {
    const configStubsSave = config.stubs
    config.stubs = false
    const testComponent = {
      template: `
        <div>
          <transition-group><p /><p /></transition-group>
        </div>
      `
    }
    const wrapper = mount(testComponent)
    expect(wrapper.contains(TransitionGroupStub)).to.equal(false)
    expect(wrapper.contains(TransitionStub)).to.equal(false)
    config.stubs = configStubsSave
  })

  it('doesn\'t stub transition when config.stubs is set to a string', () => {
    const configStubsSave = config.stubs
    config.stubs = 'a string'
    const testComponent = {
      template: `
        <div>
          <transition-group><p /><p /></transition-group>
        </div>
      `
    }
    const wrapper = mount(testComponent)
    expect(wrapper.contains(TransitionGroupStub)).to.equal(false)
    expect(wrapper.contains(TransitionStub)).to.equal(false)
    config.stubs = configStubsSave
  })
})
