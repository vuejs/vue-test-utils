import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { createLocalVue } from '@vue/test-utils'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'
import { itDoNotRunIf } from 'conditional-specs'
import Vue from 'vue'

describeWithShallowAndMount('scopedSlots', mountingMethod => {
  const sandbox = sinon.createSandbox()
  const windowSave = window

  afterEach(() => {
    window = windowSave // eslint-disable-line no-native-reassign
    sandbox.reset()
    sandbox.restore()
  })

  itDoNotRunIf(vueVersion < 2.1, 'handles templates as the root node', () => {
    const wrapper = mountingMethod(
      {
        template: '<div><slot name="single" :text="foo" :i="123"></slot></div>',
        data: () => ({
          foo: 'bar'
        })
      },
      {
        scopedSlots: {
          single: '<template><p>{{props.text}},{{props.i}}</p></template>'
        }
      }
    )
    expect(wrapper.html()).to.equal('<div>\n' + '  <p>bar,123</p>\n' + '</div>')
  })

  itDoNotRunIf(vueVersion < 2.1, 'handles render functions', () => {
    const wrapper = mountingMethod(
      {
        template: '<div><slot name="single" :text="foo" /></div>',
        data: () => ({
          foo: 'bar'
        })
      },
      {
        scopedSlots: {
          single: function(props) {
            return this.$createElement('p', props.text)
          }
        }
      }
    )
    expect(wrapper.html()).to.equal('<div>\n' + '  <p>bar</p>\n' + '</div>')
  })

  itDoNotRunIf(
    vueVersion < 2.5,
    'mounts component scoped slots in render function',
    () => {
      const destructuringWrapper = mountingMethod(
        {
          render: function() {
            return this.$scopedSlots.default({
              index: 1,
              item: 'foo'
            })
          }
        },
        {
          scopedSlots: {
            default:
              '<template slot-scope="{ index, item }"><p>{{index}},{{item}}</p></template>'
          }
        }
      )
      expect(destructuringWrapper.html()).to.equal('<p>1,foo</p>')

      const notDestructuringWrapper = mountingMethod(
        {
          render: function() {
            return this.$scopedSlots.named({
              index: 1,
              item: 'foo'
            })
          }
        },
        {
          scopedSlots: {
            named: '<p slot-scope="foo">{{foo.index}},{{foo.item}}</p>'
          }
        }
      )
      expect(notDestructuringWrapper.html()).to.equal('<p>1,foo</p>')
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5,
    'mounts component scoped slots in render function which exists in functional component',
    () => {
      const destructuringWrapper = mountingMethod(
        {
          functional: true,
          render: function(createElement, context) {
            return context.data.scopedSlots.default({
              index: 1,
              item: 'foo'
            })
          }
        },
        {
          scopedSlots: {
            default:
              '<template slot-scope="{ index, item }"><p>{{index}},{{item}}</p></template>'
          }
        }
      )
      expect(destructuringWrapper.html()).to.equal('<p>1,foo</p>')

      const notDestructuringWrapper = mountingMethod(
        {
          functional: true,
          render: function(createElement, context) {
            return context.data.scopedSlots.named({
              index: 1,
              item: 'foo'
            })
          }
        },
        {
          scopedSlots: {
            named: '<p slot-scope="foo">{{foo.index}},{{foo.item}}</p>'
          }
        }
      )
      expect(notDestructuringWrapper.html()).to.equal('<p>1,foo</p>')
    }
  )

  itDoNotRunIf(vueVersion < 2.5, 'mounts component scoped slots', async () => {
    const wrapper = mountingMethod(ComponentWithScopedSlots, {
      slots: { default: '<span>123</span>' },
      scopedSlots: {
        destructuring: '<p slot-scope="{ index, item }">{{index}},{{item}}</p>',
        list:
          '<template slot-scope="foo"><p>{{foo.index}},{{foo.text}}</p></template>',
        single: '<p slot-scope="bar">{{bar.text}}</p>',
        noProps: '<p slot-scope="baz">baz</p>'
      }
    })
    expect(wrapper.find('#destructuring').html()).to.equal(
      '<div id="destructuring">\n' +
        '  <p>0,1</p>\n' +
        '  <p>1,2</p>\n' +
        '  <p>2,3</p>\n' +
        '</div>'
    )
    expect(wrapper.find('#slots').html()).to.equal(
      '<div id="slots"><span>123</span></div>'
    )
    expect(wrapper.find('#list').html()).to.equal(
      '<div id="list">\n' +
        '  <p>0,a1</p>\n' +
        '  <p>1,a2</p>\n' +
        '  <p>2,a3</p>\n' +
        '</div>'
    )
    expect(wrapper.find('#single').html()).to.equal(
      '<div id="single">\n' + '  <p>abc</p>\n' + '</div>'
    )
    expect(wrapper.find('#noProps').html()).to.equal(
      '<div id="noProps">\n' + '  <p>baz</p>\n' + '</div>'
    )
    wrapper.vm.items = [4, 5, 6]
    wrapper.vm.foo = [{ text: 'b1' }, { text: 'b2' }, { text: 'b3' }]
    wrapper.vm.bar = 'ABC'
    await Vue.nextTick()
    expect(wrapper.find('#destructuring').html()).to.equal(
      '<div id="destructuring">\n' +
        '  <p>0,4</p>\n' +
        '  <p>1,5</p>\n' +
        '  <p>2,6</p>\n' +
        '</div>'
    )
    expect(wrapper.find('#slots').html()).to.equal(
      '<div id="slots"><span>123</span></div>'
    )
    expect(wrapper.find('#list').html()).to.equal(
      '<div id="list">\n' +
        '  <p>0,b1</p>\n' +
        '  <p>1,b2</p>\n' +
        '  <p>2,b3</p>\n' +
        '</div>'
    )
    expect(wrapper.find('#single').html()).to.equal(
      '<div id="single">\n' + '  <p>ABC</p>\n' + '</div>'
    )
    expect(wrapper.find('#noProps').html()).to.equal(
      '<div id="noProps">\n' + '  <p>baz</p>\n' + '</div>'
    )
  })

  itDoNotRunIf(vueVersion < 2.5, 'handles JSX', () => {
    const wrapper = mountingMethod(
      {
        template: '<div><slot name="single" :text="foo"></slot></div>',
        data: () => ({
          foo: 'bar'
        })
      },
      {
        scopedSlots: {
          single({ text }) {
            return <p>{text}</p>
          }
        }
      }
    )
    expect(wrapper.html()).to.equal('<div>\n' + '  <p>bar</p>\n' + '</div>')
  })

  itDoNotRunIf(vueVersion < 2.5, 'handles no slot-scope', () => {
    const wrapper = mountingMethod(
      {
        template: '<div><slot name="single" :text="foo" :i="123"></slot></div>',
        data: () => ({
          foo: 'bar'
        })
      },
      {
        scopedSlots: {
          single: '<p>{{props.text}},{{props.i}}</p>'
        }
      }
    )
    expect(wrapper.html()).to.equal('<div>\n' + '  <p>bar,123</p>\n' + '</div>')
  })

  itDoNotRunIf(
    vueVersion > 2.0,
    'throws exception when vue version < 2.1',
    () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            list: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
          }
        })
      }
      const message =
        '[vue-test-utils]: the scopedSlots option is only supported in vue@2.1+.'
      expect(fn)
        .to.throw()
        .with.property('message', message)
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5,
    'renders scoped slots in sync mode by default',
    async () => {
      const TestComponent = {
        template: '<div />',
        data() {
          return {
            val: null
          }
        },
        mounted() {
          this.val = 123
        },
        render() {
          return this.$scopedSlots.default(this.val)
        }
      }
      const stub = sandbox.stub()
      mountingMethod(TestComponent, {
        scopedSlots: {
          default: stub
        }
      })
      await Vue.nextTick()
      expect(stub).calledWith(123)
    }
  )

  itDoNotRunIf.only(
    vueVersion < 2.5,
    'renders scoped slot with v-slot syntax',
    async () => {
      const TestComponent = {
        data() {
          return {
            val: 25
          }
        },
        render() {
          return this.$scopedSlots.default({ val: this.val })
        }
      }
      const wrapper = mountingMethod(TestComponent, {
        scopedSlots: {
          default: '<template v-slot:default="{ val }">{{ val }}</template>'
        }
      })
      expect(wrapper.html()).to.contain(25)
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5 || mountingMethod.name !== 'mount',
    'renders using localVue constructor',
    () => {
      const RegisteredComponent = {
        render: h => h('span')
      }
      const TestComponent = {
        template: '<div><slot name="single" /></div>'
      }

      const localVue = createLocalVue()
      localVue.component('registered-component', RegisteredComponent)

      const wrapper = mountingMethod(TestComponent, {
        scopedSlots: {
          single: '<template><registered-component /></template>'
        },
        localVue
      })

      expect(wrapper.html()).to.contain('span')
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5 || mountingMethod.name !== 'mount',
    'resolves v-model directive',
    () => {
      const wrapper = mountingMethod(
        {
          template: '<div><slot name="single" :text="text"></slot></div>',
          data() {
            return { text: 'text' }
          }
        },
        {
          scopedSlots: {
            single: '<input v-model="props.text" type="text" />'
          }
        }
      )

      wrapper.find('input').setValue('abc')
      expect(wrapper.find('input').element.value).to.equal('abc')
    }
  )
})
