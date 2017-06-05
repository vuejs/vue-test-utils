import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import ComponentWithChildComponent from '../../../resources/components/component-with-child-component.vue'
import ComponentWithoutName from '../../../resources/components/component-without-name.vue'
import Component from '../../../resources/components/component.vue'
import WrapperArray from '../../../../src/WrapperArray'

describe('findAll', () => {
  it('returns an WrapperArray of elements matching tag selector passed', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mount(compiled)
    const divs = wrapper.findAll('p')
    expect(divs).to.be.instanceOf(WrapperArray)
    expect(divs.length).to.equal(2)
  })

  it('returns an array of Wrapper of elements matching class selector passed', () => {
    const compiled = compileToFunctions('<div><div class="foo" /></div>')
    const wrapper = mount(compiled)
    const fooArr = wrapper.findAll('.foo')
    expect(fooArr).to.be.instanceOf(WrapperArray)
    expect(fooArr.length).to.equal(1)
  })

  it('returns an array of Wrapper of elements matching class selector passed if they are nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div /></transition>')
    const wrapper = mount(compiled)
    const divArr = wrapper.findAll('div')
    expect(divArr).to.be.instanceOf(WrapperArray)
    expect(divArr.length).to.equal(1)
  })

  it.skip('returns an array of Wrapper of elements matching class selector passed if they are declared inside a slot', () => {
  })

  it('returns an array of Wrappers of elements matching id selector passed', () => {
    const compiled = compileToFunctions('<div><div id="foo" /></div>')
    const wrapper = mount(compiled)
    const fooArr = wrapper.findAll('#foo')
    expect(fooArr).to.be.instanceOf(WrapperArray)
    expect(fooArr.length).to.equal(1)
  })

  it('returns an array of Wrappers of elements matching attribute selector passed', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mount(compiled)
    const hrefArr = wrapper.findAll('[href="/"]')
    expect(hrefArr).to.be.instanceOf(WrapperArray)
    expect(hrefArr.length).to.equal(1)
  })

  it('throws an error when passed an invalid DOM selector', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mount(compiled)
    const message = 'wrapper.findAll() must be passed a valid CSS selector or a Vue constructor'
    expect(() => wrapper.findAll('[href=&6"/"]')).to.throw(Error, message)
  })

  it('returns an array of Wrappers of elements matching selector when descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><li>list</li>item<li></li></ul></div>')
    const wrapper = mount(compiled)
    const liArr = wrapper.findAll('div li')
    expect(liArr).to.be.instanceOf(WrapperArray)
    expect(liArr.length).to.equal(2)
  })

  it('does not return duplicate nodes', () => {
    const compiled = compileToFunctions('<div><div><div><p/><p/></div></div></div></div>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div p').length).to.equal(2)
  })

  it('returns an array of Wrappers of elements matching selector with direct descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><ul></ul></ul></div>')
    const wrapper = mount(compiled)
    const ulArr = wrapper.findAll('div > ul')
    expect(ulArr).to.be.instanceOf(WrapperArray)
    expect(ulArr.length).to.equal(1)
  })

  it('returns an array of Wrappers of elements matching pseudo selector', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mount(compiled)
    const divs = wrapper.findAll('p:first-of-type')
    expect(divs.length).to.equal(1)
  })

  it('returns an array of VueWrappers of Vue Components matching component', () => {
    const wrapper = mount(ComponentWithChildComponent)
    const componentArr = wrapper.findAll(Component)
    expect(componentArr).to.be.instanceOf(WrapperArray)
    expect(componentArr.length).to.equal(1)
  })

  it.skip('returns correct number of Vue Wrapper when component has a v-for', () => {
  })

  it.skip('returns array of VueWrappers of Vue Components matching component if component name in parent is different to filename', () => {
  })

  it('returns an array of VueWrappers of Vue Components matching component using Wrapper as reference', () => {
    const wrapper = mount(ComponentWithChildComponent)
    const div = wrapper.findAll('span').at(0)
    const componentArr = div.findAll(Component)
    expect(componentArr).to.be.instanceOf(WrapperArray)
    expect(componentArr.length).to.equal(1)
  })

  it('throws an error if component does not have a name property', () => {
    const wrapper = mount(Component)
    const message = '.findAll() requires component to have a name property'
    expect(() => wrapper.findAll(ComponentWithoutName)).to.throw(Error, message)
  })

  it.skip('returns an empty array if no nodes matching selector are found', () => {
    const wrapper = mount(Component)
    const secondChildComponents = wrapper.findAll('pre')
    expect(secondChildComponents.length).to.equal(0)
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = mount(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.findAll() must be passed a valid CSS selector or a Vue constructor'
      expect(() => wrapper.findAll(invalidSelector)).to.throw(Error, message)
    })
  })
})
