import { compileToFunctions } from 'vue-template-compiler'
import { createLocalVue } from '~vue/test-utils'
import Vuex, { mapGetters } from 'vuex'
import ComponentWithComputed from '~resources/components/component-with-computed.vue'
import ComponentWithWatch from '~resources/components/component-with-watch.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setComputed', (mountingMethod) => {
  let info

  beforeEach(() => {
    info = sinon.stub(console, 'info')
  })

  afterEach(() => {
    info.restore()
  })

  it('sets component computed props and updates when called on Vue instance', () => {
    const wrapper = mountingMethod(ComponentWithComputed)
    expect(wrapper.text()).to.contain('message')
    wrapper.setComputed({ reversedMessage: 'custom' })
    expect(wrapper.text()).to.contain('custom')
  })

  it('throws an error if computed watcher does not exist', () => {
    const message = 'wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property noExist does not exist on the Vue instance'
    const wrapper = mountingMethod(ComponentWithComputed)
    expect(() => wrapper.setComputed({ noExist: '' })).throw(Error, message)
  })

  it('runs watch function after all props are updated', () => {
    const wrapper = mountingMethod(ComponentWithWatch)
    const computed1 = 'new computed'
    wrapper.setComputed({ computed1 })
    expect(info.args[0][0]).to.equal(computed1)
    expect(wrapper.vm.computed1).to.equal(computed1)
  })

  it('updates vm computed value', () => {
    const TestComponent = {
      data () {
        return {
          a: 1
        }
      },
      computed: {
        b () {
          return this.a * 2
        }
      }
    }

    const wrapper = mountingMethod(TestComponent)
    wrapper.setComputed({ b: 3 })
    expect(wrapper.vm.b).to.equal(3)
  })

  it('works correctly with mapGetters', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store({
      getters: {
        someGetter: () => false
      }
    })
    const TestComponent = {
      computed: {
        ...mapGetters([
          'someGetter'
        ]),
        placeholder () {
          return this.someGetter
            ? 'someGetter is true'
            : 'someGetter is false'
        }
      }
    }
    const wrapper = mountingMethod(TestComponent, {
      localVue,
      store
    })
    wrapper.setComputed({ someGetter: true })
    expect(wrapper.vm.placeholder).to.equal('someGetter is true')
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setComputed() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.find('p')
    expect(() => p.setComputed({ ready: true })).throw(Error, message)
  })
})
