import mount from '~src/mount'
import ComponentWithInject from '~resources/components/component-with-inject.vue'
import { injectSupported } from '~resources/test-utils'

describe('mount.provide', () => {
  it('provides objects which is injected by mounted component', () => {
    if (!injectSupported()) return

    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: 'objectValue' }
    })

    expect(wrapper.text()).to.contain('objectValue')
  })

  it('provides function which is injected by mounted component', () => {
    if (!injectSupported()) return

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
    if (!injectSupported()) return

    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: '_' }
    })

    expect(wrapper.vm.setInBeforeCreate).to.equal('created')
  })
})
