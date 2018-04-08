import { describeWithShallowAndMount, vueVersion, itDoNotRunIf } from '~resources/utils'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'

describeWithShallowAndMount('scopedSlots', (mountingMethod) => {
  let _window

  beforeEach(() => {
    _window = window
  })

  afterEach(() => {
    if (!window.navigator.userAgent.match(/Chrome/i)) {
      window = _window // eslint-disable-line no-native-reassign
    }
  })

  itDoNotRunIf(vueVersion < 2.5,
    'mounts component scoped slots', () => {
      const wrapper = mountingMethod(ComponentWithScopedSlots, {
        slots: { default: '<span>123</span>' },
        scopedSlots: {
          'foo': '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>',
          'bar': '<p slot-scope="bar">{{bar.text}},{{bar.index}}</p>'
        }
      })
      expect(wrapper.find('#slots').html()).to.equal('<div id="slots"><span>123</span></div>')
      expect(wrapper.find('#foo').html()).to.equal('<div id="foo"><p>0,a1</p><p>1,a2</p><p>2,a3</p></div>')
      expect(wrapper.find('#bar').html()).to.equal('<div id="bar"><p>A1,0</p><p>A2,1</p><p>A3,2</p></div>')
      wrapper.vm.foo = [{ text: 'b1' }, { text: 'b2' }, { text: 'b3' }]
      wrapper.vm.bar = [{ text: 'B1' }, { text: 'B2' }, { text: 'B3' }]
      expect(wrapper.find('#foo').html()).to.equal('<div id="foo"><p>0,b1</p><p>1,b2</p><p>2,b3</p></div>')
      expect(wrapper.find('#bar').html()).to.equal('<div id="bar"><p>B1,0</p><p>B2,1</p><p>B3,2</p></div>')
    }
  )

  itDoNotRunIf(vueVersion < 2.5,
    'throws exception when it is seted to template tag at top', () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            'foo': '<template></template>'
          }
        })
      }
      const message = '[vue-test-utils]: the scopedSlots option does not support a template tag as the root element.'
      expect(fn).to.throw().with.property('message', message)
    }
  )

  itDoNotRunIf(vueVersion >= 2.5,
    'throws exception when vue version < 2.5', () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            'foo': '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
          }
        })
      }
      const message = '[vue-test-utils]: the scopedSlots option is only supported in vue@2.5+.'
      expect(fn).to.throw().with.property('message', message)
    }
  )

  itDoNotRunIf(vueVersion < 2.5,
    'throws exception when using PhantomJS', () => {
      if (window.navigator.userAgent.match(/Chrome/i)) {
        return
      }
      window = { navigator: { userAgent: 'PhantomJS' }} // eslint-disable-line no-native-reassign
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            'foo': '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
          }
        })
      }
      const message = '[vue-test-utils]: the scopedSlots option does not support strings in PhantomJS. Please use Puppeteer, or pass a component.'
      expect(fn).to.throw().with.property('message', message)
    }
  )
})
