import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithVShow from '~resources/components/component-with-v-show.vue'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'
import { describeWithShallowAndMount } from '~resources/utils'
import Vue from 'vue'

describeWithShallowAndMount('isVisible', mountingMethod => {
  it('returns true if element has no inline style', () => {
    const compiled = compileToFunctions(
      '<div><div><span class="visible"></span></div></div>'
    )
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).toEqual(true)
  })

  it('returns false if element has inline style display: none', () => {
    const compiled = compileToFunctions(
      '<div><div><span style="display: none;" class="visible"></span></div></div>'
    )
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).toEqual(false)
  })

  it('returns false if element has inline style visibility: hidden', () => {
    const compiled = compileToFunctions(
      '<div><div><span style="visibility: hidden;" class="visible"></span></div></div>'
    )
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).toEqual(false)
  })

  it('returns false if element has inline style opacity: 0', () => {
    const compiled = compileToFunctions(
      '<div><div><span style="opacity: 0;" class="visible"></span></div></div>'
    )
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).toEqual(false)
  })

  it('returns false if element is inside closed details tag', () => {
    const compiled = compileToFunctions(
      '<div><details><summary>Summary</summary><span class="visible"></span></details></div>'
    )
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).toEqual(false)
  })

  it('returns true if element is inside opened details tag', () => {
    const compiled = compileToFunctions(
      '<div><details open><summary>Summary</summary><span class="visible"></span></details></div>'
    )
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).toEqual(true)
  })

  it('returns false if element has hidden attribute', () => {
    const compiled = compileToFunctions(
      '<div><div><span class="visible" hidden></span></div></div>'
    )
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).toEqual(false)
  })

  it('returns true if element has v-show true', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    await Vue.nextTick()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).toEqual(false)

    const readyElement = wrapper.find('.parent.ready')
    expect(readyElement.isVisible()).toEqual(true)
  })

  it('returns false if element has v-show true', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    await Vue.nextTick()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).toEqual(false)

    const readyElement = wrapper.find('.parent.ready')
    expect(readyElement.isVisible()).toEqual(true)
  })

  it('returns true if parent element has v-show true', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    await Vue.nextTick()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).toEqual(false)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).toEqual(true)
  })

  it('returns false if parent element has v-show false', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    await Vue.nextTick()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).toEqual(false)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).toEqual(true)
  })

  it('returns false if root element has v-show false and parent has v-show true', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.vm.$set(wrapper.vm, 'rootReady', false)
    await Vue.nextTick()
    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).toEqual(false)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).toEqual(false)
  })

  it('returns false if root element has v-show true and parent has v-show false', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', false)
    wrapper.vm.$set(wrapper.vm, 'rootReady', true)
    await Vue.nextTick()
    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).toEqual(true)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).toEqual(false)
  })

  it('returns true if all elements are visible', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.vm.$set(wrapper.vm, 'rootReady', true)
    await Vue.nextTick()
    const readyChildElement = wrapper.find('.ready')

    expect(readyChildElement.isVisible()).toEqual(true)
  })

  it('returns false if one element is not visible', async () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.vm.$set(wrapper.vm, 'rootReady', true)
    await Vue.nextTick()
    const readyChildElement = wrapper.find('.ready, .not-ready')

    expect(readyChildElement.isVisible()).toEqual(false)
  })

  it('fails if one element is absent', async () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    wrapper.vm.$set(wrapper.vm, 'ready', false)
    await Vue.nextTick()

    const fn = () => wrapper.find('.child.ready').isVisible()
    expect(fn).toThrow()
  })

  it('returns true if one element is present', async () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    await Vue.nextTick()

    expect(wrapper.find('.child.ready').isVisible()).toEqual(true)
  })
})
