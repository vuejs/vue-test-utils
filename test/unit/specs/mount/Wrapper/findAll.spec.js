import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithoutName from '~resources/components/component-without-name.vue'
import ComponentWithSlots from '~resources/components/component-with-slots.vue'
import ComponentWithVFor from '~resources/components/component-with-v-for.vue'
import Component from '~resources/components/component.vue'
import WrapperArray from '~src/wrappers/wrapper-array'

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

  it('returns an array of Wrapper of elements matching class selector passed if they are declared inside a slot', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        default: '<div class="foo"><div class="foo"></div></div>'
      }
    })
    const fooArr = wrapper.findAll('.foo')
    expect(fooArr).to.be.instanceOf(WrapperArray)
    expect(fooArr.length).to.equal(2)
  })

  it('returns an array of Wrapper of elements matching class selector passed if they are declared inside a functional component', () => {
    const Component = {
      functional: true,
      render (h) {
        return h('p', {}, [
          h('p', {
            'class': {
              foo: true
            }
          }),
          h('p')
        ])
      },
      name: 'common'
    }

    const wrapper = mount(Component)
    expect(wrapper.findAll('p').length).to.equal(3)
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
    const message = '[vue-test-utils]: wrapper.findAll() must be passed a valid CSS selector, Vue constructor, or valid find option object'
    const fn = () => wrapper.findAll('[href=&6"/"]')
    expect(fn).to.throw().with.property('message', message)
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
    const wrapper = mount(ComponentWithChild)
    const componentArr = wrapper.findAll(Component)
    expect(componentArr).to.be.instanceOf(WrapperArray)
    expect(componentArr.length).to.equal(1)
  })

  it('returns correct number of Vue Wrapper when component has a v-for', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = mount(ComponentWithVFor, { propsData: { items }})
    const componentArray = wrapper.findAll(Component)
    expect(componentArray).to.be.instanceOf(WrapperArray)
    expect(componentArray.length).to.equal(items.length)
  })

  it('returns array of VueWrappers of Vue Components matching component if component name in parent is different to filename', () => {
    const wrapper = mount(ComponentWithChild)
    const div = wrapper.findAll('span').at(0)
    const componentArr = div.findAll(Component)
    expect(componentArr).to.be.instanceOf(WrapperArray)
    expect(componentArr.length).to.equal(1)
  })

  it('returns an array of VueWrappers of Vue Components matching component using Wrapper as reference', () => {
    // same test as above, but good to be explicit
    const wrapper = mount(ComponentWithChild)
    const div = wrapper.findAll('span').at(0)
    const componentArr = div.findAll(Component)
    expect(componentArr).to.be.instanceOf(WrapperArray)
    expect(componentArr.length).to.equal(1)
  })

  it('throws an error if component does not have a name property', () => {
    const wrapper = mount(Component)
    const message = '[vue-test-utils]: .findAll() requires component to have a name property'
    expect(() => wrapper.findAll(ComponentWithoutName)).to.throw().with.property('message', message)
  })

  it('returns VueWrapper with length 0 if no nodes matching selector are found', () => {
    const wrapper = mount(Component)
    const preArray = wrapper.findAll('pre')
    expect(preArray.length).to.equal(0)
    expect(preArray.wrappers).to.deep.equal([])
  })

  it('returns an array of Wrapper of elements matching the ref in options object', () => {
    const compiled = compileToFunctions('<div><div ref="foo" /></div>')
    const wrapper = mount(compiled)
    const fooArr = wrapper.findAll({ ref: 'foo' })
    expect(fooArr).to.be.instanceOf(WrapperArray)
    expect(fooArr.length).to.equal(1)
  })

  it('throws an error when ref selector is called on a wrapper that is not a Vue component', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mount(compiled)
    const a = wrapper.find('a')
    const message = '[vue-test-utils]: $ref selectors can only be used on Vue component wrappers'
    const fn = () => a.findAll({ ref: 'foo' })
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns an array of Wrapper of elements matching the ref in options object if they are nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div ref="foo" /></transition>')
    const wrapper = mount(compiled)
    const divArr = wrapper.findAll({ ref: 'foo' })
    expect(divArr).to.be.instanceOf(WrapperArray)
    expect(divArr.length).to.equal(1)
  })

  it('returns correct number of Vue Wrapper when component has a v-for and matches the ref in options object', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = mount(ComponentWithVFor, { propsData: { items }})
    const componentArray = wrapper.findAll({ ref: 'item' })
    expect(componentArray).to.be.instanceOf(WrapperArray)
    expect(componentArray.length).to.equal(items.length)
  })

  it('returns VueWrapper with length 0 if no nodes matching the ref in options object are found', () => {
    const wrapper = mount(Component)
    const preArray = wrapper.findAll({ ref: 'foo' })
    expect(preArray.length).to.equal(0)
    expect(preArray.wrappers).to.deep.equal([])
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = mount(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, { ref: 'foo', nope: true }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.findAll() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      const fn = () => wrapper.findAll(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
