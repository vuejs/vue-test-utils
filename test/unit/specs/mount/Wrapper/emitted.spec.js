import mount from '~src/mount'

describe('emitted', () => {
  it('captures emitted events', () => {
    const wrapper = mount({
      render: h => h('div')
    })

    wrapper.vm.$emit('foo')
    expect(wrapper.emitted().foo).to.exist
    expect(wrapper.emitted().foo.length).to.equal(1)
    expect(wrapper.emitted().foo[0]).to.eql([])

    expect(wrapper.emitted().bar).not.to.exist
    wrapper.vm.$emit('bar', 1, 2, 3)
    expect(wrapper.emitted().bar).to.exist
    expect(wrapper.emitted().bar.length).to.equal(1)
    expect(wrapper.emitted().bar[0]).to.eql([1, 2, 3])

    wrapper.vm.$emit('foo', 2, 3, 4)
    expect(wrapper.emitted().foo).to.exist
    expect(wrapper.emitted().foo.length).to.equal(2)
    expect(wrapper.emitted().foo[1]).to.eql([2, 3, 4])

    expect(wrapper.emittedByOrder()).to.eql([
      { name: 'foo', args: [] },
      { name: 'bar', args: [1, 2, 3] },
      { name: 'foo', args: [2, 3, 4] }
    ])
  })
})
