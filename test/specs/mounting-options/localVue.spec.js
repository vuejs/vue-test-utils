import Vue from 'vue'
import {
  describeWithShallowAndMount,
  isRunningPhantomJS,
  vueVersion
} from '~resources/utils'
import { createLocalVue, shallowMount, mount } from 'packages/test-utils/src'
import { itSkipIf, itRunIf, itDoNotRunIf } from 'conditional-specs'
import Vuex from 'vuex'

describeWithShallowAndMount('options.localVue', mountingMethod => {
  itSkipIf(
    isRunningPhantomJS,
    'mounts component using passed localVue as base Vue',
    () => {
      const TestComponent = {
        template: `<div>{{test}}</div>`
      }
      const localVue = createLocalVue()
      localVue.prototype.test = 'some value'
      const wrapper = mountingMethod(TestComponent, {
        localVue: localVue
      })
      expect(wrapper.html()).toContain('some value')
    }
  )

  itSkipIf(vueVersion < 2.3, 'works correctly with extended children', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store({
      state: { val: 2 }
    })
    const ChildComponent = Vue.extend({
      template: '<span>{{val}}</span>',
      computed: {
        val() {
          return this.$store.state.val
        }
      }
    })
    const TestComponent = {
      template: '<div><child-component /></div>',
      components: {
        ChildComponent
      }
    }
    const wrapper = mountingMethod(TestComponent, {
      localVue,
      store
    })
    const HTML =
      mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
    if (mountingMethod.name === 'shallowMount') {
      expect(HTML).not.toContain('2')
    } else {
      expect(HTML).toContain('2')
    }
  })

  itSkipIf(vueVersion < 2.3, 'is applied to deeply extended components', () => {
    const GrandChildComponent = Vue.extend({
      template: '<div>{{$route.params}}</div>'
    })
    const ChildComponent = Vue.extend({
      template: '<div><grand-child-component />{{$route.params}}</div>',
      components: {
        GrandChildComponent
      }
    })
    const TestComponent = Vue.extend({
      template: '<child-component />',
      components: { ChildComponent }
    })
    const localVue = createLocalVue()
    localVue.prototype.$route = {}

    mountingMethod(TestComponent, {
      localVue
    })
  })

  it('is applied to components that extend from other components', () => {
    const localVue = createLocalVue()
    localVue.prototype.$route = {}

    const Extends = {
      template: '<div />',
      created() {
        this.$route.params
      }
    }
    const TestComponent = {
      extends: Extends
    }
    mountingMethod(TestComponent, {
      localVue
    })
  })

  itSkipIf(vueVersion < 2.3, 'is applied to mixed extended components', () => {
    const BaseGrandChildComponent = {
      created() {
        this.$route.params
      }
    }
    const GrandChildComponent = {
      created() {
        this.$route.params
      },
      template: '<div/>',
      extends: BaseGrandChildComponent
    }
    const ChildComponent = Vue.extend({
      template: '<div><grand-child-component />{{$route.params}}</div>',
      components: {
        GrandChildComponent
      }
    })
    const TestComponent = Vue.extend({
      template: '<div><child-component /></div>',
      components: { ChildComponent }
    })
    const localVue = createLocalVue()
    localVue.prototype.$route = {}

    mountingMethod(TestComponent, {
      localVue
    })
  })

  it('does not add created mixin to localVue', () => {
    const localVue = createLocalVue()
    mountingMethod(
      { render: () => {} },
      {
        localVue
      }
    )
    expect(localVue.options.created).toEqual(undefined)
  })

  it('handles merging Vue instances', () => {
    const localVue = createLocalVue()
    localVue.use(_Vue => {
      _Vue.$el = new _Vue()
    })
    mountingMethod(
      { template: '<div />' },
      {
        localVue
      }
    )
  })

  itRunIf(
    vueVersion < 2.3,
    'throws an error if used with an extended component in Vue 2.3',
    () => {
      const TestComponent = Vue.extend({
        template: '<div></div>'
      })
      const message =
        `[vue-test-utils]: options.localVue is not supported for components ` +
        `created with Vue.extend in Vue < 2.3. You can set localVue to false ` +
        `to mount the component.`

      const fn = () =>
        mountingMethod(TestComponent, {
          localVue: createLocalVue(),
          stubs: false,
          mocks: false
        })
      expect(fn).toThrow(message)
    }
  )

  itDoNotRunIf(
    vueVersion < 2.3,
    'is applied to inline constructor functions',
    () => {
      const ChildComponent = Vue.extend({
        render(h) {
          h('p', this.$route.params)
        }
      })
      const TestComponent = {
        render: h => h(ChildComponent)
      }
      const localVue = createLocalVue()
      localVue.prototype.$route = {}
      const wrapper = mountingMethod(TestComponent, {
        localVue
      })
      if (mountingMethod.name === 'renderToString') {
        return
      }
      expect(wrapper.findAll(ChildComponent).length).toEqual(1)
    }
  )

  itRunIf(
    mountingMethod.name === 'mount',
    'does not affect future tests',
    () => {
      const ChildComponent = {
        template: '<span></span>'
      }
      const TestComponent = {
        template: '<child-component />',
        components: { ChildComponent }
      }
      const localVue = createLocalVue()
      localVue.use(Vuex)
      shallowMount(TestComponent, { localVue })
      const wrapper = mount(TestComponent, { localVue })
      expect(wrapper.html()).toContain('span')
    }
  )
})
