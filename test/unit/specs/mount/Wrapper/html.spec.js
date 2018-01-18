import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue-test-utils'
import Component from '~resources/components/component.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import { vueVersion } from '~resources/test-utils'

describe('html', () => {
  it('returns a VueWrappers HTML as a string', () => {
    const expectedHtml = '<div></div>'
    const wrapper = mount(Component)
    expect(wrapper.html()).to.equal(expectedHtml)
  })

  it('returns a VueWrappers HTML as a string when component has no render function', () => {
    const wrapper = mount({
      template: `<div>1<tester></tester></div>`,
      components: {
        tester: {
          template: `<div class="tester">test</div>`
        }
      }
    })
    const expectedHtml = '<div>1<div class="tester">test</div></div>'
    wrapper.update()
    expect(wrapper.html()).to.equal(expectedHtml)
  })

  it('handles class component', () => {
    if (vueVersion < 2.3) {
      return
    }
    const wrapper = mount(ComponentAsAClass)
    expect(wrapper.html()).to.equal('<div></div>')
  })

  it('returns a Wrappers HTML as a string', () => {
    const expectedHtml = '<input id="input-submit" type="submit" class="input-submit">'
    const compiled = compileToFunctions(expectedHtml)
    const wrapper = mount(compiled)
    expect(wrapper.html()).to.equal(expectedHtml)
  })
})
