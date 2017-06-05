import mount from '../../../../../src/mount'
import ComponentWithInject from '../../../../resources/components/component-with-inject.vue'

describe('provide option in mount', () => {
  const wrapper = mount(ComponentWithInject, {
    provide: { fromMount: 'providedValue' }
  })

  it('provides value which is injected by mounted component', () => {
    expect(wrapper.text()).to.contain('providedValue')
  })

  it('supports beforeCreate in component', () => {
    expect(wrapper.vm.setByOriginalBeforeCreate).to.toEqual('created')
  })
})
