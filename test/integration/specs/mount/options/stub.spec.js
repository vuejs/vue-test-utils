import mount from '~src/mount'
import ComponentWithChildComponent from '~resources/components/component-with-child-component.vue'
import Component from '~resources/components/component.vue'

describe('mount.stub', () => {
  it('replaces component with template string ', () => {
    const wrapper = mount(ComponentWithChildComponent, {
      stub: {
        ChildComponent: '<div class="stub"></div>'
      }
    })
    expect(wrapper.findAll('.stub').length).to.equal(1)
    expect(wrapper.findAll(Component).length).to.equal(1)
  })

  it('replaces component with a component', () => {
    const log = sinon.stub(console, 'log')
    const wrapper = mount(ComponentWithChildComponent, {
      stub: {
        ChildComponent: {
          render: h => h('div'),
          mounted () {
            console.log('stubbed')
          }
        }
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(1)
    expect(log.calledWith('stubbed')).to.equal(true)
    log.restore()
  })

  it('does not error if component to stub contains no components', () => {
    mount(Component, {
      stub: {
        doesNotExist: Component
      }
    })
  })

  const invalidValues = [1, null, [], {}, NaN]
  invalidValues.forEach(invalidValue => {
    it('throws an error when passed an invalid value as stub', () => {
      const error = '[vue-test-utils]: options.stub values must be passed a string or component'
      const fn = () => mount(ComponentWithChildComponent, {
        stub: {
          ChildComponent: invalidValue
        }})
      expect(fn).to.throw().with.property('message', error)
    })
  })
})
