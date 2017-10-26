import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import sinon from 'sinon'

describe('destroy', () => {
  it('should trigger beforeDestroy ', () => {
    const spy = sinon.stub()
    mount({
      render: null,
      beforeDestroy () {
        spy()
      }
    }).destroy()
    expect(spy.calledOnce).to.equal(true)
  })

  it('should trigger destroy ', () => {
    const spy = sinon.stub()
    mount({
      render: null,
      destroyed () {
        spy()
      }
    }).destroy()
    expect(spy.calledOnce).to.equal(true)
  })

  it('should remove element from document.body', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mount(compiled, { attachToDocument: true })
    expect(wrapper.vm.$el.parentNode).to.equal(document.body)
    wrapper.destroy()
    expect(wrapper.vm.$el.parentNode).to.be.null
  })
})
