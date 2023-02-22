import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import {
  describeWithShallowAndMount,
  isPromise,
  vueVersion
} from '~resources/utils'

describeWithShallowAndMount('setData', mountingMethod => {
  let consoleInfoSave = console.info

  beforeEach(() => {
    consoleInfoSave = console.info
    console.info = jest.fn()
  })

  afterEach(() => {
    console.info = consoleInfoSave
  })

  it('sets component data and returns a promise', async () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    expect(wrapper.findAll('.child.ready').length).toEqual(0)
    const response = wrapper.setData({ ready: true })
    expect(wrapper.findAll('.child.ready').length).toEqual(0)
    expect(isPromise(response)).toEqual(true)
    await response
    expect(wrapper.findAll('.child.ready').length).toEqual(1)
  })

  it('sets component data and updates nested vm nodes when called on Vue instance', async () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    expect(wrapper.findAll('.child.ready').length).toEqual(0)
    await wrapper.setData({ ready: true })
    expect(wrapper.findAll('.child.ready').length).toEqual(1)
  })

  it('keeps element in sync with vnode', async () => {
    const Component = {
      template: '<div class="some-class" v-if="show">A custom component!</div>',
      data() {
        return {
          show: false
        }
      }
    }
    const wrapper = mountingMethod(Component)
    await wrapper.setData({ show: true })
    expect(wrapper.element).toEqual(wrapper.vm.$el)
    expect(wrapper.classes()).toContain('some-class')
  })

  it('runs watch function when data is updated', async () => {
    const wrapper = mountingMethod(ComponentWithWatch)
    const data1 = 'testest'
    await wrapper.setData({ data1 })
    expect(wrapper.vm.data2).toEqual(data1)
  })

  it('runs watch function after all props are updated', async () => {
    const wrapper = mountingMethod(ComponentWithWatch)
    const data1 = 'testest'
    await wrapper.setData({ data2: 'newProp', data1 })
    expect(console.info).toHaveBeenCalledWith(data1)
  })

  it('throws error if node is not a Vue instance', () => {
    const message = 'wrapper.setData() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setData({ ready: true })).toThrow(message)
  })

  it('throws error when called on functional vnode', () => {
    const AFunctionalComponent = {
      render: (h, context) => h('div', context.prop1),
      functional: true
    }
    const message =
      '[vue-test-utils]: wrapper.setData() cannot be called on a functional component'
    const fn = () =>
      mountingMethod(AFunctionalComponent).setData({ data1: 'data' })
    expect(fn).toThrow(message)
    // find on functional components isn't supported in Vue < 2.3
    if (vueVersion < 2.3) {
      return
    }
    const TestComponent = {
      template: '<div><a-functional-component /></div>',
      components: {
        AFunctionalComponent
      }
    }
    const fn2 = () =>
      mountingMethod(TestComponent)
        .find(AFunctionalComponent)
        .setData({ data1: 'data' })
    expect(fn2).toThrow(message)
  })

  it('updates watchers if computed is updated', async () => {
    const TestComponent = {
      template: `
        <em>{{ computedText }}</em>
      `,
      data() {
        return {
          text: '',
          basket: []
        }
      },
      computed: {
        computedText() {
          return this.text
        }
      },
      watch: {
        text() {
          this.basket.push(this.computedText)
        }
      }
    }
    const wrapper = mountingMethod(TestComponent)

    await wrapper.setData({ text: 'hello' })
    expect(wrapper.vm.basket[0]).toEqual('hello')
  })

  it('should not run watcher if data is null', async () => {
    const TestComponent = {
      template: `
        <div>
          <div v-if="!message">There is no message yet</div>
          <div v-else>{{ reversedMessage }}</div>
        </div>
      `,
      data: () => ({
        message: 'egassem'
      }),
      computed: {
        reversedMessage: function () {
          return this.message.split('').reverse().join('')
        }
      }
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({ message: null })
    expect(wrapper.text()).toEqual('There is no message yet')
  })

  it('updates an existing property in a data object', async () => {
    const TestComponent = {
      data: () => ({
        anObject: {
          propA: {
            prop1: 'a'
          },
          propB: 'b'
        }
      }),
      render: () => {}
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({
      anObject: {
        propA: {
          prop1: 'c'
        }
      }
    })
    expect(wrapper.vm.anObject.propB).toEqual('b')
    expect(wrapper.vm.anObject.propA.prop1).toEqual('c')
  })

  it('should append a new property to an object without removing existing properties', async () => {
    const TestComponent = {
      data: () => ({
        anObject: {
          propA: {
            prop1: 'a'
          },
          propB: 'b'
        }
      }),
      render: () => {}
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({
      anObject: {
        propA: {
          prop2: 'b'
        }
      }
    })
    expect(wrapper.vm.anObject.propA.prop1).toEqual('a')
    expect(wrapper.vm.anObject.propA.prop2).toEqual('b')
  })

  it('handles undefined values', async () => {
    const TestComponent = {
      template: `
        <div>
          {{undefinedProperty && undefinedProperty.foo}}
        </div>
      `,
      data: () => ({
        undefinedProperty: undefined
      })
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({
      undefinedProperty: {
        foo: 'baz'
      }
    })
    expect(wrapper.text()).toContain('baz')
  })

  it('handles null values', async () => {
    const TestComponent = {
      template: `
        <div>{{nullProperty && nullProperty.foo}}</div>
      `,
      data: () => ({
        nullProperty: null
      })
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({
      nullProperty: {
        foo: 'bar',
        another: null
      }
    })
    expect(wrapper.text()).toContain('bar')
    await wrapper.setData({
      nullProperty: {
        another: {
          obj: true
        }
      }
    })
    expect(wrapper.vm.nullProperty.another.obj).toEqual(true)
  })

  it('does not merge arrays', async () => {
    const TestComponent = {
      template: '<div>{{nested.nested.nestedArray[0]}}</div>',
      data: () => ({
        items: [1, 2],
        nested: {
          nested: {
            nestedArray: [1, 2]
          }
        }
      })
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({
      items: [3]
    })
    expect(wrapper.vm.items).toEqual([3])
    await wrapper.setData({
      nested: {
        nested: {
          nestedArray: [10]
        }
      }
    })
    expect(wrapper.text()).toEqual('10')
    expect(wrapper.vm.nested.nested.nestedArray).toEqual([10])
  })

  it('should set property in existing data object', async () => {
    const TestComponent = {
      data: () => ({
        anObject: {
          propA: 'a',
          propB: 'b'
        }
      }),
      computed: {
        anObjectKeys() {
          return Object.keys(this.anObject).join(',')
        }
      },
      template: `<div>{{ anObjectKeys }}</div>`
    }
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({
      anObject: {
        propC: 'c'
      }
    })
    expect(wrapper.vm.anObject.propA).toEqual('a')
    expect(wrapper.vm.anObject.propB).toEqual('b')
    expect(wrapper.vm.anObject.propC).toEqual('c')
    expect(wrapper.vm.anObjectKeys).toEqual('propA,propB,propC')
    expect(wrapper.html()).toEqual('<div>propA,propB,propC</div>')
  })

  it('allows setting data of type Date synchronously', async () => {
    const TestComponent = {
      template: `
        <div>
          {{selectedDate}}
        </div>
      `,
      data: () => ({
        selectedDate: undefined
      })
    }
    const testDate = new Date()
    const wrapper = mountingMethod(TestComponent)
    await wrapper.setData({ selectedDate: testDate })
    expect(wrapper.vm.selectedDate).toEqual(testDate)
  })

  it('allows empty objects to be set', () => {
    const TestComponent = {
      data() {
        return {
          someKey: { someValue: true }
        }
      },
      render(h) {
        return h('span')
      }
    }

    const wrapper = mountingMethod(TestComponent)

    expect(wrapper.vm.$data).toEqual({ someKey: { someValue: true } })

    wrapper.setData({ someKey: {} })

    expect(wrapper.vm.$data).toEqual({ someKey: {} })

    wrapper.setData({ someKey: { someValue: false } })

    expect(wrapper.vm.$data).toEqual({ someKey: { someValue: false } })
  })
})
