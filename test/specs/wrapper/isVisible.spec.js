import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithVShow from '~resources/components/component-with-v-show.vue'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('isVisible', (mountingMethod) => {
  it('returns true if element has no inline style', () => {
    const compiled = compileToFunctions('<div><div><span class="visible"></span></div></div>')
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).to.equal(true)
  })

  it('returns false if element has inline style display: none', () => {
    const compiled = compileToFunctions('<div><div><span style="display: none;" class="visible"></span></div></div>')
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).to.equal(false)
  })

  it('returns false if element has inline style visibility: hidden', () => {
    const compiled = compileToFunctions('<div><div><span style="visibility: hidden;" class="visible"></span></div></div>')
    const wrapper = mountingMethod(compiled)
    const element = wrapper.find('.visible')
    expect(element.isVisible()).to.equal(false)
  })

  it('returns true if element has v-show true', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).to.equal(false)

    const readyElement = wrapper.find('.parent.ready')
    expect(readyElement.isVisible()).to.equal(true)
  })

  it('returns false if element has v-show true', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).to.equal(false)

    const readyElement = wrapper.find('.parent.ready')
    expect(readyElement.isVisible()).to.equal(true)
  })

  it('returns true if parent element has v-show true', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).to.equal(false)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).to.equal(true)
  })

  it('returns false if parent element has v-show false', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).to.equal(false)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).to.equal(true)
  })

  it('returns false if root element has v-show false and parent has v-show true', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.vm.$set(wrapper.vm, 'rootReady', false)
    wrapper.update()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).to.equal(false)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).to.equal(false)
  })

  it('returns false if root element has v-show true and parent has v-show false', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', false)
    wrapper.vm.$set(wrapper.vm, 'rootReady', true)
    wrapper.update()

    const notReadyElement = wrapper.find('.not-ready')
    expect(notReadyElement.isVisible()).to.equal(true)

    const readyChildElement = wrapper.find('.child.ready')
    expect(readyChildElement.isVisible()).to.equal(false)
  })

  it('returns true if all elements are visible', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.vm.$set(wrapper.vm, 'rootReady', true)
    wrapper.update()

    const readyChildElement = wrapper.find('.ready')
    expect(readyChildElement.isVisible()).to.equal(true)
  })

  it('returns false if one element is not visible', () => {
    const wrapper = mountingMethod(ComponentWithVShow)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.vm.$set(wrapper.vm, 'rootReady', true)
    wrapper.update()

    const readyChildElement = wrapper.find('.ready, .not-ready')
    expect(readyChildElement.isVisible()).to.equal(false)
  })

  it('fails if one element is absent', () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    wrapper.vm.$set(wrapper.vm, 'ready', false)
    wrapper.update()

    const fn = () => wrapper.find('.child.ready').isVisible()
    expect(fn).to.throw()
  })

  it('returns true if one element is present', () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()
    expect(wrapper.find('.child.ready').isVisible()).to.equal(true)
  })
})
