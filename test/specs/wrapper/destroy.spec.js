import { compileToFunctions } from 'vue-template-compiler'
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

  it.skip('removes element from document.body', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mountingMethod(compiled, { attachToDocument: true })
    expect(wrapper.vm.$el.parentNode).to.equal(document.body)
    wrapper.destroy()
    expect(wrapper.vm.$el.parentNode).to.be.null
  })
})
