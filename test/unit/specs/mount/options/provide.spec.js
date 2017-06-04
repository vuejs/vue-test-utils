import mount from '../../../../src/mount'
import ComponentWrappingInjected from '../../../resources/components/provide-inject/component-wrapping-injected.vue'

describe('provide mount option', () => {
  it('Supports passing provide as option', () => {
    const injectSpy = sinon.stub()
    mount(ComponentWrappingInjected, {
      propsData: { handleInject: injectSpy },
      provide: { fromMount: 'providedValue' }
    })

    expect(injectSpy.withArgs('providedValue').calledOnce).to.equal(true)
  })
})
