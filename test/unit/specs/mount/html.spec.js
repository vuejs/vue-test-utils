import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import Component from '../../../resources/components/component.vue'

describe('html', () => {
  it('returns a VueWrappers HTML as a string', () => {
    const expectedHtml = '<div></div>'
    const wrapper = mount(Component)
    expect(wrapper.html()).to.equal(expectedHtml)
  })

  it('returns a Wrappers HTML as a string', () => {
    const expectedHtml = '<input id="input-submit" type="submit" class="input-submit">'
    const compiled = compileToFunctions(expectedHtml)
    const wrapper = mount(compiled)
    expect(wrapper.html()).to.equal(expectedHtml)
  })
})
