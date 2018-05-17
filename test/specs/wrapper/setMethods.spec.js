import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithMethods from '~resources/components/component-with-methods.vue'
import ComponentWithEvents from '~resources/components/component-with-events.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setMethods', (mountingMethod) => {
  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const wrapper = mountingMethod(ComponentWithMethods)
    const someMethod = () => console.log('hey')
    wrapper.setMethods({ someMethod })
    expect(wrapper.vm.someMethod).to.equal(someMethod)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setMethods() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setMethods({ ready: true })).throw(Error, message)
  })

  it('should replace methods when tied to an event', () => {
    const wrapper = mountingMethod(ComponentWithEvents)
    expect(wrapper.vm.isActive).to.be.false
    wrapper.find('.toggle').trigger('click')
    expect(wrapper.vm.isActive).to.be.true
    // Replace the toggle function so that the data supposedly won't change
    const toggleActive = () => console.log('overriden')
    wrapper.setMethods({ toggleActive })
    wrapper.find('.toggle').trigger('click')
    expect(wrapper.vm.isActive).to.be.true
  })
})
