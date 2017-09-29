import mount from '~src/mount'

describe('emittedByOrder', () => {
  it('captures emitted events in order', () => {
    const wrapper = mount({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    wrapper.vm.$emit('bar', 1, 2, 3)
    wrapper.vm.$emit('foo', 2, 3, 4)
    expect(wrapper.emittedByOrder()).to.eql([
      { name: 'foo', args: [] },
      { name: 'bar', args: [1, 2, 3] },
      { name: 'foo', args: [2, 3, 4] }
    ])
  })

  it('throws error when called on non VueWrapper', () => {
    const wrapper = mount({
      template: '<div><p /></div>'
    })
    const message = '[vue-test-utils]: wrapper.emittedByOrder() can only be called on a Vue instance'

    const fn = () => wrapper.find('p').emittedByOrder()
    expect(fn).to.throw().with.property('message', message)
  })
})
