import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('emitted', mountingMethod => {
  it('clears emitted events by event name', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    wrapper.vm.$emit('bar')
    wrapper.vm.$emit('foobar')

    expect(wrapper.emitted().foo).to.exist
    expect(wrapper.emitted().bar).to.exist
    expect(wrapper.emitted().foobar).to.exist

    expect(wrapper.emittedByOrder().length).to.eql(3)
    expect(wrapper.emittedByOrder()[0].name).to.eql('foo')
    expect(wrapper.emittedByOrder()[1].name).to.eql('bar')
    expect(wrapper.emittedByOrder()[2].name).to.eql('foobar')

    wrapper.clearEmitted('bar')

    expect(wrapper.emitted().foo).to.exist
    expect(wrapper.emitted().bar).to.be.empty
    expect(wrapper.emitted().foobar).to.exist
    expect(wrapper.emittedByOrder().length).to.eql(2)
    expect(wrapper.emittedByOrder()[1].name).to.eql('foobar')
  })

  it('clears all emitted events when no event is specified', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    wrapper.vm.$emit('bar')
    wrapper.vm.$emit('foobar')

    expect(wrapper.emitted().foo).to.exist
    expect(wrapper.emitted().bar).to.exist
    expect(wrapper.emitted().foobar).to.exist
    expect(wrapper.emittedByOrder().length).to.eql(3)

    wrapper.clearEmitted()

    expect(wrapper.emitted()).to.eql({})
    expect(wrapper.emittedByOrder().length).to.eql(0)
  })
})
