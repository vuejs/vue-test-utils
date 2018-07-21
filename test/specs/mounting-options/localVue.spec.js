import Vue from 'vue'
import {
  describeWithMountingMethods,
  isRunningPhantomJS,
  vueVersion
} from '~resources/utils'
import { createLocalVue } from '~vue/test-utils'
import { itSkipIf } from 'conditional-specs'
import Vuex from 'vuex'

describeWithMountingMethods('options.localVue', mountingMethod => {
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
      const HTML = mountingMethod.name === 'renderToString'
        ? wrapper
        : wrapper.html()
      expect(HTML).to.contain('some value')
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
        val () {
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
      expect(HTML).to.not.contain('2')
    } else {
      expect(HTML).to.contain('2')
    }
  })

  it('is applied to deeply extended components', () => {
    const GrandChildComponent = Vue.extend(Vue.extend({
      template: '<div>{{$route.params}}</div>'
    }))
    const ChildComponent = Vue.extend(Vue.extend(Vue.extend({
      template: '<div><grand-child-component />{{$route.params}}</div>',
      components: {
        GrandChildComponent
      }
    })))
    const TestComponent = Vue.extend(Vue.extend({
      template: '<child-component />',
      components: { ChildComponent }
    }))
    const localVue = createLocalVue()
    localVue.prototype.$route = {}

    mountingMethod(TestComponent, {
      localVue
    })
  })

  it.skip('is applied to mixed extended components', () => {
    const BaseComponent = {
      created () {
        this.$route.params
      }
    }
    const BaseGrandChildComponent = {
      extends: BaseComponent,
      created () {
        this.$route.params
      }
    }
    const GrandChildComponent = {
      template: '<div>{{$route.params}}</div>',
      extends: BaseGrandChildComponent
    }
    const BaseChildComponent = Vue.extend({
      created () {
        this.$route.params
      }
    })
    const ChildComponent = Vue.extend(({
      template: '<div><grand-child-component />{{$route.params}}</div>',
      extends: BaseChildComponent,
      components: {
        GrandChildComponent
      }
    }))
    const TestComponent = Vue.extend(Vue.extend({
      template: '<child-component />',
      components: { ChildComponent }
    }))
    const localVue = createLocalVue()
    localVue.prototype.$route = {}

    mountingMethod(TestComponent, {
      localVue
    })
  })

  it('does not add created mixin to localVue', () => {
    const localVue = createLocalVue()
    mountingMethod({ render: () => {} }, {
      localVue
    })
    expect(localVue.options.created).to.equal(undefined)
  })
})
