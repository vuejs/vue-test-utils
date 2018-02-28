import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'
import sinon from 'sinon'

describeWithShallowAndMount('destroy', (mountingMethod) => {
  it('should trigger beforeDestroy ', () => {
    const spy = sinon.stub()
    mountingMethod({
      render: null,
      beforeDestroy () {
        spy()
      }
    }).destroy()
    expect(spy.calledOnce).to.equal(true)
  })

  it('should trigger destroy ', () => {
    const spy = sinon.stub()
    mountingMethod({
      render: null,
      destroyed () {
        spy()
      }
    }).destroy()
    expect(spy.calledOnce).to.equal(true)
  })

  it('should remove element from document.body', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mountingMethod(compiled, { attachToDocument: true })
    expect(wrapper.vm.$el.parentNode).to.equal(document.body)
    wrapper.destroy()
    expect(wrapper.vm.$el.parentNode).to.be.null
  })
})
