import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithStyle from '~resources/components/component-with-style.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('hasStyle', (mountingMethod) => {
  it('returns true when element contains styles, set inline', () => {
    const compiled = compileToFunctions('<div style="color:red;"></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('div').hasStyle('color', 'red')).to.equal(true)
  })

  it('returns true when element contains styles, set in stylesheet', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mountingMethod(ComponentWithStyle)
    expect(wrapper.find('div').hasStyle('color', 'red')).to.equal(true)
  })

  it('returns true when element contains styles, set in stylesheet with multiple selectors when not attached to document', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mountingMethod(ComponentWithStyle)
    expect(wrapper.find('p').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'orange')).to.equal(false)
  })

  it('returns true when element contains styles, set in stylesheet with multiple selectors when attached to document', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mountingMethod(ComponentWithStyle, { attachToDocument: true })
    expect(wrapper.find('p').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'orange')).to.equal(false)
  })

  it('throws an error if style is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    const message = '[vue-test-utils]: wrapper.hasStyle() must be passed style as a string'
    const fn = () => wrapper.hasStyle(undefined, 'red')
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws an error if value is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    const message = '[vue-test-utils]: wrapper.hasClass() must be passed value as string'
    const fn = () => wrapper.hasStyle('color', undefined)
    expect(fn).to.throw().with.property('message', message)
  })

  it('return false when the style is a invalid prop name ', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mountingMethod(ComponentWithStyle)
    expect(wrapper.find('p').hasStyle('margin-top333', '10px')).to.equal(false)
  })
})
