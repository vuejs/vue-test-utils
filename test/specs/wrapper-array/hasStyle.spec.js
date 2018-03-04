import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'
import ComponentWithStyle from '~resources/components/component-with-style.vue'

describe('hasStyle', () => {
  it('returns true if every item contains styles, set inline', () => {
    const compiled = compileToFunctions('<span><div style="color:red;"></div></span>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div').hasStyle('color', 'red')).to.equal(true)
  })

  it('returns true if every item contains style, set in stylesheet', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mount(ComponentWithStyle)
    expect(wrapper.findAll('div').hasStyle('color', 'red')).to.equal(true)
  })

  it('returns true if every item contains styles, set in stylesheet with multiple selectors when not attached to document', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mount(ComponentWithStyle)
    expect(wrapper.findAll('p').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.findAll('span').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.findAll('span').hasStyle('color', 'orange')).to.equal(false)
  })

  it('returns true if every item contains styles, set in stylesheet with multiple selectors when attached to document', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('jsdom')) {
      return
    }
    const wrapper = mount(ComponentWithStyle, { attachToDocument: true })
    expect(wrapper.findAll('p').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.findAll('span').hasStyle('color', 'red')).to.equal(true)
    expect(wrapper.findAll('span').hasStyle('color', 'orange')).to.equal(false)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: hasStyle cannot be called on 0 items'
    const fn = () => mount(compiled).findAll('p').hasStyle('p')
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if style is not a string', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    const message = '[vue-test-utils]: wrapper.hasStyle() must be passed style as a string'
    const fn = () => wrapper.findAll('div').hasStyle(undefined, 'red')
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if value is not a string', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    const message = '[vue-test-utils]: wrapper.hasClass() must be passed value as string'
    const fn = () => wrapper.findAll('div').hasStyle('color', undefined)
    expect(fn).to.throw().with.property('message', message)
  })
})
