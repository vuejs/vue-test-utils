import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithMethods from '~resources/components/component-with-methods.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setMethods', (mountingMethod) => {
  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const wrapper = mountingMethod(ComponentWithMethods)
    const someMethod = () => console.log('hey')
    wrapper.setMethods({ someMethod })
    expect(wrapper.vm.someMethod).to.equal(someMethod)
  })

  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const wrapper = mountingMethod(ComponentWithMethods)
    const someMethod = () => console.log('hey')
    wrapper.setMethods({ someMethod })
    wrapper.update()
    expect(wrapper.vm.someMethod).to.equal(someMethod)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setMethods() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setMethods({ ready: true })).throw(Error, message)
  })
})
