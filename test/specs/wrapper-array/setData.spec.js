import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'
import { describeWithShallowAndMount } from '~resources/utils'
import Vue from 'vue'

describeWithShallowAndMount('setData', mountingMethod => {
  it('sets component data and updates nested vm nodes', async () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    const componentArr = wrapper.findAll(ComponentWithVIf)
    expect(componentArr.at(0).findAll('.child.ready').length).toEqual(0)
    componentArr.setData({ ready: true })
    await Vue.nextTick()
    expect(componentArr.at(0).findAll('.child.ready').length).toEqual(1)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message =
      '[vue-test-utils]: wrapper.setData() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const fn = () => wrapper.findAll('p').setData({ ready: true })
    expect(fn).toThrow(message)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: setData cannot be called on 0 items'
    const fn = () =>
      mountingMethod(compiled)
        .findAll('p')
        .setData('p')
    expect(fn).toThrow(message)
  })
})
