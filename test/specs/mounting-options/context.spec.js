import Vue from 'vue'
import { mount } from '~vue-test-utils'
import { vueVersion } from '~resources/test-utils'

describe('context', () => {
  it('mounts functional component when passed context object', () => {
    if (vueVersion <= 2.2) {
      console.log('WARN: no current way to test functional component is component in v2.1.x')
      return
    }

    const Component = {
      functional: true,
      render (h, { props }) {
        return h('div')
      },
      name: 'common'
    }
    const context = {
      data: { hello: true },
      props: { show: true }
    }

    const wrapper = mount(Component, { context })
    expect(wrapper.is(Component)).to.equal(true)
  })

  it('throws error if non functional component is passed with context option', () => {
    const Component = {
      render: h => h('div')
    }
    const context = {}
    const message = '[vue-test-utils]: mount.context can only be used when mounting a functional component'
    const fn = () => mount(Component, { context })
    expect(fn).to.throw().with.property('message', message)
  })

  it('does not throw error if functional component with Vue.extend', () => {
    const Component = Vue.extend({
      functional: true,
      render: h => h('div')
    })
    const context = {}
    const fn = () => mount(Component, { context })
    expect(fn).not.to.throw()
  })

  it('throws error if context option is not an object', () => {
    const Component = {
      functional: true,
      render: h => h('div')
    }
    const context = 'string'
    const message = '[vue-test-utils]: mount.context must be an object'
    const fn = () => mount(Component, { context })
    expect(fn).to.throw().with.property('message', message)
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
    const wrapper = mount(Component)
    expect(wrapper.element.textContent).to.equal(defaultValue)
  })

  it('mounts functional component with a defined context.children text', () => {
    const Component = {
      functional: true,
      render: (h, { children }) => {
        return h('div', children)
      }
    }
    const wrapper = mount(Component, {
      context: {
        children: ['render text']
      }
    })
    expect(wrapper.text()).to.equal('render text')
  })

  it('mounts functional component with a defined context.children element', () => {
    const Component = {
      functional: true,
      render: (h, { children }) => {
        return h('div', children)
      }
    }
    const wrapper = mount(Component, {
      context: {
        children: [h => h('div', 'render component')]
      }
    })
    expect(wrapper.text()).to.equal('render component')
  })
})
