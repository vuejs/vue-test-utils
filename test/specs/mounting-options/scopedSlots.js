import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import ComponentWithScopedSlots from '~resources/components/component-with-scoped-slots.vue'

describeWithShallowAndMount('scopedSlots', (mountingMethod) => {
  if (vueVersion >= 2.5) {
    it('mounts component scoped slots', () => {
      const wrapper = mountingMethod(ComponentWithScopedSlots, {
        scopedSlots: {
          'item': '<p slot="item" slot-scope="props">{{props.index}},{{props.text}}</p>'
        }
      })
      expect(wrapper.html()).to.equal('<div><p>0,text1</p><p>1,text2</p><p>2,text3</p></div>')
    })
    it('throws exception when it is seted to template tag at top', () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            'item': '<template></template>'
          }
        })
      }
      const message = '[vue-test-utils]: scopedSlots option does not support template tag.'
      expect(fn).to.throw().with.property('message', message)
    })
  } else {
    it('throws exception when vue version < 2.5', () => {
      const fn = () => {
        mountingMethod(ComponentWithScopedSlots, {
          scopedSlots: {
            'item': '<p slot="item" slot-scope="props">{{props.index}},{{props.text}}</p>'
          }
        })
      }
      const message = '[vue-test-utils]: scopedSlots option supports vue@2.5+.'
      expect(fn).to.throw().with.property('message', message)
    })
  }
})
