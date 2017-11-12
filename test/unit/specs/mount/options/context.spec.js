import Vue from 'vue'
import mount from '~src/mount'

function cannotIdentifyComponent () {
  const version = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)
  return version <= 2.2
}

describe('context', () => {
  it('mounts functional component when passed context object', () => {
    if (cannotIdentifyComponent()) {
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

  it('mounts functional component with a defined context.children', () => {
    const Component = {
      functional: true,
      render: (h, { children }) => {
        return h('div', children)
      }
    }
    const wrapper = mount(Component, {
      context: {
        children: ['hello']
      }
    })
    expect(wrapper.text()).to.equal('hello')
  })
})
