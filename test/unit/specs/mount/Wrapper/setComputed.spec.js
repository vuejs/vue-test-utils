import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithComputed from '~resources/components/component-with-computed.vue'

describe('setComputed', () => {
  it('sets component computed props and updates when called on Vue instance', () => {
    const wrapper = mount(ComponentWithComputed)
    expect(wrapper.text()).to.contain('message')
    wrapper.setComputed({ reversedMessage: 'custom' })
    expect(wrapper.text()).to.contain('custom')
  })

  it('throws an error if computed watcher does not exist', () => {
    const message = 'wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property noExist does not exist on the Vue instance'
    const wrapper = mount(ComponentWithComputed)
    expect(() => wrapper.setComputed({ noExist: '' })).throw(Error, message)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setComputed() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mount(compiled)
    const p = wrapper.find('p')
    expect(() => p.setComputed({ ready: true })).throw(Error, message)
  })
})
