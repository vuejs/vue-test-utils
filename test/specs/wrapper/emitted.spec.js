import { createLocalVue, createWrapper } from 'packages/test-utils/src'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'
import Vue from 'vue'

describeWithShallowAndMount('emitted', mountingMethod => {
  it('captures emitted events with a different api', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    expect(wrapper.emitted('foo')).toBeTruthy()
    expect(wrapper.emitted('foo').length).toEqual(1)
    expect(wrapper.emitted('foo')[0]).toEqual([])

    expect(wrapper.emitted('bar')).toBeFalsy()
    wrapper.vm.$emit('bar', 1, 2, 3)
    expect(wrapper.emitted('bar')).toBeTruthy()
    expect(wrapper.emitted('bar').length).toEqual(1)
    expect(wrapper.emitted('bar')[0]).toEqual([1, 2, 3])

    wrapper.vm.$emit('foo', 2, 3, 4)
    expect(wrapper.emitted('foo')).toBeTruthy()
    expect(wrapper.emitted('foo').length).toEqual(2)
    expect(wrapper.emitted('foo')[1]).toEqual([2, 3, 4])
  })

  it('captures emitted events', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    expect(wrapper.emitted().foo).toBeTruthy()
    expect(wrapper.emitted().foo.length).toEqual(1)
    expect(wrapper.emitted().foo[0]).toEqual([])

    expect(wrapper.emitted().bar).toBeFalsy()
    wrapper.vm.$emit('bar', 1, 2, 3)
    expect(wrapper.emitted().bar).toBeTruthy()
    expect(wrapper.emitted().bar.length).toEqual(1)
    expect(wrapper.emitted().bar[0]).toEqual([1, 2, 3])

    wrapper.vm.$emit('foo', 2, 3, 4)
    expect(wrapper.emitted().foo).toBeTruthy()
    expect(wrapper.emitted().foo.length).toEqual(2)
    expect(wrapper.emitted().foo[1]).toEqual([2, 3, 4])
  })

  it('throws error when called on non VueWrapper', () => {
    const wrapper = mountingMethod({
      template: '<div><p /></div>'
    })
    const message =
      '[vue-test-utils]: wrapper.emitted() can only be called on a Vue instance'

    const fn = () => wrapper.find('p').emitted()
    expect(fn).toThrow(message)
  })

  it('captures all events thrown after beforeCreate lifecycle hook', () => {
    const wrapper = mountingMethod({
      beforeCreate() {
        this.$emit('foo')
      },
      mounted() {
        this.$emit('bar', 1, 2)
      },
      render: () => {}
    })

    expect(wrapper.emitted().foo).toEqual([[]])
    expect(wrapper.emitted().bar).toEqual([[1, 2]])
  })

  it('captures only events from its component without side effects on localVue', () => {
    const localVue = createLocalVue()

    const wrapper1 = mountingMethod(
      {
        render: () => {},
        beforeCreate() {
          this.$emit('foo')
        }
      },
      { localVue }
    )

    const wrapper2 = mountingMethod(
      {
        render: () => {},
        mounted() {
          this.$emit('bar')
        }
      },
      { localVue }
    )

    expect(wrapper1.emitted().foo).toEqual([[]])
    expect(wrapper1.emitted().bar).toEqual(undefined)
    expect(wrapper2.emitted().foo).toEqual(undefined)
    expect(wrapper2.emitted().bar).toEqual([[]])
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount' || vueVersion < 2.3,
    'works correctly on nested extended components',
    () => {
      const GrandChildComponent = Vue.extend({
        template: '<div />',
        name: 'bar',
        beforeCreate() {
          this.$emit('foo')
        }
      })
      const ChildComponent = {
        template: '<grand-child-component />',
        components: {
          GrandChildComponent
        }
      }
      const wrapper = mountingMethod({
        template: '<child-component />',
        components: {
          ChildComponent
        }
      })

      expect(wrapper.find({ name: 'bar' }).emitted('foo')).toBeTruthy()
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount' || vueVersion < 2.3,
    'works correctly on nested extended components inside extended component',
    () => {
      const GrandChildComponent = Vue.extend({
        template: '<div />',
        name: 'bar',
        beforeCreate() {
          this.$emit('foo')
        }
      })
      const ChildComponent = Vue.extend({
        template: '<grand-child-component />',
        name: 'child',
        components: {
          GrandChildComponent
        }
      })
      const wrapper = mountingMethod({
        template: '<child-component />',
        name: 'parent',
        components: {
          ChildComponent
        }
      })

      expect(wrapper.find({ name: 'bar' }).emitted('foo')).toBeTruthy()
    }
  )

  it('captures emitted events on $root instance', () => {
    const wrapper = mountingMethod({
      render: h => h('div')
    })

    wrapper.vm.$root.$emit('foo')
    const rootWrapper = createWrapper(wrapper.vm.$root)
    expect(rootWrapper.emitted('foo')).toBeTruthy()
  })
})
