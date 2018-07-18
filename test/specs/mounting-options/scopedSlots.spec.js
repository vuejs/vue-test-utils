import {
  describeWithShallowAndMount,
  vueVersion,
  isRunningPhantomJS
} from '~resources/utils'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'
import { itSkipIf, itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('scopedSlots', mountingMethod => {
  const windowSave = window

  afterEach(() => {
    window = windowSave // eslint-disable-line no-native-reassign
  })

  itDoNotRunIf(
    vueVersion < 2.5 || isRunningPhantomJS,
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
              '<p slot-scope="{ index, item }">{{index}},{{item}}</p>'
          }
        }
      )
      expect(destructuringWrapper.html()).to.equal('<p>1,foo</p>')

      const notDestructuringWrapper = mountingMethod(
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
              '<p slot-scope="props">{{props.index}},{{props.item}}</p>'
          }
        }
      )
      expect(notDestructuringWrapper.html()).to.equal('<p>1,foo</p>')
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5 || isRunningPhantomJS,
    'mounts component scoped slots',
    () => {
      const wrapper = mountingMethod(ComponentWithScopedSlots, {
        slots: { default: '<span>123</span>' },
        scopedSlots: {
          destructuring:
            '<p slot-scope="{ index, item }">{{index}},{{item}}</p>',
          list: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>',
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
    vueVersion < 2.5 || isRunningPhantomJS,
    'throws exception when it is seted to a template tag at top',
    () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            single: '<template></template>'
          }
        })
      }
      const message =
        '[vue-test-utils]: the scopedSlots option does not support a template tag as the root element.'
      expect(fn)
        .to.throw()
        .with.property('message', message)
    }
  )

  itDoNotRunIf(
    vueVersion >= 2.5 || isRunningPhantomJS,
    'throws exception when vue version < 2.5',
    () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            list: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
          }
        })
      }
      const message =
        '[vue-test-utils]: the scopedSlots option is only supported in vue@2.5+.'
      expect(fn)
        .to.throw()
        .with.property('message', message)
    }
  )

  itDoNotRunIf(
    vueVersion < 2.5,
    'throws exception when using PhantomJS',
    () => {
      if (window.navigator.userAgent.match(/Chrome|PhantomJS/i)) {
        return
      }
      window = { navigator: { userAgent: 'PhantomJS' }} // eslint-disable-line no-native-reassign
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            list: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
          }
        })
      }
      const message =
        '[vue-test-utils]: the scopedSlots option does not support PhantomJS. Please use Puppeteer, or pass a component.'
      expect(fn)
        .to.throw()
        .with.property('message', message)
    }
  )

  itSkipIf(
    mountingMethod.name === 'renderToString',
    'throws error if passed string in default slot object and vue-template-compiler is undefined',
    () => {
      const compilerSave =
        require.cache[require.resolve('vue-template-compiler')].exports
          .compileToFunctions
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = undefined
      delete require.cache[require.resolve('../../../packages/test-utils')]
      const mountingMethodFresh = require('../../../packages/test-utils')[
        mountingMethod.name
      ]
      const message =
        '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined'
      const fn = () => {
        mountingMethodFresh(ComponentWithScopedSlots, {
          scopedSlots: {
            list: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
          }
        })
      }
      try {
        expect(fn)
          .to.throw()
          .with.property('message', message)
      } catch (err) {
        require.cache[
          require.resolve('vue-template-compiler')
        ].exports.compileToFunctions = compilerSave
        throw err
      }
      require.cache[
        require.resolve('vue-template-compiler')
      ].exports.compileToFunctions = compilerSave
    }
  )
})
