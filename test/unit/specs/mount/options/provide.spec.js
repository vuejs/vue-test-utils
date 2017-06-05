import mount from '../../../../../src/mount'
import ComponentWithInject from '../../../../resources/components/component-with-inject.vue'

describe('provide option in mount', () => {
  it('provides value which is injected by mounted component', () => {
    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: 'providedValue' }
    })

    expect(wrapper.text()).to.contain('providedValue')
  })

  it('supports beforeCreate in component', () => {
    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: 'providedValue' }
    })

    expect(wrapper.vm.setInBeforeCreate).to.equal('created')
  })
})
