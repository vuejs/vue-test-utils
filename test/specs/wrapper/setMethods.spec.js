import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithMethods from '~resources/components/component-with-methods.vue'
import ComponentWithEvents from '~resources/components/component-with-events.vue'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('setMethods', mountingMethod => {
  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const wrapper = mountingMethod(ComponentWithMethods)
    const someMethod = () => {}
    wrapper.setMethods({ someMethod })
    expect(wrapper.vm.someMethod).toEqual(someMethod)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setMethods() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setMethods({ ready: true })).toThrow(Error, message)
  })

  itDoNotRunIf(
    vueVersion < 2.2,
    'should replace methods when tied to an event',
    () => {
      const wrapper = mountingMethod(ComponentWithEvents)
      expect(wrapper.vm.isActive).toBe(false)
      wrapper.find('.toggle').trigger('click')
      expect(wrapper.vm.isActive).toBe(true)
      // Replace the toggle function so that the data supposedly won't change
      const toggleActive = () => {}
      wrapper.setMethods({ toggleActive })
      wrapper.find('.toggle').trigger('click')
      expect(wrapper.vm.isActive).toBe(true)
    }
  )
})
