import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import ComponentWithStyle from '../../../resources/components/component-with-style.vue'

describe('hasStyle', () => {
  it('returns true when element contains styles, set inline', () => {
    const compiled = compileToFunctions('<div style="color:red;"></div>')
    const wrapper = mount(compiled)
    expect(wrapper.hasStyle('color', 'red')).to.equal(true)
  })

  it('returns true when element contains styles, set in stylesheet', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    console.log(navigator.userAgent.includes('jsdom'))
    const wrapper = mount(ComponentWithStyle)
    expect(wrapper.hasStyle('color', 'red')).to.equal(true)
  })

  it('returns true when element contains styles, set in stylesheet with multiple selectors when not attached to document', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mount(ComponentWithStyle)
    expect(wrapper.find('p').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'orange')).to.equal(false)
  })

  it('returns true when element contains styles, set in stylesheet with multiple selectors when attached to document', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mount(ComponentWithStyle, { attachToDocument: true })
    expect(wrapper.find('p').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.find('span').hasStyle('color', 'orange')).to.equal(false)
  })

  it('throws an error if style is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const message = 'wrapper.hasStyle() must be passed style as a string'
    expect(() => wrapper.hasStyle(undefined, 'red')).to.throw(Error, message)
  })

  it('throws an error if value is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const message = 'wrapper.hasClass() must be passed value as string'
    expect(() => wrapper.hasStyle('color', undefined)).to.throw(Error, message)
  })
})
