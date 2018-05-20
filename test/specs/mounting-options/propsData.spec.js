import { shallowMount } from '~vue/test-utils'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import { describeRunIf } from 'conditional-specs'

const baseData = {
  prop1: ['', '']
}

describeRunIf(process.env.TEST_ENV !== 'node',
  'propsData', () => {
    let wrapper

    beforeEach(() => {
      wrapper = shallowMount(ComponentWithProps, {
        propsData: baseData
      })
    })

    afterEach(() => {
      wrapper = null
    })

    describe('should not modify propsData between tests', () => {
      it('should have the correct props after modifying', () => {
        expect(wrapper.vm.prop1).to.have.length(2)
        wrapper.setProps({ prop1: [] })
        expect(wrapper.vm.prop1).to.have.length(0)
      })

      it('should have the default props despite being modified in the previous test', () => {
        expect(wrapper.vm.prop1).to.have.length(2)
      })
    })
  })
