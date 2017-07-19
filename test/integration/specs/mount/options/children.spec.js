import mount from '~src/mount'

describe('mount.children', () => {
  it('mounts functional component with children when passed children array', () => {
    const Component = {
      functional: true,
      render (h, { children }) {
        return h('div', children)
      },
      name: 'common'
    }

    const context = {}
    const children = [
      'hello'
    ]

    const wrapper = mount(Component, { context, children })

    expect(wrapper.text()).to.contain('hello')
  })
})
