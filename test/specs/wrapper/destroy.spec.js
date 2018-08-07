import { describeWithShallowAndMount } from '~resources/utils'
import sinon from 'sinon'

describeWithShallowAndMount('destroy', mountingMethod => {
  it('triggers beforeDestroy ', () => {
    const spy = sinon.stub()
    mountingMethod({
      render: () => {},
      beforeDestroy () {
        spy()
      }
    }).destroy()
    expect(spy.calledOnce).to.equal(true)
  })

  it('triggers destroy ', () => {
    const spy = sinon.stub()
    mountingMethod({
      render: () => {},
      destroyed () {
        spy()
      }
    }).destroy()
    expect(spy.calledOnce).to.equal(true)
  })

  it('removes element from document.body', () => {
    const wrapper = mountingMethod({ template: '<div />' }, { attachToDocument: true })
    expect(wrapper.vm.$el.parentNode).to.equal(document.body)
    wrapper.destroy()
    expect(wrapper.vm.$el.parentNode).to.be.null
  })
})
