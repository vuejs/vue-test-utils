import Vue from 'vue'
import { vueVersion } from '~resources/utils'
import { describeWithShallowAndMount } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('options.context', mountingMethod => {
  itDoNotRunIf(
    vueVersion <= 2.2,
    'mounts functional component when passed context object',
    () => {
      const Component = {
        functional: true,
        render(h, { props }) {
          return h('div')
        },
        name: 'common'
      }
      const context = {
        data: { hello: true },
        props: { show: true }
      }

      mountingMethod(Component, { context })
    }
  )

  it('throws error if non functional component is passed with context option', () => {
    const Component = {
      render: h => h('div')
    }
    const context = {}
    const message =
      '[vue-test-utils]: mount.context can only be used when mounting a functional component'
    const fn = () => mountingMethod(Component, { context })
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('does not throw error if functional component with Vue.extend', () => {
    const Component = Vue.extend({
      functional: true,
      render: h => h('div')
    })
    const context = {}
    const fn = () =>
      mountingMethod(Component, { context, stubs: false, mocks: false })
    expect(fn).not.to.throw()
  })

  it('throws error if context option is not an object', () => {
    const Component = {
      functional: true,
      render: h => h('div')
    }
    const context = 'string'
    const message = '[vue-test-utils]: mount.context must be an object'
    const fn = () => mountingMethod(Component, { context })
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('mounts functional component with a defined context when no context object passed in options', () => {
    const defaultValue = '[vue-test-utils]: testProp default value'
    const Component = {
      functional: true,
      props: {
        testProp: {
          type: String,
          default: defaultValue
        }
      },
      render: (h, { props }) => h('div', props.testProp)
    }
    const wrapper = mountingMethod(Component)
    expect(wrapper.html()).to.contain(defaultValue)
  })

  it('mounts functional component with a defined context.children text', () => {
    const Component = {
      functional: true,
      render: (h, { children }) => {
        return h('div', children)
      }
    }
    const wrapper = mountingMethod(Component, {
      context: {
        children: ['render text']
      }
    })
    expect(wrapper.html()).to.contain('render text')
  })

  it('mounts functional component with a defined context.children element', () => {
    const Component = {
      functional: true,
      render: (h, { children }) => {
        return h('div', children)
      }
    }
    const wrapper = mountingMethod(Component, {
      context: {
        children: [h => h('div', 'render component')]
      }
    })
    expect(wrapper.html()).to.contain('render component')
  })
})
