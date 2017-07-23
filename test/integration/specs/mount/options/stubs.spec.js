import mount from '~src/mount'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithNestedChildren from '~resources/components/component-with-nested-children.vue'
import Component from '~resources/components/component.vue'

describe('mount.stub', () => {
  it('replaces component with template string ', () => {
    const wrapper = mount(ComponentWithChild, {
      stubs: {
        ChildComponent: '<div class="stub"></div>'
      }
    })
    expect(wrapper.findAll('.stub').length).to.equal(1)
    expect(wrapper.findAll(Component).length).to.equal(1)
  })

  it('replaces component with a component', () => {
    const info = sinon.stub(console, 'info')
    const wrapper = mount(ComponentWithChild, {
      stubs: {
        ChildComponent: {
          render: h => h('div'),
          mounted () {
            console.info('stubbed')
          }
        }
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(1)
    expect(info.calledWith('stubbed')).to.equal(true)
    info.restore()
  })

  it('does not error if component to stub contains no components', () => {
    mount(Component, {
      stubs: {
        doesNotExist: Component
      }
    })
  })

  it('does not modify component directly', () => {
    const wrapper = mount(ComponentWithNestedChildren, {
      stubs: {
        ChildComponent: '<div />'
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(0)
    const mountedWrapper = mount(ComponentWithNestedChildren)
    expect(mountedWrapper.findAll(Component).length).to.equal(1)
  })

  it('stubs components on component if they do not already exist', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    const wrapper = mount(ComponentWithGlobalComponent, {
      stubs: {
        'registered-component': Component
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(1)
  })

  it('stubs components with dummy when passed as an array', () => {
    const warn = sinon.stub(console, 'error')
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    mount(ComponentWithGlobalComponent, {
      stubs: ['registered-component']
    })

    expect(warn.called).to.equal(false)
    warn.restore()
  })

  it('stubs components with dummy when passed a boolean', () => {
    const warn = sinon.stub(console, 'error')
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    mount(ComponentWithGlobalComponent, {
      stubs: {
        'registered-component': true
      }
    })
    expect(warn.called).to.equal(false)
    warn.restore()
  })

  it('stubs components with dummy when passed as an array', () => {
    const ComponentWithGlobalComponent = {
      render: h => h('registered-component')
    }
    const invalidValues = [{}, [], 3]
    const error = '[vue-test-utils]: each item in options.stub must be a string'
    invalidValues.forEach(invalidValue => {
      const fn = () => mount(ComponentWithGlobalComponent, {
        stubs: [invalidValue]
      })
      expect(fn).to.throw().with.property('message', error)
    })
  })

  it('throws an error when passed an invalid value as stub', () => {
    const error = '[vue-test-utils]: options.stub values must be passed a string or component'
    const invalidValues = [1, null, [], {}, NaN]
    invalidValues.forEach(invalidValue => {
      const fn = () => mount(ComponentWithChild, {
        stubs: {
          ChildComponent: invalidValue
        }})
      expect(fn).to.throw().with.property('message', error)
    })
  })
})
