import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithoutName from '~resources/components/component-without-name.vue'
import ComponentWithSlots from '~resources/components/component-with-slots.vue'
import ComponentWithVFor from '~resources/components/component-with-v-for.vue'
import Component from '~resources/components/component.vue'
import FunctionalComponent from '~resources/components/functional-component.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import {
  functionalSFCsSupported,
  describeWithShallowAndMount
} from '~resources/utils'

describeWithShallowAndMount('findAll', (mountingMethod) => {
  it('returns an WrapperArray of elements matching tag selector passed', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const divs = wrapper.findAll('p')
    expect(divs.length).to.equal(2)
  })

  it('returns an array of Wrapper of elements matching class selector passed', () => {
    const compiled = compileToFunctions('<div><div class="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    const fooArr = wrapper.findAll('.foo')
    expect(fooArr.length).to.equal(1)
  })

  it('returns an array of Wrapper of elements matching class selector passed if they are nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div /></transition>')
    const wrapper = mountingMethod(compiled)
    const divArr = wrapper.findAll('div')
    expect(divArr.length).to.equal(1)
  })

  it('returns an array of Wrapper of elements matching class selector passed if they are declared inside a slot', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        default: '<div class="foo"><div class="foo"></div></div>'
      }
    })
    const fooArr = wrapper.findAll('.foo')
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

    const wrapper = mountingMethod(Component)
    expect(wrapper.findAll('p').length).to.equal(3)
  })

  it('works correctly with innerHTML', () => {
    const TestComponent = {
      render (createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg></svg>'
          }
        })
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.findAll('svg').length).to.equal(1)
  })

  it('returns an array of Wrappers of elements matching id selector passed', () => {
    const compiled = compileToFunctions('<div><div id="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    const fooArr = wrapper.findAll('#foo')
    expect(fooArr.length).to.equal(1)
  })

  it('returns an array of Wrappers of elements matching attribute selector passed', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const hrefArr = wrapper.findAll('[href="/"]')
    expect(hrefArr.length).to.equal(1)
  })

  it('throws an error when passed an invalid DOM selector', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const message = '[vue-test-utils]: wrapper.findAll() must be passed a valid CSS selector, Vue constructor, or valid find option object'
    const fn = () => wrapper.findAll('[href=&6"/"]')
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns an array of Wrappers of elements matching selector when descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><li>list</li>item<li></li></ul></div>')
    const wrapper = mountingMethod(compiled)
    const liArr = wrapper.findAll('div li')
    expect(liArr.length).to.equal(2)
  })

  it('does not return duplicate nodes', () => {
    const compiled = compileToFunctions('<div><div><div><p/><p/></div></div></div></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.findAll('div p').length).to.equal(2)
  })

  it('returns an array of Wrappers of elements matching selector with direct descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><ul></ul></ul></div>')
    const wrapper = mountingMethod(compiled)
    const ulArr = wrapper.findAll('div > ul')
    expect(ulArr.length).to.equal(1)
  })

  it('returns an array of Wrappers of elements matching pseudo selector', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const divs = wrapper.findAll('p:first-of-type')
    expect(divs.length).to.equal(1)
  })

  it('returns an array of VueWrappers of Vue Components matching component', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const componentArr = wrapper.findAll(Component)
    expect(componentArr.length).to.equal(1)
  })

  it('returns correct number of Vue Wrapper when component has a v-for', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = mountingMethod(ComponentWithVFor, { propsData: { items }})
    const componentArray = wrapper.findAll(Component)
    expect(componentArray.length).to.equal(items.length)
  })

  it('returns array of VueWrappers of Vue Components matching component if component name in parent is different to filename', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const div = wrapper.findAll('span').at(0)
    const componentArr = div.findAll(Component)
    expect(componentArr.length).to.equal(1)
  })

  it('returns an array of VueWrappers of Vue Components matching component using Wrapper as reference', () => {
    // same test as above, but good to be explicit
    const wrapper = mountingMethod(ComponentWithChild)
    const div = wrapper.findAll('span').at(0)
    const componentArr = div.findAll(Component)
    expect(componentArr.length).to.equal(1)
  })

  it('only returns Vue components that exists as children of Wrapper', () => {
    const AComponent = {
      render: () => {},
      name: 'a-component'
    }
    const TestComponent = {
      template: `
        <div>
          <span>
            <a-component />
          </span>
          <a-component />
        </div>
      `,
      components: {
        'a-component': AComponent
      }
    }
    const wrapper = mountingMethod(TestComponent)
    const span = wrapper.find('span')
    expect(span.findAll(AComponent).length).to.equal(1)
  })

  it('returns matching Vue components that have no name property', () => {
    const TestComponent = {
      template: `
        <div>
          <component-without-name />
          <component-without-name />
          <component-without-name />
        </div>
      `,
      components: {
        ComponentWithoutName
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.findAll(ComponentWithoutName).length).to.equal(3)
  })

  it('returns Wrapper of class component', () => {
    const TestComponent = {
      template: `
        <div>
          <component-as-a-class />
        </div>
      `,
      components: {
        ComponentAsAClass
      }
    }

    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.findAll(ComponentAsAClass).length).to.equal(1)
  })

  it('returns Wrapper of Vue Component matching functional component', () => {
    if (!functionalSFCsSupported()) {
      return
    }
    const TestComponent = {
      template: `
        <div>
          <functional-component />
        </div>
      `,
      components: {
        FunctionalComponent
      }
    }

    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.findAll(FunctionalComponent).length).to.equal(1)
  })

  it('returns VueWrapper with length 0 if no nodes matching selector are found', () => {
    const wrapper = mountingMethod(Component)
    const preArray = wrapper.findAll('pre')
    expect(preArray.length).to.equal(0)
    expect(preArray.wrappers).to.deep.equal([])
  })

  it('returns an array of Wrapper of elements matching a component name in options object', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const wrapperArray = wrapper.findAll({ name: 'component' })
    expect(wrapperArray.at(0).name()).to.equal('component')
    expect(wrapperArray.length).to.equal(1)
  })

  it('returns an array of Wrapper of elements matching the ref in options object', () => {
    const compiled = compileToFunctions('<div><div ref="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    const fooArr = wrapper.findAll({ ref: 'foo' })
    expect(fooArr.length).to.equal(1)
  })

  it('throws an error when ref selector is called on a wrapper that is not a Vue component', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const a = wrapper.find('a')
    const message = '[vue-test-utils]: $ref selectors can only be used on Vue component wrappers'
    const fn = () => a.findAll({ ref: 'foo' })
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns an array of Wrapper of elements matching the ref in options object if they are nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div ref="foo" /></transition>')
    const wrapper = mountingMethod(compiled)
    const divArr = wrapper.findAll({ ref: 'foo' })
    expect(divArr.length).to.equal(1)
  })

  it('returns correct number of Vue Wrapper when component has a v-for and matches the ref in options object', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = mountingMethod(ComponentWithVFor, { propsData: { items }})
    const componentArray = wrapper.findAll({ ref: 'item' })
    expect(componentArray.length).to.equal(items.length)
  })

  it('returns VueWrapper with length 0 if no nodes matching the ref in options object are found', () => {
    const wrapper = mountingMethod(Component)
    const preArray = wrapper.findAll({ ref: 'foo' })
    expect(preArray.length).to.equal(0)
    expect(preArray.wrappers).to.deep.equal([])
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = mountingMethod(Component)
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
