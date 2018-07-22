import { describeWithMountingMethods } from '~resources/utils'

describeWithMountingMethods('options.parent', mountingMethod => {
  it('mounts component with $parent set to options.parent', () => {
    const Parent = {
      data: () => ({
        customName: 'Parent Name'
      })
    }
    const TestComponent = {
      template: '<div>{{$parent.customName}}</div>'
    }
    const wrapper = mountingMethod(TestComponent, {
      parent: Parent
    })
    expect(wrapper.html()).to.contain('Parent Name')
  })

  it('validates parent option', () => {
    ;['str', 123, [], () => {}].forEach(invalidParent => {
      const TestComponent = {
        template: '<div>{{$parent.customName}}</div>'
      }
      const fn = () => mountingMethod(TestComponent, {
        parent: invalidParent
      })
      const message = '[vue-test-utils]: options.parent should be a valid Vue component options object'
      expect(fn).to.throw()
        .with.property('message', message)
    })
  })
})
