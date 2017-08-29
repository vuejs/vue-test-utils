import Vue from 'vue'
import mount from '~src/mount'
import ComponentWithInject from '~resources/components/component-with-inject.vue'

function injectNoSupported () {
  const version = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[0]}`)
  return version <= 2.2
}

describe('mount.provide', () => {
  it('provides objects which is injected by mounted component', () => {
    if (injectNoSupported()) return

    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: 'objectValue' }
    })

    expect(wrapper.text()).to.contain('objectValue')
  })

  it('provides function which is injected by mounted component', () => {
    if (injectNoSupported()) return

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
    if (injectNoSupported()) return

    const wrapper = mount(ComponentWithInject, {
      provide: { fromMount: '_' }
    })

    expect(wrapper.vm.setInBeforeCreate).to.equal('created')
  })
})
