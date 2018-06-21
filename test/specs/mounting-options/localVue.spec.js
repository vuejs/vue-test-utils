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
        template: `
        <div>{{test}}</div>
      `,
        data: { test: '' }
      }
      const localVue = Vue.extend()
      localVue.version = '2.3'
      const wrapper = mountingMethod(TestComponent, {
        localVue: localVue,
        mocks: { test: 'some value' }
      })
      const HTML =
        mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
      expect(HTML).to.contain('some value')
      const freshWrapper = mountingMethod(TestComponent)
      const freshHTML =
        mountingMethod.name === 'renderToString'
          ? freshWrapper
          : freshWrapper.html()
      expect(freshHTML).to.not.contain('some value')
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

  it('does not add created mixin to localVue', () => {
    const localVue = createLocalVue()
    mountingMethod({ render: () => {} }, {
      localVue
    })
    expect(localVue.options.created).to.equal(undefined)
  })
})
