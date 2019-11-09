import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('options.parentComponent', mountingMethod => {
  it('mounts component with $parent set to options.parentComponent', () => {
    const Parent = {
      data: () => ({
        customName: 'Parent Name'
      })
    }
    const TestComponent = {
      template: '<div>{{$parent.customName}}</div>'
    }
    const wrapper = mountingMethod(TestComponent, {
      parentComponent: Parent
    })
    expect(wrapper.html()).to.contain('Parent Name')
  })

  it('validates parentComponent option', () => {
    ;['str', 123, [], () => {}].forEach(invalidParent => {
      const TestComponent = {
        template: '<div>{{$parent.customName}}</div>'
      }
      const fn = () =>
        mountingMethod(TestComponent, {
          parentComponent: invalidParent
        })
      const message =
        '[vue-test-utils]: options.parentComponent should be a valid Vue component options object'
      expect(fn)
        .to.throw()
        .with.property('message', message)
    })
  })
})
