import {
  describeWithShallowAndMount,
  vueVersion
} from '~resources/utils'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'
import { itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('scopedSlots', mountingMethod => {
  const windowSave = window

  afterEach(() => {
    window = windowSave // eslint-disable-line no-native-reassign
  })

  itDoNotRunIf(
    vueVersion < 2.1,
    'handles templates as the root node', () => {
      const wrapper = mountingMethod({
        template: '<div><slot name="single" :text="foo" :i="123"></slot></div>',
        data: () => ({
          foo: 'bar'
        })
      }, {
        scopedSlots: {
          single: '<template><p>{{props.text}},{{props.i}}</p></template>'
        }
      })
      expect(wrapper.html()).to.equal('<div><p>bar,123</p></div>')
    })

  itDoNotRunIf(
    vueVersion < 2.1,
    'handles render functions', () => {
      const wrapper = mountingMethod({
        template: '<div><slot name="single" :text="foo" /></div>',
        data: () => ({
          foo: 'bar'
        })
      }, {
        scopedSlots: {
          single: function (props) {
            return this.$createElement('p', props.text)
          }
        }
      })
      expect(wrapper.html()).to.equal('<div><p>bar</p></div>')
    })

  itDoNotRunIf(
    vueVersion < 2.5,
    'mounts component scoped slots in render function',
    () => {
      const destructuringWrapper = mountingMethod(
        {
          render: function () {
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
          render: function () {
            return this.$scopedSlots.named({
              index: 1,
              item: 'foo'
            })
          }
        },
        {
          scopedSlots: {
            named:
              '<p slot-scope="foo">{{foo.index}},{{foo.item}}</p>'
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
          render: function (createElement, context) {
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
          render: function (createElement, context) {
            return context.data.scopedSlots.named({
              index: 1,
              item: 'foo'
            })
          }
        },
        {
          scopedSlots: {
            named:
              '<p slot-scope="foo">{{foo.index}},{{foo.item}}</p>'
          }
        }
      )
      expect(notDestructuringWrapper.html()).to.equal('<p>1,foo</p>')
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5,
    'mounts component scoped slots',
    () => {
      const wrapper = mountingMethod(ComponentWithScopedSlots, {
        slots: { default: '<span>123</span>' },
        scopedSlots: {
          destructuring:
            '<p slot-scope="{ index, item }">{{index}},{{item}}</p>',
          list: '<template slot-scope="foo"><p>{{foo.index}},{{foo.text}}</p></template>',
          single: '<p slot-scope="bar">{{bar.text}}</p>',
          noProps: '<p slot-scope="baz">baz</p>'
        }
      })
      expect(wrapper.find('#destructuring').html()).to.equal(
        '<div id="destructuring"><p>0,1</p><p>1,2</p><p>2,3</p></div>'
      )
      expect(wrapper.find('#slots').html()).to.equal(
        '<div id="slots"><span>123</span></div>'
      )
      expect(wrapper.find('#list').html()).to.equal(
        '<div id="list"><p>0,a1</p><p>1,a2</p><p>2,a3</p></div>'
      )
      expect(wrapper.find('#single').html()).to.equal(
        '<div id="single"><p>abc</p></div>'
      )
      expect(wrapper.find('#noProps').html()).to.equal(
        '<div id="noProps"><p>baz</p></div>'
      )
      wrapper.vm.items = [4, 5, 6]
      wrapper.vm.foo = [{ text: 'b1' }, { text: 'b2' }, { text: 'b3' }]
      wrapper.vm.bar = 'ABC'
      expect(wrapper.find('#destructuring').html()).to.equal(
        '<div id="destructuring"><p>0,4</p><p>1,5</p><p>2,6</p></div>'
      )
      expect(wrapper.find('#slots').html()).to.equal(
        '<div id="slots"><span>123</span></div>'
      )
      expect(wrapper.find('#list').html()).to.equal(
        '<div id="list"><p>0,b1</p><p>1,b2</p><p>2,b3</p></div>'
      )
      expect(wrapper.find('#single').html()).to.equal(
        '<div id="single"><p>ABC</p></div>'
      )
      expect(wrapper.find('#noProps').html()).to.equal(
        '<div id="noProps"><p>baz</p></div>'
      )
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5,
    'handles JSX', () => {
      const wrapper = mountingMethod({
        template: '<div><slot name="single" :text="foo"></slot></div>',
        data: () => ({
          foo: 'bar'
        })
      }, {
        scopedSlots: {
          single ({ text }) {
            return <p>{ text }</p>
          }
        }
      })
      expect(wrapper.html()).to.equal('<div><p>bar</p></div>')
    })

  itDoNotRunIf(
    vueVersion < 2.5,
    'handles no slot-scope', () => {
      const wrapper = mountingMethod({
        template: '<div><slot name="single" :text="foo" :i="123"></slot></div>',
        data: () => ({
          foo: 'bar'
        })
      }, {
        scopedSlots: {
          single: '<p>{{props.text}},{{props.i}}</p>'
        }
      })
      expect(wrapper.html()).to.equal('<div><p>bar,123</p></div>')
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
    'renders scoped slots in sync mode by default', () => {
      const TestComponent = {
        data () {
          return {
            val: null
          }
        },
        mounted () {
          this.val = 123
        },
        render () {
          return this.$scopedSlots.default(this.val)
        }
      }
      const stub = sinon.stub()
      mountingMethod(TestComponent, {
        scopedSlots: {
          default: stub
        }
      })
      expect(stub).calledWith(123)
    })
})
