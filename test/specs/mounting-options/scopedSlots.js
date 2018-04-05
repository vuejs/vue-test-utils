import { describeWithShallowAndMount, vueVersion, itDoNotRunIf } from '~resources/utils'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'

describeWithShallowAndMount('scopedSlots', (mountingMethod) => {
  itDoNotRunIf(vueVersion < 2.5,
    'mounts component scoped slots', () => {
      const wrapper = mountingMethod(ComponentWithScopedSlots, {
        slots: { default: '<span>123</span>' },
        scopedSlots: {
          'item': '<p slot-scope="props">{{props.index}},{{props.text}}</p>'
        }
      })
      expect(wrapper.find('#slots').html()).to.equal('<div id="slots"><span>123</span></div>')
      expect(wrapper.find('#scopedSlots').html()).to.equal('<div id="scopedSlots"><p>0,a1</p><p>1,a2</p><p>2,a3</p></div>')
      wrapper.vm.items = [{ text: 'b1' }, { text: 'b2' }, { text: 'b3' }]
      expect(wrapper.find('#scopedSlots').html()).to.equal('<div id="scopedSlots"><p>0,b1</p><p>1,b2</p><p>2,b3</p></div>')
    }
  )

  itDoNotRunIf(vueVersion < 2.5,
    'throws exception when it is seted to template tag at top', () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            'item': '<template></template>'
          }
        })
      }
      const message = '[vue-test-utils]: scopedSlots option does not support template tag.'
      expect(fn).to.throw().with.property('message', message)
    }
  )

  itDoNotRunIf(vueVersion >= 2.5,
    'throws exception when vue version < 2.5', () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            'item': '<p slot="item" slot-scope="props">{{props.index}},{{props.text}}</p>'
          }
        })
      }
      const message = '[vue-test-utils]: scopedSlots option supports vue@2.5+.'
      expect(fn).to.throw().with.property('message', message)
    }
  )
})
