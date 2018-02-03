import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import { describeWithShallowAndMount } from '~resources/test-utils'

describeWithShallowAndMount('setData', (method) => {
  let info

  beforeEach(() => {
    info = sinon.stub(console, 'info')
  })

  afterEach(() => {
    info.restore()
  })

  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const wrapper = method(ComponentWithVIf)
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
    const wrapper = method(Component)
    wrapper.setData({ show: true })
    wrapper.update()
    expect(wrapper.element).to.equal(wrapper.vm.$el)
    expect(wrapper.hasClass('some-class')).to.be.true
  })

  it('runs watch function when data is updated', () => {
    const wrapper = method(ComponentWithWatch)
    const data1 = 'testest'
    wrapper.setData({ data1 })
    expect(wrapper.vm.data2).to.equal(data1)
  })

  it('runs watch function after all props are updated', () => {
    const wrapper = method(ComponentWithWatch)
    const data1 = 'testest'
    wrapper.setData({ data2: 'newProp', data1 })
    expect(info.args[0][0]).to.equal(data1)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setData() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = method(compiled)
    const p = wrapper.find('p')
    expect(() => p.setData({ ready: true })).throw(Error, message)
  })

  it('should not run watchers if data updated is null', () => {
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
    const wrapper = method(TestComponent)
    wrapper.setData({ message: null })
    expect(wrapper.text()).to.equal('There is no message yet')
  })
})
