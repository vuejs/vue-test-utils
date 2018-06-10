import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import {
  describeWithShallowAndMount,
  vueVersion
} from '~resources/utils'

describeWithShallowAndMount('setData', (mountingMethod) => {
  let info

  beforeEach(() => {
    info = sinon.stub(console, 'info')
  })

  afterEach(() => {
    info.restore()
  })

  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    expect(wrapper.findAll('.child.ready').length).to.equal(0)
    wrapper.setData({ ready: true })
    expect(wrapper.findAll('.child.ready').length).to.equal(1)
  })

  it('keeps element in sync with vnode', () => {
    const Component = {
      template: '<div class="some-class" v-if="show">A custom component!</div>',
      data () {
        return {
          show: false
        }
      }
    }
    const wrapper = mountingMethod(Component)
    wrapper.setData({ show: true })
    expect(wrapper.element).to.equal(wrapper.vm.$el)
    expect(wrapper.hasClass('some-class')).to.be.true
  })

  it('runs watch function when data is updated', () => {
    const wrapper = mountingMethod(ComponentWithWatch)
    const data1 = 'testest'
    wrapper.setData({ data1 })
    expect(wrapper.vm.data2).to.equal(data1)
  })

  it('runs watch function after all props are updated', () => {
    const wrapper = mountingMethod(ComponentWithWatch)
    const data1 = 'testest'
    wrapper.setData({ data2: 'newProp', data1 })
    expect(info.args[1][0]).to.equal(data1)
  })

  it('throws error if node is not a Vue instance', () => {
    const message = 'wrapper.setData() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setData({ ready: true })).throw(Error, message)
  })

  it('throws error when called on functional vnode', () => {
    const AFunctionalComponent = {
      render: (h, context) => h('div', context.prop1),
      functional: true
    }
    const message = '[vue-test-utils]: wrapper.setData() cannot be called on a functional component'
    const fn = () => mountingMethod(AFunctionalComponent).setData({ data1: 'data' })
    expect(fn).to.throw().with.property('message', message)
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
    const fn2 = () => mountingMethod(TestComponent).find(AFunctionalComponent).setData({ data1: 'data' })
    expect(fn2).to.throw().with.property('message', message)
  })

  it('updates watchers if computed is updated', () => {
    const TestComponent = {
      template: `
        <em>{{ computedText }}</em>
        `,
      data () {
        return {
          text: '',
          basket: []
        }
      },
      computed: {
        computedText () {
          return this.text
        }
      },
      watch: {
        text () {
          this.basket.push(this.computedText)
        }
      }
    }
    const wrapper = mountingMethod(TestComponent)

    wrapper.setData({ text: 'hello' })
    expect(wrapper.vm.basket[0]).to.equal('hello')
  })

  it.skip('should not run watcher if data is null', () => {
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
    wrapper.setData({ message: null })
    expect(wrapper.text()).to.equal('There is no message yet')
  })

  it('should update an existing property in a data object', () => {
    const TestComponent = {
      data: () => ({
        anObject: {
          propA: {
            prop1: 'a'
          },
          propB: 'b'
        }
      })
    }
    const wrapper = mountingMethod(TestComponent)
    wrapper.setData({
      anObject: {
        propA: {
          prop1: 'c'
        }
      }
    })
    expect(wrapper.vm.anObject.propB).to.equal('b')
    expect(wrapper.vm.anObject.propA.prop1).to.equal('c')
  })

  it('should append a new property to an object without removing existing properties', () => {
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
    wrapper.setData({
      anObject: {
        propA: {
          prop2: 'b'
        }
      }
    })
    expect(wrapper.vm.anObject.propA.prop1).to.equal('a')
    expect(wrapper.vm.anObject.propA.prop2).to.equal('b')
  })

  it('does not merge arrays', () => {
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
    wrapper.setData({
      items: [3]
    })
    expect(wrapper.vm.items).to.deep.equal([3])
    wrapper.setData({
      nested: {
        nested: {
          nestedArray: [10]
        }
      }
    })
    expect(wrapper.text()).to.equal('10')
    expect(wrapper.vm.nested.nested.nestedArray).to.deep.equal([10])
  })
})
