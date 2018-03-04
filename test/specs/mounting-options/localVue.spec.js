import Vue from 'vue'
import { describeWithMountingMethods } from '~resources/utils'

describeWithMountingMethods('options.localVue', (mountingMethod) => {
  it('mounts component using passed localVue as base Vue', () => {
    const TestComponent = {
      template: `
        <div>{{test}}</div>
      `
    }
    const localVue = Vue.extend()
    localVue.version = '2.3'
    const wrapper = mountingMethod(TestComponent, {
      localVue: localVue,
      mocks: { test: 'some value' }
    })
    const HTML = mountingMethod.name === 'renderToString'
      ? wrapper
      : wrapper.html()
    expect(HTML).to.contain('some value')
    const freshWrapper = mountingMethod(TestComponent)
    const freshHTML = mountingMethod.name === 'renderToString'
      ? freshWrapper
      : freshWrapper.html()
    expect(freshHTML).to.not.contain('some value')
  })
})
