import mount from '~src/mount'

describe('mount.clone', () => {
  it('uses a cloned component to augment if set to true', () => {
    const TestComponent = {
      render: h => h('div')
    }
    mount(TestComponent, {
      stubs: {
        test: ('<div />')
      },
      clone: true
    })
    expect(typeof TestComponent.components).to.equal('undefined')
  })

  it('is set to true by default', () => {
    const TestComponent = {
      render: h => h('div')
    }
    mount(TestComponent, {
      stubs: {
        test: ('<div />')
      }
    })
    expect(typeof TestComponent.components).to.equal('undefined')
  })

  it('does not clone component if set to false', () => {
    const TestComponent = {
      render: h => h('div')
    }
    mount(TestComponent, {
      stubs: {
        test: ('<div />')
      },
      clone: false
    })
    expect(typeof TestComponent.components.test).to.equal('object')
  })
})
