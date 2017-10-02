import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'

describe('update', () => {
  it('causes vm to re render', () => {
    const wrapper = mount(ComponentWithVIf)
    expect(wrapper.findAll('.child.ready').length).to.equal(0)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()
    expect(wrapper.findAll('.child.ready').length).to.equal(1)
  })

  it('updates slot components', () => {
    const SlotComponent = compileToFunctions('<div><slot></slot></div>')
    const Parent = {
      template: `
        <SlotComponent>
        <div :class="[{ 'is-on': on }, 'inner']"></div>
      </SlotComponent>
      `,
      props: {
        on: {
          default: false,
          type: Boolean
        }
      },
      components: {
        SlotComponent
      }
    }
    const parentWrapper = mount(Parent)
    const innerEl = parentWrapper.find('.inner')
    expect(innerEl.hasClass('is-on')).to.equal(false)
    parentWrapper.setProps({
      on: true
    })
    expect(innerEl.hasClass('is-on')).to.equal(true)
  })

  it('causes vm to re render, and retain slots', () => {
    const compiled = compileToFunctions('<div><slot></slot></div>')
    const wrapper = mount(compiled, { slots: { default: [compileToFunctions('<div class="test-div" />')] }})
    expect(wrapper.findAll('.test-div').length).to.equal(1)
    wrapper.update()
    expect(wrapper.findAll('.test-div').length).to.equal(1)
  })
})
