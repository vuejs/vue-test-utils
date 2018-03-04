import Vue from 'vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('emittedByOrder', (mountingMethod) => {
  it('captures emitted events in order', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    wrapper.vm.$emit('bar', 1, 2, 3)
    wrapper.vm.$emit('foo', 2, 3, 4)

    if (Vue.version === '2.0.8') {
      expect(wrapper.emittedByOrder()).to.eql([
        { name: 'hook:beforeCreate', args: [] },
        { name: 'hook:created', args: [] },
        { name: 'hook:beforeMount', args: [] },
        { name: 'hook:mounted', args: [] },
        { name: 'foo', args: [] },
        { name: 'bar', args: [1, 2, 3] },
        { name: 'foo', args: [2, 3, 4] }
      ])
    } else {
      expect(wrapper.emittedByOrder()).to.eql([
        { name: 'foo', args: [] },
        { name: 'bar', args: [1, 2, 3] },
        { name: 'foo', args: [2, 3, 4] }
      ])
    }
  })

  it('throws error when called on non VueWrapper', () => {
    const wrapper = mountingMethod({
      template: '<div><p /></div>'
    })
    const message = '[vue-test-utils]: wrapper.emittedByOrder() can only be called on a Vue instance'

    const fn = () => wrapper.find('p').emittedByOrder()
    expect(fn).to.throw().with.property('message', message)
  })

  it('captures in lifecycle hooks emitted events in order', () => {
    const wrapper = mountingMethod({
      render: h => h('div'),
      beforeCreate: function () {
        this.$emit('foo')
      },
      created: function () {
        this.$emit('bar', 1, 2, 3)
      },
      mounted: function () {
        this.$emit('foo', 2, 3, 4)
      }
    })

    if (Vue.version === '2.0.8') {
      expect(wrapper.emittedByOrder()).to.eql([
        { name: 'foo', args: [] },
        { name: 'hook:beforeCreate', args: [] },
        { name: 'bar', args: [1, 2, 3] },
        { name: 'hook:created', args: [] },
        { name: 'hook:beforeMount', args: [] },
        { name: 'foo', args: [2, 3, 4] },
        { name: 'hook:mounted', args: [] }
      ])
    } else {
      expect(wrapper.emittedByOrder()).to.eql([
        { name: 'foo', args: [] },
        { name: 'bar', args: [1, 2, 3] },
        { name: 'foo', args: [2, 3, 4] }
      ])
    }
  })
})
