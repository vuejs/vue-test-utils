import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('options.sync', (mountingMethod) => {
  it('sets watchers to sync if set to true', () => {
    const TestComponent = {
      template: '<div>{{someData}}</div>',
      data: () => ({
        someData: 'hello'
      })
    }
    const wrapper = mountingMethod(TestComponent, {
      sync: true
    })

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('world')
  })

  it('sets watchers to sync if undefined', () => {
    const TestComponent = {
      template: '<div>{{someData}}</div>',
      data: () => ({
        someData: 'hello'
      })
    }
    const wrapper = mountingMethod(TestComponent)

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('world')
  })

  it('does not set watchers to sync if set to false', (done) => {
    const TestComponent = {
      template: '<div>{{someData}}</div>',
      data: () => ({
        someData: 'hello'
      })
    }
    const wrapper = mountingMethod(TestComponent, {
      sync: false
    })

    expect(wrapper.text()).to.equal('hello')
    wrapper.vm.someData = 'world'
    expect(wrapper.text()).to.equal('hello')
    setTimeout(() => {
      expect(wrapper.text()).to.equal('world')
      done()
    })
  })
})
