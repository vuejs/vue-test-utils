import { compileToFunctions } from 'vue-template-compiler'
import Component from '~resources/components/component.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import { vueVersion, describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('html', (mountingMethod) => {
  it('returns a VueWrappers HTML as a string', () => {
    const expectedHtml = '<div></div>'
    const wrapper = mountingMethod(Component)
    expect(wrapper.html()).to.equal(expectedHtml)
  })

  it('returns a VueWrappers HTML as a string when component has no render function', () => {
    if (mountingMethod.name === 'shallow') return
    const wrapper = mountingMethod({
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
    const wrapper = mountingMethod(ComponentAsAClass)
    expect(wrapper.html()).to.equal('<div></div>')
  })

  it('returns a Wrappers HTML as a string', () => {
    const expectedHtml = '<input id="input-submit" type="submit" class="input-submit">'
    const compiled = compileToFunctions(expectedHtml)
    const wrapper = mountingMethod(compiled)
    expect(wrapper.html()).to.equal(expectedHtml)
  })
})
