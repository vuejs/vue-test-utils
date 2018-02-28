import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('update', (mountingMethod) => {
  it('causes vm to re render', () => {
    const wrapper = mountingMethod(ComponentWithVIf)
    expect(wrapper.findAll('.child.ready').length).to.equal(0)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()
    expect(wrapper.findAll('.child.ready').length).to.equal(1)
  })

  it('updates slot components', () => {
    if (mountingMethod.name === 'shallow') return
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
    const parentWrapper = mountingMethod(Parent)
    const innerEl = parentWrapper.find('.inner')
    expect(innerEl.hasClass('is-on')).to.equal(false)
    parentWrapper.setProps({
      on: true
    })
    expect(innerEl.hasClass('is-on')).to.equal(true)
  })

  it('runs watchers', () => {
    const TestComponent = {
      template: `
      <div>
        <input v-model="text" />
        <button v-if="showButton">Submit</button>
      </div>
      `,
      data () {
        return {
          text: '',
          showButton: false
        }
      },

      watch: {
        text () {
          this.showButton = true
        }
      }
    }
    const wrapper = mountingMethod(TestComponent)

    wrapper.find('input').element.value = 'Value'
    wrapper.find('input').trigger('input')

    expect(wrapper.vm.showButton).to.equal(true)
    expect(wrapper.find('button').exists()).to.equal(true)
  })

  it('causes vm to re render, and retain slots', () => {
    const compiled = compileToFunctions('<div><slot></slot></div>')
    const wrapper = mountingMethod(compiled, { slots: { default: [compileToFunctions('<div class="test-div" />')] }})
    expect(wrapper.findAll('.test-div').length).to.equal(1)
    wrapper.update()
    expect(wrapper.findAll('.test-div').length).to.equal(1)
  })
})
