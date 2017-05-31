import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import ComponentWithChildComponent from '../../../resources/components/component-with-child-component.vue'
import ComponentWithoutName from '../../../resources/components/component-without-name.vue'
import Component from '../../../resources/components/component.vue'

describe('find', () => {
  it('returns an array of Wrappers of elements matching tag selector passed', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mount(compiled)
    const divs = wrapper.find('p')
    expect(divs.length).to.equal(2)
  })

  it('returns an array of Wrapper of elements matching class selector passed', () => {
    const compiled = compileToFunctions('<div><div class="foo" /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.find('.foo').length).to.equal(1)
  })

  it('returns an array of Wrapper of elements matching class selector passed if they are nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div /></transition>')
    const wrapper = mount(compiled)
    const children = wrapper.find('div')
    expect(children.length).to.equal(1)
  })

  it.skip('returns an array of Wrapper of elements matching class selector passed if they are declared inside a slot', () => {
  })

  it('returns an array of Wrappers of elements matching id selector passed', () => {
    const compiled = compileToFunctions('<div><div id="foo" /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.find('#foo').length).to.equal(1)
  })

  it('returns an array of Wrappers of elements matching attribute selector passed', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mount(compiled)
    expect(wrapper.find('[href="/"]').length).to.equal(1)
  })

  it('throws an error when passed an invalid DOM selector', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mount(compiled)
    const message = 'wrapper.find() must be passed a valid CSS selector or a Vue constructor'
    expect(() => wrapper.find('[href=&6"/"]')).to.throw(Error, message)
  })

  it('returns an array of Wrappers of elements matching selector when descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><li>list</li>item<li></li></ul></div>')
    const wrapper = mount(compiled)
    const divs = wrapper.find('div li')
    expect(divs.length).to.equal(2)
  })

  it('does not return duplicate nodes', () => {
    const compiled = compileToFunctions('<div><div><div><p/><p/></div></div></div></div>')
    const wrapper = mount(compiled)
    const divs = wrapper.find('div p')
    expect(divs.length).to.equal(2)
  })

  it('returns an array of Wrappers of elements matching selector with direct descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><ul></ul></ul></div>')
    const wrapper = mount(compiled)
    const divs = wrapper.find('div > ul')
    expect(divs.length).to.equal(1)
  })

  it('returns an array of Wrappers of elements matching pseudo selector', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mount(compiled)
    const divs = wrapper.find('p:first-of-type')
    expect(divs.length).to.equal(1)
  })

  it('returns an array of VueWrappers of Vue Components matching component', () => {
    const wrapper = mount(ComponentWithChildComponent)
    expect(wrapper.find(Component).length).to.equal(1)
  })

  it.skip('returns correct number of Vue Wrapper when component has a v-for', () => {
  })

  it.skip('returns array of VueWrappers of Vue Components matching component if component name in parent is different to filename', () => {
  })

  it('returns an array of VueWrappers of Vue Components matching component using Wrapper as reference', () => {
    const wrapper = mount(ComponentWithChildComponent)
    const div = wrapper.find('span')[0]
    const secondChildComponents = div.find(Component)
    expect(secondChildComponents.length).to.equal(1)
  })

  it('throws an error if component does not have a name property', () => {
    const wrapper = mount(Component)
    const message = '.find() requires component to have a name property'
    expect(() => wrapper.find(ComponentWithoutName)).to.throw(Error, message)
  })

  it('returns an empty array if no nodes matching selector are found', () => {
    const wrapper = mount(Component)
    const secondChildComponents = wrapper.find('pre')
    expect(secondChildComponents.length).to.equal(0)
  })

  it('throws an error if selector is not a valid avoriaz selector', () => {
    const wrapper = mount(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.find() must be passed a valid CSS selector or a Vue constructor'
      expect(() => wrapper.find(invalidSelector)).to.throw(Error, message)
    })
  })
})
