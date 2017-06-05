import mount from '../../../../../src/mount'
import ComponentWithInject from '../../../../resources/components/component-with-inject.vue'

describe('supports provide mount option', () => {
  it('works', () => {
    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: 'providedValue' }
    })

    expect(wrapper.text()).to.contain('providedValue')
  })
})
