import { createLocalVue } from '~vue/test-utils'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('emitted', (mountingMethod) => {
  it('captures emitted events with a different api', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    expect(wrapper.emitted('foo')).to.exist
    expect(wrapper.emitted('foo').length).to.equal(1)
    expect(wrapper.emitted('foo')[0]).to.eql([])

    expect(wrapper.emitted('bar')).not.to.exist
    wrapper.vm.$emit('bar', 1, 2, 3)
    expect(wrapper.emitted('bar')).to.exist
    expect(wrapper.emitted('bar').length).to.equal(1)
    expect(wrapper.emitted('bar')[0]).to.eql([1, 2, 3])

    wrapper.vm.$emit('foo', 2, 3, 4)
    expect(wrapper.emitted('foo')).to.exist
    expect(wrapper.emitted('foo').length).to.equal(2)
    expect(wrapper.emitted('foo')[1]).to.eql([2, 3, 4])
  })

  it('captures emitted events', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    expect(wrapper.emitted().foo).to.exist
    expect(wrapper.emitted().foo.length).to.equal(1)
    expect(wrapper.emitted().foo[0]).to.eql([])

    expect(wrapper.emitted().bar).not.to.exist
    wrapper.vm.$emit('bar', 1, 2, 3)
    expect(wrapper.emitted().bar).to.exist
    expect(wrapper.emitted().bar.length).to.equal(1)
    expect(wrapper.emitted().bar[0]).to.eql([1, 2, 3])

    wrapper.vm.$emit('foo', 2, 3, 4)
    expect(wrapper.emitted().foo).to.exist
    expect(wrapper.emitted().foo.length).to.equal(2)
    expect(wrapper.emitted().foo[1]).to.eql([2, 3, 4])
  })

  it('throws error when called on non VueWrapper', () => {
    const wrapper = mountingMethod({
      template: '<div><p /></div>'
    })
    const message = '[vue-test-utils]: wrapper.emitted() can only be called on a Vue instance'

    const fn = () => wrapper.find('p').emitted()
    expect(fn).to.throw().with.property('message', message)
  })

  it('captures all events thrown after beforeCreate lifecycle hook', () => {
    const wrapper = mountingMethod({
      beforeCreate () {
        this.$emit('foo')
      },
      mounted () {
        this.$emit('bar', 1, 2)
      }
    })

    expect(wrapper.emitted().foo).to.eql([[]])
    expect(wrapper.emitted().bar).to.eql([[1, 2]])
  })

  it('captures only events from its component without side effects on localVue', () => {
    const localVue = createLocalVue()

    const wrapper1 = mountingMethod({
      beforeCreate () {
        this.$emit('foo')
      }
    }, { localVue })

    const wrapper2 = mountingMethod({
      mounted () {
        this.$emit('bar')
      }
    }, { localVue })

    expect(wrapper1.emitted().foo).to.eql([[]])
    expect(wrapper1.emitted().bar).to.eql(undefined)
    expect(wrapper2.emitted().foo).to.eql(undefined)
    expect(wrapper2.emitted().bar).to.eql([[]])
  })
})
