import { compileToFunctions } from 'vue-template-compiler'
import shallow from '~src/shallow'
import ShallowWrapper from '~src/ShallowWrapper'
import ErrorWrapper from '~src/ErrorWrapper'
import Component from '../../../../resources/components/component.vue'
import ComponentWithSlots from '../../../../resources/components/component-with-slots.vue'
import ComponentWithChildComponent from '../../../../resources/components/component-with-child-component.vue'
import ComponentWithVFor from '../../../../resources/components/component-with-v-for.vue'
import ComponentWithoutName from '../../../../resources/components/component-without-name.vue'

describe('find', () => {
  it('returns an array of Wrappers of elements matching tag selector passed', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('p')).to.be.instanceOf(ShallowWrapper)
  })

  it('returns Wrapper of elements matching class selector passed', () => {
    const compiled = compileToFunctions('<div><div class="foo" /></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('.foo')).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns Wrapper matching class selector passed if nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div /></transition>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('div')).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns an array of Wrapper of elements matching class selector passed if they are declared inside a slot', () => {
    const wrapper = shallow(ComponentWithSlots, {
      slots: {
        default: '<div class="foo"></div>'
      }
    })
    expect(wrapper.find('.foo')).to.be.instanceOf(ShallowWrapper)
  })

  it('returns Wrapper of elements matching id selector passed', () => {
    const compiled = compileToFunctions('<div><div id="foo" /></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('#foo')).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns Wrapper of elements matching attribute selector passed', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('[href="/"]')).to.be.instanceOf(ShallowWrapper)
  })

  it('throws an error when passed an invalid DOM selector', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = shallow(compiled)
    const message = 'wrapper.find() must be passed a valid CSS selector or a Vue constructor'
    expect(() => wrapper.find('[href=&6"/"]')).to.throw(Error, message)
  })

  it.skip('returns Wrapper of elements matching selector when descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><li>list</li>item<li></li></ul></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('div li')).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns Wrapper of elements matching selector with direct descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><ul></ul></ul></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('div > ul')).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns Wrapper of elements matching pseudo selector', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.find('p:first-of-type')).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns Wrapper of Vue Components matching component', () => {
    const wrapper = shallow(ComponentWithChildComponent)
    expect(wrapper.find(Component)).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns correct number of Vue Wrapper when component has a v-for', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = shallow(ComponentWithVFor, { propsData: { items }})
    expect(wrapper.find(Component)).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns array of VueWrappers of Vue Components matching component if component name in parent is different to filename', () => {
        // same test as above, but good to be explicit
    const wrapper = shallow(ComponentWithChildComponent)
    const div = wrapper.find('span')
    expect(div.find(Component)).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('returns Wrapper of Vue Component matching component using Wrapper as reference', () => {
    const wrapper = shallow(ComponentWithChildComponent)
    const div = wrapper.find('span')
    expect(div.find(Component)).to.be.instanceOf(ShallowWrapper)
  })

  it.skip('throws error if component does not have a name property', () => {
    const wrapper = shallow(Component)
    const message = '.find() requires component to have a name property'
    expect(() => wrapper.find(ComponentWithoutName)).to.throw(Error, message)
  })

  it('returns empty Wrapper with error if no nodes are found', () => {
    const wrapper = shallow(Component)
    const selector = 'pre'
    const error = wrapper.find(selector)
    expect(error).to.be.instanceOf(ErrorWrapper)
    expect(error.selector).to.equal(selector)
  })

  it.skip('returns ErrorWrapper if no nodes are found when passed a component', () => {
    const wrapper = shallow(Component)
    const error = wrapper.find(Component)
    expect(error).to.be.instanceOf(ErrorWrapper)
    expect(error.selector).to.equal('Component')
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = shallow(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.find() must be passed a valid CSS selector or a Vue constructor'
      expect(() => wrapper.find(invalidSelector)).to.throw(Error, message)
    })
  })
})
