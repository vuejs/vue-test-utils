import mount from '~src/mount'
import TransitionStub from '~src/components/TransitionStub'
import TransitionGroupStub from '~src/components/TransitionGroupStub'
import config from '~src/config'

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
})
