import mount from '../../../../../src/mount'
import ComponentWithInject from '../../../../resources/components/component-with-inject.vue'

describe('provide option in mount', () => {
  it('provides objects which is injected by mounted component', () => {
    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: 'objectValue' }
    })

    expect(wrapper.text()).to.contain('objectValue')
  })

  it('provides function which is injected by mounted component', () => {
    const wrapper = mount(ComponentWithInject, {
      provide () {
        return {
          fromMount: 'functionValue'
        }
      }
    })

    expect(wrapper.text()).to.contain('functionValue')
  })

  it('supports beforeCreate in component', () => {
    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: '_' }
    })

    expect(wrapper.vm.setInBeforeCreate).to.equal('created')
  })
})
